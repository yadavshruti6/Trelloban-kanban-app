"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { LayoutGrid, Trello } from 'lucide-react';
import { Topbar } from '@/components/topbar';
import { KanbanBoard } from '@/components/kanban-board';
import { OnboardingModal } from '@/components/onboarding-modal';
import { ToastStack } from '@/components/toast-stack';
import { useActiveBoard } from '@/store/use-kanban-store';
import { useKanbanStore } from '@/store/use-kanban-store';
import { createBoardBackgroundStyle, PREMIUM_DEFAULT_BACKGROUND } from '@/lib/default-background';

type AppShellProps = {
  children?: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { board } = useActiveBoard();
  const onboardingCompleted = useKanbanStore((state) => state.onboardingCompleted);
  const hydrateWorkspace = useKanbanStore((state) => state.hydrateWorkspace);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    void hydrateWorkspace().catch(() => undefined);
  }, [hydrateWorkspace]);

  const activeBoardBackground = board?.background ?? PREMIUM_DEFAULT_BACKGROUND;
  const backgroundStyle = {
    ...createBoardBackgroundStyle(activeBoardBackground),
    backgroundAttachment: 'fixed'
  };

  const onboardingBackgroundStyle = {
    ...createBoardBackgroundStyle(PREMIUM_DEFAULT_BACKGROUND),
    backgroundAttachment: 'fixed'
  };

  return (
    <motion.div
      className="relative min-h-screen overflow-hidden antialiased"
      style={onboardingCompleted ? backgroundStyle : onboardingBackgroundStyle}
      initial={{ opacity: 0.96 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0.9, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,rgba(255,255,255,0.18),transparent_26%),radial-gradient(circle_at_90%_16%,rgba(255,255,255,0.12),transparent_28%)]" />
        <div className="absolute inset-0" style={{ backgroundColor: onboardingCompleted ? (board?.background.overlay ?? 'rgba(15, 23, 42, 0.24)') : 'rgba(2, 6, 23, 0.50)' }} />
      </motion.div>

      <AnimatePresence>
        {showSplash ? (
          <motion.div
            key="splash"
            className="absolute inset-0 z-30 flex items-center justify-center"
            style={createBoardBackgroundStyle(PREMIUM_DEFAULT_BACKGROUND)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <motion.div
              className="flex flex-col items-center gap-4 text-white"
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-2xl backdrop-blur-md">
                <Trello className="h-8 w-8" />
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold tracking-[-0.04em]">Trelloban</p>
                <p className="mt-1 text-sm text-white/75">Premium cinematic workspace</p>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {onboardingCompleted ? (
        <motion.div
          className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1920px] gap-0 bg-transparent p-0 backdrop-blur-[1px]"
          initial={{ opacity: 0, scale: 0.99 }}
          animate={showSplash ? { opacity: 0, scale: 0.99 } : { opacity: 1, filter: 'blur(0px)', scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <main className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <div className="flex min-h-0 flex-1 px-3 pb-3 pt-2 md:px-4 md:pb-4">
              {children ?? <KanbanBoard />}
            </div>
          </main>
        </motion.div>
      ) : null}

      <AnimatePresence>
        {!showSplash && !onboardingCompleted ? (
          <motion.div
            key="onboarding-modal"
            className="absolute inset-0 z-20 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <OnboardingModal />
          </motion.div>
        ) : null}
      </AnimatePresence>
      <ToastStack />
    </motion.div>
  );
}
