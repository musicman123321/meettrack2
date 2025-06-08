import React from "react";
import { ArrowLeft, Shield, Eye, Database, Cookie, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const PrivacyPolicyPage: React.FC = () => {
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
              <Shield className="h-6 w-6 text-red-500" />
              <h1 className="text-xl font-bold text-gray-900">
                Privacy Policy
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-500" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                At Meet Prep Tracker, we take your privacy seriously. This
                Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you use our powerlifting
                competition preparation application.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Last updated:</strong> January 1, 2024
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using Meet Prep Tracker, you agree to the collection and use
                of information in accordance with this policy.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-green-500" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Personal Information
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>
                    Email address (for account creation and authentication)
                  </li>
                  <li>Name (optional, for personalization)</li>
                  <li>Profile information you choose to provide</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Training Data
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>
                    Powerlifting performance data (squat, bench press, deadlift
                    records)
                  </li>
                  <li>Body weight and weight history</li>
                  <li>Training sessions and workout logs</li>
                  <li>Competition goals and meet information</li>
                  <li>Equipment checklist preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Usage Information
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>App usage patterns and feature interactions</li>
                  <li>Device information (browser type, operating system)</li>
                  <li>IP address and general location information</li>
                  <li>Error logs and performance data</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-500" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>
                    Provide and maintain the Meet Prep Tracker service
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Store and sync your training data across devices</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>
                    Generate analytics and insights about your training progress
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Improve our service and develop new features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>
                    Communicate with you about service updates and support
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>
                    Process donations and payment transactions securely
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate technical and organizational security
                measures to protect your personal information against
                unauthorized access, alteration, disclosure, or destruction.
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>All data is encrypted in transit using HTTPS/TLS</li>
                <li>Database connections are encrypted and secured</li>
                <li>
                  Access to your data is restricted to authorized personnel only
                </li>
                <li>Regular security audits and updates are performed</li>
                <li>
                  Payment processing is handled by secure third-party providers
                  (Polar.sh)
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-orange-500" />
                Data Sharing and Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal
                information to third parties, except in the following
                circumstances:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>
                  <strong>Service Providers:</strong> We may share data with
                  trusted third-party services that help us operate our
                  application (e.g., Supabase for database hosting, Polar.sh for
                  payments)
                </li>
                <li>
                  <strong>Legal Requirements:</strong> We may disclose
                  information if required by law or to protect our rights and
                  safety
                </li>
                <li>
                  <strong>Business Transfers:</strong> In the event of a merger
                  or acquisition, user data may be transferred as part of the
                  business assets
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                All third-party service providers are required to maintain the
                confidentiality and security of your information.
              </p>
            </CardContent>
          </Card>

          {/* Cookies and Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5 text-yellow-500" />
                Cookies and Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                We use cookies and similar tracking technologies to enhance your
                experience:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>
                  <strong>Essential Cookies:</strong> Required for
                  authentication and basic functionality
                </li>
                <li>
                  <strong>Preference Cookies:</strong> Remember your settings
                  and preferences
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> Help us understand how you
                  use our application
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                You can control cookie settings through your browser
                preferences, though disabling certain cookies may affect
                functionality.
              </p>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-500" />
                Your Rights and Choices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>
                    <strong>Access:</strong> Request a copy of your personal
                    data
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>
                    <strong>Correction:</strong> Update or correct inaccurate
                    information
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>
                    <strong>Deletion:</strong> Request deletion of your account
                    and data
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>
                    <strong>Portability:</strong> Export your data in a
                    machine-readable format
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>
                    <strong>Opt-out:</strong> Unsubscribe from marketing
                    communications
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy or our data
                practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> meettrackdev@gmail.com
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Response Time:</strong> We aim to respond to all
                  privacy inquiries within 48 hours.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Policy Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last updated" date. You are advised
                to review this Privacy Policy periodically for any changes.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;
