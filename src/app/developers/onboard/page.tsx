"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, OAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import ReCAPTCHA from "react-google-recaptcha";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/firebase";
import { verifyRecaptcha } from "@/app/actions/verifyRecaptcha";
import { Button } from "@/components/ui/button";

export default function OnboardDeveloperPage() {
  const router = useRouter();
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    bio: "",
    portfolioUrl: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = recaptchaRef.current?.getValue();
      if (!token) {
        throw new Error("Please complete the reCAPTCHA.");
      }

      const isValid = await verifyRecaptcha(token);
      if (!isValid) {
        throw new Error("reCAPTCHA validation failed. Please try again.");
      }

      const userCredential = await createUserWithEmailAndPassword(getFirebaseAuth(), form.email, form.password);
      const user = userCredential.user;

      await setDoc(doc(getFirebaseDb(), "developers", user.uid), {
        name: form.name,
        bio: form.bio,
        portfolioUrl: form.portfolioUrl,
        verified: true, // We auto-verify them so they show on the list for this demo
        projects: [],
        createdAt: new Date().toISOString()
      });

      router.push("/developers");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred during registration.");
      recaptchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  const handleProviderJoin = async (provider: 'google' | 'github' | 'apple') => {
    setLoading(true);
    setError("");
    try {
      const auth = getFirebaseAuth();
      let authProvider;
      if (provider === 'google') authProvider = new GoogleAuthProvider();
      else if (provider === 'github') authProvider = new GithubAuthProvider();
      else authProvider = new OAuthProvider('apple.com');

      const userCredential = await signInWithPopup(auth, authProvider);
      const user = userCredential.user;

      const docRef = doc(getFirebaseDb(), "developers", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          name: user.displayName || "New Developer",
          photoURL: user.photoURL || "",
          bio: "I just joined!",
          portfolioUrl: "",
          verified: true,
          projects: [],
          createdAt: new Date().toISOString()
        });
      }

      router.push("/developers");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to join with ${provider}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center pt-24 pb-16 px-4">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen animate-blob" />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl glass-card">
        <h1 className="text-3xl font-bold text-center mb-6">Join as Developer</h1>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              required
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
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
              minLength={6}
              className="w-full px-4 py-2 bg-background/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio (Short)</label>
            <textarea
              required
              name="bio"
              value={form.bio}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Portfolio Link</label>
            <input
              type="url"
              name="portfolioUrl"
              value={form.portfolioUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="flex justify-center my-4">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LcTAKwtAAAAAARRswvVeCt-q-ELRqEoPydi43ra"}
              theme="dark"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full btn-electric">
            {loading ? "Registering..." : "Submit Registration"}
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
              onClick={() => handleProviderJoin('google')}
              className="w-full"
            >
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => handleProviderJoin('github')}
              className="w-full"
            >
              GitHub
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => handleProviderJoin('apple')}
              className="w-full"
            >
              Apple
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
