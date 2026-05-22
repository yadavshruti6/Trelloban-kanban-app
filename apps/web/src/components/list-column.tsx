"use client";

import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Ellipsis, ListChecks, Plus, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useKanbanStore } from '@/store/use-kanban-store';
import type { Card as CardType, List as ListType } from '@/types/kanban';
import { CardItem } from '@/components/card-item';

type ListColumnProps = {
  list: ListType & { cards?: CardType[] };
  cards: CardType[];
};

export function ListColumn({ list, cards }: ListColumnProps) {
  const createCard = useKanbanStore((state) => state.createCard);
  const deleteList = useKanbanStore((state) => state.deleteList);
  const updateListTitle = useKanbanStore((state) => state.updateListTitle);
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(list.title);

  useEffect(() => {
    setDraftTitle(list.title);
  }, [list.title]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: list.id,
    data: { type: 'list' }
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `list-drop-${list.id}`,
    data: { type: 'card-list', listId: list.id }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const visibleCards = cards.filter((card): card is CardType => Boolean(card));

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={cn('flex h-fit max-h-[calc(100vh-250px)] w-[280px] min-w-[280px] max-w-[280px] flex-shrink-0 flex-col self-start rounded-xl border border-white/12 bg-white/12 p-3 shadow-[0_14px_28px_rgba(15,23,42,0.18)] backdrop-blur-md transition sm:w-[300px] sm:min-w-[300px] sm:max-w-[300px] md:w-[328px] md:min-w-[328px] md:max-w-[328px]', isDragging && 'scale-[0.99] opacity-80')}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
    >
      <div className="flex items-center justify-between gap-3 px-1 pb-3">
        <div className="flex-1 text-left" {...attributes} {...listeners}>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">
            <ListChecks className="h-3.5 w-3.5" />
            List
            <Ellipsis className="h-4 w-4 text-white/70" />
          </div>
          {isEditing ? (
            <input
              autoFocus
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              onBlur={() => {
                updateListTitle(list.id, draftTitle);
                setIsEditing(false);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  updateListTitle(list.id, draftTitle);
                  setIsEditing(false);
                }
                if (event.key === 'Escape') {
                  setIsEditing(false);
                  setDraftTitle(list.title);
                }
              }}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white px-2 py-1 text-base font-semibold tracking-tight text-[#172B4D] outline-none"
            />
          ) : (
            <h3 className="mt-2 text-[18px] font-semibold tracking-tight text-white">{list.title}</h3>
          )}
          <p className="text-xs text-white/80">{visibleCards.length} cards</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-xl p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Edit list"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => deleteList(list.id)}
            className="rounded-xl p-2 text-white/70 transition hover:bg-white/10 hover:text-rose-200"
            aria-label="Delete list"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={setDropRef} className={cn('flex max-h-[calc(100vh-368px)] flex-col gap-3 overflow-y-auto px-0 pb-3 pr-1 transition', isOver && 'rounded-lg bg-white/5')}>
        <SortableContext items={visibleCards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {visibleCards.map((card) => (
              <CardItem key={card.id} card={card} listId={list.id} />
            ))}
          </div>
        </SortableContext>
      </div>

      <div className="pt-3">
        <button
          type="button"
          onClick={() => createCard(list.id, 'New card')}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#61BD4F] px-3 py-2.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Add a card
        </button>
      </div>
    </motion.div>
  );
}
