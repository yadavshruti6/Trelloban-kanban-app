const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type ApiResponse<T> = { data: T };

type BoardBackground = {
  kind: string;
  value: string;
  overlay: string;
};

type WorkspaceSnapshot = {
  boards: Array<{
    id: string;
    title: string;
    description?: string;
    visibility: string;
    background: BoardBackground;
    listIds: string[];
    labelIds: string[];
    memberIds: string[];
    createdAt: string;
  }>;
  lists: Record<string, { id: string; boardId: string; title: string; position: number; cardIds: string[] }>;
  cards: Record<string, {
    id: string;
    listId: string;
    title: string;
    description?: string;
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

async function parseError(response: Response, fallbackMessage: string) {
  const payload = await response.json().catch(() => ({}));
  return new Error(payload.message ?? fallbackMessage);
}

async function request<T>(path: string, init?: RequestInit, fallbackMessage = 'Request failed') {
  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {})
      },
      ...init
    });
  } catch {
    throw new Error('Could not reach the API server.');
  }

  if (!response.ok) {
    throw await parseError(response, fallbackMessage);
  }

  return response.json().catch(() => ({})) as Promise<ApiResponse<T>>;
}

export async function fetchWorkspaceRemote() {
  const response = await request<WorkspaceSnapshot>(`/api/boards`, undefined, 'Failed to load workspace');
  return response.data;
}

export async function createBoardRemote(input: { id: string; title: string; description?: string }) {
  return request(`/api/boards`, {
    method: 'POST',
    body: JSON.stringify(input)
  }, 'Failed to create board');
}

export async function createCardRemote(input: { id: string; listId: string; title: string; description?: string; dueDate?: string | null }) {
  return request(`/api/lists/${input.listId}/cards`, {
    method: 'POST',
    body: JSON.stringify({
      id: input.id,
      title: input.title,
      description: input.description,
      dueDate: input.dueDate ?? null
    })
  }, 'Failed to create card');
}

export async function updateCardRemote(cardId: string, patch: {
  title?: string;
  description?: string | null;
  coverImage?: string | null;
  dueDate?: string | null;
  dueReminder?: string | null;
  dueCompleted?: boolean;
  archived?: boolean;
  listId?: string;
  position?: number;
}) {
  return request(`/api/cards/${cardId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch)
  }, 'Failed to update card');
}

export async function reorderCardsRemote(input: { cardId: string; sourceListId: string; targetListId: string; targetCardId?: string | null }) {
  return request('/api/cards/reorder', {
    method: 'PATCH',
    body: JSON.stringify(input)
  }, 'Failed to reorder cards');
}

export async function reorderListsRemote(input: { boardId: string; orderedListIds: string[] }) {
  return request('/api/lists/reorder', {
    method: 'PATCH',
    body: JSON.stringify(input)
  }, 'Failed to reorder lists');
}

export async function updateBoardRemote(boardId: string, patch: { title?: string; description?: string | null; visibility?: string; background?: BoardBackground }) {
  return request(`/api/boards/${boardId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch)
  }, 'Failed to update board');
}

export async function syncBoardStateRemote(boardId: string, snapshot: WorkspaceSnapshot) {
  return request(`/api/boards/${boardId}/state`, {
    method: 'PUT',
    body: JSON.stringify(snapshot)
  }, 'Failed to persist board state');
}

export async function deleteBoardRemote(boardId: string) {
  return request(`/api/boards/${boardId}`, { method: 'DELETE' }, 'Failed to delete board');
}
