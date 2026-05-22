"use client";

import { useMemo } from 'react';
import { AppShell } from '@/components/app-shell';
import { useKanbanStore } from '@/store/use-kanban-store';

type TimelineItem = {
  id: string;
  action: string;
  createdAt: string;
  memberName: string;
};

export default function ActivityPage() {
  const cards = useKanbanStore((state) => state.cards);
  const members = useKanbanStore((state) => state.members);

  const timeline = useMemo<TimelineItem[]>(() => {
    return Object.values(cards)
      .flatMap((card) => {
        const cardEvents = card.activities.map((activity) => ({
          id: `activity-${activity.id}`,
          action: activity.text,
          createdAt: activity.createdAt,
          memberName: card.memberIds[0] ? members[card.memberIds[0]]?.name ?? 'Team member' : 'Team member'
        }));

        const commentEvents = card.comments.map((comment) => ({
          id: `comment-${comment.id}`,
          action: `commented: ${comment.text}`,
          createdAt: comment.createdAt,
          memberName: comment.memberId ? members[comment.memberId]?.name ?? 'Team member' : 'Team member'
        }));

        const checklistEvents = card.checklistItems.map((item) => ({
          id: `check-${card.id}-${item.id}`,
          action: `${item.completed ? 'completed' : 'updated'} checklist item ${item.title}`,
          createdAt: new Date().toISOString(),
          memberName: card.memberIds[0] ? members[card.memberIds[0]]?.name ?? 'Team member' : 'Team member'
        }));

        return [...cardEvents, ...commentEvents, ...checklistEvents].map((entry) => ({
          ...entry,
          action: `${entry.action}`
        }));
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [cards, members]);

  const now = new Date();
  const today = timeline.filter((item) => new Date(item.createdAt).toDateString() === now.toDateString());
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(now.getDate() - 1);
  const yesterday = timeline.filter((item) => new Date(item.createdAt).toDateString() === yesterdayDate.toDateString());
  const older = timeline.filter(
    (item) =>
      new Date(item.createdAt).toDateString() !== now.toDateString() &&
      new Date(item.createdAt).toDateString() !== yesterdayDate.toDateString()
  );

  return (
    <AppShell>
      <section className="w-full rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-4 shadow-[0_14px_32px_rgba(15,23,42,0.1)] md:p-5">
        <h2 className="text-2xl font-semibold text-[#0f172a]">Activity Log</h2>
        <p className="mt-1 text-sm text-[#64748b]">All board actions grouped by recency.</p>

        <div className="mt-5 space-y-6">
          <ActivityGroup title="Today" items={today} />
          <ActivityGroup title="Yesterday" items={yesterday} />
          <ActivityGroup title="Older" items={older} />
        </div>
      </section>
    </AppShell>
  );
}

function ActivityGroup({ title, items }: { title: string; items: TimelineItem[] }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">{title}</h3>
      {items.length === 0 ? <p className="text-sm text-[#94a3b8]">No activity.</p> : null}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3 rounded-lg border border-[rgba(15,23,42,0.08)] bg-[#f8fafc] px-3 py-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0f172a] text-[10px] font-semibold uppercase text-white">
              {item.memberName
                .split(' ')
                .map((part) => part[0])
                .slice(0, 2)
                .join('')}
            </span>
            <div>
              <p className="text-sm text-[#0f172a]"><span className="font-semibold">{item.memberName}</span> {item.action}</p>
              <p className="mt-1 text-xs text-[#64748b]">{new Date(item.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
