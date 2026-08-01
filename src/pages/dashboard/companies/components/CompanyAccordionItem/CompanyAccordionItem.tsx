import styles from './CompanyAccordionItem.module.css';
import { AuthenticatedImage } from '@/components/AuthenticatedImage/AuthenticatedImage';
import { AnimatedExpandable } from '@/components/AnimatedExpandable/AnimatedExpandable';
import type { CompanyProfileResponse } from '../../../user/types/company.types';

interface CompanyAccordionItemProps {
  company: CompanyProfileResponse;
  defaultExpanded?: boolean;
  onDelete?: (companyId: number) => void;
  onAddGst?: (companyId: number) => void;
  isDeleting?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  gstNumber?: string;
  onOpenWorkspace?: () => void;
  children: React.ReactNode;
}

export function CompanyAccordionItem({ 
  company, 
  isExpanded = false, 
  onToggle, 
  gstNumber,
  onOpenWorkspace,
  children 
}: CompanyAccordionItemProps) {

  // Derive state from GST number if available
  let stateName = 'Other';
  if (gstNumber) {
    const stateCode = gstNumber.substring(0, 2);
    stateName = stateCode === '27' ? 'Maharashtra' 
              : stateCode === '29' ? 'Karnataka' 
              : stateCode === '07' ? 'Delhi' 
              : stateCode === '19' ? 'West Bengal' 
              : 'Other';
  }

  return (
    <div className={`${styles.accordionItem} ${isExpanded ? styles.expanded : ''}`}>
      <div 
        className={styles.accordionHeader} 
        onClick={onToggle}
      >
        <div className={styles.headerLeft}>
          <div className={styles.companyIconBox}>
            {company.companyLogo ? (
              <AuthenticatedImage src={company.companyLogo} alt="logo" className={styles.companyLogo} />
            ) : (
              <svg width="24" height="24" fill="none" stroke="#5a6acf" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            )}
          </div>
          
          <div className={styles.companyInfo}>
            <h2 className={styles.companyName}>{gstNumber || 'No GSTIN Added'}</h2>
            <div className={styles.companyMeta}>
              <span className={styles.metaValue}>{company.companyName}</span>
              {gstNumber && (
                <>
                  <span className={styles.metaDot}>•</span>
                  <span className={styles.metaValue}>{stateName}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles.headerRight}>
          {onOpenWorkspace && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenWorkspace();
              }}
              className={styles.openWorkspaceBtn}
            >
              Open Workspace &rarr;
            </button>
          )}
          <div className={styles.iconWrapper}>
            <svg 
              className={`${styles.chevron} ${isExpanded ? styles.rotate : ''}`} 
              width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      <AnimatedExpandable isExpanded={isExpanded}>
        <div className={styles.accordionContent}>
          {children}
        </div>
      </AnimatedExpandable>
    </div>
  );
}
