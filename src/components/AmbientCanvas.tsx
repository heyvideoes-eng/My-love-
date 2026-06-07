"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function AmbientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Renderer ───────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x000000, 0);

    // ── Scene & Camera ────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 4.2);

    // ── Lighting ──────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0xfff0f4, 1.2);
    scene.add(ambient);

    const fill = new THREE.DirectionalLight(0xf5d8d8, 0.6);
    fill.position.set(2, 3, 4);
    scene.add(fill);

    // ── Abstract Heart-Inspired Ribbon ────────────────────────────
    // A torus knot with p=2, q=3 produces a soft pretzel/heart-like
    // flowing ribbon shape — elegant and sculptural.
    const geometry = new THREE.TorusKnotGeometry(1.05, 0.28, 180, 20, 2, 3);

    const material = new THREE.MeshPhongMaterial({
      color: 0xf2c4c4,         // very soft blush
      emissive: 0xf8dede,
      emissiveIntensity: 0.12,
      shininess: 18,
      transparent: true,
      opacity: 0.18,           // very low — stays behind text
      wireframe: false,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Second pass: wireframe overlay for a delicate ribbon feel
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xe8b8b8,
      transparent: true,
      opacity: 0.055,
      wireframe: true,
    });
    const wireMesh = new THREE.Mesh(geometry, wireMat);
    scene.add(wireMesh);

    // ── Resize handler ─────────────────────────────────────────────
    const onResize = () => {
      if (!canvas) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // ── Animation loop ────────────────────────────────────────────
    let rafId: number;
    let t = 0;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      t += 0.004;

      // Very slow, gentle rotation on two axes
      mesh.rotation.x = Math.sin(t * 0.4) * 0.25 + t * 0.12;
      mesh.rotation.y = t * 0.18;
      mesh.rotation.z = Math.cos(t * 0.3) * 0.15;

      wireMesh.rotation.copy(mesh.rotation);

      // Soft breathing scale
      const s = 1 + Math.sin(t * 0.5) * 0.025;
      mesh.scale.setScalar(s);
      wireMesh.scale.setScalar(s);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      wireMat.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-canvas"
      style={{
        width: "100%",
        height: "100%",
        filter: "blur(32px) saturate(0.8)",
        opacity: 0.7,
      }}
      aria-hidden="true"
    />
  );
}
