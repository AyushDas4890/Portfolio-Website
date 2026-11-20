import './agent-pipeline.css'

const AGENTS = [
  { name: 'Planner', job: 'Splits the topic into sub-questions', c: '#FF7A59' },
  { name: 'Searcher', job: 'Tavily web search', c: '#2DD4BF' },
  { name: 'Reader', job: 'Fetches pages, extracts insights', c: '#7AA2FF' },
  { name: 'Critic', job: 'Finds a gap · sends it back (max 2)', c: '#F5B83D' },
  { name: 'Writer', job: 'Sourced report saved to memory', c: '#B79CFF' },
]

/**
 * Motion graphic of one research run, used where no screen recording exists.
 * A 10 s cycle: each agent lights up in turn, the Critic sends work back once,
 * then the Writer fills the report. Same ratio box as <MediaLoop>.
 */
export function AgentPipeline({ ratio = '16 / 10', className = '', paused = false }) {
  return (
    <div
      className={`media pipeline ${paused ? 'is-paused' : ''} ${className}`}
      style={{ aspectRatio: ratio }}
      role="img"
      aria-label="Animated research run: Planner, Searcher, Reader and Critic work in turn, the Critic sends the Searcher back once, then the Writer produces a sourced report."
    >
      <div className="pl-top">
        <span className="pl-dot" />
        <span className="pl-query">Impact of AI agents on software engineering</span>
        <span className="pl-live">LIVE · SSE</span>
      </div>
      <ol className="pl-agents">
        {AGENTS.map((a, i) => (
          <li key={a.name} className={`pl-agent pl-a${i}`} style={{ '--c': a.c }}>
            <span className="pl-badge">{String(i + 1).padStart(2, '0')}</span>
            <span className="pl-name">{a.name}</span>
            <span className="pl-job">{a.job}</span>
            <span className="pl-state" />
          </li>
        ))}
      </ol>
      <svg className="pl-loop" viewBox="0 0 40 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M2 74 C 34 74, 34 26, 2 26" />
      </svg>
      <div className="pl-report">
        <p className="pl-r-title">Executive summary</p>
        <i style={{ '--w': '92%' }} /><i style={{ '--w': '84%' }} /><i style={{ '--w': '88%' }} /><i style={{ '--w': '60%' }} />
        <p className="pl-r-title">Key findings</p>
        <i style={{ '--w': '90%' }} /><i style={{ '--w': '76%' }} />
        <p className="pl-src">[1] arxiv.org · [2] github.blog · [3] acm.org</p>
      </div>
    </div>
  )
}
