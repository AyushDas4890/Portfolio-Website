// Central content source — edit here to update the whole site.

export const profile = {
  name: 'Ayush Das',
  role: 'AI/ML Engineer',
  tagline: 'Generative AI · NLP · LLM Applications',
  location: 'Punjab, India',
  email: 'das.ayush4890@gmail.com',
  phone: '+91 98956 912390',
  github: 'https://github.com/AyushDas4890',
  linkedin: 'https://linkedin.com/in/ayushdas4890',
  summary:
    'Computer Science undergraduate building end-to-end machine learning, NLP and Generative AI systems — from multi-agent research pipelines to legal document intelligence and recommendation engines. I care about models that ship: explainable, measured, and wrapped in interfaces people actually use.',
  stats: [
    { value: '8.08', label: 'CGPA · B.Tech CSE' },
    { value: '5+', label: 'End-to-end AI systems' },
    { value: '87%', label: 'Legal NLP val. accuracy' },
    { value: '7th', label: 'University Coding Showdown' },
  ],
}

export const projects = [
  {
    id: 'ai-research-assistant',
    title: 'AI Research Assistant Pipeline',
    period: 'Jun 2026',
    tag: 'Multi-Agent · LangGraph',
    accent: '#7afcd0',
    blurb:
      'An autonomous multi-agent system that researches any topic end-to-end — and remembers what it learned across sessions.',
    highlights: [
      'Five-agent LangGraph StateGraph: plan → search → read → critique → write',
      'Self-correcting critic loop that re-searches when it detects coverage gaps',
      'Dual-layer memory: typed graph state + ChromaDB vector store across runs',
      'FastAPI backend streaming live agent progress over Server-Sent Events',
    ],
    stack: ['LangGraph', 'OpenAI GPT-4o', 'ChromaDB', 'FastAPI', 'Tavily'],
    link: 'https://github.com/AyushDas4890/AI-Research-Assistant-Pipeline',
    demo: 'https://ayushdas4890-ai-research-assistant-pipeline-app-1sjuvf.streamlit.app/',
  },
  {
    id: 'legal-conflict-resolver',
    title: 'Legal Clause Conflict Resolver',
    period: 'May 2026',
    tag: 'Legal NLP · LLM',
    accent: '#8b9cff',
    blurb:
      'An end-to-end Legal NLP pipeline that detects contradictions across legal and financial documents.',
    highlights: [
      'DeBERTa-v3-large fine-tuned for contradiction detection',
      '87% validation accuracy via threshold tuning & optimization',
      'Explainable AI with cross-attention heatmaps for evidence extraction',
      'FastAPI backend + analytics dashboard for real-time conflict analysis',
    ],
    stack: ['DeBERTa-v3', 'PyTorch', 'Transformers', 'FastAPI'],
    link: 'https://github.com/AyushDas4890/Legal-Conflict-Resolver',
  },
  {
    id: 'grocery-sales-predictor',
    title: 'Grocery Sales Predictor',
    period: 'Jan 2026',
    tag: 'Forecasting · XGBoost',
    accent: '#ff7ac6',
    blurb:
      'A demand-forecasting model that predicts grocery sales from store, product and temporal signals.',
    highlights: [
      'XGBoost demand-forecasting model with engineered features',
      'Feature engineering across store, product & temporal attributes',
      'Multi-page Streamlit app for real-time sales prediction',
      'Built with Pandas & Scikit-Learn data pipelines',
    ],
    stack: ['XGBoost', 'Pandas', 'Scikit-Learn', 'Streamlit'],
    link: 'https://github.com/AyushDas4890/Grocery-sales-predictor',
  },
  {
    id: 'music-recommender',
    title: 'Instant Music Recommendation',
    period: 'Nov 2025',
    tag: 'RecSys · ML',
    accent: '#ffd07a',
    blurb:
      'A content-based recommendation engine that surfaces personalized song suggestions in real time.',
    highlights: [
      'TF-IDF vectorization with cosine-similarity matching',
      'Content-based filtering for personalized recommendations',
      'Interactive Streamlit interface for real-time results',
    ],
    stack: ['TF-IDF', 'Scikit-Learn', 'Pandas', 'Streamlit'],
    link: 'https://github.com/AyushDas4890/Instant-music-recommendation-system-using-Machine-Learning',
  },
]

// Live data is fetched from the GitHub API at runtime (see App.jsx).
// This curated snapshot is the fallback shown if the API rate-limits or is offline.
export const githubUser = 'AyushDas4890'
export const githubFallback = [
  { name: 'AI-Research-Assistant-Pipeline', display: 'AI Research Assistant Pipeline', language: 'Python', stars: 0, updated: '2026-06-03', description: 'Autonomous 5-agent LangGraph system that plans, searches, reads, critiques and writes sourced reports, with ChromaDB long-term memory.', url: 'https://github.com/AyushDas4890/AI-Research-Assistant-Pipeline' },
  { name: 'Legal-Conflict-Resolver', display: 'Legal Clause Conflict Resolver', language: 'Python', stars: 0, updated: '2026-05-05', description: 'DeBERTa-v3 Legal NLP pipeline detecting contradictions in legal documents.', url: 'https://github.com/AyushDas4890/Legal-Conflict-Resolver' },
  { name: 'Library-book-classifier', display: 'Library Book Classifier', language: 'Python', stars: 0, updated: '2026-05-11', description: 'ML classifier that categorizes books by subject from metadata and text.', url: 'https://github.com/AyushDas4890/Library-book-classifier' },
  { name: 'Carbon_Footprint_Generator', display: 'Carbon Footprint Generator', language: 'Python', stars: 1, updated: '2026-04-11', description: 'Estimates personal/organizational carbon footprint from activity inputs.', url: 'https://github.com/AyushDas4890/Carbon_Footprint_Generator' },
  { name: 'LANGCHAIN', display: 'LangChain Experiments', language: 'Jupyter Notebook', stars: 0, updated: '2026-04-11', description: 'Notebooks exploring LangChain chains, agents and retrieval workflows.', url: 'https://github.com/AyushDas4890/LANGCHAIN' },
  { name: 'Natural-Language-Processing', display: 'Natural Language Processing', language: 'Jupyter Notebook', stars: 0, updated: '2026-03-17', description: 'NLP fundamentals: tokenization, embeddings, classification and more.', url: 'https://github.com/AyushDas4890/Natural-Language-Processing' },
]

export const skills = [
  { group: 'Languages', items: ['Python', 'C++', 'C', 'SQL', 'JavaScript'] },
  { group: 'AI / ML', items: ['PyTorch', 'TensorFlow', 'Scikit-Learn', 'XGBoost', 'Pandas', 'NumPy'] },
  { group: 'LLMs & NLP', items: ['Transformers', 'Hugging Face', 'DeBERTa-v3', 'LangChain', 'LangGraph'] },
  { group: 'Deployment', items: ['FastAPI', 'Streamlit', 'ChromaDB', 'Git', 'GitHub'] },
  { group: 'Web', items: ['HTML', 'CSS', 'JavaScript'] },
]

export const experience = [
  {
    role: 'Web Development Intern',
    company: 'VanillaCart',
    period: 'Aug 2025 – Oct 2025',
    points: [
      'Built and maintained responsive websites using HTML, CSS and JavaScript.',
      'Managed content migration and asset integration following SEO best practices.',
      'Collaborated with developers to deploy and maintain production-ready websites.',
    ],
  },
]

export const certifications = [
  { name: 'ChatGPT-4 Prompt Engineering', issuer: 'IBM', date: 'Aug 2025' },
  { name: 'Master Generative AI & GenAI Tools', issuer: 'Udemy', date: 'Aug 2025' },
  { name: 'Machine Learning with Data Science', issuer: 'CipherSchools', date: 'Jul 2025' },
  { name: 'Python for Data Science and AI', issuer: 'IBM', date: 'Jun 2025' },
  { name: 'Prompt Engineering Essentials', issuer: 'Google', date: 'Jun 2025' },
]

export const education = {
  school: 'Lovely Professional University',
  location: 'Punjab, India',
  degree: 'B.Tech, Computer Science & Engineering',
  detail: 'CGPA 8.08',
  period: 'Aug 2023 – Present',
}
