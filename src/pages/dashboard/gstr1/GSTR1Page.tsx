import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useUploadSalesRegister } from '@/pages/dashboard/gstr1/hooks/useUploadSalesRegister';
import { useGstr1Match } from '@/pages/dashboard/gstr1/hooks/useGstr1Match';
import { useGstr1Draft } from '@/pages/dashboard/gstr1/hooks/useGstr1Draft';
import { useFileGstr1 } from '@/pages/dashboard/gstr1/hooks/useFileGstr1';
import { PeriodSelector } from '@/components/PeriodSelector/PeriodSelector';
import { usePeriod, FY_YEARS } from '@/context/PeriodContext';
import styles from '@/pages/dashboard/gstr1/GSTR1Page.module.css';

/* ── Types ── */
type Step = 1 | 2 | 3;

const STEPS = [
  { num: 1 as const, label: 'Upload & Verify' },
  { num: 2 as const, label: 'Match & Confirm' },
  { num: 3 as const, label: 'Success' },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── Icons ── */
function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M5 10.5l3.5 3.5L15 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg className={styles.fileIconSvg} viewBox="0 0 24 24" fill="none">
      <path
        d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 16v-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1" fill="currentColor" />
    </svg>
  );
}

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 9v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

function MatchingIcon() {
  return (
    <svg
      className={styles.matchingProgressIcon}
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="36" cy="36" r="36" fill="#5a6acf" />
      <path
        d="M44 28H26m18 0l-4-4m4 4l-4 4"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 44h18M28 44l4-4m-4 4l4 4"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Component ── */
export function GSTR1Page() {
  const [step, setStep] = useState<Step>(1);
  const { selectedYear, selectedMonth, setSelectedYear, setSelectedMonth } = usePeriod();

  // Hooks — all mock data lives inside these; swap internals for real API later
  const upload = useUploadSalesRegister();
  const match = useGstr1Match();
  // Pass Excel-extracted data to the draft hook so all tabs show real file data
  const draft = useGstr1Draft(upload.data?.parsedDraftData);
  const filing = useFileGstr1();

  const [activeTab, setActiveTab] = useState<string>('Basic');
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>('table4');

  // When matching completes, move to step 2
  const handleStartMatching = useCallback(() => {
    match.startMatching();
  }, [match]);

  // Check if matching just completed and we need to advance
  if (match.isComplete && step === 1) {
    setStep(2);
  }

  const handleConfirmFiling = useCallback(() => {
    filing.mutate(upload.data?.rows ?? 4502);
    setStep(3);
  }, [filing, upload.data?.rows]);

  const resetWizard = useCallback(() => {
    setStep(1);
    upload.reset();
    match.reset();
    filing.reset();
    setActiveTab('Basic');
  }, [upload, match, filing]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) upload.mutate(f);
    },
    [upload],
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) upload.mutate(f);
    },
    [upload],
  );

  /* ── Drag state (UI-only, no data) ── */
  const [dragOver, setDragOver] = useState(false);

  /* ── Matching Progress Screen ── */
  const renderMatchingProgress = () => (
    <div className={styles.matchingCard}>
      <div className={styles.matchingProgress}>
        <MatchingIcon />
        <h3 className={styles.matchingProgressTitle}>
          Matching records with GST API...
        </h3>
        <p className={styles.matchingProgressSubtitle}>
          Please wait while we cross-reference{' '}
          {upload.data?.rows.toLocaleString() ?? '4,502'} records with the official GST
          database. This ensures your E-invoice and E-way bill data is perfectly
          aligned.
        </p>

        <div className={styles.progressBarSection}>
          <div className={styles.progressBarHeader}>
            <span className={styles.progressLabel}>Progress</span>
            <span className={styles.progressPercent}>{match.progress}%</span>
          </div>
          <div className={styles.progressBarTrack}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${match.progress}%` }}
            />
          </div>
        </div>

        <hr className={styles.progressDivider} />
      </div>
    </div>
  );

  /* ── Stepper ── */
  const renderStepper = () => (
    <div className={styles.stepper}>
      {STEPS.map((s, i) => {
        const isActive = step === s.num;
        const isCompleted = step > s.num;

        return (
          <div key={s.num} style={{ display: 'contents' }}>
            <div className={styles.step}>
              <div
                className={`${styles.stepCircle} ${
                  isCompleted
                    ? styles.stepCircleCompleted
                    : isActive
                      ? styles.stepCircleActive
                      : styles.stepCircleInactive
                }`}
              >
                {isCompleted ? <CheckIcon /> : s.num}
              </div>
              <span
                className={`${styles.stepLabel} ${
                  isCompleted
                    ? styles.stepLabelCompleted
                    : isActive
                      ? styles.stepLabelActive
                      : styles.stepLabelInactive
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`${styles.stepLine} ${
                  isCompleted ? styles.stepLineCompleted : styles.stepLineInactive
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  /* ── Step 1: Upload ── */
  const renderUpload = () => (
    <div className={styles.card}>
      <div className={styles.uploadHeader}>
        <div>
          <h3 className={styles.uploadTitle}>Upload Sales Register</h3>
          <p className={styles.uploadSubtitle}>
            Please use the standardized Excel template for optimal validation.
          </p>
        </div>
        <button type="button" className={styles.templateBtn}>
          ⬇ Download Template
        </button>
      </div>

      <div
        className={`${styles.dropzone} ${dragOver ? styles.dropzoneDragOver : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          setDragOver(false);
          onDrop(e);
        }}
        onClick={() => upload.inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') upload.inputRef.current?.click();
        }}
      >
        <div className={styles.dropzoneIcon}>⬆</div>
        <p className={styles.dropzoneTitle}>Drag and drop your Excel file here</p>
        <p className={styles.dropzoneHint}>
          Supported formats: .xlsx, .xls (Max 25MB)
          <br />
          Ensure all sheets follow the template structure.
        </p>
        <button
          type="button"
          className={styles.uploadBtn}
          onClick={(e) => {
            e.stopPropagation();
            upload.inputRef.current?.click();
          }}
        >
          Click to Upload
        </button>
        <input
          ref={upload.inputRef}
          type="file"
          accept=".xlsx,.xls"
          className={styles.hiddenInput}
          onChange={onFileChange}
        />
      </div>

      {/* File type error */}
      {upload.isError && (
        <div className={styles.fileTypeError}>
          <div className={styles.fileTypeErrorIcon}>
            <AlertTriangleIcon className={styles.fileTypeErrorIconSvg} />
          </div>
          <div className={styles.fileTypeErrorContent}>
            <p className={styles.fileTypeErrorTitle}>Invalid File Format</p>
            <p className={styles.fileTypeErrorMessage}>{upload.error}</p>
          </div>
        </div>
      )}

      {/* Parsing spinner */}
      {upload.isPending && (
        <div className={styles.parsingCard}>
          <div className={styles.parsingSpinner} />
          <div className={styles.parsingText}>
            <p className={styles.parsingTitle}>Parsing Excel file…</p>
            <p className={styles.parsingSubtitle}>Extracting GSTR-1 data from all worksheets</p>
          </div>
        </div>
      )}

      {/* Uploaded file card */}
      {upload.data && (
        <div className={styles.fileCard}>
          <div className={styles.fileIcon}>
            <FileIcon />
          </div>
          <div className={styles.fileInfo}>
            <p className={styles.fileName}>
              {upload.data.fileName}
              <span className={`${styles.fileBadge} ${upload.data.validationErrors.length > 0 ? styles.fileBadgeError : styles.fileBadgeSuccess}`}>
                {upload.data.validationErrors.length > 0 ? 'Has errors' : '✓ Data extracted'}
              </span>
            </p>
            <p className={styles.fileMeta}>
              {formatFileSize(upload.data.fileSize)}
              {upload.data.rows > 0 && ` • ${upload.data.rows.toLocaleString()} records parsed`}
              {upload.data.parsedDraftData && ' • Ready for review'}
            </p>
          </div>
          <button
            type="button"
            className={styles.fileRemove}
            onClick={upload.reset}
            aria-label="Remove file"
          >
            ✕
          </button>
        </div>
      )}

      {/* Extraction summary */}
      {upload.data?.parsedDraftData && upload.data.validationErrors.length === 0 && (
        <div className={styles.extractionSummary}>
          <div className={styles.extractionSummaryIcon}>📊</div>
          <div className={styles.extractionSummaryContent}>
            <p className={styles.extractionSummaryTitle}>Data Successfully Extracted</p>
            <p className={styles.extractionSummaryText}>
              All worksheets parsed — outward supplies, amendments, advance data, HSN summary and documents are ready to review in the tabs below after matching.
            </p>
          </div>
        </div>
      )}

      {/* Validation error card */}
      {upload.data && upload.data.validationErrors.length > 0 && (
        <div className={styles.validationError}>
          <div className={styles.validationErrorIcon}>
            <InfoCircleIcon className={styles.validationErrorIconSvg} />
          </div>
          <div className={styles.validationErrorContent}>
            <p className={styles.validationErrorTitle}>Validation Error</p>
            {upload.data.validationErrors.map((err) => (
              <p key={err} className={styles.validationErrorMessage}>{err}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  /* ── Step 2: Match & Confirm ── */
  const renderMatching = () => (
    <>
      {/* Header */}
      <div className={styles.matchPageHeader}>
        <h2 className={styles.matchPageTitle}>GSTR-1 Matching & Confirmation</h2>
        <p className={styles.matchPageSubtitle}>
          Review the matched results from the GST API before proceeding to file. Ensure
          all mismatch discrepancies are resolved.
        </p>
      </div>

      {/* Stats */}
      <div className={styles.matchStats}>
        <div className={styles.matchStatCard}>
          <div className={`${styles.matchStatIcon} ${styles.matchStatIconBlue}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="10" fill="#5a6acf" />
              <path d="M6 10.5l2.5 2.5L14 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className={styles.matchStatValue}>{match.matchStats?.matched.toLocaleString() ?? '—'}</p>
            <p className={styles.matchStatLabel}>MATCHED</p>
          </div>
        </div>
        <div className={styles.matchStatCard}>
          <div className={`${styles.matchStatIcon} ${styles.matchStatIconRed}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M8.66 2.5L1.22 15.5a1.5 1.5 0 001.28 2.25h14.88a1.5 1.5 0 001.28-2.25L11.22 2.5a1.5 1.5 0 00-2.56 0z" fill="#dc2626" />
              <path d="M10 7v4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="10" cy="14" r="0.75" fill="#fff" />
            </svg>
          </div>
          <div>
            <p className={styles.matchStatValue}>{match.matchStats?.mismatched.toLocaleString() ?? '—'}</p>
            <p className={styles.matchStatLabel}>MISMATCHED</p>
          </div>
        </div>
        <div className={styles.matchStatCard}>
          <div className={`${styles.matchStatIcon} ${styles.matchStatIconGray}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2 5h16M2 10h16M2 15h16" stroke="#8b8fa3" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M4 3l12 14" stroke="#8b8fa3" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className={styles.matchStatValue}>{match.matchStats?.missingInSystem.toLocaleString() ?? '—'}</p>
            <p className={styles.matchStatLabel}>MISSING IN SYSTEM</p>
          </div>
        </div>
      </div>

      {/* Draft Preview */}
      <div className={styles.draftSection}>
        <div className={styles.draftHeader}>
          <h3 className={styles.draftTitle}>
            <span className={styles.draftTitleIcon}>📋</span>
            GSTR-1 Draft Preview
          </h3>
          <button type="button" className={styles.downloadDraftBtn}>
            ⬇ Download Draft
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.draftTabs}>
          {draft.data.tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`${styles.draftTab} ${activeTab === tab ? styles.draftTabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {draft.data.tabBadges[tab] != null && (
                <span className={styles.draftTabBadge}>{draft.data.tabBadges[tab]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className={activeTab === 'Basic' ? styles.draftTableWrap : ''}>
          <div className={styles.draftFilingPeriod} style={activeTab !== 'Basic' ? { border: 'none', background: 'transparent', paddingLeft: 0, paddingRight: 0 } : {}}>
            <span className={styles.filingPeriodLabel}>FILING PERIOD</span>
            <PeriodSelector
              year={selectedYear.label}
              month={selectedMonth}
              onYearChange={(yLabel) => {
                const fy = FY_YEARS.find(f => f.label === yLabel);
                if (fy) setSelectedYear(fy);
              }}
              onMonthChange={setSelectedMonth}
            />
            <span className={styles.filingPeriodSync}>
              <span className={styles.syncIcon}>ⓘ</span>
              Data synced from GST Portal
            </span>
          </div>

          {activeTab === 'Basic' && (
            <table className={styles.draftTable}>
              <thead>
                <tr>
                  <th className={styles.draftThSr}>SR.</th>
                  <th>PARTICULARS</th>
                  <th>DETAILS / VALUES</th>
                </tr>
              </thead>
              <tbody>
                {draft.data.rows.map((row) => (
                  <tr key={row.sr}>
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
          )}

          {activeTab === 'Outward' && draft.data.outwardData && (
            <div className={styles.outwardTabContent}>
              {/* Accordion 4 */}
              <div className={styles.accordion}>
                <div
                  className={styles.accordionHeader}
                  onClick={() => setExpandedAccordion(prev => prev === 'table4' ? null : 'table4')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={`${styles.accordionIcon} ${expandedAccordion === 'table4' ? styles.accordionIconExpanded : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className={styles.accordionTitleGroup}>
                    <p className={styles.accordionTitle}>Table 4: Taxable outward supplies made to registered persons (including UIN-holders)</p>
                    <p className={styles.accordionSubtitle}>B2B supplies, Reverse Charge and E-commerce supplies</p>
                  </div>
                </div>
                {expandedAccordion === 'table4' && (
                  <div className={styles.accordionContent}>
                    {/* 4A */}
                    <div className={styles.outwardSectionTitle}>4A. SUPPLIES OTHER THAN REVERSE CHARGE & E-COMMERCE</div>
                    <div className={styles.outwardTableWrap}>
                      <table className={styles.outwardTable}>
                        <thead>
                          <tr>
                            <th>GSTIN/UIN</th>
                            <th>INVOICE NO</th>
                            <th>INVOICE DATE</th>
                            <th>INVOICE VALUE (₹)</th>
                            <th>TAXABLE VALUE (₹)</th>
                            <th>IGST (₹)</th>
                            <th>CGST (₹)</th>
                            <th>SGST/UTGST (₹)</th>
                            <th>CESS (₹)</th>
                            <th>PLACE OF SUPPLY</th>
                          </tr>
                        </thead>
                        <tbody>
                          {draft.data.outwardData.table4.section4A.map((row, idx) => (
                            <tr key={idx}>
                              <td>{row.gstin}</td>
                              <td>{row.invoiceNo}</td>
                              <td>{row.invoiceDate}</td>
                              <td>{row.invoiceValue}</td>
                              <td>{row.taxableValue}</td>
                              <td className={row.igst !== '0.00' ? styles.textBlue : ''}>{row.igst}</td>
                              <td className={row.cgst !== '0.00' ? styles.textBlue : ''}>{row.cgst}</td>
                              <td className={row.sgst !== '0.00' ? styles.textBlue : ''}>{row.sgst}</td>
                              <td>{row.cess}</td>
                              <td>{row.pos}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* 4B */}
                    <div className={styles.outwardSectionTitle}>4B. SUPPLIES ATTRACTING REVERSE CHARGE</div>
                    <div className={styles.outwardTableWrap}>
                      <table className={styles.outwardTable}>
                        <thead>
                          <tr>
                            <th>GSTIN/UIN</th>
                            <th>INVOICE NO</th>
                            <th>INVOICE DATE</th>
                            <th>INVOICE VALUE (₹)</th>
                            <th>TAXABLE VALUE (₹)</th>
                            <th>IGST (₹)</th>
                            <th>CGST (₹)</th>
                            <th>SGST/UTGST (₹)</th>
                            <th>CESS (₹)</th>
                            <th>PLACE OF SUPPLY</th>
                          </tr>
                        </thead>
                        <tbody>
                          {draft.data.outwardData.table4.section4B.map((row, idx) => (
                            <tr key={idx}>
                              <td>{row.gstin}</td>
                              <td>{row.invoiceNo}</td>
                              <td>{row.invoiceDate}</td>
                              <td>{row.invoiceValue}</td>
                              <td>{row.taxableValue}</td>
                              <td className={row.igst !== '0.00' ? styles.textBlue : ''}>{row.igst}</td>
                              <td className={row.cgst !== '0.00' ? styles.textBlue : ''}>{row.cgst}</td>
                              <td className={row.sgst !== '0.00' ? styles.textBlue : ''}>{row.sgst}</td>
                              <td>{row.cess}</td>
                              <td>{row.pos}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* 4C */}
                    <div className={styles.outwardEcommerceGSTIN}>E-COMMERCE OPERATOR GSTIN: {draft.data.outwardData.table4.section4C_ecommerceGstin}</div>
                    <div className={styles.outwardSectionTitle}>4C. SUPPLIES THROUGH E-COMMERCE (TCS)</div>
                    <div className={styles.outwardTableWrap}>
                      <table className={styles.outwardTable}>
                        <thead>
                          <tr>
                            <th>GSTIN/UIN</th>
                            <th>INVOICE NO</th>
                            <th>INVOICE DATE</th>
                            <th>INVOICE VALUE (₹)</th>
                            <th>TAXABLE VALUE (₹)</th>
                            <th>IGST (₹)</th>
                            <th>CGST (₹)</th>
                            <th>SGST/UTGST (₹)</th>
                            <th>CESS (₹)</th>
                            <th>PLACE OF SUPPLY</th>
                          </tr>
                        </thead>
                        <tbody>
                          {draft.data.outwardData.table4.section4C.map((row, idx) => (
                            <tr key={idx}>
                              <td>{row.gstin}</td>
                              <td>{row.invoiceNo}</td>
                              <td>{row.invoiceDate}</td>
                              <td>{row.invoiceValue}</td>
                              <td>{row.taxableValue}</td>
                              <td className={row.igst !== '0.00' ? styles.textBlue : ''}>{row.igst}</td>
                              <td className={row.cgst !== '0.00' ? styles.textBlue : ''}>{row.cgst}</td>
                              <td className={row.sgst !== '0.00' ? styles.textBlue : ''}>{row.sgst}</td>
                              <td>{row.cess}</td>
                              <td>{row.pos}</td>
                            </tr>
                          ))}
                          {/* Summary Row */}
                          <tr className={styles.outwardSummaryRow}>
                            <td colSpan={3}>TOTAL SUMMARIZED RECORDS FOR TABLE 4</td>
                            <td>{draft.data.outwardData.table4.total.invoiceValue}</td>
                            <td>{draft.data.outwardData.table4.total.taxableValue}</td>
                            <td className={styles.textBlue}>{draft.data.outwardData.table4.total.igst}</td>
                            <td className={styles.textBlue}>{draft.data.outwardData.table4.total.cgst}</td>
                            <td className={styles.textBlue}>{draft.data.outwardData.table4.total.sgst}</td>
                            <td>{draft.data.outwardData.table4.total.cess}</td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 5 */}
              <div className={styles.accordion}>
                <div
                  className={styles.accordionHeader}
                  onClick={() => setExpandedAccordion(prev => prev === 'table5' ? null : 'table5')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={`${styles.accordionIcon} ${expandedAccordion === 'table5' ? styles.accordionIconExpanded : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className={styles.accordionTitleGroup}>
                    <p className={styles.accordionTitle}>Table 5: Taxable outward inter-State supplies to un-registered persons where the invoice value is more than Rs 2.5 lakh</p>
                    <p className={styles.accordionSubtitle}>Taxable inter-State supplies to un-registered persons {'>'} 2.5 lakh</p>
                  </div>
                </div>
                {expandedAccordion === 'table5' && (
                  <div className={styles.accordionContent}>
                    {/* 5A */}
                    <div className={styles.outwardSectionTitle}>5A. OUTWARD SUPPLIES (OTHER THAN E-COMMERCE OPERATOR, RATE-WISE)</div>
                    <div className={styles.outwardSectionTitleSub}>Inter-state supplies to unregistered persons (aggregated by rate)</div>
                    <div className={styles.outwardTableWrap}>
                      <table className={styles.outwardTable}>
                        <thead>
                          <tr>
                            <th>PLACE OF SUPPLY</th>
                            <th className={styles.centered}>INVOICE NO</th>
                            <th className={styles.centered}>INVOICE DATE</th>
                            <th>INVOICE VALUE (₹)</th>
                            <th className={styles.centered}>RATE (%)</th>
                            <th>TAXABLE VALUE (₹)</th>
                            <th>IGST (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {draft.data.outwardData.table5.section5A.map((row, idx) => (
                            <tr key={idx}>
                              <td>{row.pos}</td>
                              <td className={styles.centered}>{row.invoiceNo}</td>
                              <td className={styles.centered}>{row.invoiceDate}</td>
                              <td>{row.invoiceValue}</td>
                              <td className={styles.centered}>{row.rate}</td>
                              <td>{row.taxableValue}</td>
                              <td className={styles.textBlue}>{row.igst}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* 5B */}
                    <div className={styles.outwardEcommerceGSTIN}>GSTIN OF E-COMMERCE OPERATOR <span style={{ background: '#f1f3f9', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px' }}>{draft.data.outwardData.table5.section5B_ecommerceGstin}</span></div>
                    <div className={styles.outwardSectionTitle}>5B. SUPPLIES MADE THROUGH E-COMMERCE OPERATOR (TCS APPLICABLE, RATE-WISE)</div>
                    <div className={styles.outwardTableWrap}>
                      <table className={styles.outwardTable}>
                        <thead>
                          <tr>
                            <th>GSTIN/UIN</th>
                            <th>PLACE OF SUPPLY</th>
                            <th className={styles.centered}>INVOICE NO</th>
                            <th className={styles.centered}>INVOICE DATE</th>
                            <th>INVOICE VALUE (₹)</th>
                            <th className={styles.centered}>RATE (%)</th>
                            <th>TAXABLE VALUE (₹)</th>
                            <th>IGST (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {draft.data.outwardData.table5.section5B.map((row, idx) => (
                            <tr key={idx}>
                              <td>{row.gstin}</td>
                              <td>{row.pos}</td>
                              <td className={styles.centered}>{row.invoiceNo}</td>
                              <td className={styles.centered}>{row.invoiceDate}</td>
                              <td>{row.invoiceValue}</td>
                              <td className={styles.centered}>{row.rate}</td>
                              <td>{row.taxableValue}</td>
                              <td className={styles.textBlue}>{row.igst}</td>
                            </tr>
                          ))}
                          {/* Summary Row */}
                          <tr className={styles.outwardSummaryRow}>
                            <td colSpan={4}>TOTAL SUMMARIZED RECORDS FOR TABLE 5</td>
                            <td>{draft.data.outwardData.table5.total.invoiceValue}</td>
                            <td></td>
                            <td>{draft.data.outwardData.table5.total.taxableValue}</td>
                            <td className={styles.textBlue}>{draft.data.outwardData.table5.total.igst}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 6 */}
              <div className={styles.accordion}>
                <div
                  className={styles.accordionHeader}
                  onClick={() => setExpandedAccordion(prev => prev === 'table6' ? null : 'table6')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={`${styles.accordionIcon} ${expandedAccordion === 'table6' ? styles.accordionIconExpanded : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className={styles.accordionTitleGroup}>
                    <p className={styles.accordionTitle}>Table 6: Zero rated supplies and Deemed Exports</p>
                    <p className={styles.accordionSubtitle}>Exports, SEZ supplies, Deemed exports</p>
                  </div>
                </div>
                {expandedAccordion === 'table6' && (
                  <div className={styles.accordionContent}>
                    {/* 6A */}
                    <div className={styles.outwardSectionTitle}>6A. EXPORTS</div>
                    <div className={styles.outwardTableWrap}>
                      <table className={`${styles.outwardTable} ${styles.multiTier}`}>
                        <thead>
                          <tr>
                            <th rowSpan={2}>GSTIN OF RECIPIENT</th>
                            <th colSpan={3} className={styles.centered}>INVOICE DETAILS</th>
                            <th colSpan={2} className={styles.centered}>SHIPPING BILL/ BILL OF EXPORT</th>
                            <th colSpan={3} className={styles.centered}>INTEGRATED TAX</th>
                          </tr>
                          <tr>
                            <th className={styles.subHeader}>NO.</th>
                            <th className={styles.subHeader}>DATE</th>
                            <th className={styles.subHeader}>VALUE</th>
                            <th className={styles.subHeader}>NO.</th>
                            <th className={styles.subHeader}>DATE</th>
                            <th className={styles.subHeader}>RATE</th>
                            <th className={styles.subHeader}>TAXABLE VALUE</th>
                            <th className={styles.subHeader}>AMT.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {draft.data.outwardData.table6.section6A.map((row, idx) => (
                            <tr key={idx} className={styles.outwardTableDataRow}>
                              <td className={styles.centered}>{row.gstin}</td>
                              <td className={styles.centered}>{row.invoiceNo}</td>
                              <td className={styles.centered}>{row.invoiceDate}</td>
                              <td>{row.invoiceValue}</td>
                              <td className={styles.centered}>{row.sbNo}</td>
                              <td className={styles.centered}>{row.sbDate}</td>
                              <td className={styles.centered}>{row.rate}</td>
                              <td>{row.taxableValue}</td>
                              <td className={styles.textBlue}>{row.amt}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* 6B */}
                    <div className={styles.outwardSectionTitle}>6B. SUPPLIES MADE TO SEZ UNIT / SEZ DEVELOPER</div>
                    <div className={styles.outwardTableWrap}>
                      <table className={`${styles.outwardTable} ${styles.multiTier}`}>
                        <thead>
                          <tr>
                            <th rowSpan={2}>GSTIN OF RECIPIENT</th>
                            <th colSpan={3} className={styles.centered}>INVOICE DETAILS</th>
                            <th colSpan={2} className={styles.centered}>SHIPPING BILL/ BILL OF EXPORT</th>
                            <th colSpan={3} className={styles.centered}>INTEGRATED TAX</th>
                          </tr>
                          <tr>
                            <th className={styles.subHeader}>NO.</th>
                            <th className={styles.subHeader}>DATE</th>
                            <th className={styles.subHeader}>VALUE</th>
                            <th className={styles.subHeader}>NO.</th>
                            <th className={styles.subHeader}>DATE</th>
                            <th className={styles.subHeader}>RATE</th>
                            <th className={styles.subHeader}>TAXABLE VALUE</th>
                            <th className={styles.subHeader}>AMT.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {draft.data.outwardData.table6.section6B.map((row, idx) => (
                            <tr key={idx} className={styles.outwardTableDataRow}>
                              <td>{row.gstin}</td>
                              <td className={styles.centered}>{row.invoiceNo}</td>
                              <td className={styles.centered}>{row.invoiceDate}</td>
                              <td>{row.invoiceValue}</td>
                              <td className={styles.centered}>{row.sbNo}</td>
                              <td className={styles.centered}>{row.sbDate}</td>
                              <td className={styles.centered}>{row.rate}</td>
                              <td>{row.taxableValue}</td>
                              <td className={styles.textBlue}>{row.amt}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* 6C */}
                    <div className={styles.outwardSectionTitle}>6C. DEEMED EXPORTS</div>
                    <div className={styles.outwardTableWrap}>
                      <table className={`${styles.outwardTable} ${styles.multiTier}`}>
                        <thead>
                          <tr>
                            <th rowSpan={2}>GSTIN OF RECIPIENT</th>
                            <th colSpan={3} className={styles.centered}>INVOICE DETAILS</th>
                            <th colSpan={2} className={styles.centered}>SHIPPING BILL/ BILL OF EXPORT</th>
                            <th colSpan={3} className={styles.centered}>INTEGRATED TAX</th>
                          </tr>
                          <tr>
                            <th className={styles.subHeader}>NO.</th>
                            <th className={styles.subHeader}>DATE</th>
                            <th className={styles.subHeader}>VALUE</th>
                            <th className={styles.subHeader}>NO.</th>
                            <th className={styles.subHeader}>DATE</th>
                            <th className={styles.subHeader}>RATE</th>
                            <th className={styles.subHeader}>TAXABLE VALUE</th>
                            <th className={styles.subHeader}>AMT.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {draft.data.outwardData.table6.section6C.map((row, idx) => (
                            <tr key={idx} className={styles.outwardTableDataRow}>
                              <td>{row.gstin}</td>
                              <td className={styles.centered}>{row.invoiceNo}</td>
                              <td className={styles.centered}>{row.invoiceDate}</td>
                              <td>{row.invoiceValue}</td>
                              <td className={styles.centered}>{row.sbNo}</td>
                              <td className={styles.centered}>{row.sbDate}</td>
                              <td className={styles.centered}>{row.rate}</td>
                              <td>{row.taxableValue}</td>
                              <td className={styles.textBlue}>{row.amt}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 7 */}
              <div className={styles.accordion}>
                <div
                  className={styles.accordionHeader}
                  onClick={() => setExpandedAccordion(prev => prev === 'table7' ? null : 'table7')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={`${styles.accordionIcon} ${expandedAccordion === 'table7' ? styles.accordionIconExpanded : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className={styles.accordionTitleGroup}>
                    <p className={styles.accordionTitle}>7. Taxable supplies (Net of debit notes and credit notes) to unregistered persons other than the supplies covered in Table 5</p>
                  </div>
                </div>
                {expandedAccordion === 'table7' && (
                  <div className={styles.accordionContent} style={{ padding: 0 }}>
                    <div className={styles.outwardTableWrap} style={{ border: 'none', borderRadius: 0, margin: 0 }}>
                      <table className={`${styles.outwardTable} ${styles.multiTier}`}>
                        <thead>
                          <tr>
                            <th rowSpan={2} className={styles.centered}>RATE OF TAX</th>
                            <th rowSpan={2} className={styles.centered}>TOTAL TAXABLE VALUE (₹)</th>
                            <th colSpan={3} className={styles.centered}>AMOUNT (₹)</th>
                          </tr>
                          <tr>
                            <th className={styles.subHeader}>INTEGRATED</th>
                            <th className={styles.subHeader}>CENTRAL</th>
                            <th className={styles.subHeader}>STATE TAX/UT TAX</th>
                          </tr>
                          <tr>
                            <th className={styles.outwardTableColNum}>1</th>
                            <th className={styles.outwardTableColNum}>2</th>
                            <th className={styles.outwardTableColNum}>3</th>
                            <th className={styles.outwardTableColNum}>4</th>
                            <th className={styles.outwardTableColNum}>5</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan={5} className={styles.outwardTableRowHeader}>7A. Intra-State supplies</td>
                          </tr>
                          <tr>
                            <td colSpan={5} className={styles.outwardTableSubRowHeader}>7A (1). Consolidated rate wise outward supplies [including supplies made through e-commerce operator attracting TCS]</td>
                          </tr>
                          {draft.data.outwardData.table7.section7A1.map((row, idx) => (
                            <tr key={`7a1-${idx}`} className={styles.outwardTableDataRow}>
                              <td className={styles.centered}>{row.rate}</td>
                              <td>{row.taxableValue}</td>
                              <td>{row.integrated}</td>
                              <td>{row.central}</td>
                              <td>{row.state}</td>
                            </tr>
                          ))}

                          <tr>
                            <td colSpan={5} className={styles.outwardTableSubRowHeader}>7A (2). Out of supplies mentioned at 7A(1), value of supplies made through e-Commerce Operators attracting TCS (operator wise, rate wise)</td>
                          </tr>
                          <tr>
                            <td colSpan={2} className={styles.outwardTableSubRowHeader} style={{ fontSize: '0.625rem', fontWeight: 500 }}>GSTIN of e-commerce operator<span style={{ marginLeft: '16px', fontWeight: 600 }}>{draft.data.outwardData.table7.section7A2_ecommerceGstin}</span></td>
                            <td colSpan={3}></td>
                          </tr>
                          {draft.data.outwardData.table7.section7A2.map((row, idx) => (
                            <tr key={`7a2-${idx}`} className={styles.outwardTableDataRow}>
                              <td className={styles.centered}>{row.rate}</td>
                              <td>{row.taxableValue}</td>
                              <td>{row.integrated}</td>
                              <td>{row.central}</td>
                              <td>{row.state}</td>
                            </tr>
                          ))}

                          <tr>
                            <td colSpan={5} className={styles.outwardTableRowHeader}>7B. Inter-State Supplies where invoice value is upto Rs 2.5 Lakh [Rate wise]</td>
                          </tr>
                          <tr>
                            <td colSpan={2} className={styles.outwardTableSubRowHeader} style={{ fontSize: '0.625rem', fontWeight: 500 }}>7B (1). Place of Supply (Name of State)<span style={{ marginLeft: '16px', fontWeight: 600 }}>{draft.data.outwardData.table7.section7B1_pos}</span></td>
                            <td colSpan={3}></td>
                          </tr>
                          {draft.data.outwardData.table7.section7B1.map((row, idx) => (
                            <tr key={`7b1-${idx}`} className={styles.outwardTableDataRow}>
                              <td className={styles.centered}>{row.stateName}</td>
                              <td>{row.taxableValue}</td>
                              <td>{row.integrated}</td>
                              <td>{row.central}</td>
                              <td>{row.state}</td>
                            </tr>
                          ))}

                          <tr>
                            <td colSpan={5} className={styles.outwardTableSubRowHeader}>7B (2). Out of the supplies mentioned in 7B (1), the supplies made through e-Commerce Operators (operator wise, rate wise)</td>
                          </tr>
                          <tr>
                            <td colSpan={2} className={styles.outwardTableSubRowHeader} style={{ fontSize: '0.625rem', fontWeight: 500 }}>GSTIN of e-commerce operator<span style={{ marginLeft: '16px', fontWeight: 600 }}>{draft.data.outwardData.table7.section7B2_ecommerceGstin}</span></td>
                            <td colSpan={3}></td>
                          </tr>
                          {draft.data.outwardData.table7.section7B2.map((row, idx) => (
                            <tr key={`7b2-${idx}`} className={styles.outwardTableDataRow}>
                              <td className={styles.centered}>{row.rate}</td>
                              <td>{row.taxableValue}</td>
                              <td>{row.integrated}</td>
                              <td>{row.central}</td>
                              <td>{row.state}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 8 */}
              <div className={styles.accordion}>
                <div
                  className={styles.accordionHeader}
                  onClick={() => setExpandedAccordion(prev => prev === 'table8' ? null : 'table8')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={`${styles.accordionIcon} ${expandedAccordion === 'table8' ? styles.accordionIconExpanded : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className={styles.accordionTitleGroup}>
                    <p className={styles.accordionTitle}>Table 8: Nil rated, exempted and non GST outward supplies</p>
                    <p className={styles.accordionSubtitle}>Summary of non-taxable supplies</p>
                  </div>
                </div>
                {expandedAccordion === 'table8' && (
                  <div className={styles.accordionContent} style={{ padding: 0 }}>
                    <div className={styles.outwardTableWrap} style={{ border: 'none', borderRadius: 0, margin: 0 }}>
                      <table className={styles.outwardTable}>
                        <thead>
                          <tr>
                            <th className={styles.centered}>DESCRIPTION</th>
                            <th className={styles.centered}>NIL RATED SUPPLIES (₹)</th>
                            <th className={styles.centered}>EXEMPTED (OTHER THAN NIL RATED/NON-GST SUPPLY) (₹)</th>
                            <th className={styles.centered}>NON-GST SUPPLIES (₹)</th>
                          </tr>
                          <tr>
                            <th className={styles.outwardTableColNum}>1</th>
                            <th className={styles.outwardTableColNum}>2</th>
                            <th className={styles.outwardTableColNum}>3</th>
                            <th className={styles.outwardTableColNum}>4</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            draft.data.outwardData.table8.section8A,
                            draft.data.outwardData.table8.section8B,
                            draft.data.outwardData.table8.section8C,
                            draft.data.outwardData.table8.section8D
                          ].map((row, idx) => (
                            <tr key={idx} className={styles.outwardTableDataRow}>
                              <td style={{ textAlign: 'left' }}>{row.label}</td>
                              <td>{row.nilRated}</td>
                              <td>{row.exempted}</td>
                              <td>{row.nonGst}</td>
                            </tr>
                          ))}
                          <tr className={styles.outwardTableSummaryRow}>
                            <td style={{ textAlign: 'left' }}>{draft.data.outwardData.table8.total.label}</td>
                            <td>{draft.data.outwardData.table8.total.nilRated}</td>
                            <td>{draft.data.outwardData.table8.total.exempted}</td>
                            <td>{draft.data.outwardData.table8.total.nonGst}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Amendments' && draft.data.amendmentsData && (
            <div className={styles.outwardTabContent}>
              {/* Accordion 9 */}
              <div className={styles.accordion}>
                <div
                  className={styles.accordionHeader}
                  onClick={() => setExpandedAccordion(prev => prev === 'table9' ? null : 'table9')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={`${styles.accordionIcon} ${expandedAccordion === 'table9' ? styles.accordionIconExpanded : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className={styles.accordionTitleGroup}>
                    <p className={styles.accordionTitle}>Table 9: Amendments to outward supplies</p>
                    <p className={styles.accordionSubtitle}>Amendments to taxable outward supply details furnished in returns for earlier tax periods in Table 4, 5 and 6</p>
                  </div>
                </div>
                {expandedAccordion === 'table9' && (
                  <div className={styles.accordionContent} style={{ padding: 0 }}>
                    <div className={styles.outwardTableWrap} style={{ border: 'none', borderRadius: 0, margin: 0 }}>
                      <table className={`${styles.outwardTable} ${styles.multiTier}`}>
                        <thead>
                          <tr>
                            <th colSpan={3} className={styles.centered}>DETAILS OF ORIGINAL DOCUMENT</th>
                            <th colSpan={5} className={styles.centered}>REVISED DETAILS OF DOCUMENT OR DETAILS OF ORIGINAL DEBIT/CREDIT NOTES OR REFUND VOUCHERS</th>
                            <th rowSpan={2} className={styles.centered}>VALUE</th>
                            <th rowSpan={2} className={styles.centered}>RATE (%)</th>
                            <th rowSpan={2} className={styles.centered}>TAXABLE VALUE</th>
                            <th rowSpan={2} className={styles.centered}>INTEGRATED TAX</th>
                          </tr>
                          <tr>
                            <th className={styles.subHeader}>GSTIN</th>
                            <th className={styles.subHeader}>INV. NO.</th>
                            <th className={styles.subHeader}>INV. DATE</th>
                            <th className={styles.subHeader}>GSTIN</th>
                            <th className={styles.subHeader}>INVOICE NO</th>
                            <th className={styles.subHeader}>INVOICE DATE</th>
                            <th className={styles.subHeader}>SHIPPING BILL NO.</th>
                            <th className={styles.subHeader}>SHIPPING BILL DATE</th>
                          </tr>
                          <tr>
                            <th className={styles.outwardTableColNum}>1</th>
                            <th className={styles.outwardTableColNum}>2</th>
                            <th className={styles.outwardTableColNum}>3</th>
                            <th className={styles.outwardTableColNum}>4</th>
                            <th className={styles.outwardTableColNum}>5</th>
                            <th className={styles.outwardTableColNum}>6</th>
                            <th className={styles.outwardTableColNum}>7</th>
                            <th className={styles.outwardTableColNum}>8</th>
                            <th className={styles.outwardTableColNum}>9</th>
                            <th className={styles.outwardTableColNum}>10</th>
                            <th className={styles.outwardTableColNum}>11</th>
                            <th className={styles.outwardTableColNum}>12</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan={12} className={styles.outwardTableSubRowHeader} style={{ color: '#5a6acf' }}>9A. If the invoice/Shipping bill details furnished earlier were incorrect</td>
                          </tr>
                          {draft.data.amendmentsData.table9.section9A.map((row, idx) => (
                            <tr key={`9a-${idx}`} className={styles.outwardTableDataRow}>
                              <td className={styles.centered}>{row.originalGstin}</td>
                              <td className={styles.centered}>{row.originalInvNo}</td>
                              <td className={styles.centered}>{row.originalInvDate}</td>
                              <td className={styles.centered}>{row.revisedGstin}</td>
                              <td className={styles.centered}>{row.revisedInvNo}</td>
                              <td className={styles.centered}>{row.revisedInvDate}</td>
                              <td className={styles.centered}>{row.sbNo}</td>
                              <td className={styles.centered}>{row.sbDate}</td>
                              <td>{row.value}</td>
                              <td className={styles.centered}>{row.rate}</td>
                              <td>{row.taxableValue}</td>
                              <td>{row.integratedTax}</td>
                            </tr>
                          ))}

                          <tr>
                            <td colSpan={12} className={styles.outwardTableSubRowHeader} style={{ color: '#5a6acf' }}>9B. Debit Notes/Credit Notes/Refund voucher [original]</td>
                          </tr>
                          {draft.data.amendmentsData.table9.section9B.map((row, idx) => (
                            <tr key={`9b-${idx}`} className={styles.outwardTableDataRow}>
                              <td className={styles.centered}>{row.originalGstin}</td>
                              <td className={styles.centered}>{row.originalInvNo}</td>
                              <td className={styles.centered}>{row.originalInvDate}</td>
                              <td className={styles.centered}>{row.revisedGstin}</td>
                              <td className={styles.centered}>{row.revisedInvNo}</td>
                              <td className={styles.centered}>{row.revisedInvDate}</td>
                              <td className={styles.centered}>{row.sbNo}</td>
                              <td className={styles.centered}>{row.sbDate}</td>
                              <td>{row.value}</td>
                              <td className={styles.centered}>{row.rate}</td>
                              <td>{row.taxableValue}</td>
                              <td>{row.integratedTax}</td>
                            </tr>
                          ))}

                          <tr>
                            <td colSpan={12} className={styles.outwardTableSubRowHeader} style={{ color: '#5a6acf' }}>9C. Debit Notes/Credit Notes/Refund voucher [amendments thereof]</td>
                          </tr>
                          {draft.data.amendmentsData.table9.section9C.map((row, idx) => (
                            <tr key={`9c-${idx}`} className={styles.outwardTableDataRow}>
                              <td className={styles.centered}>{row.originalGstin}</td>
                              <td className={styles.centered}>{row.originalInvNo}</td>
                              <td className={styles.centered}>{row.originalInvDate}</td>
                              <td className={styles.centered}>{row.revisedGstin}</td>
                              <td className={styles.centered}>{row.revisedInvNo}</td>
                              <td className={styles.centered}>{row.revisedInvDate}</td>
                              <td className={styles.centered}>{row.sbNo}</td>
                              <td className={styles.centered}>{row.sbDate}</td>
                              <td>{row.value}</td>
                              <td className={styles.centered}>{row.rate}</td>
                              <td>{row.taxableValue}</td>
                              <td>{row.integratedTax}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 10 */}
              <div className={styles.accordion}>
                <div
                  className={styles.accordionHeader}
                  onClick={() => setExpandedAccordion(prev => prev === 'table10' ? null : 'table10')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={`${styles.accordionIcon} ${expandedAccordion === 'table10' ? styles.accordionIconExpanded : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className={styles.accordionTitleGroup}>
                    <p className={styles.accordionTitle}>Table 10: Amendments to outward supplies (to unregistered persons)</p>
                    <p className={styles.accordionSubtitle}>Amendments to taxable outward supplies to unregistered persons furnished in returns for earlier tax periods in Table 7</p>
                  </div>
                </div>
                {expandedAccordion === 'table10' && (
                  <div className={styles.accordionContent} style={{ padding: 0 }}>
                    <div className={styles.outwardTableWrap} style={{ border: 'none', borderRadius: 0, margin: 0 }}>
                      <table className={`${styles.outwardTable} ${styles.multiTier}`}>
                        <thead>
                          <tr>
                            <th rowSpan={2} className={styles.centered}>RATE OF TAX (%)</th>
                            <th rowSpan={2} className={styles.centered}>TOTAL TAXABLE VALUE</th>
                            <th colSpan={3} className={styles.centered}>AMOUNT</th>
                          </tr>
                          <tr>
                            <th className={styles.subHeader}>INTEGRATED TAX</th>
                            <th className={styles.subHeader}>CENTRAL TAX</th>
                            <th className={styles.subHeader}>STATE/UT TAX</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan={2} className={styles.outwardTableSubRowHeader} style={{ fontSize: '0.625rem', fontWeight: 500 }}>Tax period for which the details are being revised</td>
                            <td colSpan={3} className={styles.outwardTableSubRowHeader} style={{ fontSize: '0.625rem', fontWeight: 500 }}>{selectedMonth} {selectedYear.startYear}</td>
                          </tr>
                          <tr>
                            <td colSpan={5} className={styles.outwardTableSubRowHeader} style={{ color: '#5a6acf' }}>10A. Intra-State Supplies [including supplies made through e-commerce operator attracting TCS] [Rate wise]</td>
                          </tr>
                          {draft.data.amendmentsData.table10.section10A.map((row, idx) => (
                            <tr key={`10a-${idx}`} className={styles.outwardTableDataRow}>
                              <td className={styles.centered}>{row.rate}</td>
                              <td>{row.taxableValue}</td>
                              <td>{row.integrated}</td>
                              <td>{row.central}</td>
                              <td>{row.state}</td>
                            </tr>
                          ))}

                          <tr>
                            <td colSpan={5} className={styles.outwardTableSubRowHeader} style={{ color: '#5a6acf' }}>10A (1). Out of supplies mentioned at 10A, value of supplies made through e-Commerce Operators attracting TCS (operator wise, rate wise)</td>
                          </tr>
                          <tr>
                            <td colSpan={2} className={styles.outwardTableSubRowHeader} style={{ fontSize: '0.625rem', fontWeight: 500 }}>GSTIN of e-commerce operator<span style={{ marginLeft: '16px', fontWeight: 600 }}>{draft.data.amendmentsData.table10.section10A1_ecommerceGstin}</span></td>
                            <td colSpan={3}></td>
                          </tr>
                          {draft.data.amendmentsData.table10.section10A1.map((row, idx) => (
                            <tr key={`10a1-${idx}`} className={styles.outwardTableDataRow}>
                              <td className={styles.centered}>{row.rate}</td>
                              <td>{row.taxableValue}</td>
                              <td>{row.integrated}</td>
                              <td>{row.central}</td>
                              <td>{row.state}</td>
                            </tr>
                          ))}

                          <tr>
                            <td colSpan={5} className={styles.outwardTableSubRowHeader} style={{ color: '#5a6acf' }}>10B. Inter-State Supplies [including supplies made through e-commerce operator attracting TCS] [Rate wise]</td>
                          </tr>
                          <tr>
                            <td colSpan={2} className={styles.outwardTableSubRowHeader} style={{ fontSize: '0.625rem', fontWeight: 500 }}>Place of Supply (Name of State)<span style={{ marginLeft: '16px', fontWeight: 600 }}>{draft.data.amendmentsData.table10.section10B_pos}</span></td>
                            <td colSpan={3}></td>
                          </tr>
                          {draft.data.amendmentsData.table10.section10B.map((row, idx) => (
                            <tr key={`10b-${idx}`} className={styles.outwardTableDataRow}>
                              <td className={styles.centered}>{row.rate}</td>
                              <td>{row.taxableValue}</td>
                              <td>{row.integrated}</td>
                              <td>{row.central}</td>
                              <td>{row.state}</td>
                            </tr>
                          ))}

                          <tr>
                            <td colSpan={5} className={styles.outwardTableSubRowHeader} style={{ color: '#5a6acf' }}>10B (1). Out of supplies mentioned at 10B, value of supplies made through e-Commerce Operators attracting TCS (operator wise, rate wise)</td>
                          </tr>
                          <tr>
                            <td colSpan={2} className={styles.outwardTableSubRowHeader} style={{ fontSize: '0.625rem', fontWeight: 500 }}>GSTIN of e-commerce operator<span style={{ marginLeft: '16px', fontWeight: 600 }}>{draft.data.amendmentsData.table10.section10B1_ecommerceGstin}</span></td>
                            <td colSpan={3}></td>
                          </tr>
                          {draft.data.amendmentsData.table10.section10B1.map((row, idx) => (
                            <tr key={`10b1-${idx}`} className={styles.outwardTableDataRow}>
                              <td className={styles.centered}>{row.rate}</td>
                              <td>{row.taxableValue}</td>
                              <td>{row.integrated}</td>
                              <td>{row.central}</td>
                              <td>{row.state}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Advanced' && draft.data.advancedData && (
            <div className={styles.outwardTabContent}>
              {/* Accordion 11 */}
              <div className={styles.accordion}>
                <div
                  className={styles.accordionHeader}
                  onClick={() => setExpandedAccordion(prev => prev === 'table11' ? null : 'table11')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={`${styles.accordionIcon} ${expandedAccordion === 'table11' ? styles.accordionIconExpanded : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className={styles.accordionTitleGroup}>
                    <p className={styles.accordionTitle}>11. Consolidated Statement of Advances Received/Advance adjusted in the current tax period/ Amendments of information furnished in earlier tax period</p>
                    <p className={styles.accordionSubtitle}>Details of nil rated, exempted and non-GST outward supplies made during the tax period</p>
                  </div>
                </div>
                {expandedAccordion === 'table11' && (
                  <div className={styles.accordionContent} style={{ padding: 0 }}>
                    <div className={styles.outwardTableWrap} style={{ border: 'none', borderRadius: 0, margin: 0 }}>
                      <table className={`${styles.outwardTable} ${styles.multiTier}`}>
                        <thead>
                          <tr>
                            <th rowSpan={2} className={styles.centered}>RATE</th>
                            <th rowSpan={2} className={styles.centered}>GROSS ADVANCE RECEIVED/ADJUSTED</th>
                            <th rowSpan={2} className={styles.centered}>PLACE OF SUPPLY</th>
                            <th colSpan={4} className={styles.centered}>AMOUNT</th>
                          </tr>
                          <tr>
                            <th className={styles.subHeader}>INTEGRATED</th>
                            <th className={styles.subHeader}>CENTRAL</th>
                            <th className={styles.subHeader}>STATE/UT</th>
                            <th className={styles.subHeader}>CESS</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan={7} className={styles.outwardTableSubRowHeader} style={{ color: '#111827', fontWeight: 600 }}>I. Information for the current tax period</td>
                          </tr>
                          <tr>
                            <td colSpan={7} className={styles.outwardTableSubRowHeader}>11A. Advance amount received in the tax period for which invoice has not been issued (tax amount to be added to output tax liability)</td>
                          </tr>
                          <tr>
                            <td colSpan={7} className={styles.outwardTableSubRowHeader}>11A (1). Intra-State supplies (Rate Wise)</td>
                          </tr>
                          {draft.data.advancedData.table11.section11A1.map((row, idx) => (
                            <tr key={`11a1-${idx}`} className={styles.outwardTableDataRow}>
                              <td className={styles.centered}>{row.rate}</td>
                              <td>{row.grossAdvance}</td>
                              <td className={styles.centered}>{row.pos}</td>
                              <td>{row.integrated}</td>
                              <td>{row.central}</td>
                              <td>{row.state}</td>
                              <td>{row.cess}</td>
                            </tr>
                          ))}

                          <tr>
                            <td colSpan={7} className={styles.outwardTableSubRowHeader}>11A (2). Inter-State Supplies (Rate Wise)</td>
                          </tr>
                          {draft.data.advancedData.table11.section11A2.map((row, idx) => (
                            <tr key={`11a2-${idx}`} className={styles.outwardTableDataRow}>
                              <td className={styles.centered}>{row.rate}</td>
                              <td>{row.grossAdvance}</td>
                              <td className={styles.centered}>{row.pos}</td>
                              <td>{row.integrated}</td>
                              <td>{row.central}</td>
                              <td>{row.state}</td>
                              <td>{row.cess}</td>
                            </tr>
                          ))}

                          <tr>
                            <td colSpan={7} className={styles.outwardTableSubRowHeader}>11B. Advance amount received in earlier tax period and adjusted against the supplies being shown in this tax period in Table Nos. 4, 5, 6 and 7</td>
                          </tr>
                          <tr>
                            <td colSpan={7} className={styles.outwardTableSubRowHeader}>11B (1). Intra-State Supplies (Rate Wise)</td>
                          </tr>
                          {draft.data.advancedData.table11.section11B1.map((row, idx) => (
                            <tr key={`11b1-${idx}`} className={styles.outwardTableDataRow}>
                              <td className={styles.centered}>{row.rate}</td>
                              <td>{row.grossAdvance}</td>
                              <td className={styles.centered}>{row.pos}</td>
                              <td>{row.integrated}</td>
                              <td>{row.central}</td>
                              <td>{row.state}</td>
                              <td>{row.cess}</td>
                            </tr>
                          ))}

                          <tr>
                            <td colSpan={7} className={styles.outwardTableSubRowHeader}>11B (2). Inter-State Supplies (Rate Wise)</td>
                          </tr>
                          {draft.data.advancedData.table11.section11B2.map((row, idx) => (
                            <tr key={`11b2-${idx}`} className={styles.outwardTableDataRow}>
                              <td className={styles.centered}>{row.rate}</td>
                              <td>{row.grossAdvance}</td>
                              <td className={styles.centered}>{row.pos}</td>
                              <td>{row.integrated}</td>
                              <td>{row.central}</td>
                              <td>{row.state}</td>
                              <td>{row.cess}</td>
                            </tr>
                          ))}

                          <tr>
                            <td colSpan={7} className={styles.outwardTableSubRowHeader} style={{ color: '#111827', fontWeight: 600 }}>II Amendment of information furnished in Table No. 11(1) in GSTR-1 statement for earlier tax periods [Furnish revised information]</td>
                          </tr>
                          <tr style={{ background: '#f8f9fa' }}>
                            <td className={styles.centered} style={{ fontWeight: 600 }}>Month</td>
                            <td colSpan={2} style={{ textAlign: 'left', fontWeight: 600 }}>Amendment relating to information furnished in S. No.(select)</td>
                            <td className={styles.centered} style={{ fontWeight: 600 }}>11A(1)</td>
                            <td className={styles.centered} style={{ fontWeight: 600 }}>11A(2)</td>
                            <td className={styles.centered} style={{ fontWeight: 600 }}>11B(1)</td>
                            <td className={styles.centered} style={{ fontWeight: 600 }}>11B(2)</td>
                          </tr>
                          {draft.data.advancedData.table11.amendments.map((row, idx) => (
                            <tr key={`11amend-${idx}`} className={styles.outwardTableDataRow}>
                              <td className={styles.centered}>{row.month}</td>
                              <td colSpan={2} style={{ textAlign: 'left' }}>{row.amendmentRelatingTo}</td>
                              <td className={styles.centered}>{row.val11A1}</td>
                              <td className={styles.centered}>{row.val11A2}</td>
                              <td className={styles.centered}>{row.val11B1}</td>
                              <td className={styles.centered}>{row.val11B2}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Others' && draft.data.othersData && (
            <div className={styles.outwardTabContent}>
              {/* Accordion 12 */}
              <div className={styles.accordion}>
                <div
                  className={styles.accordionHeader}
                  onClick={() => setExpandedAccordion(prev => prev === 'table12' ? null : 'table12')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={`${styles.accordionIcon} ${expandedAccordion === 'table12' ? styles.accordionIconExpanded : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className={styles.accordionTitleGroup}>
                    <p className={styles.accordionTitle}>12. HSN-wise summary of outward supplies</p>
                    <p className={styles.accordionSubtitle}>Summary of outward supplies of goods and/or services based on HSN</p>
                  </div>
                </div>
                {expandedAccordion === 'table12' && (
                  <div className={styles.accordionContent} style={{ padding: 0 }}>
                    <div className={styles.outwardTableWrap} style={{ border: 'none', borderRadius: 0, margin: 0 }}>
                      <table className={`${styles.outwardTable} ${styles.multiTier}`}>
                        <thead>
                          <tr>
                            <th colSpan={4} className={styles.centered}>Items</th>
                            <th colSpan={2} className={styles.centered}>Quantity & Value</th>
                            <th colSpan={5} className={styles.centered}>Tax Details</th>
                          </tr>
                          <tr>
                            <th className={styles.subHeader}>Sr. No.</th>
                            <th className={styles.subHeader}>HSN</th>
                            <th className={styles.subHeader}>Description</th>
                            <th className={styles.subHeader}>UQC</th>
                            <th className={styles.subHeader}>Total Quantity</th>
                            <th className={styles.subHeader}>Total Value</th>
                            <th className={styles.subHeader}>Taxable Value</th>
                            <th className={styles.subHeader}>Integrated Tax</th>
                            <th className={styles.subHeader}>Central Tax</th>
                            <th className={styles.subHeader}>State/UT Tax</th>
                            <th className={styles.subHeader}>Cess</th>
                          </tr>
                          <tr>
                            <th className={styles.othersTableColNum}>1</th>
                            <th className={styles.othersTableColNum}>2</th>
                            <th className={styles.othersTableColNum}>3</th>
                            <th className={styles.othersTableColNum}>4</th>
                            <th className={styles.othersTableColNum}>5</th>
                            <th className={styles.othersTableColNum}>6</th>
                            <th className={styles.othersTableColNum}>7</th>
                            <th className={styles.othersTableColNum}>8</th>
                            <th className={styles.othersTableColNum}>9</th>
                            <th className={styles.othersTableColNum}>10</th>
                            <th className={styles.othersTableColNum}>11</th>
                          </tr>
                        </thead>
                        <tbody>
                          {draft.data.othersData.table12.records.map((row, idx) => (
                            <tr key={`12-${idx}`} className={styles.outwardTableDataRow}>
                              <td className={styles.centered}>{idx + 1}</td>
                              <td className={styles.centered}>{row.hsn}</td>
                              <td className={styles.centered}>{row.description}</td>
                              <td className={styles.centered}>{row.uqc}</td>
                              <td>{row.totalQuantity}</td>
                              <td>{row.totalValue}</td>
                              <td>{row.taxableValue}</td>
                              <td>{row.integratedTax}</td>
                              <td>{row.centralTax}</td>
                              <td>{row.stateTax}</td>
                              <td>{row.cess}</td>
                            </tr>
                          ))}
                          <tr className={styles.outwardSummaryRow}>
                            <td colSpan={4} style={{ textAlign: 'left', fontWeight: 700, paddingLeft: '12px' }}>Total</td>
                            <td>{draft.data.othersData.table12.total.totalQuantity}</td>
                            <td>{draft.data.othersData.table12.total.totalValue}</td>
                            <td>{draft.data.othersData.table12.total.taxableValue}</td>
                            <td>{draft.data.othersData.table12.total.integratedTax}</td>
                            <td>{draft.data.othersData.table12.total.centralTax}</td>
                            <td>{draft.data.othersData.table12.total.stateTax}</td>
                            <td>{draft.data.othersData.table12.total.cess}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 13 */}
              <div className={styles.accordion}>
                <div
                  className={styles.accordionHeader}
                  onClick={() => setExpandedAccordion(prev => prev === 'table13' ? null : 'table13')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={`${styles.accordionIcon} ${expandedAccordion === 'table13' ? styles.accordionIconExpanded : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className={styles.accordionTitleGroup}>
                    <p className={styles.accordionTitle}>13. Documents issued during the tax period</p>
                    <p className={styles.accordionSubtitle}>Details of documents like invoices, debit notes, credit notes, etc. issued</p>
                  </div>
                </div>
                {expandedAccordion === 'table13' && (
                  <div className={styles.accordionContent} style={{ padding: 0 }}>
                    <div className={styles.outwardTableWrap} style={{ border: 'none', borderRadius: 0, margin: 0 }}>
                      <table className={`${styles.outwardTable} ${styles.multiTier}`}>
                        <thead>
                          <tr>
                            <th rowSpan={2} className={styles.centered}>Sr. No.</th>
                            <th rowSpan={2} className={styles.centered}>Nature of document</th>
                            <th colSpan={2} className={styles.centered}>Sr. No.</th>
                            <th rowSpan={2} className={styles.centered}>Total number</th>
                            <th rowSpan={2} className={styles.centered}>Cancelled</th>
                            <th rowSpan={2} className={styles.centered}>Net issued</th>
                          </tr>
                          <tr>
                            <th className={styles.subHeader}>From</th>
                            <th className={styles.subHeader}>To</th>
                          </tr>
                          <tr>
                            <th className={styles.othersTableColNum}>1</th>
                            <th className={styles.othersTableColNum}>2</th>
                            <th className={styles.othersTableColNum}>3</th>
                            <th className={styles.othersTableColNum}>4</th>
                            <th className={styles.othersTableColNum}>5</th>
                            <th className={styles.othersTableColNum}>6</th>
                            <th className={styles.othersTableColNum}>7</th>
                          </tr>
                        </thead>
                        <tbody>
                          {draft.data.othersData.table13.records.map((row, idx) => (
                            <tr key={`13-${idx}`} className={styles.outwardTableDataRow}>
                              <td className={styles.centered}>{idx + 1}</td>
                              <td className={styles.centered}>{row.natureOfDocument}</td>
                              <td className={styles.centered}>{row.from}</td>
                              <td className={styles.centered}>{row.to}</td>
                              <td className={styles.centered}>{row.totalNumber}</td>
                              <td className={styles.centered}>{row.cancelled}</td>
                              <td className={styles.centered}>{row.netIssued}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className={styles.matchFooter}>
        <p className={styles.matchFooterText}>
          By proceeding, you confirm that you have reviewed
          the matched summaries for accuracy.
        </p>
        <button
          type="button"
          className={styles.confirmFilingBtn}
          onClick={handleConfirmFiling}
        >
          Confirm & Proceed to Filing →
        </button>
      </div>
    </>
  );

  /* ── Step 3: Success ── */
  const renderSuccess = () => (
    <div className={styles.successCard}>
      <div className={styles.successContent}>
        <div className={styles.successIconWrapper}>
          <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="44" cy="44" r="44" fill="#5A6ACF"/>
            <path d="M28 44L38 54L60 32" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className={styles.successTitle}>Document Submitted<br />Successfully</h2>
        <p className={styles.successSubtitle}>
          You can see the recent filed returns in the<br />
          Recent/Filled section of your dashboard.
        </p>
        <div className={styles.successActions}>
          <button type="button" className={styles.successNewFilingBtn} onClick={resetWizard}>
            Start new filing
          </button>
          <Link to={ROUTES.dashboard.root} className={styles.successDashboardBtn}>
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      {step !== 2 && (
        <>
          <h2 className={styles.pageTitle}>GSTR-1 Filing</h2>
          <p className={styles.pageSubtitle}>
            Step {step} of 3: {STEPS[step - 1].label}
          </p>
        </>
      )}

      {renderStepper()}

      {step === 1 && !match.isMatching && (
        <>
          {renderUpload()}
          <button
            type="button"
            className={styles.proceedBtn}
            disabled={!upload.data || upload.data.validationErrors.length > 0 || upload.isPending}
            onClick={handleStartMatching}
          >
            {upload.isPending ? 'Parsing file…' : 'Proceed to Matching →'}
          </button>
        </>
      )}

      {step === 1 && match.isMatching && renderMatchingProgress()}

      {step === 2 && !match.isMatching && renderMatching()}
      {step === 3 && renderSuccess()}
    </div>
  );
}
