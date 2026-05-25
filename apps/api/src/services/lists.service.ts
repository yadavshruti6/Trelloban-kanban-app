import { prisma } from '../prisma/client';
import { HttpError } from '../utils/http-error';

export async function createList(boardId: string, title: string) {
  const board = await prisma.board.findUnique({ where: { id: boardId } });

  if (!board) {
    throw new HttpError(404, 'Board not found');
  }

  const listCount = await prisma.list.count({ where: { boardId } });

  return prisma.list.create({
    data: {
      boardId,
      title,
      position: listCount
    }
  });
}
