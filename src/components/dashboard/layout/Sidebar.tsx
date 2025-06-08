import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Target,
  Scale,
  CheckSquare,
  BarChart3,
  Settings,
  HelpCircle,
  Dumbbell,
} from "lucide-react";
import { usePowerlifting } from "@/contexts/PowerliftingContext";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  key: string;
}

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (key: string) => void;
}

const navItems: NavItem[] = [
  { icon: <LayoutDashboard size={18} />, label: "Dashboard", key: "dashboard" },
  { icon: <Target size={18} />, label: "Lift Tracking", key: "lifts" },
  { icon: <Dumbbell size={18} />, label: "Training", key: "training" },
  { icon: <Scale size={18} />, label: "Weight Management", key: "weight" },
  { icon: <CheckSquare size={18} />, label: "Equipment", key: "equipment" },
  { icon: <BarChart3 size={18} />, label: "Analytics", key: "analytics" },
];

const bottomItems: NavItem[] = [
  { icon: <Settings size={18} />, label: "Settings", key: "settings" },
  { icon: <HelpCircle size={18} />, label: "Support", key: "support" },
];

const Sidebar = ({
  activeItem = "dashboard",
  onItemClick = () => {},
}: SidebarProps) => {
  const { state, getDaysUntilMeet } = usePowerlifting();

  const daysUntilMeet = getDaysUntilMeet();
  const currentTotal =
    state.currentStats.squatMax +
    state.currentStats.benchMax +
    state.currentStats.deadliftMax;
  const completedEquipment = state.equipmentChecklist.filter(
    (item) => item.checked,
  ).length;
  const equipmentProgress = Math.round(
    (completedEquipment / state.equipmentChecklist.length) * 100,
  );

  return (
    <div className="w-full md:w-[240px] lg:w-[260px] h-full border-r border-gray-700 bg-gray-800 flex flex-col">
      <div className="p-3 md:p-4">
        <div className="flex items-center gap-2 mb-2">
          <Dumbbell className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
          <h2 className="text-base md:text-lg font-semibold text-white">
            Meet Prep
          </h2>
        </div>
        <p className="text-xs md:text-sm text-gray-400 hidden sm:block">
          Track your powerlifting preparation
        </p>
      </div>

      <ScrollArea className="flex-1 px-2 md:px-3">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.key}
              variant={item.key === activeItem ? "secondary" : "ghost"}
              className={`w-full justify-start gap-2 text-xs md:text-sm h-10 md:h-11 touch-target ${
                item.key === activeItem
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
              onClick={() => onItemClick(item.key)}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="hidden sm:inline truncate">{item.label}</span>
            </Button>
          ))}
        </div>

        <Separator className="my-4 bg-gray-700" />

        <div className="space-y-1 hidden md:block">
          <h3 className="text-xs font-medium px-3 py-2 text-gray-500">
            Quick Stats
          </h3>
          <div className="px-3 py-2 text-xs text-gray-400">
            <div className="flex justify-between mb-1">
              <span>Days to Meet:</span>
              <span className="text-red-400 font-medium">{daysUntilMeet}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Current Total:</span>
              <span className="text-blue-400 font-medium">
                {currentTotal}kg
              </span>
            </div>
            <div className="flex justify-between">
              <span>Equipment Ready:</span>
              <span className="text-green-400 font-medium">
                {equipmentProgress}%
              </span>
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-2 md:p-3 mt-auto border-t border-gray-700">
        {bottomItems.map((item) => (
          <Button
            key={item.key}
            variant="ghost"
            className="w-full justify-start gap-2 text-xs md:text-sm h-10 md:h-11 mb-1 text-gray-300 hover:bg-gray-700 hover:text-white touch-target"
            onClick={() => onItemClick(item.key)}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span className="hidden sm:inline truncate">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
