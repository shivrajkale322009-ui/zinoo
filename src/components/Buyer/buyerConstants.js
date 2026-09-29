import {
  Compass,
  Calculator,
  Heart,
  Home,
  MapPin,
  Settings
} from 'lucide-react';

export const DEFAULT_FILTERS = {
  budgetMin: 400000,
  budgetMax: 5000000,
  landZones: [],
  zones: [],
  naStatuses: [],
  bankLoan: false,
  installmentMax: 0,
  verified: false,
  minScore: 0
};

export const SIDEBAR_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'map', label: 'Map', icon: Compass },
  { id: 'saved', label: 'Saved', icon: Heart },
  { id: 'loan', label: 'Loan', icon: Calculator },
  { id: 'nearby', label: 'Nearby', icon: MapPin, disabled: true },
  { id: 'settings', label: 'Settings', icon: Settings, disabled: true }
];
