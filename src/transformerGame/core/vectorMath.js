/**
 * High-performance pure-JS Vector & Matrix Math for the Transformer Game.
 * Uses Float32Array for speed and precision.
 */

export function createVector(length, fill = 0) {
  const v = new Float32Array(length);
  if (fill !== 0) v.fill(fill);
  return v;
}

export function randomVector(length, scale = 1.0) {
  const v = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    v[i] = (Math.random() * 2 - 1) * scale;
  }
  return v;
}

export function dotProduct(a, b) {
  let sum = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

export function vectorMagnitude(a) {
  return Math.sqrt(dotProduct(a, a));
}

export function normalizeVector(a) {
  const mag = vectorMagnitude(a);
  if (mag === 0) return createVector(a.length);
  const out = new Float32Array(a.length);
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i] / mag;
  }
  return out;
}

export function cosineSimilarity(a, b) {
  const magA = vectorMagnitude(a);
  const magB = vectorMagnitude(b);
  if (magA === 0 || magB === 0) return 0;
  return dotProduct(a, b) / (magA * magB);
}

export function vectorAdd(a, b) {
  const out = new Float32Array(a.length);
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i] + (b[i] || 0);
  }
  return out;
}

export function vectorSubtract(a, b) {
  const out = new Float32Array(a.length);
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i] - (b[i] || 0);
  }
  return out;
}

export function vectorScale(a, s) {
  const out = new Float32Array(a.length);
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i] * s;
  }
  return out;
}

/**
 * Softmax with numerical stability subtraction (max(logits)) and temperature scaling.
 * @param {Array<number>|Float32Array} logits 
 * @param {number} temperature 
 * @returns {Float32Array} probabilities summing to 1.0
 */
export function softmax(logits, temperature = 1.0) {
  const T = Math.max(0.01, temperature);
  const n = logits.length;
  let maxVal = -Infinity;
  for (let i = 0; i < n; i++) {
    if (logits[i] > maxVal) maxVal = logits[i];
  }

  const expVals = new Float32Array(n);
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const val = Math.exp((logits[i] - maxVal) / T);
    expVals[i] = val;
    sum += val;
  }

  if (sum === 0) {
    expVals.fill(1.0 / n);
    return expVals;
  }

  for (let i = 0; i < n; i++) {
    expVals[i] /= sum;
  }
  return expVals;
}

/**
 * Scaled Dot-Product Attention:
 * Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V
 */
export function scaledDotProductAttention(Q, K, V, d_k = 4) {
  const seqLen = Q.length;
  const scale = 1 / Math.sqrt(d_k);
  const attentionScores = [];

  // Q: array of vectors, K: array of vectors
  for (let i = 0; i < seqLen; i++) {
    const row = new Float32Array(seqLen);
    for (let j = 0; j < seqLen; j++) {
      row[j] = dotProduct(Q[i], K[j]) * scale;
    }
    attentionScores.push(softmax(row, 1.0));
  }

  // Multiply attention probabilities by V
  const output = [];
  const dim = V[0].length;
  for (let i = 0; i < seqLen; i++) {
    const outVec = new Float32Array(dim);
    for (let j = 0; j < seqLen; j++) {
      const weight = attentionScores[i][j];
      for (let d = 0; d < dim; d++) {
        outVec[d] += weight * V[j][d];
      }
    }
    output.push(outVec);
  }

  return {
    attentionScores, // seqLen x seqLen matrix
    output           // seqLen x dim
  };
}

/**
 * Top-P (Nucleus) Filtering: keeps only the highest probability tokens
 * whose cumulative sum <= topP, zeroing the rest and re-normalizing.
 */
export function filterTopP(probs, topP = 0.9) {
  const indexed = Array.from(probs).map((p, idx) => ({ p, idx }));
  indexed.sort((a, b) => b.p - a.p);

  let cumSum = 0;
  const filtered = new Float32Array(probs.length);
  let totalRetained = 0;

  for (const item of indexed) {
    filtered[item.idx] = item.p;
    cumSum += item.p;
    totalRetained += item.p;
    if (cumSum >= topP) break;
  }

  // Renormalize
  if (totalRetained > 0) {
    for (let i = 0; i < filtered.length; i++) {
      filtered[i] /= totalRetained;
    }
  }
  return filtered;
}

