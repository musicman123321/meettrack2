import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AnimatedProgressBar from "./AnimatedProgressBar";
import { usePowerlifting } from "../../contexts/PowerliftingContext";
import { cn } from "@/lib/utils";

interface LiftCardProps {
  lift: "squat" | "bench" | "deadlift";
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export default function LiftCard({
  lift,
  icon,
  color,
  bgColor,
}: LiftCardProps) {
  const { state, getProgressPercentage, formatWeight } = usePowerlifting();

  const liftName = lift.charAt(0).toUpperCase() + lift.slice(1);
  const currentMax = state.currentStats[
    `${lift}Max` as keyof typeof state.currentStats
  ] as number;
  const attempts = state.meetGoals[lift];
  const progress = getProgressPercentage(lift);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        className={cn(
          "bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors",
          bgColor,
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", color)}>{icon}</div>
              <CardTitle className="text-white">{liftName}</CardTitle>
            </div>
            <Badge variant="outline" className="text-gray-300 border-gray-600">
              {formatWeight(currentMax)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatedProgressBar
            progress={progress}
            label="Goal Progress"
            color={color}
            className="mb-4"
          />

          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center p-2 bg-gray-700 rounded">
              <div className="text-gray-400">Opener</div>
              <div className="text-white font-semibold">
                {formatWeight(attempts.opener)}
              </div>
            </div>
            <div className="text-center p-2 bg-gray-700 rounded">
              <div className="text-gray-400">Second</div>
              <div className="text-white font-semibold">
                {formatWeight(attempts.second)}
              </div>
            </div>
            <div className="text-center p-2 bg-gray-700 rounded">
              <div className="text-gray-400">Third</div>
              <div className="text-white font-semibold">
                {formatWeight(attempts.third)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-gray-400 text-sm">Confidence</span>
            <div className="flex items-center gap-1">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    i < attempts.confidence ? color : "bg-gray-600",
                  )}
                />
              ))}
              <span className="text-white text-sm ml-2">
                {attempts.confidence}/10
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
