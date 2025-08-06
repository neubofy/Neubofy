import React, { useState, useEffect, useRef } from "react";

const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbz_mo_UjFN7Jcw0A-xBX7q05GtaxbNlI_jM6LRePYqd8-uL4EaW5KuCtZVBI1Woxo5nYQ/exec";
const USER_ID = "nf2121";

function getToday() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function CircularProgress({ value, max, color, children }: any) {
  const radius = 80;
  const stroke = 10;
  const norm = Math.min(value / max, 1);
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - norm);
  return (
    <svg width={180} height={180} style={{ display: "block" }}>
      <circle
        cx={90}
        cy={90}
        r={radius}
        stroke="#e0e7ef"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={90}
        cy={90}
        r={radius}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s cubic-bezier(.4,2,.6,1)" }}
        filter={`drop-shadow(0 0 8px ${color}88)`}
      />
      <foreignObject x={30} y={30} width={120} height={120}>
        <div style={{ width: 120, height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {children}
        </div>
      </foreignObject>
    </svg>
  );
}

const Timelog = () => {
  // Auth
  const [userId, setUserId] = useState<string>(() => localStorage.getItem("timelog_user") || "");
  const [inputId, setInputId] = useState("");
  const [authError, setAuthError] = useState("");

  // Active tab
  const [activeTab, setActiveTab] = useState<"stopwatch" | "pomodoro">("stopwatch");

  // Stopwatch
  const [swElapsed, setSwElapsed] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const swInterval = useRef<any>(null);

  // Pomodoro
  const [pomoWork, setPomoWork] = useState(60);
  const [pomoRest, setPomoRest] = useState(10);
  const [pomoElapsed, setPomoElapsed] = useState(0);
  const [pomoRunning, setPomoRunning] = useState(false);
  const [pomoMode, setPomoMode] = useState<"work" | "rest">("work");
  const pomoInterval = useRef<any>(null);

  // Manual entry
  const [manual, setManual] = useState("");

  // Session log
  const [todaySessions, setTodaySessions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Graph modal
  const [showGraph, setShowGraph] = useState(false);

  // --- Auth logic ---
  useEffect(() => {
    if (userId) localStorage.setItem("timelog_user", userId);
  }, [userId]);

  const handleLogin = () => {
    if (inputId === USER_ID) {
      setUserId(inputId);
      setAuthError("");
    } else {
      setAuthError("Invalid ID");
    }
  };

  // --- Stopwatch logic ---
  useEffect(() => {
    if (swRunning) {
      swInterval.current = setInterval(() => setSwElapsed((s) => s + 1), 1000);
    } else {
      clearInterval(swInterval.current);
    }
    return () => clearInterval(swInterval.current);
  }, [swRunning]);

  const handleSwSubmit = async () => {
    if (swElapsed < 60) return alert("Record at least 1 minute.");
    await logSession(Math.floor(swElapsed / 60));
    setSwElapsed(0);
    setSwRunning(false);
  };

  // --- Pomodoro logic ---
  useEffect(() => {
    if (pomoRunning) {
      pomoInterval.current = setInterval(() => setPomoElapsed((s) => s + 1), 1000);
    } else {
      clearInterval(pomoInterval.current);
    }
    return () => clearInterval(pomoInterval.current);
  }, [pomoRunning]);

  useEffect(() => {
    if (pomoMode === "work" && pomoElapsed >= pomoWork * 60) {
      setPomoMode("rest");
      setPomoElapsed(0);
    } else if (pomoMode === "rest" && pomoElapsed >= pomoRest * 60) {
      setPomoMode("work");
      setPomoElapsed(0);
    }
  }, [pomoElapsed, pomoMode, pomoWork, pomoRest]);

  const handlePomoSubmit = async () => {
    if (pomoMode === "work" && pomoElapsed >= 60) {
      await logSession(Math.floor(pomoElapsed / 60));
      setPomoElapsed(0);
      setPomoRunning(false);
    }
  };

  // --- Manual entry logic ---
  const handleManualSubmit = async () => {
    const mins = parseInt(manual);
    if (!mins || mins < 1) return alert("Enter valid minutes.");
    await logSession(mins);
    setManual("");
  };

  // --- Logging logic ---
  async function logSession(mins: number) {
    setLoading(true);
    const date = getToday();
    const session = String(mins);
    try {
      const url = `${SHEET_API_URL}?date=${date}&session=${session}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === "success") {
        alert("Session logged!");
        setTodaySessions((prev) => [session, ...prev]);
      } else {
        alert("Failed to log session.");
      }
    } catch (e) {
      alert("Error logging session.");
    }
    setLoading(false);
  }

  // --- UI ---
  if (!userId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="bg-white/95 p-8 rounded-2xl shadow-2xl flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Timelog Login</h1>
          <input
            className="border p-2 rounded mb-2"
            placeholder="Enter your ID"
            value={inputId}
            onChange={e => setInputId(e.target.value)}
          />
          <button className="bg-indigo-500 text-white px-4 py-2 rounded" onClick={handleLogin}>
            Login
          </button>
          {authError && <div className="text-red-500 mt-2">{authError}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 transition-all">
      <div className="w-full max-w-2xl p-6 rounded-3xl shadow-2xl bg-white/90 flex flex-col items-center">
        <div className="flex w-full justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                activeTab === "stopwatch"
                  ? "bg-indigo-500 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-indigo-100"
              }`}
              onClick={() => {
                setActiveTab("stopwatch");
                setPomoRunning(false);
              }}
              disabled={swRunning || pomoRunning}
            >
              Stopwatch
            </button>
            <button
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                activeTab === "pomodoro"
                  ? "bg-pink-500 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-pink-100"
              }`}
              onClick={() => {
                setActiveTab("pomodoro");
                setSwRunning(false);
              }}
              disabled={swRunning || pomoRunning}
            >
              Pomodoro
            </button>
          </div>
          <button
            onClick={() => setShowGraph(true)}
            className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 rounded-full font-semibold shadow hover:from-green-500 hover:to-blue-600 transition-all"
          >
            📊 History
          </button>
        </div>

        {/* Stopwatch Tab */}
        {activeTab === "stopwatch" && (
          <div className="w-full flex flex-col items-center">
            <CircularProgress value={swElapsed % 3600} max={3600} color="#6366f1">
              <span className="text-4xl font-mono font-bold text-indigo-700">
                {Math.floor(swElapsed / 60)}:{String(swElapsed % 60).padStart(2, "0")}
              </span>
            </CircularProgress>
            <div className="flex gap-3 mt-6">
              <button
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  swRunning
                    ? "bg-yellow-400 text-white"
                    : "bg-green-500 text-white"
                }`}
                onClick={() => setSwRunning(!swRunning)}
                disabled={pomoRunning}
              >
                {swRunning ? "Pause" : "Start"}
              </button>
              <button
                className="bg-gray-400 text-white px-6 py-2 rounded-full font-semibold"
                onClick={() => { setSwElapsed(0); setSwRunning(false); }}
                disabled={swElapsed === 0}
              >
                Reset
              </button>
              <button
                className="bg-indigo-500 text-white px-6 py-2 rounded-full font-semibold"
                onClick={handleSwSubmit}
                disabled={swElapsed < 60 || loading}
              >
                Log
              </button>
            </div>
          </div>
        )}

        {/* Pomodoro Tab */}
        {activeTab === "pomodoro" && (
          <div className="w-full flex flex-col items-center">
            <CircularProgress
              value={pomoElapsed}
              max={(pomoMode === "work" ? pomoWork : pomoRest) * 60}
              color={pomoMode === "work" ? "#ef4444" : "#22c55e"}
            >
              <span className="text-4xl font-mono font-bold" style={{ color: pomoMode === "work" ? "#ef4444" : "#22c55e" }}>
                {Math.floor(pomoElapsed / 60)}:{String(pomoElapsed % 60).padStart(2, "0")}
              </span>
            </CircularProgress>
            <div className="flex gap-3 mt-6">
              <button
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  pomoRunning
                    ? "bg-yellow-400 text-white"
                    : "bg-green-500 text-white"
                }`}
                onClick={() => setPomoRunning(!pomoRunning)}
                disabled={swRunning}
              >
                {pomoRunning ? "Pause" : "Start"}
              </button>
              <button
                className="bg-gray-400 text-white px-6 py-2 rounded-full font-semibold"
                onClick={() => { setPomoElapsed(0); setPomoRunning(false); setPomoMode("work"); }}
                disabled={pomoElapsed === 0}
              >
                Reset
              </button>
              <button
                className="bg-pink-500 text-white px-6 py-2 rounded-full font-semibold"
                onClick={handlePomoSubmit}
                disabled={pomoElapsed < 60 || loading || pomoMode !== "work"}
              >
                Log
              </button>
            </div>
            <div className="flex gap-4 mt-4">
              <div>
                <label className="font-semibold text-gray-700">Work: </label>
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={pomoWork}
                  onChange={e => setPomoWork(Number(e.target.value))}
                  className="w-16 border rounded p-1"
                /> min
              </div>
              <div>
                <label className="font-semibold text-gray-700">Rest: </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={pomoRest}
                  onChange={e => setPomoRest(Number(e.target.value))}
                  className="w-16 border rounded p-1"
                /> min
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">Mode: <b>{pomoMode === "work" ? "Study" : "Rest"}</b></div>
          </div>
        )}

        {/* Manual Entry */}
        <div className="w-full flex flex-col items-center mt-8">
          <h2 className="text-xl font-bold mb-2 text-gray-700">Manual Entry</h2>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              placeholder="Minutes"
              value={manual}
              onChange={e => setManual(e.target.value)}
              className="border rounded p-2 w-32"
            />
            <button
              className="bg-indigo-500 text-white px-4 py-2 rounded-full font-semibold"
              onClick={handleManualSubmit}
              disabled={loading}
            >
              Add
            </button>
          </div>
        </div>

        {/* Today's Sessions */}
        <div className="w-full mt-8">
          <h2 className="text-xl font-bold mb-2 text-gray-700">Today's Sessions</h2>
          <div className="bg-gray-100 rounded-lg p-4">
            {todaySessions.length === 0 ? (
              <p className="text-gray-600">No sessions logged yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {todaySessions.map((session, i) => (
                  <span key={i} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                    {session} min
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Graph Modal */}
      {showGraph && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Last 7 Days Study Data</h3>
              <button
                onClick={() => setShowGraph(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <p className="text-gray-600">
                Graph feature coming soon! This will show your study patterns over the last 7 days.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timelog;