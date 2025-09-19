import React from 'react';
import { useAppContext } from '../context/AppContext';

const TopLoadingBar = () => {
  const { loading } = useAppContext();

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-pulse" />
    </div>
  );
};

export default TopLoadingBar;
