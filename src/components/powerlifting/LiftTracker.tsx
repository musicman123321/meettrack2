import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Dumbbell, Save, Calculator } from "lucide-react";
import { usePowerlifting } from "../../contexts/PowerliftingContext";
import { toast } from "@/components/ui/use-toast";

export default function LiftTracker() {
  const { state, dispatch } = usePowerlifting();
  const [activeTab, setActiveTab] = useState("squat");
  const [tempStats, setTempStats] = useState(state.currentStats);
  const [tempGoals, setTempGoals] = useState(state.meetGoals);

  const liftIcons = {
    squat: <Target className="h-5 w-5" />,
    bench: <TrendingUp className="h-5 w-5" />,
    deadlift: <Dumbbell className="h-5 w-5" />,
  };

  const liftColors = {
    squat: "bg-red-500",
    bench: "bg-blue-500",
    deadlift: "bg-green-500",
  };

  const calculateAttempts = (max: number) => {
    return {
      opener: Math.round(max * 0.9 * 2.5) / 2.5, // Round to nearest 2.5kg
      second: Math.round(max * 1.0 * 2.5) / 2.5,
      third: Math.round(max * 1.05 * 2.5) / 2.5,
    };
  };

  const handleMaxChange = (
    lift: "squat" | "bench" | "deadlift",
    value: number,
  ) => {
    const newStats = {
      ...tempStats,
      [`${lift}Max`]: value,
    };
    setTempStats(newStats);

    // Auto-calculate attempts based on new max
    const attempts = calculateAttempts(value);
    const newGoals = {
      ...tempGoals,
      [lift]: {
        ...tempGoals[lift],
        ...attempts,
      },
    };
    setTempGoals(newGoals);
  };

  const handleAttemptChange = (
    lift: "squat" | "bench" | "deadlift",
    attempt: "opener" | "second" | "third",
    value: number,
  ) => {
    const newGoals = {
      ...tempGoals,
      [lift]: {
        ...tempGoals[lift],
        [attempt]: value,
      },
    };
    setTempGoals(newGoals);
  };

  const handleConfidenceChange = (
    lift: "squat" | "bench" | "deadlift",
    confidence: number,
  ) => {
    const newGoals = {
      ...tempGoals,
      [lift]: {
        ...tempGoals[lift],
        confidence,
      },
    };
    setTempGoals(newGoals);
  };

  const saveChanges = () => {
    dispatch({ type: "SET_CURRENT_STATS", payload: tempStats });
    dispatch({ type: "SET_MEET_GOALS", payload: tempGoals });
    toast({
      title: "Changes saved!",
      description: "Your lift data has been updated.",
    });
  };

  const renderLiftTab = (lift: "squat" | "bench" | "deadlift") => {
    const liftName = lift.charAt(0).toUpperCase() + lift.slice(1);
    const currentMax = tempStats[
      `${lift}Max` as keyof typeof tempStats
    ] as number;
    const attempts = tempGoals[lift];
    const color = liftColors[lift];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Current Max */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              {liftIcons[lift]}
              Current {liftName} Max
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor={`${lift}-max`} className="text-gray-300">
                  1RM (kg)
                </Label>
                <Input
                  id={`${lift}-max`}
                  type="number"
                  value={currentMax}
                  onChange={(e) =>
                    handleMaxChange(lift, parseFloat(e.target.value) || 0)
                  }
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                  step="2.5"
                />
              </div>
              <Button
                onClick={() => {
                  const attempts = calculateAttempts(currentMax);
                  handleAttemptChange(lift, "opener", attempts.opener);
                  handleAttemptChange(lift, "second", attempts.second);
                  handleAttemptChange(lift, "third", attempts.third);
                }}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Calculator className="h-4 w-4 mr-1" />
                Auto Calculate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attempt Selection */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Meet Attempts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-300">Opener (90-95%)</Label>
                <Input
                  type="number"
                  value={attempts.opener}
                  onChange={(e) =>
                    handleAttemptChange(
                      lift,
                      "opener",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                  step="2.5"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round((attempts.opener / currentMax) * 100)}% of max
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Second (100-102%)</Label>
                <Input
                  type="number"
                  value={attempts.second}
                  onChange={(e) =>
                    handleAttemptChange(
                      lift,
                      "second",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                  step="2.5"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round((attempts.second / currentMax) * 100)}% of max
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Third (105-110%+)</Label>
                <Input
                  type="number"
                  value={attempts.third}
                  onChange={(e) =>
                    handleAttemptChange(
                      lift,
                      "third",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                  step="2.5"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round((attempts.third / currentMax) * 100)}% of max
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confidence Slider */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Confidence Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300">
                  How confident are you with these attempts?
                </Label>
                <Badge
                  variant="outline"
                  className={`${color} text-white border-none`}
                >
                  {attempts.confidence}/10
                </Badge>
              </div>
              <Slider
                value={[attempts.confidence]}
                onValueChange={(value) =>
                  handleConfidenceChange(lift, value[0])
                }
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Not Confident</span>
                <span>Very Confident</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Lift Tracking</h1>
          <p className="text-gray-400">
            Set your current maxes and plan your meet attempts
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger
              value="squat"
              className="data-[state=active]:bg-red-500"
            >
              <Target className="h-4 w-4 mr-2" />
              Squat
            </TabsTrigger>
            <TabsTrigger
              value="bench"
              className="data-[state=active]:bg-blue-500"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Bench
            </TabsTrigger>
            <TabsTrigger
              value="deadlift"
              className="data-[state=active]:bg-green-500"
            >
              <Dumbbell className="h-4 w-4 mr-2" />
              Deadlift
            </TabsTrigger>
          </TabsList>

          <TabsContent value="squat">{renderLiftTab("squat")}</TabsContent>
          <TabsContent value="bench">{renderLiftTab("bench")}</TabsContent>
          <TabsContent value="deadlift">
            {renderLiftTab("deadlift")}
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={saveChanges}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
