"use client";

import { useEffect } from "react";

interface SuccessPopupProps {
  message: string;
  onClose: () => void;
}

export default function SuccessPopup({ message, onClose }: SuccessPopupProps) {
  useEffect(() => {
    console.log("SuccessPopup mounted with message:", message); // Debug log
    
    const timer = setTimeout(() => {
      console.log("Auto-hiding success popup"); // Debug log
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className="fixed top-20 right-6 z-50 animate-slide-in">
      <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-[300px]">
        <svg 
          className="w-6 h-6 flex-shrink-0" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 13l4 4L19 7" 
          />
        </svg>
        <span className="font-medium flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 focus:outline-none"
        >
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
}