"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Mail, Eye, EyeOff, User } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import type { Database } from "@/lib/database.types";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.name }
        }
      });
      if (error) throw error;

      if (data.user) {
        // Create profile row if not exists
        try {
          const profile: Database['public']['Tables']['user_profiles']['Insert'] = {
            id: data.user.id,
            full_name: formData.name,
            email: formData.email,
            role: 'citizen'
          }
          await (supabase as any).from('user_profiles').upsert(profile, { onConflict: 'id' })
        } catch {}
      }

      toast.success("Account created! Check your email to verify.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Nagarsetu
          </Link>
          <p className="text-gray-600 mt-2">Create your account to start reporting and tracking civic issues.</p>
        </div>

        <Card className="shadow-xl border border-gray-200 bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-foreground">Create Account</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Sign up to get started with Nagarsetu
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Social Signup Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button type="button" variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-100" onClick={async () => {
                try {
                  const origin = typeof window !== 'undefined' ? window.location.origin : undefined
                  const { error } = await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: origin } })
                  if (error) throw error
                } catch (err: any) { toast.error(err?.message || 'GitHub signup failed') }
              }}>
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
              <Button type="button" variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-100" onClick={async () => {
                try {
                  const origin = typeof window !== 'undefined' ? window.location.origin : undefined
                  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: origin } })
                  if (error) throw error
                } catch (err: any) { toast.error(err?.message || 'Google signup failed') }
              }}>
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

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    className="w-full pl-10"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="w-full pl-10"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                    className="w-full pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90" size="lg">
                {loading ? 'Creating…' : 'Create Account'}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            By creating an account, you agree to our{" "}
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