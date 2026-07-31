
import { useRef, useEffect, useState } from 'react';
import styles from './CompanyAccordionItem.module.css';
import { AuthenticatedImage } from '@/components/AuthenticatedImage/AuthenticatedImage';
import type { CompanyProfileResponse } from '../../../user/types/company.types';

interface CompanyAccordionItemProps {
  company: CompanyProfileResponse;
  defaultExpanded?: boolean;
  onDelete?: (companyId: number) => void;
  onAddGst?: (companyId: number) => void;
  isDeleting?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
}

export function CompanyAccordionItem({ company, isExpanded = false, onToggle, onDelete, onAddGst, isDeleting, children }: CompanyAccordionItemProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      // Use ResizeObserver for dynamic content changes
      const observer = new ResizeObserver(() => {
        if (contentRef.current) {
          setContentHeight(contentRef.current.scrollHeight);
        }
      });
      observer.observe(contentRef.current);
      // Set initial height
      setContentHeight(contentRef.current.scrollHeight);
      return () => observer.disconnect();
    }
  }, [children]);

  return (
    <div className={`${styles.accordionItem} ${isExpanded ? styles.expanded : ''}`}>
      <div 
        className={styles.accordionHeader} 
        onClick={onToggle}
      >
        <div className={styles.headerLeft}>
          <div className={styles.iconWrapper}>
            <svg 
              className={`${styles.chevron} ${isExpanded ? styles.rotate : ''}`} 
              width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          
          {company.companyLogo ? (
            <AuthenticatedImage src={company.companyLogo} alt="logo" className={styles.companyLogo} />
          ) : (
            <div className={styles.companyLogoPlaceholder}>🏢</div>
          )}
          
          <div className={styles.companyInfo}>
            <h2 className={styles.companyName}>{company.companyName}</h2>
          </div>
        </div>

        {(onAddGst || onDelete) && (
          <div className={styles.headerRight}>
            {onAddGst && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddGst(company.id);
                }}
                className={styles.addGstBtn}
                title="Add GST No."
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add GST No.
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(company.id);
                }}
                disabled={isDeleting}
                className={styles.deleteBtn}
                title="Delete Company"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
      
      <div 
        className={styles.accordionContentWrapper}
        style={{ maxHeight: isExpanded ? `${contentHeight}px` : '0px' }}
      >
        <div ref={contentRef} className={styles.accordionContent}>
          {children}
        </div>
      </div>
    </div>
  );
}
