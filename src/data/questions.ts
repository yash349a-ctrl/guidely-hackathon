import { Question } from "../types";

export const QUESTION_BANK: Question[] = [
  {
    id: "python_1",
    skill: "Python",
    concept: "Generator Expressions",
    question: "Which of the following expressions creates a generator object rather than a list in memory?",
    options: [
      "(x * 2 for x in range(1000))",
      "[x * 2 for x in range(1000)]",
      "{x: x * 2 for x in range(1000)}",
      "generator(x * 2 for x in range(1000))"
    ],
    correctAnswer: 0,
    difficulty: "Medium"
  },
  {
    id: "python_2",
    skill: "Python",
    concept: "GIL & Parallelism",
    question: "How does the Python Global Interpreter Lock (GIL) impact multi-threaded CPU-bound execution?",
    options: [
      "It allows threads to run in parallel on multiple cores concurrently.",
      "It restricts execution to one thread at a time, limiting speedup for CPU-bound tasks.",
      "It disables the garbage collector for threaded operations.",
      "It automatically speeds up file system and network operations by bypassing the OS."
    ],
    correctAnswer: 1,
    difficulty: "Hard"
  },
  {
    id: "numpy_1",
    skill: "NumPy",
    concept: "Array Broadcasting",
    question: "In NumPy, what happens if you attempt an element-wise operation between an array of shape (3, 4) and an array of shape (3, 1)?",
    options: [
      "It throws a ValueError because dimensions are not identical.",
      "The (3, 1) array is 'broadcast' across the second dimension, duplicating columns to match (3, 4).",
      "Both arrays are flattened and concatenated into a single array.",
      "The operation is only performed on the first element of each row."
    ],
    correctAnswer: 1,
    difficulty: "Medium"
  },
  {
    id: "numpy_2",
    skill: "NumPy",
    concept: "Vectorized Computations",
    question: "Why are vectorized operations in NumPy significantly faster than standard Python loops?",
    options: [
      "Because they compile Python code into JavaScript in real time.",
      "Because they are written in C, bypassing Python interpreter overhead and leveraging contiguous memory and SIMD hardware.",
      "Because they disable all runtime safety and error checking.",
      "Because they run automatically on the GPU if one is connected without any library setup."
    ],
    correctAnswer: 1,
    difficulty: "Medium"
  },
  {
    id: "dsa_1",
    skill: "DSA",
    concept: "Binary Search Tree worst-case",
    question: "What is the worst-case time complexity of inserting a key into a standard Binary Search Tree (BST) without self-balancing mechanisms?",
    options: [
      "O(1)",
      "O(log N)",
      "O(N)",
      "O(N log N)"
    ],
    correctAnswer: 2,
    difficulty: "Medium"
  },
  {
    id: "dsa_2",
    skill: "DSA",
    concept: "Breadth-First Search queue",
    question: "Which data structure is the standard choice for implementing Breadth-First Search (BFS) on a graph?",
    options: [
      "Stack",
      "Queue",
      "Priority Queue",
      "Hash Map"
    ],
    correctAnswer: 1,
    difficulty: "Easy"
  },
  {
    id: "sql_1",
    skill: "SQL",
    concept: "Joins vs Outer Joins",
    question: "What is the primary difference between an INNER JOIN and a LEFT OUTER JOIN?",
    options: [
      "INNER JOIN returns only matching rows; LEFT OUTER JOIN returns all rows from the left table and matching rows from the right table, filling with NULL where unmatched.",
      "LEFT OUTER JOIN returns only non-matching rows, discarding duplicates.",
      "INNER JOIN always requires indexes to be set up on the join key; LEFT OUTER JOIN does not.",
      "There is no difference in correctness, only in the database query optimization engine."
    ],
    correctAnswer: 0,
    difficulty: "Easy"
  },
  {
    id: "sql_2",
    skill: "SQL",
    concept: "Indexes and Performance",
    question: "How does creating an index on a table column affect database operations?",
    options: [
      "It speeds up queries (SELECT) on that column but can slow down write operations (INSERT, UPDATE, DELETE).",
      "It speeds up write operations but slows down read queries.",
      "It encrypts the column data to satisfy standard GDPR compliance requirements.",
      "It reduces the physical space of the database on disk."
    ],
    correctAnswer: 0,
    difficulty: "Medium"
  },
  {
    id: "ml_1",
    skill: "Machine Learning",
    concept: "Regularization side-effects",
    question: "Adding an L1 regularization term (Lasso) to a linear loss function typically has what effect on weight coefficients?",
    options: [
      "It pushes all weights toward infinity.",
      "It encourages weights to be highly dense and non-zero.",
      "It induces sparsity, driving some coefficients to exactly zero, effectively performing feature selection.",
      "It automatically converts the linear regression into a logistic classifier."
    ],
    correctAnswer: 2,
    difficulty: "Medium"
  },
  {
    id: "ml_2",
    skill: "Machine Learning",
    concept: "Matrix transformations & gradient shapes",
    question: "In a fully connected deep learning layer, if input matrix X has shape (M, D) and weight matrix W has shape (D, H), what is the exact shape of the weight gradient dW during backpropagation?",
    options: [
      "(M, H)",
      "(D, H)",
      "(M, D)",
      "(H, D)"
    ],
    correctAnswer: 1,
    difficulty: "Hard"
  },
  {
    id: "web_1",
    skill: "Web Development",
    concept: "React key prop",
    question: "What is the main purpose of the 'key' prop when rendering list elements in React?",
    options: [
      "To associate security keys with sensitive user fields.",
      "To help React identify which elements have changed, been added, or been removed, optimizing Virtual DOM reconciliation.",
      "To enable standard CSS transitions in older web browsers.",
      "To automatically store list elements in the browser's localStorage."
    ],
    correctAnswer: 1,
    difficulty: "Easy"
  },
  {
    id: "ai_1",
    skill: "AI Fundamentals",
    concept: "Self-Attention queries",
    question: "In the multi-head self-attention mechanism of a Transformer, what are the three projection vectors calculated for each token?",
    options: [
      "Weights, Biases, Gradients",
      "Queries, Keys, Values",
      "Synthesizer, Predictor, Corrector",
      "Tokens, Vectors, Matrices"
    ],
    correctAnswer: 1,
    difficulty: "Hard"
  }
];
