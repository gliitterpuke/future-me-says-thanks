"use client";

import { useEffect, useState } from "react";
import { affirmationForDate } from "@/lib/affirmations";
import { todayKey } from "@/lib/date";

export default function MicroCopy() {
  // Compute after mount so the local date is correct and there's no SSR
  // hydration mismatch.
  const [text, setText] = useState("");
  useEffect(() => {
    setText(affirmationForDate(todayKey()));
  }, []);

  return (
    <p className="mb-4 text-center text-sm italic text-ink/50 transition-opacity duration-500" style={{ opacity: text ? 1 : 0 }}>
      {text || " "}
    </p>
  );
}
