import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Generate position score for ordering leaves
// Uses a gap-based system for easy reordering
export function generatePositionScore(prevScore = 0, nextScore = null) {
  if (nextScore === null) {
    // Adding to the end
    return prevScore + 1000
  }
  // Adding between two items
  return (prevScore + nextScore) / 2
}

// Generate unique slug from title
export function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
