"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Mail, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back!");
      router.push("/");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const signInWithProvider = async (provider: "google" | "github") => {
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : undefined;
      const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: origin } });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err?.message || "OAuth sign-in failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Nagarsetu
          </Link>
          <p className="text-gray-600 mt-2">Welcome back! Please sign in to your account.</p>
        </div>

        <Card className="shadow-xl border border-gray-200 bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-foreground">Sign In</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => signInWithProvider("github")}
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => signInWithProvider("google")}
              >
                <Mail className="mr-2 h-4 w-4" />
                Google
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90" size="lg">
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don&apos;t have an account? </span>
              <Link href="/signup" className="text-blue-600 hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}