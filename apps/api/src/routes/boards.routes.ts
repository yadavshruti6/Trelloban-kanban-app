import { Router } from 'express';
import { getBoard, getBoards, patchBoard, postBoard, putBoardState, removeBoard } from '../controllers/boards.controller';
import { postList } from '../controllers/lists.controller';

export const boardsRouter = Router();

boardsRouter.get('/', getBoards);
boardsRouter.post('/', postBoard);
boardsRouter.get('/:boardId', getBoard);
boardsRouter.patch('/:boardId', patchBoard);
boardsRouter.put('/:boardId/state', putBoardState);
boardsRouter.delete('/:boardId', removeBoard);
boardsRouter.post('/:boardId/lists', postList);
