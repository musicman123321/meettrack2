export interface MeetInfo {
  meetDate: Date;
  targetWeightClass: number;
  meetName?: string;
  location?: string;
}

export interface CurrentStats {
  weight: number;
  squatMax: number;
  benchMax: number;
  deadliftMax: number;
}

export interface LiftAttempts {
  opener: number;
  second: number;
  third: number;
  confidence: number;
}

export interface MeetGoals {
  squat: LiftAttempts;
  bench: LiftAttempts;
  deadlift: LiftAttempts;
}

export interface PowerliftingState {
  meetInfo: MeetInfo;
  currentStats: CurrentStats;
  meetGoals: MeetGoals;
  equipmentChecklist: EquipmentItem[];
  weightHistory: WeightEntry[];
  unitPreference: "kg" | "lbs";
}

export interface EquipmentItem {
  id: string;
  name: string;
  checked: boolean;
  category: "essential" | "optional" | "meet-day";
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export const WEIGHT_CLASSES = {
  men: [59, 66, 74, 83, 93, 105, 120, 120.1],
  women: [47, 52, 57, 63, 72, 84, 84.1],
};

export const DEFAULT_EQUIPMENT: EquipmentItem[] = [
  {
    id: "1",
    name: "Powerlifting Singlet",
    checked: false,
    category: "essential",
  },
  { id: "2", name: "Powerlifting Belt", checked: false, category: "essential" },
  {
    id: "3",
    name: "Powerlifting Shoes",
    checked: false,
    category: "essential",
  },
  { id: "4", name: "Knee Sleeves", checked: false, category: "optional" },
  { id: "5", name: "Wrist Wraps", checked: false, category: "optional" },
  { id: "6", name: "Chalk", checked: false, category: "essential" },
  { id: "7", name: "Towel", checked: false, category: "optional" },
  { id: "8", name: "Water Bottle", checked: false, category: "meet-day" },
  { id: "9", name: "Snacks", checked: false, category: "meet-day" },
  { id: "10", name: "Meet Registration", checked: false, category: "meet-day" },
  {
    id: "11",
    name: "Weigh-in Confirmation",
    checked: false,
    category: "meet-day",
  },
];
