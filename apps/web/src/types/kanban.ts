export type Id = string;

export type BoardBackgroundKind = 'gradient' | 'wallpaper' | 'custom';

export type BoardVisibility = 'private' | 'workspace' | 'public';

export type BoardBackground = {
  kind: BoardBackgroundKind;
  value: string;
  overlay: string;
};

export type Board = {
  id: Id;
  title: string;
  description?: string;
  listIds: Id[];
  labelIds: Id[];
  memberIds: Id[];
  background: BoardBackground;
  visibility: BoardVisibility;
  createdAt?: string;
};

export type List = {
  id: Id;
  boardId: Id;
  title: string;
  position: number;
  cardIds: Id[];
};

export type Label = {
  id: Id;
  boardId: Id;
  name: string;
  color: string;
};

export type Member = {
  id: Id;
  boardId: Id;
  name: string;
  role: string;
  avatarUrl?: string;
};

export type ChecklistItem = {
  id: Id;
  title: string;
  completed: boolean;
  position: number;
};

export type Activity = {
  id: Id;
  type: string;
  text: string;
  createdAt: string;
};

export type Comment = {
  id: Id;
  memberId?: Id;
  text: string;
  createdAt: string;
};

export type Card = {
  id: Id;
  listId: Id;
  title: string;
  description?: string;
  coverImage?: string | null;
  position: number;
  archived: boolean;
  dueDate?: string | null;
  dueReminder?: string | null;
  dueCompleted?: boolean;
  labelIds: Id[];
  memberIds: Id[];
  checklistItems: ChecklistItem[];
  activities: Activity[];
  comments: Comment[];
  attachments?: Array<{
    id: Id;
    name: string;
    url: string;
    mimeType?: string;
    size?: number;
  }>;
  attachmentCount?: number;
};

export type KanbanState = {
  boards: Board[];
  lists: Record<Id, List>;
  cards: Record<Id, Card>;
  labels: Record<Id, Label>;
  members: Record<Id, Member>;
};
