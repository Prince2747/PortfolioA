"use client";

import { useEffect, useRef } from "react";

export type BeamsProps = {
  beamWidth?: number;
  beamHeight?: number;
  beamNumber?: number;
  lightColor?: string;
  speed?: number;
  noiseIntensity?: number;
  scale?: number;
  rotation?: number;
};

type Beam = {
  x: number;
  y: number;
  drift: number;
  speedMultiplier: number;
  widthMultiplier: number;
  heightMultiplier: number;
};

const DEFAULTS: Required<BeamsProps> = {
  beamWidth: 2,
  beamHeight: 15,
  beamNumber: 10,
  lightColor: "#ffffff",
  speed: 1.5,
  noiseIntensity: 1.25,
  scale: 0.2,
  rotation: 0,
};

function createBeams(count: number): Beam[] {
  return Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    drift: Math.random() * Math.PI * 2,
    speedMultiplier: 0.6 + Math.random() * 0.8,
    widthMultiplier: 0.6 + Math.random() * 0.8,
    heightMultiplier: 0.8 + Math.random() * 0.8,
  }));
}

export default function Beams(props: BeamsProps) {
  const {
    beamWidth = DEFAULTS.beamWidth,
    beamHeight = DEFAULTS.beamHeight,
    beamNumber = DEFAULTS.beamNumber,
    lightColor = DEFAULTS.lightColor,
    speed = DEFAULTS.speed,
    noiseIntensity = DEFAULTS.noiseIntensity,
    scale = DEFAULTS.scale,
    rotation = DEFAULTS.rotation,
  } = props;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    const beams = createBeams(beamNumber);
    const state = { width: 0, height: 0, dpr: 1 };
    const rotationRadians = (rotation * Math.PI) / 180;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      state.width = rect.width;
      state.height = rect.height;
      state.dpr = dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handleResize = () => resize();
    resize();
    window.addEventListener("resize", handleResize);

    const draw = (time: number) => {
      const { width, height } = state;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      beams.forEach((beam) => {
        const w = beamWidth * beam.widthMultiplier;
        const h = beamHeight * beam.heightMultiplier * (1 + scale);
        const x = beam.x * width;
        const baseY = beam.y * height;
        const wobble =
          Math.sin(time * 0.001 + beam.drift) * noiseIntensity * 10;
        const y =
          ((baseY + (time * 0.05 * speed + wobble) * beam.speedMultiplier) %
            (height + h)) -
          h;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotationRadians);

        const gradient = ctx.createLinearGradient(0, -h, 0, h);
        gradient.addColorStop(0, `${lightColor}00`);
        gradient.addColorStop(0.5, `${lightColor}40`);
        gradient.addColorStop(1, `${lightColor}cc`);
        ctx.fillStyle = gradient;
        ctx.fillRect(-w / 2, -h, w, h * 2);

        ctx.restore();
      });

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, [
    beamHeight,
    beamNumber,
    beamWidth,
    lightColor,
    noiseIntensity,
    rotation,
    scale,
    speed,
  ]);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
