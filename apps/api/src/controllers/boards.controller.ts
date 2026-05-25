import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import * as boardsService from '../services/boards.service';

export const getBoards = asyncHandler(async (_request: Request, response: Response) => {
  const boards = await boardsService.listBoards();
  response.json({ data: boards });
});

export const getBoard = asyncHandler(async (request: Request, response: Response) => {
  const board = await boardsService.getBoard(String(request.params.boardId));
  response.json({ data: board });
});

export const postBoard = asyncHandler(async (request: Request, response: Response) => {
  const board = await boardsService.createBoard(request.body.title, request.body.description, request.body.id);
  response.status(201).json({ data: board });
});

export const patchBoard = asyncHandler(async (request: Request, response: Response) => {
  const board = await boardsService.updateBoard(String(request.params.boardId), {
    title: request.body.title,
    description: request.body.description,
    visibility: request.body.visibility,
    background: request.body.background
  });

  response.json({ data: board });
});

export const putBoardState = asyncHandler(async (request: Request, response: Response) => {
  const board = await boardsService.syncBoardState(String(request.params.boardId), request.body);
  response.json({ data: board });
});

export const removeBoard = asyncHandler(async (request: Request, response: Response) => {
  const result = await boardsService.deleteBoard(String(request.params.boardId));
  response.status(200).json({ data: result });
});
