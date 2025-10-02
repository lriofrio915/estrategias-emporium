// components/Shared/SuccessModal.tsx
"use client";

import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

interface SuccessModalProps {
  message: string;
  onClose: () => void;
  title?: string;
}

export default function SuccessModal({
  message,
  onClose,
  title = "Éxito",
}: SuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[999] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm relative text-center border-t-4 border-green-500">
        <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-[#0A2342] mb-3">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors w-full"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
