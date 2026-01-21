interface PageHeroProps {
  /** Small uppercase label above the headline */
  label: string
  /** Main headline text */
  title: string
  /** Optional second line of title (will be on new line) */
  titleHighlight?: string
  /** Subtitle/description text */
  subtitle: string
  /** Background image URL (defaults to office team meeting image) */
  backgroundImage?: string
}

export function PageHero({
  label,
  title,
  titleHighlight,
  subtitle,
  backgroundImage = "/professional-title-company-office-team-meeting.jpg",
}: PageHeroProps) {
  return (
    <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center grayscale"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      />
      <div className="absolute inset-0 bg-white/90" />

      <div className="relative container mx-auto px-4 text-center">
        <p className="text-primary font-semibold mb-3 uppercase tracking-wide pt-12">
          {label}
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
          {title}
          {titleHighlight && (
            <>
              <br />
              <span className="text-primary">{titleHighlight}</span>
            </>
          )}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
          {subtitle}
        </p>
      </div>
    </section>
  )
}

export default PageHero
