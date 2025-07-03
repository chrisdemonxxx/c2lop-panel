"use client";
import React, { useEffect, useRef } from "react";

export default function MatrixRain({ className = "", style = {}, show = true }: { className?: string, style?: React.CSSProperties, show?: boolean }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!show) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let fontSize = 16;
    let columns = Math.floor(width / fontSize);
    let drops = Array(columns).fill(1);
    let animationFrame;
    function draw() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#0f0";
      ctx.font = fontSize + "px monospace";
      for (let i = 0; i < drops.length; i++) {
        let text = String.fromCharCode(0x30A0 + Math.random() * 96);
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animationFrame = requestAnimationFrame(draw);
    }
    draw();
    function handleResize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / fontSize);
      drops = Array(columns).fill(1);
    }
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  if (!show) return null;
  return (
    <div style={{position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none'}}>
      <canvas
        ref={canvasRef}
        className={"w-full h-full opacity-70 " + className}
        style={{display: 'block', ...style}}
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}
