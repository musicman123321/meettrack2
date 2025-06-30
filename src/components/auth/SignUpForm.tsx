import { useState } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { UserPlus, CheckCircle, Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(email, password, fullName);
      setIsSuccess(true);
      toast({
        title: "Account created successfully",
        description: "Please check your email to verify your account.",
        variant: "default",
      });
    } catch (error: any) {
      const message = error?.message || "Error creating account";
      setError(message);
      toast({
        title: "Sign up failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout>
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" /> Account
              Created!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex justify-center">
              <Mail className="h-16 w-16 text-blue-500" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-slate-900">
                A verification link has been sent to your email.
              </p>
              <p className="text-sm text-slate-600">
                Please verify your account before logging in.
              </p>
              <p className="text-sm text-slate-500">
                Check your email at: <strong>{email}</strong>
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button onClick={() => navigate("/login")} className="w-full">
              Go to Login
            </Button>
            <div className="text-sm text-center text-slate-600">
              Didn't receive the email?{" "}
              <button
                onClick={() => setIsSuccess(false)}
                className="text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          </CardFooter>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
            <UserPlus className="h-5 w-5" /> Create an account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full">
              Create account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
