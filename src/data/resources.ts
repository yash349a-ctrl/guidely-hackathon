import { LearningResource } from "../types";

export const CURATED_RESOURCES: LearningResource[] = [
  // Python Fundamentals
  {
    id: "py_res_1",
    conceptId: "python",
    title: "Python for Beginners - Full Video Course",
    provider: "freeCodeCamp",
    type: "video",
    difficulty: "Beginner",
    description: "An intensive 4-hour video course covering variables, loops, lists, dictionaries, and basic OOP principles.",
    url: "https://www.youtube.com/watch?v=rfscVS0vtbw"
  },
  {
    id: "py_res_2",
    conceptId: "python",
    title: "The Official Python Tutorial",
    provider: "Python Software Foundation",
    type: "documentation",
    difficulty: "Beginner",
    description: "The gold standard tutorial straight from Python creators. Excellent for mastering standard types, scoping, and modules.",
    url: "https://docs.python.org/3/tutorial/index.html"
  },
  {
    id: "py_res_3",
    conceptId: "python",
    title: "Interactive Python Practice Challenges",
    provider: "Exercism",
    type: "practice",
    difficulty: "Intermediate",
    description: "Complete hands-on coding exercises with real mentor feedback to perfect your syntax and functional coding style.",
    url: "https://exercism.org/tracks/python"
  },

  // NumPy
  {
    id: "np_res_1",
    conceptId: "numpy",
    title: "NumPy Absolute Beginner Guide",
    provider: "NumPy.org",
    type: "documentation",
    difficulty: "Beginner",
    description: "Official guide on vector creation, indexing, slicing, reshaping, and mathematical functions.",
    url: "https://numpy.org/doc/stable/user/absolute_beginners.html"
  },
  {
    id: "np_res_2",
    conceptId: "numpy",
    title: "NumPy Vectorization & Broadcasting Explained",
    provider: "Real Python",
    type: "article",
    difficulty: "Intermediate",
    description: "Deep dive into array operations, shape compatibility rules, and memory-layout tricks for speed.",
    url: "https://realpython.com/numpy-array-programming/"
  },

  // Linear Algebra
  {
    id: "la_res_1",
    conceptId: "linear-algebra",
    title: "Essence of Linear Algebra Series",
    provider: "3Blue1Brown",
    type: "video",
    difficulty: "Beginner",
    description: "A visually mesmerizing video playlist explaining vectors, matrices, determinants, and linear transformations geometrically.",
    url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab"
  },
  {
    id: "la_res_2",
    conceptId: "linear-algebra",
    title: "Linear Algebra for Machine Learning Course",
    provider: "Immersive Math",
    type: "article",
    difficulty: "Intermediate",
    description: "An interactive digital book with fully manipulable 3D diagrams of projections, eigenvectors, and transformations.",
    url: "http://immersivemath.com/ila/index.html"
  },
  {
    id: "la_res_3",
    conceptId: "linear-algebra",
    title: "Eigenvalues and Eigenvectors Practice",
    provider: "Khan Academy",
    type: "practice",
    difficulty: "Intermediate",
    description: "Hands-on quizzes with step-by-step math breakdowns to cement your understanding of linear systems.",
    url: "https://www.khanacademy.org/math/linear-algebra"
  },

  // Statistics
  {
    id: "stat_res_1",
    conceptId: "statistics",
    title: "Probability & Statistics Concept Map",
    provider: "Seeing Theory (Brown University)",
    type: "video",
    difficulty: "Beginner",
    description: "A beautiful interactive visualization project mapping probability distributions, expectation, and inference.",
    url: "https://seeing-theory.brown.edu/"
  },
  {
    id: "stat_res_2",
    conceptId: "statistics",
    title: "Practical Statistics for Data Scientists",
    provider: "O'Reilly Media",
    type: "documentation",
    difficulty: "Intermediate",
    description: "Reference manual focusing on exploratory data analysis, sampling, A/B testing, and regression assumptions.",
    url: "https://github.com/gedeck/practical-statistics-for-data-scientists"
  },

  // Machine Learning Foundations
  {
    id: "ml_res_1",
    conceptId: "machine-learning",
    title: "Machine Learning Specialization",
    provider: "Andrew Ng / Stanford",
    type: "video",
    difficulty: "Beginner",
    description: "The world's most popular intro course covering supervised learning, logistic regression, gradient descent, and cost functions.",
    url: "https://www.coursera.org/specializations/machine-learning-introduction"
  },
  {
    id: "ml_res_2",
    conceptId: "machine-learning",
    title: "Scikit-Learn Official User Guide",
    provider: "Scikit-Learn Core Team",
    type: "documentation",
    difficulty: "Intermediate",
    description: "Comprehensive API reference and code examples demonstrating model pipelines, cross-validation, and hyperparameter tuning.",
    url: "https://scikit-learn.org/stable/user_guide.html"
  },
  {
    id: "ml_res_3",
    conceptId: "machine-learning",
    title: "Kangaroo Regression & Classification Scenarios",
    provider: "Kaggle",
    type: "practice",
    difficulty: "Intermediate",
    description: "Real-world dataset competitions to practice preprocessing, model selection, and score evaluation.",
    url: "https://www.kaggle.com/code"
  },

  // Model Evaluation & Metrics
  {
    id: "me_res_1",
    conceptId: "model-evaluation",
    title: "ROC, AUC, and Confusion Matrices Explained",
    provider: "StatQuest with Josh Starmer",
    type: "video",
    difficulty: "Beginner",
    description: "Incredibly accessible breakdowns of precision, recall, F1, sensitivity, and specificity without heavy jargon.",
    url: "https://www.youtube.com/watch?v=4jRBRDbJemM"
  },

  // Deep Learning
  {
    id: "dl_res_1",
    conceptId: "deep-learning",
    title: "Neural Networks & Backpropagation In-Depth",
    provider: "Andrej Karpathy",
    type: "video",
    difficulty: "Advanced",
    description: "Build micrograd from scratch, implementing custom tensor variables and backpropagation step-by-step. Absolutely essential video.",
    url: "https://www.youtube.com/watch?v=VMj-3S1tku0"
  },
  {
    id: "dl_res_2",
    conceptId: "deep-learning",
    title: "PyTorch Deep Learning Fundamentals",
    provider: "LearnPyTorch.io",
    type: "documentation",
    difficulty: "Intermediate",
    description: "Hands-on guide teaching tensor operations, neural network layer setups, training loops, and loss convergence.",
    url: "https://learnpytorch.io/"
  },

  // Transformers
  {
    id: "tf_res_1",
    conceptId: "transformers",
    title: "Illustrated Transformer Guide",
    provider: "Jay Alammar",
    type: "article",
    difficulty: "Intermediate",
    description: "A highly intuitive, visual, and world-renowned guide explaining queries, keys, values, and multi-head attention.",
    url: "https://jalammar.github.io/illustrated-transformer/"
  },
  {
    id: "tf_res_2",
    conceptId: "transformers",
    title: "Hugging Face NLP Course",
    provider: "Hugging Face",
    type: "documentation",
    difficulty: "Intermediate",
    description: "Practical tutorial on fine-tuning pre-trained transformer weights, tokenizers, datasets, and pipeline deployments.",
    url: "https://huggingface.co/learn/nlp-course"
  }
];
