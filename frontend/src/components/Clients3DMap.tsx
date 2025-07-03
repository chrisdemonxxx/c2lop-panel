"use client";
import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";

// Dummy client data with positions (replace with real geo/xyz data if available)
const clients = [
  { id: 1, name: "Client 1", position: [2, 0, 0] },
  { id: 2, name: "Client 2", position: [-2, 0, 0] },
  { id: 3, name: "Client 3", position: [0, 2, 0] },
];

export default function Clients3DMap() {
  return (
    <div style={{ width: "100%", height: 400, background: "#111", borderRadius: 8 }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        {clients.map((client) => (
          <Sphere key={client.id} args={[0.5, 32, 32]} position={client.position}>
            <meshStandardMaterial attach="material" color="#4ade80" />
          </Sphere>
        ))}
        <OrbitControls />
      </Canvas>
    </div>
  );
}
