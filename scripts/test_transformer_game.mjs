import assert from 'node:assert';
import {
  dotProduct,
  cosineSimilarity,
  softmax,
  scaledDotProductAttention,
  filterTopP,
  vectorMagnitude
} from '../src/transformerGame/core/vectorMath.js';
import { tokenizeSentence, getPositionalEncoding } from '../src/transformerGame/core/tokenizer.js';
import { TinyTransformer } from '../src/transformerGame/core/tinyTransformer.js';
import { GAME_STAGES } from '../src/transformerGame/core/levelsData.js';

console.log('🧪 Starting Automated Tests for AI / Transformer Game...\n');

// 1. Test Vector Math
console.log('1. Testing Vector Math...');
const a = new Float32Array([1, 2, 3]);
const b = new Float32Array([4, 5, 6]);
const dot = dotProduct(a, b);
assert.strictEqual(dot, 32, 'dotProduct of [1,2,3] and [4,5,6] must be 32');

const cosSimSame = cosineSimilarity(a, a);
assert(Math.abs(cosSimSame - 1.0) < 1e-5, 'Cosine similarity with self must be 1.0');

// Softmax check
const logits = [2.0, 1.0, 0.1];
const probs = softmax(logits, 1.0);
const sumProbs = probs.reduce((acc, p) => acc + p, 0);
assert(Math.abs(sumProbs - 1.0) < 1e-4, 'Softmax probabilities must sum to 1.0');
assert(probs[0] > probs[1] && probs[1] > probs[2], 'Softmax must preserve logit order');
console.log('   ✓ Vector Math Passed!');

// 2. Test Scaled Dot-Product Attention
console.log('2. Testing Scaled Dot-Product Attention...');
const Q = [new Float32Array([1, 0]), new Float32Array([0, 1])];
const K = [new Float32Array([1, 0]), new Float32Array([0, 1])];
const V = [new Float32Array([10, 20]), new Float32Array([30, 40])];
const attnResult = scaledDotProductAttention(Q, K, V, 2);
assert.strictEqual(attnResult.attentionScores.length, 2);
assert.strictEqual(attnResult.output.length, 2);
const rowSum0 = attnResult.attentionScores[0].reduce((acc, v) => acc + v, 0);
assert(Math.abs(rowSum0 - 1.0) < 1e-4, 'Attention score row must sum to 1.0');
console.log('   ✓ Scaled Dot-Product Attention Passed!');

// 3. Test Top-P Nucleus Filtering
console.log('3. Testing Top-P Filtering...');
const rawP = new Float32Array([0.7, 0.2, 0.08, 0.02]);
const filtered = filterTopP(rawP, 0.85); // 0.7 + 0.2 = 0.9 >= 0.85 -> keeps indices 0 and 1
assert(filtered[0] > 0 && filtered[1] > 0, 'Top elements must be kept');
assert.strictEqual(filtered[3], 0, 'Low-probability tail must be zeroed out');
const sumFiltered = filtered.reduce((acc, p) => acc + p, 0);
assert(Math.abs(sumFiltered - 1.0) < 1e-4, 'Filtered top-p probabilities must re-normalize to 1.0');
console.log('   ✓ Top-P Filtering Passed!');

// 4. Test Tokenizer & Positional Encoding
console.log('4. Testing Tokenizer & Positional Encoding...');
const tokens = tokenizeSentence('Robot server crashed because memory overloaded');
assert.strictEqual(tokens.length, 6, 'Must tokenize 6 words');
assert.strictEqual(tokens[0].word, 'Robot');

const pe = getPositionalEncoding(0, 4);
assert.strictEqual(pe.length, 4, 'PE length must equal d_model');
assert(typeof pe[0] === 'number');
console.log('   ✓ Tokenizer & Positional Encoding Passed!');

// 5. Test TinyTransformer Model
console.log('5. Testing TinyTransformer Forward Pass...');
const model = new TinyTransformer({ dModel: 4, numHeads: 2, vocabSize: 20 });
const forward = model.forward(tokens);
assert.strictEqual(forward.tokens.length, 6);
assert.strictEqual(forward.Q.length, 6);
assert.strictEqual(forward.K.length, 6);
assert.strictEqual(forward.V.length, 6);
assert.strictEqual(forward.attentionScores.length, 6);
assert.strictEqual(forward.mlpOutput.length, 6);
console.log('   ✓ TinyTransformer Forward Pass Passed!');

// 6. Test Stages Data
console.log('6. Testing Game Stages Config...');
assert.strictEqual(GAME_STAGES.length, 7, 'Must have exactly 7 stages configured');
GAME_STAGES.forEach((stg, i) => {
  assert(stg.id, `Stage ${i} missing id`);
  assert(stg.title, `Stage ${i} missing title`);
  assert(stg.badge, `Stage ${i} missing badge`);
  assert(stg.learningTakeaway, `Stage ${i} missing learningTakeaway`);
});
console.log('   ✓ Game Stages Data Passed!');

console.log('\n🎉 ALL 6 AUTOMATED TEST SUITES PASSED FLAWLESSLY!');

