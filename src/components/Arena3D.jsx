import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Html, QuadraticBezierLine, Float } from '@react-three/drei';
import * as THREE from 'three';

// Coordinate converter: Map 2D pixel space to 3D world units on X-Z ground plane
export function to3D(x, y, height = 0) {
  const scale = 0.026;
  const offsetX = 560;
  const offsetY = 320;
  return [(x - offsetX) * scale, height, (y - offsetY) * scale];
}

// ---------------------------------------------------------------------------
// 1. PROCEDURAL 3D MESHES FOR ALL ARCHITECTURAL COMPONENTS
// ---------------------------------------------------------------------------

function WebServerMesh({ isOverloaded, isSelected }) {
  const coreRef = useRef();
  useFrame((_, delta) => {
    if (coreRef.current) coreRef.current.rotation.y += delta * 1.5;
  });

  const baseColor = isOverloaded ? '#ef4444' : isSelected ? '#38bdf8' : '#0ea5e9';

  return (
    <group position={[0, 0.75, 0]}>
      {/* Server Rack Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 1.5, 1.1]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Rack Edge Trim */}
      <mesh position={[0, 0, 0.56]}>
        <boxGeometry args={[1.4, 1.4, 0.02]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Blade Slots & LED lights */}
      {[-0.45, -0.15, 0.15, 0.45].map((yOffset, i) => (
        <group key={i} position={[0, yOffset, 0.58]}>
          <mesh>
            <boxGeometry args={[1.2, 0.18, 0.02]} />
            <meshStandardMaterial color="#090d16" roughness={0.5} />
          </mesh>
          <mesh position={[-0.45, 0, 0.02]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshBasicMaterial color={isOverloaded ? '#ef4444' : i % 2 === 0 ? '#38bdf8' : '#34d399'} />
          </mesh>
          <mesh position={[-0.35, 0, 0.02]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshBasicMaterial color={isOverloaded ? '#f59e0b' : '#818cf8'} />
          </mesh>
        </group>
      ))}

      {/* Internal Glowing Power Core */}
      <mesh ref={coreRef} position={[0, 0.88, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.15, 16]} />
        <meshBasicMaterial color={baseColor} wireframe />
      </mesh>
    </group>
  );
}

function DatabaseMesh({ isOverloaded, isSelected }) {
  const ringRef = useRef();
  useFrame((_, delta) => {
    if (ringRef.current) ringRef.current.rotation.y -= delta * 0.9;
  });

  const neonColor = isOverloaded ? '#ef4444' : isSelected ? '#f59e0b' : '#eab308';

  return (
    <group position={[0, 0.85, 0]}>
      {/* Tier 1 */}
      <mesh position={[0, -0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.75, 0.45, 24]} />
        <meshStandardMaterial color="#111827" roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[0, -0.15, 0]}>
        <torusGeometry args={[0.72, 0.035, 12, 24]} />
        <meshBasicMaterial color={neonColor} />
      </mesh>

      {/* Tier 2 */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.65, 0.65, 0.45, 24]} />
        <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <torusGeometry args={[0.67, 0.035, 12, 24]} />
        <meshBasicMaterial color={neonColor} />
      </mesh>

      {/* Tier 3 */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.4, 24]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Rotating Data Ring on Top */}
      <group ref={ringRef} position={[0, 0.88, 0]}>
        <mesh>
          <torusGeometry args={[0.45, 0.04, 12, 24]} />
          <meshBasicMaterial color={neonColor} wireframe />
        </mesh>
      </group>
    </group>
  );
}

function CacheMesh({ isOverloaded, isSelected }) {
  const cube1Ref = useRef();
  const cube2Ref = useRef();

  useFrame((_, delta) => {
    if (cube1Ref.current) {
      cube1Ref.current.rotation.x += delta * 0.8;
      cube1Ref.current.rotation.y += delta * 1.2;
    }
    if (cube2Ref.current) {
      cube2Ref.current.rotation.y -= delta * 0.6;
      cube2Ref.current.rotation.z += delta * 0.9;
    }
  });

  const neonColor = isOverloaded ? '#ef4444' : isSelected ? '#e879f9' : '#c084fc';

  return (
    <group position={[0, 0.85, 0]}>
      <mesh position={[0, -0.65, 0]}>
        <cylinderGeometry args={[0.7, 0.85, 0.25, 6]} />
        <meshStandardMaterial color="#18181b" roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh ref={cube1Ref}>
        <boxGeometry args={[0.95, 0.95, 0.95]} />
        <meshStandardMaterial
          color={neonColor}
          transparent
          opacity={0.45}
          roughness={0.1}
          metalness={0.3}
          wireframe
        />
      </mesh>
      <mesh ref={cube2Ref}>
        <octahedronGeometry args={[0.48]} />
        <meshBasicMaterial color={neonColor} />
      </mesh>
    </group>
  );
}

function TrafficSourceMesh() {
  const globeRef = useRef();
  const ringRef = useRef();

  useFrame((_, delta) => {
    if (globeRef.current) globeRef.current.rotation.y += delta * 0.5;
    if (ringRef.current) {
      ringRef.current.rotation.x += delta * 0.3;
      ringRef.current.rotation.z += delta * 0.6;
    }
  });

  return (
    <group position={[0, 0.9, 0]}>
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[0.65, 0.8, 0.2, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh ref={globeRef}>
        <sphereGeometry args={[0.65, 18, 18]} />
        <meshBasicMaterial color="#38bdf8" wireframe />
      </mesh>
      <group ref={ringRef}>
        <mesh>
          <torusGeometry args={[0.95, 0.02, 16, 32]} />
          <meshBasicMaterial color="#818cf8" />
        </mesh>
        <mesh position={[0.95, 0, 0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial color="#34d399" />
        </mesh>
      </group>
    </group>
  );
}

function LoadBalancerMesh({ isOverloaded, isSelected }) {
  const prismRef = useRef();
  useFrame((_, delta) => {
    if (prismRef.current) prismRef.current.rotation.y += delta * 1.8;
  });

  const neonColor = isOverloaded ? '#ef4444' : isSelected ? '#a855f7' : '#8b5cf6';

  return (
    <group position={[0, 0.85, 0]}>
      <mesh position={[0, -0.65, 0]}>
        <cylinderGeometry args={[0.75, 0.85, 0.25, 8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh ref={prismRef} position={[0, 0.1, 0]}>
        <coneGeometry args={[0.7, 1.1, 4]} />
        <meshStandardMaterial color={neonColor} wireframe roughness={0.2} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshBasicMaterial color={neonColor} />
      </mesh>
    </group>
  );
}

function QueueMesh({ isOverloaded, isSelected }) {
  const rollerRef = useRef();
  useFrame((_, delta) => {
    if (rollerRef.current) rollerRef.current.rotation.z += delta * 2.0;
  });

  const neonColor = isOverloaded ? '#ef4444' : isSelected ? '#f97316' : '#fb923c';

  return (
    <group position={[0, 0.7, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 1.4, 16]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1e1e24" roughness={0.3} metalness={0.8} />
      </mesh>
      <group ref={rollerRef}>
        {[-0.45, 0, 0.45].map((xOffset, i) => (
          <mesh key={i} position={[xOffset, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.54, 0.04, 12, 24]} />
            <meshBasicMaterial color={neonColor} />
          </mesh>
        ))}
      </group>
      {[-0.25, 0.25].map((xOffset, i) => (
        <mesh key={i} position={[xOffset, 0.62, 0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshBasicMaterial color={neonColor} />
        </mesh>
      ))}
    </group>
  );
}

function WorkerMesh({ isOverloaded, isSelected }) {
  const fanRef = useRef();
  useFrame((_, delta) => {
    if (fanRef.current) fanRef.current.rotation.y += delta * 3.5;
  });

  const neonColor = isOverloaded ? '#ef4444' : isSelected ? '#10b981' : '#34d399';

  return (
    <group position={[0, 0.75, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.3, 1.1, 1.3]} />
        <meshStandardMaterial color="#0b1329" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.58, 0]}>
        <cylinderGeometry args={[0.48, 0.48, 0.08, 16]} />
        <meshBasicMaterial color={neonColor} />
      </mesh>
      <group ref={fanRef} position={[0, 0.65, 0]}>
        <mesh>
          <boxGeometry args={[0.8, 0.02, 0.12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.8, 0.02, 0.12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
}

function WAFMesh({ isOverloaded, isSelected }) {
  const shieldRef = useRef();
  useFrame((_, delta) => {
    if (shieldRef.current) shieldRef.current.rotation.y += delta * 0.8;
  });

  const color = isOverloaded ? '#ef4444' : isSelected ? '#fbbf24' : '#f59e0b';

  return (
    <group position={[0, 0.85, 0]}>
      <mesh position={[0, -0.65, 0]}>
        <cylinderGeometry args={[0.65, 0.8, 0.2, 6]} />
        <meshStandardMaterial color="#111827" roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh ref={shieldRef}>
        <cylinderGeometry args={[0.6, 0.6, 1.2, 6, 1, true]} />
        <meshStandardMaterial color={color} wireframe transparent opacity={0.65} />
      </mesh>
      <mesh>
        <octahedronGeometry args={[0.4]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function CDNMesh({ isOverloaded, isSelected }) {
  const dishRef = useRef();
  useFrame((_, delta) => {
    if (dishRef.current) dishRef.current.rotation.y += delta * 1.2;
  });

  const color = isOverloaded ? '#ef4444' : isSelected ? '#38bdf8' : '#0284c7';

  return (
    <group position={[0, 0.95, 0]}>
      {/* Tower Pylon */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.2, 0.6, 1.2, 4]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Rotating Satellite Dish */}
      <group ref={dishRef} position={[0, 0.5, 0]} rotation={[0.4, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.55, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
}

function StorageMesh({ isOverloaded, isSelected }) {
  const ringRef = useRef();
  useFrame((_, delta) => {
    if (ringRef.current) ringRef.current.rotation.z += delta * 0.9;
  });

  const color = isOverloaded ? '#ef4444' : isSelected ? '#10b981' : '#059669';

  return (
    <group position={[0, 0.8, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.3, 1.3, 1.3]} />
        <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Vault Door Matrix */}
      <group ref={ringRef} position={[0, 0, 0.66]}>
        <mesh>
          <torusGeometry args={[0.42, 0.05, 12, 6]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
    </group>
  );
}

function VectorAIMesh({ isOverloaded, isSelected }) {
  const icoRef = useRef();
  const ringRef = useRef();

  useFrame((_, delta) => {
    if (icoRef.current) {
      icoRef.current.rotation.x += delta * 1.2;
      icoRef.current.rotation.y += delta * 0.9;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 1.5;
    }
  });

  const color = isOverloaded ? '#ef4444' : isSelected ? '#ec4899' : '#d946ef';

  return (
    <group position={[0, 0.9, 0]}>
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[0.65, 0.75, 0.2, 12]} />
        <meshStandardMaterial color="#090d16" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* Neural Core */}
      <mesh ref={icoRef}>
        <icosahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color={color} wireframe />
      </mesh>
      <group ref={ringRef}>
        <mesh>
          <torusGeometry args={[0.9, 0.02, 12, 24]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 2. 3D NODE CONTROLLER COMPONENT
// ---------------------------------------------------------------------------

function Node3D({
  node,
  isSelected,
  stats,
  onSelectNode,
  isConnecting,
  onStartConnect,
  onCompleteConnect,
  isChaosSabotaged
}) {
  const [hovered, setHovered] = useState(false);
  const [posX, posY, posZ] = to3D(node.x, node.y, 0);

  const isOverloaded = stats?.isFailing || (stats?.utilization || 0) > 90 || isChaosSabotaged;
  const util = Math.round(stats?.utilization || 0);
  const rps = Math.round(stats?.actualRps || 0);

  const renderComponentMesh = () => {
    switch (node.type) {
      case 'SOURCE':
      case 'CLIENT_SRC':
        return <TrafficSourceMesh />;
      case 'SQL':
      case 'DB_SQL':
      case 'DB_NOSQL':
        return <DatabaseMesh isOverloaded={isOverloaded} isSelected={isSelected} />;
      case 'CACHE':
        return <CacheMesh isOverloaded={isOverloaded} isSelected={isSelected} />;
      case 'LB':
        return <LoadBalancerMesh isOverloaded={isOverloaded} isSelected={isSelected} />;
      case 'QUEUE':
      case 'QUEUE_KAFKA':
      case 'PUB_SUB':
        return <QueueMesh isOverloaded={isOverloaded} isSelected={isSelected} />;
      case 'WORKER':
        return <WorkerMesh isOverloaded={isOverloaded} isSelected={isSelected} />;
      case 'WAF':
        return <WAFMesh isOverloaded={isOverloaded} isSelected={isSelected} />;
      case 'CDN':
        return <CDNMesh isOverloaded={isOverloaded} isSelected={isSelected} />;
      case 'STORAGE':
        return <StorageMesh isOverloaded={isOverloaded} isSelected={isSelected} />;
      case 'VECTOR_AI':
        return <VectorAIMesh isOverloaded={isOverloaded} isSelected={isSelected} />;
      case 'WEB':
      case 'API':
      default:
        return <WebServerMesh isOverloaded={isOverloaded} isSelected={isSelected} />;
    }
  };

  return (
    <group position={[posX, posY, posZ]}>
      {/* Ground Projection Halo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[1.2, 32]} />
        <meshBasicMaterial
          color={isOverloaded ? '#ef4444' : isSelected ? '#38bdf8' : hovered ? '#818cf8' : '#1e293b'}
          transparent
          opacity={isSelected ? 0.65 : hovered ? 0.45 : 0.25}
        />
      </mesh>

      {/* Floating 3D Model with subtle idle hover */}
      <Float speed={1.8} rotationIntensity={0.08} floatIntensity={0.2}>
        <group
          onClick={(e) => {
            e.stopPropagation();
            if (isConnecting) {
              onCompleteConnect(node.id);
            } else {
              onSelectNode(node.id);
            }
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          {renderComponentMesh()}
        </group>
      </Float>

      {/* Floating Telemetry & Nameplate HTML Billboard */}
      <Html position={[0, 2.3, 0]} center distanceFactor={14} zIndexRange={[100, 0]}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (isConnecting) {
              onCompleteConnect(node.id);
            } else {
              onSelectNode(node.id);
            }
          }}
          className={`pointer-events-auto cursor-pointer select-none px-2.5 py-1 rounded-xl glass-panel border transition-all duration-200 transform hover:scale-105 ${
            isChaosSabotaged
              ? 'border-rose-500 shadow-[0_0_25px_rgba(239,68,68,0.7)] bg-rose-950/85 animate-pulse'
              : isOverloaded
              ? 'border-rose-500/80 shadow-[0_0_20px_rgba(239,68,68,0.5)] bg-rose-950/70'
              : isSelected
              ? 'border-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.5)] bg-slate-900/90'
              : 'border-slate-700/80 bg-slate-950/80 hover:border-cyan-500/50'
          }`}
          style={{ minWidth: '130px', textAlign: 'center' }}
        >
          {/* Node Label */}
          <div className="text-[11px] font-bold text-white tracking-wide truncate max-w-[150px]">
            {node.label || node.id}
          </div>

          {/* Telemetry metrics bar */}
          <div className="flex items-center justify-between gap-2 mt-1 text-[9px] font-mono">
            <span className={`${isOverloaded ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
              {rps > 0 ? `${rps} rps` : 'Idle'}
            </span>
            <span
              className={`px-1.5 py-0.2 rounded font-semibold ${
                isOverloaded
                  ? 'bg-rose-500/20 text-rose-300'
                  : util > 70
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {util}%
            </span>
          </div>

          {/* Quick Connect Port Handle */}
          {node.type !== 'SOURCE' && node.type !== 'CLIENT_SRC' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartConnect(node.id);
              }}
              title="Drag/Click wire to another component"
              className="mt-1 w-full py-0.5 rounded bg-indigo-600/40 hover:bg-indigo-500 text-[8px] font-bold text-indigo-200 uppercase tracking-wider transition"
            >
              Connect Wire
            </button>
          )}
        </div>
      </Html>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 3. 3D ANIMATED WIRE / CONDUIT COMPONENT
// ---------------------------------------------------------------------------

function Edge3D({ edge, fromNode, toNode, flow, isRunning, onDeleteEdge }) {
  const [start, end, mid] = useMemo(() => {
    const s = to3D(fromNode.x, fromNode.y, 0.85);
    const e = to3D(toNode.x, toNode.y, 0.85);
    const m = [(s[0] + e[0]) / 2, Math.max(s[1], e[1]) + 1.2, (s[2] + e[2]) / 2];
    return [s, e, m];
  }, [fromNode.x, fromNode.y, toNode.x, toNode.y]);

  const packetRef1 = useRef();
  const packetRef2 = useRef();
  const packetRef3 = useRef();

  const curve = useMemo(() => {
    const v0 = new THREE.Vector3(...start);
    const v1 = new THREE.Vector3(...mid);
    const v2 = new THREE.Vector3(...end);
    return new THREE.QuadraticBezierCurve3(v0, v1, v2);
  }, [start, mid, end]);

  const hasTraffic = (flow?.flowRps || 0) > 0.1;
  const animSpeed = Math.max(0.4, Math.min(2.5, (flow?.flowRps || 500) / 1000));
  const packetColor = isRunning ? (flow?.dominantType === 'WRITE' ? '#f59e0b' : '#38bdf8') : '#64748b';

  useFrame((state) => {
    if (!hasTraffic) return;
    const t = state.clock.getElapsedTime() * animSpeed;

    if (packetRef1.current) {
      const p1 = curve.getPoint((t % 1 + 1) % 1);
      packetRef1.current.position.set(p1.x, p1.y, p1.z);
    }
    if (packetRef2.current) {
      const p2 = curve.getPoint(((t + 0.33) % 1 + 1) % 1);
      packetRef2.current.position.set(p2.x, p2.y, p2.z);
    }
    if (packetRef3.current) {
      const p3 = curve.getPoint(((t + 0.66) % 1 + 1) % 1);
      packetRef3.current.position.set(p3.x, p3.y, p3.z);
    }
  });

  return (
    <group>
      {/* 3D Curved Laser Wire */}
      <QuadraticBezierLine
        start={start}
        end={end}
        mid={mid}
        color={hasTraffic ? (isRunning ? '#38bdf8' : '#475569') : '#1e293b'}
        lineWidth={hasTraffic ? (isRunning ? 2.8 : 2.0) : 1.2}
        transparent
        opacity={hasTraffic ? 0.85 : 0.4}
      />

      {/* Animated Flowing Light Packets */}
      {hasTraffic && (
        <>
          <mesh ref={packetRef1}>
            <sphereGeometry args={[0.13, 12, 12]} />
            <meshBasicMaterial color={packetColor} />
          </mesh>
          <mesh ref={packetRef2}>
            <sphereGeometry args={[0.11, 12, 12]} />
            <meshBasicMaterial color={packetColor} />
          </mesh>
          <mesh ref={packetRef3}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshBasicMaterial color={packetColor} />
          </mesh>
        </>
      )}

      {/* 3D Wire Delete / Telemetry Handle */}
      <Html position={mid} center distanceFactor={14}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteEdge(edge.id);
          }}
          title="Click to disconnect wire"
          className="group px-2 py-0.5 rounded-full bg-slate-950/90 hover:bg-rose-950 border border-slate-700 hover:border-rose-500 text-[8px] font-mono text-slate-300 hover:text-rose-200 transition pointer-events-auto flex items-center gap-1 shadow-lg"
        >
          <span>{flow?.flowRps > 0.1 ? `${Math.round(flow.flowRps)}/s` : 'wire'}</span>
          <span className="text-slate-500 group-hover:text-rose-400 font-bold">✕</span>
        </button>
      </Html>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 4. MAIN 3D ARENA SCENE & WEBGL ERROR BOUNDARY
// ---------------------------------------------------------------------------

class WebGLErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.warn('WebGL Rendering Error caught by Arena3D boundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#070a13] text-slate-300 p-6 text-center select-none">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3 shadow-lg">
            ⚠️
          </div>
          <h3 className="text-base font-bold text-white mb-1">WebGL 3D Acceleration Unavailable</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
            Your current browser or headless environment has WebGL hardware acceleration disabled. You can continue playing seamlessly in 2D Tactical Grid mode.
          </p>
          {this.props.onFallbackTo2D && (
            <button
              onClick={this.props.onFallbackTo2D}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg transition active:scale-95"
            >
              Switch to 2D Tactical Grid
            </button>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Arena3D({
  nodes,
  edges,
  evaluation,
  selectedNodeId,
  onSelectNode,
  connectingFromId,
  onStartConnect,
  onCompleteConnect,
  onDeleteEdge,
  isRunning,
  isChaosActive,
  chaosNodeId,
  onFallbackTo2D
}) {
  const controlsRef = useRef();

  return (
    <div className="w-full h-full relative bg-[#070a13] select-none">
      <WebGLErrorBoundary onFallbackTo2D={onFallbackTo2D}>
        {/* 3D Scene Canvas */}
        <Canvas
          camera={{ position: [0, 16, 20], fov: 48, near: 0.1, far: 200 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          shadows
        >
          <color attach="background" args={['#070a13']} />
          <fog attach="fog" args={['#070a13', 25, 75]} />

          {/* Lighting */}
          <ambientLight intensity={0.65} />
          <directionalLight
            position={[12, 22, 10]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[0, 10, 0]} intensity={1.5} color={isChaosActive ? '#ef4444' : '#38bdf8'} />

          {/* Interactive Camera Orbit Controls */}
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping
            dampingFactor={0.06}
            maxPolarAngle={Math.PI / 2.05}
            minDistance={6}
            maxDistance={50}
          />

          {/* Cyberpunk Ground Grid */}
          <Grid
            renderOrder={-1}
            position={[0, -0.02, 0]}
            infiniteGrid
            cellSize={1.5}
            cellThickness={0.8}
            cellColor="#1e293b"
            sectionSize={4.5}
            sectionThickness={1.2}
            sectionColor={isChaosActive ? '#991b1b' : '#38bdf8'}
            fadeDistance={55}
            fadeStrength={1.5}
          />

          {/* Infrastructure Nodes in 3D */}
          {nodes.map((node) => (
            <Node3D
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              stats={evaluation?.nodeStats?.[node.id]}
              onSelectNode={onSelectNode}
              isConnecting={Boolean(connectingFromId)}
              onStartConnect={onStartConnect}
              onCompleteConnect={onCompleteConnect}
              isChaosSabotaged={chaosNodeId === node.id}
            />
          ))}

          {/* Laser Connections in 3D */}
          {edges.map((edge) => {
            const fromNode = nodes.find((n) => n.id === edge.from);
            const toNode = nodes.find((n) => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            return (
              <Edge3D
                key={edge.id}
                edge={edge}
                fromNode={fromNode}
                toNode={toNode}
                flow={evaluation?.edgeFlows?.[edge.id]}
                isRunning={isRunning}
                onDeleteEdge={onDeleteEdge}
              />
            );
          })}
        </Canvas>
      </WebGLErrorBoundary>

      {/* Floating 3D Camera Preset Pills */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 glass-panel p-1 rounded-xl shadow-xl pointer-events-auto">
        <button
          onClick={() => {
            if (controlsRef.current) {
              controlsRef.current.object.position.set(0, 16, 20);
              controlsRef.current.target.set(0, 0, 0);
              controlsRef.current.update();
            }
          }}
          className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-cyan-950/60 text-[11px] font-mono text-cyan-300 border border-cyan-500/20 transition active:scale-95"
          title="Isometric View"
        >
          Isometric
        </button>
        <button
          onClick={() => {
            if (controlsRef.current) {
              controlsRef.current.object.position.set(0, 26, 0.1);
              controlsRef.current.target.set(0, 0, 0);
              controlsRef.current.update();
            }
          }}
          className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-[11px] font-mono text-slate-300 transition active:scale-95"
          title="Tactical Top-Down View"
        >
          Top-Down
        </button>
        <button
          onClick={() => {
            if (controlsRef.current) {
              controlsRef.current.object.position.set(-14, 6, 12);
              controlsRef.current.target.set(0, 0, 0);
              controlsRef.current.update();
            }
          }}
          className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-[11px] font-mono text-slate-300 transition active:scale-95"
          title="Cinematic Front View"
        >
          Cinematic
        </button>
      </div>
    </div>
  );
}
