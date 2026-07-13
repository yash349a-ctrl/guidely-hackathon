import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLearning } from "../context/LearningContext";
import { 
  Compass, 
  HelpCircle, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Loader2,
  Cpu,
  Brain,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { GuidelyLogo } from "../components/GuidelyLogo";

export const AssessmentPage: React.FC = () => {
  const { 
    assessmentQuestions, 
    currentQuestionIndex, 
    answers, 
    submitAnswer, 
    prevQuestion, 
    nextQuestion, 
    submitAssessment,
    isLoading,
    errorMsg,
    resetAll
  } = useLearning();

  // Dynamic state for loading text phrases
  const [loadingPhase, setLoadingPhase] = useState<number>(0);
  const loadingPhrases = [
    "Understanding your destination...",
    "Identifying the skills that matter...",
    "Preparing your diagnostic assessment...",
    "Calibrating benchmark questions...",
    "Initializing dynamic study GPS..."
  ];

  useEffect(() => {
    if (assessmentQuestions.length === 0) {
      const interval = setInterval(() => {
        setLoadingPhase((prev) => (prev + 1) % loadingPhrases.length);
      }, 2200);
      return () => clearInterval(interval);
    }
  }, [assessmentQuestions]);

  if (assessmentQuestions.length === 0) {
    return (
      <div className="relative min-h-screen bg-bg-app text-text-primary flex flex-col items-center justify-center px-4 transition-colors duration-300 bg-dot-pattern">
        <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[100px] pointer-events-none" />
        
        <div className="w-full max-w-md bg-bg-surface border border-border-primary rounded-2xl p-8 shadow-2xl text-center space-y-6 relative transition-colors duration-300">
          <div className="flex justify-center mb-2">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-20 h-20 rounded-full border border-blue-500/20 animate-ping" />
              <div className="absolute w-14 h-14 rounded-full border border-blue-500/40 animate-pulse" />
              <div className="w-10 h-10 rounded-full bg-blue-50/50 dark:bg-blue-950 border border-blue-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-blue-500 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-display font-bold text-lg text-text-primary">Generating Core Diagnostic</h3>
            <p className="text-xs text-text-muted font-mono uppercase tracking-widest">GUIDELY AI Engine</p>
          </div>

          {/* Animate Loading Phrases with high visual fidelity */}
          <div className="h-10 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingPhase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 font-sans"
              >
                {loadingPhrases[loadingPhase]}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center space-x-2 text-[11px] text-text-muted font-mono">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
            <span>Consulting prerequisite models...</span>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = assessmentQuestions[currentQuestionIndex];
  const selectedAnswerIndex = answers[currentQuestion.id];
  const isLastQuestion = currentQuestionIndex === assessmentQuestions.length - 1;

  const handleSelectOption = (index: number) => {
    submitAnswer(currentQuestion.id, index);
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < assessmentQuestions.length) {
      if (!confirm("You have unanswered questions. Are you sure you want to submit? GUIDELY will evaluate empty items as incorrect.")) {
        return;
      }
    }
    submitAssessment();
  };

  return (
    <div className="relative min-h-screen bg-bg-app text-text-primary flex flex-col items-center justify-center px-4 py-12 transition-colors duration-300 bg-dot-pattern">
      {/* Background decoration */}
      <div className="absolute top-[15%] right-[20%] w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-2xl bg-bg-surface border border-border-primary rounded-2xl p-6 md:p-10 shadow-2xl relative transition-colors duration-300">
        
        {/* Progress header bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div onClick={resetAll} className="flex items-center space-x-2 cursor-pointer hover:opacity-85 transition-opacity">
            <GuidelyLogo size="xs" />
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">FLASH SKILL DIAGNOSTIC</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-mono text-text-secondary">
              Verified Concept Mapping: {currentQuestionIndex + 1} of {assessmentQuestions.length}
            </span>
            <div className="w-24 bg-bg-app h-2 rounded-full overflow-hidden border border-border-primary">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / assessmentQuestions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-sans flex flex-col gap-1">
            <span className="font-bold font-mono text-xs uppercase tracking-wider">CRITICAL SYSTEM ERROR</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Diagnostic Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Tag / Category details */}
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-300 px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider">
                SKILL: {currentQuestion.skill}
              </span>
              <span className="bg-bg-app border border-border-primary text-text-secondary px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider">
                DIFFICULTY: {currentQuestion.difficulty}
              </span>
            </div>

            {/* Question Text */}
            <div className="space-y-3">
              <span className="text-[10px] text-text-muted font-mono flex items-center uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5 text-blue-500 mr-1.5 shrink-0" />
                VERIFYING DEPENDENCY: {currentQuestion.concept}
              </span>
              <h1 className="text-lg md:text-xl font-display font-extrabold text-text-primary leading-relaxed">
                {currentQuestion.question}
              </h1>
            </div>

            {/* Option Cards - supporting keyboard focus and hover styling */}
            <div className="space-y-3 pt-2">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswerIndex === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleSelectOption(index)}
                    className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center justify-between group cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                      isSelected
                        ? "bg-blue-500/5 dark:bg-blue-950/20 border-blue-500 text-text-primary ring-2 ring-blue-500/10"
                        : "bg-bg-app hover:bg-bg-sidebar border-border-primary/80 hover:border-border-primary text-text-secondary"
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <span className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center border transition-all ${
                        isSelected 
                          ? "bg-blue-600 border-blue-500 text-white" 
                          : "bg-bg-sidebar border-border-primary text-text-muted group-hover:border-border-primary"
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="font-sans font-medium leading-relaxed">{option}</span>
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-blue-500" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Action Controls */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-border-primary/60">
          <button
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0 || isLoading}
            className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all ${
              currentQuestionIndex === 0 
                ? "text-text-muted cursor-not-allowed opacity-40" 
                : "text-text-secondary hover:text-text-primary hover:bg-bg-sidebar border border-border-primary"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>PREV</span>
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              id="btn-submit-assessment"
              className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-mono text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <span>SEE MY LEARNING PATH</span>
              <Check className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-2.5 bg-bg-app hover:bg-bg-sidebar border border-border-primary hover:border-border-primary text-text-secondary font-mono text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <span>CONTINUE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
