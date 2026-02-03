
export type Category = 'Work' | 'Personal' | 'Wellness' | 'Shopping' | 'Fitness' | 'Food';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  category: Category;
  completed: boolean;
  time?: string;
  date: string; // ISO string
  logoUrl?: string;
  iconName?: string; // Icon override for the task
  subtasks?: Subtask[];
  isBreakingDown?: boolean;
}

export interface CategoryTheme {
  name: Category;
  color: string;
  bgColor: string;
  icon: string;
  suggestedIcons: string[];
}

export type TabType = 'Today' | 'Upcoming' | 'Completed';
