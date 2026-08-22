import type { Gstr2bMatchStatus } from '../../types/gstr2b-filing.types';
import { HEADS, type HeadId, type ReconSummary } from './reconAggregate';
import { BUCKET_BULK, BUCKET_META, BUCKET_ORDER, PLAYBOOK, moneyRounded } from './reconMeta';
import styles from './Recon.module.css';

export type BucketFilter = Gstr2bMatchStatus | 'ALL';

/** Below this a difference is presentational noise and reads as a dash. */
const NOISE = 0.5;

function cellClass(value: number, signed: boolean): string {
  if (Math.abs(value) < NOISE) return styles.nil;
  if (!signed) return '';
  return value < 0 ? styles.neg : styles.pos;
}

function cellText(value: number, signed: boolean): string {
  if (Math.abs(value) < NOISE) return '—';
  if (!signed) return moneyRounded(value);
  return `${value > 0 ? '+' : '−'}${moneyRounded(Math.abs(value))}`;
}

function headCells(get: (head: HeadId) => number, signed: boolean) {
  return HEADS.map((head) => {
    const value = get(head.id);
    return (
      <td key={head.id} className={cellClass(value, signed)}>
        {cellText(value, signed)}
      </td>
    );
  });
}

export interface ReconBandProps {
  summary: ReconSummary;
  retPeriod: string;
  activeBucket: BucketFilter;
  onToggleBucket: (bucket: Gstr2bMatchStatus) => void;
  /** Vendor the view is scoped to, or null for the whole period. */
  scopeLabel: string | null;
  onClearScope: () => void;
  statementOpen: boolean;
  onToggleStatement: () => void;
}

/**
 * Three lines instead of sixty-four numbers: what needs attention, how it splits,
 * and — on demand — the statement that proves the split adds back up.
 */
export function ReconBand({
  summary,
  retPeriod,
  activeBucket,
  onToggleBucket,
  scopeLabel,
  onClearScope,
  statementOpen,
  onToggleStatement,
}: ReconBandProps) {
  const exposure = summary.atRisk + summary.unclaimed;
  const grand = exposure || 1;
  const segments = BUCKET_ORDER.filter((bucket) => {
    if (bucket === 'MATCHED') return false;
    const rollup = summary.byBucket[bucket];
    return rollup.count > 0 && rollup.atRisk + rollup.unclaimed >= 1;
  });

  const bucketsInPlay = BUCKET_ORDER.filter((bucket) => summary.byBucket[bucket].count > 0);
  const explained = {} as Record<HeadId, number>;
  for (const head of HEADS) {
    explained[head.id] = bucketsInPlay.reduce(
      (total, bucket) => total + summary.byBucket[bucket].diff[head.id],
      0,
    );
  }
  const explainedCount = bucketsInPlay.reduce((total, bucket) => total + summary.byBucket[bucket].count, 0);
  const countDiff = summary.imsCount - summary.gstr2bCount;

  return (
    <section className={styles.band}>
      <div className={styles.bandTop}>
        <h2 className={styles.bandAmount}>
          ₹{moneyRounded(exposure)}
          <span>
            needs attention across {summary.attentionCount} of {summary.rowCount} invoices
          </span>
        </h2>

        {scopeLabel && (
          <span className={styles.chip}>
            {scopeLabel}
            <button type="button" className={styles.chipX} onClick={onClearScope} aria-label="Clear vendor filter">
              ×
            </button>
          </span>
        )}

        <button
          type="button"
          className={styles.disclose}
          onClick={onToggleStatement}
          aria-expanded={statementOpen}
        >
          {statementOpen ? 'Hide statement' : 'Reconciliation statement'}
        </button>
      </div>

      <div className={styles.segbar}>
        {segments.map((bucket) => {
          const rollup = summary.byBucket[bucket];
          const meta = BUCKET_META[bucket];
          const amount = rollup.atRisk + rollup.unclaimed;
          return (
            <button
              key={bucket}
              type="button"
              className={`${styles.seg} ${activeBucket === bucket ? styles.segOn : ''}`}
              style={{ width: `${(amount / grand) * 100}%`, background: meta.color }}
              title={`${meta.label} — ₹${moneyRounded(amount)}`}
              aria-label={`${meta.label}, ₹${moneyRounded(amount)}`}
              aria-pressed={activeBucket === bucket}
              onClick={() => onToggleBucket(bucket)}
            />
          );
        })}
      </div>

      <div className={styles.legend}>
        {segments.map((bucket) => {
          const rollup = summary.byBucket[bucket];
          const meta = BUCKET_META[bucket];
          return (
            <button key={bucket} type="button" className={styles.legendKey} onClick={() => onToggleBucket(bucket)}>
              <span className={styles.legendDot} style={{ background: meta.color }} />
              {meta.short} <b className={styles.legendVal}>₹{moneyRounded(rollup.atRisk + rollup.unclaimed)}</b>{' '}
              <span className={styles.legendCount}>({rollup.count})</span>
            </button>
          );
        })}

        <span className={styles.legendTail}>
          <span>
            At risk <b>₹{moneyRounded(summary.atRisk)}</b>
          </span>
          <span>
            Unclaimed <b>₹{moneyRounded(summary.unclaimed)}</b>
          </span>
          <span>{summary.matchedCount} matched</span>
          {summary.editedCount > 0 && (
            <span className={styles.corrected}>
              <b className={styles.corrected}>{summary.editedCount} corrected</b>
            </span>
          )}
        </span>
      </div>

      {statementOpen && (
        <div className={styles.statement}>
          <div className={styles.stmtScroll}>
            <table className={styles.stmtTable}>
              <thead>
                <tr>
                  <th>Reconciliation statement · {retPeriod}</th>
                  <th>Invoices</th>
                  {HEADS.map((head) => (
                    <th key={head.id}>{head.label}</th>
                  ))}
                  <th className={styles.fixHead}>Possible fix</th>
                </tr>
              </thead>
              <tbody>
                <tr className={styles.stmtRow}>
                  <td>Input tax credit as per GSTR-2B</td>
                  <td>{summary.gstr2bCount}</td>
                  {headCells((id) => summary.gstr2b[id], false)}
                  <td />
                </tr>
                <tr className={styles.stmtRow}>
                  <td>Input tax credit as per IMS</td>
                  <td>{summary.imsCount}</td>
                  {headCells((id) => summary.ims[id], false)}
                  <td />
                </tr>
                <tr className={styles.stmtDiff}>
                  <td>Difference (IMS − GSTR-2B)</td>
                  <td className={countDiff === 0 ? styles.nil : countDiff > 0 ? styles.pos : styles.neg}>
                    {countDiff === 0 ? '—' : `${countDiff > 0 ? '+' : '−'}${Math.abs(countDiff)}`}
                  </td>
                  {headCells((id) => summary.ims[id] - summary.gstr2b[id], true)}
                  <td />
                </tr>

                <tr className={styles.stmtSect}>
                  <td colSpan={HEADS.length + 3}>Explained by — click a row to work on those invoices below</td>
                </tr>

                {bucketsInPlay.map((bucket) => {
                  const rollup = summary.byBucket[bucket];
                  const meta = BUCKET_META[bucket];
                  return (
                    <tr
                      key={bucket}
                      className={`${styles.stmtBucket} ${activeBucket === bucket ? styles.stmtBucketOn : ''}`}
                      onClick={() => onToggleBucket(bucket)}
                    >
                      <td>
                        <span className={styles.bucketName}>
                          <span className={styles.bucketDot} style={{ background: meta.color }} />
                          {meta.label}
                        </span>
                      </td>
                      <td className={styles.cntCell}>{rollup.count}</td>
                      {headCells((id) => rollup.diff[id], true)}
                      <td className={styles.fixCell}>{PLAYBOOK[bucket]?.fix ?? ''}</td>
                    </tr>
                  );
                })}

                <tr className={styles.stmtTie}>
                  <td>Total explained</td>
                  <td className={styles.nil}>{explainedCount}</td>
                  {headCells((id) => explained[id], true)}
                  <td />
                </tr>
                <tr className={styles.stmtSect}>
                  <td colSpan={HEADS.length + 3}>
                    {summary.tiesOut ? (
                      <span className={styles.tick}>
                        ✓ Explained difference ties to the control total on every tax head
                      </span>
                    ) : (
                      <span className={`${styles.tick} ${styles.tickBad}`}>
                        ⚠ Does not tie — an invoice is missing from the buckets
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

export interface ReconContextBarProps {
  bucket: Gstr2bMatchStatus;
  summary: ReconSummary;
  onRunBulk: () => void;
  onClear: () => void;
  busy: boolean;
  disabled: boolean;
}

/**
 * One destination for "show me these": the bucket's guidance and its one-click fix
 * ride along with the filtered grid instead of living in a separate help panel.
 */
export function ReconContextBar({ bucket, summary, onRunBulk, onClear, busy, disabled }: ReconContextBarProps) {
  const meta = BUCKET_META[bucket];
  const rollup = summary.byBucket[bucket];
  const playbook = PLAYBOOK[bucket];
  const bulk = BUCKET_BULK[bucket];
  if (!meta || !rollup || rollup.count === 0) return null;

  return (
    <div className={styles.ctxbar}>
      <span className={styles.bucketDot} style={{ background: meta.color }} />
      <span className={styles.ctxTitle}>
        {meta.label}
        <em>
          {rollup.count} invoice{rollup.count === 1 ? '' : 's'}
        </em>
      </span>
      <span className={styles.ctxGuide}>{playbook?.act}</span>
      <span className={styles.ctxMoney}>
        {rollup.unclaimed > NOISE && <b className={styles.gain}>+₹{moneyRounded(rollup.unclaimed)}</b>}
        {rollup.atRisk > NOISE && <b className={styles.loss}>−₹{moneyRounded(rollup.atRisk)}</b>}
      </span>
      {bulk && (
        <button
          type="button"
          className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
          onClick={onRunBulk}
          disabled={disabled || busy}
        >
          {busy ? 'Applying…' : `${bulk.label} ${rollup.count}`}
        </button>
      )}
      <button type="button" className={`${styles.btn} ${styles.btnSm}`} onClick={onClear}>
        Clear
      </button>
    </div>
  );
}
