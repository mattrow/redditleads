// src/components/ui/progress.tsx

import React from 'react';

interface ProgressProps {
  value: number; // Percentage value between 0 and 100
}

export const Progress: React.FC<ProgressProps> = ({ value }) => {
  return (
    <div className="w-full h-2 bg-[#343536] rounded-full overflow-hidden">
      <div
        className="h-full bg-[#FF4500]"
        style={{ width: `${value}%` }}
      />
    </div>
  );
};