import React from "react";

export const Construction = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-5xl">🚧</span>
      </div>
      <p className="text-xl text-gray-600">
        This page is currently under construction.
        <br />
        Check back soon for updates!
      </p>
    </div>
  );
};
