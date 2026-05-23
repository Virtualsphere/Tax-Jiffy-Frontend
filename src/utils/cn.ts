/**
 * Lightweight className merger for conditional styles.
 * Add `clsx` + `tailwind-merge` when adopting Tailwind.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
