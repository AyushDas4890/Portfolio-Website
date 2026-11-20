import { MediaLoop } from './MediaLoop'
import { AgentPipeline } from './AgentPipeline'
import { IslandDemo } from './IslandDemo'

/**
 * A project's moving media. `variant="hero"` prefers the case-study hero clip
 * when a project has one. Projects without a recording get a live motion piece.
 */
export function ProjectMedia({ project, variant = 'loop', hoverOnly = false, paused = false, className = '' }) {
  const { media, title } = project
  if (media.demo === 'island') return <IslandDemo ratio={media.ratio} paused={paused} className={className} />
  const src = variant === 'hero' && media.hero ? media.hero : media.loop
  const poster = variant === 'hero' && media.heroPoster ? media.heroPoster : media.poster
  if (!src) return <AgentPipeline ratio={media.ratio} paused={paused} className={className} />
  return (
    <MediaLoop
      src={src}
      poster={poster}
      alt={`${title}: recording of the live product`}
      ratio={media.ratio}
      hoverOnly={hoverOnly}
      paused={paused}
      className={className}
    />
  )
}
