import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import styles from '@/pages/landing/components/HeroSection.module.css';

const CHART_BARS = [
  { height: 42.1, highlight: false },
  { height: 63.2, highlight: false },
  { height: 52.6, highlight: false },
  { height: 84.2, highlight: false },
  { height: 100, highlight: true },
  { height: 79, highlight: false },
] as const;

function CheckIcon() {
  return (
    <svg className={styles.iconCheck} width="15" height="14" viewBox="0 0 15 14" fill="none" aria-hidden>
      <path
        d="M7.5 13.25C10.675 13.25 13.25 10.675 13.25 7.5C13.25 4.325 10.675 1.75 7.5 1.75C4.325 1.75 1.75 4.325 1.75 7.5C1.75 10.675 4.325 13.25 7.5 13.25Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M4.75 7.25L6.75 9.25L10.25 5.25"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg className={styles.iconCloud} width="15" height="11" viewBox="0 0 15 11" fill="none" aria-hidden>
      <path
        d="M11.25 8.5H3.75C2.09315 8.5 0.75 7.15685 0.75 5.5C0.75 3.96815 1.90685 2.6875 3.375 2.5375C3.7125 0.775 5.2875 -0.5 7.125 -0.5C8.5875 -0.5 9.8625 0.325 10.5 1.525C12.1875 1.675 13.5 3.1 13.5 4.825C13.5 6.71875 11.9625 8.5 11.25 8.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg className={styles.iconGear} width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1" />
      <path
        d="M6 1V2M6 10V11M1 6H2M10 6H11M2.75 2.75L3.5 3.5M8.5 8.5L9.25 9.25M2.75 9.25L3.5 8.5M8.5 3.5L9.25 2.75"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HeroSection() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.copy}>
        <h1 id="hero-heading" className={styles.title}>
          The GST system
          <br />
          for growing teams.
        </h1>
        <p className={styles.description}>
          TAXJIFFY streamlines complex tax compliance, from one-click reconciliation to
          automated GSTR filing. Built for speed, precision, and the modern finance stack.
        </p>
        <div className={styles.actions}>
          <Link to={ROUTES.auth.signup} className={styles.primaryBtn}>
            Start free trial
          </Link>
          <a href="#contact" className={styles.secondaryBtn}>
            Book a demo
          </a>
        </div>
      </div>

      <div className={styles.preview}>
        <div className={styles.glowPurple} aria-hidden />
        <div className={styles.glowGreen} aria-hidden />

        <div
          className={styles.dashboardOuter}
          role="img"
          aria-label="GST reconciliation dashboard preview"
        >
          <div className={styles.dashboardInner}>
            <div className={styles.titleBar}>
              <div className={styles.titleBarStart}>
                <div className={styles.trafficLights} aria-hidden>
                  <span className={styles.dotRed} />
                  <span className={styles.dotYellow} />
                  <span className={styles.dotGreen} />
                </div>
                <span className={styles.engineLabel}>GST RECONCILIATION ENGINE</span>
              </div>
              <div className={styles.titleBarEnd}>
                <div className={styles.searchBar} aria-hidden />
                <GearIcon />
              </div>
            </div>

            <div className={styles.dashboardBody}>
              <article className={styles.cardItc}>
                <div className={styles.cardItcHeader}>
                  <div className={styles.cardItcCopy}>
                    <span className={styles.labelMuted}>ITC SUMMARY</span>
                    <p className={styles.valueLarge}>₹4.2M</p>
                  </div>
                  <span className={styles.badge}>+12.4%</span>
                </div>
                <div className={styles.chart} aria-hidden>
                  {CHART_BARS.map((bar, index) => (
                    <span
                      key={index}
                      className={`${styles.chartBar} ${bar.highlight ? styles.chartBarHighlight : ''}`}
                      style={{ height: `${bar.height}%` }}
                    />
                  ))}
                </div>
              </article>

              <div className={styles.cardColumn}>
                <article className={styles.cardMatched}>
                  <div className={styles.cardRowHeader}>
                    <span className={styles.labelGreen}>MATCHED</span>
                    <CheckIcon />
                  </div>
                  <p className={styles.valueLarge}>99.8%</p>
                  <div className={styles.progressTrack} aria-hidden>
                    <span className={styles.progressFill} />
                  </div>
                </article>

                <article className={styles.cardStatus}>
                  <div className={styles.cardRowHeader}>
                    <span className={styles.labelPurple}>STATUS</span>
                    <CloudIcon />
                  </div>
                  <p className={styles.valueStatus}>GSTR-3B Ready</p>
                  <p className={styles.statusSubtext}>Automated filing sequence active</p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
