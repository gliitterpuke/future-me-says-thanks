// Lightweight confetti wrappers. Imported dynamically so canvas-confetti never
// touches the server bundle.

export async function celebratePerfectDay() {
  const confetti = (await import("canvas-confetti")).default;
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.7 },
    colors: ["#e9624a", "#6f9b73", "#e7a93c"],
  });
}

export async function celebrateFinish() {
  const confetti = (await import("canvas-confetti")).default;
  const burst = (originX: number) =>
    confetti({
      particleCount: 140,
      spread: 100,
      startVelocity: 45,
      origin: { x: originX, y: 0.6 },
      colors: ["#e9624a", "#6f9b73", "#e7a93c", "#ffffff"],
    });
  burst(0.2);
  burst(0.5);
  burst(0.8);
}
