import React from 'react';

const EmptyState = ({
  title = 'Nothing here yet',
  description = 'There is no content to display right now.',
  action = null,
  icon = '📄',
  className = ''
}) => {
  return (
    <div className={`text-center bg-white border border-gray-200 rounded-xl p-8 shadow-sm ${className}`}>
      <div className="text-5xl mb-3" aria-hidden>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600 mt-1 max-w-xl mx-auto">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
