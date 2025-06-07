import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dumbbell,
  TrendingUp,
  BarChart3,
  Calendar,
  Target,
  Activity,
  Plus,
  Filter,
} from "lucide-react";
import { usePowerlifting } from "@/contexts/PowerliftingContext";
import { toast } from "@/components/ui/use-toast";
import {
  TrainingFormData,
  TrainingEntry,
  TrainingAnalytics,
} from "@/types/powerlifting";

interface TrainingProps {
  className?: string;
}

const Training: React.FC<TrainingProps> = ({ className = "" }) => {
  const {
    addTrainingEntry,
    getTrainingHistory,
    getTrainingAnalytics,
    formatWeight,
    state,
  } = usePowerlifting();

  // Form state
  const [formData, setFormData] = useState<TrainingFormData>({
    lift_type: "squat",
    sets: 3,
    reps: 5,
    weight: 100,
    rpe: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Analytics state
  const [trainingHistory, setTrainingHistory] = useState<TrainingEntry[]>([]);
  const [analytics, setAnalytics] = useState<TrainingAnalytics>({
    volumeProgression: [],
    estimatedMaxProgression: [],
    weeklyVolume: [],
  });
  const [loading, setLoading] = useState(true);
  const [filterLift, setFilterLift] = useState<
    "all" | "squat" | "bench" | "deadlift"
  >("all");
  const [filterDays, setFilterDays] = useState(30);

  // Load training data on component mount
  useEffect(() => {
    loadTrainingData();
  }, [filterDays]);

  const loadTrainingData = async () => {
    setLoading(true);
    try {
      const [history, analyticsData] = await Promise.all([
        getTrainingHistory(filterDays),
        getTrainingAnalytics(filterDays),
      ]);
      setTrainingHistory(history);
      setAnalytics(analyticsData);
    } catch (error) {
      toast({
        title: "Error loading training data",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof TrainingFormData,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.sets <= 0 || formData.reps <= 0 || formData.weight <= 0) {
      toast({
        title: "Invalid input",
        description: "Sets, reps, and weight must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    if (formData.rpe && (formData.rpe < 1 || formData.rpe > 10)) {
      toast({
        title: "Invalid RPE",
        description: "RPE must be between 1 and 10.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addTrainingEntry(formData);
      toast({
        title: "Training logged!",
        description: `${formData.lift_type.charAt(0).toUpperCase() + formData.lift_type.slice(1)} training has been recorded.`,
      });

      // Reset form
      setFormData({
        lift_type: "squat",
        sets: 3,
        reps: 5,
        weight: 100,
        rpe: undefined,
      });

      // Reload data
      await loadTrainingData();
    } catch (error) {
      toast({
        title: "Error logging training",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateVolume = () => formData.sets * formData.reps * formData.weight;
  const calculateEstimated1RM = () =>
    formData.weight * (1 + formData.reps / 30);

  const getFilteredHistory = () => {
    if (filterLift === "all") return trainingHistory;
    return trainingHistory.filter((entry) => entry.lift_type === filterLift);
  };

  const getRecentStats = () => {
    const recent = trainingHistory.slice(0, 10);
    const stats = {
      totalSessions: recent.length,
      totalVolume: recent.reduce((sum, entry) => sum + (entry.volume || 0), 0),
      avgRPE: recent
        .filter((e) => e.rpe)
        .reduce((sum, entry, _, arr) => sum + (entry.rpe || 0) / arr.length, 0),
      maxEstimated1RM: {
        squat: Math.max(
          ...recent
            .filter((e) => e.lift_type === "squat")
            .map((e) => e.estimated_1rm || 0),
          0,
        ),
        bench: Math.max(
          ...recent
            .filter((e) => e.lift_type === "bench")
            .map((e) => e.estimated_1rm || 0),
          0,
        ),
        deadlift: Math.max(
          ...recent
            .filter((e) => e.lift_type === "deadlift")
            .map((e) => e.estimated_1rm || 0),
          0,
        ),
      },
    };
    return stats;
  };

  const stats = getRecentStats();
  const filteredHistory = getFilteredHistory();

  return (
    <div
      className={`min-h-screen bg-gray-900 text-white p-4 md:p-6 ${className}`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Dumbbell className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Training Log</h2>
        </div>

        {/* Training Form */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Plus className="h-5 w-5 text-green-500" />
              Log Training Session
            </CardTitle>
            <CardDescription className="text-gray-400">
              Record your daily training for squat, bench press, or deadlift
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="lift_type" className="text-gray-300">
                    Lift Type
                  </Label>
                  <Select
                    value={formData.lift_type}
                    onValueChange={(value: "squat" | "bench" | "deadlift") =>
                      handleInputChange("lift_type", value)
                    }
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="squat">Squat</SelectItem>
                      <SelectItem value="bench">Bench Press</SelectItem>
                      <SelectItem value="deadlift">Deadlift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sets" className="text-gray-300">
                    Sets
                  </Label>
                  <Input
                    id="sets"
                    type="number"
                    min="1"
                    value={formData.sets}
                    onChange={(e) =>
                      handleInputChange("sets", parseInt(e.target.value) || 0)
                    }
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="reps" className="text-gray-300">
                    Reps
                  </Label>
                  <Input
                    id="reps"
                    type="number"
                    min="1"
                    value={formData.reps}
                    onChange={(e) =>
                      handleInputChange("reps", parseInt(e.target.value) || 0)
                    }
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="weight" className="text-gray-300">
                    Weight ({state.unitPreference})
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.weight}
                    onChange={(e) =>
                      handleInputChange(
                        "weight",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="rpe" className="text-gray-300">
                    RPE (Optional)
                  </Label>
                  <Input
                    id="rpe"
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={formData.rpe || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "rpe",
                        parseFloat(e.target.value) || undefined,
                      )
                    }
                    placeholder="1-10"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              {/* Calculated Values */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-700/50 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">
                    {calculateVolume().toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-400">Total Volume</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">
                    {calculateEstimated1RM().toFixed(1)} {state.unitPreference}
                  </div>
                  <div className="text-sm text-gray-400">Estimated 1RM</div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "Logging..." : "Log Training Session"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">
                {stats.totalSessions}
              </div>
              <div className="text-sm text-gray-400">Recent Sessions</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-400">
                {formatWeight(stats.totalVolume)}
              </div>
              <div className="text-sm text-gray-400">Total Volume</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">
                {stats.avgRPE ? stats.avgRPE.toFixed(1) : "N/A"}
              </div>
              <div className="text-sm text-gray-400">Avg RPE</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-red-400">
                S: {formatWeight(stats.maxEstimated1RM.squat)}
              </div>
              <div className="text-sm text-gray-400">Max Est. 1RM</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Filter className="h-5 w-5 text-purple-500" />
              Analytics Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div>
                <Label className="text-gray-300">Lift Type</Label>
                <Select
                  value={filterLift}
                  onValueChange={(
                    value: "all" | "squat" | "bench" | "deadlift",
                  ) => setFilterLift(value)}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="all">All Lifts</SelectItem>
                    <SelectItem value="squat">Squat</SelectItem>
                    <SelectItem value="bench">Bench</SelectItem>
                    <SelectItem value="deadlift">Deadlift</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Time Period</Label>
                <Select
                  value={filterDays.toString()}
                  onValueChange={(value) => setFilterDays(parseInt(value))}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="60">Last 2 months</SelectItem>
                    <SelectItem value="90">Last 3 months</SelectItem>
                    <SelectItem value="180">Last 6 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Training History */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="h-5 w-5 text-blue-500" />
              Recent Training Sessions
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your latest training entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading training history...</div>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400">No training sessions found.</div>
                <div className="text-sm text-gray-500 mt-2">
                  Start logging your training sessions above!
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.slice(0, 10).map((entry, index) => (
                  <div
                    key={entry.id || index}
                    className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        className={`${
                          entry.lift_type === "squat"
                            ? "bg-red-500"
                            : entry.lift_type === "bench"
                              ? "bg-blue-500"
                              : "bg-green-500"
                        } text-white`}
                      >
                        {entry.lift_type.charAt(0).toUpperCase() +
                          entry.lift_type.slice(1)}
                      </Badge>
                      <div className="text-sm text-gray-300">
                        {new Date(entry.training_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-gray-300">
                        {entry.sets}×{entry.reps} @ {formatWeight(entry.weight)}
                      </div>
                      {entry.rpe && (
                        <div className="text-yellow-400">RPE {entry.rpe}</div>
                      )}
                      <div className="text-blue-400">
                        Vol: {formatWeight(entry.volume || 0)}
                      </div>
                      <div className="text-green-400">
                        Est 1RM: {formatWeight(entry.estimated_1rm || 0)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analytics Placeholder */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              Training Analytics
            </CardTitle>
            <CardDescription className="text-gray-400">
              Visual analytics coming soon - volume progression, 1RM trends, and
              weekly summaries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-6 bg-gray-700/30 rounded-lg border border-gray-600">
                <TrendingUp className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <div className="text-sm font-medium text-white">
                  Volume Progression
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Track volume over time
                </div>
              </div>
              <div className="text-center p-6 bg-gray-700/30 rounded-lg border border-gray-600">
                <Target className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <div className="text-sm font-medium text-white">
                  1RM Progression
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Estimated max trends
                </div>
              </div>
              <div className="text-center p-6 bg-gray-700/30 rounded-lg border border-gray-600">
                <Calendar className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <div className="text-sm font-medium text-white">
                  Weekly Volume
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Weekly training load
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Training;
