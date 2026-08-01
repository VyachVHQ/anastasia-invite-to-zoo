const base = process.env.NEXT_PUBLIC_BASE_PATH || ''

export function asset(path: string): string {
  if (!path) return path
  if (/^(https?:)?\/\//.test(path)) return path
  return base + path
}
