/**
 * Complete Level & Stage Configurations for ATTENTION! The Transformer Simulator.
 */

export const GAME_STAGES = [
  {
    id: 'stage-1-vectors',
    stageNumber: 1,
    title: 'The Vector Harbor',
    subtitle: 'Word Embeddings & Semantic Geometry',
    badge: 'VECTOR VOYAGER',
    icon: 'Layers',
    accentColor: '#38bdf8', // Sky blue
    story: 'Words are mere strings to humans, but to an AI, they are coordinates in multi-dimensional space! To teach the model what words mean, you must tune their semantic vectors so relationships hold mathematically.',
    missionBrief: 'Solve the famous semantic vector analogy: [King] - [Man] + [Woman] = [?]. Drag the semantic delta vector until your combined coordinate hits the target Queen embedding within a 90% cosine similarity threshold!',
    targetSimilarity: 0.90,
    learningTakeaway: 'In high-dimensional embedding spaces, arithmetic operations preserve semantic concepts like royalty, gender, and verb tense.'
  },
  {
    id: 'stage-2-position',
    stageNumber: 2,
    title: 'Positional Clockwork',
    subtitle: 'Parallel Attention & Sinusoidal Timing',
    badge: 'TEMPORAL TUNER',
    icon: 'Clock',
    accentColor: '#a855f7', // Purple
    story: 'Self-Attention operates on all words at the same instant—it is permutation invariant! Without positional encodings, "Dog bites man" and "Man bites dog" look 100% identical to the network.',
    missionBrief: 'The tokens of an emergency firewall prompt have arrived in scrambled chaos. Adjust the low and high frequency sinusoidal phase dials to inject positional timestamps and lock the sentence into its correct syntactic order.',
    sentence: ['The', 'firewall', 'blocked', 'the', 'malicious', 'exploit'],
    learningTakeaway: 'Transformers use multi-frequency sine and cosine waves so the model can attend to relative token distances without linear sequential recurrence.'
  },
  {
    id: 'stage-3-attention',
    stageNumber: 3,
    title: 'The Q/K/V Spotlight Room',
    subtitle: 'Scaled Dot-Product Self-Attention',
    badge: 'SPOTLIGHT SNIPER',
    icon: 'Zap',
    accentColor: '#eab308', // Amber / Gold
    story: 'Query seeks information. Key advertises content. Value transmits meaning. In the sentence: "The server crashed because it ran out of memory", the pronoun "it" is ambiguous. Does "it" refer to the server or the memory?',
    missionBrief: 'Rotate the Query and Key projection weights for the token "it" to shine an 80%+ attention spotlight beam directly onto "server", passing the Value payload to resolve ambiguity!',
    sentence: ['The', 'server', 'crashed', 'because', 'it', 'ran', 'out', 'of', 'memory'],
    focusTokenIndex: 4, // "it"
    targetTokenIndex: 1, // "server"
    learningTakeaway: 'Self-attention allows every word in a sequence to dynamically look at every other word, weighting relevance through the dot product Q · K^T.'
  },
  {
    id: 'stage-4-multihead',
    stageNumber: 4,
    title: 'Multi-Head Specialization',
    subtitle: 'Dividing Attention Across Syntactic & Semantic Layers',
    badge: 'HEADMASTER AI',
    icon: 'Cpu',
    accentColor: '#ec4899', // Pink
    story: 'A single attention head can only focus on one relationship at a time. State-of-the-art models like GPT-4 deploy 96 parallel attention heads, each developing its own linguistic superpower!',
    missionBrief: 'Configure 3 specialized attention heads simultaneously: Head 1 (Syntax Linker: verbs to subjects), Head 2 (Coreference Resolver: pronouns to nouns), and Head 3 (Induction Head: detecting repetitive patterns). Achieve 85%+ total network cohesion.',
    sentence: ['Ada', 'trained', 'the', 'neural', 'net', 'and', 'she', 'deployed', 'it'],
    learningTakeaway: 'Multi-head attention projects embeddings into multiple distinct subspaces simultaneously, allowing the model to track grammar, coreference, and facts concurrently.'
  },
  {
    id: 'stage-5-losscanyon',
    stageNumber: 5,
    title: 'The Loss Canyon',
    subtitle: 'Gradient Descent, Learning Rate & Exploding Gradients',
    badge: 'GRADIENT NAVIGATOR',
    icon: 'Flame',
    accentColor: '#f97316', // Orange
    story: 'Backpropagation computes the slope of the loss function. You must roll the model weights down a treacherous 3D loss mountain into the global minimum valley without falling into local minima or blowing up your GPUs!',
    missionBrief: 'Tune the Learning Rate (η) and Momentum (β). If your learning rate is too high, gradients explode and loss reaches NaN (GPU Fire!). If too low, training stalls. Reach loss < 0.05 within 35 epochs.',
    learningTakeaway: 'Learning rate schedules, momentum, and gradient clipping are essential to prevent catastrophic divergence during large model training.'
  },
  {
    id: 'stage-6-temperature',
    stageNumber: 6,
    title: 'The Generation Forge',
    subtitle: 'Logits, Softmax & Temperature Sampling',
    badge: 'ORACLE WHISPERER',
    icon: 'Sparkles',
    accentColor: '#10b981', // Emerald
    story: 'The final layer outputs raw unnormalized logit numbers. Softmax transforms them into probabilities. Now comes the magical dial: Temperature! How creative—or hallucinatory—should your model be?',
    missionBrief: 'Experiment with Temperature (T) and Top-P (Nucleus) filtering. Observe how T=0.1 produces robotic loops, T=2.5 produces chaotic gibberish, and T=0.7 crafts poetic, coherent completions. Generate 3 consecutive high-quality completions to graduate.',
    learningTakeaway: 'Temperature divides logits before Softmax: higher temperature flattens probability peaks (more surprise), while lower temperature sharpens the top choice.'
  },
  {
    id: 'stage-7-sandbox',
    stageNumber: 7,
    title: 'The Master LLM Sandbox',
    subtitle: 'Live Interactive Transformer Playground',
    badge: 'FRONTIER ARCHITECT',
    icon: 'Terminal',
    accentColor: '#06b6d4', // Cyan
    story: 'Welcome to the complete, unlocked Transformer Architecture Studio! You have mastered all components of the modern AI revolution.',
    missionBrief: 'Type custom prompts, inspect live NxN attention heatmaps, scrub forward passes step-by-step, inspect Q/K/V vectors, and observe token generation in real time!',
    learningTakeaway: 'Transformers are the unified engine behind modern LLMs, vision transformers (ViT), code synthesis, and multimodal AI.'
  }
];

