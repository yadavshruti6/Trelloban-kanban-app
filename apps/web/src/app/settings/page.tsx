"use client";

import { AppShell } from '@/components/app-shell';

export default function SettingsPage() {
  return (
    <AppShell>
      <section className="grid w-full gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-4 shadow-[0_14px_32px_rgba(15,23,42,0.1)] md:p-5">
          <h2 className="text-2xl font-semibold text-[#0f172a]">Workspace Settings</h2>
          <p className="mt-1 text-sm text-[#64748b]">Control workspace preferences and default board behavior.</p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">Workspace Name</label>
              <input defaultValue="Acme Inc." className="mt-2 h-10 w-full rounded-lg border border-[rgba(15,23,42,0.12)] px-3 text-sm text-[#0f172a]" />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">Default Visibility</label>
              <select className="mt-2 h-10 w-full rounded-lg border border-[rgba(15,23,42,0.12)] px-3 text-sm text-[#0f172a]">
                <option>Workspace</option>
                <option>Private</option>
              </select>
            </div>

            <div className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-[#f8fafc] p-4">
              <p className="text-sm font-semibold text-[#0f172a]">Permissions</p>
              <div className="mt-3 space-y-3">
                {[
                  'Allow members to create boards',
                  'Allow members to invite users',
                  'Allow member role edits',
                  'Require approval for guest invites'
                ].map((item, index) => (
                  <label key={item} className="flex items-center justify-between text-sm text-[#334155]">
                    {item}
                    <input type="checkbox" defaultChecked={index < 2} className="h-4 w-4" />
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-[#f8fafc] p-4">
              <p className="text-sm font-semibold text-[#0f172a]">Notifications</p>
              <div className="mt-3 space-y-3">
                {[
                  'Due date reminders',
                  'New comments',
                  'Card moved across lists',
                  'Weekly board digest'
                ].map((item, index) => (
                  <label key={item} className="flex items-center justify-between text-sm text-[#334155]">
                    {item}
                    <input type="checkbox" defaultChecked={index !== 3} className="h-4 w-4" />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-[0_14px_32px_rgba(239,68,68,0.12)]">
          <h3 className="text-lg font-semibold text-rose-700">Danger Zone</h3>
          <p className="mt-2 text-sm text-rose-700/90">Deleting this workspace removes boards, cards, and history permanently.</p>
          <button type="button" className="mt-4 h-10 rounded-lg bg-rose-600 px-4 text-sm font-medium text-white hover:bg-rose-700">
            Delete Workspace
          </button>
        </div>
      </section>
    </AppShell>
  );
}
