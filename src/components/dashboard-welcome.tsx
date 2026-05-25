"use client";

import { useEffect } from "react";
import { WelcomeModal } from "./welcome-modal";

// DashboardWelcome wrapper that triggers the welcome modal check on dashboard load
export function DashboardWelcome() {
  useEffect(() => {
    // This component will trigger the welcome modal check on dashboard load
  }, []);

  return <WelcomeModal />;
}
