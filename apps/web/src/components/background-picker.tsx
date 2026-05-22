"use client";

import { ImagePlus, Sparkles } from 'lucide-react';
import { useRef } from 'react';
import type { BoardBackground } from '@/types/kanban';

const gradientBackgrounds: BoardBackground[] = [
  {
    kind: 'gradient',
    value: 'linear-gradient(125deg, #0f172a 0%, #1d4ed8 42%, #0ea5e9 100%)',
    overlay: 'rgba(2, 6, 23, 0.34)'
  },
  {
    kind: 'gradient',
    value: 'linear-gradient(125deg, #111827 0%, #7c3aed 40%, #f43f5e 100%)',
    overlay: 'rgba(15, 23, 42, 0.38)'
  },
  {
    kind: 'gradient',
    value: 'linear-gradient(125deg, #134e4a 0%, #0f766e 38%, #14b8a6 100%)',
    overlay: 'rgba(15, 23, 42, 0.34)'
  },
  {
    kind: 'gradient',
    value: 'linear-gradient(125deg, #1f2937 0%, #475569 42%, #94a3b8 100%)',
    overlay: 'rgba(15, 23, 42, 0.34)'
  }
];

const wallpaperBackgrounds: BoardBackground[] = [
  {
    kind: 'wallpaper',
    value: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
    overlay: 'rgba(2, 6, 23, 0.52)'
  },
  {
    kind: 'wallpaper',
    value: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
    overlay: 'rgba(2, 6, 23, 0.46)'
  },
  {
    kind: 'wallpaper',
    value: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    overlay: 'rgba(2, 6, 23, 0.5)'
  }
];

type BackgroundPickerProps = {
  onSelect: (background: BoardBackground) => void;
  value?: BoardBackground | null;
};

export function BackgroundPicker({ onSelect, value }: BackgroundPickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function isSelected(background: BoardBackground) {
    return value?.kind === background.kind && value?.value === background.value;
  }

  return (
    <div className="rounded-[1.6rem] border border-white/12 bg-slate-950/30 p-3 shadow-[0_18px_40px_rgba(2,6,23,0.16)] backdrop-blur-2xl">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
        <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
        Board Background
      </div>
      <p className="mt-2 text-xs leading-5 text-white/60">Choose a cinematic backdrop with a readable overlay.</p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {gradientBackgrounds.map((background, index) => (
          <button
            key={`gradient-${index}`}
            type="button"
            onClick={() => onSelect(background)}
            className={`group relative h-16 overflow-hidden rounded-2xl border transition duration-200 hover:-translate-y-0.5 hover:border-white/30 ${isSelected(background) ? 'border-cyan-300/80 ring-2 ring-cyan-300/35' : 'border-white/15'}`}
            style={{ backgroundImage: background.value }}
            aria-label="Gradient background"
          >
            <span className="absolute inset-0 bg-white/0 transition group-hover:bg-white/10" />
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {wallpaperBackgrounds.map((background, index) => (
          <button
            key={`wallpaper-${index}`}
            type="button"
            onClick={() => onSelect(background)}
            className={`group relative h-20 overflow-hidden rounded-2xl border bg-cover bg-center transition duration-200 hover:-translate-y-0.5 hover:border-white/30 ${isSelected(background) ? 'border-cyan-300/80 ring-2 ring-cyan-300/35' : 'border-white/15'}`}
            style={{ backgroundImage: `url(${background.value})` }}
            aria-label="Wallpaper background"
          >
            <span className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/8 px-3 py-2.5 text-sm font-medium text-white/90 transition hover:border-cyan-300/60 hover:bg-white/14"
      >
        <ImagePlus className="h-4 w-4" />
        Upload custom
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) {
            return;
          }

          const reader = new FileReader();
          reader.onload = () => {
            const value = String(reader.result ?? '');
            if (!value) {
              return;
            }

            onSelect({
              kind: 'custom',
              value,
              overlay: 'rgba(2, 6, 23, 0.58)'
            });
          };
          reader.readAsDataURL(file);
        }}
      />
    </div>
  );
}
