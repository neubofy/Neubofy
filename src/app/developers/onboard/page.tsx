"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, OAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/firebase";
import { verifyRecaptcha } from "@/app/actions/verifyRecaptcha";
import { Button } from "@/components/ui/button";
import { X, Apple, Github } from "lucide-react";
import Link from "next/link";

function OnboardForm() {
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    bio: "",
    portfolioUrl: "",
    specialization: "",
    experienceLevel: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!executeRecaptcha) {
        throw new Error("reCAPTCHA has not been loaded.");
      }
      const token = await executeRecaptcha("signup");

      const isValid = await verifyRecaptcha(token);
      if (!isValid) {
        throw new Error("reCAPTCHA validation failed. Please try again.");
      }

      const userCredential = await createUserWithEmailAndPassword(getFirebaseAuth(), form.email, form.password);
      const user = userCredential.user;

      await setDoc(doc(getFirebaseDb(), "users", user.uid), {
        name: form.name,
        bio: form.bio,
        portfolioUrl: form.portfolioUrl,
        specialization: form.specialization,
        experienceLevel: form.experienceLevel,
        verified: true, // We auto-verify them so they show on the list for this demo
        projects: [],
        contacts: {
          email: form.email,
          telegram: "",
          whatsapp: "",
          socialUrl: ""
        },
        createdAt: new Date().toISOString()
      });

      const profileObj = {
        name: form.name,
        bio: form.bio,
        portfolioUrl: form.portfolioUrl,
        contacts: { email: form.email },
        verified: true
      };
      localStorage.setItem(`developerProfile_${user.uid}`, JSON.stringify(profileObj));

      router.push("/developers");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred during registration.");
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
      if (provider === 'google') {
        authProvider = new GoogleAuthProvider();
        authProvider.setCustomParameters({ prompt: 'select_account' });
      } else if (provider === 'github') {
        authProvider = new GithubAuthProvider();
      } else {
        authProvider = new OAuthProvider('apple.com');
      }

      const userCredential = await signInWithPopup(auth, authProvider);
      const user = userCredential.user;

      const docRef = doc(getFirebaseDb(), "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          name: user.displayName || "New Developer",
          photoURL: user.photoURL || "",
          bio: "I just joined!",
          portfolioUrl: "",
          verified: true,
          projects: [],
          contacts: {
            email: user.email || "",
            telegram: "",
            whatsapp: "",
            socialUrl: ""
          },
          createdAt: new Date().toISOString()
        });
      }

      const profileObj = {
        name: user.displayName || "New Developer",
        bio: "I just joined!",
        portfolioUrl: "",
        contacts: { email: user.email || "" },
        verified: true
      };
      localStorage.setItem(`developerProfile_${user.uid}`, JSON.stringify(profileObj));

      router.push("/developers");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to join with ${provider}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col items-center justify-center pt-24 pb-16 px-4">
      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl glass-card card-3d">
        <Link href="/developers" className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X size={20} />
        </Link>
        <h1 className="text-3xl font-bold text-center mb-2 card-3d-content">Become a Partner</h1>
        <p className="text-center text-muted-foreground mb-6 text-sm">
          Work independently. Build with your expertise. Join the Neubofy orchestration network.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 max-w-[200px] mx-auto">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-white/40'}`}>1</div>
          <div className={`flex-1 h-px ${step >= 2 ? 'bg-primary' : 'bg-white/10'} mx-2`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-white/40'}`}>2</div>
          <div className={`flex-1 h-px ${step >= 3 ? 'bg-primary' : 'bg-white/10'} mx-2`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-white/40'}`}>3</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Step 1: Basics */}
          <div className={step === 1 ? 'block space-y-4' : 'hidden'}>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Name</label>
              <input
                required={step === 1}
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Email</label>
              <input
                required={step === 1}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <Button type="button" onClick={handleNext} className="w-full h-12 bg-white text-black hover:bg-white/90 rounded-full font-medium mt-6">
              Next
            </Button>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div>
            </div>
            {/* ...social buttons moved here ... */}

            <div className="flex flex-col gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => handleProviderJoin('google')}
                className="w-full flex items-center justify-center gap-3 h-12 bg-white text-black hover:bg-gray-100 hover:text-black border-gray-300 font-medium rounded-full"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Sign up with Google
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => handleProviderJoin('github')}
                className="w-full flex items-center justify-center gap-3 h-12 bg-[#24292F] text-white hover:bg-[#24292F]/90 hover:text-white border-transparent font-medium rounded-full"
              >
                <Github size={20} />
                Sign up with GitHub
              </Button>
            </div>
          </div>

          {/* Step 2: Expertise */}
          <div className={step === 2 ? 'block space-y-4' : 'hidden'}>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Primary Specialization</label>
              <select
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-foreground"
              >
                <option value="">Select Specialization</option>
                <option value="Frontend Development">Frontend Development</option>
                <option value="Backend Development">Backend Development</option>
                <option value="Full-Stack Development">Full-Stack Development</option>
                <option value="AI / ML Engineering">AI / ML Engineering</option>
                <option value="Security Auditing">Security Auditing</option>
                <option value="QA / Testing">QA / Testing</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="DevOps & Cloud">DevOps & Cloud</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Experience Level</label>
              <select
                name="experienceLevel"
                value={form.experienceLevel}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-foreground"
              >
                <option value="">Select Level</option>
                <option value="Junior (1-3 yrs)">Junior (1-3 yrs)</option>
                <option value="Mid-Level (3-5 yrs)">Mid-Level (3-5 yrs)</option>
                <option value="Senior (5-8 yrs)">Senior (5-8 yrs)</option>
                <option value="Expert (8+ yrs)">Expert (8+ yrs)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Portfolio / GitHub Link</label>
              <input
                type="url"
                name="portfolioUrl"
                value={form.portfolioUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="https://"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" onClick={handleBack} className="w-1/3 h-12 bg-white/10 text-white hover:bg-white/20 rounded-full font-medium">Back</Button>
              <Button type="button" onClick={handleNext} className="w-2/3 h-12 bg-white text-black hover:bg-white/90 rounded-full font-medium">Next</Button>
            </div>
          </div>

          {/* Step 3: Security & Final */}
          <div className={step === 3 ? 'block space-y-4' : 'hidden'}>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Short Bio</label>
              <textarea
                required={step === 3}
                name="bio"
                value={form.bio}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                rows={3}
                placeholder="Briefly describe your approach to development..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Password</label>
              <input
                required={step === 3}
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                minLength={6}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" onClick={handleBack} className="w-1/3 h-12 bg-white/10 text-white hover:bg-white/20 rounded-full font-medium">Back</Button>
              <Button type="submit" disabled={loading} className="w-2/3 h-12 bg-white text-black hover:bg-white/90 rounded-full font-medium">
                {loading ? "Registering..." : "Complete Registration"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OnboardDeveloperPage() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

  if (!siteKey) {
    return (
       <div className="min-h-screen relative overflow-x-hidden flex flex-col items-center justify-center pt-24 pb-16 px-4">
         <div className="glass-card card-3d p-8 rounded-2xl max-w-md text-center card-3d">
            <h2 className="text-xl font-bold text-destructive mb-2">Configuration Error</h2>
            <p className="text-muted-foreground text-sm">reCAPTCHA site key is missing.</p>
         </div>
       </div>
    );
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={siteKey} useEnterprise={true}>
      <OnboardForm />
    </GoogleReCaptchaProvider>
  );
}
