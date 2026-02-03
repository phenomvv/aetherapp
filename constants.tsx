
import React from 'react';
import { 
  Briefcase, User, Heart, ShoppingCart, Activity, Utensils, 
  Coffee, Pizza, Apple, Carrot, Soup, UtensilsCrossed, Salad, Candy, IceCream, 
  Beer, Wine, GlassWater, Dumbbell, Moon, Zap, 
  Code, Terminal, Mail, Book, Presentation, FileText,
  Plane, MapPin, Car,
  Home, Trash2, Camera, Tv,
  Gamepad2, Music, Film,
  Star, Bookmark, Tag, Gift, CreditCard, Package,
  Wind, Sun, Droplets
} from 'lucide-react';
import { Category, CategoryTheme } from './types';

export const CATEGORIES: CategoryTheme[] = [
  { 
    name: 'Work', 
    color: '#818CF8', 
    bgColor: 'rgba(129, 140, 248, 0.1)', 
    icon: 'Briefcase',
    suggestedIcons: ['Briefcase', 'Code', 'Terminal', 'Mail', 'Book', 'Presentation', 'FileText', 'Zap', 'Star']
  },
  { 
    name: 'Personal', 
    color: '#C084FC', 
    bgColor: 'rgba(192, 132, 252, 0.1)', 
    icon: 'User',
    suggestedIcons: ['User', 'Home', 'Camera', 'Tv', 'Gamepad2', 'Music', 'Film', 'Plane', 'MapPin', 'Star', 'Bookmark']
  },
  { 
    name: 'Wellness', 
    color: '#2DD4BF', 
    bgColor: 'rgba(45, 212, 191, 0.1)', 
    icon: 'Heart',
    suggestedIcons: ['Heart', 'Moon', 'Zap', 'Wind', 'Sun', 'Droplets', 'Soup', 'Carrot', 'Apple', 'Activity']
  },
  { 
    name: 'Shopping', 
    color: '#F472B6', 
    bgColor: 'rgba(244, 114, 182, 0.1)', 
    icon: 'ShoppingCart',
    suggestedIcons: ['ShoppingCart', 'CreditCard', 'Package', 'Tag', 'Gift', 'Car', 'Apple', 'Star']
  },
  { 
    name: 'Fitness', 
    color: '#FB923C', 
    bgColor: 'rgba(251, 146, 60, 0.1)', 
    icon: 'Activity',
    suggestedIcons: ['Activity', 'Dumbbell', 'Zap', 'Heart', 'Carrot', 'MapPin', 'Wind', 'Sun']
  },
  { 
    name: 'Food', 
    color: '#FCD34D', 
    bgColor: 'rgba(252, 211, 77, 0.1)', 
    icon: 'Utensils',
    suggestedIcons: ['Utensils', 'UtensilsCrossed', 'Salad', 'Pizza', 'Coffee', 'IceCream', 'Candy', 'Beer', 'Wine', 'GlassWater', 'Apple', 'Carrot', 'Soup']
  },
];

export const ICON_MAP: Record<string, React.ReactNode> = {
  Briefcase: <Briefcase className="w-4 h-4" />,
  User: <User className="w-4 h-4" />,
  Heart: <Heart className="w-4 h-4" />,
  ShoppingCart: <ShoppingCart className="w-4 h-4" />,
  Activity: <Activity className="w-4 h-4" />,
  Utensils: <Utensils className="w-4 h-4" />,
  Coffee: <Coffee className="w-4 h-4" />,
  Pizza: <Pizza className="w-4 h-4" />,
  UtensilsCrossed: <UtensilsCrossed className="w-4 h-4" />,
  Salad: <Salad className="w-4 h-4" />,
  Candy: <Candy className="w-4 h-4" />,
  IceCream: <IceCream className="w-4 h-4" />,
  Beer: <Beer className="w-4 h-4" />,
  Wine: <Wine className="w-4 h-4" />,
  GlassWater: <GlassWater className="w-4 h-4" />,
  Apple: <Apple className="w-4 h-4" />,
  Carrot: <Carrot className="w-4 h-4" />,
  Soup: <Soup className="w-4 h-4" />,
  Dumbbell: <Dumbbell className="w-4 h-4" />,
  Moon: <Moon className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  Code: <Code className="w-4 h-4" />,
  Terminal: <Terminal className="w-4 h-4" />,
  Mail: <Mail className="w-4 h-4" />,
  Book: <Book className="w-4 h-4" />,
  Presentation: <Presentation className="w-4 h-4" />,
  FileText: <FileText className="w-4 h-4" />,
  Plane: <Plane className="w-4 h-4" />,
  MapPin: <MapPin className="w-4 h-4" />,
  Car: <Car className="w-4 h-4" />,
  Home: <Home className="w-4 h-4" />,
  Trash2: <Trash2 className="w-4 h-4" />,
  Camera: <Camera className="w-4 h-4" />,
  Tv: <Tv className="w-4 h-4" />,
  Gamepad2: <Gamepad2 className="w-4 h-4" />,
  Music: <Music className="w-4 h-4" />,
  Film: <Film className="w-4 h-4" />,
  Star: <Star className="w-4 h-4" />,
  Bookmark: <Bookmark className="w-4 h-4" />,
  Tag: <Tag className="w-4 h-4" />,
  Gift: <Gift className="w-4 h-4" />,
  CreditCard: <CreditCard className="w-4 h-4" />,
  Package: <Package className="w-4 h-4" />,
  Wind: <Wind className="w-4 h-4" />,
  Sun: <Sun className="w-4 h-4" />,
  Droplets: <Droplets className="w-4 h-4" />
};

export const getCategoryIcon = (category: Category) => {
  const cat = CATEGORIES.find(c => c.name === category);
  return ICON_MAP[cat?.icon || 'Briefcase'];
};

export const getIconByName = (name: string) => {
  return ICON_MAP[name] || <Briefcase className="w-4 h-4" />;
};

export const getCategoryTheme = (category: Category) => {
  return CATEGORIES.find(c => c.name === category) || CATEGORIES[0];
};
