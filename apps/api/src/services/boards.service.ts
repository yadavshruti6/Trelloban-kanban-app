// @ts-nocheck
import { prisma } from '../prisma/client';
import { HttpError } from '../utils/http-error';

const DEFAULT_BACKGROUND = {
  kind: 'wallpaper',
  value: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3',
  overlay: 'rgba(2, 6, 23, 0.34)'
};

const LEGACY_DEFAULT_BACKGROUND_VALUE = 'linear-gradient(120deg, #0f172a 0%, #1d4ed8 45%, #0ea5e9 100%)';

function normalizeBackground(background?: { kind?: string; value?: string; overlay?: string } | null) {
  if (!background) {
    return DEFAULT_BACKGROUND;
  }

  if (background.kind === 'gradient' && background.value === LEGACY_DEFAULT_BACKGROUND_VALUE) {
    return DEFAULT_BACKGROUND;
  }

  return {
    kind: background.kind ?? DEFAULT_BACKGROUND.kind,
    value: background.value ?? DEFAULT_BACKGROUND.value,
    overlay: background.overlay ?? DEFAULT_BACKGROUND.overlay
  };
}

type SyncSnapshot = {
  board: {
    id: string;
    title: string;
    description?: string | null;
    visibility?: string;
    background?: { kind?: string; value?: string; overlay?: string };
    createdAt?: string;
  };
  lists: Record<string, { id: string; boardId: string; title: string; position: number; cardIds: string[] }>;
  cards: Record<string, {
    id: string;
    listId: string;
    title: string;
    description?: string | null;
    coverImage?: string | null;
    position: number;
    archived: boolean;
    dueDate?: string | null;
    dueReminder?: string | null;
    dueCompleted?: boolean;
    labelIds: string[];
    memberIds: string[];
    checklistItems: Array<{ id: string; title: string; completed: boolean; position: number }>;
    comments: Array<{ id: string; memberId?: string | null; text: string; createdAt: string }>;
    attachments: Array<{ id: string; name: string; url: string; mimeType?: string | null; size?: number | null }>;
    attachmentCount?: number;
    activities: Array<{ id: string; type: string; text: string; createdAt: string }>;
  }>;
  labels: Record<string, { id: string; boardId: string; name: string; color: string }>;
  members: Record<string, { id: string; boardId: string; name: string; email?: string | null; avatarUrl?: string | null; role?: string | null }>;
};

function serializeBoard(board: any) {
  const background = normalizeBackground({
    kind: board.backgroundKind,
    value: board.backgroundValue,
    overlay: board.backgroundOverlay
  });

  return {
    id: board.id,
    title: board.title,
    description: board.description,
    visibility: board.visibility,
    background,
    listIds: board.lists.map((list: any) => list.id),
    labelIds: board.labels.map((label: any) => label.id),
    memberIds: board.members.map((member: any) => member.id),
    createdAt: board.createdAt.toISOString()
  };
}

function boardInclude() {
  return {
    lists: {
      orderBy: { position: 'asc' as const },
      include: {
        cards: {
          orderBy: { position: 'asc' as const },
          include: {
            checklistItems: { orderBy: { position: 'asc' as const } },
            activities: { orderBy: { createdAt: 'desc' as const } },
            labels: { include: { label: true } },
            members: { include: { member: true } },
            comments: { orderBy: { createdAt: 'asc' as const } },
            attachments: { orderBy: { createdAt: 'asc' as const } }
          }
        }
      }
    },
    labels: { orderBy: { createdAt: 'asc' as const } },
    members: { orderBy: { createdAt: 'asc' as const } },
    activities: { orderBy: { createdAt: 'desc' as const } }
  };
}

function serializeWorkspaceBoard(board: any) {
  const serialized = serializeBoard(board);

  const lists = Object.fromEntries(
    board.lists.map((list: any) => [
      list.id,
      {
        id: list.id,
        boardId: list.boardId,
        title: list.title,
        position: list.position,
        cardIds: list.cards.map((card: any) => card.id)
      }
    ])
  );

  const cards = Object.fromEntries(
    board.lists.flatMap((list: any) =>
      list.cards.map((card: any) => [
        card.id,
        {
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
        }
      ])
    )
  );

  const labels = Object.fromEntries(
    board.labels.map((label: any) => [
      label.id,
      {
        id: label.id,
        boardId: label.boardId,
        name: label.name,
        color: label.color
      }
    ])
  );

  const members = Object.fromEntries(
    board.members.map((member: any) => [
      member.id,
      {
        id: member.id,
        boardId: member.boardId,
        name: member.name,
        email: member.email,
        avatarUrl: member.avatarUrl,
        role: member.role
      }
    ])
  );

  return { board: serialized, lists, cards, labels, members };
}

export async function listBoards() {
  const boards = await prisma.board.findMany({ orderBy: { createdAt: 'asc' }, include: boardInclude() });
  const snapshots = boards.map(serializeWorkspaceBoard);

  return {
    boards: snapshots.map((snapshot) => snapshot.board),
    lists: Object.assign({}, ...snapshots.map((snapshot) => snapshot.lists)),
    cards: Object.assign({}, ...snapshots.map((snapshot) => snapshot.cards)),
    labels: Object.assign({}, ...snapshots.map((snapshot) => snapshot.labels)),
    members: Object.assign({}, ...snapshots.map((snapshot) => snapshot.members))
  };
}

export async function getBoard(boardId: string) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: boardInclude()
  });

  if (!board) {
    throw new HttpError(404, 'Board not found');
  }

  return serializeWorkspaceBoard(board);
}

export async function createBoard(title: string, description?: string, id?: string) {
  const board = await prisma.board.create({
    data: {
      ...(id ? { id } : {}),
      title,
      description,
      visibility: 'workspace',
      backgroundKind: DEFAULT_BACKGROUND.kind,
      backgroundValue: DEFAULT_BACKGROUND.value,
      backgroundOverlay: DEFAULT_BACKGROUND.overlay
    },
    include: boardInclude()
  });

  return serializeWorkspaceBoard(board);
}

export async function updateBoard(boardId: string, patch: { title?: string; description?: string | null; visibility?: string; background?: { kind?: string; value?: string; overlay?: string } }) {
  const board = await prisma.board.findUnique({ where: { id: boardId } });

  if (!board) {
    throw new HttpError(404, 'Board not found');
  }

  const updated = await prisma.board.update({
    where: { id: boardId },
    data: {
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.description !== undefined ? { description: patch.description } : {}),
      ...(patch.visibility !== undefined ? { visibility: patch.visibility } : {}),
      ...(patch.background?.kind !== undefined ? { backgroundKind: patch.background.kind } : {}),
      ...(patch.background?.value !== undefined ? { backgroundValue: patch.background.value } : {}),
      ...(patch.background?.overlay !== undefined ? { backgroundOverlay: patch.background.overlay } : {})
    },
    include: boardInclude()
  });

  return serializeWorkspaceBoard(updated);
}

export async function syncBoardState(boardId: string, snapshot: SyncSnapshot) {
  const board = await prisma.board.findUnique({ where: { id: boardId } });

  if (!board) {
    throw new HttpError(404, 'Board not found');
  }

  const existing = await prisma.board.findUnique({
    where: { id: boardId },
    include: boardInclude()
  });

  if (!existing) {
    throw new HttpError(404, 'Board not found');
  }

  await prisma.$transaction(async (tx) => {
    await tx.activity.deleteMany({ where: { boardId } });
    await tx.comment.deleteMany({ where: { card: { list: { boardId } } } });
    await tx.attachment.deleteMany({ where: { card: { list: { boardId } } } });
    await tx.checklistItem.deleteMany({ where: { card: { list: { boardId } } } });
    await tx.cardMember.deleteMany({ where: { card: { list: { boardId } } } });
    await tx.cardLabel.deleteMany({ where: { card: { list: { boardId } } } });
    await tx.card.deleteMany({ where: { list: { boardId } } });
    await tx.list.deleteMany({ where: { boardId } });
    await tx.label.deleteMany({ where: { boardId } });
    await tx.member.deleteMany({ where: { boardId } });

      const normalizedBackground = normalizeBackground(snapshot.board.background);

    await tx.board.update({
      where: { id: boardId },
      data: {
        title: snapshot.board.title,
        description: snapshot.board.description ?? null,
        visibility: snapshot.board.visibility ?? 'workspace',
        backgroundKind: normalizedBackground.kind,
        backgroundValue: normalizedBackground.value,
        backgroundOverlay: normalizedBackground.overlay
      }
    });

    const labels = Object.values(snapshot.labels ?? {});
    const members = Object.values(snapshot.members ?? {});
    const lists = Object.values(snapshot.lists ?? {}).sort((left, right) => left.position - right.position);
    const cards = Object.values(snapshot.cards ?? {});

    if (labels.length > 0) {
      await tx.label.createMany({ data: labels.map((label) => ({ id: label.id, boardId, name: label.name, color: label.color })) });
    }

    if (members.length > 0) {
      await tx.member.createMany({
        data: members.map((member) => ({
          id: member.id,
          boardId,
          name: member.name,
          email: member.email ?? null,
          avatarUrl: member.avatarUrl ?? null,
          role: member.role ?? null
        }))
      });
    }

    for (const list of lists) {
      await tx.list.create({
        data: {
          id: list.id,
          boardId,
          title: list.title,
          position: list.position
        }
      });
    }

    for (const card of cards.sort((left, right) => left.position - right.position)) {
      await tx.card.create({
        data: {
          id: card.id,
          listId: card.listId,
          title: card.title,
          description: card.description ?? null,
          coverImage: card.coverImage ?? null,
          position: card.position,
          archived: card.archived,
          dueDate: card.dueDate ? new Date(card.dueDate) : null,
          dueReminder: card.dueReminder ?? null,
          dueCompleted: Boolean(card.dueCompleted)
        }
      });

      if (card.labelIds.length > 0) {
        await tx.cardLabel.createMany({ data: card.labelIds.map((labelId) => ({ cardId: card.id, labelId })) });
      }

      if (card.memberIds.length > 0) {
        await tx.cardMember.createMany({ data: card.memberIds.map((memberId) => ({ cardId: card.id, memberId })) });
      }

      if (card.checklistItems.length > 0) {
        await tx.checklistItem.createMany({
          data: card.checklistItems.map((item) => ({
            id: item.id,
            cardId: card.id,
            title: item.title,
            completed: item.completed,
            position: item.position
          }))
        });
      }

      if (card.comments.length > 0) {
        await tx.comment.createMany({
          data: card.comments.map((comment) => ({
            id: comment.id,
            cardId: card.id,
            memberId: comment.memberId ?? null,
            text: comment.text,
            createdAt: new Date(comment.createdAt)
          }))
        });
      }

      if (card.attachments.length > 0) {
        await tx.attachment.createMany({
          data: card.attachments.map((attachment) => ({
            id: attachment.id,
            cardId: card.id,
            name: attachment.name,
            url: attachment.url,
            mimeType: attachment.mimeType ?? null,
            size: attachment.size ?? null
          }))
        });
      }

      if (card.activities.length > 0) {
        await tx.activity.createMany({
          data: card.activities.map((activity) => ({
            id: activity.id,
            boardId,
            cardId: card.id,
            type: activity.type,
            description: activity.text,
            createdAt: new Date(activity.createdAt)
          }))
        });
      }
    }
  });

  return getBoard(boardId);
}

export async function deleteBoard(boardId: string) {
  const board = await prisma.board.findUnique({ where: { id: boardId } });

  if (!board) {
    throw new HttpError(404, 'Board not found');
  }

  await prisma.board.delete({ where: { id: boardId } });
  return { id: boardId };
}
