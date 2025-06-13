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
import { Edit } from "lucide-react";
import AnimatedProgressBar from "./AnimatedProgressBar";
import { usePowerlifting } from "../../contexts/PowerliftingContext";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

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
  const {
    state,
    getProgressPercentage,
    formatWeight,
    saveCurrentStats,
    saveMeetGoals,
  } = usePowerlifting();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    currentMax: "",
    opener: "",
    second: "",
    third: "",
    confidence: "",
  });

  const liftName = lift.charAt(0).toUpperCase() + lift.slice(1);
  const currentMax = state.currentStats[
    `${lift}Max` as keyof typeof state.currentStats
  ] as number;
  const attempts = state.meetGoals[lift];
  const progress = getProgressPercentage(lift);

  // Initialize form when dialog opens
  const handleEditClick = () => {
    setEditForm({
      currentMax: currentMax.toString(),
      opener: attempts.opener.toString(),
      second: attempts.second.toString(),
      third: attempts.third.toString(),
      confidence: attempts.confidence.toString(),
    });
    setEditDialogOpen(true);
  };

  // Handle form submission
  const handleSave = async () => {
    setSaving(true);
    try {
      // Update current stats
      const updatedStats = {
        ...state.currentStats,
        [`${lift}Max`]: parseFloat(editForm.currentMax),
      };
      await saveCurrentStats(updatedStats);

      // Update meet goals
      const updatedGoals = {
        ...state.meetGoals,
        [lift]: {
          opener: parseFloat(editForm.opener),
          second: parseFloat(editForm.second),
          third: parseFloat(editForm.third),
          confidence: parseInt(editForm.confidence),
        },
      };
      await saveMeetGoals(updatedGoals);

      setEditDialogOpen(false);
      toast({
        title: `${liftName} updated!`,
        description: "Your lift data has been saved.",
      });
    } catch (error) {
      toast({
        title: "Error updating lift",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogTrigger asChild>
          <Card
            className={cn(
              "bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer",
              bgColor,
            )}
            onClick={handleEditClick}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", color)}>{icon}</div>
                  <CardTitle className="text-white">{liftName}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Edit className="h-4 w-4 text-gray-500" />
                  <Badge
                    variant="outline"
                    className="text-gray-300 border-gray-600"
                  >
                    {formatWeight(currentMax)}
                  </Badge>
                </div>
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

              <p className="text-xs text-blue-400 text-center mt-2">
                Click to edit {liftName.toLowerCase()} data
              </p>
            </CardContent>
          </Card>
        </DialogTrigger>

        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Edit {liftName} Data</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update your current max and meet attempts for{" "}
              {liftName.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentMax" className="text-gray-300">
                Current Max (kg)
              </Label>
              <Input
                id="currentMax"
                type="number"
                value={editForm.currentMax}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    currentMax: e.target.value,
                  }))
                }
                placeholder="Enter current max"
                className="bg-gray-700 border-gray-600 text-white mt-1"
                step="0.5"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="opener" className="text-gray-300">
                  Opener (kg)
                </Label>
                <Input
                  id="opener"
                  type="number"
                  value={editForm.opener}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, opener: e.target.value }))
                  }
                  placeholder="Opener"
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                  step="0.5"
                />
              </div>
              <div>
                <Label htmlFor="second" className="text-gray-300">
                  Second (kg)
                </Label>
                <Input
                  id="second"
                  type="number"
                  value={editForm.second}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, second: e.target.value }))
                  }
                  placeholder="Second"
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                  step="0.5"
                />
              </div>
              <div>
                <Label htmlFor="third" className="text-gray-300">
                  Third (kg)
                </Label>
                <Input
                  id="third"
                  type="number"
                  value={editForm.third}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, third: e.target.value }))
                  }
                  placeholder="Third"
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                  step="0.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="confidence" className="text-gray-300">
                Confidence (1-10)
              </Label>
              <Input
                id="confidence"
                type="number"
                min="1"
                max="10"
                value={editForm.confidence}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    confidence: e.target.value,
                  }))
                }
                placeholder="Confidence level"
                className="bg-gray-700 border-gray-600 text-white mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
