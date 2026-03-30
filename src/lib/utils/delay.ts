/** Ensures a promise takes at least `ms` milliseconds to resolve */
export async function minDelay<T>(promise: Promise<T>, ms = 1000): Promise<T> {
  const [result] = await Promise.all([
    promise,
    new Promise((r) => setTimeout(r, ms)),
  ]);
  return result;
}
