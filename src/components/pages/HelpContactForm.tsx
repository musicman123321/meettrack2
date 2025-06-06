import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HelpCircle, Send, Mail, ArrowLeft } from "lucide-react";
import { useAuth } from "../../../supabase/auth";
import { toast } from "@/components/ui/use-toast";

interface HelpContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function HelpContactForm({
  open,
  onOpenChange,
}: HelpContactFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: user?.email || "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Create mailto link as fallback
      const mailtoLink = `mailto:help@themeettracker.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
        `From: ${formData.email}\n\nMessage:\n${formData.message}`,
      )}`;

      // Open mailto link
      window.location.href = mailtoLink;

      toast({
        title: "Support request created!",
        description:
          "Your email client should open with the support request. If not, please email help@themeettracker.com directly.",
      });

      // Reset form and close dialog
      setFormData({
        email: user?.email || "",
        subject: "",
        message: "",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error creating support request",
        description:
          "Please try again or email help@themeettracker.com directly.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDirectEmail = () => {
    window.location.href = "mailto:help@themeettracker.com";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-500" />
            Contact Support
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Send us a message and we'll get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">
              Your Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="your.email@example.com"
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="text-gray-300">
              Subject
            </Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              placeholder="Brief description of your issue or question"
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-gray-300">
              Message
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder="Please describe your issue or question in detail..."
              className="bg-gray-700 border-gray-600 text-white min-h-[120px]"
              required
            />
          </div>

          <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300">
              <strong>Note:</strong> This will open your default email client.
              If you prefer, you can also email us directly at{" "}
              <button
                type="button"
                onClick={handleDirectEmail}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                help@themeettracker.com
              </button>
            </p>
          </div>
        </form>

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDirectEmail}
            variant="outline"
            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            <Mail className="h-4 w-4 mr-2" />
            Direct Email
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            {submitting ? "Sending..." : "Send Message"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
