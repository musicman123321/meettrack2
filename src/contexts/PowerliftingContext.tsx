import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import {
  PowerliftingState,
  MeetInfo,
  CurrentStats,
  MeetGoals,
  EquipmentItem,
  WeightEntry,
  DEFAULT_EQUIPMENT,
} from "../types/powerlifting";

type PowerliftingAction =
  | { type: "SET_MEET_INFO"; payload: MeetInfo }
  | { type: "SET_CURRENT_STATS"; payload: CurrentStats }
  | { type: "SET_MEET_GOALS"; payload: MeetGoals }
  | {
      type: "UPDATE_LIFT_ATTEMPTS";
      payload: { lift: "squat" | "bench" | "deadlift"; attempts: any };
    }
  | { type: "TOGGLE_EQUIPMENT"; payload: string }
  | { type: "ADD_WEIGHT_ENTRY"; payload: WeightEntry }
  | { type: "LOAD_STATE"; payload: PowerliftingState };

const initialState: PowerliftingState = {
  meetInfo: {
    meetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    targetWeightClass: 83,
    meetName: "",
    location: "",
  },
  currentStats: {
    weight: 80,
    squatMax: 140,
    benchMax: 100,
    deadliftMax: 180,
  },
  meetGoals: {
    squat: { opener: 125, second: 140, third: 150, confidence: 8 },
    bench: { opener: 90, second: 100, third: 107.5, confidence: 7 },
    deadlift: { opener: 162.5, second: 180, third: 190, confidence: 9 },
  },
  equipmentChecklist: DEFAULT_EQUIPMENT,
  weightHistory: [{ date: new Date().toISOString().split("T")[0], weight: 80 }],
};

function powerliftingReducer(
  state: PowerliftingState,
  action: PowerliftingAction,
): PowerliftingState {
  switch (action.type) {
    case "SET_MEET_INFO":
      return { ...state, meetInfo: action.payload };
    case "SET_CURRENT_STATS":
      return { ...state, currentStats: action.payload };
    case "SET_MEET_GOALS":
      return { ...state, meetGoals: action.payload };
    case "UPDATE_LIFT_ATTEMPTS":
      return {
        ...state,
        meetGoals: {
          ...state.meetGoals,
          [action.payload.lift]: action.payload.attempts,
        },
      };
    case "TOGGLE_EQUIPMENT":
      return {
        ...state,
        equipmentChecklist: state.equipmentChecklist.map((item) =>
          item.id === action.payload
            ? { ...item, checked: !item.checked }
            : item,
        ),
      };
    case "ADD_WEIGHT_ENTRY":
      return {
        ...state,
        weightHistory: [...state.weightHistory, action.payload],
      };
    case "LOAD_STATE":
      return action.payload;
    default:
      return state;
  }
}

interface PowerliftingContextType {
  state: PowerliftingState;
  dispatch: React.Dispatch<PowerliftingAction>;
  calculateWilks: (
    total: number,
    bodyweight: number,
    gender: "male" | "female",
  ) => number;
  calculateDots: (
    total: number,
    bodyweight: number,
    gender: "male" | "female",
  ) => number;
  getDaysUntilMeet: () => number;
  getProgressPercentage: (lift: "squat" | "bench" | "deadlift") => number;
}

const PowerliftingContext = createContext<PowerliftingContextType | undefined>(
  undefined,
);

export function PowerliftingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(powerliftingReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("powerliftingState");
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // Convert date string back to Date object
        parsedState.meetInfo.meetDate = new Date(parsedState.meetInfo.meetDate);
        dispatch({ type: "LOAD_STATE", payload: parsedState });
      } catch (error) {
        console.error("Error loading saved state:", error);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("powerliftingState", JSON.stringify(state));
  }, [state]);

  const calculateWilks = (
    total: number,
    bodyweight: number,
    gender: "male" | "female",
  ): number => {
    const coefficients =
      gender === "male"
        ? {
            a: -216.0475144,
            b: 16.2606339,
            c: -0.002388645,
            d: -0.00113732,
            e: 7.01863e-6,
            f: -1.291e-8,
          }
        : {
            a: 594.31747775582,
            b: -27.23842536447,
            c: 0.82112226871,
            d: -0.00930733913,
            e: 4.731582e-5,
            f: -9.054e-8,
          };

    const { a, b, c, d, e, f } = coefficients;
    const coeff =
      500 /
      (a +
        b * bodyweight +
        c * Math.pow(bodyweight, 2) +
        d * Math.pow(bodyweight, 3) +
        e * Math.pow(bodyweight, 4) +
        f * Math.pow(bodyweight, 5));
    return Math.round(total * coeff * 100) / 100;
  };

  const calculateDots = (
    total: number,
    bodyweight: number,
    gender: "male" | "female",
  ): number => {
    // Simplified DOTS calculation
    const coefficient = gender === "male" ? 0.47278 : 0.57094;
    const dots = total * (coefficient / Math.pow(bodyweight, 0.75));
    return Math.round(dots * 100) / 100;
  };

  const getDaysUntilMeet = (): number => {
    const today = new Date();
    const meetDate = new Date(state.meetInfo.meetDate);
    const diffTime = meetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getProgressPercentage = (
    lift: "squat" | "bench" | "deadlift",
  ): number => {
    const currentMax = state.currentStats[
      `${lift}Max` as keyof CurrentStats
    ] as number;
    const goalThird = state.meetGoals[lift].third;
    return Math.min(100, (currentMax / goalThird) * 100);
  };

  return (
    <PowerliftingContext.Provider
      value={{
        state,
        dispatch,
        calculateWilks,
        calculateDots,
        getDaysUntilMeet,
        getProgressPercentage,
      }}
    >
      {children}
    </PowerliftingContext.Provider>
  );
}

export function usePowerlifting() {
  const context = useContext(PowerliftingContext);
  if (context === undefined) {
    throw new Error(
      "usePowerlifting must be used within a PowerliftingProvider",
    );
  }
  return context;
}
