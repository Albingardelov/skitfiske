/** Extraherar läsbart fel från Supabase/PostgREST (och generiska Error). */
export function supabaseErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const m = (error as { message?: string }).message;
    if (typeof m === 'string' && m.trim().length > 0) return m.trim();
  }
  if (error instanceof Error && error.message.trim()) return error.message.trim();
  return fallback;
}
