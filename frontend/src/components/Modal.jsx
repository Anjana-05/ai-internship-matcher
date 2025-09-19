import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex justify-center items-start z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl my-8 p-6 relative animate-scale-in border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl font-semibold leading-none">&times;</button>
        </div>
        <div className="modal-content">
          {children}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-150 ease-in-out"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
