import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLearning } from "../context/LearningContext";
import { 
  AlertCircle, 
  RefreshCw, 
  Compass, 
  MapPin, 
  Check, 
  ChevronRight,
  Map
} from "lucide-react";
import { GuidelyLogo } from "../components/GuidelyLogo";

const WAITING_MESSAGES = [
  "Understanding your destination...",
  "Checking what you already know...",
  "Finding important prerequisite concepts...",
  "Tracing concept dependencies...",
  "Spotting knowledge gaps...",
  "Comparing possible learning routes...",
  "Building your Study GPS...",
  "Connecting your knowledge map...",
  "Almost there — your route is taking shape..."
];

export const ProcessingPage: React.FC = () => {
  const { 
    isLoading, 
    errorMsg, 
    knowledgeGraph, 
    submitAssessment, 
    startOnboarding,
    finishProcessing,
    resetAll
  } = useLearning();

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [successFired, setSuccessFired] = useState<boolean>(false);

  // Core timer for message cycling and long-wait reassurance
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isLoading && !errorMsg) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!isLoading) {
      setElapsedSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading, errorMsg]);

  // Trigger success state when loading finishes and knowledgeGraph is built successfully
  useEffect(() => {
    if (!isLoading && knowledgeGraph !== null && !errorMsg && !successFired) {
      setSuccessFired(true);
    }
  }, [isLoading, knowledgeGraph, errorMsg, successFired]);

  // Handle automatic navigation upon successful generation after a brief delay
  useEffect(() => {
    if (successFired) {
      const delayTimer = setTimeout(() => {
        finishProcessing();
      }, 1200); // Display success state for 1200ms before auto-routing
      return () => clearTimeout(delayTimer);
    }
  }, [successFired, finishProcessing]);

  // Determine active dynamic message
  const activeMessageIndex = Math.floor(elapsedSeconds / 3) % WAITING_MESSAGES.length;
  const currentWaitingMessage = WAITING_MESSAGES[activeMessageIndex];

  // Long-wait reassurance messages
  let reassuranceText = "";
  if (elapsedSeconds >= 30) {
    reassuranceText = "Still mapping — we're connecting your assessment to the best concept route.";
  } else if (elapsedSeconds >= 15) {
    reassuranceText = "Personalized routes take a little longer because we're building yours from scratch.";
  }

  // Handle manual retry trigger
  const handleRetry = () => {
    setSuccessFired(false);
    submitAssessment();
  };

  return (
    <div className="relative min-h-screen bg-bg-app text-text-primary flex flex-col items-center justify-between px-4 py-6 md:py-10 transition-colors duration-300 bg-dot-pattern font-sans">
      {/* Background glowing gradients */}
      <div className="absolute top-[20%] left-[20%] w-[450px] h-[450px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[450px] h-[450px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Header with Small Accurate Guidely Logo - Clickable to Home */}
      <header 
        onClick={resetAll} 
        className="w-full flex items-center justify-center py-2 relative z-20 cursor-pointer hover:opacity-85 transition-opacity"
      >
        <GuidelyLogo size="sm" showText={true} />
      </header>

      <div className="w-full max-w-lg bg-bg-surface border border-border-primary/80 rounded-2xl p-6 md:p-8 shadow-2xl relative transition-all duration-300 my-auto">
        {/* Glow effect at the top border */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

        <AnimatePresence mode="wait">
          {/* 1. ERROR STATE */}
          {errorMsg && !isLoading ? (
            <motion.div
              key="error-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center space-y-6 py-4"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <AlertCircle className="w-6 h-6 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold tracking-tight text-text-primary">
                  We couldn't finish mapping your route
                </h2>
                <p className="text-xs text-text-muted">
                  Your progress is safe. Try building the route again.
                </p>
              </div>

              {/* Graceful Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  onClick={handleRetry}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm shadow-md transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try again</span>
                </button>
                <button
                  onClick={startOnboarding}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-bg-surface hover:bg-bg-sidebar border border-border-primary text-text-secondary hover:text-text-primary font-medium rounded-xl text-sm transition-all cursor-pointer"
                >
                  <span>Change destination</span>
                </button>
              </div>
            </motion.div>
          ) :

          /* 2. SUCCESS STATE (BRIEF DISCOVERY FADE-IN) */
          successFired ? (
            <motion.div
              key="success-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center space-y-6 py-4"
            >
              {/* Target Arrival Ripple Effect */}
              <div className="flex justify-center">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-20 h-20 rounded-full border border-emerald-500/30 animate-ping" />
                  <div className="absolute w-14 h-14 rounded-full border border-emerald-500/40 animate-pulse" />
                  <div className="w-11 h-11 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500 flex items-center justify-center text-emerald-500 shadow-lg">
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold tracking-tight text-text-primary">
                  Your route is ready
                </h2>
                <p className="text-sm text-text-secondary">
                  Destination set. Current position mapped.
                </p>
              </div>

              {/* Automatic Loader indicator */}
              <div className="flex items-center justify-center space-x-2 text-xs text-text-muted font-mono pt-4">
                <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                <span>Entering workspace...</span>
              </div>
            </motion.div>
          ) :

          /* 3. ACTIVE PROCESSING AND INTERACTIVE WAITING */
          (
            <motion.div
              key="processing-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Title Section */}
              <div className="text-center space-y-2">
                <h1 className="text-xl font-extrabold tracking-tight text-text-primary">
                  Mapping your learning route
                </h1>
                <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                  We're finding the best path from what you know to where you want to go.
                </p>
              </div>

              {/* Custom SVG Curved Indeterminate Learning Route */}
              <div className="flex justify-center py-2 select-none pointer-events-none">
                <svg
                  width="180"
                  height="220"
                  viewBox="0 0 180 220"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="overflow-visible"
                >
                  <defs>
                    <linearGradient id="routeGrad" x1="90" y1="200" x2="90" y2="20" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="50%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>

                  {/* Base mapped gray road (Dashed Coordinate Grid) */}
                  <path
                    d="M 90 200 C 20 150, 160 90, 90 20"
                    stroke="var(--border-primary)"
                    strokeWidth="3.5"
                    strokeDasharray="6,5"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Overlaid blue scanner path that continuously sweeps */}
                  <motion.path
                    d="M 90 200 C 20 150, 160 90, 90 20"
                    stroke="url(#routeGrad)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0, pathOffset: 0 }}
                    animate={{ 
                      pathLength: [0.15, 0.5, 0.15],
                      pathOffset: [0, 0.5, 1]
                    }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />

                  {/* Concept Node 1 (Start Point) - YOU ARE HERE */}
                  <g transform="translate(90, 200)">
                    <circle r="7" fill="#3b82f6" />
                    <motion.circle 
                      r="12" 
                      stroke="#3b82f6" 
                      strokeWidth="1.5" 
                      fill="none" 
                      animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                    />
                  </g>

                  {/* Concept Node 2 (Intermediate Skill Gap node) */}
                  <g transform="translate(56, 142)">
                    <motion.circle 
                      r="5" 
                      fill="#818cf8" 
                      animate={{ scale: [0.9, 1.2, 0.9] }} 
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} 
                    />
                  </g>

                  {/* Concept Node 3 (Intermediate Verified concept) */}
                  <g transform="translate(124, 78)">
                    <motion.circle 
                      r="5" 
                      fill="#6366f1" 
                      animate={{ scale: [0.9, 1.2, 0.9] }} 
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }} 
                    />
                  </g>

                  {/* Concept Node 4 (End Destination pin) */}
                  <g transform="translate(90, 20)">
                    <motion.g
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <MapPin className="w-6 h-6 text-emerald-500 -translate-x-3 -translate-y-6 stroke-[2.5]" />
                    </motion.g>
                    <circle r="4" fill="#10b981" className="opacity-40" />
                  </g>

                  {/* Vertical coordinate lines / node label hints */}
                  <text x="90" y="217" textAnchor="middle" className="fill-text-muted text-[9px] font-mono font-bold tracking-wider">YOU ARE HERE</text>
                  <text x="90" y="8" textAnchor="middle" className="fill-emerald-500 dark:fill-emerald-400 text-[9px] font-mono font-bold tracking-wider">📍 DESTINATION</text>
                </svg>
              </div>

              {/* Dynamic waiting status loop with smooth slide transitions */}
              <div className="space-y-4 pt-2">
                <div className="h-10 flex items-center justify-center text-center">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentWaitingMessage}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.4 }}
                      className="text-sm font-semibold text-blue-600 dark:text-blue-400"
                    >
                      {currentWaitingMessage}
                    </motion.p>
                  </AnimatePresence>
                </div>

                {/* Long-Wait Reassurance */}
                <div className="h-12 flex items-center justify-center text-center">
                  <AnimatePresence>
                    {reassuranceText && (
                      <motion.p
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-text-muted leading-relaxed max-w-sm px-4"
                      >
                        {reassuranceText}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Subdued system scanner heartbeat */}
                <div className="flex items-center justify-center space-x-2 text-[10px] text-text-muted font-mono tracking-widest uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span>Syncing Prerequisite Nodes...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="h-4 sm:h-8 md:h-12 w-full pointer-events-none" /> {/* Bottom balance element */}
    </div>
  );
};
