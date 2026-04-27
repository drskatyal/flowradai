import { steps } from "@/constants";
import { driver, type Config, type Driver } from "driver.js";
import "driver.js/dist/driver.css";

// Extend Config type to allow undocumented callback props
type CustomConfig = Config & {
  onDestroyed?: () => void;
  onDeselected?: () => void;
  onHighlighted?: () => void;
};

export const useOnboardingTour = () => {
  // Create Driver.js instance only once
  const driverObj: Driver = driver({
    popoverClass: "driverjs-theme",
    nextBtnText: "Next",
    prevBtnText: "Back",
    steps: steps,
    showProgress: true,
    onDestroyed: () => {
      console.log("Tour ended");
      sessionStorage.setItem("onboarding_tour_seen", "true");
    },
  } as CustomConfig); // override type limitations

  // Start tour only if not already seen
  const handleTour = () => {
    const alreadySeen = sessionStorage.getItem("onboarding_tour_seen");
    if (alreadySeen) return;
    driverObj.drive();
  };

  // Optional: reset tour flag manually
  const resetTour = () => {
    sessionStorage.removeItem("onboarding_tour_seen");
  };

  return {
    handleTour,
    resetTour,
  };
};
