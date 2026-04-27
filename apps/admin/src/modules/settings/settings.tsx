"use client";

import { AIServiceSettings } from "./components/ai-service-settings";

const Settings = () => {
  return (
    <div className="container space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AIServiceSettings />
        {/* Add other setting sections here in the future */}
      </div>
    </div>
  );
};

export default Settings;
