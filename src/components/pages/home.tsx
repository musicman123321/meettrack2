import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { motion } from "framer-motion";
// Support Donation Component
function SupportDonation() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [customAmount, setCustomAmount] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const donationAmounts = [5, 10, 25, 50];

  const handleDonation = async (amount: number) => {
    // Track donation click
    analytics.trackDonationClick(amount);

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-create-checkout",
        {
          body: {
            productPriceId: "donation", // This would need to be configured in Polar.sh
            successUrl: `${window.location.origin}/success?type=donation&amount=${amount}`,
            customerEmail: user?.email || "anonymous@example.com",
            metadata: {
              type: "donation",
              amount: amount,
              source: "homepage",
            },
          },
        },
      );

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      console.error("Donation error:", error);
      analytics.trackError("donation_failed", error.message);
      toast({
        title: "Unable to process donation",
        description:
          "Please try again later or contact support at meettrackdev@gmail.com",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setSelectedAmount(numValue);
    }
  };

  const getDonationAmount = () => {
    if (showCustom && customAmount) {
      const amount = parseFloat(customAmount);
      return !isNaN(amount) && amount > 0 ? amount : selectedAmount;
    }
    return selectedAmount;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
            Support Our Development
          </CardTitle>
          <CardDescription className="text-gray-600 text-lg">
            Help us continue improving Meet Prep Tracker with your contribution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-8 pb-8">
          {/* Preset Amounts */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-center">
              Choose an amount
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {donationAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant={
                    selectedAmount === amount && !showCustom
                      ? "default"
                      : "outline"
                  }
                  onClick={() => {
                    setSelectedAmount(amount);
                    setShowCustom(false);
                    setCustomAmount("");
                  }}
                  className={
                    selectedAmount === amount && !showCustom
                      ? "bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-md"
                      : "border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  }
                  size="lg"
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  {amount}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount Toggle */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => {
                setShowCustom(!showCustom);
                if (!showCustom) {
                  setCustomAmount("");
                }
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {showCustom ? "Choose preset amount" : "Enter custom amount"}
            </Button>
          </div>

          {/* Custom Amount Input */}
          {showCustom && (
            <div className="space-y-2">
              <Label
                htmlFor="custom-amount"
                className="text-gray-700 font-medium"
              >
                Custom Amount ($)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="custom-amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Donation Button */}
          <Button
            onClick={() => handleDonation(getDonationAmount())}
            disabled={
              loading ||
              (showCustom && (!customAmount || parseFloat(customAmount) <= 0))
            }
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              `Donate ${getDonationAmount()}`
            )}
          </Button>

          {/* Security Note */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              🔒 Secure payment powered by Polar.sh
            </p>
            <p className="text-xs text-gray-400">
              100% optional • Your support helps us maintain and improve the
              platform
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Interactive Dashboard Preview Cards
const DashboardPreviewCard = ({
  title,
  value,
  subtitle,
  icon,
  color,
  onClick,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}) => {
  return (
    <motion.div
      whileHover={{
        scale: 1.05,
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        y: -5,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 h-full group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
              {title}
            </CardTitle>
            <div
              className={`p-2 rounded-lg ${color} group-hover:scale-110 transition-transform`}
            >
              {icon}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">
            {value}
          </div>
          <p className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
            {subtitle}
          </p>
          <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="text-xs text-red-600 font-medium flex items-center gap-1">
              Click to sign up and start tracking
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const features = [
  {
    icon: <Target className="h-8 w-8 text-red-500" />,
    title: "Lift Tracking",
    description:
      "Track your squat, bench press, and deadlift progress with detailed attempt planning and confidence tracking.",
    previewData: {
      squat: "185kg",
      bench: "125kg",
      deadlift: "220kg",
      confidence: "85%",
    },
  },
  {
    icon: <Scale className="h-8 w-8 text-blue-500" />,
    title: "Weight Management",
    description:
      "Monitor your weight cutting progress and ensure you make your target weight class on competition day.",
    previewData: {
      current: "82.5kg",
      target: "83kg",
      days: "42",
      status: "On Track",
    },
  },
  {
    icon: <CheckSquare className="h-8 w-8 text-green-500" />,
    title: "Equipment Checklist",
    description:
      "Never forget essential gear with our comprehensive equipment and preparation checklists.",
    previewData: {
      completed: "8",
      total: "12",
      percentage: "67%",
      nextItem: "Knee Sleeves",
    },
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-purple-500" />,
    title: "Analytics & Insights",
    description:
      "Calculate Wilks scores, analyze lift distribution, and track your strength progression over time.",
    previewData: {
      wilks: "342",
      total: "530kg",
      trend: "+15kg",
      rank: "Advanced",
    },
  },
  {
    icon: <Calendar className="h-8 w-8 text-orange-500" />,
    title: "Meet Countdown",
    description:
      "Stay on track with countdown timers and preparation milestones leading up to competition day.",
    previewData: {
      days: "42",
      meet: "Spring Classic",
      location: "Local Gym",
      ready: "78%",
    },
  },
  {
    icon: <Trophy className="h-8 w-8 text-yellow-500" />,
    title: "Goal Setting",
    description:
      "Set realistic meet goals and track your progress with visual indicators and confidence metrics.",
    previewData: {
      goal: "550kg",
      current: "530kg",
      progress: "96%",
      timeLeft: "6 weeks",
    },
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

  const handleSignUpClick = () => {
    window.location.href = "/signup";
  };

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
              <>
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Open Dashboard
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
                <TrainingProgressBar className="mt-4" />
              </>
            ) : (
              <div className="flex flex-col gap-6 justify-center items-center w-full max-w-md">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full"
                >
                  <Link to="/signup" className="w-full">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-lg px-8 py-4 w-full shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold"
                    >
                      🚀 Start Your Journey - Sign Up Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </motion.div>
                <p className="text-sm text-gray-500 text-center">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-red-600 hover:text-red-700 font-medium underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      {/* Interactive Dashboard Preview */}
      <section className="py-12 sm:py-20 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
              See Your Progress at a Glance
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-6">
              Get a preview of what your dashboard will look like. Click any
              card to start your journey!
            </p>
            {!user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Badge className="bg-red-100 text-red-800 border-red-200 text-sm px-4 py-2 mb-8">
                  👆 Interactive Preview - Click to Sign Up!
                </Badge>
              </motion.div>
            )}
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            <DashboardPreviewCard
              title="Days Until Meet"
              value="42"
              subtitle="Spring Classic 2024"
              icon={<Calendar className="h-5 w-5 text-white" />}
              color="bg-red-500"
              onClick={handleSignUpClick}
            />
            <DashboardPreviewCard
              title="Current Total"
              value="485kg"
              subtitle="Wilks: 342"
              icon={<Dumbbell className="h-5 w-5 text-white" />}
              color="bg-blue-500"
              onClick={handleSignUpClick}
            />
            <DashboardPreviewCard
              title="Body Weight"
              value="82.5kg"
              subtitle="Target: 83kg class"
              icon={<Scale className="h-5 w-5 text-white" />}
              color="bg-green-500"
              onClick={handleSignUpClick}
            />
            <DashboardPreviewCard
              title="Equipment Ready"
              value="8/12"
              subtitle="67% Complete"
              icon={<CheckSquare className="h-5 w-5 text-white" />}
              color="bg-purple-500"
              onClick={handleSignUpClick}
            />
          </motion.div>

          {!user && (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold"
                  >
                    🎯 Create Your Dashboard Now - Free!
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
              <p className="text-sm text-gray-500 mt-4">
                Join thousands of powerlifters already using Meet Prep Tracker
              </p>
            </motion.div>
          )}
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
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
              >
                <Badge className="bg-red-100 text-red-800 border-red-200 text-sm px-4 py-2">
                  👆 Hover over cards to see dashboard previews - Click to sign
                  up!
                </Badge>
              </motion.div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={user ? "" : "cursor-pointer"}
                onClick={user ? undefined : handleSignUpClick}
              >
                <Card className="bg-white border-gray-200 hover:border-red-300 transition-all duration-500 shadow-sm hover:shadow-xl h-full group relative overflow-hidden">
                  {/* Animated background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <CardHeader className="pb-4 relative z-10">
                    <div className="mb-4 group-hover:scale-125 transition-all duration-500 group-hover:rotate-12">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-gray-900 text-lg sm:text-xl group-hover:text-red-600 transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                      {feature.description}
                    </CardDescription>

                    {/* Dashboard Preview Data - Only show for non-logged in users */}
                    {!user && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        whileHover={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 group-hover:border-red-200 group-hover:bg-red-50 transition-all duration-300"
                      >
                        <div className="text-xs font-semibold text-gray-500 mb-2 group-hover:text-red-600 transition-colors">
                          📊 Dashboard Preview:
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(feature.previewData).map(
                            ([key, value]) => (
                              <motion.div
                                key={key}
                                initial={{ opacity: 0, x: -10 }}
                                whileHover={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.2,
                                  delay: Math.random() * 0.3,
                                }}
                                className="flex justify-between bg-white rounded px-2 py-1 group-hover:bg-red-100 transition-colors duration-300"
                              >
                                <span className="text-gray-600 capitalize group-hover:text-red-700 transition-colors">
                                  {key}:
                                </span>
                                <span className="font-semibold text-gray-900 group-hover:text-red-800 transition-colors">
                                  {value}
                                </span>
                              </motion.div>
                            ),
                          )}
                        </div>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.4 }}
                          className="mt-3 text-center"
                        >
                          <div className="text-xs font-medium text-red-600 flex items-center justify-center gap-1">
                            🚀 Click to start tracking!
                            <ArrowRight className="h-3 w-3" />
                          </div>
                        </motion.div>
                      </motion.div>
                    )}

                    {/* Pulsing border animation for non-logged in users */}
                    {!user && (
                      <div className="absolute inset-0 rounded-lg border-2 border-red-400 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300" />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Call to action after features for non-logged in users */}
          {!user && (
            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold"
                  >
                    🎯 Ready to Start? Sign Up Free!
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
              <p className="text-sm text-gray-500 mt-4">
                Join thousands of powerlifters already using Meet Prep Tracker
              </p>
            </motion.div>
          )}
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
      <section className="py-12 sm:py-20 px-4 bg-gradient-to-r from-red-600 to-orange-600 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full"
            animate={{
              y: [0, 15, 0],
              x: [0, -15, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
          <motion.div
            className="absolute bottom-20 left-1/4 w-12 h-12 bg-white rounded-full"
            animate={{
              y: [0, -10, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </div>

        <div className="container mx-auto text-center relative z-10">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold mb-6 text-white leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Ready to Dominate Your Next Meet?
          </motion.h2>
          <motion.p
            className="text-lg sm:text-xl text-red-100 mb-8 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join thousands of powerlifters who trust Meet Prep Tracker for their
            competition preparation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {user ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/dashboard" className="inline-block">
                  <Button
                    size="lg"
                    className="bg-white text-red-600 hover:bg-gray-100 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/signup" className="inline-block">
                    <Button
                      size="lg"
                      className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8 py-4 font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                      🏆 Start Your Meet Prep Journey
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </motion.div>
                <p className="text-red-100 text-sm">
                  ✅ Free forever • ✅ No credit card required • ✅ Setup in 2
                  minutes
                </p>
              </div>
            )}
          </motion.div>
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
              &copy; 2024 Meet Prep Tracker. Built for powerlifters, by
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
