"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/firebase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { X } from "lucide-react";

export default function LoginPage() {
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
      await signInWithEmailAndPassword(getFirebaseAuth(), form.email, form.password);
      router.push("/developers/profile");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password.");
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
      if (provider === 'google') authProvider = new GoogleAuthProvider();
      else if (provider === 'github') authProvider = new GithubAuthProvider();
      else authProvider = new OAuthProvider('apple.com');

      await signInWithPopup(auth, authProvider);
      router.push("/developers/profile");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to sign in with ${provider}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex flex-col items-center justify-center pt-24 pb-16 px-4">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen animate-blob" />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl glass-card">
        <Link href="/developers" className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X size={20} />
        </Link>
        <h1 className="text-3xl font-bold text-center mb-6">Developer Login</h1>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              required
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full btn-electric mt-6">
            {loading ? "Logging in..." : "Login"}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => handleProviderLogin('google')}
              className="w-full"
            >
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => handleProviderLogin('github')}
              className="w-full"
            >
              GitHub
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => handleProviderLogin('apple')}
              className="w-full"
            >
              Apple
            </Button>
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/developers/onboard" className="text-primary hover:underline">
              Join as a Developer
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
