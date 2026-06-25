import { useTranslation } from 'react-i18next'
import { useScrollAnimation } from '../../hooks/useScrollAnimation.js'
import ProjectCard from '../ui/ProjectCard.jsx'

export default function Projects() {
  const { t } = useTranslation()
  const sectionRef = useScrollAnimation({ targets: '.proj-anim', stagger: 0.1 })

  return (
    <section id="projects" ref={sectionRef} className="py-32 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <p className="proj-anim font-mono text-xs text-muted mb-2">{t('projects.label')}</p>
        <p className="proj-anim font-body text-sm text-muted mb-16">{t('projects.subheader')}</p>

        <div className="space-y-6">
          <ProjectCard
            title={t('projects.insumos.title')}
            url={t('projects.insumos.url')}
            oneliner={t('projects.insumos.oneliner')}
            description={t('projects.insumos.description')}
            tags={t('projects.insumos.tags', { returnObjects: true })}
            featured
            featuredLabel={t('projects.inProduction')}
            liveLabel={t('projects.live')}
            href="insumosdentaleschiapas.com.mx"
          />
          <ProjectCard
            title={t('projects.deltavis.title')}
            url={t('projects.deltavis.url')}
            oneliner={t('projects.deltavis.oneliner')}
            description={t('projects.deltavis.description')}
            tags={t('projects.deltavis.tags', { returnObjects: true })}
            liveLabel={t('projects.live')}
            href="deltavis.app"
          />
          <ProjectCard
            title={t('projects.opticas.title')}
            url={t('projects.opticas.url')}
            oneliner={t('projects.opticas.oneliner')}
            description={t('projects.opticas.description')}
            tags={t('projects.opticas.tags', { returnObjects: true })}
            featured
            featuredLabel={t('projects.inDevelopment')}
            liveLabel={t('projects.live')}
            href="opticas-valverde.web.app"
          />
          <ProjectCard
            title={t('projects.screenboundary.title')}
            url={t('projects.screenboundary.url')}
            oneliner={t('projects.screenboundary.oneliner')}
            description={t('projects.screenboundary.description')}
            tags={t('projects.screenboundary.tags', { returnObjects: true })}
            featured
            featuredLabel={t('projects.macosApp')}
            liveLabel={t('projects.live')}
            href="screenboundary.com"
          />
        </div>
      </div>
    </section>
  )
}
