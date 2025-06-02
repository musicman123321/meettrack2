import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Target,
  TrendingUp,
  Clock,
  Dumbbell,
  Scale,
  CheckSquare,
} from "lucide-react";
import { usePowerlifting } from "../../contexts/PowerliftingContext";
import LiftCard from "./LiftCard";
import AnimatedProgressBar from "./AnimatedProgressBar";

export default function PowerliftingDashboard() {
  const { state, getDaysUntilMeet, calculateWilks } = usePowerlifting();

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
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
            Meet Prep Tracker
          </h1>
          <p className="text-gray-400 text-lg">
            {state.meetInfo.meetName || "Your Next Competition"}
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Days Until Meet
                </CardTitle>
                <Clock className="h-4 w-4 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {daysUntilMeet}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(state.meetInfo.meetDate).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Current Total
                </CardTitle>
                <Dumbbell className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {totalLifts}kg
              </div>
              <p className="text-xs text-gray-500 mt-1">Wilks: {wilksScore}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Body Weight
                </CardTitle>
                <Scale className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {state.currentStats.weight}kg
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Target: {state.meetInfo.targetWeightClass}kg class
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Equipment Ready
                </CardTitle>
                <CheckSquare className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {completedEquipment}/{totalEquipment}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${equipmentProgress}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lift Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
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

        {/* Quick Actions */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h3 className="font-semibold text-white mb-1">Meet Setup</h3>
              <p className="text-sm text-gray-400">
                Configure meet details and goals
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <Scale className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-white mb-1">Weight Tracking</h3>
              <p className="text-sm text-gray-400">
                Monitor weight and cutting progress
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <CheckSquare className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-white mb-1">Equipment Check</h3>
              <p className="text-sm text-gray-400">
                Prepare your competition gear
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
