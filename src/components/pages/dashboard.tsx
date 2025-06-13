import React, { useState } from "react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import PowerliftingDashboard from "../powerlifting/PowerliftingDashboard";
import LiftTracker from "../powerlifting/LiftTracker";
import Training from "../powerlifting/Training";
import WeightManagement from "../powerlifting/WeightManagement";
import EquipmentChecklist from "../powerlifting/EquipmentChecklist";
import Analytics from "../powerlifting/Analytics";
import SettingsPage from "./SettingsPage";
import HelpContactForm from "./HelpContactForm";
import { PowerliftingProvider } from "../../contexts/PowerliftingContext";

const Dashboard = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [helpFormOpen, setHelpFormOpen] = useState(false);

  const handleItemClick = (key: string) => {
    if (key === "help" || key === "support") {
      setHelpFormOpen(true);
    } else {
      setActiveView(key);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <PowerliftingDashboard onNavigate={setActiveView} />;
      case "lifts":
        return <LiftTracker />;
      case "training":
        return <Training />;
      case "weight":
        return <WeightManagement />;
      case "equipment":
        return <EquipmentChecklist />;
      case "analytics":
        return <Analytics />;
      case "settings":
        return <SettingsPage onBack={() => setActiveView("dashboard")} />;
      default:
        return <PowerliftingDashboard onNavigate={setActiveView} />;
    }
  };

  return (
    <PowerliftingProvider>
      <div className="min-h-screen bg-gray-900">
        <TopNavigation onSettingsClick={() => setActiveView("settings")} />

        <div className="flex pt-16 h-screen">
          <div className="w-16 sm:w-auto flex-shrink-0">
            <Sidebar activeItem={activeView} onItemClick={handleItemClick} />
          </div>

          <main className="flex-1 overflow-auto">{renderContent()}</main>
        </div>

        <HelpContactForm open={helpFormOpen} onOpenChange={setHelpFormOpen} />
      </div>
    </PowerliftingProvider>
  );
};

export default Dashboard;
