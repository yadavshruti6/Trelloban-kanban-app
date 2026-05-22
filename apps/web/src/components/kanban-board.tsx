"use client";

import { closestCenter, DndContext, DragEndEvent, DragOverlay, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { matchesCardQuery, useActiveBoard, useKanbanStore } from '@/store/use-kanban-store';
import { ListColumn } from '@/components/list-column';
import { CardItem } from '@/components/card-item';
import { CardModal } from '@/components/card-modal';

export function KanbanBoard() {
  const { board, lists } = useActiveBoard();
  const boardState = useKanbanStore((state) => state);
  const labels = useKanbanStore((state) => state.labels);
  const members = useKanbanStore((state) => state.members);
  const search = useKanbanStore((state) => state.filters.search);
  const labelFilter = useKanbanStore((state) => state.filters.labelId);
  const memberFilter = useKanbanStore((state) => state.filters.memberId);
  const dueDateFilter = useKanbanStore((state) => state.filters.dueDate);
  const checklistFilter = useKanbanStore((state) => state.filters.checklist);
  const moveCard = useKanbanStore((state) => state.moveCard);
  const reorderLists = useKanbanStore((state) => state.reorderLists);
  const selectedCardId = useKanbanStore((state) => state.selectedCardId);
  const selectCard = useKanbanStore((state) => state.selectCard);

  const [activeDragCardId, setActiveDragCardId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const filteredLists = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return lists
      .map((list) => {
        const cards = list.cardIds
          .map((cardId) => boardState.cards[cardId])
          .filter((card) => {
            if (!card || card.archived) {
              return false;
            }

            const dueDate = card.dueDate ? new Date(card.dueDate) : null;

            if (labelFilter && !card.labelIds.includes(labelFilter)) {
              return false;
            }

            if (memberFilter && !card.memberIds.includes(memberFilter)) {
              return false;
            }

            if (dueDateFilter === 'overdue' && (!dueDate || dueDate >= today)) {
              return false;
            }

            if (dueDateFilter === 'today' && (!dueDate || dueDate.toDateString() !== today.toDateString())) {
              return false;
            }

            if (dueDateFilter === 'week') {
              const oneWeek = new Date(today);
              oneWeek.setDate(today.getDate() + 7);

              if (!dueDate || dueDate > oneWeek) {
                return false;
              }
            }

            if (dueDateFilter === 'completed' && !card.dueCompleted) {
              return false;
            }

            if (checklistFilter === 'completed' && card.checklistItems.length > 0 && !card.checklistItems.every((item) => item.completed)) {
              return false;
            }

            if (checklistFilter === 'incomplete' && card.checklistItems.length > 0 && card.checklistItems.every((item) => item.completed)) {
              return false;
            }

            return matchesCardQuery(card, search, {
              boardTitle: board?.title,
              listTitle: list.title,
              labels,
              members
            });
          });

        return { ...list, cards };
      })
      .filter((list) => list.cards.length > 0 || search === '' || labelFilter !== null || memberFilter !== null || dueDateFilter !== 'all' || checklistFilter !== 'all');
  }, [board?.title, boardState.cards, checklistFilter, dueDateFilter, labelFilter, labels, lists, memberFilter, members, search]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDragCardId(null);

    if (!over) {
      return;
    }

    if (active.id === over.id) {
      return;
    }

    if (active.data.current?.type === 'list' && over.data.current?.type === 'list') {
      const orderedListIds = [...lists.map((list) => list.id)];
      const sourceIndex = orderedListIds.indexOf(String(active.id));
      const targetIndex = orderedListIds.indexOf(String(over.id));

      if (sourceIndex === -1 || targetIndex === -1) {
        return;
      }

      orderedListIds.splice(sourceIndex, 1);
      orderedListIds.splice(targetIndex, 0, String(active.id));
      reorderLists(orderedListIds);
      return;
    }

    if (active.data.current?.type !== 'card') {
      return;
    }

    const sourceListId = String(active.data.current.listId);
    const overData = over.data.current as { type?: string; listId?: string } | undefined;
    const overType = overData?.type;
    const overCardId = overType === 'card' ? String(over.id) : null;
    const targetListId = overType === 'card'
      ? overData?.listId ?? null
      : overType === 'card-list'
        ? overData?.listId ?? null
        : overType === 'list'
          ? String(over.id)
          : null;

    if (!sourceListId || !targetListId) {
      return;
    }

    moveCard({
      cardId: String(active.id),
      sourceListId,
      targetListId,
      targetCardId: overCardId
    });
  }

  const activeCard = activeDragCardId ? boardState.cards[activeDragCardId] : null;

  if (!board) {
    return (
      <section className="flex flex-1 items-center justify-center rounded-[2rem] border border-white/10 bg-white/10 p-10 text-center text-white/70 shadow-[0_18px_50px_rgba(2,6,23,0.12)] backdrop-blur-md">
        No board selected.
      </section>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event) => setActiveDragCardId(event.active.data.current?.type === 'card' ? String(event.active.id) : null)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDragCardId(null)}
    >
      <motion.section
        className="relative flex min-h-0 flex-1 flex-col rounded-2xl border border-white/10 bg-transparent shadow-none backdrop-blur-[1px]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, ease: 'easeOut' }}
      >
        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden px-2 py-3 sm:px-3 md:px-4 md:py-4">
          <SortableContext items={lists.map((list) => list.id)} strategy={horizontalListSortingStrategy}>
            <div className="flex min-w-max flex-nowrap items-start gap-4 pb-2 md:gap-5">
              {filteredLists.map((list) => (
                <ListColumn key={list.id} list={list} cards={list.cards} />
              ))}
              {filteredLists.length === 0 ? (
                <div className="flex min-w-[280px] items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/10 p-5 text-center text-white shadow-[0_8px_24px_rgba(2,6,23,0.12)] backdrop-blur-md sm:min-w-[320px] md:min-w-[328px] md:p-6">
                  <div>
                    <p className="text-base font-semibold">No cards match the current filters.</p>
                    <p className="mt-1 text-sm text-white/70">Clear filters or search another card to restore the board.</p>
                  </div>
                </div>
              ) : null}
            </div>
          </SortableContext>
        </div>
      </motion.section>

      <DragOverlay>
        {activeCard ? (
          <CardItem
            card={activeCard}
            listId={activeCard.listId}
            overlay
            highlighted={matchesCardQuery(activeCard, search, {
              boardTitle: board?.title,
              listTitle: lists.find((entry) => entry.id === activeCard.listId)?.title,
              labels,
              members
            })}
          />
        ) : null}
      </DragOverlay>

      {selectedCardId ? <CardModal cardId={selectedCardId} onClose={() => selectCard(null)} /> : null}
    </DndContext>
  );
}
