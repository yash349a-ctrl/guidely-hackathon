import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLearning } from "../context/LearningContext";
import { 
  CheckCircle2, 
  Navigation, 
  AlertCircle, 
  Lock, 
  Play, 
  Layers,
  Compass, 
  User, 
  Mail, 
  Key, 
  ArrowRight,
  Sun,
  Moon,
  Info
} from "lucide-react";
import { GuidelyLogo } from "../components/GuidelyLogo";

export const LandingPage: React.FC = () => {
  const { 
    startOnboarding, 
    initializeDemoMode, 
    signup, 
    login, 
    user, 
    isAuthenticated,
    theme,
    toggleTheme,
    resetAll,
    setStep
  } = useLearning();

  // Auth toggle state
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [isSignUp, setIsSignUp] = useState<boolean>(true);
  
  // Auth Form fields
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email) {
      setFormError("Enter your email address to continue.");
      return;
    }
    if (!password) {
      setFormError("Enter your password to continue.");
      return;
    }
    if (isSignUp && !name) {
      setFormError("Enter your name to continue.");
      return;
    }

    if (isSignUp) {
      signup(name, email);
      setShowAuth(false);
    } else {
      const success = login(email);
      if (success) {
        setShowAuth(false);
      } else {
        setFormError("Account not found. Please create a new account.");
      }
    }
  };

  const handleQuickDemo = () => {
    initializeDemoMode();
  };

  return (
    <div className="relative min-h-screen bg-bg-app text-text-primary overflow-x-hidden flex flex-col items-center justify-between px-4 md:px-8 py-8 transition-colors duration-300">
      
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

        <div className="flex items-center space-x-3">
          {/* My Routes Button */}
          <button
            onClick={() => setStep("my-routes")}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-all cursor-pointer"
            title="View saved learning routes"
          >
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
            <span>MY ROUTES</span>
          </button>

          {/* Light/Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-bg-surface border border-border-primary text-text-secondary hover:text-text-primary transition-all cursor-pointer"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {!isAuthenticated ? (
            <button
              onClick={() => {
                setIsSignUp(false);
                setShowAuth(true);
              }}
              className="text-xs font-medium text-text-secondary hover:text-text-primary bg-bg-surface border border-border-primary px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              Sign In
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-text-secondary">Hello, <strong>{user?.name}</strong></span>
            </div>
          )}

          <button
            onClick={handleQuickDemo}
            className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline px-3 py-1.5 transition-all cursor-pointer"
          >
            Instant Demo →
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 my-auto py-12 relative z-10">
        
        {/* Left Hand: Tagline, Hero Description & Action Panel */}
        <div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 rounded-full text-xs text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>PERSONALIZED LEARNING NAVIGATION</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-none mb-4 text-text-primary"
          >
            GUIDELY
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-lg sm:text-xl md:text-2xl text-blue-600 dark:text-blue-400 font-medium tracking-tight mb-6 flex items-center justify-center lg:justify-start space-x-2"
          >
            <Compass className="w-5 h-5 text-indigo-500 inline-block" />
            <span>"The Google Maps for Learning"</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-xl text-base text-text-secondary leading-relaxed mb-8 font-sans"
          >
            Stop searching for what to learn. GUIDELY understands where you want to go, assesses what you know, maps your prerequisite knowledge gaps, and continuously guides you through the optimal step-by-step route to mastery.
          </motion.p>

          {/* Interactive CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full max-w-md flex flex-col gap-4"
          >
            {!isAuthenticated && !showAuth ? (
              <>
                <div className="w-full flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={() => {
                      setIsSignUp(true);
                      setShowAuth(true);
                    }}
                    className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-base shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 border border-blue-400/20 transform hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    <User className="w-5 h-5" />
                    <span>Create Free Account</span>
                  </button>
                  <button
                    onClick={handleQuickDemo}
                    className="w-full sm:w-auto px-6 py-4 bg-bg-surface hover:bg-bg-sidebar border border-border-primary text-text-secondary hover:text-text-primary font-medium rounded-xl text-base transition-all cursor-pointer"
                  >
                    Launch Demo OS
                  </button>
                </div>
                
                <button
                  onClick={() => setStep("my-routes")}
                  className="w-full py-3.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold rounded-xl text-sm border border-blue-500/20 transition-all flex items-center justify-center space-x-2"
                >
                  <Compass className="w-4 h-4 animate-spin-slow" />
                  <span>Resume My Saved Routes</span>
                </button>
              </>
            ) : isAuthenticated && !showAuth ? (
              <div className="w-full bg-bg-surface border border-border-primary p-5 rounded-2xl shadow-xl flex flex-col items-center sm:items-start gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-extrabold font-display">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">Welcome, {user?.name}!</h3>
                    <p className="text-[11px] text-text-muted">Your learning navigation account is synced.</p>
                  </div>
                </div>
                
                <div className="w-full flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={startOnboarding}
                    className="flex-1 flex items-center justify-center space-x-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-md transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Configure My Route</span>
                  </button>
                  <button
                    onClick={handleQuickDemo}
                    className="flex-1 px-5 py-3.5 bg-bg-sidebar hover:bg-border-primary/50 text-text-secondary hover:text-text-primary font-medium rounded-xl text-sm border border-border-primary transition-all cursor-pointer"
                  >
                    Load Instant Demo
                  </button>
                </div>

                <button
                  onClick={() => setStep("my-routes")}
                  className="w-full py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold rounded-xl text-xs border border-blue-500/20 transition-all flex items-center justify-center space-x-1.5"
                >
                  <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                  <span>Resume Saved Routes</span>
                </button>
              </div>
            ) : null}
          </motion.div>
        </div>

        {/* Right Hand Pane: Smooth transitions of either high-fidelity auth card or interactive UI mock-showcase */}
        <div className="w-full lg:w-[45%] max-w-md shrink-0 relative z-10">
          <AnimatePresence mode="wait">
            {showAuth ? (
              <motion.div
                key="auth-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-bg-surface border border-border-primary/80 rounded-2xl p-6 md:p-8 shadow-2xl relative w-full"
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowAuth(false)}
                  className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="flex flex-col items-center text-center mb-6">
                  <GuidelyLogo size="md" />
                  <h2 className="text-xl font-display font-extrabold text-text-primary mt-3">
                    {isSignUp ? "Create your account" : "Welcome back"}
                  </h2>
                  <p className="text-xs text-text-secondary mt-1 max-w-xs">
                    {isSignUp 
                      ? "Start your personal navigation journey to conceptual mastery." 
                      : "Access your personalized learning routes and active status."}
                  </p>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-secondary block">Display Name</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-muted">
                          <User className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Aditya"
                          className="w-full pl-10 pr-4 py-2.5 bg-bg-app border border-border-primary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-text-primary"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary block">Email Address</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-muted">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="aditya@guidely.io"
                        className="w-full pl-10 pr-4 py-2.5 bg-bg-app border border-border-primary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-text-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary block">Secure Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-muted">
                        <Key className="w-4 h-4" />
                      </span>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-bg-app border border-border-primary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-text-primary"
                      />
                    </div>
                  </div>

                  {formError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
                  >
                    <span>{isSignUp ? "Sign Up & Start Journey" : "Sign In to GPS"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="mt-6 text-center text-xs text-text-secondary pt-4 border-t border-border-primary/50">
                  {isSignUp ? (
                    <span>
                      Already have an account?{" "}
                      <button
                        onClick={() => {
                          setIsSignUp(false);
                          setFormError(null);
                        }}
                        className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                      >
                        Login
                      </button>
                    </span>
                  ) : (
                    <span>
                      Don't have an account?{" "}
                      <button
                        onClick={() => {
                          setIsSignUp(true);
                          setFormError(null);
                        }}
                        className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                      >
                        Create account
                      </button>
                    </span>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="mockup-panel"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full bg-bg-surface border border-border-primary/80 rounded-2xl p-6 md:p-8 shadow-2xl relative"
              >
                <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
                <div className="flex items-center justify-between border-b border-border-primary/60 pb-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                    <span className="text-[10px] text-text-muted font-mono pl-1">GUIDELY_GPS v1.0.0</span>
                  </div>
                  <div className="bg-bg-app px-2.5 py-1 rounded-md text-[10px] font-mono text-text-secondary border border-border-primary flex items-center space-x-1.5">
                    <Navigation className="w-3 h-3 text-emerald-500 animate-pulse" />
                    <span>ACTIVE ROUTE</span>
                  </div>
                </div>

                <div className="space-y-6 text-left">
                  {/* Mock Study GPS */}
                  <div>
                    <h3 className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-3 flex items-center">
                      <Navigation className="w-3 h-3 text-blue-500 mr-1.5" />
                      Study GPS Tracker
                    </h3>
                    <div className="space-y-4 pl-1">
                      <div className="flex items-start space-x-3">
                        <div className="flex flex-col items-center mt-1">
                          <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-500 flex items-center justify-center">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                          </div>
                          <div className="w-[1px] h-6 bg-emerald-500/30" />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-text-primary">Python Fundamentals</h4>
                          <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono uppercase">Mastered (100%)</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="flex flex-col items-center mt-1">
                          <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950/50 border border-blue-400 flex items-center justify-center animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          </div>
                          <div className="w-[1px] h-6 bg-border-primary" />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-text-primary">Matrix Math & Linear Algebra</h4>
                          <p className="text-[9px] text-blue-500 font-mono uppercase">Current GPS Step</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="flex flex-col items-center mt-1">
                          <div className="w-4 h-4 rounded-full bg-bg-app border border-border-primary flex items-center justify-center">
                            <Lock className="w-2 h-2 text-text-muted" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-text-muted">Machine Learning Modeling</h4>
                          <p className="text-[9px] text-text-muted font-mono uppercase">Blocked by math requirements</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border-primary/60">
                    <span className="text-[9px] font-mono text-text-muted block uppercase tracking-wider">GPS Reroute Engine</span>
                    <div className="p-3 bg-bg-app rounded-lg border border-border-primary flex items-start gap-2.5 mt-2">
                      <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-text-secondary leading-snug">
                        "Your diagnostic score flagged gap in Matrix Operations. GUIDELY has automatically recalculated your route to bridge this prerequisite before machine learning."
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto pt-8 border-t border-border-primary/60 text-center text-xs text-text-muted font-mono relative z-20 flex flex-col md:flex-row items-center justify-between gap-4">
        <span>© 2026 GUIDELY. All Rights Reserved.</span>
        <div className="flex items-center space-x-4">
          <span>The Google Maps for Learning</span>
          <span className="text-border-primary">|</span>
          <span>Powered by Gemini 1.5 & Neo4j DB Graph</span>
        </div>
      </footer>
    </div>
  );
};
