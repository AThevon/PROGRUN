/** Number of full weeks elapsed since planStartDate (1-based). */
export function currentWeekNum(planStartDate: string): number {
  const start = new Date(planStartDate);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return Math.max(1, Math.floor(diffDays / 7) + 1);
}
