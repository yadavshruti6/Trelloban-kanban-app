import type { BoardBackground } from '@/types/kanban';

export const PREMIUM_DEFAULT_BACKGROUND: BoardBackground = {
  kind: 'wallpaper',
  value: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3',
  overlay: 'rgba(2, 6, 23, 0.34)'
};

const LEGACY_DEFAULT_BACKGROUND_VALUE = 'linear-gradient(120deg, #0f172a 0%, #1d4ed8 45%, #0ea5e9 100%)';

export function normalizeBoardBackground(background?: BoardBackground | null): BoardBackground {
  if (!background) {
    return PREMIUM_DEFAULT_BACKGROUND;
  }

  if (background.kind === 'gradient' && background.value === LEGACY_DEFAULT_BACKGROUND_VALUE) {
    return PREMIUM_DEFAULT_BACKGROUND;
  }

  return background;
}

export function createBoardBackgroundStyle(background: BoardBackground) {
  if (background.kind === 'wallpaper' || background.kind === 'custom') {
    return {
      backgroundImage: `url(${background.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#0f172a'
    };
  }

  return {
    backgroundImage: background.value,
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#0f172a'
  };
}