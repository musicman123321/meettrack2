import React, { useState, useEffect } from "react";
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
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Weight,
  Clock,
} from "lucide-react";
import { usePowerlifting } from "../../contexts/PowerliftingContext";
import { toast } from "@/components/ui/use-toast";

export default function MeetManagement() {
  const {
    state,
    loading,
    error,
    getDaysUntilMeet,
    saveMeetInfo,
    getAllMeets,
    setActiveMeet,
    deleteMeet,
  } = usePowerlifting();

  const [meetDialogOpen, setMeetDialogOpen] = useState(false);
  const [meetForm, setMeetForm] = useState({
    meetName: "",
    meetDate: new Date().toISOString().split("T")[0],
    location: "",
    targetWeightClass: "74",
  });
  const [saving, setSaving] = useState(false);
  const [meetsList, setMeetsList] = useState<any[]>([]);
  const [loadingMeets, setLoadingMeets] = useState(false);
  const [editingMeet, setEditingMeet] = useState<any>(null);

  // Load meets list on component mount
  useEffect(() => {
    loadMeetsList();
  }, []);

  // Load meets list
  const loadMeetsList = async () => {
    setLoadingMeets(true);
    try {
      const meets = await getAllMeets();
      setMeetsList(meets);
    } catch (error) {
      toast({
        title: "Error loading meets",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingMeets(false);
    }
  };

  // Handle meet selection
  const handleMeetSelection = async (meetId: string) => {
    setSaving(true);
    try {
      await setActiveMeet(meetId);
      await loadMeetsList(); // Refresh the list
      toast({
        title: "Meet selected!",
        description: "Your active meet has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error selecting meet",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle meet deletion
  const handleMeetDeletion = async (meetId: string, meetName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${meetName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      await deleteMeet(meetId);
      await loadMeetsList(); // Refresh the list
      toast({
        title: "Meet deleted!",
        description: "The meet has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error deleting meet",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle meet creation/editing
  const handleMeetSave = async () => {
    if (!meetForm.meetName.trim()) {
      toast({
        title: "Meet name required",
        description: "Please enter a name for your meet.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await saveMeetInfo({
        meetName: meetForm.meetName,
        meetDate: new Date(meetForm.meetDate),
        location: meetForm.location,
        targetWeightClass: parseFloat(meetForm.targetWeightClass),
      });

      setMeetDialogOpen(false);
      setEditingMeet(null);
      resetForm();
      await loadMeetsList();
      toast({
        title: editingMeet ? "Meet updated!" : "Meet created!",
        description: "Your competition details have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error saving meet",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setMeetForm({
      meetName: "",
      meetDate: new Date().toISOString().split("T")[0],
      location: "",
      targetWeightClass: "74",
    });
  };

  // Open dialog for new meet
  const openNewMeetDialog = () => {
    resetForm();
    setEditingMeet(null);
    setMeetDialogOpen(true);
  };

  // Open dialog for editing meet
  const openEditMeetDialog = (meet: any) => {
    setMeetForm({
      meetName: meet.meet_name || "",
      meetDate: meet.meet_date,
      location: meet.location || "",
      targetWeightClass: meet.target_weight_class.toString(),
    });
    setEditingMeet(meet);
    setMeetDialogOpen(true);
  };

  const daysUntilMeet = getDaysUntilMeet();
  const activeMeet = meetsList.find((meet) => meet.is_active);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading meet management...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading data: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-3 sm:p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
              Meet Management
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Manage your powerlifting competitions and track your progress
            </p>
          </div>
          <Button
            onClick={openNewMeetDialog}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Meet
          </Button>
        </div>

        {/* Active Meet Overview */}
        {activeMeet && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Active Competition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-1">
                    {daysUntilMeet}
                  </div>
                  <p className="text-sm text-gray-400">Days Until Meet</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    {activeMeet.meet_name}
                  </h3>
                  <div className="text-sm text-gray-400 space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {new Date(activeMeet.meet_date).toLocaleDateString()}
                    </div>
                    {activeMeet.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {activeMeet.location}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Weight className="h-3 w-3" />
                      {activeMeet.target_weight_class}kg weight class
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditMeetDialog(activeMeet)}
                    className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Meets List */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">All Competitions</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingMeets ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading meets...</div>
              </div>
            ) : meetsList.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">No meets found</div>
                <p className="text-sm text-gray-500 mb-4">
                  Create your first meet to start tracking your powerlifting
                  preparation.
                </p>
                <Button
                  onClick={openNewMeetDialog}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Meet
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {meetsList.map((meet) => (
                  <div
                    key={meet.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      meet.is_active
                        ? "bg-blue-900/30 border-blue-500/50"
                        : "bg-gray-700/50 border-gray-600 hover:border-gray-500"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-white text-lg">
                            {meet.meet_name || "Unnamed Meet"}
                          </h4>
                          {meet.is_active && (
                            <Badge className="bg-blue-600 text-white text-xs">
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {new Date(meet.meet_date).toLocaleDateString()}
                          </div>
                          {meet.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              {meet.location}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Weight className="h-3 w-3" />
                            {meet.target_weight_class}kg weight class
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {!meet.is_active && (
                          <Button
                            size="sm"
                            onClick={() => handleMeetSelection(meet.id)}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 text-xs"
                          >
                            Set Active
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditMeetDialog(meet)}
                          disabled={saving}
                          className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 text-xs"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleMeetDeletion(
                              meet.id,
                              meet.meet_name || "Unnamed Meet",
                            )
                          }
                          disabled={saving}
                          className="bg-red-900/30 border-red-500/50 text-red-400 hover:bg-red-900/50 text-xs"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Meet Dialog */}
        <Dialog open={meetDialogOpen} onOpenChange={setMeetDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>
                {editingMeet ? "Edit Meet" : "Create New Meet"}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {editingMeet
                  ? "Update your competition information."
                  : "Add a new powerlifting competition to track."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="meetName" className="text-gray-300">
                  Meet Name *
                </Label>
                <Input
                  id="meetName"
                  value={meetForm.meetName}
                  onChange={(e) =>
                    setMeetForm((prev) => ({
                      ...prev,
                      meetName: e.target.value,
                    }))
                  }
                  placeholder="e.g., State Championships 2024"
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                />
              </div>
              <div>
                <Label htmlFor="meetDate" className="text-gray-300">
                  Meet Date *
                </Label>
                <Input
                  id="meetDate"
                  type="date"
                  value={meetForm.meetDate}
                  onChange={(e) =>
                    setMeetForm((prev) => ({
                      ...prev,
                      meetDate: e.target.value,
                    }))
                  }
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-gray-300">
                  Location
                </Label>
                <Input
                  id="location"
                  value={meetForm.location}
                  onChange={(e) =>
                    setMeetForm((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="e.g., City Gym, State Name"
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                />
              </div>
              <div>
                <Label htmlFor="targetWeightClass" className="text-gray-300">
                  Target Weight Class (kg) *
                </Label>
                <Input
                  id="targetWeightClass"
                  type="number"
                  value={meetForm.targetWeightClass}
                  onChange={(e) =>
                    setMeetForm((prev) => ({
                      ...prev,
                      targetWeightClass: e.target.value,
                    }))
                  }
                  placeholder="e.g., 74, 83, 93"
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setMeetDialogOpen(false);
                  setEditingMeet(null);
                  resetForm();
                }}
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleMeetSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving
                  ? "Saving..."
                  : editingMeet
                    ? "Update Meet"
                    : "Create Meet"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}
