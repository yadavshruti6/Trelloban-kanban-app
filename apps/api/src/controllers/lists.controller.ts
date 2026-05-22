import type { Request, Response } from 'express';
import { asyncHandler } from '@/utils/async-handler';
import * as listsService from '@/services/lists.service';

export const postList = asyncHandler(async (request: Request, response: Response) => {
  const list = await listsService.createList(String(request.params.boardId), request.body.title);
  response.status(201).json({ data: list });
});
