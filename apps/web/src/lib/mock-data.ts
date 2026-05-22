import type { KanbanState } from '@/types/kanban';

export const mockKanbanState: KanbanState = {
  boards: [
    {
      id: 'board-1',
      title: 'Product Roadmap',
      description: 'Ship the next generation Trelloban experience.',
      listIds: ['list-1', 'list-2', 'list-3'],
      labelIds: ['label-1', 'label-2', 'label-3'],
      memberIds: ['member-1', 'member-2', 'member-3'],
      visibility: 'workspace',
      createdAt: '2026-05-18T09:00:00.000Z',
      background: {
        kind: 'gradient',
        value: 'linear-gradient(120deg, #0f172a 0%, #1d4ed8 45%, #0ea5e9 100%)',
        overlay: 'rgba(2, 6, 23, 0.36)'
      }
    },
    {
      id: 'board-2',
      title: 'Marketing Launch',
      description: 'Coordinate launch assets and timelines.',
      listIds: ['list-4', 'list-5'],
      labelIds: ['label-4', 'label-5'],
      memberIds: ['member-4', 'member-5'],
      visibility: 'workspace',
      createdAt: '2026-05-19T09:00:00.000Z',
      background: {
        kind: 'gradient',
        value: 'linear-gradient(120deg, #111827 0%, #7c3aed 38%, #f43f5e 100%)',
        overlay: 'rgba(3, 7, 18, 0.4)'
      }
    }
  ],
  lists: {
    'list-1': { id: 'list-1', boardId: 'board-1', title: 'Backlog', position: 0, cardIds: ['card-1', 'card-2'] },
    'list-2': { id: 'list-2', boardId: 'board-1', title: 'In Progress', position: 1, cardIds: ['card-3'] },
    'list-3': { id: 'list-3', boardId: 'board-1', title: 'Done', position: 2, cardIds: ['card-4'] },
    'list-4': { id: 'list-4', boardId: 'board-2', title: 'Planning', position: 0, cardIds: ['card-5'] },
    'list-5': { id: 'list-5', boardId: 'board-2', title: 'Execution', position: 1, cardIds: ['card-6'] }
  },
  cards: {
    'card-1': {
      id: 'card-1',
      listId: 'list-1',
      title: 'Design board shell',
      description: 'Build a Trello-like board with clean spacing and responsive layout.',
      position: 0,
      archived: false,
      dueDate: '2026-05-30',
      labelIds: ['label-1', 'label-3'],
      memberIds: ['member-1'],
      checklistItems: [
        { id: 'check-1', title: 'Sidebar', completed: true, position: 0 },
        { id: 'check-2', title: 'Topbar', completed: true, position: 1 },
        { id: 'check-3', title: 'Board view', completed: false, position: 2 }
      ],
      attachmentCount: 2,
      activities: [{ id: 'activity-1', type: 'comment', text: 'Initial structure drafted.', createdAt: '2026-05-18T09:00:00.000Z' }],
      comments: [{ id: 'comment-1', memberId: 'member-1', text: 'Need final spacing pass for cards.', createdAt: '2026-05-20T11:30:00.000Z' }]
    },
    'card-2': {
      id: 'card-2',
      listId: 'list-1',
      title: 'Build filter popover',
      description: 'Let users filter cards by labels, members, and due date.',
      position: 1,
      archived: false,
      dueDate: '2026-05-27',
      labelIds: ['label-2'],
      memberIds: ['member-2'],
      checklistItems: [],
      attachmentCount: 1,
      activities: [],
      comments: []
    },
    'card-3': {
      id: 'card-3',
      listId: 'list-2',
      title: 'Implement drag and drop',
      description: 'Support list reorder and card movement across lists.',
      position: 0,
      archived: false,
      dueDate: '2026-05-29',
      labelIds: ['label-1'],
      memberIds: ['member-1', 'member-3'],
      checklistItems: [],
      attachmentCount: 3,
      activities: [],
      comments: []
    },
    'card-4': {
      id: 'card-4',
      listId: 'list-3',
      title: 'Seed sample data',
      description: 'Add realistic boards, lists, and cards to make the app feel alive.',
      position: 0,
      archived: false,
      dueDate: null,
      labelIds: ['label-3'],
      memberIds: ['member-2'],
      checklistItems: [],
      attachmentCount: 0,
      activities: [],
      comments: []
    },
    'card-5': {
      id: 'card-5',
      listId: 'list-4',
      title: 'Create campaign plan',
      description: 'Outline all launch milestones and dependencies.',
      position: 0,
      archived: false,
      dueDate: '2026-06-05',
      labelIds: ['label-4'],
      memberIds: ['member-4'],
      checklistItems: [],
      attachmentCount: 1,
      activities: [],
      comments: []
    },
    'card-6': {
      id: 'card-6',
      listId: 'list-5',
      title: 'Publish launch assets',
      description: 'Track final creative and copy approvals.',
      position: 0,
      archived: false,
      dueDate: '2026-06-12',
      labelIds: ['label-5'],
      memberIds: ['member-5'],
      checklistItems: [],
      attachmentCount: 2,
      activities: [],
      comments: []
    }
  },
  labels: {
    'label-1': { id: 'label-1', boardId: 'board-1', name: 'Design', color: '#0ea5e9' },
    'label-2': { id: 'label-2', boardId: 'board-1', name: 'Engineering', color: '#f97316' },
    'label-3': { id: 'label-3', boardId: 'board-1', name: 'Ops', color: '#22c55e' },
    'label-4': { id: 'label-4', boardId: 'board-2', name: 'Marketing', color: '#8b5cf6' },
    'label-5': { id: 'label-5', boardId: 'board-2', name: 'Launch', color: '#ef4444' }
  },
  members: {
    'member-1': { id: 'member-1', boardId: 'board-1', name: 'Alex Morgan', role: 'Product Designer' },
    'member-2': { id: 'member-2', boardId: 'board-1', name: 'Jamie Chen', role: 'Engineering Lead' },
    'member-3': { id: 'member-3', boardId: 'board-1', name: 'Sam Patel', role: 'Frontend Engineer' },
    'member-4': { id: 'member-4', boardId: 'board-2', name: 'Taylor Brooks', role: 'Marketing Manager' },
    'member-5': { id: 'member-5', boardId: 'board-2', name: 'Jordan Lee', role: 'Content Strategist' }
  }
};
