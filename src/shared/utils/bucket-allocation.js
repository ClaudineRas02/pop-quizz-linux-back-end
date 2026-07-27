import { AUTO_ROUND_BUCKETS } from "../../application/constants/round-buckets.js";

export function computeBucketTargets(total) {
  const targets = {};
  const priority = ["easy", "medium", "hard"];
  const shouldSeedEachBucket = total >= priority.length;
  const remainingTotal = total - (shouldSeedEachBucket ? priority.length : 0);
  let allocated = 0;

  for (const bucket of AUTO_ROUND_BUCKETS) {
    const value =
      (shouldSeedEachBucket ? 1 : 0) + Math.floor(remainingTotal * bucket.ratio);
    targets[bucket.key] = value;
    allocated += value;
  }

  let remaining = total - allocated;

  while (remaining > 0) {
    for (const key of priority) {
      if (remaining <= 0) break;
      targets[key] += 1;
      remaining -= 1;
    }
  }

  return targets;
}
