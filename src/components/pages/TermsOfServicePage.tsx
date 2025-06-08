import React from "react";
import {
  ArrowLeft,
  FileText,
  AlertTriangle,
  Shield,
  CreditCard,
  Gavel,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";

const TermsOfServicePage: React.FC = () => {
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
              <FileText className="h-6 w-6 text-red-500" />
              <h1 className="text-xl font-bold text-gray-900">
                Terms of Service
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Beta Notice */}
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Beta Notice:</strong> Meet Prep Tracker is currently in
              beta. The service is provided free of charge during this period.
              Features and terms may change as we continue development.
            </AlertDescription>
          </Alert>

          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="h-5 w-5 text-blue-500" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Welcome to Meet Prep Tracker. These Terms of Service ("Terms")
                govern your use of our powerlifting competition preparation
                application and services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Last updated:</strong> January 1, 2024
              </p>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using Meet Prep Tracker, you agree to be bound
                by these Terms. If you disagree with any part of these terms,
                you may not access the service.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-500" />
                Service Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Meet Prep Tracker is a web-based application designed to help
                powerlifters prepare for competitions. Our services include:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>
                  Lift tracking and progress monitoring (squat, bench press,
                  deadlift)
                </li>
                <li>Competition attempt planning and confidence tracking</li>
                <li>Weight management and cutting timeline tools</li>
                <li>Equipment and preparation checklists</li>
                <li>Training analytics and performance insights</li>
                <li>Meet countdown and goal tracking</li>
              </ul>
            </CardContent>
          </Card>

          {/* Beta Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Beta Service Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                During the beta period:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>The service is provided free of charge</li>
                <li>
                  Features may be added, modified, or removed without notice
                </li>
                <li>Service availability is not guaranteed</li>
                <li>
                  Data backup and recovery are provided on a best-effort basis
                </li>
                <li>
                  We may reset or migrate data as needed for development
                  purposes
                </li>
                <li>Support is provided via email on a voluntary basis</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We will provide reasonable notice before any major changes that
                affect your data or access to the service.
              </p>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-500" />
                User Accounts and Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Account Creation
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>
                    You must be at least 13 years old to create an account
                  </li>
                  <li>One account per person is permitted</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Acceptable Use
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Use the service only for lawful purposes</li>
                  <li>
                    Do not attempt to gain unauthorized access to our systems
                  </li>
                  <li>
                    Do not interfere with other users' access to the service
                  </li>
                  <li>
                    Do not upload malicious code or attempt to compromise
                    security
                  </li>
                  <li>
                    Do not use the service to store or transmit illegal content
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Donations and Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-500" />
                Donations and Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Meet Prep Tracker accepts voluntary donations to support
                continued development:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>All donations are voluntary and non-refundable</li>
                <li>
                  Donations do not guarantee additional features or priority
                  support
                </li>
                <li>Payment processing is handled securely by Polar.sh</li>
                <li>We do not store your payment information</li>
                <li>Donation receipts are provided for your records</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                By making a donation, you acknowledge that it is a voluntary
                contribution to support the project and not a purchase of goods
                or services.
              </p>
            </CardContent>
          </Card>

          {/* Data and Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-500" />
                Data and Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Your privacy is important to us. Please review our Privacy
                Policy for detailed information about how we collect, use, and
                protect your data.
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>You retain ownership of your training data</li>
                <li>
                  We use your data only to provide and improve our services
                </li>
                <li>You can export or delete your data at any time</li>
                <li>
                  We implement security measures to protect your information
                </li>
              </ul>
              <div className="mt-4">
                <Link to="/privacy">
                  <Button variant="outline" size="sm">
                    Read Privacy Policy
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Disclaimers and Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Service Availability
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  We strive to maintain service availability but cannot
                  guarantee uninterrupted access. The service may be temporarily
                  unavailable due to maintenance, updates, or technical issues.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Fitness and Health Disclaimer
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Meet Prep Tracker is a tracking tool only. We do not provide
                  medical, fitness, or nutritional advice. Always consult with
                  qualified professionals before beginning any training program
                  or making significant changes to your fitness routine.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Limitation of Liability
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  To the maximum extent permitted by law, Meet Prep Tracker
                  shall not be liable for any indirect, incidental, special,
                  consequential, or punitive damages, including but not limited
                  to loss of data, loss of profits, or business interruption.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle>Account Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                You may terminate your account at any time by contacting us. We
                may terminate or suspend your account if you violate these Terms
                or engage in harmful behavior.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Upon termination, your access to the service will cease, and we
                may delete your account data after a reasonable period.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will
                notify users of significant changes via email or through the
                application. Continued use of the service after changes
                constitutes acceptance of the new Terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about these Terms of Service, please
                contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> meettrackdev@gmail.com
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Subject Line:</strong> Terms of Service Inquiry
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TermsOfServicePage;
