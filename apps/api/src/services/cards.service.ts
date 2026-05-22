import { prisma } from '@/prisma/client';
import { HttpError } from '@/utils/http-error';

function cardInclude() {
  return {
    list: {
      include: { board: true }
    },
    checklistItems: { orderBy: { position: 'asc' as const } },
    activities: { orderBy: { createdAt: 'desc' as const } },
    labels: { include: { label: true } },
    members: { include: { member: true } },
    comments: { orderBy: { createdAt: 'asc' as const } },
    attachments: { orderBy: { createdAt: 'asc' as const } }
  };
}

function serializeCard(card: any) {
  return {
    id: card.id,
    listId: card.listId,
    title: card.title,
    description: card.description,
    coverImage: card.coverImage,
    position: card.position,
    archived: card.archived,
    dueDate: card.dueDate ? card.dueDate.toISOString() : null,
    dueReminder: card.dueReminder,
    dueCompleted: card.dueCompleted,
    labelIds: card.labels.map((entry: any) => entry.labelId),
    memberIds: card.members.map((entry: any) => entry.memberId),
    checklistItems: card.checklistItems.map((item: any) => ({
      id: item.id,
      title: item.title,
      completed: item.completed,
      position: item.position
    })),
    comments: card.comments.map((comment: any) => ({
      id: comment.id,
      memberId: comment.memberId,
      text: comment.text,
      createdAt: comment.createdAt.toISOString()
    })),
    attachments: card.attachments.map((attachment: any) => ({
      id: attachment.id,
      name: attachment.name,
      url: attachment.url,
      mimeType: attachment.mimeType,
      size: attachment.size
    })),
    attachmentCount: card.attachments.length,
    activities: card.activities.map((activity: any) => ({
      id: activity.id,
      type: activity.type,
      text: activity.description,
      createdAt: activity.createdAt.toISOString()
    }))
  };
}

export async function listCards(boardId?: string) {
  if (!boardId) {
    const cards = await prisma.card.findMany({ include: cardInclude(), orderBy: [{ listId: 'asc' }, { position: 'asc' }] });
    return cards.map(serializeCard);
  }

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      lists: {
        orderBy: { position: 'asc' },
        include: {
          cards: { orderBy: { position: 'asc' }, include: cardInclude() }
        }
      }
    }
  });

  if (!board) {
    throw new HttpError(404, 'Board not found');
  }

  return board.lists.flatMap((list) => list.cards.map(serializeCard));
}

export async function getCard(cardId: string) {
  const card = await prisma.card.findUnique({ where: { id: cardId }, include: cardInclude() });

  if (!card) {
    throw new HttpError(404, 'Card not found');
  }

  return serializeCard(card);
}

type ReorderCardArgs = {
  cardId: string;
  sourceListId: string;
  targetListId: string;
  targetCardId?: string | null;
};

type ReorderListsArgs = {
  boardId: string;
  orderedListIds: string[];
};

export async function createCard(listId: string, title: string, description?: string, dueDate?: string | null, id?: string) {
  const list = await prisma.list.findUnique({ where: { id: listId } });

  if (!list) {
    throw new HttpError(404, 'List not found');
  }

  const cardCount = await prisma.card.count({ where: { listId } });

  const card = await prisma.card.create({
    data: {
      ...(id ? { id } : {}),
      listId,
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      position: cardCount
    },
    include: cardInclude()
  });

  return serializeCard(card);
}

export async function updateCard(cardId: string, patch: {
  title?: string;
  description?: string | null;
  coverImage?: string | null;
  dueDate?: string | null;
  dueReminder?: string | null;
  dueCompleted?: boolean;
  archived?: boolean;
  listId?: string;
  position?: number;
}) {
  const card = await prisma.card.findUnique({ where: { id: cardId } });

  if (!card) {
    throw new HttpError(404, 'Card not found');
  }

  const updated = await prisma.card.update({
    where: { id: cardId },
    data: {
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.description !== undefined ? { description: patch.description } : {}),
      ...(patch.coverImage !== undefined ? { coverImage: patch.coverImage } : {}),
      ...(patch.dueDate !== undefined ? { dueDate: patch.dueDate ? new Date(patch.dueDate) : null } : {}),
      ...(patch.dueReminder !== undefined ? { dueReminder: patch.dueReminder } : {}),
      ...(patch.dueCompleted !== undefined ? { dueCompleted: patch.dueCompleted } : {}),
      ...(patch.archived !== undefined ? { archived: patch.archived } : {}),
      ...(patch.listId !== undefined ? { listId: patch.listId } : {}),
      ...(patch.position !== undefined ? { position: patch.position } : {})
    },
    include: cardInclude()
  });

  return serializeCard(updated);
}

export async function archiveCard(cardId: string, archived = true) {
  const card = await prisma.card.findUnique({ where: { id: cardId } });

  if (!card) {
    throw new HttpError(404, 'Card not found');
  }

  const updated = await prisma.card.update({
    where: { id: cardId },
    data: { archived },
    include: cardInclude()
  });

  return serializeCard(updated);
}

export async function deleteCard(cardId: string) {
  const card = await prisma.card.findUnique({ where: { id: cardId } });

  if (!card) {
    throw new HttpError(404, 'Card not found');
  }

  await prisma.card.delete({ where: { id: cardId } });
  return { id: cardId };
}

export async function reorderCard(args: ReorderCardArgs) {
  const { cardId, sourceListId, targetListId, targetCardId } = args;

  return prisma.$transaction(async (tx) => {
    const card = await tx.card.findUnique({ where: { id: cardId } });
    if (!card) {
      throw new HttpError(404, 'Card not found');
    }

    if (card.listId !== sourceListId) {
      throw new HttpError(400, 'Card source list mismatch');
    }

    const sourceCards = await tx.card.findMany({
      where: { listId: sourceListId },
      orderBy: { position: 'asc' }
    });

    const targetCardsBase = sourceListId === targetListId
      ? sourceCards
      : await tx.card.findMany({ where: { listId: targetListId }, orderBy: { position: 'asc' } });

    const sourceCardIds = sourceCards.filter((entry) => entry.id !== cardId).map((entry) => entry.id);
    const targetCardIds = targetCardsBase.filter((entry) => entry.id !== cardId).map((entry) => entry.id);

    const insertIndex = targetCardId ? targetCardIds.indexOf(targetCardId) : targetCardIds.length;
    if (insertIndex >= 0) {
      targetCardIds.splice(insertIndex, 0, cardId);
    } else {
      targetCardIds.push(cardId);
    }

    if (sourceListId === targetListId) {
      await Promise.all(
        targetCardIds.map((id, index) =>
          tx.card.update({
            where: { id },
            data: {
              listId: targetListId,
              position: index
            }
          })
        )
      );
      return { cardId, listId: targetListId };
    }

    await Promise.all(
      sourceCardIds.map((id, index) =>
        tx.card.update({ where: { id }, data: { position: index } })
      )
    );

    await Promise.all(
      targetCardIds.map((id, index) =>
        tx.card.update({
          where: { id },
          data: {
            listId: targetListId,
            position: index
          }
        })
      )
    );

    return { cardId, listId: targetListId };
  });
}

export async function reorderLists(args: ReorderListsArgs) {
  const board = await prisma.board.findUnique({
    where: { id: args.boardId },
    include: { lists: { select: { id: true } } }
  });

  if (!board) {
    throw new HttpError(404, 'Board not found');
  }

  const currentIds = board.lists.map((entry) => entry.id).sort();
  const nextIds = [...args.orderedListIds].sort();

  if (currentIds.length !== nextIds.length || currentIds.some((id, index) => id !== nextIds[index])) {
    throw new HttpError(400, 'orderedListIds must contain all board list ids exactly once');
  }

  await prisma.$transaction(
    args.orderedListIds.map((id, index) =>
      prisma.list.update({ where: { id }, data: { position: index } })
    )
  );

  return { boardId: args.boardId, orderedListIds: args.orderedListIds };
}

export async function listLabels(boardId?: string) {
  return prisma.label.findMany({
    where: boardId ? { boardId } : undefined,
    orderBy: { createdAt: 'asc' }
  });
}

export async function createLabel(boardId: string, name: string, color: string) {
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) {
    throw new HttpError(404, 'Board not found');
  }

  return prisma.label.create({
    data: {
      boardId,
      name,
      color
    }
  });
}

export async function updateLabel(labelId: string, patch: { name?: string; color?: string }) {
  const label = await prisma.label.findUnique({ where: { id: labelId } });
  if (!label) {
    throw new HttpError(404, 'Label not found');
  }

  return prisma.label.update({ where: { id: labelId }, data: patch });
}

export async function deleteLabel(labelId: string) {
  const label = await prisma.label.findUnique({ where: { id: labelId } });
  if (!label) {
    throw new HttpError(404, 'Label not found');
  }

  await prisma.cardLabel.deleteMany({ where: { labelId } });
  await prisma.label.delete({ where: { id: labelId } });
  return { id: labelId };
}

export async function createChecklistItem(cardId: string, title: string) {
  const card = await prisma.card.findUnique({ where: { id: cardId } });
  if (!card) {
    throw new HttpError(404, 'Card not found');
  }

  const position = await prisma.checklistItem.count({ where: { cardId } });
  return prisma.checklistItem.create({
    data: {
      cardId,
      title,
      position
    }
  });
}

export async function updateChecklistItem(checklistId: string, patch: { title?: string; completed?: boolean }) {
  const item = await prisma.checklistItem.findUnique({ where: { id: checklistId } });
  if (!item) {
    throw new HttpError(404, 'Checklist item not found');
  }

  return prisma.checklistItem.update({ where: { id: checklistId }, data: patch });
}

export async function deleteChecklistItem(checklistId: string) {
  const item = await prisma.checklistItem.findUnique({ where: { id: checklistId } });
  if (!item) {
    throw new HttpError(404, 'Checklist item not found');
  }

  await prisma.checklistItem.delete({ where: { id: checklistId } });

  const remaining = await prisma.checklistItem.findMany({
    where: { cardId: item.cardId },
    orderBy: { position: 'asc' }
  });

  await prisma.$transaction(
    remaining.map((entry, index) =>
      prisma.checklistItem.update({ where: { id: entry.id }, data: { position: index } })
    )
  );

  return { id: checklistId };
}

export async function listMembers(boardId?: string) {
  return prisma.member.findMany({
    where: boardId ? { boardId } : undefined,
    orderBy: { createdAt: 'asc' }
  });
}

export async function addMemberToCard(cardId: string, memberId: string) {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { list: true }
  });

  if (!card) {
    throw new HttpError(404, 'Card not found');
  }

  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) {
    throw new HttpError(404, 'Member not found');
  }

  if (member.boardId !== card.list.boardId) {
    throw new HttpError(400, 'Member and card must belong to the same board');
  }

  await prisma.cardMember.upsert({
    where: {
      cardId_memberId: {
        cardId,
        memberId
      }
    },
    update: {},
    create: {
      cardId,
      memberId
    }
  });

  return { cardId, memberId };
}

export async function removeMemberFromCard(cardId: string, memberId: string) {
  const relation = await prisma.cardMember.findUnique({
    where: {
      cardId_memberId: {
        cardId,
        memberId
      }
    }
  });

  if (!relation) {
    throw new HttpError(404, 'Card member relation not found');
  }

  await prisma.cardMember.delete({
    where: {
      cardId_memberId: {
        cardId,
        memberId
      }
    }
  });

  return { cardId, memberId };
}
