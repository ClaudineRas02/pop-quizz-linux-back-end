import { AUTO_ROUND_BUCKETS } from "../../application/constants/round-buckets.js";

export function computeBucketTargets(total) {
  const targets = {};
  let allocated = 0;

  for (const bucket of AUTO_ROUND_BUCKETS) {
    const value = Math.floor(total * bucket.ratio);
    targets[bucket.key] = value;
    allocated += value;
  }

  let remaining = total - allocated;
  const priority = [
    "culture_generale_qcm",
    "linux_qcm",
    "linux_command",
    "linux_combination",
    "linux_fill_blank",
  ];

  while (remaining > 0) {
    for (const key of priority) {
      if (remaining <= 0) break;
      targets[key] += 1;
      remaining -= 1;
    }
  }

  return targets;
}
