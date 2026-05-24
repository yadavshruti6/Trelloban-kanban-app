"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { arrayMove } from '@dnd-kit/sortable';
import { mockKanbanState } from '@/lib/mock-data';
import { normalizeBoardBackground, PREMIUM_DEFAULT_BACKGROUND } from '@/lib/default-background';
import { createBoardRemote, createCardRemote, deleteBoardRemote, fetchWorkspaceRemote, reorderCardsRemote, reorderListsRemote, syncBoardStateRemote, updateBoardRemote, updateCardRemote } from '@/services/kanban-api';
import type { Board, BoardBackground, BoardVisibility, Card, Comment, Id, KanbanState, List, Member } from '@/types/kanban';

type FilterState = {
  search: string;
  labelId: string | null;
  memberId: string | null;
  dueDate: 'all' | 'overdue' | 'today' | 'week' | 'completed';
  checklist: 'all' | 'completed' | 'incomplete';
};

const DEFAULT_FILTERS: FilterState = {
  search: '',
  labelId: null,
  memberId: null,
  dueDate: 'all',
  checklist: 'all'
};

type MoveCardArgs = {
  cardId: string;
  sourceListId: string;
  targetListId: string;
  targetCardId?: string | null;
};

type Toast = {
  id: string;
  kind: 'success' | 'error' | 'info';
  message: string;
};

type SearchResult = {
  cardId: string;
  boardId: string;
  listId: string;
  title: string;
  boardTitle: string;
  listTitle: string;
  dueDate: string | null;
  labels: string[];
  members: string[];
  checklistProgress: string;
  attachmentCount: number;
};

type BoardState = {
  board: Board | undefined;
  lists: List[];
  cards: Card[];
};

type KanbanStore = KanbanState & {
  activeBoardId: string;
  selectedCardId: string | null;
  onboardingCompleted: boolean;
  filters: FilterState;
  toasts: Toast[];
  mobileSidebarOpen: boolean;
  hydrateWorkspace: () => Promise<void>;
  setActiveBoard: (boardId: string) => void;
  setSearch: (search: string) => void;
  setLabelFilter: (labelId: string | null) => void;
  setMemberFilter: (memberId: string | null) => void;
  setDueDateFilter: (dueDate: FilterState['dueDate']) => void;
  setChecklistFilter: (checklist: FilterState['checklist']) => void;
  selectCard: (cardId: string | null) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  completeOnboarding: () => void;
  createBoard: (title: string, boardId?: string, options?: { description?: string; visibility?: BoardVisibility; background?: BoardBackground }) => string | null;
  createBoardPersisted: (title: string, options?: { boardId?: string; description?: string; visibility?: BoardVisibility; background?: BoardBackground }) => Promise<string | null>;
  deleteBoard: (boardId: string) => void;
  updateBoardBackground: (boardId: string, background: BoardBackground) => void;
  updateBoardVisibility: (boardId: string, visibility: BoardVisibility) => void;
  addMemberToBoard: (boardId: string, member: Omit<Member, 'id'> & { id?: string }) => string;
  removeMemberFromBoard: (boardId: string, memberId: string) => void;
  createLabel: (boardId: string, name: string, color: string) => string | null;
  deleteLabel: (labelId: string) => void;
  updateBoardTitle: (boardId: string, title: string) => void;
  createList: (title: string) => void;
  updateListTitle: (listId: string, title: string) => void;
  updateList: (listId: string, patch: Partial<List>) => void;
  deleteList: (listId: string) => void;
  createCard: (listId: string, title: string) => string | null;
  updateCard: (cardId: string, patch: Partial<Card>) => void;
  addComment: (cardId: string, text: string, memberId?: string) => void;
  addChecklistItem: (cardId: string, title: string) => void;
  deleteChecklistItem: (cardId: string, checklistId: string) => void;
  deleteCard: (cardId: string) => void;
  reorderLists: (orderedListIds: string[]) => void;
  moveCard: (args: MoveCardArgs) => void;
  archiveCard: (cardId: string) => void;
  dismissToast: (id: string) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  globalSearch: (query: string) => SearchResult[];
};

const DEFAULT_BACKGROUND: BoardBackground = PREMIUM_DEFAULT_BACKGROUND;

const boardSyncTimers = new Map<string, ReturnType<typeof setTimeout>>();

function buildWorkspaceSnapshot(boardId: string, state: KanbanState) {
  const board = state.boards.find((entry) => entry.id === boardId);

  if (!board) {
    return null;
  }

  const lists = Object.fromEntries(
    board.listIds
      .map((listId) => state.lists[listId])
      .filter(Boolean)
      .map((list) => [
        list.id,
        {
          id: list.id,
          boardId: list.boardId,
          title: list.title,
          position: list.position,
          cardIds: [...list.cardIds]
        }
      ])
  );

  const cards = Object.fromEntries(
    Object.values(state.cards)
      .filter((card) => board.listIds.includes(card.listId))
      .map((card) => [
        card.id,
        {
          id: card.id,
          listId: card.listId,
          title: card.title,
          description: card.description ?? null,
          coverImage: card.coverImage ?? null,
          position: card.position,
          archived: card.archived,
          dueDate: card.dueDate ?? null,
          dueReminder: card.dueReminder ?? null,
          dueCompleted: card.dueCompleted ?? false,
          labelIds: [...card.labelIds],
          memberIds: [...card.memberIds],
          checklistItems: card.checklistItems.map((item) => ({
            id: item.id,
            title: item.title,
            completed: item.completed,
            position: item.position
          })),
          comments: card.comments.map((comment) => ({
            id: comment.id,
            memberId: comment.memberId ?? null,
            text: comment.text,
            createdAt: comment.createdAt
          })),
          attachments: card.attachments?.map((attachment) => ({
            id: attachment.id,
            name: attachment.name,
            url: attachment.url,
            mimeType: attachment.mimeType ?? null,
            size: attachment.size ?? null
          })) ?? [],
          attachmentCount: card.attachments?.length ?? card.attachmentCount ?? 0,
          activities: card.activities.map((activity) => ({
            id: activity.id,
            type: activity.type,
            text: activity.text,
            createdAt: activity.createdAt
          }))
        }
      ])
  );

  return {
    board: {
      id: board.id,
      title: board.title,
      description: board.description,
      visibility: board.visibility,
      background: board.background,
      createdAt: board.createdAt
    },
    lists,
    cards,
    labels: Object.fromEntries(
      Object.values(state.labels)
        .filter((label) => label.boardId === boardId)
        .map((label) => [label.id, { ...label }])
    ),
    members: Object.fromEntries(
      Object.values(state.members)
        .filter((member) => member.boardId === boardId)
        .map((member) => [member.id, { ...member }])
    )
  };
}

function scheduleBoardSync(boardId: string, getState: () => KanbanStore) {
  const existing = boardSyncTimers.get(boardId);
  if (existing) {
    clearTimeout(existing);
  }

  const handle = setTimeout(() => {
    const snapshot = buildWorkspaceSnapshot(boardId, getState());
    if (!snapshot) {
      return;
    }

    void syncBoardStateRemote(boardId, snapshot as never).catch(() => undefined);
  }, 220);

  boardSyncTimers.set(boardId, handle);
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeBoard(board: Board): Board {
  return {
    ...board,
    background: normalizeBoardBackground(board.background),
    visibility: board.visibility ?? 'workspace',
    createdAt: board.createdAt ?? new Date().toISOString()
  };
}

function toBoardState(boardId: string, state: KanbanState): BoardState {
  const board = state.boards.find((entry) => entry.id === boardId) ?? state.boards[0];

  if (!board) {
    return { board: undefined, lists: [], cards: [] };
  }

  return {
    board,
    lists: board.listIds.map((listId) => state.lists[listId]).filter(Boolean).sort((left, right) => left.position - right.position),
    cards: Object.values(state.cards)
      .filter((card) => board.listIds.includes(card.listId))
      .sort((left, right) => left.position - right.position)
  };
}

function queryMatches(value: string | null | undefined, search: string) {
  return (value ?? '').toLowerCase().includes(search.toLowerCase());
}

function formatChecklistProgress(card: Card) {
  if (card.checklistItems.length === 0) {
    return 'No checklist';
  }

  const completed = card.checklistItems.filter((item) => item.completed).length;
  return `${completed}/${card.checklistItems.length} checklist items`;
}

function formatDueDateText(dueDate: string | null | undefined) {
  if (!dueDate) {
    return '';
  }

  const parsed = new Date(dueDate);
  if (Number.isNaN(parsed.getTime())) {
    return dueDate;
  }

  return `${dueDate} ${parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

export function matchesCardQuery(
  card: Card,
  query: string,
  context: {
    boardTitle?: string;
    listTitle?: string;
    labels?: Record<string, { name: string }>;
    members?: Record<string, { name: string }>;
  } = {}
) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const labelText = card.labelIds.map((labelId) => context.labels?.[labelId]?.name ?? '').join(' ');
  const memberText = card.memberIds.map((memberId) => context.members?.[memberId]?.name ?? '').join(' ');
  const checklistText = card.checklistItems.map((item) => item.title).join(' ');
  const dueText = formatDueDateText(card.dueDate);

  return [
    card.title,
    card.description ?? '',
    labelText,
    memberText,
    dueText,
    checklistText,
    context.listTitle ?? '',
    context.boardTitle ?? ''
  ].some((value) => value.toLowerCase().includes(normalizedQuery));
}

export const useKanbanStore = create<KanbanStore>()(
  persist(
    (set, get) => ({
      ...mockKanbanState,
      boards: mockKanbanState.boards.map(normalizeBoard),
      activeBoardId: mockKanbanState.boards[0].id,
      selectedCardId: null,
      onboardingCompleted: false,
      toasts: [],
      mobileSidebarOpen: false,
      filters: { ...DEFAULT_FILTERS },
      hydrateWorkspace: async () => {
        const snapshot = await fetchWorkspaceRemote();

        set((state) => {
          const boards = snapshot.boards.map((board) => ({
            ...board,
            background: normalizeBoardBackground(board.background),
            visibility: (board.visibility as BoardVisibility) ?? 'workspace',
            createdAt: board.createdAt ?? new Date().toISOString()
          }));
          const cards = Object.fromEntries(
            Object.entries(snapshot.cards).map(([cardId, card]) => [
              cardId,
              {
                ...card,
                comments: card.comments.map((comment) => ({
                  ...comment,
                  memberId: comment.memberId ?? undefined
                })),
                attachmentCount: card.attachmentCount ?? card.attachments?.length ?? 0
              }
            ])
          ) as KanbanState['cards'];
          const members = Object.fromEntries(
            Object.entries(snapshot.members).map(([memberId, member]) => [
              memberId,
              {
                id: member.id,
                boardId: member.boardId,
                name: member.name,
                role: member.role ?? 'Member',
                avatarUrl: member.avatarUrl ?? undefined
              }
            ])
          ) as KanbanState['members'];

          return {
            ...state,
            boards,
            lists: snapshot.lists,
            cards,
            labels: snapshot.labels,
            members,
            activeBoardId: boards.some((board) => board.id === state.activeBoardId) ? state.activeBoardId : boards[0]?.id ?? '',
            selectedCardId: state.selectedCardId && cards[state.selectedCardId] ? state.selectedCardId : null
          };
        });
      },
      setActiveBoard: (boardId) => set({ activeBoardId: boardId, selectedCardId: null, mobileSidebarOpen: false, filters: { ...DEFAULT_FILTERS } }),
      setSearch: (search) => set((state) => ({ filters: { ...state.filters, search } })),
      setLabelFilter: (labelId) => set((state) => ({ filters: { ...state.filters, labelId } })),
      setMemberFilter: (memberId) => set((state) => ({ filters: { ...state.filters, memberId } })),
      setDueDateFilter: (dueDate) => set((state) => ({ filters: { ...state.filters, dueDate } })),
      setChecklistFilter: (checklist) => set((state) => ({ filters: { ...state.filters, checklist } })),
      selectCard: (cardId) => set({ selectedCardId: cardId }),
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
      completeOnboarding: () => set({ onboardingCompleted: true }),
      createBoard: (title, boardId) => {
        const trimmed = title.trim();

        if (!trimmed) {
          return null;
        }

        const duplicate = get().boards.some((board) => board.title.toLowerCase() === trimmed.toLowerCase());
        if (duplicate) {
          return null;
        }

        const nextBoardId = boardId ?? createId('board');
        const nextListIds = [createId('list'), createId('list'), createId('list')];

        set((state) => ({
          boards: [
            ...state.boards,
            {
              id: nextBoardId,
              title: trimmed,
              description: 'New workspace board',
              listIds: nextListIds,
              labelIds: [],
              memberIds: [],
              background: DEFAULT_BACKGROUND,
              visibility: 'workspace',
              createdAt: new Date().toISOString()
            }
          ],
          lists: {
            ...state.lists,
            [nextListIds[0]]: {
              id: nextListIds[0],
              boardId: nextBoardId,
              title: 'To Do',
              position: 0,
              cardIds: []
            },
            [nextListIds[1]]: {
              id: nextListIds[1],
              boardId: nextBoardId,
              title: 'Doing',
              position: 1,
              cardIds: []
            },
            [nextListIds[2]]: {
              id: nextListIds[2],
              boardId: nextBoardId,
              title: 'Done',
              position: 2,
              cardIds: []
            }
          },
          activeBoardId: nextBoardId,
          mobileSidebarOpen: false,
          filters: { ...DEFAULT_FILTERS }
        }));

        scheduleBoardSync(nextBoardId, get);

        return nextBoardId;
      },
      createBoardPersisted: async (title, options) => {
        const trimmed = title.trim();

        if (!trimmed) {
          return null;
        }

        const duplicate = get().boards.some((board) => board.title.toLowerCase() === trimmed.toLowerCase());
        if (duplicate) {
          get().addToast({ kind: 'error', message: 'A board with that title already exists.' });
          return null;
        }

        const boardId = options?.boardId ?? createId('board');

        try {
          await createBoardRemote({
            id: boardId,
            title: trimmed,
            description: options?.description
          });
        } catch (error) {
          get().addToast({ kind: 'error', message: error instanceof Error ? error.message : 'Could not create board.' });
          return null;
        }

        return get().createBoard(trimmed, boardId, options);
      },
      deleteBoard: (boardId) => {
        void deleteBoardRemote(boardId).catch(() => undefined);

        set((state) => {
          const board = state.boards.find((entry) => entry.id === boardId);
          if (!board) {
            return state;
          }

          const nextLists = { ...state.lists };
          const nextCards = { ...state.cards };

          board.listIds.forEach((listId) => {
            const list = nextLists[listId];
            if (!list) {
              return;
            }

            list.cardIds.forEach((cardId) => {
              delete nextCards[cardId];
            });

            delete nextLists[listId];
          });

          const nextBoards = state.boards.filter((entry) => entry.id !== boardId);
          const activeBoardWasDeleted = state.activeBoardId === boardId;
          const nextActiveBoardId = nextBoards.length > 0 ? (activeBoardWasDeleted ? nextBoards[0].id : state.activeBoardId) : '';

          return {
            ...state,
            boards: nextBoards,
            lists: nextLists,
            cards: nextCards,
            activeBoardId: nextActiveBoardId,
            selectedCardId: state.selectedCardId && !nextCards[state.selectedCardId] ? null : state.selectedCardId,
            onboardingCompleted: state.onboardingCompleted,
            filters: activeBoardWasDeleted ? { ...DEFAULT_FILTERS } : state.filters,
            mobileSidebarOpen: false
          };
        });
      },
      updateBoardBackground: (boardId, background) =>
        set((state) => {
          void updateBoardRemote(boardId, { background }).catch(() => undefined);
          scheduleBoardSync(boardId, get);
          return {
            boards: state.boards.map((board) => (board.id === boardId ? { ...board, background } : board))
          };
        }),
      updateBoardVisibility: (boardId, visibility) =>
        set((state) => {
          void updateBoardRemote(boardId, { visibility }).catch(() => undefined);
          scheduleBoardSync(boardId, get);
          return {
            boards: state.boards.map((board) => (board.id === boardId ? { ...board, visibility } : board))
          };
        }),
      addMemberToBoard: (boardId, member) => {
        const memberId = member.id ?? createId('member');

        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId && !board.memberIds.includes(memberId)
              ? { ...board, memberIds: [...board.memberIds, memberId] }
              : board
          ),
          members: {
            ...state.members,
            [memberId]: {
              id: memberId,
              boardId,
              name: member.name,
              role: member.role,
              avatarUrl: member.avatarUrl
            }
          }
        }));

        scheduleBoardSync(boardId, get);

        return memberId;
      },
      removeMemberFromBoard: (boardId, memberId) =>
        set((state) => {
          scheduleBoardSync(boardId, get);
          return {
            boards: state.boards.map((board) =>
              board.id === boardId ? { ...board, memberIds: board.memberIds.filter((entry) => entry !== memberId) } : board
            )
          };
        }),
      createLabel: (boardId, name, color) => {
        const trimmed = name.trim();
        if (!trimmed) {
          get().addToast({ kind: 'error', message: 'Label name cannot be empty.' });
          return null;
        }

        const id = createId('label');
        set((state) => ({
          labels: {
            ...state.labels,
            [id]: {
              id,
              boardId,
              name: trimmed,
              color
            }
          },
          boards: state.boards.map((board) =>
            board.id === boardId ? { ...board, labelIds: board.labelIds.includes(id) ? board.labelIds : [...board.labelIds, id] } : board
          )
        }));

        scheduleBoardSync(boardId, get);
        return id;
      },
      deleteLabel: (labelId) =>
        set((state) => {
          const label = state.labels[labelId];
          if (!label) {
            return state;
          }

          const nextLabels = { ...state.labels };
          delete nextLabels[labelId];

          scheduleBoardSync(label.boardId, get);

          return {
            ...state,
            labels: nextLabels,
            boards: state.boards.map((board) =>
              board.id === label.boardId ? { ...board, labelIds: board.labelIds.filter((entry) => entry !== labelId) } : board
            ),
            cards: Object.fromEntries(
              Object.entries(state.cards).map(([cardId, card]) => [
                cardId,
                {
                  ...card,
                  labelIds: card.labelIds.filter((entry) => entry !== labelId)
                }
              ])
            )
          };
        }),
      updateBoardTitle: (boardId, title) => {
        const trimmed = title.trim();
        if (!trimmed) {
          get().addToast({ kind: 'error', message: 'Board title cannot be empty.' });
          return;
        }

        const duplicate = get().boards.some((board) => board.id !== boardId && board.title.toLowerCase() === trimmed.toLowerCase());
        if (duplicate) {
          get().addToast({ kind: 'error', message: 'A board with that title already exists.' });
          return;
        }

        set((state) => ({
          boards: state.boards.map((board) => (board.id === boardId ? { ...board, title: trimmed } : board))
        }));

        void updateBoardRemote(boardId, { title: trimmed }).catch(() => undefined);
        scheduleBoardSync(boardId, get);
      },
      createList: (title) => {
        const trimmed = title.trim();
        if (!trimmed) {
          get().addToast({ kind: 'error', message: 'List name cannot be empty.' });
          return;
        }

        const { activeBoardId, boards, lists } = get();
        const board = boards.find((entry) => entry.id === activeBoardId);

        if (!board) {
          return;
        }

        const duplicate = board.listIds.some((listId) => lists[listId]?.title.toLowerCase() === trimmed.toLowerCase());
        if (duplicate) {
          get().addToast({ kind: 'error', message: 'List names should be unique in a board.' });
          return;
        }

        const nextListId = createId('list');
        const nextPosition = board.listIds.length;

        set({
          boards: boards.map((entry) =>
            entry.id === activeBoardId ? { ...entry, listIds: [...entry.listIds, nextListId] } : entry
          ),
          lists: {
            ...lists,
            [nextListId]: {
              id: nextListId,
              boardId: activeBoardId,
              title: trimmed,
              position: nextPosition,
              cardIds: []
            }
          }
        });

        scheduleBoardSync(activeBoardId, get);
      },
      updateListTitle: (listId, title) => {
        const trimmed = title.trim();
        if (!trimmed) {
          get().addToast({ kind: 'error', message: 'List title cannot be empty.' });
          return;
        }

        const list = get().lists[listId];
        if (!list) {
          return;
        }

        set((state) => ({
          lists: {
            ...state.lists,
            [listId]: {
              ...state.lists[listId],
              title: trimmed
            }
          }
        }));

        scheduleBoardSync(list.boardId, get);
      },
      updateList: (listId, patch) =>
        set((state) => {
          const list = state.lists[listId];
          if (!list) {
            return state;
          }

          scheduleBoardSync(list.boardId, get);
          return {
            lists: {
              ...state.lists,
              [listId]: {
                ...state.lists[listId],
                ...patch
              }
            }
          };
        }),
      deleteList: (listId) =>
        set((state) => {
          const list = state.lists[listId];

          if (!list) {
            return state;
          }

          const nextLists = { ...state.lists };
          delete nextLists[listId];

          const nextCards = { ...state.cards };
          list.cardIds.forEach((cardId) => {
            delete nextCards[cardId];
          });

          scheduleBoardSync(list.boardId, get);

          return {
            ...state,
            lists: nextLists,
            cards: nextCards,
            boards: state.boards.map((board) =>
              board.id === list.boardId
                ? { ...board, listIds: board.listIds.filter((entry) => entry !== listId) }
                : board
            )
          };
        }),
      createCard: (listId, title) => {
        const trimmed = title.trim();
        if (!trimmed) {
          get().addToast({ kind: 'error', message: 'Card title cannot be empty.' });
          return null;
        }

        const { cards, lists } = get();
        const list = lists[listId];

        if (!list) {
          return null;
        }

        const nextCardId = createId('card');

        set({
          cards: {
            ...cards,
            [nextCardId]: {
              id: nextCardId,
              listId,
              title: trimmed,
              description: '',
              coverImage: null,
              position: list.cardIds.length,
              archived: false,
              dueDate: null,
              dueReminder: null,
              dueCompleted: false,
              labelIds: [],
              memberIds: [],
              checklistItems: [],
              activities: [],
              comments: [],
              attachments: [],
              attachmentCount: 0
            }
          },
          lists: {
            ...lists,
            [listId]: { ...list, cardIds: [...list.cardIds, nextCardId] }
          }
        });

        scheduleBoardSync(list.boardId, get);

        return nextCardId;
      },
      updateCard: (cardId, patch) =>
        set((state) => {
          const currentCard = state.cards[cardId];

          if (!currentCard) {
            return state;
          }

          const nextActivities = [...currentCard.activities];

          if (patch.dueDate !== undefined && patch.dueDate !== currentCard.dueDate) {
            nextActivities.unshift({
              id: createId('activity'),
              type: 'due-date',
              text: patch.dueDate ? `updated due date to ${patch.dueDate}` : 'removed due date',
              createdAt: new Date().toISOString()
            });
          }

          if (patch.dueCompleted !== undefined && patch.dueCompleted !== currentCard.dueCompleted) {
            nextActivities.unshift({
              id: createId('activity'),
              type: 'due-date',
              text: patch.dueCompleted ? 'marked due date complete' : 'marked due date incomplete',
              createdAt: new Date().toISOString()
            });
          }

          if (patch.labelIds !== undefined) {
            const previous = currentCard.labelIds.join(',');
            const next = patch.labelIds.join(',');

            if (previous !== next) {
              nextActivities.unshift({
                id: createId('activity'),
                type: 'labels',
                text: 'updated labels on this card',
                createdAt: new Date().toISOString()
              });
            }
          }

          if (patch.checklistItems !== undefined) {
            nextActivities.unshift({
              id: createId('activity'),
              type: 'checklist',
              text: 'updated checklist progress',
              createdAt: new Date().toISOString()
            });
          }

          const boardId = state.lists[currentCard.listId]?.boardId;
          if (boardId) {
            scheduleBoardSync(boardId, get);
          }

          if (patch.coverImage !== undefined) {
            void updateCardRemote(cardId, { coverImage: patch.coverImage }).catch(() => undefined);
          }

          return {
            ...state,
            cards: {
              ...state.cards,
              [cardId]: {
                ...currentCard,
                ...patch,
                activities: nextActivities
              }
            }
          };
        }),
      addComment: (cardId: string, text: string, memberId?: string) => {
        const trimmed = text.trim();
        if (!trimmed) {
          return;
        }

        const nextComment: Comment = {
          id: createId('comment'),
          text: trimmed,
          memberId,
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          cards: {
            ...state.cards,
            [cardId]: {
              ...state.cards[cardId],
              comments: [...state.cards[cardId].comments, nextComment],
              activities: [
                {
                  id: createId('activity'),
                  type: 'comment',
                  text: trimmed,
                  createdAt: new Date().toISOString()
                },
                ...state.cards[cardId].activities
              ]
            }
          }
        }));

        const commentList = get().lists[get().cards[cardId]?.listId];
        if (commentList) {
          scheduleBoardSync(commentList.boardId, get);
        }
      },
      addChecklistItem: (cardId, title) => {
        const trimmed = title.trim();
        if (!trimmed) {
          return;
        }

        set((state) => {
          const card = state.cards[cardId];
          if (!card) {
            return state;
          }

          return {
            ...state,
            cards: {
              ...state.cards,
              [cardId]: {
                ...card,
                checklistItems: [
                  ...card.checklistItems,
                  {
                    id: createId('check'),
                    title: trimmed,
                    completed: false,
                    position: card.checklistItems.length
                  }
                ],
                activities: [
                  {
                    id: createId('activity'),
                    type: 'checklist',
                    text: `added checklist item ${trimmed}`,
                    createdAt: new Date().toISOString()
                  },
                  ...card.activities
                ]
              }
            }
          };
        });

        const checklistList = get().lists[get().cards[cardId]?.listId];
        if (checklistList) {
          scheduleBoardSync(checklistList.boardId, get);
        }
      },
      deleteChecklistItem: (cardId, checklistId) =>
        set((state) => {
          const list = state.lists[state.cards[cardId]?.listId];
          const nextState = {
            ...state,
            cards: {
              ...state.cards,
              [cardId]: {
                ...state.cards[cardId],
                checklistItems: state.cards[cardId].checklistItems.filter((item) => item.id !== checklistId),
                activities: [
                  {
                    id: createId('activity'),
                    type: 'checklist',
                    text: 'removed checklist item',
                    createdAt: new Date().toISOString()
                  },
                  ...state.cards[cardId].activities
                ]
              }
            }
          };

          if (list) {
            scheduleBoardSync(list.boardId, get);
          }

          return nextState;
        }),
      deleteCard: (cardId) =>
        set((state) => {
          const card = state.cards[cardId];

          if (!card) {
            return state;
          }

          const nextCards = { ...state.cards };
          delete nextCards[cardId];

          scheduleBoardSync(card.listId in state.lists ? state.lists[card.listId].boardId : '', get);

          return {
            ...state,
            cards: nextCards,
            lists: {
              ...state.lists,
              [card.listId]: {
                ...state.lists[card.listId],
                cardIds: state.lists[card.listId].cardIds.filter((entry) => entry !== cardId)
              }
            },
            selectedCardId: state.selectedCardId === cardId ? null : state.selectedCardId
          };
        }),
      reorderLists: (orderedListIds) =>
        set((state) => {
          const activeBoard = state.boards.find((board) => board.id === state.activeBoardId);

          if (!activeBoard) {
            return state;
          }

          scheduleBoardSync(activeBoard.id, get);

          return {
            ...state,
            boards: state.boards.map((board) =>
              board.id === state.activeBoardId ? { ...board, listIds: orderedListIds } : board
            ),
            lists: {
              ...state.lists,
              ...orderedListIds.reduce<Record<string, List>>((accumulator, listId, index) => {
                accumulator[listId] = {
                  ...state.lists[listId],
                  position: index
                };
                return accumulator;
              }, {})
            }
          };
        }),
      moveCard: ({ cardId, sourceListId, targetListId, targetCardId }) =>
        set((state) => {
          const sourceList = state.lists[sourceListId];
          const targetList = state.lists[targetListId];
          const card = state.cards[cardId];

          if (!sourceList || !targetList || !card) {
            return state;
          }

          const sourceIndex = sourceList.cardIds.indexOf(cardId);
          if (sourceIndex === -1) {
            return state;
          }

          const sourceWithoutCard = sourceList.cardIds.filter((entry) => entry !== cardId);
          const targetBase = sourceListId === targetListId
            ? sourceWithoutCard
            : targetList.cardIds.filter((entry) => entry !== cardId);

          const rawTargetIndex = targetCardId ? targetBase.indexOf(targetCardId) : targetBase.length;
          const insertIndex = rawTargetIndex === -1 ? targetBase.length : rawTargetIndex;
          const sameListTargetIndex = targetCardId
            ? sourceList.cardIds.indexOf(targetCardId)
            : sourceList.cardIds.length - 1;
          const safeSameListTargetIndex = sameListTargetIndex === -1 ? sourceList.cardIds.length - 1 : sameListTargetIndex;

          const nextSourceCardIds =
            sourceListId === targetListId
              ? arrayMove(sourceList.cardIds, sourceIndex, safeSameListTargetIndex)
              : sourceWithoutCard;

          const nextTargetCardIds =
            sourceListId === targetListId
              ? nextSourceCardIds
              : [...targetBase.slice(0, insertIndex), cardId, ...targetBase.slice(insertIndex)];

          if (!nextTargetCardIds.includes(cardId)) {
            return state;
          }

          const nextCards = { ...state.cards };

          nextSourceCardIds.forEach((id, index) => {
            nextCards[id] = {
              ...nextCards[id],
              listId: sourceListId,
              position: index
            };
          });

          if (sourceListId !== targetListId) {
            nextTargetCardIds.forEach((id, index) => {
              nextCards[id] = {
                ...nextCards[id],
                listId: targetListId,
                position: index
              };
            });
          }

          void reorderCardsRemote({
            cardId,
            sourceListId,
            targetListId,
            targetCardId: targetCardId ?? null
          }).catch(() => undefined);

          scheduleBoardSync(targetList.boardId, get);
          if (sourceListId !== targetListId) {
            scheduleBoardSync(sourceList.boardId, get);
          }
          nextCards[cardId] = {
            ...nextCards[cardId],
            activities: [
              {
                id: createId('activity'),
                type: 'move',
                text: `moved card to ${targetList.title}`,
                createdAt: new Date().toISOString()
              },
              ...card.activities
            ]
          };

          return {
            ...state,
            cards: nextCards,
            lists: {
              ...state.lists,
              [sourceListId]: {
                ...sourceList,
                cardIds: nextSourceCardIds
              },
              [targetListId]: {
                ...targetList,
                cardIds: nextTargetCardIds
              }
            }
          };
        }),
      archiveCard: (cardId) =>
        set((state) => {
          const list = state.lists[state.cards[cardId]?.listId];
          if (list) {
            scheduleBoardSync(list.boardId, get);
          }

          return {
            cards: {
              ...state.cards,
              [cardId]: {
                ...state.cards[cardId],
                archived: true
              }
            }
          };
        }),
      dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
      addToast: (toast) => {
        const toastId = createId('toast');
        set((state) => ({ toasts: [...state.toasts, { ...toast, id: toastId }] }));
        setTimeout(() => {
          get().dismissToast(toastId);
        }, 3200);
      },
      globalSearch: (query) => {
        const state = get();
        const q = query.trim().toLowerCase();
        if (!q) {
          return [];
        }

        const listById = state.lists;

        return Object.values(state.cards)
          .filter((card) => !card.archived)
          .filter((card) => {
            const list = listById[card.listId];
            const board = state.boards.find((entry) => entry.id === list?.boardId);
            return matchesCardQuery(card, q, {
              boardTitle: board?.title,
              listTitle: list?.title,
              labels: state.labels,
              members: state.members
            });
          })
          .map((card) => {
            const list = listById[card.listId];
            const board = state.boards.find((entry) => entry.id === list?.boardId);
            const labelNames = card.labelIds.map((labelId) => state.labels[labelId]?.name ?? '').filter(Boolean);
            const memberNames = card.memberIds.map((memberId) => state.members[memberId]?.name ?? '').filter(Boolean);
            return {
              cardId: card.id,
              boardId: board?.id ?? '',
              listId: list?.id ?? '',
              title: card.title,
              boardTitle: board?.title ?? 'Unknown board',
              listTitle: list?.title ?? 'Unknown list',
              dueDate: card.dueDate ?? null,
              labels: labelNames,
              members: memberNames,
              checklistProgress: formatChecklistProgress(card),
              attachmentCount: card.attachmentCount ?? 0
            };
          })
          .slice(0, 8);
      }
    }),
    {
      name: 'trelloban-store-v4',
      partialize: (state) => ({
        activeBoardId: state.activeBoardId,
        selectedCardId: state.selectedCardId,
        onboardingCompleted: state.onboardingCompleted,
        filters: state.filters,
        mobileSidebarOpen: state.mobileSidebarOpen
      }),
      version: 4
    }
  )
);

export function useActiveBoard() {
  return useKanbanStore((state) => toBoardState(state.activeBoardId, state));
}

export function useBoardById(boardId: Id) {
  return useKanbanStore((state) => state.boards.find((board) => board.id === boardId));
}
