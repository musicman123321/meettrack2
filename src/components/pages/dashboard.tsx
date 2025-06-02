import React, { useState } from "react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import PowerliftingDashboard from "../powerlifting/PowerliftingDashboard";
import LiftTracker from "../powerlifting/LiftTracker";
import WeightManagement from "../powerlifting/WeightManagement";
import EquipmentChecklist from "../powerlifting/EquipmentChecklist";
import Analytics from "../powerlifting/Analytics";
import { PowerliftingProvider } from "../../contexts/PowerliftingContext";

const Dashboard = () => {
  const [activeView, setActiveView] = useState("dashboard");

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <PowerliftingDashboard />;
      case "lifts":
        return <LiftTracker />;
      case "weight":
        return <WeightManagement />;
      case "equipment":
        return <EquipmentChecklist />;
      case "analytics":
        return <Analytics />;
      default:
        return <PowerliftingDashboard />;
    }
  };

  return (
    <PowerliftingProvider>
      <div className="min-h-screen bg-gray-900">
        <TopNavigation />

        <div className="flex pt-16">
          <Sidebar activeItem={activeView} onItemClick={setActiveView} />

          <main className="flex-1 overflow-auto">{renderContent()}</main>
        </div>
      </div>
    </PowerliftingProvider>
  );
};

export default Dashboard;
