import {
  Compass,
  Gift,
  Heart,
  Home,
  MapPin,
  Settings
} from 'lucide-react';

export const DEFAULT_FILTERS = {
  budgetMax: 3000000,
  landZones: [],
  naStatuses: [],
  bankLoan: false,
  minScore: 0
};

export const SIDEBAR_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'map', label: 'Map', icon: Compass },
  { id: 'cashback', label: 'Cashback', icon: Gift },
  { id: 'saved', label: 'Saved', icon: Heart, disabled: true },
  { id: 'nearby', label: 'Nearby', icon: MapPin, disabled: true },
  { id: 'settings', label: 'Settings', icon: Settings, disabled: true }
];
