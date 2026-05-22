const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type CreateBoardInput = {
  id: string;
  title: string;
  description?: string;
};

async function parseError(response: Response, fallbackMessage: string) {
  const payload = await response.json().catch(() => ({}));
  return new Error(payload.message ?? fallbackMessage);
}

export async function createBoardRemote(input: CreateBoardInput) {
  let response: Response;

  try {
    response = await fetch(`${API_BASE}/api/boards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input)
    });
  } catch {
    throw new Error('Could not reach the API server.');
  }

  if (!response.ok) {
    throw await parseError(response, 'Failed to create board');
  }

  return response.json().catch(() => ({}));
}

export async function deleteBoardRemote(boardId: string) {
  let response: Response;

  try {
    response = await fetch(`${API_BASE}/api/boards/${boardId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch {
    throw new Error('Could not reach the API server.');
  }

  if (!response.ok) {
    throw await parseError(response, 'Failed to delete board');
  }

  return response.json().catch(() => ({}));
}
