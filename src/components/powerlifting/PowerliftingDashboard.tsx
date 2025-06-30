import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Target,
  TrendingUp,
  Clock,
  Dumbbell,
  Scale,
  CheckSquare,
  Plus,
  Settings,
  Edit,
  CalendarDays,
  List,
  Trash2,
  HelpCircle,
} from "lucide-react";
import { usePowerlifting } from "../../contexts/PowerliftingContext";
import LiftCard from "./LiftCard";
import AnimatedProgressBar from "./AnimatedProgressBar";
import { toast } from "@/components/ui/use-toast";

interface PowerliftingDashboardProps {
  onNavigate?: (section: string) => void;
}

export default function PowerliftingDashboard({
  onNavigate,
}: PowerliftingDashboardProps) {
  const {
    state,
    loading,
    error,
    getDaysUntilMeet,
    calculateWilks,
    addWeightEntry,
    saveCurrentStats,
    saveMeetInfo,
    formatWeight,
    getAllMeets,
    setActiveMeet,
    deleteMeet,
    getProgressPercentage,
  } = usePowerlifting();

  const [quickWeightOpen, setQuickWeightOpen] = useState(false);
  const [quickWeight, setQuickWeight] = useState("");
  const [saving, setSaving] = useState(false);
  const [meetDialogOpen, setMeetDialogOpen] = useState(false);
  const [meetForm, setMeetForm] = useState({
    meetName: state.meetInfo.meetName || "",
    meetDate:
      state.meetInfo.meetDate instanceof Date
        ? state.meetInfo.meetDate.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    location: state.meetInfo.location || "",
    targetWeightClass: state.meetInfo.targetWeightClass.toString(),
  });
  const [liftEditOpen, setLiftEditOpen] = useState(false);
  const [liftEditForm, setLiftEditForm] = useState({
    squatMax: state.currentStats.squatMax.toString(),
    benchMax: state.currentStats.benchMax.toString(),
    deadliftMax: state.currentStats.deadliftMax.toString(),
  });
  const [meetListOpen, setMeetListOpen] = useState(false);
  const [meetsList, setMeetsList] = useState<any[]>([]);
  const [loadingMeets, setLoadingMeets] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your powerlifting data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading data: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const daysUntilMeet = getDaysUntilMeet();
  const totalLifts =
    state.currentStats.squatMax +
    state.currentStats.benchMax +
    state.currentStats.deadliftMax;
  const wilksScore = calculateWilks(
    totalLifts,
    state.currentStats.weight,
    "male",
  );
  const completedEquipment = state.equipmentChecklist.filter(
    (item) => item.checked,
  ).length;
  const totalEquipment = state.equipmentChecklist.length;
  const equipmentProgress = (completedEquipment / totalEquipment) * 100;

  // Calculate competition readiness with new weighting formula
  const calculateCompetitionReadiness = () => {
    // 80% - Progress toward lift goals using new goal columns
    const goalSquatMax = state.currentStats.goalSquatMax || 0;
    const goalBenchMax = state.currentStats.goalBenchMax || 0;
    const goalDeadliftMax = state.currentStats.goalDeadliftMax || 0;
    const goalTotal = goalSquatMax + goalBenchMax + goalDeadliftMax;

    let liftProgress = 0;
    if (goalTotal > 0 && totalLifts >= 0) {
      liftProgress = Math.min(100, Math.max(0, (totalLifts / goalTotal) * 100));
    }

    // 15% - Progress toward bodyweight goal
    let weightProgress = 0;
    if (state.meetInfo.targetWeightClass > 0 && state.currentStats.weight > 0) {
      if (state.currentStats.weight <= state.meetInfo.targetWeightClass) {
        weightProgress = 100;
      } else {
        const weightDiff =
          state.currentStats.weight - state.meetInfo.targetWeightClass;
        const percentageOver =
          (weightDiff / state.meetInfo.targetWeightClass) * 100;
        weightProgress = Math.max(0, 100 - percentageOver);
      }
    }

    // 5% - Equipment preparation
    const equipmentReadiness = equipmentProgress;

    const readiness =
      liftProgress * 0.8 + weightProgress * 0.15 + equipmentReadiness * 0.05;

    // Clamp between 0 and 100, handle edge cases
    const clampedReadiness = Math.min(100, Math.max(0, readiness));

    // Log for debugging if unexpected values
    if (
      isNaN(clampedReadiness) ||
      clampedReadiness === Infinity ||
      clampedReadiness === -Infinity
    ) {
      console.warn("Competition readiness calculation issue:", {
        liftProgress,
        weightProgress,
        equipmentReadiness,
        totalLifts,
        goalTotal,
        readiness,
        clampedReadiness,
      });
      return 0;
    }

    return Math.round(clampedReadiness);
  };

  const competitionReadiness = calculateCompetitionReadiness();

  // Handle quick weight logging
  const handleQuickWeightLog = async () => {
    if (!quickWeight || parseFloat(quickWeight) <= 0) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid weight.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const weightValue = parseFloat(quickWeight);

      // Add to weight history
      await addWeightEntry({
        date: new Date().toISOString().split("T")[0],
        weight: weightValue,
      });

      // Update current stats
      await saveCurrentStats({
        ...state.currentStats,
        weight: weightValue,
      });

      setQuickWeight("");
      setQuickWeightOpen(false);
      toast({
        title: "Weight logged!",
        description: `Weight of ${quickWeight}kg has been recorded.`,
      });
    } catch (error) {
      toast({
        title: "Error logging weight",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Load meets list
  const loadMeetsList = async () => {
    setLoadingMeets(true);
    try {
      const meets = await getAllMeets();
      setMeetsList(meets);
    } catch (error) {
      toast({
        title: "Error loading meets",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingMeets(false);
    }
  };

  // Handle meet selection
  const handleMeetSelection = async (meetId: string) => {
    setSaving(true);
    try {
      await setActiveMeet(meetId);
      setMeetListOpen(false);
      toast({
        title: "Meet selected!",
        description: "Your active meet has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error selecting meet",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle meet deletion
  const handleMeetDeletion = async (meetId: string, meetName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${meetName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      await deleteMeet(meetId);
      await loadMeetsList(); // Refresh the list
      toast({
        title: "Meet deleted!",
        description: "The meet has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error deleting meet",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle meet info update
  const handleMeetInfoUpdate = async () => {
    setSaving(true);
    try {
      await saveMeetInfo({
        meetName: meetForm.meetName,
        meetDate: new Date(meetForm.meetDate),
        location: meetForm.location,
        targetWeightClass: parseFloat(meetForm.targetWeightClass),
      });

      setMeetDialogOpen(false);
      toast({
        title: "Meet info updated!",
        description: "Your competition details have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error updating meet info",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle lift stats update
  const handleLiftStatsUpdate = async () => {
    setSaving(true);
    try {
      await saveCurrentStats({
        ...state.currentStats,
        squatMax: parseFloat(liftEditForm.squatMax),
        benchMax: parseFloat(liftEditForm.benchMax),
        deadliftMax: parseFloat(liftEditForm.deadliftMax),
      });

      setLiftEditOpen(false);
      toast({
        title: "Lift stats updated!",
        description: "Your current maxes have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error updating lift stats",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-3 sm:p-4 md:p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-4 md:space-y-6"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-6 md:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
            Meet Prep Tracker
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg">
            {state.meetInfo.meetName || "Your Next Competition"}
          </p>
        </motion.div>

        {/* Quick Actions Bar */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center gap-2 sm:gap-4 mb-4 md:mb-6"
        >
          <Dialog open={quickWeightOpen} onOpenChange={setQuickWeightOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base touch-target">
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Log Weight</span>
                <span className="sm:hidden">Weight</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
              <DialogHeader>
                <DialogTitle>Quick Weight Log</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Log your current weight quickly.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="quickWeight" className="text-gray-300">
                    Weight (kg)
                  </Label>
                  <Input
                    id="quickWeight"
                    type="number"
                    value={quickWeight}
                    onChange={(e) => setQuickWeight(e.target.value)}
                    placeholder="Enter current weight"
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                    step="0.1"
                    autoFocus
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setQuickWeightOpen(false)}
                  className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleQuickWeightLog}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? "Logging..." : "Log Weight"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 md:mb-8"
        >
          <Dialog open={meetDialogOpen} onOpenChange={setMeetDialogOpen}>
            <DialogTrigger asChild>
              <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer touch-target">
                <CardHeader className="pb-2 p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-400 truncate">
                      Days Until Meet
                    </CardTitle>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Edit className="h-3 w-3 text-gray-500" />
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-white">
                    {daysUntilMeet}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {state.meetInfo.meetName || "Competition"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 hidden sm:block">
                    {state.meetInfo.meetDate instanceof Date
                      ? state.meetInfo.meetDate.toLocaleDateString()
                      : new Date(state.meetInfo.meetDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-blue-400 mt-1 hidden sm:block">
                    Click to edit meet details
                  </p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Edit Meet Details</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Update your competition information.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="meetName" className="text-gray-300">
                    Meet Name
                  </Label>
                  <Input
                    id="meetName"
                    value={meetForm.meetName}
                    onChange={(e) =>
                      setMeetForm((prev) => ({
                        ...prev,
                        meetName: e.target.value,
                      }))
                    }
                    placeholder="Enter meet name"
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="meetDate" className="text-gray-300">
                    Meet Date
                  </Label>
                  <Input
                    id="meetDate"
                    type="date"
                    value={meetForm.meetDate}
                    onChange={(e) =>
                      setMeetForm((prev) => ({
                        ...prev,
                        meetDate: e.target.value,
                      }))
                    }
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-gray-300">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={meetForm.location}
                    onChange={(e) =>
                      setMeetForm((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="Enter location"
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="targetWeightClass" className="text-gray-300">
                    Target Weight Class (kg)
                  </Label>
                  <Input
                    id="targetWeightClass"
                    type="number"
                    value={meetForm.targetWeightClass}
                    onChange={(e) =>
                      setMeetForm((prev) => ({
                        ...prev,
                        targetWeightClass: e.target.value,
                      }))
                    }
                    placeholder="Enter target weight class"
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setMeetDialogOpen(false)}
                  className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleMeetInfoUpdate}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={liftEditOpen} onOpenChange={setLiftEditOpen}>
            <DialogTrigger asChild>
              <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer touch-target">
                <CardHeader className="pb-2 p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-400 truncate">
                      Current Total
                    </CardTitle>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Edit className="h-3 w-3 text-gray-500" />
                      <Dumbbell className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-white">
                    {formatWeight(totalLifts)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Wilks: {wilksScore}
                  </p>
                  <p className="text-xs text-blue-400 mt-1 hidden sm:block">
                    Click to edit lifts
                  </p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Edit Current Maxes</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Update your current one-rep max for each lift.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="squatMax" className="text-gray-300">
                    Squat Max (kg)
                  </Label>
                  <Input
                    id="squatMax"
                    type="number"
                    value={liftEditForm.squatMax}
                    onChange={(e) =>
                      setLiftEditForm((prev) => ({
                        ...prev,
                        squatMax: e.target.value,
                      }))
                    }
                    placeholder="Enter squat max"
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                    step="0.5"
                  />
                </div>
                <div>
                  <Label htmlFor="benchMax" className="text-gray-300">
                    Bench Max (kg)
                  </Label>
                  <Input
                    id="benchMax"
                    type="number"
                    value={liftEditForm.benchMax}
                    onChange={(e) =>
                      setLiftEditForm((prev) => ({
                        ...prev,
                        benchMax: e.target.value,
                      }))
                    }
                    placeholder="Enter bench max"
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                    step="0.5"
                  />
                </div>
                <div>
                  <Label htmlFor="deadliftMax" className="text-gray-300">
                    Deadlift Max (kg)
                  </Label>
                  <Input
                    id="deadliftMax"
                    type="number"
                    value={liftEditForm.deadliftMax}
                    onChange={(e) =>
                      setLiftEditForm((prev) => ({
                        ...prev,
                        deadliftMax: e.target.value,
                      }))
                    }
                    placeholder="Enter deadlift max"
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                    step="0.5"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setLiftEditOpen(false)}
                  className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleLiftStatsUpdate}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Card
            className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer touch-target"
            onClick={() => setQuickWeightOpen(true)}
          >
            <CardHeader className="pb-2 p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-400 truncate">
                  Body Weight
                </CardTitle>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Plus className="h-3 w-3 text-gray-500" />
                  <Scale className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-white">
                {formatWeight(state.currentStats.weight)}
              </div>
              <p className="text-xs text-gray-500 mt-1 truncate">
                Target: {formatWeight(state.meetInfo.targetWeightClass)} class
              </p>
              <p className="text-xs text-blue-400 mt-1 hidden sm:block">
                Click to log weight
              </p>
            </CardContent>
          </Card>

          <Dialog>
            <DialogTrigger asChild>
              <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer touch-target relative group">
                <CardHeader className="pb-2 p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-400 truncate">
                      Equipment Ready
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <HelpCircle className="h-3 w-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 flex-shrink-0" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-white">
                    {completedEquipment}/{totalEquipment}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${equipmentProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-blue-400 mt-1 hidden sm:block">
                    Click for details
                  </p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-purple-500" />
                  Equipment Readiness
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <h4 className="font-semibold text-purple-400 mb-2">
                    Current Status
                  </h4>
                  <p className="text-gray-300">
                    You have completed{" "}
                    <span className="font-bold text-white">
                      {completedEquipment} out of {totalEquipment}
                    </span>{" "}
                    equipment items.
                  </p>
                  <p className="text-gray-300 mt-1">
                    Progress:{" "}
                    <span className="font-bold text-white">
                      {Math.round(equipmentProgress)}%
                    </span>
                  </p>
                </div>

                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <h4 className="font-semibold text-blue-400 mb-2">
                    What This Means
                  </h4>
                  <p className="text-gray-300 mb-2">
                    This tracks your preparation checklist for competition day,
                    including:
                  </p>
                  <ul className="text-xs text-gray-400 space-y-1 ml-4">
                    <li>• Competition gear (singlet, shoes, belt)</li>
                    <li>• Required documents and registration</li>
                    <li>• Nutrition and recovery items</li>
                    <li>• Meet day essentials</li>
                  </ul>
                </div>

                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <h4 className="font-semibold text-green-400 mb-2">
                    Impact on Readiness
                  </h4>
                  <p className="text-gray-300">
                    Equipment preparation contributes{" "}
                    <span className="font-bold text-white">5%</span> to your
                    overall competition readiness score.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => onNavigate?.("equipment")}
                  className="bg-purple-600 hover:bg-purple-700 flex-1"
                >
                  View Full Checklist
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Lift Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          <LiftCard
            lift="squat"
            icon={<Target className="h-6 w-6 text-white" />}
            color="bg-red-500"
            bgColor="hover:bg-red-900/20"
          />
          <LiftCard
            lift="bench"
            icon={<TrendingUp className="h-6 w-6 text-white" />}
            color="bg-blue-500"
            bgColor="hover:bg-blue-900/20"
          />
          <LiftCard
            lift="deadlift"
            icon={<Dumbbell className="h-6 w-6 text-white" />}
            color="bg-green-500"
            bgColor="hover:bg-green-900/20"
          />
        </motion.div>

        {/* Competition Readiness */}
        <motion.div variants={itemVariants} className="mb-4 md:mb-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                  Competition Readiness
                </CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white hover:bg-gray-700 p-2"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-500" />
                        Competition Readiness Breakdown
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Understanding how your readiness score is calculated
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 text-sm max-h-96 overflow-y-auto">
                      <div className="bg-gray-700/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-400 mb-3">
                          Overall Formula
                        </h4>
                        <p className="text-gray-300 mb-2">
                          Competition Readiness = (Lift Progress × 80%) +
                          (Weight Progress × 15%) + (Equipment × 5%)
                        </p>
                        <p className="text-gray-300">
                          Current Score:{" "}
                          <span className="font-bold text-white">
                            {competitionReadiness}%
                          </span>
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-700">
                          <h5 className="font-semibold text-blue-400 mb-2">
                            Lift Progress (80%)
                          </h5>
                          <p className="text-gray-300 text-xs mb-2">
                            Progress toward your third attempt goals across all
                            lifts
                          </p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-red-400">Squat:</span>
                              <span>
                                {Math.round(getProgressPercentage("squat"))}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-blue-400">Bench:</span>
                              <span>
                                {Math.round(getProgressPercentage("bench"))}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-400">Deadlift:</span>
                              <span>
                                {Math.round(getProgressPercentage("deadlift"))}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-green-900/30 p-3 rounded-lg border border-green-700">
                          <h5 className="font-semibold text-green-400 mb-2">
                            Weight Progress (15%)
                          </h5>
                          <p className="text-gray-300 text-xs mb-2">
                            How close you are to your target weight class
                          </p>
                          <div className="text-xs">
                            <p>
                              Current: {formatWeight(state.currentStats.weight)}
                            </p>
                            <p>
                              Target:{" "}
                              {formatWeight(state.meetInfo.targetWeightClass)}
                            </p>
                            <p className="mt-1">
                              Status:{" "}
                              {state.currentStats.weight <=
                              state.meetInfo.targetWeightClass ? (
                                <span className="text-green-400">
                                  ✓ On target
                                </span>
                              ) : (
                                <span className="text-yellow-400">
                                  ⚠ Need to cut{" "}
                                  {(
                                    state.currentStats.weight -
                                    state.meetInfo.targetWeightClass
                                  ).toFixed(1)}
                                  kg
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-700">
                          <h5 className="font-semibold text-purple-400 mb-2">
                            Equipment (5%)
                          </h5>
                          <p className="text-gray-300 text-xs mb-2">
                            Competition preparation checklist completion
                          </p>
                          <div className="text-xs">
                            <p>
                              Completed: {completedEquipment}/{totalEquipment}{" "}
                              items
                            </p>
                            <p>Progress: {Math.round(equipmentProgress)}%</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-700/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-yellow-400 mb-3">
                          Individual Lift Calculations
                        </h4>
                        <div className="space-y-3 text-xs">
                          <div>
                            <p className="text-red-400 font-medium mb-1">
                              Squat Progress:
                            </p>
                            <p className="text-gray-300">
                              ({formatWeight(state.currentStats.squatMax)} ÷{" "}
                              {formatWeight(
                                state.currentStats.goalSquatMax || 0,
                              )}
                              ) × 100 ={" "}
                              {Math.round(getProgressPercentage("squat"))}%
                            </p>
                          </div>
                          <div>
                            <p className="text-blue-400 font-medium mb-1">
                              Bench Progress:
                            </p>
                            <p className="text-gray-300">
                              ({formatWeight(state.currentStats.benchMax)} ÷{" "}
                              {formatWeight(
                                state.currentStats.goalBenchMax || 0,
                              )}
                              ) × 100 ={" "}
                              {Math.round(getProgressPercentage("bench"))}%
                            </p>
                          </div>
                          <div>
                            <p className="text-green-400 font-medium mb-1">
                              Deadlift Progress:
                            </p>
                            <p className="text-gray-300">
                              ({formatWeight(state.currentStats.deadliftMax)} ÷{" "}
                              {formatWeight(
                                state.currentStats.goalDeadliftMax || 0,
                              )}
                              ) × 100 ={" "}
                              {Math.round(getProgressPercentage("deadlift"))}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 w-full"
                        onClick={() => {}}
                      >
                        Got it!
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-6">
                {/* Overall Readiness */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">
                    {competitionReadiness}%
                  </div>
                  <Progress value={competitionReadiness} className="h-4 mb-4" />
                  <p className="text-sm text-gray-400">
                    Overall Competition Readiness
                  </p>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400 mb-1">
                        {(() => {
                          const goalTotal =
                            (state.currentStats.goalSquatMax || 0) +
                            (state.currentStats.goalBenchMax || 0) +
                            (state.currentStats.goalDeadliftMax || 0);
                          if (goalTotal <= 0) return 0;
                          const progress = Math.min(
                            100,
                            Math.max(0, (totalLifts / goalTotal) * 100),
                          );
                          return Math.round(progress);
                        })()}
                        %
                      </div>
                      <Progress
                        value={(() => {
                          const goalTotal =
                            (state.currentStats.goalSquatMax || 0) +
                            (state.currentStats.goalBenchMax || 0) +
                            (state.currentStats.goalDeadliftMax || 0);
                          if (goalTotal <= 0) return 0;
                          const progress = Math.min(
                            100,
                            Math.max(0, (totalLifts / goalTotal) * 100),
                          );
                          return Math.round(progress);
                        })()}
                        className="h-2 my-2"
                      />
                      <p className="text-xs text-gray-400">Lift Goals (80%)</p>
                    </div>
                  </div>

                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        {state.currentStats.weight <=
                        state.meetInfo.targetWeightClass
                          ? 100
                          : Math.max(
                              0,
                              Math.round(
                                100 -
                                  ((state.currentStats.weight -
                                    state.meetInfo.targetWeightClass) /
                                    state.meetInfo.targetWeightClass) *
                                    100,
                              ),
                            )}
                        %
                      </div>
                      <Progress
                        value={
                          state.currentStats.weight <=
                          state.meetInfo.targetWeightClass
                            ? 100
                            : Math.max(
                                0,
                                100 -
                                  ((state.currentStats.weight -
                                    state.meetInfo.targetWeightClass) /
                                    state.meetInfo.targetWeightClass) *
                                    100,
                              )
                        }
                        className="h-2 my-2"
                      />
                      <p className="text-xs text-gray-400">
                        Weight Target (15%)
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400 mb-1">
                        {Math.round(equipmentProgress)}%
                      </div>
                      <Progress
                        value={equipmentProgress}
                        className="h-2 my-2"
                      />
                      <p className="text-xs text-gray-400">Equipment (5%)</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
