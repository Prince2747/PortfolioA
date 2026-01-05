"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Clone, Environment, useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";
import React, { Suspense, useEffect, useMemo, useRef } from "react";

class ThreeErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function getLegacySRGBEncoding(): number | undefined {
  const maybe = THREE as unknown as { sRGBEncoding?: number };
  return typeof maybe.sRGBEncoding === "number"
    ? maybe.sRGBEncoding
    : undefined;
}

function getCameraFov(camera: THREE.Camera): number {
  return camera instanceof THREE.PerspectiveCamera ? camera.fov : 50;
}

function getScrollProgress(): number {
  if (typeof window === "undefined") return 0;

  const doc = document.documentElement;
  const scrollTop = doc.scrollTop || document.body.scrollTop || 0;
  const scrollRange = (doc.scrollHeight || 0) - window.innerHeight;
  if (scrollRange <= 0) return 0;

  return clamp01(scrollTop / scrollRange);
}

export type ScrollBallOverlayProps = {
  modelUrl?: string;
  progress?: number;
  scaleMin?: number;
  scaleMax?: number;
  tiltX?: number;
  baseRotationY?: number;
  rotationDamping?: number;
  xAmplitude?: number;
  xOffset?: number;
  autoFit?: boolean;
  fitMargin?: number;
  idleWobble?: number;
  idleWobbleSpeed?: number;
  idleYawAmplitude?: number;
  idleYawSpeed?: number;
  tintColor?: string;
  tintStrength?: number;
  metalness?: number;
  roughness?: number;
  emissiveColor?: string;
  emissiveIntensity?: number;
};

function Model({
  modelUrl = "/model.glb",
  progress,
  scaleMin = 1.25,
  scaleMax = 1.25,
  tiltX = -0.35,
  baseRotationY = 0,
  rotationDamping = 10,
  xAmplitude = 1.2,
  xOffset = 0,
  autoFit = true,
  fitMargin = 1.12,
  idleWobble = 0.08,
  idleWobbleSpeed = 0.9,
  idleYawAmplitude = Math.PI / 4, // about 45° swing
  idleYawSpeed = 0.35,
  tintColor = "#111827",
  tintStrength = 0,
  metalness,
  roughness,
  emissiveColor = "#60a5fa",
  emissiveIntensity = 0,
}: ScrollBallOverlayProps) {
  const { scene } = useGLTF(modelUrl);
  const modelRef = useRef<THREE.Group | null>(null);
  const { camera } = useThree();

  const cameraTarget = useMemo(() => new THREE.Vector3(), []);
  const lookAtTarget = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  const fitScaleRef = useRef(1);
  const fitDistanceRef = useRef(4);

  useEffect(() => {
    if (!autoFit) return;

    // Compute a stable bounding sphere and derive:
    // - a scale multiplier (normalizes wildly different authoring units)
    // - a camera distance that frames the model with the current FOV
    const box = new THREE.Box3().setFromObject(scene);
    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);

    const radius = Math.max(0.0001, sphere.radius || 0.0001);

    // Normalize so the model fills more of the frame (less zoomed-out feel).
    fitScaleRef.current = 1.6 / radius;

    const fovRad = THREE.MathUtils.degToRad(getCameraFov(camera));
    const distance =
      (radius / Math.tan(fovRad / 2)) *
      THREE.MathUtils.clamp(fitMargin, 1.05, 2.5);
    fitDistanceRef.current = distance;
  }, [autoFit, camera, fitMargin, scene]);

  useEffect(() => {
    // Do NOT override materials or colors.
    // Only ensure color textures are treated as sRGB so the GLB looks like it did when exported.
    scene.traverse((obj) => {
      if (!(obj as THREE.Object3D & { isMesh?: boolean }).isMesh) return;
      const mesh = obj as THREE.Mesh;
      const material = mesh.material;

      const fixMaterial = (mat: THREE.Material | null | undefined) => {
        if (!mat) return;

        // Avoid mutating shared materials.
        const cloned = mat.clone();

        const clonedWithMaps = cloned as THREE.Material & {
          map?: THREE.Texture | null;
          emissiveMap?: THREE.Texture | null;
        };

        const clonedPbr = cloned as THREE.MeshStandardMaterial;

        // Sketchfab models sometimes store colors in geometry attributes.
        if (mesh.geometry?.attributes?.color) {
          (cloned as THREE.Material & { vertexColors?: boolean }).vertexColors =
            true;
        }

        const maps: Array<THREE.Texture | null | undefined> = [
          clonedWithMaps.map,
          clonedWithMaps.emissiveMap,
        ];
        maps.forEach((tex) => {
          if (!tex) return;
          // three.js r152+: tex.colorSpace, older: tex.encoding
          if ("colorSpace" in tex) {
            (tex as THREE.Texture & { colorSpace?: unknown }).colorSpace =
              THREE.SRGBColorSpace;
          } else if ("encoding" in tex) {
            const enc = getLegacySRGBEncoding();
            if (enc !== undefined) {
              (tex as unknown as { encoding: number }).encoding = enc;
            }
          }
          tex.needsUpdate = true;
        });

        // "Computer" look: dark chassis tint + subtle blue emissive.
        if (tintStrength && tintStrength > 0 && clonedPbr.color) {
          const base = new THREE.Color(clonedPbr.color);
          const tint = new THREE.Color(tintColor);
          clonedPbr.color = base.lerp(
            tint,
            THREE.MathUtils.clamp(tintStrength, 0, 1)
          );
        }

        if (
          typeof clonedPbr.metalness === "number" &&
          metalness !== undefined
        ) {
          clonedPbr.metalness = metalness;
        }
        if (
          typeof clonedPbr.roughness === "number" &&
          roughness !== undefined
        ) {
          clonedPbr.roughness = roughness;
        }

        if (clonedPbr.emissive && emissiveIntensity && emissiveIntensity > 0) {
          clonedPbr.emissive = new THREE.Color(emissiveColor);
          if (typeof clonedPbr.emissiveIntensity === "number") {
            clonedPbr.emissiveIntensity = emissiveIntensity;
          }
        }

        cloned.needsUpdate = true;
        return cloned;
      };

      if (Array.isArray(material)) {
        mesh.material = material.map((m) => fixMaterial(m));
      } else {
        mesh.material = fixMaterial(material);
      }
    });
  }, [
    emissiveColor,
    emissiveIntensity,
    metalness,
    roughness,
    scene,
    tintColor,
    tintStrength,
  ]);

  useFrame((state) => {
    const model = modelRef.current;
    if (!model) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const t = progress ?? getScrollProgress();

    // Animate model position (similar to ball)
    const x = Math.sin(t * Math.PI * 2) * xAmplitude + xOffset;
    const y = THREE.MathUtils.lerp(1.6, -1.6, t);

    model.position.set(
      x,
      y +
        (prefersReducedMotion
          ? 0
          : Math.sin(state.clock.elapsedTime * 1.6) * 0.12),
      0
    );

    // Keep size constant unless you explicitly pass different min/max.
    // (We set min=max from the hero sections to keep it fixed.)
    const baseScale = THREE.MathUtils.lerp(scaleMin, scaleMax, t);
    model.scale.setScalar(baseScale * (autoFit ? fitScaleRef.current : 1));

    // Face user and gently swing ±180° back and forth.
    const yawAmp = prefersReducedMotion
      ? 0
      : THREE.MathUtils.clamp(idleYawAmplitude, 0, Math.PI * 1.1);
    const yaw = yawAmp * Math.sin(state.clock.elapsedTime * idleYawSpeed);
    const targetY = baseRotationY + yaw;
    model.rotation.x = tiltX;
    model.rotation.y = THREE.MathUtils.damp(
      model.rotation.y,
      targetY,
      rotationDamping,
      state.clock.getDelta()
    );
    if (prefersReducedMotion) {
      model.rotation.z = 0;
    } else {
      const wobble = THREE.MathUtils.clamp(idleWobble, 0, 0.35);
      model.rotation.z =
        Math.sin(state.clock.elapsedTime * idleWobbleSpeed) * wobble;
    }

    // Change camera perspective based on scroll
    cameraTarget.set(
      0,
      THREE.MathUtils.lerp(-0.8, 0.8, t),
      autoFit
        ? THREE.MathUtils.lerp(
            fitDistanceRef.current * 1.03,
            fitDistanceRef.current * 0.98,
            t
          )
        : THREE.MathUtils.lerp(4.8, 4.2, t)
    );

    // Smooth the camera movement a bit (avoids jitter when scrolling)
    const smooth = prefersReducedMotion ? 1 : 0.12;
    camera.position.lerp(cameraTarget, smooth);
    lookAtTarget.copy(model.position);
    camera.lookAt(lookAtTarget);
  });

  return (
    <group ref={modelRef}>
      <Center>
        <Clone object={scene} />
      </Center>
    </group>
  );
}

export default function ScrollBallOverlay(props: ScrollBallOverlayProps) {
  return (
    <Canvas
      className="h-full w-full"
      camera={{ position: [0, 0, 4], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        THREE.ColorManagement.enabled = true;
        gl.setClearColor(0x000000, 0);
        // three.js r152+: outputColorSpace, older: outputEncoding
        const renderer = gl as unknown as {
          outputColorSpace?: unknown;
          outputEncoding?: unknown;
          useLegacyLights?: boolean;
        };
        if ("outputColorSpace" in renderer) {
          (renderer as { outputColorSpace?: unknown }).outputColorSpace =
            THREE.SRGBColorSpace;
        } else if ("outputEncoding" in renderer) {
          const enc = getLegacySRGBEncoding();
          if (enc !== undefined) {
            (renderer as unknown as { outputEncoding: number }).outputEncoding =
              enc;
          }
        }
        // Sketchfab-like: filmic tone mapping + IBL environment.
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.0;
        // Keep legacy lights so existing intensities stay visible across three versions.
        if ("useLegacyLights" in renderer) {
          renderer.useLegacyLights = true;
        }
      }}
    >
      <ThreeErrorBoundary>
        <Suspense fallback={null}>
          <Environment preset="studio" />
          <ambientLight intensity={0.6} />
          <directionalLight position={[6, 7, 10]} intensity={1.15} />
          <directionalLight position={[-6, 3, -8]} intensity={0.35} />
          <pointLight
            position={[-8, 6, 10]}
            intensity={0.4}
            color={"#ffffff"}
          />
          <Model {...props} />
        </Suspense>
      </ThreeErrorBoundary>
    </Canvas>
  );
}

useGLTF.preload("/model.glb");
useGLTF.preload("/old_computer/scene.gltf");
