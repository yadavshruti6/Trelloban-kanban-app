"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, CalendarDays, LayoutGrid, Plus, Settings, Trello, Users, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { BackgroundSelector } from '@/components/background-selector';
import { useKanbanStore } from '@/store/use-kanban-store';

export function Sidebar() {
  const pathname = usePathname();
  const boards = useKanbanStore((state) => state.boards);
  const lists = useKanbanStore((state) => state.lists);
  const activeBoardId = useKanbanStore((state) => state.activeBoardId);
  const setActiveBoard = useKanbanStore((state) => state.setActiveBoard);
  const createBoardPersisted = useKanbanStore((state) => state.createBoardPersisted);
  const mobileSidebarOpen = useKanbanStore((state) => state.mobileSidebarOpen);
  const setMobileSidebarOpen = useKanbanStore((state) => state.setMobileSidebarOpen);
  const addToast = useKanbanStore((state) => state.addToast);

  const [isCreating, setIsCreating] = useState(false);
  const [showBackground, setShowBackground] = useState(false);

  const boardCards = useMemo(
    () =>
      boards.map((board) => ({
        ...board,
        cardCount: board.listIds.reduce((count, listId) => count + (lists[listId]?.cardIds.length ?? 0), 0)
      })),
    [boards, lists]
  );

  const navItems = [
    { href: '/', label: 'Kanban Board', icon: LayoutGrid },
    { href: '/boards', label: 'All Boards', icon: LayoutGrid },
    { href: '/calendar', label: 'Calendar', icon: CalendarDays },
    { href: '/activity', label: 'Activity', icon: Activity },
    { href: '/members', label: 'Members', icon: Users },
    { href: '/settings', label: 'Settings', icon: Settings }
  ];

  async function handleQuickBoardCreate() {
    if (isCreating) {
      return;
    }

    const title = 'New Board';
    const existing = useKanbanStore.getState().boards;
    if (existing.some((board) => board.title.toLowerCase() === title.toLowerCase())) {
      addToast({ kind: 'error', message: 'Board title already exists. Use the boards page create modal.' });
      return;
    }

    setIsCreating(true);
    try {
      const createdId = await createBoardPersisted(title, { description: 'Workspace board' });

      if (createdId) {
        addToast({ kind: 'success', message: 'Board created.' });
      }
    } catch {
      addToast({ kind: 'error', message: 'Could not save board.' });
    } finally {
      setIsCreating(false);
    }
  }

  const content = (
    <div className="flex h-full flex-col overflow-y-auto overflow-x-hidden">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white">
            <Trello className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Trelloban</p>
            <p className="text-xs text-slate-300">Acme Workspace</p>
          </div>
        </div>

        <button type="button" className="rounded-md p-1.5 text-slate-300 hover:bg-white/10 xl:hidden" onClick={() => setMobileSidebarOpen(false)}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="mt-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-10 items-center gap-2 rounded-lg px-3 text-sm transition ${
                isActive ? 'bg-white/16 text-white' : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Boards</p>
        <button
          type="button"
          onClick={handleQuickBoardCreate}
          disabled={isCreating}
          className="inline-flex h-8 items-center rounded-md border border-white/15 px-2.5 text-xs font-medium text-white transition hover:bg-white/10 disabled:opacity-70"
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> New
        </button>
      </div>

      <div className="mt-2 flex-1 space-y-1 overflow-y-auto pr-1">
        {boardCards.map((board) => {
          const active = board.id === activeBoardId;
          return (
            <motion.button
              key={board.id}
              type="button"
              onClick={() => {
                setActiveBoard(board.id);
                setMobileSidebarOpen(false);
              }}
              whileHover={{ x: 2 }}
              className={`w-full rounded-lg border px-2.5 py-2 text-left transition ${
                active ? 'border-white/20 bg-white/14' : 'border-transparent bg-white/0 hover:border-white/15 hover:bg-white/8'
              }`}
            >
              <p className="truncate text-sm font-medium text-white">{board.title}</p>
              <p className="text-xs text-slate-300">{board.listIds.length} lists • {board.cardCount} cards</p>
            </motion.button>
          );
        })}
      </div>
      <div className="mt-4 border-t border-[rgba(23,43,77,0.04)] pt-3">
        <button type="button" onClick={() => setShowBackground((v) => !v)} className="inline-flex items-center gap-2 rounded-md bg-white/4 px-3 py-2 text-sm text-white hover:bg-white/10">
          <span>Change Background</span>
        </button>

        {showBackground ? (
          <div className="mt-3">
            <BackgroundSelector onClose={() => setShowBackground(false)} />
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-[264px] shrink-0 border-r border-white/10 bg-[#0f172a] p-4 xl:block">
        {content}
      </aside>

      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-[70] flex xl:hidden">
          <button type="button" className="flex-1 bg-black/45" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="h-screen max-h-screen w-[82vw] max-w-[320px] overflow-y-auto overflow-x-hidden border-l border-white/10 bg-[#0f172a] p-4">{content}</aside>
        </div>
      ) : null}
    </>
  );
}
