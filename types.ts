
export type Category = 'Work' | 'Personal' | 'Wellness' | 'Shopping' | 'Fitness' | 'Food';

export interface Task {
  id: string;
  title: string;
  category: Category;
  completed: boolean;
  time?: string;
  date: string; // ISO string
  logoUrl?: string;
}

export interface CategoryTheme {
  name: Category;
  color: string;
  bgColor: string;
  icon: string;
}

export type TabType = 'Today' | 'Upcoming' | 'Completed';
