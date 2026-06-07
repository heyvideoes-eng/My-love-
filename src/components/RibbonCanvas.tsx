"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface RibbonCanvasProps {
  theme: string;
}

export default function RibbonCanvas({ theme }: RibbonCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Mobile check
    if (window.innerWidth < 768) {
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Fluid Mesh
    const geometry = new THREE.IcosahedronGeometry(1.6, 4);
    const positionAttr = geometry.attributes.position;
    const originalPositions = positionAttr.clone();

    // Map theme colors to mesh color
    const getThemeColor = () => {
      switch (theme) {
        case "rainy": return 0x7da4c2;
        case "blush": return 0xe299a8;
        case "midnight": return 0x546285;
        case "coffee": return 0xb59a7f;
        default: return 0xe2a3b0; // morning / default
      }
    };

    const material = new THREE.MeshPhysicalMaterial({
      color: getThemeColor(),
      roughness: 0.15,
      metalness: 0.05,
      transmission: 0.8,
      thickness: 1.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight1.position.set(5, 5, 3);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xd4af37, 0.8);
    dirLight2.position.set(-5, -5, 2);
    scene.add(dirLight2);

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      targetMouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    };

    window.addEventListener("mousemove", handleMouseMove);

    let scrollY = 0;
    let targetScrollY = 0;

    const handleScroll = () => {
      targetScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);

    // Resize
    const handleResize = () => {
      if (!rendererRef.current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    const clock = new THREE.Clock();
    let animationFrameId: number;

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      // Deform positions
      const positions = geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = originalPositions.getX(i);
        const y = originalPositions.getY(i);
        const z = originalPositions.getZ(i);

        const wave1 = Math.sin(x * 1.3 + elapsedTime * 0.6) * 0.14;
        const wave2 = Math.cos(y * 1.6 + elapsedTime * 0.8) * 0.11;
        const wave3 = Math.sin(z * 1.4 + elapsedTime * 0.4) * 0.08;
        const displacement = wave1 + wave2 + wave3;

        const len = Math.sqrt(x * x + y * y + z * z);
        positions.setXYZ(
          i,
          x + (x / len) * displacement,
          y + (y / len) * displacement,
          z + (z / len) * displacement
        );
      }
      positions.needsUpdate = true;
      geometry.computeVertexNormals();

      // Lerp interactions
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;
      scrollY += (targetScrollY - scrollY) * 0.08;

      mesh.rotation.y = elapsedTime * 0.08 + mouseX * 0.35;
      mesh.rotation.x = elapsedTime * 0.04 + mouseY * 0.35;

      mesh.position.y = -(scrollY * 0.0015);
      mesh.position.x = mouseX * 0.2;

      // Update material color if theme changes
      material.color.setHex(getThemeColor());

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    // Clean up
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      geometry.dispose();
      material.dispose();
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
        containerRef.current?.removeChild(rendererRef.current.domElement);
      }
    };
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[1] opacity-75 hidden md:block"
    />
  );
}
