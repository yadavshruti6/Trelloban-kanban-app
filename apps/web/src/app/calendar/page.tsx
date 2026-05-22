"use client";

import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { CardModal } from '@/components/card-modal';
import { useKanbanStore } from '@/store/use-kanban-store';

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function addDays(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function CalendarPage() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [mode, setMode] = useState<'month' | 'week' | 'day'>('month');
  const [createDate, setCreateDate] = useState<Date | null>(null);
  const [dueDateDraft, setDueDateDraft] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const cards = useKanbanStore((state) => state.cards);
  const lists = useKanbanStore((state) => state.lists);
  const boards = useKanbanStore((state) => state.boards);
  const labels = useKanbanStore((state) => state.labels);
  const members = useKanbanStore((state) => state.members);
  const activeBoardId = useKanbanStore((state) => state.activeBoardId);
  const createCard = useKanbanStore((state) => state.createCard);
  const updateCard = useKanbanStore((state) => state.updateCard);
  const selectCard = useKanbanStore((state) => state.selectCard);
  const selectedCardId = useKanbanStore((state) => state.selectedCardId);
  const addToast = useKanbanStore((state) => state.addToast);

  const activeBoard = boards.find((board) => board.id === activeBoardId);
  const activeLabels = Object.values(labels).filter((label) => label.boardId === activeBoardId);
  const activeMembers = Object.values(members).filter((member) => member.boardId === activeBoardId);

  const events = useMemo(
    () =>
      Object.values(cards)
        .filter((card) => card.dueDate)
        .filter((card) => {
          const list = lists[card.listId];
          return list?.boardId === activeBoardId && !card.archived;
        })
        .map((card) => ({
          id: card.id,
          title: card.title,
          dueDate: new Date(card.dueDate as string),
          card
        }))
        .filter((item) => !Number.isNaN(item.dueDate.getTime())),
    [activeBoardId, cards, lists]
  );

  const monthDays = useMemo(() => {
    const first = startOfMonth(month);
    const start = startOfWeek(first);
    return Array.from({ length: 42 }, (_, index) => addDays(start, index));
  }, [month]);

  const weekDays = useMemo(() => {
    const first = startOfWeek(month);
    return Array.from({ length: 7 }, (_, index) => addDays(first, index));
  }, [month]);

  const dayList = mode === 'day' ? [month] : mode === 'week' ? weekDays : monthDays;

  const monthLabel = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const today = new Date();

  function eventsForDate(date: Date) {
    return events.filter((event) => event.dueDate.toDateString() === date.toDateString());
  }

  function handleDragEnd(event: DragEndEvent) {
    const cardId = event.active?.id ? String(event.active.id) : null;
    const dateKey = event.over?.id ? String(event.over.id) : null;
    if (!cardId || !dateKey) return;

    updateCard(cardId, { dueDate: dateKey, dueCompleted: false });
    addToast({ kind: 'success', message: 'Card due date updated.' });
  }

  function createTaskFromDate() {
    if (!createDate || !activeBoard || title.trim() === '') {
      addToast({ kind: 'error', message: 'Add a task title to continue.' });
      return;
    }

    const dueDate = dueDateDraft || isoDate(createDate);
    const targetListId = activeBoard.listIds[0];
    if (!targetListId) {
      addToast({ kind: 'error', message: 'This board has no lists.' });
      return;
    }

    const createdCardId = createCard(targetListId, title.trim());
    if (createdCardId) {
      updateCard(createdCardId, {
        description,
        dueDate,
        dueCompleted: false,
        labelIds: selectedLabelIds,
        memberIds: selectedMemberIds
      });
      selectCard(createdCardId);
    }

    setCreateDate(null);
    setDueDateDraft('');
    setTitle('');
    setDescription('');
    setSelectedLabelIds([]);
    setSelectedMemberIds([]);
    addToast({ kind: 'success', message: 'Task created from calendar.' });
  }

  function openCreateModal(date: Date) {
    setCreateDate(date);
    setDueDateDraft(isoDate(date));
  }

  function moveCalendar(amount: number) {
    if (mode === 'month') {
      setMonth((current) => addMonths(current, amount));
      return;
    }

    setMonth((current) => addDays(current, mode === 'week' ? amount * 7 : amount));
  }

  return (
    <AppShell>
      <section className="mx-auto w-full max-w-[1180px] rounded-2xl border border-white/10 bg-white/12 p-3 shadow-[0_14px_32px_rgba(15,23,42,0.1)] backdrop-blur-md md:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => moveCalendar(-1)} className="rounded-lg border border-[rgba(15,23,42,0.12)] bg-white p-1.5 text-[#475569] hover:bg-slate-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setMonth(new Date())} className="rounded-lg border border-[rgba(15,23,42,0.12)] bg-white px-3 py-1.5 text-sm font-medium text-[#334155] hover:bg-slate-50">
              Today
            </button>
            <button type="button" onClick={() => moveCalendar(1)} className="rounded-lg border border-[rgba(15,23,42,0.12)] bg-white p-1.5 text-[#475569] hover:bg-slate-50">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <h2 className="text-lg font-semibold text-white md:text-xl">{monthLabel}</h2>

          <div className="inline-flex rounded-lg border border-[rgba(15,23,42,0.12)] bg-slate-50 p-1">
            <button type="button" onClick={() => setMode('month')} className={`rounded px-2.5 py-1 text-xs font-semibold ${mode === 'month' ? 'bg-white text-[#0f172a] shadow-sm' : 'text-[#64748b]'}`}>
              Month
            </button>
            <button type="button" onClick={() => setMode('week')} className={`rounded px-2.5 py-1 text-xs font-semibold ${mode === 'week' ? 'bg-white text-[#0f172a] shadow-sm' : 'text-[#64748b]'}`}>
              Week
            </button>
            <button type="button" onClick={() => setMode('day')} className={`rounded px-2.5 py-1 text-xs font-semibold ${mode === 'day' ? 'bg-white text-[#0f172a] shadow-sm' : 'text-[#64748b]'}`}>
              Day
            </button>
          </div>
        </div>

        <DndContext onDragEnd={handleDragEnd}>
          <div className="overflow-hidden rounded-xl border border-[rgba(15,23,42,0.08)]">
            <div className={`grid ${mode === 'day' ? 'grid-cols-1' : 'grid-cols-7'} border-b border-[rgba(15,23,42,0.08)] bg-[#f8fafc] text-xs font-semibold uppercase tracking-[0.12em] text-[#64748b]`}>
              {(mode === 'day' ? [month.toLocaleDateString(undefined, { weekday: 'long' })] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map((day) => (
                <div key={day} className="border-r border-[rgba(15,23,42,0.08)] px-2.5 py-2 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            <div className={`grid ${mode === 'day' ? 'grid-cols-1' : mode === 'week' ? 'grid-cols-7' : 'grid-cols-7'}`}>
              {dayList.map((date) => {
                const inMonth = date.getMonth() === month.getMonth();
                const dayEvents = eventsForDate(date);
                const isToday = date.toDateString() === today.toDateString();
                const dayKey = isoDate(date);

                return (
                  <CalendarDayCell
                    key={date.toISOString()}
                    date={date}
                    inMonth={inMonth}
                    isToday={isToday}
                    events={dayEvents}
                    dayKey={dayKey}
                    onCreate={() => openCreateModal(date)}
                    onOpenCard={(cardId) => selectCard(cardId)}
                  />
                );
              })}
            </div>
          </div>
        </DndContext>
      </section>

      {createDate ? (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-[rgba(15,23,42,0.12)] bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#0f172a]">Create task</h3>
              <button type="button" onClick={() => setCreateDate(null)} className="rounded-md p-1 text-[#64748b] hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Task title" className="h-11 w-full rounded-lg border border-[rgba(15,23,42,0.12)] px-3 text-sm text-[#0f172a] outline-none" />
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" className="min-h-20 w-full rounded-lg border border-[rgba(15,23,42,0.12)] p-3 text-sm text-[#0f172a] outline-none" />
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">Due date</span>
                <input type="date" value={dueDateDraft} onChange={(event) => setDueDateDraft(event.target.value)} className="h-10 w-full rounded-lg border border-[rgba(15,23,42,0.12)] px-3 text-sm text-[#0f172a]" />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-[rgba(15,23,42,0.12)] p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">Labels</p>
                  <div className="mt-2 space-y-2">
                  {activeLabels.map((label) => (
                    <label key={label.id} className="flex items-center gap-2 text-sm text-[#334155]">
                      <input
                        type="checkbox"
                        checked={selectedLabelIds.includes(label.id)}
                        onChange={(event) => setSelectedLabelIds((current) => (event.target.checked ? [...current, label.id] : current.filter((id) => id !== label.id)))}
                      />
                      <span className="inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold text-white" style={{ backgroundColor: label.color }}>{label.name}</span>
                    </label>
                  ))}
                  </div>
                </div>
                <div className="rounded-lg border border-[rgba(15,23,42,0.12)] p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">Members</p>
                  <div className="mt-2 space-y-2">
                  {activeMembers.map((member) => (
                    <label key={member.id} className="flex items-center gap-2 text-sm text-[#334155]">
                      <input
                        type="checkbox"
                        checked={selectedMemberIds.includes(member.id)}
                        onChange={(event) => setSelectedMemberIds((current) => (event.target.checked ? [...current, member.id] : current.filter((id) => id !== member.id)))}
                      />
                      {member.name}
                    </label>
                  ))}
                  </div>
                </div>
              </div>
            </div>

            <button type="button" onClick={createTaskFromDate} className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#61BD4F] text-sm font-semibold text-white">
              Save task
            </button>
          </div>
        </div>
      ) : null}

      {selectedCardId ? <CardModal cardId={selectedCardId} onClose={() => selectCard(null)} /> : null}
    </AppShell>
  );
}

function CalendarDayCell({
  date,
  inMonth,
  isToday,
  events,
  dayKey,
  onCreate,
  onOpenCard
}: {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  events: Array<{ id: string; title: string; dueDate: Date }>;
  dayKey: string;
  onCreate: () => void;
  onOpenCard: (cardId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: dayKey });

  return (
    <div ref={setNodeRef} className={`min-h-[108px] border-b border-r border-[rgba(15,23,42,0.08)] bg-white p-2 last:border-r-0 md:min-h-[120px] ${isOver ? 'ring-2 ring-inset ring-[#6d5df6]/30' : ''}`}>
      <div className="flex items-center justify-between">
        <p className={`inline-flex h-[26px] w-[26px] items-center justify-center rounded-full text-[11px] font-semibold ${isToday ? 'bg-[#6d5df6] text-white' : inMonth ? 'text-[#0f172a]' : 'text-[#94a3b8]'}`}>
          {date.getDate()}
        </p>
        <button type="button" onClick={onCreate} className="inline-flex h-[22px] w-[22px] items-center justify-center rounded bg-slate-100 text-[#64748b] hover:bg-slate-200">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-1.5 space-y-1">
        {events.slice(0, 4).map((event, index) => (
          <CalendarEventChip key={event.id} event={event} index={index} onOpen={() => onOpenCard(event.id)} />
        ))}
        {events.length > 4 ? <p className="text-[11px] text-[#64748b]">+{events.length - 4} more</p> : null}
      </div>
    </div>
  );
}

function CalendarEventChip({ event, index, onOpen }: { event: { id: string; title: string }; index: number; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    data: { type: 'calendar-card' }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      onClick={onOpen}
      {...attributes}
      {...listeners}
      className={`w-full truncate rounded-md px-2 py-0.5 text-left text-[10px] font-medium ${index % 3 === 0 ? 'bg-violet-100 text-violet-700' : index % 3 === 1 ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'}`}
    >
      {event.title}
    </button>
  );
}
