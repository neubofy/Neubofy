"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedShape = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.rotation.x = time * 0.1;
      meshRef.current.rotation.y = time * 0.15;

      const targetX = (state.pointer.x * 1.5);
      const targetY = (state.pointer.y * 1.5);
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.05);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.05);
    }
  });

  return (
    <Sphere args={[1.5, 64, 64]} ref={meshRef} position={[0, 0, 0]}>
      <MeshDistortMaterial
        color="#04bffc"
        attach="material"
        distort={0.2}
        speed={0.8}
        roughness={0.1}
        metalness={0.8}
        transparent={true}
        opacity={0.6}
      />
    </Sphere>
  );
};

const AnimatedShape2 = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.rotation.x = -time * 0.1;
      meshRef.current.rotation.y = time * 0.15;

      const basePosY = Math.sin(time * 0.5) * 0.5 + 1;
      const targetX = 3 + (state.pointer.x * -1);
      const targetY = basePosY + (state.pointer.y * -1);

      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.03);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.03);
    }
  });

  return (
    <Sphere args={[1.2, 64, 64]} ref={meshRef} position={[3, 1, -2]}>
      <MeshDistortMaterial
        color="#003fe2"
        attach="material"
        distort={0.25}
        speed={0.6}
        roughness={0.1}
        metalness={0.8}
        transparent={true}
        opacity={0.5}
      />
    </Sphere>
  );
};

const AnimatedShape3 = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.rotation.x = time * 0.05;
      meshRef.current.rotation.z = -time * 0.1;

      const basePosX = -3 + Math.cos(time * 0.3) * 0.5;
      const targetX = basePosX + (state.pointer.x * 0.8);
      const targetY = -1 + (state.pointer.y * 0.8);

      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.04);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.04);
    }
  });

  return (
    <Sphere args={[1.8, 64, 64]} ref={meshRef} position={[-3, -1, -3]}>
      <MeshDistortMaterial
        color="#017cfc"
        attach="material"
        distort={0.2}
        speed={0.5}
        roughness={0.1}
        metalness={0.8}
        transparent={true}
        opacity={0.4}
      />
    </Sphere>
  );
};

export default function LiquidThreeBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        eventSource={typeof document !== 'undefined' ? document.body : undefined}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        <AnimatedShape />
        <AnimatedShape2 />
        <AnimatedShape3 />
      </Canvas>
    </div>
  );
}
