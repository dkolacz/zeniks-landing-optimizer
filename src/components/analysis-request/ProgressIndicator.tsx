import React from 'react';

const ProgressIndicator = () => {
  return (
    <div className="mb-8 flex justify-center">
      <div className="flex items-center gap-2 text-sm font-medium text-zeniks-purple">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zeniks-purple text-white">
          1
        </span>
        <span>Request Analysis</span>
      </div>
    </div>
  );
};

export default ProgressIndicator;