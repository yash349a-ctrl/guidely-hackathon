import { KnowledgeGraph } from "../types";

export const CAREER_TRACKS: Record<string, { title: string; graph: KnowledgeGraph }> = {
  ai_engineer: {
    title: "AI & Machine Learning Engineer",
    graph: {
      nodes: [
        {
          id: "python",
          label: "Python Programming",
          description: "Core syntax, data structures, GIL, and standard libraries.",
          status: "mastered",
          prerequisites: [],
          estimatedHours: 8,
          whyMatters: "Python is the lingua franca of AI, standard for data wrangling, modeling, and deep learning pipelines.",
          whyRecommended: "Your programming fundamentals are confirmed, so this foundational node is unlocked.",
          practiceTask: "Implement a thread-safe custom memoization decorator in Python.",
          project: {
            title: "Async API Request Dispatcher",
            description: "Build a non-blocking asynchronous request dispatcher using asyncio and aiohttp with rate-limiting queues.",
            difficulty: "Medium",
            estimatedHours: 4,
            skills: ["Python AsyncIO", "Iterators", "Decorators"]
          }
        },
        {
          id: "numpy",
          label: "NumPy Vectorization",
          description: "Multidimensional arrays, broadcasting, vectorization, and SIMD hardware speedups.",
          status: "mastered",
          prerequisites: ["python"],
          estimatedHours: 6,
          whyMatters: "NumPy replaces slow Python loops with high-performance vector operations compiled in C.",
          whyRecommended: "Verified in diagnostic. This node is completed, paving the way for multi-dimensional mathematical tensor operations.",
          practiceTask: "Rewrite a complex nested loop calculation into a fully vectorized, single-line NumPy expression utilizing broadcasting.",
          project: {
            title: "Volumetric Image Filter",
            description: "Build an interactive 3D grid voxel rotation and filtering system using purely vectorized array transformations.",
            difficulty: "Medium",
            estimatedHours: 5,
            skills: ["NumPy Arrays", "Broadcasting", "Matrix Manipulation"]
          }
        },
        {
          id: "linear-algebra",
          label: "Linear Algebra Foundations",
          description: "Vector spaces, matrix multiplication, transformation matrices, eigenvectors, and SVD.",
          status: "active",
          prerequisites: ["numpy"],
          estimatedHours: 12,
          whyMatters: "Every neural network layer is a linear transformation. Understanding matrices is critical to debugging layer weight matrices and backpropagation shapes.",
          whyRecommended: "Your diagnostic flagged a matrix operation gap. This is your high-priority immediate bridge concept.",
          practiceTask: "Compute the Singular Value Decomposition (SVD) of a matrix manually and project a 2D dataset onto its first principal component.",
          project: {
            title: "Visual Matrix Transformation Playground",
            description: "An interactive application visualizing how transformations (shearing, scaling, rotating) move spatial vector coordinates.",
            difficulty: "Beginner",
            estimatedHours: 4,
            skills: ["Vector Projection", "Transformation Matrices", "Eigenvalues"]
          }
        },
        {
          id: "statistics",
          label: "Probability & Statistics",
          description: "Probability distributions, Bayes' Theorem, hypothesis testing, MLE, and exploratory data analysis.",
          status: "available",
          prerequisites: ["python"],
          estimatedHours: 10,
          whyMatters: "AI is probabilistic. Loss functions, classification thresholds, and statistical inference are rooted in probability theory.",
          whyRecommended: "Recommended to run in parallel with Linear Algebra to build the mathematical baseline for ML modeling.",
          practiceTask: "Write a script to compute the Maximum Likelihood Estimation (MLE) of parameters for a Normal distribution given a noisy dataset.",
          project: {
            title: "Bayesian Spam Classifier Engine",
            description: "Build a raw text classifier from scratch utilizing Naive Bayes theorem with Laplace smoothing.",
            difficulty: "Medium",
            estimatedHours: 6,
            skills: ["Bayes Theorem", "Probability Distributions", "Feature Extraction"]
          }
        },
        {
          id: "pandas",
          label: "Pandas Data Wrangling",
          description: "Series, DataFrames, indexing, groupings, aggregation, and handling missing datasets.",
          status: "available",
          prerequisites: ["python"],
          estimatedHours: 8,
          whyMatters: "Real-world data is dirty. Mastering Pandas ensures you can clean, parse, merge, and pivot large CSVs or SQL query exports.",
          whyRecommended: "Required for structured feature engineering prior to feeding arrays into Scikit-Learn models.",
          practiceTask: "Merge three disparate dataframes, perform a grouped multi-aggregation, and impute missing data using localized KNN techniques.",
          project: {
            title: "Financial Analytics Ledger Board",
            description: "Build an analytical dashboard that processes streaming tick data, aggregates temporal metrics, and structures historical moving averages.",
            difficulty: "Medium",
            estimatedHours: 5,
            skills: ["Pandas DataFrames", "Grouping", "Rolling Window Aggregates"]
          }
        },
        {
          id: "machine-learning",
          label: "Machine Learning Foundations",
          description: "Supervised & unsupervised learning: Linear/Logistic Regression, Decision Trees, KNN, and Gradient Descent.",
          status: "locked",
          prerequisites: ["linear-algebra", "statistics", "pandas"],
          estimatedHours: 25,
          whyMatters: "Before deep learning, classical ML is the baseline for production. It is cheaper to run, easier to interpret, and highly effective.",
          whyRecommended: "Locked until you complete your Linear Algebra, Statistics, and Pandas mathematical/data prep prerequisites.",
          practiceTask: "Implement Linear Regression from scratch with Batch Gradient Descent, plotting the loss curve converging toward the global minimum.",
          project: {
            title: "Scratch-Built Decision Tree Classifier",
            description: "Build a recursive Decision Tree from scratch using Gini impurity or Shannon entropy, complete with tree-pruning logic.",
            difficulty: "Hard",
            estimatedHours: 12,
            skills: ["Gradient Descent", "Gini Impurity", "Supervised Learning Algorithms"]
          }
        },
        {
          id: "model-evaluation",
          label: "Model Evaluation & Tuning",
          description: "Cross-validation, ROC/AUC, Precision-Recall curves, bias-variance tradeoff, and hyperparameter grids.",
          status: "locked",
          prerequisites: ["machine-learning"],
          estimatedHours: 10,
          whyMatters: "Accuracy is a misleading metric for imbalanced classes. You must understand precision-recall thresholds to optimize for real-world scenarios.",
          whyRecommended: "Required alongside Machine Learning to evaluate models responsibly instead of blindly reporting high accuracy.",
          practiceTask: "Implement a k-fold cross-validation loop manually and plot a Precision-Recall curve for varying classification thresholds.",
          project: {
            title: "Automated Hyperparameter Grid Tuner",
            description: "Build an automated tuning engine that runs parallelized k-fold evaluations over a parameter matrix, producing full contour plots of hyperparameter performance.",
            difficulty: "Medium",
            estimatedHours: 8,
            skills: ["K-Fold Cross Validation", "Grid Search", "Confusion Matrix Metrics"]
          }
        },
        {
          id: "deep-learning",
          label: "Neural Networks & Backprop",
          description: "Perceptrons, dense layers, activation functions, forward propagation, loss, and backpropagation calculations.",
          status: "locked",
          prerequisites: ["machine-learning"],
          estimatedHours: 30,
          whyMatters: "Deep learning powers computer vision, NLP, and reinforcement learning. Knowing how backprop works prevents you from treating neural nets as magic black boxes.",
          whyRecommended: "Advanced mathematical and structural modeling topic. Unlocks once classical ML modeling is mastered.",
          practiceTask: "Implement a simple multi-layer perceptron from scratch, calculating and applying partial derivatives manually for a sigmoid activation.",
          project: {
            title: "Micro-Autograd Engine",
            description: "Build a scalar autograd engine with a PyTorch-like API, constructing a directed acyclic graph (DAG) of operations and running topological backprop.",
            difficulty: "Hard",
            estimatedHours: 15,
            skills: ["Autograd", "Backpropagation", "Computational Graphs"]
          }
        },
        {
          id: "transformers",
          label: "Transformer Architectures",
          description: "Self-attention mechanism, Multi-head attention, encoders, decoders, positional embeddings, and LLM tuning.",
          status: "locked",
          prerequisites: ["deep-learning"],
          estimatedHours: 35,
          whyMatters: "Transformers are the architectural spine of modern generative AI, including GPT-4, Gemini, and stable diffusion models.",
          whyRecommended: "The ultimate peak of the AI Track. Unlocks once deep learning fundamentals and gradient backprop are mastered.",
          practiceTask: "Write a raw multi-head self-attention module in PyTorch, initializing Query, Key, and Value projections and applying scaled dot-product attention.",
          project: {
            title: "NanoGPT: Character-Level Text Generator",
            description: "Build, train, and sample from a tiny character-level GPT transformer model from scratch, trained on a collection of classic literature.",
            difficulty: "Hard",
            estimatedHours: 20,
            skills: ["Self-Attention", "Transformers", "LLM Training Loops", "Generative Sampling"]
          }
        }
      ],
      edges: [
        { source: "python", target: "numpy" },
        { source: "python", target: "statistics" },
        { source: "python", target: "pandas" },
        { source: "numpy", target: "linear-algebra" },
        { source: "linear-algebra", target: "machine-learning" },
        { source: "statistics", target: "machine-learning" },
        { source: "pandas", target: "machine-learning" },
        { source: "machine-learning", target: "model-evaluation" },
        { source: "machine-learning", target: "deep-learning" },
        { source: "deep-learning", target: "transformers" }
      ]
    }
  },
  dsa_prep: {
    title: "Data Structures & Algorithms Mastery",
    graph: {
      nodes: [
        {
          id: "python",
          label: "Language Essentials",
          description: "Understanding pointers, references, memory overhead, and basic complexity (Big-O).",
          status: "mastered",
          prerequisites: [],
          estimatedHours: 6,
          whyMatters: "A programmer must understand how data types are represented in memory and how reference variables function to write efficient algorithms.",
          whyRecommended: "Verified in diagnostic. Unlocks standard algorithmic data structure pipelines.",
          practiceTask: "Implement dynamic array allocation and resize logic manually to understand computational amortized O(1) complexities.",
          project: {
            title: "Time-Complexity Benchmarking Tool",
            description: "Build a framework that automatically runs algorithms at logarithmic scale inputs, benchmarks performance, and renders real-time Big-O curve fitting graphs.",
            difficulty: "Medium",
            estimatedHours: 5,
            skills: ["Algorithm Benchmarking", "Big-O Analysis", "Time/Space Complexity"]
          }
        },
        {
          id: "arrays-lists",
          label: "Arrays & Linked Lists",
          description: "Contiguous arrays, single/double linked lists, node pointers, and traversing algorithms.",
          status: "active",
          prerequisites: ["python"],
          estimatedHours: 10,
          whyMatters: "These are the core linear memory blocks. Mastering node manipulations and list reversals forms the foundation for all pointer-heavy coding interview tasks.",
          whyRecommended: "Your diagnostic showed basic variables verified, but list pointer structures need formal tuning.",
          practiceTask: "Write a function to reverse a singly linked list in-place using O(1) auxiliary memory.",
          project: {
            title: "Interactive Pointer visualizer",
            description: "Create an interactive visual canvas showing nodes and arrows dynamically disconnecting and reattaching during singly and doubly linked list deletions.",
            difficulty: "Beginner",
            estimatedHours: 6,
            skills: ["Pointers", "Singly Linked Lists", "Interactive Visualizers"]
          }
        },
        {
          id: "stacks-queues",
          label: "Stacks, Queues & Hash Maps",
          description: "LIFO/FIFO structures, hashing collisions, bucket sizing, and constant time lookups.",
          status: "available",
          prerequisites: ["arrays-lists"],
          estimatedHours: 12,
          whyMatters: "Hash maps power O(1) searches. Stacks and queues enable depth and breadth-first traversals of nested tree structures.",
          whyRecommended: "Unlocks once basic linear structures are mastered; critical for algorithmic interview preparation.",
          practiceTask: "Build a fully functional LRU (Least Recently Used) Cache from scratch combining a Doubly Linked List and a Hash Map, ensuring O(1) operations.",
          project: {
            title: "Dynamic Syntax Analyzer",
            description: "Develop a nested bracket, HTML tag, and parenthetical syntax linter using custom Stack configurations.",
            difficulty: "Medium",
            estimatedHours: 5,
            skills: ["Stack LIFO", "Hashing", "Parse Tree Compilation"]
          }
        },
        {
          id: "recursion",
          label: "Recursion & Backtracking",
          description: "Base cases, call stack, call trees, state pruning, and depth exploration.",
          status: "locked",
          prerequisites: ["stacks-queues"],
          estimatedHours: 15,
          whyMatters: "Recursive reasoning is vital for parsing trees and graphs. Backtracking solves state-space problems (like Sudoku or N-Queens) via smart branch pruning.",
          whyRecommended: "A major coding interview milestone. Locked until linear and hash configurations are solid.",
          practiceTask: "Implement the N-Queens positioning puzzle, using bitwise array indexing to verify cell availability and prune recursive branches early.",
          project: {
            title: "Sudoku Core Solver Engine",
            description: "Build an optimal Sudoku solving algorithm using depth-first recursive backtracking, displaying real-time statistics of branches examined.",
            difficulty: "Hard",
            estimatedHours: 8,
            skills: ["Recursive Backtracking", "State Pruning", "Call Stack Visualization"]
          }
        },
        {
          id: "trees-graphs",
          label: "Trees & Graph Traversals",
          description: "Binary trees, BSTs, graph representations (adj-matrix/list), DFS, and BFS.",
          status: "locked",
          prerequisites: ["recursion"],
          estimatedHours: 20,
          whyMatters: "Most real-world relational structures are trees or graphs. BFS and DFS are the base operations for pathfinding, dependency resolution, and network connections.",
          whyRecommended: "The heart of technical algorithmics. Unlocked by recursion and queuing concepts.",
          practiceTask: "Write a graph traversal script that finds all strongly connected components in a directed graph using Tarjan's or Kosaraju's algorithm.",
          project: {
            title: "Network Routing Path Navigator",
            description: "Create an interactive graph canvas showing shortest paths routing on a spatial mesh network, utilizing Dijkstra and A* pathfinding.",
            difficulty: "Hard",
            estimatedHours: 12,
            skills: ["Graph BFS/DFS", "Dijkstra Algorithm", "Canvas Pathfinding"]
          }
        }
      ],
      edges: [
        { source: "python", target: "arrays-lists" },
        { source: "arrays-lists", target: "stacks-queues" },
        { source: "stacks-queues", target: "recursion" },
        { source: "recursion", target: "trees-graphs" }
      ]
    }
  },
  full_stack: {
    title: "Full-Stack Web Architect",
    graph: {
      nodes: [
        {
          id: "web-basics",
          label: "Web Basics & DOM",
          description: "Semantic HTML, responsive CSS layouts, Flexbox, Grid, and vanilla JS DOM manipulation.",
          status: "mastered",
          prerequisites: [],
          estimatedHours: 10,
          whyMatters: "The browser interprets HTML and CSS. Mastering layout structures ensures your React apps are highly responsive and accessible.",
          whyRecommended: "Verified in diagnostic. Ready to move onto declarative component architectures.",
          practiceTask: "Implement a layout template using pure CSS Grid and custom responsive media queries without relying on modern frameworks.",
          project: {
            title: "Custom CSS Grid Dashboard Shell",
            description: "Build a modular, zero-framework widget dashboard layout that dynamically reflows and collapses depending on view sizing.",
            difficulty: "Beginner",
            estimatedHours: 4,
            skills: ["CSS Grid", "DOM Events", "Responsive Sizing"]
          }
        },
        {
          id: "react-framework",
          label: "Declarative React & Hooks",
          description: "Components, JSX, virtual DOM, props, state, useEffect, and custom modular hooks.",
          status: "active",
          prerequisites: ["web-basics"],
          estimatedHours: 18,
          whyMatters: "React changed UI development by making state declarative. Understanding rendering cycles prevents infinite loops and unneeded state re-evaluations.",
          whyRecommended: "Claimed experience is strong; however, your diagnostic highlighted rendering reconciliation as an active focus.",
          practiceTask: "Implement a robust custom fetch hook (`useFetch`) with abort controllers, debounce mechanics, and integrated retry logic.",
          project: {
            title: "Modular Productivity Workspace",
            description: "An elegant, interactive workspace app with fluid card re-ordering, rich local state storage, and dynamic custom panels.",
            difficulty: "Medium",
            estimatedHours: 8,
            skills: ["React Hooks", "Custom Event Listeners", "State Synchronization"]
          }
        },
        {
          id: "node-express",
          label: "Node & Express Backend",
          description: "V8 engine, asynchronous I/O, middleware, routers, error handlers, and REST API standards.",
          status: "available",
          prerequisites: ["react-framework"],
          estimatedHours: 15,
          whyMatters: "A client needs a data hub. Node allows Javascript to run server-side, handling disk I/O, authentications, and databases efficiently.",
          whyRecommended: "Essential server connection skill. Unlocks full full-stack data routing operations.",
          practiceTask: "Write a custom Express middleware chain that handles auth token verification, requests logging, and global schema error injection.",
          project: {
            title: "Task Orchestrator API Gateway",
            description: "Build an API gateway that handles request throttling, aggregates data from multiple downstream microservices, and handles failures gracefully.",
            difficulty: "Medium",
            estimatedHours: 10,
            skills: ["Node.js Streams", "Express Routing", "Middleware Architecture"]
          }
        },
        {
          id: "sql-databases",
          label: "SQL Databases & ORMs",
          description: "Relational database models, normalization, indexing, JOINs, transaction logic, and Drizzle/Prisma.",
          status: "locked",
          prerequisites: ["node-express"],
          estimatedHours: 16,
          whyMatters: "Databases hold institutional truth. Standard relational structures are ideal for financial, transactional, and strict schematized data systems.",
          whyRecommended: "Locked until server APIs are implemented; critical for durable persistence layers.",
          practiceTask: "Design a relational schema with proper foreign keys and create a single optimized join query calculating aggregate user metrics.",
          project: {
            title: "E-Commerce Database Schema & API",
            description: "Set up a highly optimized PostgreSQL relational schema via Drizzle ORM, including complex transactions and strict cascade rules on delete.",
            difficulty: "Hard",
            estimatedHours: 12,
            skills: ["SQL Normalization", "Transactions", "Drizzle ORM Integrations"]
          }
        }
      ],
      edges: [
        { source: "web-basics", target: "react-framework" },
        { source: "react-framework", target: "node-express" },
        { source: "node-express", target: "sql-databases" }
      ]
    }
  }
};
