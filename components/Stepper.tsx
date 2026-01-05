"use client";

import React, {
  Children,
  isValidElement,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

export type StepperProps = {
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  backButtonText?: string;
  nextButtonText?: string;
  hideNextOnLastStep?: boolean;
  children: React.ReactNode;
};

export function Step({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default function Stepper({
  initialStep = 1,
  onStepChange,
  onFinalStepCompleted,
  backButtonText = "Back",
  nextButtonText = "Next",
  hideNextOnLastStep = false,
  children,
}: StepperProps) {
  const steps = useMemo(() => {
    const nodes = Children.toArray(children);
    return nodes.filter((node) => isValidElement(node));
  }, [children]);

  const totalSteps = steps.length;

  const [activeStep, setActiveStep] = useState(() => {
    const safe = Number.isFinite(initialStep) ? Math.floor(initialStep) : 1;
    return Math.min(Math.max(safe, 1), Math.max(totalSteps, 1));
  });

  const [direction, setDirection] = useState(1);

  const goToStep = (nextStep: number) => {
    setActiveStep((prev) => {
      setDirection(nextStep >= prev ? 1 : -1);
      return nextStep;
    });
  };

  useEffect(() => {
    onStepChange?.(activeStep);
  }, [activeStep, onStepChange]);

  const canGoBack = activeStep > 1;
  const isLast = activeStep >= totalSteps;

  const goBack = () => {
    if (!canGoBack) return;
    goToStep(Math.max(1, activeStep - 1));
  };

  const goNext = () => {
    if (totalSteps === 0) return;
    if (isLast) {
      onFinalStepCompleted?.();
      return;
    }
    goToStep(Math.min(totalSteps, activeStep + 1));
  };

  const current = totalSteps > 0 ? steps[activeStep - 1] : null;

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-black/40 p-6 md:p-7 backdrop-blur-2xl backdrop-saturate-150 shadow-lg shadow-black/40">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-zinc-300">
          Step{" "}
          <span className="font-medium text-white">
            {Math.min(activeStep, totalSteps)}
          </span>
          <span className="text-zinc-500">/{totalSteps}</span>
        </div>

        <div className="flex items-center gap-1.5" aria-label="Progress">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === activeStep;
            const isDone = stepNumber < activeStep;
            return (
              <button
                key={stepNumber}
                type="button"
                onClick={() => {
                  goToStep(stepNumber);
                }}
                className={
                  "h-2.5 w-2.5 rounded-full transition " +
                  (isActive
                    ? "bg-white"
                    : isDone
                    ? "bg-white/60"
                    : "bg-white/15 hover:bg-white/25")
                }
                aria-label={`Go to step ${stepNumber}`}
                aria-current={isActive ? "step" : undefined}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-black/30 p-5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 16 * direction, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -16 * direction, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
          >
            {current}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={!canGoBack}
          className={
            "rounded-full px-5 py-2 text-sm font-medium transition ring-1 ring-white/10 " +
            (canGoBack
              ? "bg-white/10 text-white hover:bg-white/15"
              : "bg-white/5 text-white/40 cursor-not-allowed")
          }
        >
          {backButtonText}
        </button>

        {!(hideNextOnLastStep && isLast) ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            {isLast ? "Finish" : nextButtonText}
          </button>
        ) : (
          <span aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
