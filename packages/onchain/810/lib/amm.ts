export function calculateProbability(yesPool: number, noPool: number): number {
  if (yesPool === 0 && noPool === 0) return 50;
  return Math.round((yesPool / (yesPool + noPool)) * 100);
}

export function calculateShares(amount: number, probability: number): number {
  return amount / (probability / 100);
}

export function calculatePayout(amount: number, probability: number): number {
  return amount / (probability / 100);
}

export function calculateAttentionValue(socialMetrics: any): number {
  if (!socialMetrics) return 0;
  const { velocity, reposts, sentiment, likes } = socialMetrics;
  // Mock formula for attention value
  return Math.round((velocity * 10) + (reposts * 2) + (likes * 0.5) + (sentiment * 5));
}
