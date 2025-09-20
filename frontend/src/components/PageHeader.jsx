import React from 'react';

const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-gray-600 max-w-2xl">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
