import React, { useState } from "react";
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
import { Settings, Save, ArrowLeft } from "lucide-react";
import { usePowerlifting } from "@/contexts/PowerliftingContext";
import { toast } from "@/components/ui/use-toast";

interface SettingsPageProps {
  onBack?: () => void;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const { state, updateUnitPreference } = usePowerlifting();
  const [selectedUnit, setSelectedUnit] = useState<"kg" | "lbs">(
    state.unitPreference,
  );
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await updateUnitPreference(selectedUnit);
      toast({
        title: "Settings saved!",
        description: `Unit preference updated to ${selectedUnit.toUpperCase()}.`,
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

  const hasChanges = selectedUnit !== state.unitPreference;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
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

        {/* Unit Preferences */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Settings className="h-5 w-5 text-blue-500" />
              Unit Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300 text-base font-medium">
                  Weight Unit
                </Label>
                <p className="text-sm text-gray-400 mb-3">
                  Choose your preferred unit for displaying weights and lifts
                  throughout the app.
                </p>
                <Select
                  value={selectedUnit}
                  onValueChange={(value: "kg" | "lbs") =>
                    setSelectedUnit(value)
                  }
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="kg" className="text-white">
                      Kilograms (kg)
                    </SelectItem>
                    <SelectItem value="lbs" className="text-white">
                      Pounds (lbs)
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                <Button
                  onClick={handleSaveSettings}
                  disabled={!hasChanges || saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>

            {hasChanges && (
              <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-300">
                  <strong>Note:</strong> Changing your unit preference will
                  automatically convert all weight and lift values throughout
                  the app to display in {selectedUnit.toUpperCase()}.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Future Settings Placeholder */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Additional Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm">
              More settings options will be available in future updates.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
