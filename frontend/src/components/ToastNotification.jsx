import React from 'react';
import { useAppContext } from '../context/AppContext';

const ToastNotification = () => {
  const { toast } = useAppContext();

  if (!toast) return null;

  const { message, type } = toast;

  let bgColor = 'bg-blue-600'; // Darker blue for info
  let borderColor = 'border-blue-800';

  switch (type) {
    case 'success':
      bgColor = 'bg-green-600';
      borderColor = 'border-green-800';
      break;
    case 'error':
      bgColor = 'bg-red-600';
      borderColor = 'border-red-800';
      break;
    case 'warning':
      bgColor = 'bg-yellow-500';
      borderColor = 'border-yellow-700';
      break;
    default: // info
      bgColor = 'bg-blue-600';
      borderColor = 'border-blue-800';
      break;
  }

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 p-4 rounded-lg shadow-xl text-white font-semibold transition-all duration-300 ease-in-out transform
        ${bgColor} border-l-8 ${borderColor}`}
      style={{ minWidth: '280px' }}
    >
      {message}
    </div>
  );
};

export default ToastNotification;
