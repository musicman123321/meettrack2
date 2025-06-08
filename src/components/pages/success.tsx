import { CheckCircle, Heart, Home, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "../../../supabase/auth";
import { analytics } from "@/utils/analytics";

export default function Success() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [paymentType, setPaymentType] = useState<string>("payment");
  const [amount, setAmount] = useState<string>("");

  useEffect(() => {
    // Get payment details from URL params
    const type = searchParams.get("type") || "payment";
    const paymentAmount = searchParams.get("amount") || "";

    setPaymentType(type);
    setAmount(paymentAmount);

    // Track successful payment
    if (type === "donation" && paymentAmount) {
      analytics.trackDonationSuccess(parseFloat(paymentAmount));
    }
  }, [searchParams]);

  const isDonation = paymentType === "donation";
  const title = isDonation
    ? "Thank You for Your Support!"
    : "Payment Successful!";
  const message = isDonation
    ? "Your generous donation helps us continue improving Meet Prep Tracker for the powerlifting community."
    : "Thank you for your purchase. You will receive a confirmation email shortly.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="bg-white shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4"
            >
              {isDonation ? (
                <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Heart className="w-10 h-10 text-white fill-current" />
                </div>
              ) : (
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                {title}
              </CardTitle>
              {amount && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-lg px-3 py-1">
                  ${amount}
                </Badge>
              )}
            </motion.div>
          </CardHeader>

          <CardContent className="text-center space-y-6">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-600 text-lg leading-relaxed"
            >
              {message}
            </motion.p>

            {isDonation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-gray-50 rounded-lg p-4"
              >
                <p className="text-sm text-gray-600">
                  🏋️‍♂️ Your support helps us add new features, maintain the
                  platform, and keep it free for the powerlifting community.
                </p>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-3 pt-4"
            >
              {user ? (
                <Link to="/dashboard" className="flex-1">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link to="/signup" className="flex-1">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}

              <Link to="/" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-gray-300 hover:bg-gray-50"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center pt-4 border-t border-gray-200"
            >
              <p className="text-sm text-gray-500">
                Questions? Contact us at{" "}
                <a
                  href="mailto:meettrackdev@gmail.com"
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  meettrackdev@gmail.com
                </a>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
