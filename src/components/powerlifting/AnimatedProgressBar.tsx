import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedProgressBarProps {
  progress: number;
  label: string;
  color?: string;
  height?: string;
  showPercentage?: boolean;
  animated?: boolean;
  className?: string;
}

export default function AnimatedProgressBar({
  progress,
  label,
  color = "bg-red-500",
  height = "h-4",
  showPercentage = true,
  animated = true,
  className,
}: AnimatedProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-200">{label}</span>
        {showPercentage && (
          <span className="text-sm text-gray-400">
            {Math.round(clampedProgress)}%
          </span>
        )}
      </div>
      <div
        className={cn(
          "w-full bg-gray-700 rounded-full overflow-hidden",
          height,
        )}
      >
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{
            duration: animated ? 1.5 : 0,
            ease: "easeOut",
            delay: animated ? 0.2 : 0,
          }}
        />
      </div>
    </div>
  );
}
