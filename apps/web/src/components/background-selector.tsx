"use client";

import { useState } from 'react';
import { X, ImagePlus } from 'lucide-react';
import { useKanbanStore } from '@/store/use-kanban-store';

const PRESETS = [
  {
    id: 'modern-office',
    title: 'Modern office workspace',
    url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=6f8d6a3d9b7e0b4a9a2d2f9b1c3b4d8a'
  },
  {
    id: 'meeting-room',
    title: 'Startup meeting room',
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=9c4d7b6b7d9e0b0c3a4f5d6b7a8c9d0e'
  },
  {
    id: 'coding-setup',
    title: 'Coding setup with monitors',
    url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=5b8c6f3d7a9b1c2d3e4f5a6b7c8d9e0f'
  },
  {
    id: 'minimal-workspace',
    title: 'Minimal corporate workspace',
    url: 'https://images.unsplash.com/photo-1506459225024-1428097a7e18?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d'
  },
  {
    id: 'night-cyberpunk',
    title: 'Night cyberpunk office',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=abcdef1234567890abcdef1234567890'
  },
  {
    id: 'cozy-workspace',
    title: 'Cozy workspace aesthetic',
    url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=0f1e2d3c4b5a69788796a5b4c3d2e1f0'
  }
];

export function BackgroundSelector({ onClose }: { onClose: () => void }) {
  const activeBoardId = useKanbanStore((s) => s.activeBoardId);
  const updateBoardBackground = useKanbanStore((s) => s.updateBoardBackground);
  const [uploading, setUploading] = useState(false);

  function applyPreset(preset: { id: string; url: string }) {
    updateBoardBackground(activeBoardId, { kind: 'wallpaper', value: preset.url, overlay: 'rgba(2,6,23,0.36)' });
    onClose();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = URL.createObjectURL(file);
    // Apply a default overlay + mark as custom
    updateBoardBackground(activeBoardId, { kind: 'custom', value: url, overlay: 'rgba(2,6,23,0.42)' });
    setUploading(false);
    onClose();
  }

  return (
    <div className="rounded-lg bg-white/6 p-3 shadow-md backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">Change Background</h4>
        <button type="button" onClick={onClose} className="rounded-md p-1 text-white/80 hover:bg-white/8">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => applyPreset(preset)}
            className="relative h-24 overflow-hidden rounded-md bg-slate-200 transition hover:scale-[1.02]"
            style={{ backgroundImage: `url(${preset.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-2 left-2 text-xs font-medium text-white">{preset.title}</div>
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20">
          <ImagePlus className="h-4 w-4" />
          <span>{uploading ? 'Uploading...' : 'Upload image'}</span>
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>
        <button type="button" onClick={() => { updateBoardBackground(activeBoardId, { kind: 'gradient', value: 'linear-gradient(120deg,#0f172a 0%,#1d4ed8 45%,#0ea5e9 100%)', overlay: 'rgba(2,6,23,0.36)' }); onClose(); }} className="ml-auto rounded-md bg-white/8 px-3 py-2 text-sm text-white hover:bg-white/16">Reset</button>
      </div>
    </div>
  );
}
