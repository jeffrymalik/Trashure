"use client";

import React from "react";
import { X, AlertCircle, CheckCircle2, Info } from "lucide-react";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "error" | "success" | "info";
  title: string;
  message: string;
  buttonText?: string;
}

export default function AlertModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  buttonText = "Tutup",
}: AlertModalProps) {
  if (!isOpen) return null;

  const iconMap = {
    error: <AlertCircle className="w-10 h-10 text-red-500" />,
    success: <CheckCircle2 className="w-10 h-10 text-green-500" />,
    info: <Info className="w-10 h-10 text-blue-500" />,
  };

  const bgColorMap = {
    error: "bg-red-50",
    success: "bg-green-50",
    info: "bg-blue-50",
  };

  const buttonColorMap = {
    error: "bg-red-500 hover:bg-red-600",
    success: "bg-green-500 hover:bg-green-600",
    info: "bg-blue-500 hover:bg-blue-600",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div
            className={`w-16 h-16 rounded-full ${bgColorMap[type]} flex items-center justify-center mb-4`}
          >
            {iconMap[type]}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>

          {/* Message */}
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">{message}</p>

          {/* Button */}
          <button
            onClick={onClose}
            className={`w-full py-2.5 px-4 ${buttonColorMap[type]} text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
