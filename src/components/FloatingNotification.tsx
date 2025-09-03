import { useState, useEffect } from 'react';

interface FloatingNotificationProps {
  message: string;
  show: boolean;
  onHide: () => void;
  duration?: number;
}

export const FloatingNotification = ({ 
  message, 
  show, 
  onHide, 
  duration = 5000 
}: FloatingNotificationProps) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onHide]);

  if (!show) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-6 py-3 rounded-lg shadow-lg border">
        <p className="text-sm font-medium text-center">{message}</p>
      </div>
    </div>
  );
};