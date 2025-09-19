import React from 'react';

const ProgressTracker = ({ status }) => {
  const statuses = ['applied', 'pending', 'selected', 'rejected'];
  const currentIndex = statuses.indexOf(status);

  const getStepColor = (index) => {
    if (index < currentIndex) {
      return 'bg-green-500'; // Completed steps
    } else if (index === currentIndex) {
      return 'bg-blue-500'; // Current step
    } else {
      return 'bg-gray-300'; // Future steps
    }
  };

  const getTextColor = (index) => {
    if (index < currentIndex) {
      return 'text-green-700';
    } else if (index === currentIndex) {
      return 'text-blue-700 font-semibold';
    } else {
      return 'text-gray-500';
    }
  };

  return (
    <div className="flex items-center justify-between text-xs w-full mt-2">
      {statuses.map((s, index) => (
        <div key={s} className="flex flex-col items-center flex-1 mx-1">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${getStepColor(index)}`}>
            {index + 1}
          </div>
          <span className={`mt-1 text-center ${getTextColor(index)}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ProgressTracker;
