"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

interface TrailHeart {
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  vx: number;
  vy: number;
  rotation: number;
  rotSpeed: number;
  life: number;
}

export default function InteractiveEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heartsRef = useRef<TrailHeart[]>([]);
  const lastMousePos = useRef({ x: 0, y: 0, time: 0 });

  useEffect(() => {
    // ── 1. Initialize Lenis Smooth Kinetic Scrolling ────────────────
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential decel
      infinite: false,
    });

    let lenisRafId: number;
    const scrollRaf = (time: number) => {
      lenis.raf(time);
      lenisRafId = requestAnimationFrame(scrollRaf);
    };
    lenisRafId = requestAnimationFrame(scrollRaf);

    // ── 2. Initialize Cursor Heart Trail Canvas ─────────────────────
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let canvasRafId: number;
    const colors = ["#e5b0b6", "#c97b84", "#e8c59a", "#fdfaf6"];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Draw a vector heart helper
    const drawHeart = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      opacity: number,
      color: string,
      rotation: number
    ) => {
      context.save();
      context.translate(x, y);
      context.rotate(rotation);
      context.globalAlpha = opacity;
      context.fillStyle = color;
      context.shadowBlur = 8;
      context.shadowColor = color;
      context.beginPath();

      const topCurveHeight = size * 0.3;
      context.moveTo(0, topCurveHeight);
      context.bezierCurveTo(
        -size / 2, -topCurveHeight, 
        -size, topCurveHeight, 
        0, size
      );
      context.bezierCurveTo(
        size, topCurveHeight, 
        size / 2, -topCurveHeight, 
        0, topCurveHeight
      );

      context.closePath();
      context.fill();
      context.restore();
    };

    // Track mouse moves to emit hearts
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      const now = Date.now();
      const timeDiff = now - lastMousePos.current.time;

      // Only emit a heart if mouse has moved sufficiently or at reasonable interval
      const dx = x - lastMousePos.current.x;
      const dy = y - lastMousePos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 8 && timeDiff > 15) {
        // Create new heart particle
        const size = Math.random() * 6 + 4;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        heartsRef.current.push({
          x,
          y,
          size,
          opacity: 0.85,
          color,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -(Math.random() * 0.8 + 0.4), // floats up
          rotation: (Math.random() - 0.5) * 0.5,
          rotSpeed: (Math.random() - 0.5) * 0.05,
          life: 1.0,
        });

        lastMousePos.current = { x, y, time: now };
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Heart render tick loop
    const renderTrail = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const hearts = heartsRef.current;
      for (let i = hearts.length - 1; i >= 0; i--) {
        const h = hearts[i];
        
        h.x += h.vx;
        h.y += h.vy;
        h.rotation += h.rotSpeed;
        h.life -= 0.018; // decay rate
        h.opacity = Math.max(0, h.life);

        if (h.life <= 0) {
          hearts.splice(i, 1);
          continue;
        }

        drawHeart(ctx, h.x, h.y, h.size, h.opacity, h.color, h.rotation);
      }

      canvasRafId = requestAnimationFrame(renderTrail);
    };
    renderTrail();

    // Cleanup
    return () => {
      cancelAnimationFrame(lenisRafId);
      cancelAnimationFrame(canvasRafId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      lenis.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[9999] select-none"
    />
  );
}
