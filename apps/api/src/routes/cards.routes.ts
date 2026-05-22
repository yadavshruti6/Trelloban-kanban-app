import { Router } from 'express';
import { z } from 'zod';
import {
	archiveCard,
	deleteCardMember,
	deleteChecklist,
	deleteLabel,
	getCards,
	getLabels,
	getMembers,
	patchCard,
	patchCardsReorder,
	patchChecklist,
	patchLabel,
	patchListsReorder,
	postCard,
	postCardMember,
	postChecklist,
	postLabel,
	removeCard
} from '@/controllers/cards.controller';
import { validate } from '@/middleware/validate';

export const cardsRouter = Router();

const cardCreateSchema = z.object({
	params: z.object({ listId: z.string().min(1) }),
	body: z.object({
		id: z.string().min(1).optional(),
		title: z.string().min(1),
		description: z.string().optional(),
		dueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).nullable().optional()
	}),
	query: z.object({}).passthrough()
});

const cardReorderSchema = z.object({
	params: z.object({}).passthrough(),
	body: z.object({
		cardId: z.string().min(1),
		sourceListId: z.string().min(1),
		targetListId: z.string().min(1),
		targetCardId: z.string().min(1).nullable().optional()
	}),
	query: z.object({}).passthrough()
});

const listReorderSchema = z.object({
	params: z.object({}).passthrough(),
	body: z.object({
		boardId: z.string().min(1),
		orderedListIds: z.array(z.string().min(1)).min(1)
	}),
	query: z.object({}).passthrough()
});

const labelSchema = z.object({
	params: z.object({}).passthrough(),
	body: z.object({
		boardId: z.string().min(1),
		name: z.string().min(1),
		color: z.string().min(1)
	}),
	query: z.object({}).passthrough()
});

const labelPatchSchema = z.object({
	params: z.object({ id: z.string().min(1) }),
	body: z.object({
		name: z.string().min(1).optional(),
		color: z.string().min(1).optional()
	}).refine((body) => body.name !== undefined || body.color !== undefined, 'Provide a label field to update'),
	query: z.object({}).passthrough()
});

const checklistCreateSchema = z.object({
	params: z.object({}).passthrough(),
	body: z.object({
		cardId: z.string().min(1),
		title: z.string().min(1)
	}),
	query: z.object({}).passthrough()
});

const checklistPatchSchema = z.object({
	params: z.object({ id: z.string().min(1) }),
	body: z.object({
		title: z.string().min(1).optional(),
		completed: z.boolean().optional()
	}).refine((body) => body.title !== undefined || body.completed !== undefined, 'Provide a checklist field to update'),
	query: z.object({}).passthrough()
});

const idParamSchema = z.object({
	params: z.object({ id: z.string().min(1) }).passthrough(),
	body: z.object({}).passthrough(),
	query: z.object({}).passthrough()
});

const cardMemberSchema = z.object({
	params: z.object({ id: z.string().min(1) }),
	body: z.object({ memberId: z.string().min(1) }),
	query: z.object({}).passthrough()
});

const cardMemberDeleteSchema = z.object({
	params: z.object({ id: z.string().min(1), memberId: z.string().min(1) }),
	body: z.object({}).passthrough(),
	query: z.object({}).passthrough()
});

cardsRouter.post('/lists/:listId/cards', validate(cardCreateSchema), postCard);
cardsRouter.get('/cards', getCards);
cardsRouter.patch('/cards/:id', patchCard);
cardsRouter.post('/cards/:id/archive', archiveCard);
cardsRouter.delete('/cards/:id', removeCard);
cardsRouter.patch('/cards/reorder', validate(cardReorderSchema), patchCardsReorder);
cardsRouter.patch('/lists/reorder', validate(listReorderSchema), patchListsReorder);

cardsRouter.get('/labels', getLabels);
cardsRouter.post('/labels', validate(labelSchema), postLabel);
cardsRouter.patch('/labels/:id', validate(labelPatchSchema), patchLabel);
cardsRouter.delete('/labels/:id', validate(idParamSchema), deleteLabel);

cardsRouter.post('/checklist', validate(checklistCreateSchema), postChecklist);
cardsRouter.patch('/checklist/:id', validate(checklistPatchSchema), patchChecklist);
cardsRouter.delete('/checklist/:id', validate(idParamSchema), deleteChecklist);

cardsRouter.get('/members', getMembers);
cardsRouter.post('/cards/:id/members', validate(cardMemberSchema), postCardMember);
cardsRouter.delete('/cards/:id/members/:memberId', validate(cardMemberDeleteSchema), deleteCardMember);
