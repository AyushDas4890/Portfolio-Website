import { projects as base } from './projects'
import { profile } from './profile'

export { profile }

/**
 * Presentation layer for the immersive site: the serif headline of each case
 * study, the caption used on the home page, the services list and the
 * backstage narration. Facts stay in projects.ts.
 */
const presentation: Record<string, { headline: string; home: string; services: string[]; backstage: string[] }> = {
  relay: {
    headline: 'Rebuilding Team Chat With Nothing Locked and a Bot That Runs the Standup',
    home: 'Step into Relay, a team workspace where every premium feature is unlocked and a bot teammate runs standups, reminders and recaps.',
    services: ['Product design', 'UX/UI', 'Real-time engineering', 'WebRTC huddles', 'Motion design', 'Deployment'],
    backstage: [
      'It started with a question: what does team chat look like when nothing sits behind a seat plan?',
      'Messages, presence and typing ride one WebSocket to a Node server, so the room feels live.',
      'Huddles go browser to browser over a WebRTC mesh, and the server only introduces the peers.',
      'The product site was drawn by hand, so the tool would feel like a teammate and not a dashboard.',
    ],
  },
  c4future: {
    headline: 'Revealing the Hidden Carbon Number Before a Product Is Ever Made',
    home: 'Discover C4Future: describe a product and get a calibrated CO₂ estimate with honest error bars, what drove it, and how to cut it.',
    services: ['Data curation', 'XGBoost modelling', 'Conformal prediction', 'Explainability', 'RAG advisor', 'Full-stack'],
    backstage: [
      'Most of a footprint is fixed at design time, so the estimate has to arrive while a choice can still change.',
      'XGBoost learns from Agribalyse, Poore and DEFRA data, and conformal prediction wraps it in a 90% interval.',
      'TreeSHAP turns every estimate into a story: which input pushed the number up, which pulled it down.',
      'An advisor answers only from indexed LCA and IPCC sources, with citations, or it declines.',
    ],
  },
  'research-assistant': {
    headline: 'Five Agents That Plan, Search, Doubt and Write a Sourced Report',
    home: 'Explore a research pipeline where five agents plan, search, read, critique their own coverage and stream a sourced report live.',
    services: ['Agent design', 'LangGraph', 'Retrieval & memory', 'Evaluation', 'Streaming API', 'Tracing'],
    backstage: [
      'One LLM call is fast but shallow. Splitting the work between agents makes the report broad and sourced.',
      'The Critic is the only agent allowed to send work backwards, at most twice, when coverage has gaps.',
      'Memory lives in two layers: graph state for the run, ChromaDB for everything learned before.',
      'Every step streams over Server-Sent Events, and LangSmith traces each routing decision.',
    ],
  },
  'cancer-tf': {
    headline: 'Using a Classifier as a Microscope for the Genes That Drive Cancer',
    home: 'Enter the Cancer TF Atlas, where a tumour classifier becomes a discovery tool for the transcription factors behind each cancer type.',
    services: ['Bioinformatics', 'Random Forest', 'Feature attribution', 'Validation', '3D data visualisation', 'Next.js'],
    backstage: [
      '801 tumour samples, 20,531 gene readings each: the signal hides in a lot of noise.',
      'A Random Forest separates five cancer types at 98.76% accuracy, then its own importances are ranked.',
      'Without being told, it rediscovered known master regulators: HNF1B in kidney, GATA3 in breast, NKX2-1 in lung.',
      'The results became a 3D genome globe, so researchers can walk through the hotspots.',
    ],
  },
  'dynamic-island': {
    headline: 'Bringing a Living, Spring-Driven Island to the Top of Windows',
    home: 'Meet Dynamic Island for Windows: a calm pill that springs open for music, timers and Claude Code, and answers “Hey Jarvis”.',
    services: ['Native desktop', 'C# / WPF', 'Spring physics', 'Voice pipeline', 'MCP server', 'Interaction design'],
    backstage: [
      'Windows had no calm place for live activity, only toasts piling up in a corner.',
      'Every shape change is a spring that can be interrupted mid-flight and re-targeted from its velocity.',
      'An MCP server and Claude Code hooks let an AI agent ask for permission right inside the island.',
      'Jarvis runs on-device: a wake word, Whisper for speech and Kokoro for the voice.',
    ],
  },
  'fruit-ripeness': {
    headline: 'Teaching a Model That Ripeness Is a Ladder, Not a List',
    home: 'Discover Ripe or Not: ordinal regression grades fruit from unripe to rotten, shows where it looked, and runs inside your browser.',
    services: ['Dataset building', 'Leak-free evaluation', 'Ordinal regression', 'Grad-CAM', 'ONNX in the browser', 'Presentation'],
    backstage: [
      'Ripeness grades are ordered, so calling a rotten fruit unripe should cost more than calling it ripe.',
      'CORAL turns one four-way choice into three yes/no questions on a single shared ripeness score.',
      'Crops were grouped by source photo into 159 leak-free groups before any fold was drawn.',
      'Grad-CAM was rebuilt inside the ONNX graph, so the browser shows where the model looked.',
    ],
  },
}

export type Project = (typeof base)[number] & (typeof presentation)[string]

export const projects: Project[] = base.map((p) => ({ ...p, ...presentation[p.slug] }))

export const getProject = (slug: string) => projects.find((p) => p.slug === slug)

export const categories = ['All', ...Array.from(new Set(projects.map((p) => p.category)))]

/** Studio chapters, told in Roman numerals like a book. */
export const chapters = [
  { slug: 'engineer', numeral: 'I', title: 'The engineer', alt: 'Who builds this' },
  { slug: 'approach', numeral: 'II', title: 'Approach', alt: 'Models that ship' },
  { slug: 'skills', numeral: 'III', title: 'Skills', alt: 'The toolkit' },
  { slug: 'recognition', numeral: 'IV', title: 'Recognition', alt: 'Certified & merged' },
  { slug: 'experience', numeral: 'V', title: 'Experience', alt: 'Shipped in production' },
] as const

export const getChapter = (slug: string) => chapters.findIndex((c) => c.slug === slug)
