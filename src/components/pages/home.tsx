import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { useAuth } from "../../../supabase/auth";

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
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Dumbbell className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">
                Meet Prep Tracker
              </h1>
            </div>
            <nav className="flex items-center space-x-4">
              {user ? (
                <Link to="/dashboard">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <div className="flex space-x-2">
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      className="text-gray-700 hover:bg-gray-100"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="bg-red-600 hover:bg-red-700 text-white">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-red-600 text-white hover:bg-red-700">
            For Powerlifters, By Powerlifters
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Master Your Meet Prep
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The complete powerlifting competition preparation tool. Track your
            lifts, manage your weight cut, and ensure you're ready to dominate
            on meet day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-4"
                >
                  Open Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <Button
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-4"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50 text-gray-700 text-lg px-8 py-4"
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Everything You Need for Meet Success
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed specifically for powerlifting
              competition preparation
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-white border-gray-200 hover:border-gray-300 transition-colors shadow-sm hover:shadow-md"
              >
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Trusted by Powerlifters Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what athletes and coaches are saying about Meet Prep Tracker
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <CardTitle className="text-gray-900 text-base">
                        {testimonial.name}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
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
                        className="h-4 w-4 fill-yellow-500 text-yellow-500"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700">{testimonial.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-red-600 to-orange-600">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Ready to Dominate Your Next Meet?
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Join thousands of powerlifters who trust Meet Prep Tracker for their
            competition preparation.
          </p>
          {user ? (
            <Link to="/dashboard">
              <Button
                size="lg"
                className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8 py-4 font-semibold"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8 py-4 font-semibold"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>
      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-4 bg-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Dumbbell className="h-6 w-6 text-red-500" />
              <span className="text-xl font-bold text-gray-900">
                Meet Prep Tracker
              </span>
            </div>
            <div className="flex space-x-6 text-gray-600">
              <a href="#" className="hover:text-gray-900 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-gray-900 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-gray-900 transition-colors">
                Support
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>
              &copy; 2024 Meet Prep Tracker. Built for powerlifters, by
              powerlifters.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
