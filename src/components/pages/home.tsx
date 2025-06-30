import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import TrainingProgressBar from "@/components/powerlifting/TrainingProgressBar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  TrendingUp,
  Dumbbell,
  Scale,
  CheckSquare,
  Calendar,
  Trophy,
  BarChart3,
  Users,
  ArrowRight,
  Star,
  Heart,
  DollarSign,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { toast } from "@/components/ui/use-toast";
import { analytics } from "@/utils/analytics";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// Support Donation Component
function SupportDonation({ isTestMode = false }) {
  // Configuration for different environments
  const config = {
    production: {
      url: "https://www.paypal.com/donate",
      buttonId: "ULFDFJDS9B6EU"
    },
    sandbox: {
      url: "https://www.sandbox.paypal.com/donate", 
      buttonId: "Y7DU3PFDUFY6W" // Your new sandbox button ID
    }
  };

  const currentConfig = isTestMode ? config.sandbox : config.production;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Test Mode Indicator */}
      {isTestMode && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="text-lg mr-2">🧪</span>
            <h3 className="font-semibold text-yellow-800">SANDBOX MODE</h3>
          </div>
          <p className="text-yellow-700 text-sm">
            Test payments only - no real money will be charged
          </p>
          <div className="mt-2 text-xs text-yellow-600">
            Button ID: {currentConfig.buttonId}
          </div>
        </div>
      )}

      <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
            Support Independent Development
          </CardTitle>
          <CardDescription className="text-gray-600 text-lg">
            Help keep Meet Prep Tracker free and growing
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {/* Why Donate Section */}
          <div className="mb-6 text-center">
            <p className="text-gray-700 mb-4">
              Meet Prep Tracker is built and maintained by <strong>one developer</strong> who's passionate about powerlifting. 
              Your donation directly supports:
            </p>
            <ul className="text-left list-disc pl-5 space-y-2 text-gray-600 mb-6 max-w-md mx-auto">
              <li>Server costs and hosting fees</li>
              <li>New feature development</li>
              <li>Bug fixes and maintenance</li>
            </ul>
            <p className="text-gray-700 font-medium">
              Every contribution makes a difference! ❤️
            </p>
          </div>

          {/* PayPal Donation Button */}
          <div className="text-center mb-6">
            {isTestMode ? (
              // Sandbox: Use direct payment form instead of hosted button
              <form 
                action="https://www.sandbox.paypal.com/cgi-bin/webscr"
                method="post" 
                target="_blank"
                className="inline-block"
              >
                <input type="hidden" name="cmd" value="_donations" />
                <input type="hidden" name="business" value="sb-uep2344222452@business.example.com" />
                <input type="hidden" name="item_name" value="Meet Prep Tracker Support" />
                <input type="hidden" name="currency_code" value="USD" />
                <input type="hidden" name="no_note" value="0" />
                <input type="hidden" name="no_shipping" value="1" />
                <input type="hidden" name="return" value="https://your-site.com/thank-you" />
                <input type="hidden" name="cancel_return" value="https://your-site.com/cancelled" />
                <button 
                  type="submit" 
                  className="border-0 bg-transparent p-0 hover:scale-105 transition-transform"
                >
                  <img 
                    src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" 
                    alt="Donate with PayPal button"
                    className="h-12 w-auto" 
                  />
                </button>
              </form>
            ) : (
              // Production: Use your working hosted button
              <form 
                action={currentConfig.url}
                method="post" 
                target="_blank"
                className="inline-block"
              >
                <input type="hidden" name="hosted_button_id" value={currentConfig.buttonId} />
                <button 
                  type="submit" 
                  className="border-0 bg-transparent p-0 hover:scale-105 transition-transform"
                >
                  <img 
                    src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" 
                    alt="Donate with PayPal button"
                    className="h-12 w-auto" 
                  />
                </button>
              </form>
            )}
          </div>

          {/* Security & Transparency */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              🔒 100% secure payment processed by PayPal
            </p>
            <p className="text-xs text-gray-400">
              {isTestMode 
                ? "Sandbox environment - test payments only" 
                : "You'll be redirected to PayPal's trusted platform"
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Testing Instructions (only show in test mode) */}
      {isTestMode && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Testing Instructions</h4>
          <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
            <li>Click the "Donate with PayPal" button above</li>
            <li>You'll be redirected to sandbox.paypal.com</li>
            <li>Log in with a sandbox personal account</li>
            <li>Complete the mock donation</li>
            <li>Check your sandbox business account for the transaction</li>
          </ol>
          <div className="mt-3 p-3 bg-white rounded border text-sm">
            <p className="font-medium text-gray-700">Need a test account?</p>
            <p className="text-gray-600 text-xs">
              Create one at{" "}
              <a 
                href="https://developer.paypal.com/dashboard/accounts" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                developer.paypal.com
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const features = [
  {
    icon: <Target className="h-8 w-8 text-red-500" />,
    title: "Lift Tracking",
    description:
      "Track your squat, bench press, and deadlift progress with detailed attempt planning and confidence tracking.",
  },
  {
    icon: <Scale className="h-8 w-8 text-blue-500" />,
    title: "Weight Management",
    description:
      "Monitor your weight cutting progress and ensure you make your target weight class on competition day.",
  },
  {
    icon: <CheckSquare className="h-8 w-8 text-green-500" />,
    title: "Equipment Checklist",
    description:
      "Never forget essential gear with our comprehensive equipment and preparation checklists.",
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-purple-500" />,
    title: "Analytics & Insights",
    description:
      "Calculate Wilks scores, analyze lift distribution, and track your strength progression over time.",
  },
  {
    icon: <Calendar className="h-8 w-8 text-orange-500" />,
    title: "Meet Countdown",
    description:
      "Stay on track with countdown timers and preparation milestones leading up to competition day.",
  },
  {
    icon: <Trophy className="h-8 w-8 text-yellow-500" />,
    title: "Goal Setting",
    description:
      "Set realistic meet goals and track your progress with visual indicators and confidence metrics.",
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Competitive Powerlifter",
    content:
      "This tracker helped me organize my entire meet prep. I hit all my openers and PRed on my third attempts!",
    rating: 5,
  },
  {
    name: "Mike Chen",
    role: "Powerlifting Coach",
    content:
      "I recommend this to all my athletes. The attempt selection tool is incredibly useful for meet planning.",
    rating: 5,
  },
  {
    name: "Emma Rodriguez",
    role: "First-Time Competitor",
    content:
      "As a beginner, this made my first meet so much less stressful. The checklists were a lifesaver!",
    rating: 5,
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Dumbbell className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                Meet Prep Tracker
              </h1>
            </div>
            <nav className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
                <Link to="/dashboard">
                  <Button className="bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base px-3 sm:px-4 py-2">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <div className="flex space-x-2">
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      className="text-gray-700 hover:bg-gray-100 text-sm sm:text-base px-3 sm:px-4 py-2"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base px-3 sm:px-4 py-2">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>
      {/* Beta Notice */}
      <section className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
            <span className="text-orange-700 font-medium text-sm sm:text-base">
              🚧 This app is in beta and completely free to use!
            </span>
            <span className="text-gray-600 text-sm">
              Support development or report bugs at{" "}
              <a
                href="mailto:meettrackdev@gmail.com"
                className="text-red-600 hover:text-red-700 font-medium underline"
              >
                meettrackdev@gmail.com
              </a>
            </span>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-red-600 text-white hover:bg-red-700 text-xs sm:text-sm">
            For Powerlifters, By Powerlifters
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent leading-tight">
            Master Your Meet Prep
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            The complete powerlifting competition preparation tool. Track your
            lifts, manage your weight cut, and ensure you're ready to dominate
            on meet day.
          </p>
          <div className="flex flex-col gap-6 justify-center items-center">
            {user ? (
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                >
                  Open Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                  >
                    Sign Up
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50 text-gray-700 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-12 sm:py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
              Everything You Need for Meet Success
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed specifically for powerlifting
              competition preparation
            </p>
            {!user && (
              <p className="text-base text-gray-500 mt-4 max-w-xl mx-auto">
                Get a preview of what your dashboard will look like. Click any
                card to start your journey!
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <Card
                  className={`bg-white border-gray-200 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-lg h-full group ${
                    !user ? "cursor-pointer" : ""
                  }`}
                  onClick={
                    !user ? () => (window.location.href = "/signup") : undefined
                  }
                >
                  <CardHeader className="pb-4">
                    <div className="mb-4 transform group-hover:scale-110 transition-transform duration-200">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-gray-900 text-lg sm:text-xl group-hover:text-red-600 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Testimonials Section
      <section className="py-12 sm:py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
              Trusted by Powerlifters Worldwide
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              See what athletes and coaches are saying about Meet Prep Tracker
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="bg-white border-gray-200 shadow-sm h-full"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <CardTitle className="text-gray-900 text-sm sm:text-base">
                        {testimonial.name}
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-xs sm:text-sm">
                        {testimonial.role}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-500 text-yellow-500"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                    {testimonial.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}
      {/* Support Section */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">
              Support Our Development
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Help us continue improving Meet Prep Tracker with an optional
              donation. Every contribution helps us add new features, maintain
              the platform, and keep it free for the powerlifting community.
            </p>
          </div>
          <div className="flex justify-center">
            <SupportDonation />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 bg-gradient-to-r from-red-600 to-orange-600">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white leading-tight">
            Ready to Dominate Your Next Meet?
          </h2>
          <p className="text-lg sm:text-xl text-red-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of powerlifters who trust Meet Prep Tracker for their
            competition preparation.
          </p>
          {user ? (
            <Link to="/dashboard" className="inline-block">
              <Button
                size="lg"
                className="bg-white text-red-600 hover:bg-gray-100 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 font-semibold"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
          ) : (
            <Link to="/signup" className="inline-block">
              <Button
                size="lg"
                className="bg-white text-red-600 hover:bg-gray-100 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 font-semibold"
              >
                Sign Up
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>
      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 sm:py-12 px-4 bg-white">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
              <span className="text-lg sm:text-xl font-bold text-gray-900">
                Meet Prep Tracker
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-gray-600 text-sm sm:text-base">
              <Link
                to="/privacy"
                className="hover:text-gray-900 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="hover:text-gray-900 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/support"
                className="hover:text-gray-900 transition-colors"
              >
                Support
              </Link>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 text-center text-gray-600 text-sm sm:text-base">
            <p>
              &copy; 2025 Meet Prep Tracker. Built for powerlifters, by
              powerlifters.
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Beta version - Free to use during development phase
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
