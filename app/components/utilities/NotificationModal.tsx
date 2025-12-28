"use client";

import { useEffect } from "react";

interface NotificationModalProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  type?: "success" | "error" | "info";
}

const NotificationModal = ({
  message,
  isVisible,
  onClose,
  duration = 3000,
  type = "success",
}: NotificationModalProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const bgColor =
    type === "error"
      ? "bg-red-500"
      : type === "info"
      ? "bg-blue-500"
      : "bg-green-500";

  return (
    <div className="fixed top-5 right-5 z-50 animate-fade-in">
      <div className={`${bgColor} p-5 rounded-lg shadow-lg w-auto max-w-md`}>
        <p className="text-white text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};

export default NotificationModal;

