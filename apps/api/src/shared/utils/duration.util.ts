export const millisecondsToString = (durationMs: number): string => {
  if (durationMs < 1000) return `${durationMs}ms`;
  if (durationMs < 60_000) return `${(durationMs / 1000).toFixed(2)}s`;

  const minutes = Math.floor(durationMs / 60_000);
  const seconds = Math.floor((durationMs % 60_000) / 1000);

  return `${minutes}m${seconds}s`;
};
