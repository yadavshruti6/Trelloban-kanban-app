import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import * as cardsService from '../services/cards.service';

export const postCard = asyncHandler(async (request: Request, response: Response) => {
  const card = await cardsService.createCard(
    String(request.params.listId),
    String(request.body.title),
    request.body.description,
    request.body.dueDate,
    request.body.id ? String(request.body.id) : undefined
  );
  response.status(201).json({ data: card });
});

export const getCards = asyncHandler(async (request: Request, response: Response) => {
  const boardId = request.query.boardId ? String(request.query.boardId) : undefined;
  const cards = await cardsService.listCards(boardId);
  response.json({ data: cards });
});

export const patchCard = asyncHandler(async (request: Request, response: Response) => {
  const card = await cardsService.updateCard(String(request.params.id), {
    title: request.body.title,
    description: request.body.description,
    coverImage: request.body.coverImage,
    dueDate: request.body.dueDate,
    dueReminder: request.body.dueReminder,
    dueCompleted: typeof request.body.dueCompleted === 'boolean' ? request.body.dueCompleted : undefined,
    archived: typeof request.body.archived === 'boolean' ? request.body.archived : undefined,
    listId: request.body.listId,
    position: typeof request.body.position === 'number' ? request.body.position : undefined
  });

  response.json({ data: card });
});

export const archiveCard = asyncHandler(async (request: Request, response: Response) => {
  const card = await cardsService.archiveCard(String(request.params.id), request.body.archived !== false);
  response.json({ data: card });
});

export const removeCard = asyncHandler(async (request: Request, response: Response) => {
  const result = await cardsService.deleteCard(String(request.params.id));
  response.json({ data: result });
});

export const patchCardsReorder = asyncHandler(async (request: Request, response: Response) => {
  const result = await cardsService.reorderCard({
    cardId: String(request.body.cardId),
    sourceListId: String(request.body.sourceListId),
    targetListId: String(request.body.targetListId),
    targetCardId: request.body.targetCardId ? String(request.body.targetCardId) : null
  });

  response.json({ data: result });
});

export const patchListsReorder = asyncHandler(async (request: Request, response: Response) => {
  const result = await cardsService.reorderLists({
    boardId: String(request.body.boardId),
    orderedListIds: Array.isArray(request.body.orderedListIds)
      ? request.body.orderedListIds.map((entry: unknown) => String(entry))
      : []
  });

  response.json({ data: result });
});

export const getLabels = asyncHandler(async (request: Request, response: Response) => {
  const boardId = request.query.boardId ? String(request.query.boardId) : undefined;
  const labels = await cardsService.listLabels(boardId);
  response.json({ data: labels });
});

export const postLabel = asyncHandler(async (request: Request, response: Response) => {
  const label = await cardsService.createLabel(
    String(request.body.boardId),
    String(request.body.name),
    String(request.body.color)
  );
  response.status(201).json({ data: label });
});

export const patchLabel = asyncHandler(async (request: Request, response: Response) => {
  const label = await cardsService.updateLabel(String(request.params.id), {
    name: request.body.name,
    color: request.body.color
  });
  response.json({ data: label });
});

export const deleteLabel = asyncHandler(async (request: Request, response: Response) => {
  const result = await cardsService.deleteLabel(String(request.params.id));
  response.json({ data: result });
});

export const postChecklist = asyncHandler(async (request: Request, response: Response) => {
  const item = await cardsService.createChecklistItem(String(request.body.cardId), String(request.body.title));
  response.status(201).json({ data: item });
});

export const patchChecklist = asyncHandler(async (request: Request, response: Response) => {
  const item = await cardsService.updateChecklistItem(String(request.params.id), {
    title: request.body.title,
    completed: typeof request.body.completed === 'boolean' ? request.body.completed : undefined
  });
  response.json({ data: item });
});

export const deleteChecklist = asyncHandler(async (request: Request, response: Response) => {
  const result = await cardsService.deleteChecklistItem(String(request.params.id));
  response.json({ data: result });
});

export const getMembers = asyncHandler(async (request: Request, response: Response) => {
  const boardId = request.query.boardId ? String(request.query.boardId) : undefined;
  const members = await cardsService.listMembers(boardId);
  response.json({ data: members });
});

export const postCardMember = asyncHandler(async (request: Request, response: Response) => {
  const relation = await cardsService.addMemberToCard(String(request.params.id), String(request.body.memberId));
  response.status(201).json({ data: relation });
});

export const deleteCardMember = asyncHandler(async (request: Request, response: Response) => {
  const relation = await cardsService.removeMemberFromCard(String(request.params.id), String(request.params.memberId));
  response.json({ data: relation });
});
