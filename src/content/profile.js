// Personal content. Source: Ayush_Das_CV.pdf (Nov 2026).

export const profile = {
  name: 'Ayush Das',
  role: 'AI/ML Engineer',
  focus: 'LLMs, RAG and multi-agent systems',
  location: 'Jalandhar, Punjab, India',
  email: 'das.ayush4890@gmail.com',
  phone: '+91 98956 12390',
  github: 'https://github.com/AyushDas4890',
  linkedin: 'https://linkedin.com/in/ayushdas4890',
  resume: '/Ayush_Das_CV.pdf',
  statement: 'I build AI systems that do real work, and the interfaces that let people trust them.',
  bio: [
    'I study Computer Science at Lovely Professional University and build and evaluate machine learning systems in Python: a fine-tuned DeBERTa-v3-large NLI model measured against a zero-shot baseline, a Random Forest on TCGA RNA-Seq data at 98.76% accuracy, and a 5-agent LLM pipeline traced with LangSmith.',
    'I care about models that ship. That means honest metrics, failure handling that keeps a run alive, and documentation good enough that someone else can run and reproduce the system.',
  ],
  stats: [
    { value: '8.08', label: 'CGPA, B.Tech CSE' },
    { value: '5', label: 'Agents in my research pipeline' },
    { value: '98.76%', label: 'Cancer subtype accuracy' },
    { value: '91.2%', label: 'C4Future interval coverage' },
  ],
  skills: [
    { group: 'Programming', items: ['Python (primary)', 'SQL', 'JavaScript', 'Node.js', 'C++', 'C'] },
    { group: 'Machine learning', items: ['Model evaluation', 'Baseline comparison', 'Failure-mode analysis', 'Pandas', 'Scikit-Learn', 'PyTorch', 'NLP'] },
    { group: 'Retrieval', items: ['Hugging Face Transformers', 'RAG', 'FAISS', 'ChromaDB', 'sentence-transformers'] },
    { group: 'LLMs and agents', items: ['LangGraph', 'LangChain', 'LangSmith tracing', 'OpenAI API', 'Claude', 'Claude Agent SDK', 'MCP', 'Prompt engineering'] },
    { group: 'Engineering', items: ['FastAPI', 'REST APIs', 'Docker', 'React', 'Git/GitHub', 'GitHub Actions (CI/CD)'] },
    { group: 'Practice', items: ['Technical documentation', 'Agent performance metrics', 'Software development life cycle'] },
  ],
  experience: [
    {
      role: 'Web Development Intern',
      company: 'VanillaCart',
      period: 'Sep 2025 – Nov 2025',
      cert: 'https://drive.google.com/file/d/1GGAGr0mR5C5MhxLwFbH529QuJjVau74I/view?usp=sharing',
      points: [
        'Owned the rebuild of a fully responsive production website end to end with HTML, CSS and JavaScript.',
        'Restructured the page hierarchy and applied on-page SEO to improve crawlability and page-load performance.',
        'Shipped cross-browser pages to production with the engineering team across development, QA, debugging and deployment.',
      ],
    },
  ],
  achievements: [
    { name: 'OpenCV open-source contribution', meta: 'Pull request #29299 · Jun 2026', body: 'Merged a documentation fix across 9 tutorial files (DNN, calib3d, ArUco, JavaScript bindings) into the 4.x branch; shipped in OpenCV 4.14.0.', link: 'https://github.com/opencv/opencv/pull/29299' },
    { name: 'Legal Clause Conflict Resolver', meta: 'PyTorch · DeBERTa-v3 · FAISS · May 2026', body: 'Fine-tuned DeBERTa-v3-large for NLI to flag contradictory clauses: above 85% validation accuracy and about 15% higher precision than a zero-shot baseline, with a FAISS pre-filter to cut model calls.', link: 'https://website-orpin-chi-25.vercel.app/', repo: 'https://github.com/AyushDas4890/Legal-Conflict-Resolver' },
  ],
  certifications: [
    { name: 'Introduction to RAG', issuer: 'Coursera', date: '2026', link: 'https://coursera.org/verify/TUB5CM8NUAAV' },
    { name: 'Supervised Machine Learning', issuer: 'DeepLearning.AI', date: '2026', link: 'https://coursera.org/verify/1YXO261VBCTN' },
    { name: 'Foundations of AI & ML', issuer: 'Microsoft', date: '2026', link: 'https://coursera.org/verify/KGQDC7XS5VSB' },
    { name: 'ChatGPT-4 Prompt Engineering', issuer: 'IBM', date: '2025', link: 'https://drive.google.com/file/d/1S98NfYHwt_9ChTyoAGVu89KFUnvHoEAv/view' },
    { name: 'Generative AI and Tools', issuer: 'Udemy', date: '2025', link: 'https://drive.google.com/file/d/1D3m9qSJ9XOLPk6m519dFh_CrMYV-P8-p/view' },
    { name: 'ML with Data Science', issuer: 'CipherSchools', date: '2025', link: 'https://drive.google.com/file/d/1qVjHyZyHDPDClH8gLUyLNEjUJTX9LyRd/view' },
    { name: 'Prompt Engineering Essentials', issuer: 'Google', date: '2025', link: 'https://coursera.org/verify/P0C216WMLOYC' },
    { name: 'Python for Data Science & AI', issuer: 'IBM', date: '2025', link: 'https://docs.google.com/document/d/1H1YgaIq_-hAum5q8uGPtSFcsXV2PdvaKmPLkMrjbuLw/edit' },
  ],
  education: {
    school: 'Lovely Professional University',
    degree: 'B.Tech, Computer Science and Engineering',
    detail: 'CGPA 8.08 / 10',
    period: 'Aug 2023 – Present',
  },
}
