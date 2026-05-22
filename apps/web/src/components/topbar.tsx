"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Archive,
  Bell,
  CalendarDays,
  ChevronDown,
  Eye,
  EyeOff,
  Home,
  Info,
  LayoutGrid,
  ListFilter,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Settings,
  Shield,
  SlidersHorizontal,
  Star,
  Trash2,
  Upload,
  Users,
  X
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BackgroundSelector } from '@/components/background-selector';
import { useKanbanStore } from '@/store/use-kanban-store';
import type { BoardVisibility } from '@/types/kanban';

type MenuKey = 'boards' | 'create' | 'filters' | 'notifications' | 'profile' | 'visibility' | null;

type ModalKey = 'info' | 'invite' | 'butler' | 'drawer' | null;
type ConfirmationKey = string | null;

type Option = { value: string; label: string };

const VISIBILITY_ORDER: BoardVisibility[] = ['private', 'workspace', 'public'];

export function Topbar() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const backgroundInputRef = useRef<HTMLInputElement | null>(null);

  const activeBoardId = useKanbanStore((state) => state.activeBoardId);
  const boards = useKanbanStore((state) => state.boards);
  const lists = useKanbanStore((state) => state.lists);
  const cards = useKanbanStore((state) => state.cards);
  const labels = useKanbanStore((state) => state.labels);
  const members = useKanbanStore((state) => state.members);
  const search = useKanbanStore((state) => state.filters.search);
  const labelFilter = useKanbanStore((state) => state.filters.labelId);
  const memberFilter = useKanbanStore((state) => state.filters.memberId);
  const dueDateFilter = useKanbanStore((state) => state.filters.dueDate);
  const checklistFilter = useKanbanStore((state) => state.filters.checklist);
  const selectedCardId = useKanbanStore((state) => state.selectedCardId);
  const setSearch = useKanbanStore((state) => state.setSearch);
  const setLabelFilter = useKanbanStore((state) => state.setLabelFilter);
  const setMemberFilter = useKanbanStore((state) => state.setMemberFilter);
  const setDueDateFilter = useKanbanStore((state) => state.setDueDateFilter);
  const setChecklistFilter = useKanbanStore((state) => state.setChecklistFilter);
  const setActiveBoard = useKanbanStore((state) => state.setActiveBoard);
  const selectCard = useKanbanStore((state) => state.selectCard);
  const updateBoardVisibility = useKanbanStore((state) => state.updateBoardVisibility);
  const updateBoardBackground = useKanbanStore((state) => state.updateBoardBackground);
  const updateBoardTitle = useKanbanStore((state) => state.updateBoardTitle);
  const deleteBoard = useKanbanStore((state) => state.deleteBoard);
  const createBoard = useKanbanStore((state) => state.createBoard);
  const createList = useKanbanStore((state) => state.createList);
  const createCard = useKanbanStore((state) => state.createCard);
  const archiveCard = useKanbanStore((state) => state.archiveCard);
  const updateCard = useKanbanStore((state) => state.updateCard);
  const addMemberToBoard = useKanbanStore((state) => state.addMemberToBoard);
  const removeMemberFromBoard = useKanbanStore((state) => state.removeMemberFromBoard);
  const addToast = useKanbanStore((state) => state.addToast);

  const [draftSearch, setDraftSearch] = useState(search);
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const [openModal, setOpenModal] = useState<ModalKey>(null);
  const [openConfirmation, setOpenConfirmation] = useState<ConfirmationKey>(null);
  const [boardSearch, setBoardSearch] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('Contributor');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [starredBoards, setStarredBoards] = useState<string[]>(() => [boards[0]?.id].filter(Boolean) as string[]);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [isEditingBoardTitle, setIsEditingBoardTitle] = useState(false);
  const [draftBoardTitle, setDraftBoardTitle] = useState('');

  const activeBoard = boards.find((item) => item.id === activeBoardId) ?? null;
  const activeBoardCards = useMemo(() => {
    if (!activeBoard) return [];
    return activeBoard.listIds.flatMap((listId) => lists[listId]?.cardIds ?? []).map((cardId) => cards[cardId]).filter(Boolean);
  }, [activeBoard, cards, lists]);

  const boardLabels = useMemo(
    () => Object.values(labels).filter((item) => item.boardId === activeBoardId),
    [activeBoardId, labels]
  );

  const boardMembers = useMemo(
    () => Object.values(members).filter((item) => item.boardId === activeBoardId),
    [activeBoardId, members]
  );

  const boardCardCount = activeBoardCards.length;
  const boardListCount = activeBoard?.listIds.length ?? 0;
  const boardCreatedAt = activeBoard?.createdAt ? new Date(activeBoard.createdAt).toLocaleDateString() : 'Unknown';
  const boardVisibility = activeBoard?.visibility ?? 'workspace';
  const notificationItems = useMemo(() => buildNotificationItems(activeBoardCards), [activeBoardCards]);
  const unreadCount = notificationsRead ? 0 : notificationItems.length;

  const filteredBoards = useMemo(() => {
    const q = boardSearch.trim().toLowerCase();
    return boards.filter((board) => {
      const matches = !q || board.title.toLowerCase().includes(q) || (board.description ?? '').toLowerCase().includes(q);
      return matches;
    });
  }, [boards, boardSearch]);

  const recentBoards = filteredBoards.slice().reverse().slice(0, 6);
  const starred = filteredBoards.filter((board) => starredBoards.includes(board.id));
  const workspaceBoards = filteredBoards.filter((board) => board.visibility !== 'private');

  useEffect(() => {
    setDraftSearch(search);
  }, [search]);

  useEffect(() => {
    const handle = window.setTimeout(() => setSearch(draftSearch), 120);
    return () => window.clearTimeout(handle);
  }, [draftSearch, setSearch]);

  useEffect(() => {
    setNotificationsRead(false);
  }, [activeBoardId]);

  useEffect(() => {
    setDraftBoardTitle(activeBoard?.title ?? '');
    setIsEditingBoardTitle(false);
  }, [activeBoard?.title, activeBoardId]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenMenu(null);
        setOpenModal(null);
        setOpenConfirmation(null);
      }
    }

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      const root = rootRef.current;

      if (!target || (root && root.contains(target))) {
        return;
      }

      setOpenMenu(null);
      setOpenConfirmation(null);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
  }, [themeMode]);

  const labelOptions: Option[] = [{ value: 'all', label: 'All labels' }, ...boardLabels.map((label) => ({ value: label.id, label: label.name }))];
  const memberOptions: Option[] = [{ value: 'all', label: 'All members' }, ...boardMembers.map((member) => ({ value: member.id, label: member.name }))];

  function resetWorkspace() {
    setSearch('');
    setDraftSearch('');
    setLabelFilter(null);
    setMemberFilter(null);
    setDueDateFilter('all');
    setChecklistFilter('all');
    selectCard(null);
    setOpenMenu(null);
    setOpenModal(null);
    router.push('/');
  }

  function openBoard(boardId: string) {
    setActiveBoard(boardId);
    setOpenMenu(null);
    setNotificationsRead(false);
    router.push('/');
  }

  function requestBoardDelete(boardId: string) {
    setOpenMenu(null);
    setOpenConfirmation(boardId);
  }

  function confirmBoardDelete() {
    if (!openConfirmation) return;
    deleteBoard(openConfirmation);
    setOpenConfirmation(null);
    addToast({ kind: 'success', message: 'Board deleted.' });
  }

  function toggleStar(boardId: string) {
    setStarredBoards((current) => (current.includes(boardId) ? current.filter((id) => id !== boardId) : [...current, boardId]));
  }

  function cycleVisibility() {
    if (!activeBoard) return;
    const currentIndex = VISIBILITY_ORDER.indexOf(activeBoard.visibility);
    const next = VISIBILITY_ORDER[(currentIndex + 1) % VISIBILITY_ORDER.length];
    updateBoardVisibility(activeBoard.id, next);
    addToast({ kind: 'info', message: `Board visibility set to ${next}.` });
  }

  function commitBoardTitle() {
    if (!activeBoard) return;

    const nextTitle = draftBoardTitle.trim();
    if (!nextTitle || nextTitle === activeBoard.title) {
      setDraftBoardTitle(activeBoard.title);
      setIsEditingBoardTitle(false);
      return;
    }

    updateBoardTitle(activeBoard.id, nextTitle);
    setIsEditingBoardTitle(false);
  }

  function createFromQuickMenu(action: 'board' | 'list' | 'card' | 'background') {
    setOpenMenu(null);

    if (!activeBoard) return;

    if (action === 'board') {
      router.push('/boards?create=1');
      return;
    }

    if (action === 'list') {
      createList('New List');
      addToast({ kind: 'success', message: 'List created.' });
      return;
    }

    if (action === 'card') {
      const targetListId = activeBoard.listIds[0];
      if (!targetListId) return;
      createCard(targetListId, 'New card');
      addToast({ kind: 'success', message: 'Card created.' });
      return;
    }

    if (action === 'background') {
      backgroundInputRef.current?.click();
    }
  }

  function handleBackgroundUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !activeBoard) return;

    const url = URL.createObjectURL(file);
    updateBoardBackground(activeBoard.id, { kind: 'custom', value: url, overlay: 'rgba(2,6,23,0.30)' });
    addToast({ kind: 'success', message: 'Wallpaper updated.' });
    event.target.value = '';
  }

  function archiveCompletedCards() {
    let archived = 0;
    activeBoardCards.forEach((card) => {
      if (card.checklistItems.length > 0 && card.checklistItems.every((item) => item.completed) && !card.archived) {
        archiveCard(card.id);
        archived += 1;
      }
    });
    addToast({ kind: 'success', message: archived > 0 ? `Archived ${archived} completed cards.` : 'No completed cards to archive.' });
    setOpenModal(null);
  }

  function assignFirstLabel() {
    if (!activeBoard) return;
    const firstLabel = boardLabels[0];
    if (!firstLabel) {
      addToast({ kind: 'info', message: 'No labels exist on this board yet.' });
      return;
    }

    const card = activeBoardCards.find((entry) => entry.labelIds.length === 0);
    if (!card) {
      addToast({ kind: 'info', message: 'All cards already have labels.' });
      return;
    }

    updateCard(card.id, { labelIds: [firstLabel.id] });
    addToast({ kind: 'success', message: 'Assigned the first label to one unlabeled card.' });
    setOpenModal(null);
  }

  function addInviteMember() {
    if (!activeBoard) return;
    const name = inviteName.trim();
    if (!name) {
      addToast({ kind: 'error', message: 'Enter a member name to invite.' });
      return;
    }

    addMemberToBoard(activeBoard.id, {
      boardId: activeBoard.id,
      name,
      role: inviteRole,
      avatarUrl: undefined
    });
    setInviteName('');
    setInviteRole('Contributor');
    addToast({ kind: 'success', message: `${name} added to the board.` });
  }

  function toggleTheme() {
    setThemeMode((current) => (current === 'dark' ? 'light' : 'dark'));
    addToast({ kind: 'info', message: 'Theme preference updated.' });
  }

  function removeMember(memberId: string) {
    if (!activeBoard) return;
    removeMemberFromBoard(activeBoard.id, memberId);
    addToast({ kind: 'info', message: 'Member removed from board.' });
  }

  function handleBellClick() {
    setNotificationsRead((current) => !current);
    setOpenMenu((current) => (current === 'notifications' ? null : 'notifications'));
  }

  return (
    <motion.header
      ref={rootRef}
      className="sticky top-0 z-40 px-3 pt-3 md:px-4"
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <div className="rounded-2xl border border-white/10 bg-white/20 px-3 py-3 text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)] backdrop-blur-md md:px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={resetWorkspace}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 bg-white/20 px-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white/30"
            >
              <Home className="h-4 w-4" />
              Home
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu((current) => (current === 'boards' ? null : 'boards'))}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 bg-white/20 px-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white/30"
              >
                <LayoutGrid className="h-4 w-4" />
                Boards
              </button>
              <DropdownPanel open={openMenu === 'boards'} alignRight={false}>
                <div className="p-2">
                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      value={boardSearch}
                      onChange={(event) => setBoardSearch(event.target.value)}
                      placeholder="Search boards"
                      className="h-10 w-full rounded-md border border-[rgba(15,23,42,0.1)] bg-white pl-10 pr-3 text-sm text-[#0f172a] outline-none"
                    />
                  </label>
                  <SectionTitle>Starred</SectionTitle>
                  <BoardList boards={starred} activeBoardId={activeBoardId} onOpen={openBoard} starredBoards={starredBoards} onToggleStar={toggleStar} onDelete={requestBoardDelete} />
                  <SectionTitle>Recent</SectionTitle>
                  <BoardList boards={recentBoards} activeBoardId={activeBoardId} onOpen={openBoard} starredBoards={starredBoards} onToggleStar={toggleStar} onDelete={requestBoardDelete} />
                  <SectionTitle>Workspace boards</SectionTitle>
                  <BoardList boards={workspaceBoards} activeBoardId={activeBoardId} onOpen={openBoard} starredBoards={starredBoards} onToggleStar={toggleStar} onDelete={requestBoardDelete} />
                  <button type="button" onClick={() => createFromQuickMenu('board')} className="mt-2 flex h-10 w-full items-center justify-center rounded-md bg-[#61BD4F] px-3 text-sm font-semibold text-white">
                    Create new board
                  </button>
                </div>
              </DropdownPanel>
            </div>

            <label className="relative hidden min-w-[240px] flex-1 sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
              <input
                value={draftSearch}
                onChange={(event) => setDraftSearch(event.target.value)}
                placeholder="Search cards, labels, members..."
                className="h-10 w-full rounded-md border border-white/10 bg-white/20 pl-10 pr-10 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/55 focus:bg-white/30 focus:ring-2 focus:ring-white/20"
              />
              {draftSearch ? (
                <button
                  type="button"
                  onClick={() => {
                    setDraftSearch('');
                    setSearch('');
                  }}
                  className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white/80 hover:bg-white/25"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </label>
          </div>

          <div className="flex min-w-0 flex-wrap items-center justify-center gap-2">
            <span className="inline-flex h-8 items-center rounded-md bg-white/10 px-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">Trelloban</span>
            {isEditingBoardTitle ? (
              <input
                autoFocus
                value={draftBoardTitle}
                onChange={(event) => setDraftBoardTitle(event.target.value)}
                onBlur={commitBoardTitle}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    commitBoardTitle();
                  }

                  if (event.key === 'Escape' && activeBoard) {
                    setDraftBoardTitle(activeBoard.title);
                    setIsEditingBoardTitle(false);
                  }
                }}
                className="max-w-[220px] rounded-md border border-white/20 bg-white/15 px-2 py-1 text-base font-semibold text-white outline-none placeholder:text-white/50 sm:text-[18px]"
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!activeBoard) return;
                  setDraftBoardTitle(activeBoard.title);
                  setIsEditingBoardTitle(true);
                }}
                className="max-w-[220px] truncate text-left text-base font-semibold text-white sm:text-[18px]"
              >
                {activeBoard?.title ?? 'Board'}
              </button>
            )}
            <button type="button" onClick={() => activeBoard && toggleStar(activeBoard.id)} className="inline-flex h-8 items-center gap-1 rounded-md border border-white/10 bg-white/20 px-2.5 text-xs font-medium text-white transition-all duration-200 hover:bg-white/30">
              <Star className={`h-3.5 w-3.5 ${starredBoards.includes(activeBoard?.id ?? '') ? 'fill-current' : ''}`} />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (activeBoard) {
                    cycleVisibility();
                  }
                }}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-white/10 bg-white/20 px-3 text-xs font-medium text-white transition-all duration-200 hover:bg-white/30"
                title="Cycle board visibility"
              >
                <Shield className="h-3.5 w-3.5" />
                {boardVisibility[0].toUpperCase() + boardVisibility.slice(1)}
              </button>
            </div>
            <div className="flex items-center -space-x-2">
              {boardMembers.slice(0, 4).map((member) => (
                <span key={member.id} className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/25 bg-[#172B4D]/70 text-[10px] font-semibold uppercase text-white shadow-sm">
                  {member.name
                    .split(' ')
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join('')}
                </span>
              ))}
            </div>
            <button type="button" onClick={() => setOpenModal('invite')} className="inline-flex h-8 items-center rounded-md border border-white/10 bg-white/20 px-3 text-xs font-medium text-white transition-all duration-200 hover:bg-white/30">
              <Users className="mr-1.5 h-3.5 w-3.5" /> Invite
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="relative">
              <button type="button" onClick={() => setOpenMenu((current) => (current === 'create' ? null : 'create'))} className="inline-flex h-10 items-center gap-1 rounded-md border border-white/10 bg-white/20 px-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white/30">
                <Plus className="h-4 w-4" />
              </button>
              <DropdownPanel open={openMenu === 'create'} alignRight>
                <SimpleAction label="Create Board" icon={<LayoutGrid className="h-4 w-4" />} onClick={() => createFromQuickMenu('board')} />
                <SimpleAction label="Create List" icon={<Plus className="h-4 w-4" />} onClick={() => createFromQuickMenu('list')} />
                <SimpleAction label="Create Card" icon={<Plus className="h-4 w-4" />} onClick={() => createFromQuickMenu('card')} />
                <SimpleAction label="Upload Background" icon={<Upload className="h-4 w-4" />} onClick={() => createFromQuickMenu('background')} />
              </DropdownPanel>
            </div>

            <button type="button" onClick={() => setOpenModal('info')} className="inline-flex h-10 items-center gap-1 rounded-md border border-white/10 bg-white/20 px-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white/30">
              <Info className="h-4 w-4" />
            </button>
            <div className="relative">
              <button type="button" onClick={() => setOpenMenu((current) => (current === 'filters' ? null : 'filters'))} className="inline-flex h-10 items-center gap-1 rounded-md border border-white/10 bg-white/20 px-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white/30">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>
              <DropdownPanel open={openMenu === 'filters'} alignRight>
                <div className="space-y-3 p-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">Label</span>
                    <select value={labelFilter ?? 'all'} onChange={(event) => setLabelFilter(event.target.value === 'all' ? null : event.target.value)} className="h-10 w-full rounded-md border border-[rgba(15,23,42,0.1)] bg-white px-3 text-sm text-[#0f172a]">
                      {labelOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">Member</span>
                    <select value={memberFilter ?? 'all'} onChange={(event) => setMemberFilter(event.target.value === 'all' ? null : event.target.value)} className="h-10 w-full rounded-md border border-[rgba(15,23,42,0.1)] bg-white px-3 text-sm text-[#0f172a]">
                      {memberOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">Due date</span>
                    <select value={dueDateFilter} onChange={(event) => setDueDateFilter(event.target.value as typeof dueDateFilter)} className="h-10 w-full rounded-md border border-[rgba(15,23,42,0.1)] bg-white px-3 text-sm text-[#0f172a]">
                      <option value="all">All due states</option>
                      <option value="overdue">Overdue</option>
                      <option value="today">Due today</option>
                      <option value="week">Due this week</option>
                      <option value="completed">Completed due dates</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">Checklist</span>
                    <select value={checklistFilter} onChange={(event) => setChecklistFilter(event.target.value as typeof checklistFilter)} className="h-10 w-full rounded-md border border-[rgba(15,23,42,0.1)] bg-white px-3 text-sm text-[#0f172a]">
                      <option value="all">Any checklist state</option>
                      <option value="completed">Checklist complete</option>
                      <option value="incomplete">Checklist incomplete</option>
                    </select>
                  </label>
                  <button type="button" onClick={resetWorkspace} className="h-10 w-full rounded-md bg-[#172B4D] px-3 text-sm font-semibold text-white">
                    Clear filters
                  </button>
                </div>
              </DropdownPanel>
            </div>
            <button type="button" onClick={handleBellClick} className="relative inline-flex h-10 items-center gap-1 rounded-md border border-white/10 bg-white/20 px-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white/30">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 ? <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white">{unreadCount}</span> : null}
            </button>
            <button type="button" onClick={() => setOpenModal('butler')} className="inline-flex h-10 items-center gap-1 rounded-md border border-white/10 bg-black/25 px-3 text-sm font-medium text-white transition-all duration-200 hover:bg-black/35">
              <Sparkles className="h-4 w-4" />
              Butler
            </button>
            <button type="button" onClick={() => router.push('/calendar')} className="inline-flex h-10 items-center gap-1 rounded-md border border-white/10 bg-white/20 px-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white/30">
              <CalendarDays className="h-4 w-4" />
              Calendar
            </button>
            <button type="button" onClick={() => setOpenModal('drawer')} className="inline-flex h-10 items-center gap-1 rounded-md border border-white/10 bg-white/20 px-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white/30">
              <MoreHorizontal className="h-4 w-4" />
              Show Menu
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu((current) => (current === 'profile' ? null : 'profile'))}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 bg-white/20 px-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white/30"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#172B4D]/80 text-[11px] font-semibold">A</span>
                Alex <ChevronDown className="h-4 w-4" />
              </button>
              <DropdownPanel open={openMenu === 'profile'} alignRight>
                <SimpleAction label="Profile" onClick={() => { addToast({ kind: 'info', message: 'Profile controls are demo scoped.' }); setOpenMenu(null); }} />
                <SimpleAction label="Appearance" icon={<SunMoonIcon themeMode={themeMode} />} onClick={() => { toggleTheme(); setOpenMenu(null); }} />
                <SimpleAction label="Wallpaper settings" icon={<Settings className="h-4 w-4" />} onClick={() => { setOpenModal('drawer'); setOpenMenu(null); }} />
                <SimpleAction label="Logout" icon={<Trash2 className="h-4 w-4" />} onClick={() => { addToast({ kind: 'info', message: 'Logout is mocked in this assignment.' }); setOpenMenu(null); }} />
              </DropdownPanel>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/80">
          {search ? <Pill label={`Search: ${search}`} /> : null}
          {labelFilter ? <Pill label={`Label: ${labels[labelFilter]?.name ?? 'Selected'}`} /> : null}
          {memberFilter ? <Pill label={`Member: ${members[memberFilter]?.name ?? 'Selected'}`} /> : null}
          {dueDateFilter !== 'all' ? <Pill label={`Due: ${dueDateFilter}`} /> : null}
          {checklistFilter !== 'all' ? <Pill label={`Checklist: ${checklistFilter}`} /> : null}
        </div>
      </div>

      <AnimatePresence>
        {openMenu === 'notifications' ? (
          <FloatingPanel alignRight onClose={() => setOpenMenu(null)} title="Notifications">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#172B4D]">Notifications</p>
                <p className="text-xs text-[#64748b]">{notificationsRead ? 'Marked as read' : 'Unread activity'} · {notificationItems.length} items</p>
              </div>
              <button type="button" onClick={() => setNotificationsRead(true)} className="rounded-md bg-[#172B4D] px-3 py-2 text-xs font-medium text-white">Mark as read</button>
            </div>
            <div className="max-h-[380px] space-y-2 overflow-y-auto pr-1">
              {notificationItems.map((item) => (
                <div key={item.id} className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-white p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-[#172B4D]">{item.title}</p>
                    <span className="text-[11px] text-[#64748b]">{item.timestamp}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#64748b]">{item.subtitle}</p>
                </div>
              ))}
            </div>
          </FloatingPanel>
        ) : null}

        {openModal === 'info' ? (
          <CenteredModal title="Board info" onClose={() => setOpenModal(null)}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Stat label="Title" value={activeBoard?.title ?? 'Board'} />
              <Stat label="Visibility" value={boardVisibility} />
              <Stat label="Created" value={boardCreatedAt} />
              <Stat label="Lists" value={String(boardListCount)} />
              <Stat label="Cards" value={String(boardCardCount)} />
              <Stat label="Members" value={String(boardMembers.length)} />
            </div>
            <div className="mt-4 rounded-xl border border-[rgba(15,23,42,0.08)] bg-slate-50 p-3 text-sm text-[#334155]">
              {activeBoard?.description ?? 'Workspace board details and statistics.'}
            </div>
          </CenteredModal>
        ) : null}

        {openModal === 'invite' ? (
          <CenteredModal title="Invite members" onClose={() => setOpenModal(null)}>
            <div className="grid gap-3 md:grid-cols-[1.1fr_0.8fr]">
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">Name</label>
                <input value={inviteName} onChange={(event) => setInviteName(event.target.value)} placeholder="Add a teammate" className="h-11 w-full rounded-lg border border-[rgba(15,23,42,0.12)] px-3 text-sm text-[#0f172a] outline-none" />
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">Role</label>
                <input value={inviteRole} onChange={(event) => setInviteRole(event.target.value)} placeholder="Contributor" className="h-11 w-full rounded-lg border border-[rgba(15,23,42,0.12)] px-3 text-sm text-[#0f172a] outline-none" />
                <button type="button" onClick={addInviteMember} className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#61BD4F] px-4 text-sm font-semibold text-white">Add member</button>
              </div>
              <div className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-white p-3">
                <p className="mb-2 text-sm font-semibold text-[#172B4D]">Current members</p>
                <div className="space-y-2">
                  {boardMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-[#172B4D]">{member.name}</p>
                        <p className="text-xs text-[#64748b]">{member.role}</p>
                      </div>
                      <button type="button" onClick={() => removeMember(member.id)} className="rounded-md p-2 text-[#64748b] hover:bg-white">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CenteredModal>
        ) : null}

        {openModal === 'butler' ? (
          <CenteredModal title="Butler automation" onClose={() => setOpenModal(null)}>
            <div className="space-y-3">
              <ActionCard title="Archive completed cards" description="Automatically archive cards with completed checklists." icon={<Archive className="h-4 w-4" />} onClick={archiveCompletedCards} />
              <ActionCard title="Auto assign first label" description="Give the first unlabelled card the first board label." icon={<Shield className="h-4 w-4" />} onClick={assignFirstLabel} />
              <ActionCard title="Due date reminders" description="Send an in-app reminder for cards due today." icon={<Bell className="h-4 w-4" />} onClick={() => addToast({ kind: 'info', message: 'Due date reminders enabled for this board.' })} />
            </div>
          </CenteredModal>
        ) : null}

        {openModal === 'drawer' ? (
          <FloatingPanel title="Board menu" onClose={() => setOpenModal(null)}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-[#172B4D]">Board menu</p>
                <p className="text-xs text-[#64748b]">Activity, backgrounds, labels, and stats</p>
              </div>
              <button type="button" onClick={() => setOpenModal(null)} className="rounded-md p-2 text-[#64748b] hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <section className="space-y-4">
              <div className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-white p-3">
                <p className="text-sm font-semibold text-[#172B4D]">Board stats</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-[#334155]">
                  <Stat label="Lists" value={String(boardListCount)} compact />
                  <Stat label="Cards" value={String(boardCardCount)} compact />
                  <Stat label="Members" value={String(boardMembers.length)} compact />
                  <Stat label="Visibility" value={boardVisibility} compact />
                </div>
              </div>

              <div className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-white p-3">
                <p className="text-sm font-semibold text-[#172B4D]">Background settings</p>
                <div className="mt-3">
                  <BackgroundSelector onClose={() => setOpenModal(null)} />
                </div>
                <input ref={backgroundInputRef} type="file" accept="image/*" onChange={handleBackgroundUpload} className="hidden" />
              </div>

              <div className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-white p-3">
                <p className="text-sm font-semibold text-[#172B4D]">Labels</p>
                <div className="mt-2 space-y-2">
                  {boardLabels.map((label) => (
                    <div key={label.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-[#334155]">
                      <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: label.color }} />{label.name}</span>
                      <span className="text-xs text-[#64748b]">{label.id}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-white p-3">
                <p className="text-sm font-semibold text-[#172B4D]">Recent activity</p>
                <div className="mt-2 space-y-2">
                  {activeBoardCards.slice(0, 4).map((card) => (
                    <div key={card.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-[#334155]">
                      {card.title}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </FloatingPanel>
        ) : null}

        {openConfirmation ? (
          <CenteredModal title="Delete board" onClose={() => setOpenConfirmation(null)}>
            <div className="space-y-4">
              <p className="text-sm text-[#334155]">Delete this board permanently?</p>
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setOpenConfirmation(null)} className="rounded-md border border-[rgba(15,23,42,0.12)] bg-white px-4 py-2 text-sm font-medium text-[#334155]">
                  Cancel
                </button>
                <button type="button" onClick={confirmBoardDelete} className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white">
                  Delete
                </button>
              </div>
            </div>
          </CenteredModal>
        ) : null}
      </AnimatePresence>

      <input ref={backgroundInputRef} type="file" accept="image/*" onChange={handleBackgroundUpload} className="hidden" />
    </motion.header>
  );
}

function buildNotificationItems(cards: Array<{ id: string; title: string; dueDate?: string | null; dueCompleted?: boolean; comments: Array<{ id: string }>; archived: boolean }>) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return cards
    .filter((card) => !card.archived)
    .flatMap((card) => {
      const items: Array<{ id: string; title: string; subtitle: string; timestamp: string }> = [];

      if (card.dueDate && !card.dueCompleted) {
        const due = new Date(card.dueDate);
        if (!Number.isNaN(due.getTime())) {
          const subtitle = due < today ? 'Overdue' : due.toDateString() === today.toDateString() ? 'Due today' : 'Upcoming due date';
          items.push({ id: `${card.id}-due`, title: card.title, subtitle, timestamp: due.toLocaleDateString() });
        }
      }

      if (card.comments.length > 0) {
        items.push({ id: `${card.id}-comment`, title: card.title, subtitle: `${card.comments.length} comments`, timestamp: 'Recent' });
      }

      return items;
    })
    .slice(0, 8);
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 px-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">{children}</p>;
}

function BoardList({ boards, activeBoardId, onOpen, starredBoards, onToggleStar, onDelete }: { boards: Array<{ id: string; title: string; description?: string; listIds: string[]; memberIds: string[]; visibility: BoardVisibility }>; activeBoardId: string; onOpen: (boardId: string) => void; starredBoards: string[]; onToggleStar: (boardId: string) => void; onDelete: (boardId: string) => void; }) {
  return (
    <div className="mt-2 space-y-1">
      {boards.length === 0 ? <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-[#64748b]">No boards found.</p> : null}
      {boards.map((board) => (
        <div key={board.id} className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition ${board.id === activeBoardId ? 'bg-[#172B4D]/10 text-[#172B4D]' : 'hover:bg-slate-50 text-[#334155]'}`}>
          <button type="button" onClick={() => onOpen(board.id)} className="min-w-0 flex-1 text-left">
            <span className="block truncate font-medium">{board.title}</span>
            <span className="block text-xs text-[#64748b]">{board.listIds.length} lists · {board.visibility}</span>
          </button>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => onToggleStar(board.id)} className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${starredBoards.includes(board.id) ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
              <Star className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => onDelete(board.id)} className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-500 hover:text-rose-600">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function DropdownPanel({ open, children, alignRight = false }: { open: boolean; children: React.ReactNode; alignRight?: boolean }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 5, scale: 0.98 }}
          transition={{ duration: 0.14, ease: 'easeOut' }}
          className={`absolute top-[calc(100%+0.4rem)] z-50 min-w-[320px] max-w-[min(92vw,420px)] max-h-[70vh] overflow-y-auto overflow-x-hidden rounded-xl border border-[rgba(15,23,42,0.08)] bg-white p-2 shadow-[0_14px_30px_rgba(15,23,42,0.14)] ${alignRight ? 'right-0' : 'left-0'}`}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function FloatingPanel({ title, alignRight = false, onClose, children }: { title: string; alignRight?: boolean; onClose: () => void; children: React.ReactNode; }) {
  return (
    <motion.div className="fixed inset-0 z-[90] flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button type="button" aria-label={`Close ${title}`} className="flex-1 bg-black/35 backdrop-blur-[2px]" onClick={onClose} />
      <motion.aside
        initial={{ x: 24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 24, opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className={`h-screen max-h-screen w-[min(92vw,420px)] overflow-y-auto overflow-x-hidden bg-[#f8fafc] p-4 shadow-[0_30px_80px_rgba(15,23,42,0.22)] ${alignRight ? 'ml-auto' : ''}`}
      >
        {children}
      </motion.aside>
    </motion.div>
  );
}

function CenteredModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode; }) {
  return (
    <motion.div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ scale: 0.96, y: 12, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, y: 12, opacity: 0 }} transition={{ duration: 0.18, ease: 'easeOut' }} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.24)]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-xl font-semibold text-[#0f172a]">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-[#64748b] hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function Stat({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className={`rounded-lg border border-[rgba(15,23,42,0.08)] bg-slate-50 p-3 ${compact ? 'p-2' : ''}`}>
      <p className="text-[11px] uppercase tracking-[0.12em] text-[#64748b]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#172B4D]">{value}</p>
    </div>
  );
}

function ActionCard({ title, description, icon, onClick }: { title: string; description: string; icon: React.ReactNode; onClick: () => void; }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-start gap-3 rounded-xl border border-[rgba(15,23,42,0.08)] bg-white p-3 text-left transition hover:bg-slate-50">
      <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#172B4D] text-white">{icon}</span>
      <span>
        <span className="block text-sm font-semibold text-[#172B4D]">{title}</span>
        <span className="block text-xs text-[#64748b]">{description}</span>
      </span>
    </button>
  );
}

function SunMoonIcon({ themeMode }: { themeMode: 'dark' | 'light' }) {
  return themeMode === 'dark' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />;
}

function Pill({ label }: { label: string }) {
  return <span className="inline-flex h-7 items-center rounded-full bg-[#6d5df6]/10 px-2.5 text-xs font-medium text-[#4f46e5]">{label}</span>;
}

function SimpleAction({ label, onClick, icon }: { label: string; onClick: () => void; icon?: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm text-[#334155] transition hover:bg-slate-100">
      {icon}
      {label}
    </button>
  );
}
