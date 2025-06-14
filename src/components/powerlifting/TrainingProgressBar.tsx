import React, { useState, useEffect } from "react";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Skeleton } from "@/components/ui/skeleton";
import { usePowerlifting } from "@/contexts/PowerliftingContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Activity } from "lucide-react";

interface TrainingProgressBarProps {
  className?: string;
}

const TrainingProgressBar: React.FC<TrainingProgressBarProps> = ({
  className = "",
}) => {
  const {
    state,
    getTrainingHistory,
    loading: contextLoading,
  } = usePowerlifting();
  const [progressData, setProgressData] = useState({
    squat: { current: 0, goal: 0, progress: 0 },
    bench: { current: 0, goal: 0, progress: 0 },
    deadlift: { current: 0, goal: 0, progress: 0 },
    overall: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentSessions, setRecentSessions] = useState(0);

  useEffect(() => {
    const calculateProgress = async () => {
      if (contextLoading) return;

      setLoading(true);
      try {
        // Get recent training data
        const trainingData = await getTrainingHistory(30);
        setRecentSessions(trainingData.length);

        // Calculate current maxes from training data
        const currentMaxes = {
          squat: 0,
          bench: 0,
          deadlift: 0,
        };

        trainingData.forEach((entry) => {
          const estimated1rm =
            entry.estimated_1rm || entry.weight * (1 + entry.reps / 30);
          if (
            estimated1rm >
            currentMaxes[entry.lift_type as keyof typeof currentMaxes]
          ) {
            currentMaxes[entry.lift_type as keyof typeof currentMaxes] =
              estimated1rm;
          }
        });

        // Use meet goals as targets, fallback to current stats
        const goals = {
          squat:
            state.meetGoals.squat.third || state.currentStats.squatMax || 100,
          bench:
            state.meetGoals.bench.third || state.currentStats.benchMax || 100,
          deadlift:
            state.meetGoals.deadlift.third ||
            state.currentStats.deadliftMax ||
            100,
        };

        // Calculate progress percentages
        const squatProgress = Math.min(
          (currentMaxes.squat / goals.squat) * 100,
          100,
        );
        const benchProgress = Math.min(
          (currentMaxes.bench / goals.bench) * 100,
          100,
        );
        const deadliftProgress = Math.min(
          (currentMaxes.deadlift / goals.deadlift) * 100,
          100,
        );
        const overallProgress =
          (squatProgress + benchProgress + deadliftProgress) / 3;

        setProgressData({
          squat: {
            current: currentMaxes.squat,
            goal: goals.squat,
            progress: squatProgress,
          },
          bench: {
            current: currentMaxes.bench,
            goal: goals.bench,
            progress: benchProgress,
          },
          deadlift: {
            current: currentMaxes.deadlift,
            goal: goals.deadlift,
            progress: deadliftProgress,
          },
          overall: overallProgress,
        });
      } catch (error) {
        console.error("Error calculating progress:", error);
      } finally {
        setLoading(false);
      }
    };

    calculateProgress();
  }, [state, contextLoading, getTrainingHistory]);

  if (loading || contextLoading) {
    return (
      <div className={`w-full max-w-md mx-auto ${className}`}>
        <Card className="bg-white border-gray-200 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Skeleton className="h-6 w-32 mx-auto" />
              <div className="flex justify-center">
                <Skeleton className="h-32 w-32 rounded-full" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="text-center space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Training Progress
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Your strength journey at a glance
              </p>
            </div>

            {/* Main Progress Circle */}
            <div className="relative">
              <CircularProgress
                value={progressData.overall}
                size={140}
                strokeWidth={12}
                color={
                  progressData.overall >= 80
                    ? "#10B981"
                    : progressData.overall >= 60
                      ? "#F59E0B"
                      : "#3B82F6"
                }
                backgroundColor="#F3F4F6"
                animated
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(progressData.overall)}%
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    Overall
                  </div>
                </div>
              </CircularProgress>
            </div>

            {/* Individual Lift Progress */}
            <div className="grid grid-cols-3 gap-4">
              {/* Squat */}
              <div className="text-center space-y-2">
                <CircularProgress
                  value={progressData.squat.progress}
                  size={60}
                  strokeWidth={6}
                  color="#EF4444"
                  backgroundColor="#FEE2E2"
                  animated
                >
                  <div className="text-xs font-bold text-red-600">
                    {Math.round(progressData.squat.progress)}%
                  </div>
                </CircularProgress>
                <div>
                  <div className="text-xs font-medium text-gray-900">Squat</div>
                  <div className="text-xs text-gray-500">
                    {Math.round(progressData.squat.current)}/
                    {Math.round(progressData.squat.goal)}
                  </div>
                </div>
              </div>

              {/* Bench */}
              <div className="text-center space-y-2">
                <CircularProgress
                  value={progressData.bench.progress}
                  size={60}
                  strokeWidth={6}
                  color="#3B82F6"
                  backgroundColor="#DBEAFE"
                  animated
                >
                  <div className="text-xs font-bold text-blue-600">
                    {Math.round(progressData.bench.progress)}%
                  </div>
                </CircularProgress>
                <div>
                  <div className="text-xs font-medium text-gray-900">Bench</div>
                  <div className="text-xs text-gray-500">
                    {Math.round(progressData.bench.current)}/
                    {Math.round(progressData.bench.goal)}
                  </div>
                </div>
              </div>

              {/* Deadlift */}
              <div className="text-center space-y-2">
                <CircularProgress
                  value={progressData.deadlift.progress}
                  size={60}
                  strokeWidth={6}
                  color="#10B981"
                  backgroundColor="#D1FAE5"
                  animated
                >
                  <div className="text-xs font-bold text-green-600">
                    {Math.round(progressData.deadlift.progress)}%
                  </div>
                </CircularProgress>
                <div>
                  <div className="text-xs font-medium text-gray-900">
                    Deadlift
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round(progressData.deadlift.current)}/
                    {Math.round(progressData.deadlift.goal)}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Footer */}
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1">
                <Activity className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {recentSessions} sessions
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {state.unitPreference}
                </span>
              </div>
            </div>

            {/* Progress Badge */}
            <div className="flex justify-center">
              <Badge
                className={`${
                  progressData.overall >= 80
                    ? "bg-green-100 text-green-800 border-green-200"
                    : progressData.overall >= 60
                      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                      : "bg-blue-100 text-blue-800 border-blue-200"
                } text-xs font-medium`}
                variant="outline"
              >
                {progressData.overall >= 80
                  ? "🔥 On Fire!"
                  : progressData.overall >= 60
                    ? "💪 Strong Progress"
                    : "🚀 Building Strength"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingProgressBar;
