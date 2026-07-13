import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLearning } from "../context/LearningContext";
import { 
  ArrowRight, 
  ArrowLeft, 
  Target, 
  Award, 
  Clock, 
  Heart, 
  Plus, 
  X, 
  Compass,
  Sparkles,
  Search,
  BookOpen
} from "lucide-react";
import { GuidelyLogo } from "../components/GuidelyLogo";

export const OnboardingPage: React.FC = () => {
  const { submitOnboarding, isLoading, errorMsg, user, resetAll } = useLearning();
  
  const [step, setStep] = useState<number>(1);
  
  // State for onboarding form
  const [goal, setGoal] = useState<string>("");
  const [customGoal, setCustomGoal] = useState<string>("");
  const [isCustomGoal, setIsCustomGoal] = useState<boolean>(false);
  
  const [skillInput, setSkillInput] = useState<string>("");
  const [claimedSkills, setClaimedSkills] = useState<string[]>(["Python"]);
  
  const [dailyTime, setDailyTime] = useState<number>(60); // minutes
  const [learningStyle, setLearningStyle] = useState<"visual" | "reading" | "hands-on" | "mixed">("mixed");

  const GOAL_PRESETS = [
    { id: "ai", label: "Become an AI Engineer", desc: "Master neural networks, regression, and transformer systems." },
    { id: "ds", label: "Become a Data Scientist", desc: "Master stats, cleaning, SQL, and analytical machine modeling." },
    { id: "dsa", label: "Crack DSA Interviews", desc: "Master algorithmic Big-O complexity, graphs, and recursive puzzles." },
    { id: "fs", label: "Become a Full Stack Developer", desc: "Master declarative React views, Node endpoints, and SQL ledgers." },
    { id: "cyber", label: "Learn Cybersecurity", desc: "Master networking layers, penetrations, and security protocols." }
  ];

  const SKILL_SUGGESTIONS = [
    "Python", "NumPy", "Pandas", "DSA", "React", "SQL", "Machine Learning", 
    "HTML/CSS", "JavaScript", "Algorithms", "Linear Algebra", "Node.js"
  ];

  const handleAddSkill = (skillName: string) => {
    const trimmed = skillName.trim();
    if (trimmed && !claimedSkills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setClaimedSkills([...claimedSkills, trimmed]);
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (indexToRemove: number) => {
    setClaimedSkills(claimedSkills.filter((_, i) => i !== indexToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill(skillInput);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      const selectedGoal = isCustomGoal ? customGoal : goal;
      if (!selectedGoal.trim()) {
        alert("Please specify your learning destination goal to plot the route.");
        return;
      }
    }
    if (step === 2) {
      if (claimedSkills.length === 0) {
        alert("Please add at least one existing skill to help align the diagnostic assessment.");
        return;
      }
    }
    
    if (step < 4) {
      setStep(step + 1);
    } else {
      const finalGoal = isCustomGoal ? customGoal : goal;
      submitOnboarding(finalGoal, claimedSkills, dailyTime, learningStyle);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSelectGoal = (label: string) => {
    setIsCustomGoal(false);
    setGoal(label);
  };

  return (
    <div className="relative min-h-screen bg-bg-app text-text-primary flex flex-col items-center justify-center px-4 py-12 transition-colors duration-300 bg-dot-pattern">
      {/* Background glowing gradients */}
      <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] rounded-full bg-blue-600/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Header bar */}
      <div onClick={resetAll} className="absolute top-6 left-6 flex items-center space-x-2 cursor-pointer hover:opacity-85 transition-opacity">
        <GuidelyLogo size="sm" />
        <span className="font-display font-extrabold text-sm tracking-tight text-text-primary">
          GUIDELY
        </span>
      </div>

      <div className="w-full max-w-xl bg-bg-surface border border-border-primary rounded-2xl p-6 md:p-10 shadow-2xl relative transition-colors duration-300">
        
        {/* Modern progressive bar loader */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-bg-sidebar rounded-t-2xl overflow-hidden">
          {isLoading ? (
            <div className="relative w-full h-full bg-indigo-950/20 overflow-hidden">
              <motion.div 
                className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                style={{ x: "-100%" }}
                animate={{
                  x: ["-100%", "300%"]
                }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: [0.4, 0, 0.2, 1]
                }}
              />
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-blue-500/5"
                animate={{
                  opacity: [0.4, 0.8, 0.4]
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          ) : (
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          )}
        </div>

        {/* Steps indicator */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-blue-500 animate-spin-slow" />
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">PLOT GPS PATHWAYS</span>
          </div>
          <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold bg-blue-100 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 px-2.5 py-0.5 rounded-full">
            STEP {step} of 4
          </span>
        </div>

        {user && step === 1 && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-xs text-text-secondary"
          >
            Welcome, <strong>{user.name}</strong>. Let's calibrate your learning route:
          </motion.div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-sans flex flex-col gap-1">
            <span className="font-bold font-mono text-xs uppercase tracking-wider">CRITICAL SYSTEM ERROR</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main interactive form card container */}
        <div className="min-h-[280px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-extrabold text-text-primary flex items-center space-x-2">
                    <Target className="w-6 h-6 text-blue-500 shrink-0" />
                    <span>What destination are you learning toward?</span>
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">
                    Select a curated career-track template or outline a custom target below.
                  </p>
                </div>

                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {GOAL_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectGoal(preset.label)}
                      className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex flex-col justify-center cursor-pointer ${
                        !isCustomGoal && goal === preset.label
                          ? "bg-blue-500/5 dark:bg-blue-950/30 border-blue-500 text-text-primary font-semibold shadow-md shadow-blue-500/5"
                          : "bg-bg-app hover:bg-bg-sidebar border-border-primary/80 hover:border-border-primary text-text-secondary"
                      }`}
                    >
                      <span className="font-semibold block">{preset.label}</span>
                      <span className="text-[11px] text-text-muted mt-0.5">{preset.desc}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-border-primary/60">
                  <button
                    onClick={() => {
                      setIsCustomGoal(true);
                      setGoal("");
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-sm cursor-pointer transition-all ${
                      isCustomGoal
                        ? "bg-blue-500/5 dark:bg-blue-950/30 border-blue-500 text-text-primary"
                        : "bg-bg-app border-border-primary/80 text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    <span className="font-semibold flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Enter a custom destination
                    </span>
                  </button>

                  {isCustomGoal && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3"
                    >
                      <input
                        type="text"
                        value={customGoal}
                        onChange={(e) => setCustomGoal(e.target.value)}
                        placeholder="e.g. Quantum Engineer, Data Scientist, Robotics Researcher"
                        className="w-full bg-bg-app border border-border-primary focus:border-blue-500 focus:outline-none rounded-xl p-3.5 text-sm text-text-primary placeholder-text-muted font-sans"
                        autoFocus
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-extrabold text-text-primary flex items-center space-x-2">
                    <Award className="w-6 h-6 text-indigo-500 shrink-0" />
                    <span>What do you already know?</span>
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">
                    Enter your existing skills. This builds your diagnostic assessment (minimum 1 required).
                  </p>
                </div>

                {/* Tag Input */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type a skill (e.g. Python) and press Enter..."
                      className="flex-1 bg-bg-app border border-border-primary focus:border-blue-500 focus:outline-none rounded-xl p-3 text-sm text-text-primary placeholder-text-muted"
                    />
                    <button
                      onClick={() => handleAddSkill(skillInput)}
                      className="px-4 bg-bg-sidebar border border-border-primary hover:bg-border-primary/50 text-text-secondary rounded-xl text-sm cursor-pointer transition-all"
                    >
                      Add
                    </button>
                  </div>

                  {/* Active tags display */}
                  <div className="flex flex-wrap gap-2 p-3 bg-bg-app border border-border-primary rounded-xl min-h-[50px] max-h-[120px] overflow-y-auto">
                    {claimedSkills.length === 0 ? (
                      <span className="text-xs text-text-muted italic">No skills added yet.</span>
                    ) : (
                      claimedSkills.map((skill, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center space-x-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-300 px-2.5 py-1 rounded-lg text-xs font-mono"
                        >
                          <span>{skill}</span>
                          <button 
                            onClick={() => handleRemoveSkill(index)}
                            className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 focus:outline-none"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Suggestions list */}
                <div className="pt-2">
                  <span className="text-[10px] text-text-muted block mb-2 font-mono uppercase tracking-widest">POPULAR SUGGESTIONS:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {SKILL_SUGGESTIONS.map((skill, i) => {
                      const exists = claimedSkills.some(s => s.toLowerCase() === skill.toLowerCase());
                      return (
                        <button
                          key={i}
                          onClick={() => !exists && handleAddSkill(skill)}
                          disabled={exists}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            exists 
                              ? "bg-bg-sidebar border-border-primary text-text-muted cursor-not-allowed opacity-50" 
                              : "bg-bg-app border-border-primary/80 hover:border-border-primary text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          + {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-extrabold text-text-primary flex items-center space-x-2">
                    <Clock className="w-6 h-6 text-emerald-500 shrink-0" />
                    <span>How much time can you learn each day?</span>
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">
                    Determine your daily learning time commitment. GUIDELY uses this to calculate dates.
                  </p>
                </div>

                {/* Commit time */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  {[
                    { val: 30, label: "30 min", text: "Micro learning session" },
                    { val: 60, label: "1 hour", text: "Standard session" },
                    { val: 120, label: "2 hours", text: "Intense deep dive" },
                    { val: 180, label: "3+ hours", text: "Sprint pathway push" }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setDailyTime(item.val)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                        dailyTime === item.val
                          ? "bg-blue-500/5 dark:bg-blue-950/30 border-blue-500 text-text-primary shadow-md"
                          : "bg-bg-app border-border-primary/80 text-text-secondary hover:border-border-primary"
                      }`}
                    >
                      <span className="text-sm font-bold block">{item.label}</span>
                      <span className="text-[11px] text-text-muted block mt-1 leading-snug">{item.text}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-extrabold text-text-primary flex items-center space-x-2">
                    <Heart className="w-6 h-6 text-rose-500 shrink-0" />
                    <span>How do you learn best?</span>
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">
                    Select your preferred learning style. We'll suggest matching resources.
                  </p>
                </div>

                {/* Style preferences */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  {[
                    { val: "visual", label: "Visual Learner", desc: "Interactive videos, charts & node maps" },
                    { val: "reading", label: "Reading & Research", desc: "Official documentation & scientific articles" },
                    { val: "hands-on", label: "Hands-on Practice", desc: "Code challenges & real builds" },
                    { val: "mixed", label: "Mixed / Balanced", desc: "A robust, organic learning curriculum" }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setLearningStyle(item.val as any)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                        learningStyle === item.val
                          ? "bg-blue-500/5 dark:bg-blue-950/30 border-blue-500 text-text-primary shadow-md"
                          : "bg-bg-app border-border-primary/80 text-text-secondary hover:border-border-primary"
                      }`}
                    >
                      <span className="text-sm font-bold block">{item.label}</span>
                      <span className="text-[11px] text-text-muted block mt-1 leading-snug">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Controls */}
        <div className="flex justify-between items-center mt-10 pt-6 border-t border-border-primary/60">
          <button
            onClick={handlePrev}
            disabled={step === 1 || isLoading}
            className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all ${
              step === 1 
                ? "text-text-muted cursor-not-allowed opacity-40" 
                : "text-text-secondary hover:text-text-primary hover:bg-bg-sidebar border border-border-primary"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK</span>
          </button>

          <button
            onClick={handleNext}
            disabled={isLoading}
            id="btn-next-step"
            className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs rounded-xl shadow-lg shadow-blue-600/10 cursor-pointer hover:shadow-blue-600/20 transition-all font-bold"
          >
            {isLoading ? (
              <span>PLOTTING COURSE...</span>
            ) : step === 4 ? (
              <>
                <span>CALIBRATE ROUTE</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>CONTINUE</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
