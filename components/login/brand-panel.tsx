import { BoltIcon, BracketsIcon, TechBroMark } from "./icons";

export function BrandPanel() {
  return (
    <section
      aria-label="TECH BRO brand introduction"
      className="relative flex flex-col justify-start border-b-[3px] border-[var(--tb-ink)] bg-[var(--tb-bg)] px-4 py-4 sm:px-8 sm:py-6 lg:min-h-dvh lg:justify-between lg:border-b-0 lg:border-r-[3px] lg:px-12 lg:py-10 xl:px-16"
    >
      {/* Architectural corner registration blocks (tablet & desktop) */}
      <div aria-hidden="true" className="pointer-events-none hidden sm:block">
        <div className="absolute right-0 top-0 h-12 w-12 border-b-[3px] border-l-[3px] border-[var(--tb-ink)] bg-[var(--tb-accent)] lg:h-16 lg:w-16" />
        <div className="absolute right-12 top-0 h-6 w-6 border-b-[3px] border-l-[3px] border-[var(--tb-ink)] bg-[var(--tb-secondary)] lg:right-16 lg:h-8 lg:w-8" />
      </div>

      {/* Top row: TECH BRO wordmark */}
      <header className="relative z-10 flex items-center justify-between gap-4">
        <div className="inline-flex items-center gap-2.5 sm:gap-3">
          <span className="inline-flex shadow-[var(--tb-shadow-xs)]">
            <TechBroMark className="h-8 w-8 sm:h-10 sm:w-10 lg:h-11 lg:w-11" />
          </span>
          <span className="text-[19px] font-bold tracking-[0.06em] text-[var(--tb-ink)] sm:text-[23px] lg:text-[25px]">
            TECH BRO
          </span>
        </div>
      </header>

      {/* Center: Monumental headline + supporting copy */}
      <div className="relative z-10 mt-3.5 sm:mt-5 lg:my-auto lg:py-8">
        <h1 className="text-[26px] font-bold leading-[1.06] tracking-[-0.03em] text-[var(--tb-ink)] sm:text-[36px] lg:text-[clamp(2.85rem,4.5vw,4.35rem)] lg:leading-[0.98] lg:tracking-[-0.035em]">
          <span className="inline lg:block">BUILD. </span>
          <span className="inline lg:block">CONNECT. </span>
          <span className="mt-1 inline-block -rotate-1 border-2 border-[var(--tb-ink)] bg-[var(--tb-primary)] px-2 py-0.5 shadow-[var(--tb-shadow-sm)] sm:border-[3px] sm:px-3 lg:mt-2 lg:px-4 lg:py-1 lg:shadow-[var(--tb-shadow-md)]">
            LEVEL UP.
          </span>
        </h1>

        <p className="mt-2.5 max-w-[36ch] text-balance text-[14px] font-medium leading-[1.45] text-[var(--tb-ink-muted)] sm:mt-4 sm:text-[16px] lg:mt-6 lg:text-[18px] lg:leading-[1.55]">
          Your space to collaborate, create, and build something extraordinary.
        </p>

        {/* Tablet sticker row (compact, zero wrap) */}
        <div className="mt-4 hidden flex-wrap items-center gap-2.5 sm:flex lg:hidden">
          <span className="inline-flex -rotate-1 items-center gap-1.5 rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-secondary)] px-3 py-1 text-[12px] font-bold tracking-[0.06em] text-[var(--tb-ink)] shadow-[var(--tb-shadow-sm)]">
            <BoltIcon className="h-3.5 w-3.5 shrink-0" />
            SHIP FAST
          </span>
          <span className="inline-flex rotate-1 items-center gap-1.5 rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-accent)] px-3 py-1 text-[12px] font-bold tracking-[0.06em] text-[var(--tb-ink)] shadow-[var(--tb-shadow-sm)]">
            <BracketsIcon className="h-3.5 w-3.5 shrink-0" />
            BUILT FOR DEVS
          </span>
        </div>
      </div>

      {/* Bottom: Distilled Neo-Brutalist architectural workflow plate + 2 dev stickers (Desktop) */}
      <div className="relative z-10 hidden lg:block">
        <div className="max-w-[500px] pt-2">
          {/* Single product-authentic modular collaboration diagram */}
          <div className="border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] p-5 shadow-[var(--tb-shadow-md)]">
            <div className="flex items-center justify-between border-b-2 border-[var(--tb-ink)] pb-2.5">
              <span className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.08em] text-[var(--tb-ink)]">
                <BracketsIcon className="h-4 w-4" />
                WORKFLOW // TEAM BOARD
              </span>
              <span className="flex items-center gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 border-2 border-[var(--tb-ink)] bg-[var(--tb-secondary)]" />
                <span className="h-2.5 w-2.5 border-2 border-[var(--tb-ink)] bg-[var(--tb-accent)]" />
                <span className="h-2.5 w-2.5 border-2 border-[var(--tb-ink)] bg-[var(--tb-primary)]" />
              </span>
            </div>

            <svg
              viewBox="0 0 420 112"
              className="mt-4 h-auto w-full"
              fill="none"
              aria-hidden="true"
            >
              <defs>
                <pattern
                  id="tb-svg-hatch"
                  width="8"
                  height="8"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="8"
                    stroke="#171717"
                    strokeWidth="2.5"
                  />
                </pattern>
              </defs>

              {/* Connected workflow rails across all 4 geometric blocks */}
              <path
                d="M114 34H152M266 34H304M209 58V84H304"
                stroke="#171717"
                strokeWidth="2.5"
              />
              <path
                d="M145 28L152 34L145 40M297 28L304 34L297 40M297 78L304 84L297 90"
                stroke="#171717"
                strokeWidth="2.5"
                strokeLinecap="square"
              />

              {/* Stage 1: Backlog / Plan (Warm Paper) */}
              <rect
                x="6"
                y="10"
                width="108"
                height="48"
                fill="#F5F0E8"
                stroke="#171717"
                strokeWidth="2.5"
              />
              <path
                d="M20 27H72M20 40H92"
                stroke="#171717"
                strokeWidth="3"
                strokeLinecap="square"
              />

              {/* Stage 2: Build / Sync (Electric Violet) */}
              <rect
                x="154"
                y="10"
                width="112"
                height="48"
                fill="#A78BFA"
                stroke="#171717"
                strokeWidth="2.5"
              />
              <circle
                cx="176"
                cy="34"
                r="8"
                fill="#FFFFFF"
                stroke="#171717"
                strokeWidth="2.5"
              />
              <path
                d="M194 28H248M194 40H232"
                stroke="#171717"
                strokeWidth="3"
                strokeLinecap="square"
              />

              {/* Stage 3: Ship / Done (Signal Coral) */}
              <rect
                x="306"
                y="10"
                width="108"
                height="48"
                fill="#FF8A65"
                stroke="#171717"
                strokeWidth="2.5"
              />
              <path
                d="M326 34L337 44L356 24M368 34H396"
                stroke="#171717"
                strokeWidth="3"
                strokeLinecap="square"
              />

              {/* Bottom left hatched architectural anchor block */}
              <rect
                x="6"
                y="70"
                width="108"
                height="32"
                fill="url(#tb-svg-hatch)"
                stroke="#171717"
                strokeWidth="2.5"
              />

              {/* Bottom right Revision / QA loop badge */}
              <rect
                x="306"
                y="70"
                width="108"
                height="32"
                fill="#FFFFFF"
                stroke="#171717"
                strokeWidth="2.5"
              />
              <rect
                x="318"
                y="80"
                width="12"
                height="12"
                fill="#B8F56A"
                stroke="#171717"
                strokeWidth="2"
              />
              <path
                d="M340 86H396"
                stroke="#171717"
                strokeWidth="3"
                strokeLinecap="square"
              />
            </svg>
          </div>

          {/* Two disciplined, sharp developer-inspired stickers */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex -rotate-1 items-center gap-1.5 rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-secondary)] px-3.5 py-1.5 text-[12px] font-bold tracking-[0.06em] text-[var(--tb-ink)] shadow-[var(--tb-shadow-sm)]">
              <BoltIcon className="h-3.5 w-3.5 shrink-0" />
              SHIP FAST
            </span>
            <span className="inline-flex rotate-1 items-center gap-1.5 rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-accent)] px-3.5 py-1.5 text-[12px] font-bold tracking-[0.06em] text-[var(--tb-ink)] shadow-[var(--tb-shadow-sm)]">
              <BracketsIcon className="h-3.5 w-3.5 shrink-0" />
              BUILT FOR DEVS
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
