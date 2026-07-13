/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { LearningProvider, useLearning } from "./context/LearningContext";
import { LandingPage } from "./pages/LandingPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { AssessmentPage } from "./pages/AssessmentPage";
import { ProcessingPage } from "./pages/ProcessingPage";
import { WorkspacePage } from "./pages/WorkspacePage";
import { MyRoutesPage } from "./pages/MyRoutesPage";

function AppContent() {
  const { step } = useLearning();

  switch (step) {
    case "landing":
      return <LandingPage />;
    case "onboarding":
      return <OnboardingPage />;
    case "assessment":
      return <AssessmentPage />;
    case "processing":
      return <ProcessingPage />;
    case "workspace":
      return <WorkspacePage />;
    case "my-routes":
      return <MyRoutesPage />;
    default:
      return <LandingPage />;
  }
}

export default function App() {
  return (
    <LearningProvider>
      <AppContent />
    </LearningProvider>
  );
}

