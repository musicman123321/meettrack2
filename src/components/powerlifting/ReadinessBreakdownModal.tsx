import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Target,
  Dumbbell,
  Scale,
  CheckSquare,
  TrendingUp,
  Award,
} from "lucide-react";
import { ReadinessScore } from "../../types/powerlifting";
import { usePowerlifting } from "../../contexts/PowerliftingContext";

interface ReadinessBreakdownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readinessScore: ReadinessScore;
}

interface ScoreItemProps {
  icon: React.ReactNode;
  title: string;
  score: number;
  maxScore: number;
  description: string;
  color: string;
}

function ScoreItem({
  icon,
  title,
  score,
  maxScore,
  description,
  color,
}: ScoreItemProps) {
  const percentage = (score / maxScore) * 100;

  const getBadgeVariant = () => {
    if (percentage >= 80) return "default";
    if (percentage >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
          <div>
            <h4 className="font-medium text-white">{title}</h4>
            <p className="text-xs text-gray-400">{description}</p>
          </div>
        </div>
        <Badge variant={getBadgeVariant()} className="font-mono">
          {score.toFixed(1)}/{maxScore}
        </Badge>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-400">
          <span>{Math.round(percentage)}%</span>
          <span>{maxScore} pts max</span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>
    </div>
  );
}

export default function ReadinessBreakdownModal({
  open,
  onOpenChange,
  readinessScore,
}: ReadinessBreakdownModalProps) {
  const { state } = usePowerlifting();

  const getOverallRating = (score: number) => {
    if (score >= 90)
      return {
        text: "Excellent",
        color: "text-green-400",
        bg: "bg-green-500/20",
      };
    if (score >= 80)
      return {
        text: "Very Good",
        color: "text-green-400",
        bg: "bg-green-500/20",
      };
    if (score >= 70)
      return { text: "Good", color: "text-blue-400", bg: "bg-blue-500/20" };
    if (score >= 60)
      return { text: "Fair", color: "text-yellow-400", bg: "bg-yellow-500/20" };
    if (score >= 50)
      return {
        text: "Needs Work",
        color: "text-orange-400",
        bg: "bg-orange-500/20",
      };
    return { text: "Poor", color: "text-red-400", bg: "bg-red-500/20" };
  };

  const rating = getOverallRating(readinessScore.total);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Award className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                Competition Readiness Score
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Detailed breakdown of your preparation progress
              </DialogDescription>
            </div>
          </div>

          {/* Overall Score */}
          <Card className="bg-gray-900 border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-white">
                    {readinessScore.total.toFixed(1)}%
                  </div>
                  <div className={`text-sm font-medium ${rating.color}`}>
                    {rating.text}
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full ${rating.bg} ${rating.color} text-sm font-medium`}
                >
                  Overall Rating
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lift Progress Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-blue-400" />
              Lift Progress (70% of total)
            </h3>
            <div className="space-y-4">
              <ScoreItem
                icon={<Target className="h-4 w-4 text-white" />}
                title="Squat Progress"
                score={readinessScore.breakdown.squatProgress}
                maxScore={23.3}
                description={`Current: ${state.currentStats.squatMax}kg | Goal: ${state.meetGoals.squat.third}kg | Confidence: ${state.meetGoals.squat.confidence}/10`}
                color="bg-red-500/20"
              />
              <ScoreItem
                icon={<TrendingUp className="h-4 w-4 text-white" />}
                title="Bench Progress"
                score={readinessScore.breakdown.benchProgress}
                maxScore={23.3}
                description={`Current: ${state.currentStats.benchMax}kg | Goal: ${state.meetGoals.bench.third}kg | Confidence: ${state.meetGoals.bench.confidence}/10`}
                color="bg-blue-500/20"
              />
              <ScoreItem
                icon={<Dumbbell className="h-4 w-4 text-white" />}
                title="Deadlift Progress"
                score={readinessScore.breakdown.deadliftProgress}
                maxScore={23.3}
                description={`Current: ${state.currentStats.deadliftMax}kg | Goal: ${state.meetGoals.deadlift.third}kg | Confidence: ${state.meetGoals.deadlift.confidence}/10`}
                color="bg-green-500/20"
              />
            </div>
          </div>

          <Separator className="bg-gray-600" />

          {/* Weight Management Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Scale className="h-5 w-5 text-green-400" />
              Weight Management (20% of total)
            </h3>
            <ScoreItem
              icon={<Scale className="h-4 w-4 text-white" />}
              title="Weight Target"
              score={readinessScore.breakdown.weightManagement}
              maxScore={20}
              description={`Current: ${state.currentStats.weight}kg | Target Class: ${state.meetInfo.targetWeightClass}kg | Difference: ${Math.abs(state.currentStats.weight - state.meetInfo.targetWeightClass).toFixed(1)}kg`}
              color="bg-green-500/20"
            />
          </div>

          <Separator className="bg-gray-600" />

          {/* Equipment Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-purple-400" />
              Equipment Readiness (10% of total)
            </h3>
            <ScoreItem
              icon={<CheckSquare className="h-4 w-4 text-white" />}
              title="Equipment Checklist"
              score={readinessScore.breakdown.equipmentCompletion}
              maxScore={10}
              description={`${state.equipmentChecklist.filter((item) => item.checked).length} of ${state.equipmentChecklist.length} items completed`}
              color="bg-purple-500/20"
            />
          </div>

          {/* Tips Section */}
          <Card className="bg-gray-900 border-gray-600">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-300">
                💡 Tips to Improve Your Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-400">
              {readinessScore.total < 80 && (
                <>
                  {readinessScore.breakdown.squatProgress < 20 && (
                    <p>
                      • Focus on squat training to reach your third attempt goal
                    </p>
                  )}
                  {readinessScore.breakdown.benchProgress < 20 && (
                    <p>
                      • Increase bench press training volume and technique work
                    </p>
                  )}
                  {readinessScore.breakdown.deadliftProgress < 20 && (
                    <p>
                      • Work on deadlift strength and attempt selection
                      confidence
                    </p>
                  )}
                  {readinessScore.breakdown.weightManagement < 15 && (
                    <p>• Adjust nutrition plan to reach target weight class</p>
                  )}
                  {readinessScore.breakdown.equipmentCompletion < 8 && (
                    <p>• Complete your equipment checklist preparation</p>
                  )}
                </>
              )}
              {readinessScore.total >= 80 && (
                <p>
                  • Excellent preparation! Focus on maintaining consistency and
                  mental preparation.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
