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
    'Computer Science undergraduate building end-to-end machine learning, NLP and Generative AI systems — from multi-agent research pipelines to legal document intelligence and sustainability analytics. I care about models that ship: explainable, measured, and wrapped in interfaces people actually use.',
  stats: [
    { value: '8.08', label: 'CGPA · B.Tech CSE' },
    { value: '5+', label: 'End-to-end AI systems' },
    { value: '>85%', label: 'Legal NLP val. accuracy' },
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
      '>85% validation accuracy via threshold tuning & optimization',
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
    tag: 'Forecasting · ML',
    accent: '#ff7ac6',
    blurb:
      'A demand-forecasting model that predicts grocery sales from store, product and temporal signals.',
    highlights: [
      'Gradient-boosted regression for seasonal demand forecasting',
      'Feature engineering across store, product & temporal attributes',
      'Multi-page Streamlit app for real-time sales prediction',
      'Built with Pandas & Scikit-Learn data pipelines',
    ],
    stack: ['Scikit-Learn', 'Pandas', 'Plotly', 'Streamlit'],
    link: 'https://github.com/AyushDas4890/Grocery-sales-predictor',
  },
  {
    id: 'carbon-footprint',
    title: 'Carbon Footprint Generator',
    period: 'Apr 2026',
    tag: 'Sustainability ML · Django',
    accent: '#ffd07a',
    blurb:
      'C4Future — an AI tool that estimates a product’s carbon footprint and shows how to offset it.',
    highlights: [
      'Random Forest regressor predicts CO₂ emissions from product attributes',
      'Breaks emissions into materials, manufacturing & transport',
      'Offset strategies + real-world equivalencies (trees, car-km)',
      'Django backend with interactive Chart.js dashboards',
    ],
    stack: ['Django', 'Scikit-Learn', 'Pandas', 'Chart.js'],
    link: 'https://github.com/AyushDas4890/Carbon_Footprint_Generator',
  },
]

// Live data is fetched from the GitHub API at runtime (see App.jsx).
// This curated snapshot is the fallback shown if the API rate-limits or is offline.
export const githubUser = 'AyushDas4890'
export const githubFallback = [
  { name: 'AI-Research-Assistant-Pipeline', display: 'AI Research Assistant Pipeline', language: 'Python', stars: 0, updated: '2026-06-03', description: 'Autonomous 5-agent LangGraph system that plans, searches, reads, critiques and writes sourced reports, with ChromaDB long-term memory.', url: 'https://github.com/AyushDas4890/AI-Research-Assistant-Pipeline' },
  { name: 'Legal-Conflict-Resolver', display: 'Legal Clause Conflict Resolver', language: 'Python', stars: 0, updated: '2026-05-05', description: 'DeBERTa-v3 Legal NLP pipeline detecting contradictions in legal documents.', url: 'https://github.com/AyushDas4890/Legal-Conflict-Resolver' },
  { name: 'Library-book-classifier', display: 'Library Book Classifier', language: 'Python', stars: 0, updated: '2026-05-11', description: 'ML classifier that categorizes books by subject from metadata and text.', url: 'https://github.com/AyushDas4890/Library-book-classifier' },
  { name: 'Carbon_Footprint_Generator', display: 'Carbon Footprint Generator', language: 'Python', stars: 1, updated: '2026-04-11', description: 'C4Future — Random Forest tool estimating product CO₂ emissions with offset strategies and Chart.js dashboards.', url: 'https://github.com/AyushDas4890/Carbon_Footprint_Generator' },
  { name: 'LANGCHAIN', display: 'LangChain Experiments', language: 'Jupyter Notebook', stars: 0, updated: '2026-04-11', description: 'Notebooks exploring LangChain chains, agents and retrieval workflows.', url: 'https://github.com/AyushDas4890/LANGCHAIN' },
  { name: 'Natural-Language-Processing', display: 'Natural Language Processing', language: 'Jupyter Notebook', stars: 0, updated: '2026-03-17', description: 'NLP fundamentals: tokenization, embeddings, classification and more.', url: 'https://github.com/AyushDas4890/Natural-Language-Processing' },
  { name: 'Weather_Clustering_Project', display: 'Weather Clustering', language: 'TypeScript', stars: 0, updated: '2026-03-16', description: 'Unsupervised clustering of weather patterns with an interactive front end.', url: 'https://github.com/AyushDas4890/Weather_Clustering_Project' },
  { name: 'Grocery-sales-predictor', display: 'Grocery Sales Predictor', language: 'Jupyter Notebook', stars: 0, updated: '2026-01-02', description: 'Gradient-boosted demand-forecasting model with a Streamlit prediction app.', url: 'https://github.com/AyushDas4890/Grocery-sales-predictor' },
  { name: 'yt_chatbot', display: 'YouTube Chatbot', language: 'JavaScript', stars: 0, updated: '2025-12-13', description: 'Chatbot that answers questions about YouTube video content.', url: 'https://github.com/AyushDas4890/yt_chatbot' },
]

export const skills = [
  { group: 'Languages', items: ['Python', 'C++', 'C', 'SQL', 'JavaScript'] },
  { group: 'AI / ML', items: ['PyTorch', 'TensorFlow', 'Scikit-Learn', 'Random Forest', 'Pandas', 'NumPy'] },
  { group: 'LLMs & NLP', items: ['Transformers', 'Hugging Face', 'DeBERTa-v3', 'LangChain', 'LangGraph'] },
  { group: 'Deployment', items: ['FastAPI', 'Django', 'Streamlit', 'ChromaDB', 'Git'] },
  { group: 'Web', items: ['HTML', 'CSS', 'JavaScript', 'Chart.js'] },
]

export const experience = [
  {
    role: 'Web Development Intern',
    company: 'VanillaCart',
    period: 'Aug 2025 – Oct 2025',
    cert: 'https://docs.google.com/document/d/1yx9rmpJFv_MrBOvBMtv_20F_qTgtnTWBQVLuN-EESeM/edit',
    points: [
      'Built and maintained responsive websites using HTML, CSS and JavaScript.',
      'Managed content migration and asset integration following SEO best practices.',
      'Collaborated with developers to deploy and maintain production-ready websites.',
    ],
  },
]

export const certifications = [
  { name: 'ChatGPT-4 Prompt Engineering', issuer: 'IBM', date: 'Aug 2025', link: 'https://drive.google.com/file/d/1S98NfYHwt_9ChTyoAGVu89KFUnvHoEAv/view' },
  { name: 'Master Generative AI & GenAI Tools', issuer: 'Udemy', date: 'Aug 2025', link: 'https://drive.google.com/file/d/1D3m9qSJ9XOLPk6m519dFh_CrMYV-P8-p/view' },
  { name: 'Machine Learning with Data Science', issuer: 'CipherSchools', date: 'Jul 2025', link: 'https://drive.google.com/file/d/1qVjHyZyHDPDClH8gLUyLNEjUJTX9LyRd/view' },
  { name: 'Python for Data Science and AI', issuer: 'IBM', date: 'Jun 2025', link: 'https://docs.google.com/document/d/1H1YgaIq_-hAum5q8uGPtSFcsXV2PdvaKmPLkMrjbuLw/edit' },
  { name: 'Prompt Engineering Essentials', issuer: 'Google', date: 'Jun 2025', link: 'https://www.coursera.org/account/accomplishments/verify/P0C2I6WML0YC' },
]

export const education = {
  school: 'Lovely Professional University',
  location: 'Punjab, India',
  degree: 'B.Tech, Computer Science & Engineering',
  detail: 'CGPA 8.08',
  period: 'Aug 2023 – Present',
}
