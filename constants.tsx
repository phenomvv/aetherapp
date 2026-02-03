
import React from 'react';
import { Briefcase, User, Heart, ShoppingCart, Activity, Utensils } from 'lucide-react';
import { Category, CategoryTheme } from './types';

export const CATEGORIES: CategoryTheme[] = [
  { name: 'Work', color: '#818CF8', bgColor: 'rgba(129, 140, 248, 0.1)', icon: 'briefcase' },
  { name: 'Personal', color: '#C084FC', bgColor: 'rgba(192, 132, 252, 0.1)', icon: 'user' },
  { name: 'Wellness', color: '#2DD4BF', bgColor: 'rgba(45, 212, 191, 0.1)', icon: 'heart' },
  { name: 'Shopping', color: '#F472B6', bgColor: 'rgba(244, 114, 182, 0.1)', icon: 'shopping-cart' },
  { name: 'Fitness', color: '#FB923C', bgColor: 'rgba(251, 146, 60, 0.1)', icon: 'activity' },
  { name: 'Food', color: '#FCD34D', bgColor: 'rgba(252, 211, 77, 0.1)', icon: 'utensils' },
];

export const getCategoryIcon = (category: Category) => {
  switch (category) {
    case 'Work': return <Briefcase className="w-4 h-4" />;
    case 'Personal': return <User className="w-4 h-4" />;
    case 'Wellness': return <Heart className="w-4 h-4" />;
    case 'Shopping': return <ShoppingCart className="w-4 h-4" />;
    case 'Fitness': return <Activity className="w-4 h-4" />;
    case 'Food': return <Utensils className="w-4 h-4" />;
    default: return <Briefcase className="w-4 h-4" />;
  }
};

export const getCategoryTheme = (category: Category) => {
  return CATEGORIES.find(c => c.name === category) || CATEGORIES[0];
};
