import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Info } from "lucide-react";
import { usePowerlifting } from "../../contexts/PowerliftingContext";
import ReadinessBreakdownModal from "./ReadinessBreakdownModal";
import { cn } from "@/lib/utils";

interface AnimatedLifterProps {
  score: number;
  className?: string;
}

function AnimatedLifter({ score, className }: AnimatedLifterProps) {
  // Calculate squat depth based on score (0-100%)
  // 100% = standing (0% squat), 0% = full squat (100% depth)
  const squatDepth = Math.max(0, Math.min(100, 100 - score));
  const squatTransform = `translateY(${squatDepth * 0.3}px)`;

  // Color based on score
  const getColor = () => {
    if (score >= 80) return "#10b981"; // green-500
    if (score >= 50) return "#f59e0b"; // yellow-500
    return "#ef4444"; // red-500
  };

  const color = getColor();

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <svg
        width="60"
        height="80"
        viewBox="0 0 60 80"
        className="transition-all duration-500 ease-in-out"
      >
        {/* Barbell */}
        <g
          transform={squatTransform}
          className="transition-transform duration-500 ease-in-out"
        >
          {/* Barbell bar */}
          <line
            x1="10"
            y1="25"
            x2="50"
            y2="25"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Left weight plate */}
          <rect x="8" y="22" width="4" height="6" fill={color} rx="1" />
          {/* Right weight plate */}
          <rect x="48" y="22" width="4" height="6" fill={color} rx="1" />
        </g>

        {/* Lifter figure */}
        <g
          transform={squatTransform}
          className="transition-transform duration-500 ease-in-out"
        >
          {/* Head */}
          <circle cx="30" cy="15" r="6" fill={color} />

          {/* Torso */}
          <rect x="26" y="28" width="8" height="20" fill={color} rx="2" />

          {/* Arms */}
          <line
            x1="22"
            y1="32"
            x2="18"
            y2="40"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="38"
            y1="32"
            x2="42"
            y2="40"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Thighs */}
          <line
            x1="28"
            y1="48"
            x2="24"
            y2="60"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1="32"
            y1="48"
            x2="36"
            y2="60"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Calves */}
          <line
            x1="24"
            y1="60"
            x2="22"
            y2="70"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="36"
            y1="60"
            x2="38"
            y2="70"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Feet */}
          <ellipse cx="20" cy="72" rx="3" ry="2" fill={color} />
          <ellipse cx="40" cy="72" rx="3" ry="2" fill={color} />
        </g>
      </svg>
    </div>
  );
}

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

function CircularProgress({
  percentage,
  size = 120,
  strokeWidth = 8,
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color based on percentage
  const getStrokeColor = () => {
    if (percentage >= 80) return "#10b981"; // green-500
    if (percentage >= 50) return "#f59e0b"; // yellow-500
    return "#ef4444"; // red-500
  };

  return (
    <div className={cn("relative", className)}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#374151"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedLifter score={percentage} className="mb-1" />
        <div className="text-center">
          <div className="text-lg sm:text-xl font-bold text-white">
            {Math.round(percentage)}%
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReadinessScoreWidget() {
  const { calculateReadinessScore } = usePowerlifting();
  const [modalOpen, setModalOpen] = useState(false);

  const readinessScore = calculateReadinessScore();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-gray-600 transition-all duration-300 cursor-pointer group"
          onClick={() => setModalOpen(true)}
        >
          <CardHeader className="pb-2 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base font-medium text-gray-400 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                Competition Readiness
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-500 hover:text-gray-300 group-hover:text-blue-400 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalOpen(true);
                }}
              >
                <Info className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 flex justify-center">
            <CircularProgress
              percentage={readinessScore.total}
              size={140}
              strokeWidth={10}
            />
          </CardContent>
        </Card>
      </motion.div>

      <ReadinessBreakdownModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        readinessScore={readinessScore}
      />
    </>
  );
}
