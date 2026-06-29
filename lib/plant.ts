// A little plant that grows with your perfect-day streak and wilts if you let
// it lapse. Purely a cute reflection of `currentStreak`.

export interface Plant {
  emoji: string;
  title: string;
  blurb: string;
}

export function plantFor(
  streak: number,
  finished: boolean,
  everActive: boolean,
): Plant {
  if (finished) {
    return {
      emoji: "🌳",
      title: "Fully grown",
      blurb: "30 days done. Future you says thanks 💚",
    };
  }
  if (streak >= 21)
    return { emoji: "🌸", title: "In full bloom", blurb: `${streak}-day streak — unreal.` };
  if (streak >= 14)
    return { emoji: "🌻", title: "Flowering", blurb: `${streak} perfect days running.` };
  if (streak >= 9)
    return { emoji: "🌷", title: "Budding", blurb: `${streak}-day streak. Keep going!` };
  if (streak >= 5)
    return { emoji: "🪴", title: "Thriving", blurb: `${streak} days strong.` };
  if (streak >= 3)
    return { emoji: "🌿", title: "Leafing out", blurb: `${streak}-day streak — nice.` };
  if (streak >= 1)
    return { emoji: "🌱", title: "Sprouting", blurb: "A perfect day! Water it again tomorrow." };
  if (everActive)
    return { emoji: "🥀", title: "Wilting", blurb: "Needs water — log a perfect 3/3 day." };
  return { emoji: "🌰", title: "Just a seed", blurb: "Hit 3/3 today to make it sprout." };
}
