// Pickable emoji avatars for the group.
export const AVATARS = [
  "🍑", "🍓", "🍒", "🥑", "🍄", "🌶️",
  "🐱", "🐶", "🦊", "🐼", "🐸", "🐥",
  "🦋", "🐝", "🐢", "🦄", "🐙", "🦔",
];

export const DEFAULT_AVATAR = "🌟";

export function avatarOrDefault(a?: string | null): string {
  return a && a.trim() ? a : DEFAULT_AVATAR;
}
