"use client";

import { MoreHorizontal, UserPlus } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { useKanbanStore } from '@/store/use-kanban-store';

const permissionMap: Record<string, string> = {
  Admin: 'Can manage boards and members',
  'Engineering Lead': 'Can edit board structure and cards',
  'Frontend Engineer': 'Can edit cards and comments',
  'Product Designer': 'Can edit cards and due dates',
  'Marketing Manager': 'Can edit launch boards',
  'Content Strategist': 'Can edit content tasks'
};

export default function MembersPage() {
  const activeBoardId = useKanbanStore((state) => state.activeBoardId);
  const boards = useKanbanStore((state) => state.boards);
  const members = useKanbanStore((state) => state.members);
  const addToast = useKanbanStore((state) => state.addToast);

  const board = boards.find((entry) => entry.id === activeBoardId);
  const boardMembers = board?.memberIds.map((memberId) => members[memberId]).filter(Boolean) ?? [];

  return (
    <AppShell>
      <section className="w-full rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-4 shadow-[0_14px_32px_rgba(15,23,42,0.1)] md:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-[#0f172a]">Workspace Members</h2>
            <p className="mt-1 text-sm text-[#64748b]">Manage member access, role, and permissions.</p>
          </div>
          <button
            type="button"
            onClick={() => addToast({ kind: 'info', message: 'Invite flow can be connected to member API.' })}
            className="inline-flex h-10 items-center rounded-lg bg-[#0f172a] px-4 text-sm font-medium text-white"
          >
            <UserPlus className="mr-1.5 h-4 w-4" /> Invite Member
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[rgba(15,23,42,0.08)]">
          <div className="min-w-[820px]">
            <div className="grid grid-cols-[2fr_1.6fr_1.3fr_1.9fr_56px] bg-[#f8fafc] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
              <span>Member</span>
              <span>Email</span>
              <span>Role</span>
              <span>Permissions</span>
              <span />
            </div>
            {boardMembers.map((member) => (
              <div key={member.id} className="grid grid-cols-[2fr_1.6fr_1.3fr_1.9fr_56px] items-center border-t border-[rgba(15,23,42,0.08)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#0f172a] text-xs font-semibold text-white">
                    {member.name
                      .split(' ')
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join('')}
                  </span>
                  <span className="text-sm font-medium text-[#0f172a]">{member.name}</span>
                </div>
                <span className="text-sm text-[#475569]">{member.name.toLowerCase().replace(' ', '.')}@workspace.com</span>
                <span className="inline-flex w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-[#334155]">{member.role}</span>
                <span className="text-xs text-[#64748b]">{permissionMap[member.role] ?? 'Can collaborate on assigned cards'}</span>
                <button
                  type="button"
                  onClick={() => addToast({ kind: 'info', message: `Member actions for ${member.name} are ready for backend wiring.` })}
                  className="justify-self-end rounded-md p-2 text-[#64748b] transition hover:bg-slate-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            ))}
            {boardMembers.length === 0 ? <p className="px-4 py-6 text-sm text-[#64748b]">No members in this board yet.</p> : null}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
