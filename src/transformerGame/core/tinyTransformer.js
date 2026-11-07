/**
 * TinyTransformer: A genuine, lightweight Transformer Forward-Pass Simulator.
 * Runs 100% in pure client-side JavaScript with full inspectability.
 */
import { dotProduct, softmax, scaledDotProductAttention } from './vectorMath.js';
import { getPositionalEncoding } from './tokenizer.js';

export class TinyTransformer {
  constructor(config = {}) {
    this.dModel = config.dModel || 4;
    this.numHeads = config.numHeads || 2;
    this.headDim = this.dModel / this.numHeads;
    this.vocabSize = config.vocabSize || 20;

    // Head projection matrices
    this.wq = this.initMatrix(this.dModel, this.dModel, 0.4);
    this.wk = this.initMatrix(this.dModel, this.dModel, 0.4);
    this.wv = this.initMatrix(this.dModel, this.dModel, 0.4);
    this.wo = this.initMatrix(this.dModel, this.dModel, 0.4);

    // MLP layers
    this.w1 = this.initMatrix(this.dModel, this.dModel * 2, 0.3);
    this.w2 = this.initMatrix(this.dModel * 2, this.dModel, 0.3);
  }

  initMatrix(rows, cols, scale = 0.5) {
    const mat = [];
    for (let r = 0; r < rows; r++) {
      const row = new Float32Array(cols);
      for (let c = 0; c < cols; c++) {
        row[c] = (Math.random() * 2 - 1) * scale;
      }
      mat.push(row);
    }
    return mat;
  }

  matVecMul(mat, vec) {
    const rows = mat.length;
    const cols = mat[0].length;
    const out = new Float32Array(cols);
    for (let c = 0; c < cols; c++) {
      let sum = 0;
      for (let r = 0; r < rows; r++) {
        sum += mat[r][c] * (vec[r] || 0);
      }
      out[c] = sum;
    }
    return out;
  }

  relu(vec) {
    const out = new Float32Array(vec.length);
    for (let i = 0; i < vec.length; i++) {
      out[i] = Math.max(0, vec[i]);
    }
    return out;
  }

  layerNorm(vec) {
    let mean = 0;
    for (let i = 0; i < vec.length; i++) mean += vec[i];
    mean /= vec.length;

    let variance = 0;
    for (let i = 0; i < vec.length; i++) variance += Math.pow(vec[i] - mean, 2);
    variance /= vec.length;
    const std = Math.sqrt(variance + 1e-5);

    const out = new Float32Array(vec.length);
    for (let i = 0; i < vec.length; i++) {
      out[i] = (vec[i] - mean) / std;
    }
    return out;
  }

  /**
   * Complete Forward Pass through 1 Transformer Block.
   * Returns intermediate activations for visual rendering in the game!
   */
  forward(tokens, customParams = {}) {
    const seqLen = tokens.length;
    const embeddingsWithPE = tokens.map((t, idx) => {
      const pe = getPositionalEncoding(idx, this.dModel);
      const combined = new Float32Array(this.dModel);
      for (let i = 0; i < this.dModel; i++) {
        combined[i] = (t.embedding[i] || 0) + pe[i];
      }
      return combined;
    });

    // Compute Q, K, V for each token
    const Q = embeddingsWithPE.map(x => this.matVecMul(customParams.wq || this.wq, x));
    const K = embeddingsWithPE.map(x => this.matVecMul(customParams.wk || this.wk, x));
    const V = embeddingsWithPE.map(x => this.matVecMul(customParams.wv || this.wv, x));

    // Multi-head attention result
    const { attentionScores, output: attnOutput } = scaledDotProductAttention(Q, K, V, this.headDim);

    // Residual Connection 1 & LayerNorm
    const postAttnNorm = [];
    for (let i = 0; i < seqLen; i++) {
      const res = new Float32Array(this.dModel);
      for (let d = 0; d < this.dModel; d++) {
        res[d] = embeddingsWithPE[i][d] + attnOutput[i][d];
      }
      postAttnNorm.push(this.layerNorm(res));
    }

    // Feed-Forward MLP
    const mlpOutput = [];
    for (let i = 0; i < seqLen; i++) {
      const h1 = this.relu(this.matVecMul(this.w1, postAttnNorm[i]));
      const h2 = this.matVecMul(this.w2, h1);
      const res2 = new Float32Array(this.dModel);
      for (let d = 0; d < this.dModel; d++) {
        res2[d] = postAttnNorm[i][d] + h2[d];
      }
      mlpOutput.push(this.layerNorm(res2));
    }

    return {
      tokens,
      embeddingsWithPE,
      Q,
      K,
      V,
      attentionScores,
      attnOutput,
      mlpOutput
    };
  }
}

