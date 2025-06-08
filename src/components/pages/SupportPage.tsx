import React, { useState } from "react";
import {
  ArrowLeft,
  Mail,
  MessageCircle,
  Bug,
  Lightbulb,
  Heart,
  Send,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

const SupportPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.category ||
      !formData.subject ||
      !formData.message
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create mailto link with form data
      const emailBody = `
Name: ${formData.name}
Email: ${formData.email}
Category: ${formData.category}
Subject: ${formData.subject}

Message:
${formData.message}

---
Sent from Meet Prep Tracker Support Form`;

      const mailtoLink = `mailto:meettrackdev@gmail.com?subject=${encodeURIComponent(`[${formData.category}] ${formData.subject}`)}&body=${encodeURIComponent(emailBody)}`;

      // Open email client
      window.location.href = mailtoLink;

      // Show success state
      setIsSubmitted(true);

      toast({
        title: "Email Client Opened",
        description:
          "Your email client should open with the pre-filled message. Please send it to complete your support request.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          "There was an issue opening your email client. Please email us directly at meettrackdev@gmail.com",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      category: "",
      subject: "",
      message: "",
    });
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-red-500" />
              <h1 className="text-xl font-bold text-gray-900">
                Support & Contact
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-500" />
                  Get in Touch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    🚧 Beta Support
                  </p>
                  <p className="text-sm text-blue-700">
                    This app is in beta. It's free to use for now, but if you'd
                    like to support continued development, please consider
                    donating.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Email Support
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    meettrackdev@gmail.com
                  </p>
                  <p className="text-gray-500 text-xs">
                    Response time: Usually within 48 hours
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What We Can Help With
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-center gap-2">
                      <Bug className="h-4 w-4 text-red-500" />
                      Bug reports and technical issues
                    </li>
                    <li className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Feature requests and suggestions
                    </li>
                    <li className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-blue-500" />
                      General questions and feedback
                    </li>
                    <li className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-pink-500" />
                      Account and data questions
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Include your email address for faster responses</li>
                  <li>• Describe the issue with as much detail as possible</li>
                  <li>
                    • Mention your browser and device type for technical issues
                  </li>
                  <li>• Screenshots are helpful for bug reports</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-green-500" />
                  Send Us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Email Client Opened!
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Your email client should have opened with a pre-filled
                      message. Please send it to complete your support request.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      If your email client didn't open, you can manually send an
                      email to <strong>meettrackdev@gmail.com</strong> with your
                      message.
                    </p>
                    <Button onClick={resetForm} variant="outline">
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          handleInputChange("category", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bug">🐛 Bug Report</SelectItem>
                          <SelectItem value="feature">
                            💡 Feature Request
                          </SelectItem>
                          <SelectItem value="question">
                            ❓ General Question
                          </SelectItem>
                          <SelectItem value="account">
                            👤 Account Issue
                          </SelectItem>
                          <SelectItem value="feedback">💬 Feedback</SelectItem>
                          <SelectItem value="other">📝 Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) =>
                          handleInputChange("subject", e.target.value)
                        }
                        placeholder="Brief description of your issue or question"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) =>
                          handleInputChange("message", e.target.value)
                        }
                        placeholder="Please provide as much detail as possible. For bug reports, include steps to reproduce the issue and your browser/device information."
                        rows={6}
                        required
                      />
                    </div>

                    <Alert>
                      <Mail className="h-4 w-4" />
                      <AlertDescription>
                        This form will open your default email client with a
                        pre-filled message. Make sure you have an email client
                        configured, or you can email us directly at{" "}
                        <strong>meettrackdev@gmail.com</strong>.
                      </AlertDescription>
                    </Alert>

                    <Button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Opening Email Client...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupportPage;
