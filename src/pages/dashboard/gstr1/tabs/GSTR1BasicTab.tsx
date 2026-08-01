import { AnimatedExpandable } from '@/components/AnimatedExpandable/AnimatedExpandable';
import styles from '../GSTR1Page.module.css';

interface GSTR1BasicTabProps {
  data: any[];
  expandedAccordion: string | null;
  setExpandedAccordion: (val: string | null) => void;
}

const AccordionIcon = ({ expanded }: { expanded: boolean }) => (
  <div className={`${styles.accordionIcon} ${expanded ? styles.accordionIconExpanded : ''}`}>
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

export function GSTR1BasicTab({ data, expandedAccordion, setExpandedAccordion }: GSTR1BasicTabProps) {
  return (
    <div className={styles.accordion}>
      <div className={styles.accordionHeader} onClick={() => setExpandedAccordion(expandedAccordion === 'basicDetails' ? null : 'basicDetails')} role="button" tabIndex={0}>
        <AccordionIcon expanded={expandedAccordion === 'basicDetails'} />
        <div className={styles.accordionTitleGroup}>
          <p className={styles.accordionTitle}>Basic Details</p>
          <p className={styles.accordionSubtitle}>GSTIN, Legal Name, Trade Name, Aggregate Turnover</p>
        </div>
      </div>
      <AnimatedExpandable isExpanded={expandedAccordion === 'basicDetails'}>
        <div className={styles.accordionContent}>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table className={styles.draftTable}>
              <thead>
                <tr>
                  <th className={styles.draftThSr}>SR.</th>
                  <th>PARTICULARS</th>
                  <th>DETAILS / VALUES</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx}>
                    <td className={styles.draftTdSr}>{row.sr}</td>
                    <td>
                      <span className={styles.draftParticularsLabel}>{row.label}</span>
                      <span className={styles.draftParticularsSub}>{row.sub}</span>
                    </td>
                    <td>
                      {row.highlight ? (
                        <span className={styles.draftValueHighlight}>{row.value}</span>
                      ) : (
                        <span className={styles.draftValue}>{row.value}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedExpandable>
    </div>
  );
}
