import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
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
                        className={`${entry.lift_type === "squat"
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

        {/* Training Analytics */}
        <div className="space-y-6">
          {/* Volume Progression Chart */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                Volume Progression
              </CardTitle>
              <CardDescription className="text-gray-400">
                Track your training volume over time by lift type
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.volumeProgression.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.volumeProgression}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickFormatter={(value) => `${value}${state.unitPreference}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value: number, name: string) => [
                          `${formatWeight(value)}`,
                          name.charAt(0).toUpperCase() + name.slice(1)
                        ]}
                      />
                      <Legend />
                      {(filterLift === 'all' || filterLift === 'squat') && (
                        <Area
                          type="monotone"
                          dataKey="squat"
                          stackId="1"
                          stroke="#EF4444"
                          fill="#EF4444"
                          fillOpacity={0.6}
                          name="Squat"
                        />
                      )}
                      {(filterLift === 'all' || filterLift === 'bench') && (
                        <Area
                          type="monotone"
                          dataKey="bench"
                          stackId="1"
                          stroke="#3B82F6"
                          fill="#3B82F6"
                          fillOpacity={0.6}
                          name="Bench"
                        />
                      )}
                      {(filterLift === 'all' || filterLift === 'deadlift') && (
                        <Area
                          type="monotone"
                          dataKey="deadlift"
                          stackId="1"
                          stroke="#10B981"
                          fill="#10B981"
                          fillOpacity={0.6}
                          name="Deadlift"
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No volume data available</p>
                    <p className="text-sm mt-1">Start logging training sessions to see your progress</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 1RM Progression Chart */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Target className="h-5 w-5 text-green-400" />
                Estimated 1RM Progression
              </CardTitle>
              <CardDescription className="text-gray-400">
                Track your estimated one-rep max improvements over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.estimatedMaxProgression.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.estimatedMaxProgression}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickFormatter={(value) => `${value}${state.unitPreference}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value: number, name: string) => [
                          `${formatWeight(value)}`,
                          `${name.charAt(0).toUpperCase() + name.slice(1)} 1RM`
                        ]}
                      />
                      <Legend />
                      {(filterLift === 'all' || filterLift === 'squat') && (
                        <Line
                          type="monotone"
                          dataKey="squat"
                          stroke="#EF4444"
                          strokeWidth={3}
                          dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2 }}
                          name="Squat"
                        />
                      )}
                      {(filterLift === 'all' || filterLift === 'bench') && (
                        <Line
                          type="monotone"
                          dataKey="bench"
                          stroke="#3B82F6"
                          strokeWidth={3}
                          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                          name="Bench"
                        />
                      )}
                      {(filterLift === 'all' || filterLift === 'deadlift') && (
                        <Line
                          type="monotone"
                          dataKey="deadlift"
                          stroke="#10B981"
                          strokeWidth={3}
                          dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                          name="Deadlift"
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No 1RM progression data available</p>
                    <p className="text-sm mt-1">Continue training to track your strength gains</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Volume Summary */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="h-5 w-5 text-purple-400" />
                Weekly Training Volume
              </CardTitle>
              <CardDescription className="text-gray-400">
                Weekly training load breakdown by lift type
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.weeklyVolume.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.weeklyVolume}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="week"
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getMonth() + 1}/${date.getDate()}`;
                        }}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickFormatter={(value) => `${value}${state.unitPreference}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        labelFormatter={(value) => `Week of ${new Date(value).toLocaleDateString()}`}
                        formatter={(value: number, name: string) => [
                          `${formatWeight(value)}`,
                          name.charAt(0).toUpperCase() + name.slice(1)
                        ]}
                      />
                      <Legend />
                      {(filterLift === 'all' || filterLift === 'squat') && (
                        <Bar dataKey="squat" fill="#EF4444" name="Squat" />
                      )}
                      {(filterLift === 'all' || filterLift === 'bench') && (
                        <Bar dataKey="bench" fill="#3B82F6" name="Bench" />
                      )}
                      {(filterLift === 'all' || filterLift === 'deadlift') && (
                        <Bar dataKey="deadlift" fill="#10B981" name="Deadlift" />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No weekly volume data available</p>
                    <p className="text-sm mt-1">Train consistently to see weekly patterns</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Training Insights */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="h-5 w-5 text-yellow-400" />
                Training Insights
              </CardTitle>
              <CardDescription className="text-gray-400">
                Key metrics and trends from your training data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">
                    {analytics.weeklyVolume.length > 0
                      ? Math.round(analytics.weeklyVolume[analytics.weeklyVolume.length - 1]?.total || 0)
                      : 0
                    }
                  </div>
                  <div className="text-sm text-gray-400">Last Week Volume</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatWeight(analytics.weeklyVolume.length > 0
                      ? analytics.weeklyVolume[analytics.weeklyVolume.length - 1]?.total || 0
                      : 0
                    )}
                  </div>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {analytics.estimatedMaxProgression.length > 0
                      ? Math.max(
                        analytics.estimatedMaxProgression[analytics.estimatedMaxProgression.length - 1]?.squat || 0,
                        analytics.estimatedMaxProgression[analytics.estimatedMaxProgression.length - 1]?.bench || 0,
                        analytics.estimatedMaxProgression[analytics.estimatedMaxProgression.length - 1]?.deadlift || 0
                      ).toFixed(1)
                      : 0
                    }
                  </div>
                  <div className="text-sm text-gray-400">Peak Est. 1RM</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {state.unitPreference}
                  </div>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">
                    {analytics.weeklyVolume.length}
                  </div>
                  <div className="text-sm text-gray-400">Training Weeks</div>
                  <div className="text-xs text-gray-500 mt-1">
                    In selected period
                  </div>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-400">
                    {analytics.volumeProgression.length > 0 && analytics.weeklyVolume.length > 1
                      ? (
                        ((analytics.weeklyVolume[analytics.weeklyVolume.length - 1]?.total || 0) -
                          (analytics.weeklyVolume[analytics.weeklyVolume.length - 2]?.total || 0)) /
                        (analytics.weeklyVolume[analytics.weeklyVolume.length - 2]?.total || 1) * 100
                      ).toFixed(1)
                      : 0
                    }%
                  </div>
                  <div className="text-sm text-gray-400">Volume Change</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Week over week
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Training;
