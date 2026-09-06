"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedShape = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Sphere args={[1.5, 64, 64]} ref={meshRef} position={[0, 0, 0]}>
      <MeshDistortMaterial
        color="#F43F5E"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
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
      meshRef.current.rotation.x = -state.clock.getElapsedTime() * 0.15;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.25;
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.5;
    }
  });

  return (
    <Sphere args={[1.2, 64, 64]} ref={meshRef} position={[3, 1, -2]}>
      <MeshDistortMaterial
        color="#8B5CF6"
        attach="material"
        distort={0.5}
        speed={1.5}
        roughness={0.1}
        metalness={0.9}
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
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.1;
      meshRef.current.rotation.z = -state.clock.getElapsedTime() * 0.2;
      meshRef.current.position.x = -3 + Math.cos(state.clock.getElapsedTime() * 0.5) * 1;
    }
  });

  return (
    <Sphere args={[1.8, 64, 64]} ref={meshRef} position={[-3, -1, -3]}>
      <MeshDistortMaterial
        color="#06B6D4"
        attach="material"
        distort={0.3}
        speed={1}
        roughness={0.3}
        metalness={0.7}
        transparent={true}
        opacity={0.4}
      />
    </Sphere>
  );
};

export default function LiquidThreeBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
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
