import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLearning } from "../context/LearningContext";
import { 
  ArrowLeft, 
  Compass, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  Layers,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { GuidelyLogo } from "../components/GuidelyLogo";

interface RouteSummary {
  learnerId: string;
  totalConcepts?: number;
  masteredConcepts?: number;
  progressPercentage?: number;
  routeStatus?: string;
  currentStepId?: string;
  currentStepLabel?: string;
  isRealNeo4j?: boolean;
  error?: string;
}

interface SavedRouteLocal {
  routeId: string;
  learnerId: string;
  goal: string;
  createdAt: string;
  lastActivityAt: string;
}

export const MyRoutesPage: React.FC = () => {
  const { setStep, restoreRoute, theme, toggleTheme, user, isAuthenticated, resetAll } = useLearning();
  const [localRoutes, setLocalRoutes] = useState<SavedRouteLocal[]>([]);
  const [summaries, setSummaries] = useState<Record<string, RouteSummary>>({});
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const fetchLocalRoutes = () => {
      const routesJson = localStorage.getItem("guidely_routes");
      if (routesJson) {
        try {
          const parsed = JSON.parse(routesJson) as SavedRouteLocal[];
          // Sort by last activity descending, limit to 10
          const sorted = [...parsed]
            .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())
            .slice(0, 10);
          setLocalRoutes(sorted);
          return sorted;
        } catch (e) {
          console.error("Failed to parse local routes:", e);
        }
      }
      return [];
    };

    const routes = fetchLocalRoutes();
    if (routes.length > 0) {
      fetchSummariesFromBackend(routes.map(r => r.learnerId));
    }
  }, []);

  const fetchSummariesFromBackend = async (learnerIds: string[]) => {
    if (learnerIds.length === 0) return;
    setIsLoadingSummaries(true);
    try {
      const response = await fetch("/api/routes/summaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learnerIds })
      });
      if (response.ok) {
        const data = await response.json();
        const summariesMap: Record<string, RouteSummary> = {};
        if (data.summaries && Array.isArray(data.summaries)) {
          data.summaries.forEach((sum: RouteSummary) => {
            summariesMap[sum.learnerId] = sum;
          });
        }
        setSummaries(summariesMap);
      }
    } catch (e) {
      console.error("Failed to fetch route summaries:", e);
    } finally {
      setIsLoadingSummaries(false);
    }
  };

  const handleContinueRoute = async (lId: string) => {
    try {
      await restoreRoute(lId);
    } catch (err) {
      alert("Failed to load learning route. The server database may be unavailable.");
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return "Unknown date";
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return "Unknown date";
    }
  };

  return (
    <div id="my_routes_page_root" className="relative min-h-screen bg-bg-app text-text-primary overflow-x-hidden flex flex-col items-center justify-between px-4 md:px-8 py-8 transition-colors duration-300">
      
      {/* Background glowing gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 dark:bg-purple-500/5 blur-[150px] pointer-events-none" />

      {/* Grid Pattern Layer */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 dark:opacity-100 pointer-events-none" />

      {/* Header Bar */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between py-4 border-b border-border-primary/60 relative z-20">
        <div onClick={resetAll} className="flex items-center space-x-2 cursor-pointer hover:opacity-85 transition-opacity">
          <GuidelyLogo size="sm" />
          <span className="font-display font-bold text-lg tracking-tight text-text-primary">
            GUIDELY
          </span>
          <span className="hidden sm:inline-block text-[9px] bg-blue-100 dark:bg-slate-900 border border-blue-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-mono font-bold tracking-wide">
            LEARNING GPS
          </span>
        </div>

        <button 
          onClick={() => setStep("landing")}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary border border-border-primary rounded-lg bg-bg-panel hover:bg-hover-bg transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landing</span>
        </button>
      </header>

      {/* Main Body */}
      <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col py-10 relative z-10">
        
        {/* Title Block */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
              My Learning Routes
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Continue where you left off.
            </p>
          </div>
        </div>

        {/* Routes Content */}
        <AnimatePresence mode="wait">
          {localRoutes.length === 0 ? (
            <motion.div 
              id="empty_routes_state"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-bg-panel border border-border-primary rounded-xl p-8 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-12"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>
              <h2 className="text-lg font-bold">No saved routes yet</h2>
              <p className="text-xs text-text-secondary max-w-sm mt-2 mb-6">
                Design your custom roadmap by specifying a career goal and mapping your verified skills using our dynamic diagnostic evaluation engine.
              </p>
              <button
                onClick={() => setStep("onboarding")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-2 shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 transition-all"
              >
                <span>Create Learning Route</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              id="routes_grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-4 sm:grid-cols-1 md:grid-cols-2"
            >
              {localRoutes.map((route, idx) => {
                const sum = summaries[route.learnerId];
                const percentage = sum?.progressPercentage !== undefined ? sum.progressPercentage : 0;
                const masteredCount = sum?.masteredConcepts || 0;
                const totalCount = sum?.totalConcepts || 0;
                const activeStep = sum?.currentStepLabel || "Calculating...";

                return (
                  <motion.div
                    key={route.learnerId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative group bg-bg-panel hover:bg-hover-bg border border-border-primary rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {/* Top block */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        {/* Title & badge */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm tracking-tight text-text-primary group-hover:text-blue-500 truncate transition-colors duration-150">
                            {route.goal}
                          </h3>
                        </div>

                        {/* Status tag */}
                        {sum && (
                          <span className={`text-[9px] font-mono font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                            percentage === 100 
                              ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
                              : percentage > 0
                              ? "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900"
                              : "bg-slate-100 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 border border-border-primary"
                          }`}>
                            {percentage === 100 ? "Completed" : "In Progress"}
                          </span>
                        )}
                      </div>

                      {/* Info lines */}
                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-text-muted mt-2">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Saved: {formatDate(route.createdAt)}</span>
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border-primary" />
                        <span className="flex items-center space-x-1">
                          <RefreshCw className="w-3 h-3" />
                          <span>Active: {formatDate(route.lastActivityAt)}</span>
                        </span>
                      </div>

                      {/* Next/Active Node Step Indicator */}
                      <div className="mt-4 p-2.5 rounded-lg bg-bg-app border border-border-primary text-[11px] flex items-center space-x-2">
                        <Compass className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-[9px] uppercase tracking-wider font-bold text-text-muted">CURRENT STEP</div>
                          <div className="font-semibold text-text-primary truncate">{activeStep}</div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom block: Progress & CTA Actions */}
                    <div className="mt-5 border-t border-border-primary pt-4">
                      {/* Progress numbers */}
                      <div className="flex justify-between items-center text-[11px] mb-1.5">
                        <span className="text-text-secondary font-medium">Concept Mastery</span>
                        <span className="font-mono font-bold text-text-primary">
                          {percentage}% {totalCount > 0 ? `(${masteredCount}/${totalCount})` : ""}
                        </span>
                      </div>

                      {/* Real Progress Bar */}
                      <div className="w-full h-1.5 bg-border-primary rounded-full overflow-hidden mb-4">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2">
                        {/* Continue CTA */}
                        <button
                          onClick={() => handleContinueRoute(route.learnerId)}
                          className="flex-1 max-w-[160px] px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg flex items-center justify-center space-x-1 shadow-md hover:shadow-lg hover:shadow-blue-500/10 transition-all"
                        >
                          <span>Resume Route</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer copyright */}
      <footer className="w-full max-w-7xl mx-auto border-t border-border-primary/40 pt-4 mt-8 flex items-center justify-between text-[10px] text-text-muted relative z-20">
        <p>© 2026 GUIDELY Inc. Personalized Neo4j & Gemini learning maps.</p>
        <div className="flex items-center space-x-4">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
        </div>
      </footer>
    </div>
  );
};
