import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useState,
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
import { supabase } from "../../supabase/supabase";
import { useAuth } from "../../supabase/auth";
import type { Database } from "../types/supabase";

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
  loading: boolean;
  error: string | null;
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
  refreshData: () => Promise<void>;
  saveCurrentStats: (stats: CurrentStats) => Promise<void>;
  saveMeetGoals: (goals: MeetGoals) => Promise<void>;
  saveMeetInfo: (info: MeetInfo) => Promise<void>;
  addWeightEntry: (entry: WeightEntry) => Promise<void>;
  toggleEquipmentItem: (itemId: string) => Promise<void>;
}

const PowerliftingContext = createContext<PowerliftingContextType | undefined>(
  undefined,
);

export function PowerliftingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(powerliftingReducer, initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Debug logging function
  const debugLog = (message: string, data?: any) => {
    console.log(`[PowerliftingContext] ${message}`, data || "");
  };

  // Error logging function
  const errorLog = (message: string, error: any) => {
    console.error(`[PowerliftingContext] ${message}`, error);
    setError(message);
  };

  // Fetch user data from Supabase
  const fetchUserData = async () => {
    if (!user?.id) {
      debugLog("No user found, skipping data fetch");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      debugLog("Fetching user data for user:", user.id);

      // Fetch current stats
      debugLog("Fetching current stats...");
      const { data: currentStatsData, error: statsError } = await supabase
        .from("current_stats")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (statsError) {
        errorLog("Error fetching current stats", statsError);
        throw new Error(`Failed to fetch current stats: ${statsError.message}`);
      }
      debugLog("Current stats fetched:", currentStatsData);

      // Fetch active meet
      debugLog("Fetching active meet...");
      const { data: meetData, error: meetError } = await supabase
        .from("meets")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (meetError) {
        errorLog("Error fetching meet data", meetError);
        throw new Error(`Failed to fetch meet data: ${meetError.message}`);
      }
      debugLog("Meet data fetched:", meetData);

      // Fetch meet goals
      debugLog("Fetching meet goals...");
      const { data: meetGoalsData, error: goalsError } = await supabase
        .from("meet_goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("meet_id", meetData?.id || "00000000-0000-0000-0000-000000000000");

      if (goalsError) {
        errorLog("Error fetching meet goals", goalsError);
        throw new Error(`Failed to fetch meet goals: ${goalsError.message}`);
      }
      debugLog("Meet goals fetched:", meetGoalsData);

      // Fetch weight history
      debugLog("Fetching weight history...");
      const { data: weightHistoryData, error: weightError } = await supabase
        .from("weight_history")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(30);

      if (weightError) {
        errorLog("Error fetching weight history", weightError);
        throw new Error(
          `Failed to fetch weight history: ${weightError.message}`,
        );
      }
      debugLog("Weight history fetched:", weightHistoryData);

      // Fetch equipment checklist
      debugLog("Fetching equipment checklist...");
      const { data: equipmentData, error: equipmentError } = await supabase
        .from("equipment_checklist")
        .select("*")
        .eq("user_id", user.id);

      if (equipmentError) {
        errorLog("Error fetching equipment checklist", equipmentError);
        throw new Error(
          `Failed to fetch equipment checklist: ${equipmentError.message}`,
        );
      }
      debugLog("Equipment checklist fetched:", equipmentData);

      // Initialize default equipment if none exists
      if (!equipmentData || equipmentData.length === 0) {
        debugLog("No equipment found, initializing defaults...");
        await initializeDefaultEquipment();
        // Refetch equipment after initialization
        const { data: newEquipmentData } = await supabase
          .from("equipment_checklist")
          .select("*")
          .eq("user_id", user.id);
        debugLog("Default equipment initialized:", newEquipmentData);
      }

      // Transform and set data
      const newState: PowerliftingState = {
        meetInfo: meetData
          ? {
              meetDate: new Date(meetData.meet_date),
              targetWeightClass: meetData.target_weight_class,
              meetName: meetData.meet_name || "",
              location: meetData.location || "",
            }
          : initialState.meetInfo,
        currentStats: currentStatsData
          ? {
              weight: currentStatsData.weight,
              squatMax: currentStatsData.squat_max,
              benchMax: currentStatsData.bench_max,
              deadliftMax: currentStatsData.deadlift_max,
            }
          : initialState.currentStats,
        meetGoals: transformMeetGoalsFromDB(meetGoalsData || []),
        equipmentChecklist:
          equipmentData?.length > 0
            ? transformEquipmentFromDB(equipmentData)
            : DEFAULT_EQUIPMENT,
        weightHistory:
          weightHistoryData?.map((entry) => ({
            date: entry.date,
            weight: entry.weight,
          })) || [],
      };

      debugLog("Successfully fetched user data:", newState);
      dispatch({ type: "LOAD_STATE", payload: newState });
    } catch (err: any) {
      errorLog("Error fetching user data", err);
    } finally {
      setLoading(false);
    }
  };

  // Transform meet goals from database format
  const transformMeetGoalsFromDB = (goalsData: any[]): MeetGoals => {
    const goals: MeetGoals = {
      squat: { opener: 125, second: 140, third: 150, confidence: 8 },
      bench: { opener: 90, second: 100, third: 107.5, confidence: 7 },
      deadlift: { opener: 162.5, second: 180, third: 190, confidence: 9 },
    };

    goalsData.forEach((goal) => {
      if (goal.lift_type in goals) {
        goals[goal.lift_type as keyof MeetGoals] = {
          opener: goal.opener,
          second: goal.second,
          third: goal.third,
          confidence: goal.confidence,
        };
      }
    });

    return goals;
  };

  // Transform equipment from database format
  const transformEquipmentFromDB = (equipmentData: any[]): EquipmentItem[] => {
    return equipmentData.map((item) => ({
      id: item.id,
      name: item.name,
      checked: item.checked,
      category: item.category,
    }));
  };

  // Initialize default equipment for new users
  const initializeDefaultEquipment = async () => {
    if (!user?.id) return;

    try {
      debugLog("Initializing default equipment for new user");
      const equipmentToInsert = DEFAULT_EQUIPMENT.map((item) => ({
        user_id: user.id,
        name: item.name,
        category: item.category,
        checked: false,
        custom_item: false,
      }));

      const { error } = await supabase
        .from("equipment_checklist")
        .insert(equipmentToInsert);

      if (error) {
        throw new Error(`Failed to initialize equipment: ${error.message}`);
      }

      debugLog("Successfully initialized default equipment");
    } catch (err: any) {
      errorLog("Error initializing default equipment", err);
    }
  };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setLoading(false);
      dispatch({ type: "LOAD_STATE", payload: initialState });
    }
  }, [user]);

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

  // Save current stats to Supabase
  const saveCurrentStats = async (stats: CurrentStats) => {
  if (!user?.id) {
    errorLog("No user found when saving current stats", null);
    return;
  }

  try {
    debugLog("Saving current stats:", stats);
    
    // First try to update existing record
    const { error: updateError } = await supabase
      .from("current_stats")
      .update({
        weight: stats.weight,
        squat_max: stats.squatMax,
        bench_max: stats.benchMax,
        deadlift_max: stats.deadliftMax,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    // If no record exists, insert a new one
    if (updateError?.code === 'PGRST116') { // No rows affected
      const { error: insertError } = await supabase
        .from("current_stats")
        .insert({
          user_id: user.id,
          weight: stats.weight,
          squat_max: stats.squatMax,
          bench_max: stats.benchMax,
          deadlift_max: stats.deadliftMax,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;
    } else if (updateError) {
      throw updateError;
    }

    debugLog("Successfully saved current stats");
    dispatch({ type: "SET_CURRENT_STATS", payload: stats });
  } catch (err: any) {
    errorLog("Error saving current stats", err);
    throw err; // Re-throw to handle in calling function
  }
};

  // Save meet goals to Supabase
  const saveMeetGoals = async (goals: MeetGoals) => {
    if (!user?.id) {
      errorLog("No user found when saving meet goals", null);
      return;
    }

    try {
      debugLog("Saving meet goals:", goals);

      // Get active meet ID
      const { data: meetData } = await supabase
        .from("meets")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      const meetId = meetData?.id;
      if (!meetId) {
        throw new Error("No active meet found");
      }

      // Prepare goals data for upsert
      const goalsToUpsert = Object.entries(goals).map(
        ([liftType, attempts]) => ({
          user_id: user.id,
          meet_id: meetId,
          lift_type: liftType,
          opener: attempts.opener,
          second: attempts.second,
          third: attempts.third,
          confidence: attempts.confidence,
        }),
      );

      const { error } = await supabase
        .from("meet_goals")
        .upsert(goalsToUpsert, {
          onConflict: "user_id,meet_id,lift_type",
        });

      if (error) {
        throw new Error(`Failed to save meet goals: ${error.message}`);
      }

      debugLog("Successfully saved meet goals");
      dispatch({ type: "SET_MEET_GOALS", payload: goals });
    } catch (err: any) {
      errorLog("Error saving meet goals", err);
    }
  };

  // Save meet info to Supabase
  const saveMeetInfo = async (info: MeetInfo) => {
    if (!user?.id) {
      errorLog("No user found when saving meet info", null);
      return;
    }

    try {
      debugLog("Saving meet info:", info);
      const { error } = await supabase.from("meets").upsert({
        user_id: user.id,
        meet_name: info.meetName || "",
        meet_date: info.meetDate.toISOString().split("T")[0],
        location: info.location || "",
        target_weight_class: info.targetWeightClass,
        is_active: true,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw new Error(`Failed to save meet info: ${error.message}`);
      }

      debugLog("Successfully saved meet info");
      dispatch({ type: "SET_MEET_INFO", payload: info });
    } catch (err: any) {
      errorLog("Error saving meet info", err);
    }
  };

  // Add weight entry to Supabase
  const addWeightEntry = async (entry: WeightEntry) => {
    if (!user?.id) {
      errorLog("No user found when adding weight entry", null);
      return;
    }

    try {
      debugLog("Adding weight entry:", entry);
      const { error } = await supabase.from("weight_history").insert({
        user_id: user.id,
        weight: entry.weight,
        date: entry.date,
      });

      if (error) {
        throw new Error(`Failed to add weight entry: ${error.message}`);
      }

      debugLog("Successfully added weight entry");
      dispatch({ type: "ADD_WEIGHT_ENTRY", payload: entry });
    } catch (err: any) {
      errorLog("Error adding weight entry", err);
    }
  };

  // Toggle equipment item in Supabase
  const toggleEquipmentItem = async (itemId: string) => {
    if (!user?.id) {
      errorLog("No user found when toggling equipment", null);
      return;
    }

    try {
      debugLog("Toggling equipment item:", itemId);
      const item = state.equipmentChecklist.find((item) => item.id === itemId);
      if (!item) {
        throw new Error("Equipment item not found");
      }

      const { error } = await supabase
        .from("equipment_checklist")
        .update({ checked: !item.checked })
        .eq("id", itemId)
        .eq("user_id", user.id);

      if (error) {
        throw new Error(`Failed to toggle equipment: ${error.message}`);
      }

      debugLog("Successfully toggled equipment item");
      dispatch({ type: "TOGGLE_EQUIPMENT", payload: itemId });
    } catch (err: any) {
      errorLog("Error toggling equipment item", err);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    await fetchUserData();
  };

  return (
    <PowerliftingContext.Provider
      value={{
        state,
        dispatch,
        loading,
        error,
        calculateWilks,
        calculateDots,
        getDaysUntilMeet,
        getProgressPercentage,
        refreshData,
        saveCurrentStats,
        saveMeetGoals,
        saveMeetInfo,
        addWeightEntry,
        toggleEquipmentItem,
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
