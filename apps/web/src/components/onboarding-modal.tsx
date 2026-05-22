"use client";

import { ChevronDown, LayoutGrid, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useKanbanStore } from '@/store/use-kanban-store';

const WORKSPACES = ['Acme Workspace', 'Product Team', 'Design Ops', 'Growth Squad'];
const TEMPLATES = [
  { title: 'Product Launch', description: 'Boards for a coordinated launch sprint' },
  { title: 'Design Sprint', description: 'Creative workflow with review cycles' },
  { title: 'Bug Triage', description: 'Fast-moving backlog with prioritization' }
];

export function OnboardingModal() {
  const boards = useKanbanStore((state) => state.boards);
  const activeBoardId = useKanbanStore((state) => state.activeBoardId);
  const createBoardPersisted = useKanbanStore((state) => state.createBoardPersisted);
  const setActiveBoard = useKanbanStore((state) => state.setActiveBoard);
  const completeOnboarding = useKanbanStore((state) => state.completeOnboarding);
  const addToast = useKanbanStore((state) => state.addToast);

  const [title, setTitle] = useState('');
  const [workspace, setWorkspace] = useState(WORKSPACES[0]);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<(typeof TEMPLATES)[number] | null>(null);

  const existingBoards = useMemo(() => boards.slice(0, 4), [boards]);

  function finish(boardId: string) {
    setActiveBoard(boardId);
    completeOnboarding();
  }

  async function handleCreate() {
    const nextTitle = (title.trim() || selectedTemplate?.title || '').trim();

    if (!nextTitle) {
      addToast({ kind: 'error', message: 'Enter a board name to continue.' });
      return;
    }

    const createdId = await createBoardPersisted(nextTitle);
    if (!createdId) {
      addToast({ kind: 'error', message: 'That board name is already in use.' });
      return;
    }

    setActiveBoard(createdId);
    completeOnboarding();
    addToast({ kind: 'success', message: `Board created in ${workspace}.` });
  }

  function handleTemplate(template: (typeof TEMPLATES)[number]) {
    setSelectedTemplate(template);
    setTitle(template.title);
    setTemplateOpen(false);
  }

  async function handleClose() {
    if (boards.length > 0) {
      finish(activeBoardId || boards[0].id);
      return;
    }

    const fallbackId = await createBoardPersisted('My First Board');
    if (fallbackId) {
      finish(fallbackId);
      return;
    }

    completeOnboarding();
  }

  return (
    <motion.div
      className="relative w-full max-w-[760px] overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-4 text-white shadow-2xl backdrop-blur-xl sm:p-6"
      initial={{ opacity: 0, scale: 0.96, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 12 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.0))]" />

      <div className="relative">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/65">Welcome to Trelloban</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Create your first board</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/72 sm:text-base">
              Start with a clean workspace, or launch from a template and jump straight into your team flow.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close onboarding"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/8 p-4 shadow-lg backdrop-blur-md">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/85">Board title</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Product launch sprint"
                className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none transition placeholder:text-white/35 focus:border-[#0079BF] focus:ring-2 focus:ring-[#0079BF]/30"
              />
            </div>

            <div className="relative">
              <label className="mb-2 block text-sm font-medium text-white/85">Workspace / team</label>
              <button
                type="button"
                onClick={() => setWorkspaceOpen((current) => !current)}
                className="flex h-12 w-full items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 text-left text-white transition hover:bg-white/8"
              >
                <span>{workspace}</span>
                <ChevronDown className="h-4 w-4 text-white/70" />
              </button>

              <AnimatePresence>
                {workspaceOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 rounded-xl border border-white/10 bg-slate-950/95 p-2 shadow-xl"
                  >
                    {WORKSPACES.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setWorkspace(item);
                          setWorkspaceOpen(false);
                        }}
                        className={`flex h-10 w-full items-center rounded-lg px-3 text-left text-sm transition ${item === workspace ? 'bg-white/10 text-white' : 'text-white/78 hover:bg-white/6'}`}
                      >
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        {item}
                      </button>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={handleCreate}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-[#61BD4F] px-5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(97,189,79,0.28)] transition-all duration-200 hover:scale-[1.01] hover:brightness-110"
              >
                Create Board
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setTemplateOpen((current) => !current)}
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/10 px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/15"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Start with a Template
                </button>

                <AnimatePresence>
                  {templateOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className="absolute left-0 top-[calc(100%+0.5rem)] z-20 w-[280px] rounded-xl border border-white/10 bg-slate-950/95 p-2 shadow-xl"
                    >
                      {TEMPLATES.map((template) => (
                        <button
                          key={template.title}
                          type="button"
                          onClick={() => handleTemplate(template)}
                          className="w-full rounded-lg px-3 py-2 text-left transition hover:bg-white/8"
                        >
                          <p className="text-sm font-semibold text-white">{template.title}</p>
                          <p className="text-xs text-white/60">{template.description}</p>
                        </button>
                      ))}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-white/65">Open existing board</h2>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70">{existingBoards.length}</span>
            </div>

            <div className="space-y-2">
              {existingBoards.map((board) => (
                <button
                  key={board.id}
                  type="button"
                  onClick={() => finish(board.id)}
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-left transition hover:bg-white/8"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{board.title}</p>
                    <p className="text-xs text-white/60">{board.listIds.length} lists</p>
                  </div>
                  <LayoutGrid className="h-4 w-4 text-white/65" />
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-3 text-sm leading-6 text-white/72">
              Choose a workspace, create a new board, or jump straight into an existing one. The main dashboard fades in after selection.
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
