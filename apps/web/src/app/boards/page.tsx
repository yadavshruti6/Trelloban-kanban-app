"use client";

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Plus, Star, X } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { useKanbanStore } from '@/store/use-kanban-store';
import type { BoardBackground } from '@/types/kanban';

const boardBackgrounds: BoardBackground[] = [
  { kind: 'gradient', value: 'linear-gradient(120deg, #7c6cf2 0%, #6d5df6 45%, #5446d8 100%)', overlay: 'rgba(15,23,42,0.22)' },
  { kind: 'gradient', value: 'linear-gradient(120deg, #0f172a 0%, #1e293b 42%, #334155 100%)', overlay: 'rgba(15,23,42,0.22)' },
  { kind: 'wallpaper', value: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80', overlay: 'rgba(15,23,42,0.34)' },
  { kind: 'wallpaper', value: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', overlay: 'rgba(15,23,42,0.34)' }
];

export default function BoardsPage() {
  return (
    <Suspense fallback={<AppShell><div className="w-full rounded-2xl bg-white p-6 text-sm text-[#64748b]">Loading boards...</div></AppShell>}>
      <BoardsContent />
    </Suspense>
  );
}

function BoardsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const boards = useKanbanStore((state) => state.boards);
  const lists = useKanbanStore((state) => state.lists);
  const members = useKanbanStore((state) => state.members);
  const setActiveBoard = useKanbanStore((state) => state.setActiveBoard);
  const createBoardPersisted = useKanbanStore((state) => state.createBoardPersisted);
  const addToast = useKanbanStore((state) => state.addToast);

  const [openCreate, setOpenCreate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'workspace'>('workspace');
  const [selectedBackground, setSelectedBackground] = useState<BoardBackground>(boardBackgrounds[0]);
  const [favorites, setFavorites] = useState<string[]>(() => boards.slice(0, 1).map((board) => board.id));

  useEffect(() => {
    setOpenCreate(searchParams.get('create') === '1');
  }, [searchParams]);

  const boardsData = useMemo(
    () =>
      boards.map((board, index) => ({
        ...board,
        index,
        listCount: board.listIds.length,
        cardCount: board.listIds.reduce((count, listId) => count + (lists[listId]?.cardIds.length ?? 0), 0),
        memberList: board.memberIds.slice(0, 3).map((memberId) => members[memberId]).filter(Boolean)
      })),
    [boards, lists, members]
  );

  const favoriteBoards = boardsData.filter((board) => favorites.includes(board.id));
  const recentBoards = boardsData.slice().reverse().slice(0, 6);

  async function handleCreateBoard() {
    if (isCreating) {
      return;
    }

    const trimmed = title.trim();
    if (!trimmed) {
      addToast({ kind: 'error', message: 'Board title cannot be empty.' });
      return;
    }

    if (boards.some((board) => board.title.toLowerCase() === trimmed.toLowerCase())) {
      addToast({ kind: 'error', message: 'A board with this title already exists.' });
      return;
    }

    setIsCreating(true);

    try {
      const createdId = await createBoardPersisted(trimmed, {
        visibility,
        background: selectedBackground,
        description: visibility === 'private' ? 'Private workspace board' : 'Shared workspace board'
      });

      if (!createdId) {
        return;
      }

      addToast({ kind: 'success', message: 'Board created successfully.' });
      setOpenCreate(false);
      setTitle('');
      setVisibility('workspace');
      setSelectedBackground(boardBackgrounds[0]);
      router.replace('/boards');
    } catch (error) {
      addToast({ kind: 'error', message: error instanceof Error ? error.message : 'Could not save board to API.' });
    } finally {
      setIsCreating(false);
    }
  }

  function openBoard(boardId: string) {
    setActiveBoard(boardId);
    router.push('/');
  }

  function toggleFavorite(boardId: string) {
    setFavorites((current) =>
      current.includes(boardId) ? current.filter((id) => id !== boardId) : [...current, boardId]
    );
  }

  return (
    <AppShell>
      <section className="w-full rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-4 shadow-[0_14px_32px_rgba(15,23,42,0.1)] md:p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-[#0f172a]">Boards Dashboard</h2>
            <p className="mt-1 text-sm text-[#64748b]">Recent workspaces, favorites, and quick board creation.</p>
          </div>
          <button
            type="button"
            onClick={() => setOpenCreate(true)}
            className="inline-flex h-10 items-center rounded-lg bg-[#0f172a] px-4 text-sm font-medium text-white"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Create Board
          </button>
        </div>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-[#f59e0b]" />
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#64748b]">Favorite Boards</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {favoriteBoards.length === 0 ? (
              <p className="col-span-full rounded-lg border border-dashed border-[rgba(15,23,42,0.18)] px-3 py-4 text-sm text-[#64748b]">
                No favorites yet. Star a board to pin it here.
              </p>
            ) : null}
            {favoriteBoards.map((board) => (
              <BoardCard key={board.id} onOpen={() => openBoard(board.id)} onFavorite={() => toggleFavorite(board.id)} isFavorite board={board} />
            ))}
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#64748b]">Recent Boards</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {recentBoards.map((board) => (
              <BoardCard
                key={board.id}
                onOpen={() => openBoard(board.id)}
                onFavorite={() => toggleFavorite(board.id)}
                isFavorite={favorites.includes(board.id)}
                board={board}
              />
            ))}

            <button
              type="button"
              onClick={() => setOpenCreate(true)}
              className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-[rgba(15,23,42,0.22)] bg-[#f8fafc] text-sm font-semibold text-[#475569] transition hover:bg-[#eef2ff]"
            >
              + Create New Board
            </button>
          </div>
        </section>
      </section>

      {openCreate ? (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-[#0f172a]/42 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-2xl border border-[rgba(15,23,42,0.1)] bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#0f172a]">Create Board</h3>
              <button type="button" onClick={() => setOpenCreate(false)} className="rounded-md p-1 text-[#64748b] hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-5 md:grid-cols-[1.2fr_0.9fr]">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">Board title</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Quarterly planning"
                  className="mt-2 h-11 w-full rounded-lg border border-[rgba(15,23,42,0.12)] px-3 text-sm text-[#0f172a] outline-none focus:border-[#6d5df6] focus:ring-2 focus:ring-[#6d5df6]/20"
                />

                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">Background</p>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {boardBackgrounds.map((background, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedBackground(background)}
                      className={`relative h-16 rounded-md border transition ${
                        selectedBackground.value === background.value
                          ? 'border-[#6d5df6] ring-2 ring-[#6d5df6]/24'
                          : 'border-[rgba(15,23,42,0.14)]'
                      }`}
                      style={
                        background.kind === 'wallpaper'
                          ? { backgroundImage: `url(${background.value})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                          : { backgroundImage: background.value }
                      }
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">Visibility</p>
                <div className="mt-2 space-y-2">
                  {[
                    { value: 'workspace', title: 'Workspace', description: 'Visible to all workspace members' },
                    { value: 'private', title: 'Private', description: 'Visible to invited members only' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setVisibility(option.value as 'workspace' | 'private')}
                      className={`flex w-full items-start gap-2 rounded-lg border p-3 text-left transition ${
                        visibility === option.value
                          ? 'border-[#6d5df6] bg-[#6d5df6]/8'
                          : 'border-[rgba(15,23,42,0.12)] hover:bg-slate-50'
                      }`}
                    >
                      <span className={`mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                        visibility === option.value ? 'border-[#6d5df6] text-[#6d5df6]' : 'border-[rgba(15,23,42,0.2)] text-transparent'
                      }`}>
                        <Check className="h-3 w-3" />
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-[#0f172a]">{option.title}</span>
                        <span className="mt-0.5 block text-xs text-[#64748b]">{option.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isCreating}
              onClick={handleCreateBoard}
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#0f172a] text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCreating ? 'Creating board...' : 'Create board'}
            </button>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

function BoardCard({
  board,
  isFavorite,
  onFavorite,
  onOpen
}: {
  board: {
    id: string;
    title: string;
    description?: string;
    listCount: number;
    cardCount: number;
    memberList: Array<{ id: string; name: string }>;
    background: BoardBackground;
  };
  isFavorite: boolean;
  onFavorite: () => void;
  onOpen: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[rgba(15,23,42,0.08)] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <button
        type="button"
        onClick={onOpen}
        className="h-24 w-full"
        style={
          board.background.kind === 'custom' || board.background.kind === 'wallpaper'
            ? { backgroundImage: `url(${board.background.value})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { backgroundImage: board.background.value }
        }
      />
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-[#0f172a]">{board.title}</p>
          <button
            type="button"
            onClick={onFavorite}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition ${
              isFavorite ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Star className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-1 text-xs text-[#64748b]">{board.description ?? 'Workspace board'}</p>
        <p className="mt-2 text-xs font-medium text-[#475569]">{board.listCount} lists - {board.cardCount} cards</p>
        <div className="mt-2 flex items-center gap-1">
          {board.memberList.map((member) => (
            <span key={member.id} className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0f172a] text-[10px] font-semibold text-white">
              {member.name
                .split(' ')
                .map((part) => part[0])
                .slice(0, 2)
                .join('')}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
