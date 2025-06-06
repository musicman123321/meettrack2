import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings,
  Save,
  ArrowLeft,
  CheckCircle,
  Scale,
  Palette,
  Layout,
} from "lucide-react";
import { usePowerlifting } from "@/contexts/PowerliftingContext";
import { toast } from "@/components/ui/use-toast";

interface SettingsPageProps {
  onBack?: () => void;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const { state, saveUserSettings, loading } = usePowerlifting();
  const [selectedUnit, setSelectedUnit] = useState<"kg" | "lbs">(
    state.unitPreference,
  );
  const [selectedTheme, setSelectedTheme] = useState<
    "light" | "dark" | "system"
  >(state.userSettings?.theme || "dark");
  const [selectedStartTab, setSelectedStartTab] = useState<string>(
    state.userSettings?.dashboard_start_tab || "dashboard",
  );
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Update local state when context state changes
  useEffect(() => {
    setSelectedUnit(state.unitPreference);
    setSelectedTheme(state.userSettings?.theme || "dark");
    setSelectedStartTab(state.userSettings?.dashboard_start_tab || "dashboard");
  }, [state.unitPreference, state.userSettings]);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges =
      selectedUnit !== state.unitPreference ||
      selectedTheme !== (state.userSettings?.theme || "dark") ||
      selectedStartTab !==
        (state.userSettings?.dashboard_start_tab || "dashboard");
    setHasUnsavedChanges(hasChanges);
  }, [
    selectedUnit,
    selectedTheme,
    selectedStartTab,
    state.unitPreference,
    state.userSettings,
  ]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await saveUserSettings({
        weight_unit: selectedUnit,
        theme: selectedTheme,
        dashboard_start_tab: selectedStartTab,
      });

      setLastSaved(new Date());
      setHasUnsavedChanges(false);

      toast({
        title: "Settings saved!",
        description:
          "Your preferences have been updated and will persist across sessions.",
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUnitChange = async (unit: "kg" | "lbs") => {
    setSelectedUnit(unit);
    // Auto-save unit preference for immediate feedback
    try {
      await saveUserSettings({ weight_unit: unit });
      toast({
        title: "Unit preference updated!",
        description: `All weights will now display in ${unit.toUpperCase()}.`,
      });
    } catch (error) {
      // Revert on error
      setSelectedUnit(state.unitPreference);
      toast({
        title: "Error updating unit preference",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-blue-400" />
              <h1 className="text-3xl font-bold">Settings</h1>
            </div>
          </div>

          {/* Save Status Indicator */}
          {lastSaved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-sm text-green-400"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </motion.div>
          )}
        </motion.div>

        {/* Unsaved Changes Alert */}
        {hasUnsavedChanges && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert className="bg-yellow-900/20 border-yellow-500/50">
              <AlertDescription className="text-yellow-200">
                You have unsaved changes. Click "Save All Settings" to persist
                your preferences.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Unit Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Scale className="h-5 w-5 text-blue-500" />
                Weight Unit Preference
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300 text-base font-medium">
                    Display Unit
                  </Label>
                  <p className="text-sm text-gray-400 mb-3">
                    Choose your preferred unit for displaying weights and lifts
                    throughout the app. Changes are saved automatically.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant={selectedUnit === "kg" ? "default" : "outline"}
                      onClick={() => handleUnitChange("kg")}
                      className={`flex-1 ${selectedUnit === "kg" ? "bg-blue-600 hover:bg-blue-700" : "border-gray-600 text-gray-300 hover:bg-gray-700"}`}
                      disabled={saving}
                    >
                      <Scale className="h-4 w-4 mr-2" />
                      Kilograms (kg)
                    </Button>
                    <Button
                      variant={selectedUnit === "lbs" ? "default" : "outline"}
                      onClick={() => handleUnitChange("lbs")}
                      className={`flex-1 ${selectedUnit === "lbs" ? "bg-blue-600 hover:bg-blue-700" : "border-gray-600 text-gray-300 hover:bg-gray-700"}`}
                      disabled={saving}
                    >
                      <Scale className="h-4 w-4 mr-2" />
                      Pounds (lbs)
                    </Button>
                  </div>
                </div>

                <Separator className="bg-gray-600" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Current setting:</p>
                    <Badge
                      variant="outline"
                      className="mt-1 border-blue-500 text-blue-400"
                    >
                      {state.unitPreference.toUpperCase()}
                    </Badge>
                  </div>
                  {saving && (
                    <div className="flex items-center gap-2 text-sm text-blue-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                      <span>Updating...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-300">
                  <strong>Auto-conversion:</strong> All weight and lift values
                  throughout the app will automatically convert to display in
                  your selected unit. Your data is stored in both units for
                  accuracy.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Theme Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Palette className="h-5 w-5 text-purple-500" />
                Theme Preference
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-300 text-base font-medium">
                  App Theme
                </Label>
                <p className="text-sm text-gray-400 mb-3">
                  Choose your preferred theme for the application interface.
                </p>
                <Select
                  value={selectedTheme}
                  onValueChange={(value: "light" | "dark" | "system") =>
                    setSelectedTheme(value)
                  }
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="dark" className="text-white">
                      Dark Theme
                    </SelectItem>
                    <SelectItem value="light" className="text-white">
                      Light Theme
                    </SelectItem>
                    <SelectItem value="system" className="text-white">
                      System Default
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dashboard Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Layout className="h-5 w-5 text-green-500" />
                Dashboard Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-300 text-base font-medium">
                  Default Start Tab
                </Label>
                <p className="text-sm text-gray-400 mb-3">
                  Choose which tab to show first when opening the dashboard.
                </p>
                <Select
                  value={selectedStartTab}
                  onValueChange={setSelectedStartTab}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="dashboard" className="text-white">
                      Dashboard Overview
                    </SelectItem>
                    <SelectItem value="lifts" className="text-white">
                      Lift Tracking
                    </SelectItem>
                    <SelectItem value="weight" className="text-white">
                      Weight Management
                    </SelectItem>
                    <SelectItem value="equipment" className="text-white">
                      Equipment Checklist
                    </SelectItem>
                    <SelectItem value="analytics" className="text-white">
                      Analytics
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Save All Settings Button */}
        {hasUnsavedChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end"
          >
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving All Settings..." : "Save All Settings"}
            </Button>
          </motion.div>
        )}

        {/* Future Settings Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-400">
                <p>• Notification preferences</p>
                <p>• Data export/import options</p>
                <p>• Custom weight class targets</p>
                <p>• Training program integration</p>
                <p>• Competition calendar sync</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
