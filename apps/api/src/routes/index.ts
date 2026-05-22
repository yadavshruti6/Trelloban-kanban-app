import { Router } from 'express';
import { boardsRouter } from '@/routes/boards.routes';
import { cardsRouter } from '@/routes/cards.routes';

export const apiRouter = Router();

apiRouter.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: 'trelloban-api' });
});

apiRouter.use('/boards', boardsRouter);
apiRouter.use('/', cardsRouter);
