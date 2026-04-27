import React from "react";

export const WaveBars = ({ active = true }: { active?: boolean }) => {
  if (!active) return null;

  const bars = [
    { anim: "animate-wave1", height: "h-[4px]" },
    { anim: "animate-wave2", height: "h-[8px]" },
    { anim: "animate-wave3", height: "h-[6px]" },
    { anim: "animate-wave4", height: "h-[10px]" },
    { anim: "animate-wave3", height: "h-[6px]" },
    { anim: "animate-wave2", height: "h-[8px]" },
    { anim: "animate-wave1", height: "h-[4px]" },
  ];

  return (
    <div className="flex items-center gap-[2px]">
      {bars.map(({ anim, height }, i) => (
        <span
          key={i}
          className={`w-[2px] ${height} bg-white ${anim} origin-center`}
        />
      ))}
    </div>
  );
};
