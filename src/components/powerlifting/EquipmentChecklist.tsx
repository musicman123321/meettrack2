import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckSquare, Package, Calendar, AlertTriangle } from "lucide-react";
import { usePowerlifting } from "../../contexts/PowerliftingContext";
import { EquipmentItem } from "../../types/powerlifting";

export default function EquipmentChecklist() {
  const { state, dispatch } = usePowerlifting();

  const toggleEquipment = (id: string) => {
    dispatch({ type: "TOGGLE_EQUIPMENT", payload: id });
  };

  const getEquipmentByCategory = (category: string) => {
    return state.equipmentChecklist.filter(
      (item) => item.category === category,
    );
  };

  const getCategoryProgress = (category: string) => {
    const items = getEquipmentByCategory(category);
    const completed = items.filter((item) => item.checked).length;
    return items.length > 0 ? (completed / items.length) * 100 : 0;
  };

  const getTotalProgress = () => {
    const completed = state.equipmentChecklist.filter(
      (item) => item.checked,
    ).length;
    return (completed / state.equipmentChecklist.length) * 100;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "essential":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "optional":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "meet-day":
        return <Calendar className="h-5 w-5 text-green-500" />;
      default:
        return <CheckSquare className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "essential":
        return "border-red-500";
      case "optional":
        return "border-blue-500";
      case "meet-day":
        return "border-green-500";
      default:
        return "border-gray-500";
    }
  };

  const renderEquipmentCategory = (
    category: string,
    title: string,
    description: string,
  ) => {
    const items = getEquipmentByCategory(category);
    const progress = getCategoryProgress(category);
    const completed = items.filter((item) => item.checked).length;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          className={`bg-gray-800 border-gray-700 ${getCategoryColor(category)} border-l-4`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getCategoryIcon(category)}
                <div>
                  <CardTitle className="text-white">{title}</CardTitle>
                  <p className="text-sm text-gray-400 mt-1">{description}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge
                  variant="outline"
                  className="text-gray-300 border-gray-600"
                >
                  {completed}/{items.length}
                </Badge>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round(progress)}% complete
                </div>
              </div>
            </div>
            <Progress value={progress} className="mt-3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors cursor-pointer"
                  onClick={() => toggleEquipment(item.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => toggleEquipment(item.id)}
                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <label
                    className={`flex-1 text-sm cursor-pointer ${
                      item.checked ? "text-gray-400 line-through" : "text-white"
                    }`}
                  >
                    {item.name}
                  </label>
                  {item.checked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-500"
                    >
                      <CheckSquare className="h-4 w-4" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Equipment Checklist</h1>
          <p className="text-gray-400">
            Make sure you have everything ready for competition day
          </p>
        </div>

        {/* Overall Progress */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-6 w-6 text-purple-500" />
                <div>
                  <CardTitle className="text-white">Overall Progress</CardTitle>
                  <p className="text-sm text-gray-400 mt-1">
                    Track your preparation completion
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {Math.round(getTotalProgress())}%
                </div>
                <div className="text-sm text-gray-400">
                  {
                    state.equipmentChecklist.filter((item) => item.checked)
                      .length
                  }{" "}
                  of {state.equipmentChecklist.length} items
                </div>
              </div>
            </div>
            <Progress value={getTotalProgress()} className="mt-4" />
          </CardHeader>
        </Card>

        {/* Equipment Categories */}
        <div className="space-y-6">
          {renderEquipmentCategory(
            "essential",
            "Essential Equipment",
            "Must-have items for competition",
          )}

          {renderEquipmentCategory(
            "optional",
            "Optional Equipment",
            "Helpful but not required items",
          )}

          {renderEquipmentCategory(
            "meet-day",
            "Meet Day Preparation",
            "Items and tasks for competition day",
          )}
        </div>

        {/* Tips Card */}
        <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Pro Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-300">
              <p>• Pack your equipment bag the night before the meet</p>
              <p>
                • Bring backup equipment when possible (extra singlet, belt,
                etc.)
              </p>
              <p>
                • Check meet rules for approved equipment brands and
                specifications
              </p>
              <p>
                • Test all equipment during training sessions before the meet
              </p>
              <p>• Arrive early to allow time for equipment inspection</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
