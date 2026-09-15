"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/firebase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { X, Apple, Github, Lock, ArrowRight } from "lucide-react";

export default function PartnerLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, form.email, form.password);
      router.push("/career/profile");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleProviderLogin = async (provider: 'google' | 'github' | 'apple') => {
    setLoading(true);
    setError("");
    try {
      const auth = getFirebaseAuth();
      let authProvider;
      if (provider === 'google') {
        authProvider = new GoogleAuthProvider();
        authProvider.setCustomParameters({ prompt: 'select_account' });
      } else if (provider === 'github') {
        authProvider = new GithubAuthProvider();
      } else {
        authProvider = new OAuthProvider('apple.com');
      }

      await signInWithPopup(auth, authProvider);
      router.push("/career/profile");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to sign in with ${provider}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col items-center justify-center pt-24 pb-16 px-4">
      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl glass-card card-3d border border-white/10 backdrop-blur-2xl">
        <Link href="/career" className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X size={20} />
        </Link>
        
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Secure Specialist Access
          </span>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 card-3d-content">Specialist Login</h1>
        <p className="text-center text-muted-foreground mb-6 text-sm">
          Access your orchestration profile, capability listings, and project statuses.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Email address</label>
            <input
              required
              type="email"
              name="email"
              placeholder="you@domain.com"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground/50 text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Password</label>
            <input
              required
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground/50 text-foreground"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 btn-electric rounded-xl font-medium mt-2 gap-2">
            {loading ? "Logging in..." : (
              <>
                Login to Specialist Dashboard <ArrowRight size={16} />
              </>
            )}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => handleProviderLogin('google')}
              className="w-full flex items-center justify-center gap-3 h-12 bg-white text-black hover:bg-gray-100 hover:text-black border-gray-300 font-medium rounded-xl"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Sign in with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => handleProviderLogin('github')}
              className="w-full flex items-center justify-center gap-3 h-12 bg-[#24292F] text-white hover:bg-[#24292F]/90 hover:text-white border-transparent font-medium rounded-xl"
            >
              <Github size={20} />
              Sign in with GitHub
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => handleProviderLogin('apple')}
              className="w-full flex items-center justify-center gap-3 h-12 bg-black text-white hover:bg-black/90 hover:text-white border-white/20 font-medium rounded-xl"
            >
              <Apple size={20} className="mb-0.5" />
              Sign in with Apple
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground pt-2">
            Don&apos;t have an account?{" "}
            <Link href="/career/onboard" className="text-primary hover:underline font-medium">
              Join Specialist Network
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
