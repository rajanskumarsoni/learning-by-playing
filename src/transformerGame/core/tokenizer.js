/**
 * Tokenizer & Positional Encoding utilities.
 */

// Educational vocabulary with pre-defined semantic embedding coordinates (2D & 4D)
export const VOCABULARY = [
  { id: 0, text: '<PAD>', vec: [0.0, 0.0, 0.0, 0.0], category: 'special' },
  { id: 1, text: '<BOS>', vec: [0.1, 0.1, 0.1, 0.1], category: 'special' },
  { id: 2, text: '<EOS>', vec: [0.9, 0.9, 0.9, 0.9], category: 'special' },
  { id: 3, text: 'King', vec: [0.82, 0.74, 0.9, 0.1], category: 'royalty' },
  { id: 4, text: 'Queen', vec: [0.32, 0.72, 0.88, 0.85], category: 'royalty' },
  { id: 5, text: 'Man', vec: [0.78, 0.22, 0.1, 0.1], category: 'gender' },
  { id: 6, text: 'Woman', vec: [0.28, 0.20, 0.1, 0.85], category: 'gender' },
  { id: 7, text: 'Prince', vec: [0.70, 0.55, 0.6, 0.1], category: 'royalty' },
  { id: 8, text: 'Princess', vec: [0.25, 0.53, 0.6, 0.85], category: 'royalty' },
  { id: 9, text: 'Cat', vec: [-0.60, 0.70, 0.1, 0.3], category: 'animal' },
  { id: 10, text: 'Dog', vec: [-0.65, 0.65, 0.2, 0.1], category: 'animal' },
  { id: 11, text: 'Robot', vec: [0.10, -0.75, 0.8, 0.0], category: 'tech' },
  { id: 12, text: 'Server', vec: [0.20, -0.80, 0.9, 0.0], category: 'tech' },
  { id: 13, text: 'Memory', vec: [0.15, -0.60, 0.7, 0.0], category: 'tech' },
  { id: 14, text: 'crashed', vec: [0.30, -0.40, -0.5, 0.0], category: 'action' },
  { id: 15, text: 'because', vec: [-0.10, -0.10, 0.0, 0.0], category: 'syntax' },
  { id: 16, text: 'it', vec: [0.05, -0.05, 0.0, 0.0], category: 'pronoun' },
  { id: 17, text: 'the', vec: [-0.05, 0.00, 0.0, 0.0], category: 'syntax' },
  { id: 18, text: 'fast', vec: [0.45, 0.35, 0.5, 0.0], category: 'attribute' },
  { id: 19, text: 'smart', vec: [0.55, 0.65, 0.6, 0.0], category: 'attribute' },
];

/**
 * Computes standard Transformer Positional Encoding using sine and cosine waves:
 * PE(pos, 2i)   = sin(pos / 10000^(2i/d_model))
 * PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
 */
export function getPositionalEncoding(pos, d_model = 4, frequencyScale = 1.0) {
  const pe = new Float32Array(d_model);
  for (let i = 0; i < d_model; i += 2) {
    const denom = Math.pow(10000, (2 * i) / d_model) / frequencyScale;
    pe[i] = Math.sin(pos / denom);
    if (i + 1 < d_model) {
      pe[i + 1] = Math.cos(pos / denom);
    }
  }
  return pe;
}

/**
 * Splits sentence into educational tokens.
 */
export function tokenizeSentence(sentence) {
  const rawWords = sentence.trim().split(/\s+/);
  return rawWords.map((word, idx) => {
    const clean = word.replace(/[^a-zA-Z0-9<>]/g, '');
    const vocabMatch = VOCABULARY.find(
      v => v.text.toLowerCase() === clean.toLowerCase()
    );
    const baseVec = vocabMatch ? vocabMatch.vec : [
      (Math.sin(idx * 1.5) * 0.5),
      (Math.cos(idx * 2.1) * 0.5),
      0.2,
      0.1
    ];
    return {
      index: idx,
      word,
      clean,
      id: vocabMatch ? vocabMatch.id : 999 + idx,
      embedding: new Float32Array(baseVec),
      category: vocabMatch ? vocabMatch.category : 'word'
    };
  });
}

