"use client";
import React, { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

export function showHackerToast(message: string, type: ToastType = "info") {
  const event = new CustomEvent("hacker-toast", { detail: { message, type } });
  window.dispatchEvent(event);
}

const COLORS = {
  success: "bg-green-900 border-green-500 text-green-200",
  error: "bg-red-900 border-red-500 text-red-200",
  info: "bg-gray-900 border-gray-500 text-gray-200",
};

export default function HackerToast() {
  const [toast, setToast] = React.useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    function handler(e: any) {
      setToast(e.detail);
      setTimeout(() => setToast(null), 3000);
    }
    window.addEventListener("hacker-toast", handler);
    return () => window.removeEventListener("hacker-toast", handler);
  }, []);

  if (!toast) return null;

  return (
    <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-8 py-4 border-2 ${COLORS[toast.type]} font-mono text-lg shadow-xl animate-pulse`}
      style={{ letterSpacing: 1.5, textShadow: "0 0 8px #0f0" }}>
      <span className="select-none">{toast.message}</span>
    </div>
  );
}
