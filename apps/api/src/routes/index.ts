import { Router } from 'express';
import { boardsRouter } from './boards.routes';
import { cardsRouter } from './cards.routes';

export const apiRouter = Router();

apiRouter.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: 'trelloban-api' });
});

apiRouter.use('/boards', boardsRouter);
apiRouter.use('/', cardsRouter);
