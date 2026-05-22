"use client";

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { useKanbanStore } from '@/store/use-kanban-store';

export default function FiltersPage() {
  const router = useRouter();
  const boards = useKanbanStore((state) => state.boards);
  const lists = useKanbanStore((state) => state.lists);
  const cards = useKanbanStore((state) => state.cards);
  const labels = useKanbanStore((state) => state.labels);
  const members = useKanbanStore((state) => state.members);
  const activeBoardId = useKanbanStore((state) => state.activeBoardId);
  const setActiveBoard = useKanbanStore((state) => state.setActiveBoard);
  const selectCard = useKanbanStore((state) => state.selectCard);

  const [query, setQuery] = useState('');
  const [activeLabelIds, setActiveLabelIds] = useState<string[]>([]);
  const [activeMemberIds, setActiveMemberIds] = useState<string[]>([]);
  const [dueFilter, setDueFilter] = useState<'all' | 'due' | 'none' | 'overdue' | 'completed'>('all');
  const [checklistFilter, setChecklistFilter] = useState<'all' | 'complete' | 'incomplete'>('all');

  const board = boards.find((entry) => entry.id === activeBoardId);
  const boardLabelOptions = board?.labelIds.map((id) => labels[id]).filter(Boolean) ?? [];
  const boardMemberOptions = board?.memberIds.map((id) => members[id]).filter(Boolean) ?? [];

  const results = useMemo(() => {
    if (!board) {
      return [];
    }

    return board.listIds
      .flatMap((listId) => {
        const list = lists[listId];
        if (!list) {
          return [];
        }

        return list.cardIds
          .map((cardId) => cards[cardId])
          .filter(Boolean)
          .filter((card) => {
            if (query && !`${card.title} ${card.description ?? ''}`.toLowerCase().includes(query.toLowerCase())) {
              return false;
            }

            if (activeLabelIds.length > 0 && !activeLabelIds.every((labelId) => card.labelIds.includes(labelId))) {
              return false;
            }

            if (activeMemberIds.length > 0 && !activeMemberIds.every((memberId) => card.memberIds.includes(memberId))) {
              return false;
            }

            if (dueFilter === 'due' && !card.dueDate) {
              return false;
            }

            if (dueFilter === 'none' && card.dueDate) {
              return false;
            }

            if (dueFilter === 'overdue') {
              const due = card.dueDate ? new Date(card.dueDate) : null;
              if (!due || card.dueCompleted || due >= new Date()) {
                return false;
              }
            }

            if (dueFilter === 'completed' && !card.dueCompleted) {
              return false;
            }

            if (checklistFilter === 'complete' && card.checklistItems.length > 0 && !card.checklistItems.every((item) => item.completed)) {
              return false;
            }

            if (checklistFilter === 'incomplete' && card.checklistItems.length > 0 && card.checklistItems.every((item) => item.completed)) {
              return false;
            }

            return true;
          })
          .map((card) => ({ card, listTitle: list.title }));
      });
  }, [activeLabelIds, activeMemberIds, board, cards, checklistFilter, dueFilter, lists, query]);

  return (
    <AppShell>
      <section className="grid gap-4 xl:grid-cols-[300px_1fr]">
        <aside className="rounded-2xl border border-black/10 bg-white p-4 shadow-[0_20px_45px_rgba(9,30,66,0.12)]">
          <h2 className="text-lg font-semibold text-[#172b4d]">Filters & Search</h2>

          <div className="mt-4 space-y-4">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#626f86]" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search cards..." className="h-10 w-full rounded-lg border border-black/10 pl-9 pr-3 text-sm text-[#172b4d]" />
            </label>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#626f86]">Labels</p>
              <div className="mt-2 space-y-2">
                {boardLabelOptions.map((label) => (
                  <label key={label.id} className="flex items-center gap-2 text-sm text-[#44546f]">
                    <input
                      type="checkbox"
                      checked={activeLabelIds.includes(label.id)}
                      onChange={(event) => setActiveLabelIds((current) => (event.target.checked ? [...current, label.id] : current.filter((id) => id !== label.id)))}
                    />
                    <span className="inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold" style={{ backgroundColor: `${label.color}33`, color: label.color }}>
                      {label.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#626f86]">Members</p>
              <div className="mt-2 space-y-2">
                {boardMemberOptions.map((member) => (
                  <label key={member.id} className="flex items-center gap-2 text-sm text-[#44546f]">
                    <input
                      type="checkbox"
                      checked={activeMemberIds.includes(member.id)}
                      onChange={(event) => setActiveMemberIds((current) => (event.target.checked ? [...current, member.id] : current.filter((id) => id !== member.id)))}
                    />
                    {member.name}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#626f86]">Due Date</p>
              <div className="mt-2 space-y-2 text-sm text-[#44546f]">
                {[
                  { value: 'all', label: 'All cards' },
                  { value: 'due', label: 'Cards with due date' },
                  { value: 'none', label: 'Cards without due date' },
                  { value: 'overdue', label: 'Overdue cards' },
                  { value: 'completed', label: 'Completed cards' }
                ].map((item) => (
                  <label key={item.value} className="flex items-center gap-2">
                    <input type="radio" name="dueFilter" checked={dueFilter === item.value} onChange={() => setDueFilter(item.value as 'all' | 'due' | 'none' | 'overdue' | 'completed')} />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#626f86]">Checklist</p>
              <div className="mt-2 space-y-2 text-sm text-[#44546f]">
                {[
                  { value: 'all', label: 'Any checklist state' },
                  { value: 'complete', label: 'Checklist complete' },
                  { value: 'incomplete', label: 'Checklist incomplete' }
                ].map((item) => (
                  <label key={item.value} className="flex items-center gap-2">
                    <input type="radio" name="checklistFilter" checked={checklistFilter === item.value} onChange={() => setChecklistFilter(item.value as 'all' | 'complete' | 'incomplete')} />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-[0_20px_45px_rgba(9,30,66,0.12)]">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#172b4d]">Results</h3>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setActiveLabelIds([]);
                setActiveMemberIds([]);
                setDueFilter('all');
                setChecklistFilter('all');
              }}
              className="text-xs font-medium text-[#7c3aed]"
            >
              Clear filters
            </button>
          </div>

          <div className="space-y-2">
            {results.map(({ card, listTitle }) => (
              <button
                key={card.id}
                type="button"
                onClick={() => {
                  setActiveBoard(activeBoardId);
                  selectCard(card.id);
                  router.push('/');
                }}
                className="flex w-full flex-col gap-1 rounded-lg border border-black/10 px-3 py-2 text-left transition hover:bg-slate-50"
              >
                <span className="text-sm font-semibold text-[#172b4d]">{card.title}</span>
                <span className="text-xs text-[#626f86]">In {listTitle}{card.dueDate ? ` · Due ${card.dueDate}` : ''}</span>
              </button>
            ))}
            {results.length === 0 ? <p className="text-sm text-[#626f86]">No cards match the current filters.</p> : null}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
