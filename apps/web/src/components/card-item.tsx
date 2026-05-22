"use client";

import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { CalendarDays, CheckSquare2, CircleEllipsis, GripVertical, MessageSquareText, Paperclip, User2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useKanbanStore } from '@/store/use-kanban-store';
import type { Card as CardType } from '@/types/kanban';
import { useState } from 'react';

type CardItemProps = {
  card: CardType;
  listId: string;
  overlay?: boolean;
  highlighted?: boolean;
};

function formatCardDate(dueDate: string) {
  const parsed = new Date(dueDate);

  if (Number.isNaN(parsed.getTime())) {
    return dueDate;
  }

  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
}

type CardFrameProps = CardItemProps & {
  isDragging?: boolean;
};

function CardFrame({ card, listId, overlay = false, highlighted = false, isDragging = false }: CardFrameProps) {
  const openCard = useKanbanStore((state) => state.selectCard);
  const labels = useKanbanStore((state) => state.labels);
  const members = useKanbanStore((state) => state.members);
  const [coverLoadFailed, setCoverLoadFailed] = useState(false);

  const checklistTotal = card.checklistItems.length;
  const checklistDone = card.checklistItems.filter((item) => item.completed).length;
  const commentCount = card.comments.length;
  const attachmentCount = card.attachmentCount ?? 0;
  const dueDate = card.dueDate ? new Date(card.dueDate) : null;
  const isOverdue = dueDate && !card.dueCompleted && dueDate < new Date();

  return (
    <motion.article
      className={cn(
        'group relative overflow-hidden rounded-xl border border-[rgba(15,23,42,0.08)] bg-white p-4 text-[#0f172a] shadow-[0_8px_20px_rgba(15,23,42,0.09)] transition-all duration-200 will-change-transform hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(15,23,42,0.14)]',
        highlighted && 'ring-2 ring-cyan-400/60',
        isDragging && 'scale-[1.02] opacity-60',
        overlay && 'pointer-events-none rotate-1 shadow-[0_24px_56px_rgba(15,23,42,0.26)]'
      )}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {card.coverImage && !coverLoadFailed ? (
        <div className="mb-3 overflow-hidden rounded-lg border border-black/5 bg-slate-100">
          <img
            src={card.coverImage}
            alt="Card cover"
            className="h-24 w-full object-cover"
            onError={() => setCoverLoadFailed(true)}
          />
        </div>
      ) : null}

      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7c6cf2] via-[#6d5df6] to-[#4f46e5] opacity-85" />
      <div className="flex items-start justify-between gap-3">
        <button type="button" className="-ml-1 rounded-xl p-1.5 text-[#6B778C] opacity-60 transition group-hover:opacity-100" aria-label="Drag card">
          <GripVertical className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => openCard(card.id)} className="flex-1 text-left">
          <h4 className="text-[16px] font-semibold leading-5 tracking-tight text-[#0f172a]">{card.title}</h4>
          {card.description ? <p className="mt-1 text-[14px] leading-6 text-[#64748b]">{card.description}</p> : null}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {card.labelIds.map((labelId) => {
          const label = labels[labelId];
          if (!label) {
            return null;
          }

          return (
            <span key={label.id} className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm ring-1 ring-black/10" style={{ backgroundColor: label.color }}>
              {label.name}
            </span>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-[13px] font-medium text-[#64748b]">
        <div className="flex flex-wrap items-center gap-2">
          {card.dueDate ? (
            <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium', card.dueCompleted ? 'bg-emerald-100 text-emerald-700' : isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-[#475569]')}>
              <CalendarDays className="h-3.5 w-3.5" />
              {formatCardDate(card.dueDate)}
            </span>
          ) : null}
          {checklistTotal > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-[#475569]">
              <CheckSquare2 className="h-3.5 w-3.5" />
              {checklistDone}/{checklistTotal}
            </span>
          ) : null}
          {commentCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-[#475569]">
              <MessageSquareText className="h-3.5 w-3.5" />
              {commentCount}
            </span>
          ) : null}
          {attachmentCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-[#475569]">
              <Paperclip className="h-3.5 w-3.5" />
              {attachmentCount}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {card.memberIds.slice(0, 3).map((memberId) => {
            const member = members[memberId];
            return member ? (
                <div key={member.id} className="flex h-7 w-7 items-center justify-center rounded-full border border-black/5 bg-[#0f172a] text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
                {member.name
                  .split(' ')
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join('')}
              </div>
            ) : null;
          })}
          {card.memberIds.length > 0 ? <User2 className="h-3.5 w-3.5 text-[#6B778C]" /> : null}
          <CircleEllipsis className="h-4 w-4 text-[#64748b]" />
        </div>
      </div>

      {checklistTotal > 0 ? (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 transition-all" style={{ width: `${Math.round((checklistDone / checklistTotal) * 100)}%` }} />
        </div>
      ) : null}
    </motion.article>
  );
}

export function CardItem({ card, listId, overlay = false, highlighted = false }: CardItemProps) {
  if (overlay) {
    return <CardFrame card={card} listId={listId} overlay highlighted={highlighted} />;
  }

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card', cardId: card.id, listId }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CardFrame card={card} listId={listId} highlighted={highlighted} isDragging={isDragging} />
    </div>
  );
}
