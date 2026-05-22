"use client";

import { AnimatePresence, motion } from 'framer-motion';
import {
  Archive,
  CalendarDays,
  CheckSquare,
  Copy,
  Download,
  FileText,
  Flag,
  ImagePlus,
  MoveRight,
  Paperclip,
  Plus,
  Tag,
  Trash2,
  UserPlus,
  Users,
  X
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useKanbanStore } from '@/store/use-kanban-store';

type CardModalProps = {
  cardId: string;
  onClose: () => void;
};

type ActivityItem = {
  id: string;
  text: string;
  createdAt: string;
  author: string;
};

const LABEL_COLORS = ['#61BD4F', '#0079BF', '#F59E0B', '#EF4444', '#8B5CF6'];

export function CardModal({ cardId, onClose }: CardModalProps) {
  const card = useKanbanStore((state) => state.cards[cardId]);
  const lists = useKanbanStore((state) => state.lists);
  const labels = useKanbanStore((state) => state.labels);
  const members = useKanbanStore((state) => state.members);
  const updateCard = useKanbanStore((state) => state.updateCard);
  const addComment = useKanbanStore((state) => state.addComment);
  const addChecklistItem = useKanbanStore((state) => state.addChecklistItem);
  const deleteChecklistItem = useKanbanStore((state) => state.deleteChecklistItem);
  const deleteCard = useKanbanStore((state) => state.deleteCard);
  const archiveCard = useKanbanStore((state) => state.archiveCard);
  const createLabel = useKanbanStore((state) => state.createLabel);
  const deleteLabel = useKanbanStore((state) => state.deleteLabel);
  const addToast = useKanbanStore((state) => state.addToast);

  const [draftChecklist, setDraftChecklist] = useState('');
  const [draftComment, setDraftComment] = useState('');
  const [draftLabelName, setDraftLabelName] = useState('');
  const [draftLabelColor, setDraftLabelColor] = useState(LABEL_COLORS[0]);

  const currentCard = card;
  const list = currentCard ? lists[currentCard.listId] : undefined;
  const boardId = list?.boardId;
  const boardLabels = Object.values(labels).filter((label) => label.boardId === boardId);
  const boardMembers = Object.values(members).filter((member) => member.boardId === boardId);
  const completedChecklist = currentCard?.checklistItems.filter((item) => item.completed).length ?? 0;
  const checklistProgress = currentCard && currentCard.checklistItems.length > 0 ? Math.round((completedChecklist / currentCard.checklistItems.length) * 100) : 0;

  const activityItems = useMemo<ActivityItem[]>(() => {
    if (!currentCard) {
      return [];
    }

    const comments = currentCard.comments.map((comment) => ({
      id: `comment-${comment.id}`,
      text: comment.text,
      createdAt: comment.createdAt,
      author: comment.memberId ? members[comment.memberId]?.name ?? 'Team member' : 'Team member'
    }));

    const activities = currentCard.activities.map((activity) => ({
      id: `activity-${activity.id}`,
      text: activity.text,
      createdAt: activity.createdAt,
      author: currentCard.memberIds[0] ? members[currentCard.memberIds[0]]?.name ?? 'Team member' : 'Team member'
    }));

    return [...comments, ...activities].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  }, [currentCard, members]);

  const dueDateState = (() => {
    if (!currentCard?.dueDate) return 'none';
    if (currentCard.dueCompleted) return 'complete';
    const due = new Date(currentCard.dueDate);
    const now = new Date();
    if (Number.isNaN(due.getTime())) return 'none';
    if (due < now) return 'overdue';
    return 'upcoming';
  })();

  function createNewLabel() {
    if (!currentCard || !boardId) return;
    const id = createLabel(boardId, draftLabelName, draftLabelColor);
    if (id) {
      setDraftLabelName('');
      updateCard(currentCard.id, { labelIds: [...currentCard.labelIds, id] });
    }
  }

  async function handleAttachmentUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (!currentCard) return;

    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const existing = currentCard.attachments ?? [];
    const created = await Promise.all(
      files.map(async (file) => ({
        id: `attachment-${Math.random().toString(36).slice(2, 10)}`,
        name: file.name,
        url: await readFileAsDataUrl(file),
        mimeType: file.type,
        size: file.size
      }))
    );

    const attachments = [...existing, ...created];
    updateCard(currentCard.id, {
      attachments,
      attachmentCount: attachments.length
    });

    addToast({ kind: 'success', message: `${created.length} attachment(s) added.` });
    event.target.value = '';
  }

  function removeAttachment(attachmentId: string) {
    if (!currentCard) return;

    const next = (currentCard.attachments ?? []).filter((item) => item.id !== attachmentId);
    updateCard(currentCard.id, {
      attachments: next,
      attachmentCount: next.length
    });
  }

  async function handleCoverUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (!currentCard) return;

    const file = event.target.files?.[0];
    if (!file) return;

    updateCard(currentCard.id, { coverImage: await readFileAsDataUrl(file) });
    event.target.value = '';
  }

  if (!currentCard) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[90] bg-[#0f172a]/50 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.section
          className="absolute right-0 top-0 h-full w-full max-w-[1020px] overflow-hidden border-l border-[rgba(15,23,42,0.08)] bg-[#f8fafc] shadow-[0_30px_80px_rgba(15,23,42,0.28)]"
          initial={{ x: 36, opacity: 0.8 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 36, opacity: 0.8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="grid h-full grid-cols-1 lg:grid-cols-[1.75fr_0.9fr]">
            <main className="min-h-0 overflow-y-auto p-4 md:p-5">
              {currentCard.coverImage ? (
                <div className="mb-4 overflow-hidden rounded-xl border border-[rgba(15,23,42,0.08)] bg-white">
                  <img src={currentCard.coverImage} alt="Card cover" className="h-44 w-full object-cover" />
                </div>
              ) : null}

              <div className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-full">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#64748b]">Card details</p>
                    <input
                      value={currentCard.title}
                      onChange={(event) => updateCard(currentCard.id, { title: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-transparent bg-transparent px-0 text-2xl font-semibold text-[#0f172a] outline-none focus:border-[#6d5df6]/30"
                    />
                    <p className="text-sm text-[#64748b]">in list {list?.title ?? 'Unsorted'}</p>
                  </div>

                  <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[rgba(15,23,42,0.08)] bg-white text-[#475569] hover:bg-slate-50">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-4">
                  <MetaCard label="Checklist" value={`${checklistProgress}%`} />
                  <MetaCard label="Comments" value={`${currentCard.comments.length}`} />
                  <MetaCard label="Attachments" value={`${currentCard.attachmentCount ?? 0}`} />
                  <MetaCard label="Due" value={dueDateState} />
                </div>
              </div>

              <Section title="Labels" icon={<Tag className="h-4 w-4" />}>
                <div className="flex flex-wrap gap-2">
                  {boardLabels.map((label) => {
                    const selected = currentCard.labelIds.includes(label.id);
                    return (
                      <span key={label.id} className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateCard(currentCard.id, {
                              labelIds: selected ? currentCard.labelIds.filter((entry) => entry !== label.id) : [...currentCard.labelIds, label.id]
                            })
                          }
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold text-white transition ${selected ? 'ring-2 ring-offset-2 ring-offset-white ring-[#0f172a]/20' : 'opacity-80 hover:opacity-100'}`}
                          style={{ backgroundColor: label.color }}
                        >
                          {label.name}
                        </button>
                        <button type="button" onClick={() => deleteLabel(label.id)} className="rounded p-1 text-[#64748b] hover:bg-slate-100">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    );
                  })}
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                  <input
                    value={draftLabelName}
                    onChange={(event) => setDraftLabelName(event.target.value)}
                    placeholder="New label"
                    className="h-10 rounded-lg border border-[rgba(15,23,42,0.08)] px-3 text-sm"
                  />
                  <select value={draftLabelColor} onChange={(event) => setDraftLabelColor(event.target.value)} className="h-10 rounded-lg border border-[rgba(15,23,42,0.08)] px-2 text-sm">
                    {LABEL_COLORS.map((color) => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                  <button type="button" onClick={createNewLabel} className="h-10 rounded-lg bg-[#0f172a] px-3 text-sm font-medium text-white">
                    <Plus className="mr-1 inline h-4 w-4" /> Create
                  </button>
                </div>
              </Section>

              <Section title="Members" icon={<Users className="h-4 w-4" />}>
                <div className="flex flex-wrap gap-2">
                  {boardMembers.map((member) => {
                    const selected = currentCard.memberIds.includes(member.id);
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() =>
                          updateCard(currentCard.id, {
                            memberIds: selected ? currentCard.memberIds.filter((entry) => entry !== member.id) : [...currentCard.memberIds, member.id]
                          })
                        }
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition ${selected ? 'border-[#6d5df6] bg-[#6d5df6]/10 text-[#4f46e5]' : 'border-[rgba(15,23,42,0.08)] bg-white text-[#334155]'}`}
                      >
                        {member.name}
                      </button>
                    );
                  })}
                </div>
              </Section>

              <Section title="Due date" icon={<CalendarDays className="h-4 w-4" />}>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="date"
                    value={currentCard.dueDate ?? ''}
                    onChange={(event) => updateCard(currentCard.id, { dueDate: event.target.value || null })}
                    className="h-10 rounded-lg border border-[rgba(15,23,42,0.08)] px-3 text-sm text-[#0f172a] outline-none focus:border-[#6d5df6]"
                  />
                  <select
                    value={currentCard.dueReminder ?? 'none'}
                    onChange={(event) => updateCard(currentCard.id, { dueReminder: event.target.value === 'none' ? null : event.target.value })}
                    className="h-10 rounded-lg border border-[rgba(15,23,42,0.08)] px-3 text-sm"
                  >
                    <option value="none">No reminder</option>
                    <option value="at-due">At time of due date</option>
                    <option value="5m">5 minutes before</option>
                    <option value="1h">1 hour before</option>
                    <option value="1d">1 day before</option>
                  </select>
                </div>
                <label className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[rgba(15,23,42,0.08)] bg-white px-3 py-2 text-sm font-medium text-[#334155]">
                  <input
                    type="checkbox"
                    checked={Boolean(currentCard.dueCompleted)}
                    disabled={!currentCard.dueDate}
                    onChange={(event) => updateCard(currentCard.id, { dueCompleted: event.target.checked })}
                  />
                  Mark due date complete
                </label>
              </Section>

              <Section title="Description" icon={<FileText className="h-4 w-4" />}>
                <textarea
                  value={currentCard.description ?? ''}
                  onChange={(event) => updateCard(currentCard.id, { description: event.target.value })}
                  placeholder="Add a more detailed description..."
                  className="min-h-28 w-full rounded-lg border border-[rgba(15,23,42,0.08)] p-3 text-[14px] text-[#0f172a] outline-none focus:border-[#6d5df6]"
                />
              </Section>

              <Section title="Checklist" icon={<CheckSquare className="h-4 w-4" />}>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-[#6d5df6]" style={{ width: `${checklistProgress}%` }} />
                </div>

                <div className="mt-3 space-y-2">
                  {currentCard.checklistItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 rounded-lg border border-[rgba(15,23,42,0.08)] bg-white px-3 py-2">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() =>
                          updateCard(currentCard.id, {
                            checklistItems: currentCard.checklistItems.map((entry) =>
                              entry.id === item.id ? { ...entry, completed: !entry.completed } : entry
                            )
                          })
                        }
                      />
                      <span className={`text-sm ${item.completed ? 'text-[#64748b] line-through' : 'text-[#0f172a]'}`}>{item.title}</span>
                      <button type="button" onClick={() => deleteChecklistItem(currentCard.id, item.id)} className="ml-auto text-[#64748b] hover:text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex gap-2">
                  <input
                    value={draftChecklist}
                    onChange={(event) => setDraftChecklist(event.target.value)}
                    placeholder="Add checklist item"
                    className="h-10 flex-1 rounded-lg border border-[rgba(15,23,42,0.08)] px-3 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addChecklistItem(currentCard.id, draftChecklist);
                      setDraftChecklist('');
                    }}
                    className="inline-flex h-10 items-center rounded-lg bg-[#0f172a] px-3 text-sm font-medium text-white"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add
                  </button>
                </div>
              </Section>

              <Section title="Comments" icon={<Users className="h-4 w-4" />}>
                <div className="space-y-2">
                  {currentCard.comments.map((comment) => (
                    <div key={comment.id} className="rounded-lg border border-[rgba(15,23,42,0.08)] bg-white px-3 py-2.5">
                      <p className="text-sm font-medium text-[#0f172a]">{comment.memberId ? members[comment.memberId]?.name ?? 'Team member' : 'Team member'}</p>
                      <p className="mt-1 text-sm text-[#334155]">{comment.text}</p>
                      <p className="mt-1 text-xs text-[#64748b]">{new Date(comment.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex gap-2">
                  <input
                    value={draftComment}
                    onChange={(event) => setDraftComment(event.target.value)}
                    placeholder="Write a comment"
                    className="h-10 flex-1 rounded-lg border border-[rgba(15,23,42,0.08)] px-3 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addComment(currentCard.id, draftComment, currentCard.memberIds[0]);
                      setDraftComment('');
                    }}
                    className="h-10 rounded-lg bg-[#6d5df6] px-3 text-sm font-medium text-white"
                  >
                    Comment
                  </button>
                </div>
              </Section>

              <Section title="Attachments" icon={<Paperclip className="h-4 w-4" />}>
                <label className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-[rgba(15,23,42,0.08)] bg-white px-3 text-sm font-medium text-[#334155] hover:bg-slate-50">
                  <Plus className="mr-2 h-4 w-4" /> Upload attachment
                  <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" onChange={handleAttachmentUpload} className="hidden" />
                </label>

                <div className="mt-3 space-y-2">
                  {(currentCard.attachments ?? []).map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between gap-3 rounded-lg border border-[rgba(15,23,42,0.08)] bg-white px-3 py-2">
                      <div className="flex min-w-0 items-center gap-3">
                        {attachment.mimeType?.startsWith('image/') ? (
                          <img src={attachment.url} alt={attachment.name} className="h-12 w-16 rounded-md object-cover" />
                        ) : (
                          <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-slate-100 text-[#64748b]">
                            <FileText className="h-5 w-5" />
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#0f172a]">{attachment.name}</p>
                          <p className="text-xs text-[#64748b]">{formatAttachmentMeta(attachment.mimeType, attachment.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <a href={attachment.url} download={attachment.name} className="rounded p-1 text-[#64748b] hover:bg-slate-100">
                          <Download className="h-4 w-4" />
                        </a>
                        <button type="button" onClick={() => removeAttachment(attachment.id)} className="rounded p-1 text-[#64748b] hover:bg-slate-100">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Activity" icon={<MoveRight className="h-4 w-4" />}>
                <div className="space-y-2">
                  {activityItems.length === 0 ? <p className="text-sm text-[#64748b]">No activity yet.</p> : null}
                  {activityItems.map((activity) => (
                    <div key={activity.id} className="rounded-lg border border-[rgba(15,23,42,0.08)] bg-white px-3 py-2.5">
                      <p className="text-sm text-[#0f172a]"><span className="font-semibold">{activity.author}</span> {activity.text}</p>
                      <p className="mt-1 text-xs text-[#64748b]">{new Date(activity.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </Section>
            </main>

            <aside className="min-h-0 overflow-y-auto border-t border-[rgba(15,23,42,0.08)] bg-[#f1f5f9] p-4 lg:border-l lg:border-t-0">
              <div className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#64748b]">Actions</p>
                <div className="mt-3 space-y-2">
                  <label className="flex h-10 cursor-pointer items-center rounded-lg border border-[rgba(15,23,42,0.08)] bg-white px-3 text-sm font-medium text-[#334155] transition hover:bg-slate-50">
                    <ImagePlus className="mr-2 h-4 w-4" /> Cover image
                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                  </label>
                  <ActionRow label="Move" icon={<MoveRight className="h-4 w-4" />} onClick={() => addToast({ kind: 'info', message: 'Drag card to move between lists.' })} />
                  <ActionRow label="Copy" icon={<Copy className="h-4 w-4" />} onClick={() => addToast({ kind: 'info', message: 'Copy action can be wired to API clone endpoint.' })} />
                  <ActionRow label="Labels" icon={<Tag className="h-4 w-4" />} onClick={() => addToast({ kind: 'info', message: 'Use labels section to assign labels.' })} />
                  <ActionRow label="Members" icon={<UserPlus className="h-4 w-4" />} onClick={() => addToast({ kind: 'info', message: 'Use members section to assign teammates.' })} />
                  <ActionRow label="Due date" icon={<CalendarDays className="h-4 w-4" />} onClick={() => addToast({ kind: 'info', message: 'Use due date section in the main panel.' })} />
                  <ActionRow label="Attachment" icon={<Paperclip className="h-4 w-4" />} onClick={() => addToast({ kind: 'info', message: 'Upload attachments in the attachments section.' })} />
                  <ActionRow label="Checklist" icon={<Flag className="h-4 w-4" />} onClick={() => addToast({ kind: 'info', message: 'Checklist items support live progress updates.' })} />
                  <ActionRow
                    label="Archive"
                    icon={<Archive className="h-4 w-4" />}
                    onClick={() => {
                      archiveCard(currentCard.id);
                      onClose();
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      deleteCard(currentCard.id);
                      onClose();
                    }}
                    className="flex h-10 w-full items-center rounded-lg border border-rose-200 bg-rose-50 px-3 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result)));
    reader.addEventListener('error', () => reject(reader.error ?? new Error('Could not read file.')));
    reader.readAsDataURL(file);
  });
}

function formatAttachmentMeta(mimeType?: string, size?: number) {
  const type = mimeType || 'file';
  if (!size) {
    return type;
  }

  if (size < 1024 * 1024) {
    return `${type} - ${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${type} - ${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[rgba(15,23,42,0.08)] bg-[#f8fafc] px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748b]">{label}</p>
      <p className="mt-1 text-[13px] font-semibold text-[#0f172a]">{value}</p>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mt-4 rounded-xl border border-[rgba(15,23,42,0.08)] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0f172a]">
        {icon}
        {title}
      </div>
      {children}
    </section>
  );
}

function ActionRow({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-full items-center rounded-lg border border-[rgba(15,23,42,0.08)] bg-white px-3 text-sm font-medium text-[#334155] transition hover:bg-slate-50"
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );
}
