"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  fadeSpeed: number;
  color: string;
  isHeart: boolean;
  wiggle: number;
  wiggleSpeed: number;
}

export default function HeartParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    const colors = ["#e5b0b6", "#c97b84", "#e8c59a", "#fdfaf6"];

    // Resize handler
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Mouse movement listeners
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Helper to draw a vector heart
    const drawHeart = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      opacity: number,
      color: string
    ) => {
      context.save();
      context.globalAlpha = opacity;
      context.fillStyle = color;
      context.shadowBlur = 12;
      context.shadowColor = color;
      context.beginPath();
      
      // Heart path
      const topCurveHeight = size * 0.3;
      context.moveTo(x, y + topCurveHeight);
      // Top left curve
      context.bezierCurveTo(
        x - size / 2, y - topCurveHeight, 
        x - size, y + topCurveHeight, 
        x, y + size
      );
      // Top right curve
      context.bezierCurveTo(
        x + size, y + topCurveHeight, 
        x + size / 2, y - topCurveHeight, 
        x, y + topCurveHeight
      );
      
      context.closePath();
      context.fill();
      context.restore();
    };

    // Helper to draw a glowing dot
    const drawDot = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      opacity: number,
      color: string
    ) => {
      context.save();
      context.globalAlpha = opacity;
      context.fillStyle = color;
      context.shadowBlur = size * 2.5;
      context.shadowColor = color;
      context.beginPath();
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fill();
      context.restore();
    };

    // Create a new particle
    const createParticle = (initBottom = false): Particle => {
      const isHeart = Math.random() > 0.75;
      const size = isHeart ? Math.random() * 8 + 6 : Math.random() * 2 + 1;
      
      return {
        x: Math.random() * canvas.width,
        y: initBottom ? canvas.height + 20 : Math.random() * canvas.height,
        size,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: isHeart ? -(Math.random() * 0.5 + 0.3) : -(Math.random() * 0.3 + 0.15),
        opacity: Math.random() * 0.5 + 0.2,
        fadeSpeed: Math.random() * 0.002 + 0.001,
        color: colors[Math.floor(Math.random() * colors.length)],
        isHeart,
        wiggle: Math.random() * 100,
        wiggleSpeed: Math.random() * 0.02 + 0.005,
      };
    };

    // Initialize particle pool
    const maxParticles = Math.min(80, Math.floor((canvas.width * canvas.height) / 18000));
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(false));
    }

    // Loop
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render ambient radial glow matching mouse (subtle torch light)
      if (mouseRef.current.active) {
        const gradient = ctx.createRadialGradient(
          mouseRef.current.x,
          mouseRef.current.y,
          0,
          mouseRef.current.x,
          mouseRef.current.y,
          220
        );
        gradient.addColorStop(0, "rgba(201, 123, 132, 0.08)");
        gradient.addColorStop(0.5, "rgba(232, 197, 154, 0.03)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Update and draw particles
      particles.forEach((p, idx) => {
        // Apply wiggle to hearts
        p.wiggle += p.wiggleSpeed;
        const drift = p.isHeart ? Math.sin(p.wiggle) * 0.25 : 0;

        p.x += p.speedX + drift;
        p.y += p.speedY;

        // Interaction with mouse pointer (gentle push)
        if (mouseRef.current.active) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150;
            p.x += (dx / dist) * force * 1.5;
            p.y += (dy / dist) * force * 1.5;
          }
        }

        // Draw particle
        if (p.isHeart) {
          drawHeart(ctx, p.x, p.y, p.size, p.opacity, p.color);
        } else {
          drawDot(ctx, p.x, p.y, p.size, p.opacity, p.color);
        }

        // Recycle if goes offscreen or gets too transparent
        if (p.y < -20 || p.x < -20 || p.x > canvas.width + 20) {
          particles[idx] = createParticle(true);
        }
      });

      animationId = requestAnimationFrame(tick);
    };

    tick();

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
      style={{ opacity: 0.65 }}
    />
  );
}
