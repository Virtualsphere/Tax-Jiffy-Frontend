import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import type { ColDef, ICellRendererParams, RowClassParams } from 'ag-grid-community';
import { DataTable, column } from '@/components/UnifiedTable';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useCurrentEntity } from '@/hooks/useCurrentEntity';
import { useCurrentUserProfile } from '@/pages/dashboard/user/hooks/useCurrentUserProfile';
import { useMyCompanies } from '@/pages/dashboard/user/hooks/useMyCompanies';
import { companyGSTApi } from '@/pages/dashboard/user/api/company-gst.api';
import { userApi } from '@/pages/dashboard/user/api/user.api';
import type { CompanyGSTResponse } from '@/pages/dashboard/user/types/company-gst.types';
import { authStorage } from '@/features/auth/lib/auth-storage';
import { msUntilExpiry } from '@/features/auth/lib/jwt';
import styles from './ProfilePage.module.css';

type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'DEACTIVATED';

/** Rows within this many days of expiry are called out as needing a renewal. */
const RENEWAL_WARNING_DAYS = 7;

function money(v: number | null): string {
  if (v == null) return '—';
  return v.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}

function formatDate(v: string | null): string {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

function getStatus(gst: CompanyGSTResponse): SubscriptionStatus {
  if (!gst.isActive) return 'DEACTIVATED';
  if (!gst.isPaymentDone) return 'PENDING';
  if (gst.endDate && new Date(gst.endDate).getTime() < Date.now()) return 'EXPIRED';
  return 'ACTIVE';
}

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  ACTIVE: 'Active',
  EXPIRED: 'Expired',
  PENDING: 'Payment Pending',
  DEACTIVATED: 'Deactivated',
};

/** Days until endDate; negative once it's passed. Null when there's no endDate to measure. */
function daysUntil(endDate: string | null): number | null {
  if (!endDate) return null;
  const ms = new Date(endDate).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

/** "in 3 days" / "in about 5 hours" — how long the current session has left. */
function formatSessionRemaining(ms: number | null): string {
  if (ms == null) return 'No expiry on this session';
  if (ms <= 0) return 'Session expired';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  if (hours >= 24) return `Signed in · expires in ${plural(Math.floor(hours / 24), 'day')}`;
  if (hours >= 1) return `Signed in · expires in ${plural(hours, 'hour')}`;
  return `Signed in · expires in ${plural(Math.max(1, Math.round(ms / 60000)), 'minute')}`;
}

/**
 * Expiry date plus how long is left. The countdown is the part people act on,
 * so it sits in the cell rather than only in the summary card.
 */
function RenewalCell({ value }: ICellRendererParams) {
  if (!value) return <span className={styles.cellMuted}>—</span>;

  const days = daysUntil(String(value));
  const date = formatDate(String(value));
  if (days == null) return <>{date}</>;

  let tone = styles.noteCalm;
  let note = `in ${plural(days, 'day')}`;
  if (days < 0) {
    tone = styles.noteOverdue;
    note = `${plural(Math.abs(days), 'day')} ago`;
  } else if (days === 0) {
    tone = styles.noteUrgent;
    note = 'today';
  } else if (days <= RENEWAL_WARNING_DAYS) {
    tone = styles.noteUrgent;
  }

  return (
    <span className={styles.renewalCell}>
      <span>{date}</span>
      <span className={`${styles.note} ${tone}`}>{note}</span>
    </span>
  );
}

export function ProfilePage() {
  const { data: authUser } = useCurrentUser();
  const { data: profile, isLoading: isProfileLoading } = useCurrentUserProfile();
  const { data: activeEntity } = useCurrentEntity();
  const { data: companies, isLoading: isCompaniesLoading, isError: isCompaniesError } = useMyCompanies();

  const companyIds = useMemo(() => companies?.map((c) => c.id) ?? [], [companies]);

  const gstQueries = useQueries({
    queries: companyIds.map((companyId) => ({
      queryKey: ['company-gsts-all', companyId],
      queryFn: () => companyGSTApi.getAllByCompany(companyId),
    })),
  });

  const isLoading = isProfileLoading || isCompaniesLoading || gstQueries.some((q) => q.isLoading);
  const isError = isCompaniesError || gstQueries.some((q) => q.isError);

  const gstsByCompany = useMemo(() => {
    const map = new Map<number, CompanyGSTResponse[]>();
    companyIds.forEach((companyId, i) => {
      map.set(companyId, gstQueries[i]?.data ?? []);
    });
    return map;
  }, [companyIds, gstQueries]);

  const allGsts = useMemo(() => Array.from(gstsByCompany.values()).flat(), [gstsByCompany]);

  // Which role this user holds on each GSTIN. One request per GSTIN because the
  // only mapping endpoint is scoped to a company-GST; kept separate from the
  // page's loading gate so the rest renders while these resolve.
  const accessQueries = useQueries({
    queries: allGsts.map((gst) => ({
      queryKey: ['user-gst-mapping', gst.id],
      queryFn: () => userApi.getMappingsByGST(gst.id),
      staleTime: 5 * 60 * 1000,
    })),
  });

  /** gstId → this user's role on it. Feeds the "Your Role" column below. */
  const accessByGstId = useMemo(() => {
    const map = new Map<number, { roleName: string; isAdmin: boolean }>();
    const myId = Number(authUser.id);
    if (!Number.isFinite(myId)) return map;

    allGsts.forEach((gst, i) => {
      const mine = accessQueries[i]?.data?.find((m) => m.userId === myId && m.isActive);
      if (mine) map.set(gst.id, { roleName: mine.roleName, isAdmin: mine.isAdmin });
    });
    return map;
  }, [allGsts, accessQueries, authUser.id]);

  const adminCount = useMemo(
    () => Array.from(accessByGstId.values()).filter((a) => a.isAdmin).length,
    [accessByGstId],
  );

  const sessionNote = useMemo(
    () => formatSessionRemaining(msUntilExpiry(authStorage.getToken())),
    [],
  );

  const gstColumns: ColDef[] = useMemo(
    () => [
      column.text('gstNumber', 'GSTIN', { minWidth: 170, cellClass: 'ag-cell-left ' + styles.gstin }),
      column.text('subscriptionPlanName', 'Plan'),
      {
        ...column.tag('status', 'Status'),
        field: undefined,
        colId: 'status',
        valueGetter: (p) => (p.data ? STATUS_LABEL[getStatus(p.data)] : null),
      },
      column.date('startDate', 'Started'),
      {
        ...column.date('endDate', 'Expires'),
        cellRenderer: RenewalCell,
        minWidth: 190,
      },
      {
        ...column.number('planAmount', 'Plan Amount'),
        valueFormatter: (p) => money(p.value ?? null),
      },
      {
        ...column.text('planLimits', 'Plan Limits'),
        field: undefined,
        colId: 'planLimits',
        minWidth: 170,
        valueGetter: (p) => {
          const d = p.data as CompanyGSTResponse | undefined;
          if (!d || d.planUserCount == null) return null;
          const txns = Number(d.planTransactionCount ?? 0).toLocaleString('en-IN');
          return `${plural(d.planUserCount, 'user')} · ${txns} txns`;
        },
      },
      // Your role belongs on the GSTIN's own row. A separate access table
      // repeated the GSTIN and company columns to add one field.
      {
        ...column.text('yourRole', 'Your Role'),
        field: undefined,
        colId: 'yourRole',
        minWidth: 150,
        valueGetter: (p) => {
          const d = p.data as CompanyGSTResponse | undefined;
          if (!d) return null;
          const mine = accessByGstId.get(d.id);
          if (!mine) return null;
          return mine.isAdmin ? `${mine.roleName} · Admin` : mine.roleName;
        },
      },
    ],
    [accessByGstId],
  );

  const rowClassRules = useMemo(
    () => ({
      'billing-row-attention': (p: RowClassParams) => {
        const s = p.data ? getStatus(p.data as CompanyGSTResponse) : null;
        return s === 'PENDING' || s === 'EXPIRED';
      },
      'billing-row-soon': (p: RowClassParams) => {
        const d = p.data as CompanyGSTResponse | undefined;
        if (!d || getStatus(d) !== 'ACTIVE') return false;
        const days = daysUntil(d.endDate);
        return days != null && days >= 0 && days <= RENEWAL_WARNING_DAYS;
      },
      'billing-row-dim': (p: RowClassParams) =>
        p.data ? getStatus(p.data as CompanyGSTResponse) === 'DEACTIVATED' : false,
    }),
    [],
  );

  const summary = useMemo(() => {
    const active = allGsts.filter((g) => getStatus(g) === 'ACTIVE');
    const paid = allGsts.filter((g) => g.isPaymentDone);
    const pendingCount = allGsts.filter((g) => getStatus(g) === 'PENDING').length;
    const expiredCount = allGsts.filter((g) => getStatus(g) === 'EXPIRED').length;

    const upcomingExpiries = active
      .map((g) => ({ gst: g, days: daysUntil(g.endDate) }))
      .filter((x): x is { gst: CompanyGSTResponse; days: number } => x.days != null)
      .sort((a, b) => a.days - b.days);

    return {
      totalGstNumbers: allGsts.length,
      activeCount: active.length,
      paidCount: paid.length,
      totalSpend: paid.reduce((sum, g) => sum + (g.planAmount ?? 0), 0),
      nextExpiry: upcomingExpiries[0] ?? null,
      pendingCount,
      expiredCount,
      attentionCount: pendingCount + expiredCount,
    };
  }, [allGsts]);

  const renewalHint = useMemo(() => {
    if (summary.nextExpiry) {
      const { gst, days } = summary.nextExpiry;
      if (days < 0) return `${gst.gstNumber} · expired`;
      if (days === 0) return `${gst.gstNumber} · expires today`;
      return `${gst.gstNumber} · ${plural(days, 'day')} left`;
    }
    if (summary.activeCount === 0) return 'No active subscriptions';
    return 'No renewal dates recorded';
  }, [summary]);

  const role = profile?.roleName ?? authUser.role;

  return (
    <div className={styles.container}>
      <p className={styles.subtitle}>
        Your account, the companies and GST numbers you own, and everything you are being billed for.
      </p>

      {/* ---------- identity ---------- */}
      <section className={styles.identityCard}>
        <div className={styles.avatar} aria-hidden="true">{authUser.initials}</div>
        <div className={styles.identityMain}>
          <div className={styles.identityNameRow}>
            <h2 className={styles.identityName}>{authUser.name || 'Your account'}</h2>
            {role && <span className={styles.rolePill}>{role}</span>}
            {profile && !profile.isActive && <span className={styles.inactivePill}>Deactivated</span>}
          </div>
          <div className={styles.identityEmail}>{authUser.email}</div>
          <div className={styles.identityMeta}>
            <span>{sessionNote}</span>
            {profile?.companyName && (
              <>
                <span className={styles.metaDot}>·</span>
                <span>Home company: {profile.companyName}</span>
              </>
            )}
          </div>

          {!isLoading && !isError && (
            <div className={styles.chipRow}>
              <span className={styles.chip}>{plural(companies?.length ?? 0, 'company')}</span>
              <span className={styles.chip}>{plural(summary.totalGstNumbers, 'GST number')}</span>
              {adminCount > 0 && (
                <span className={styles.chip}>
                  Admin on {adminCount} of {summary.totalGstNumbers}
                </span>
              )}
            </div>
          )}
        </div>

        {activeEntity && (
          <div className={styles.activeEntity}>
            <div className={styles.activeEntityLabel}>Working on</div>
            <div className={styles.activeEntityGstin}>{activeEntity.gstin}</div>
            <div className={styles.activeEntityMeta}>
              {activeEntity.companyName} · {activeEntity.location}
            </div>
          </div>
        )}
      </section>

      {isError ? (
        <div className={styles.errorCard}>
          <div className={styles.errorTitle}>Couldn&apos;t load your account details</div>
          <p className={styles.errorBody}>
            The request for your companies or their GST subscriptions failed. Refresh to try again — if it keeps
            happening, the service may be unavailable.
          </p>
          <button type="button" className={styles.retryBtn} onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className={styles.statGrid} aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`${styles.statCard} ${styles.statCardSkeleton}`}>
              <div className={styles.skeletonLabel} />
              <div className={styles.skeletonValue} />
              <div className={styles.skeletonHint} />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* ---------- billing rollup ---------- */}
          <h3 className={styles.sectionTitle}>Billing</h3>
          <div className={styles.statGrid}>
            <div className={`${styles.statCard} ${styles.statCardPrimary}`}>
              <div className={styles.statLabel}>Total Spend</div>
              <div className={styles.statValue}>{money(summary.totalSpend)}</div>
              <div className={styles.statHint}>across {plural(summary.paidCount, 'paid subscription')}</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statLabel}>Active Subscriptions</div>
              <div className={styles.statValue}>{summary.activeCount}</div>
              <div className={styles.statHint}>of {plural(summary.totalGstNumbers, 'GST number')}</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statLabel}>Next Renewal</div>
              <div className={styles.statValue}>
                {summary.nextExpiry ? formatDate(summary.nextExpiry.gst.endDate) : '—'}
              </div>
              <div
                className={
                  summary.nextExpiry && summary.nextExpiry.days <= RENEWAL_WARNING_DAYS
                    ? `${styles.statHint} ${styles.expiryWarning}`
                    : styles.statHint
                }
              >
                {renewalHint}
              </div>
            </div>

            <div
              className={
                summary.attentionCount > 0 ? `${styles.statCard} ${styles.statCardAlert}` : styles.statCard
              }
            >
              <div className={styles.statLabel}>Needs Attention</div>
              <div className={styles.statValue}>
                {summary.attentionCount > 0 ? summary.attentionCount : 'All clear'}
              </div>
              <div className={styles.statHint}>
                {summary.attentionCount === 0
                  ? 'nothing overdue'
                  : [
                      summary.pendingCount > 0 ? `${summary.pendingCount} payment pending` : null,
                      summary.expiredCount > 0 ? `${summary.expiredCount} expired` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
              </div>
            </div>
          </div>

          {/* ---------- subscriptions per company ---------- */}
          <h3 className={styles.sectionTitle}>
            Companies &amp; Subscriptions
            <span className={styles.sectionCount}>{plural(companies?.length ?? 0, 'company')}</span>
          </h3>

          {(companies?.length ?? 0) === 0 && (
            <div className={styles.emptyCard}>
              <div className={styles.emptyTitle}>No companies yet</div>
              <p className={styles.emptyBody}>
                Connect a company and purchase a GST subscription — your plans, renewal dates and spend will show up
                here.
              </p>
            </div>
          )}

          {companies?.map((company) => {
            const gsts = gstsByCompany.get(company.id) ?? [];
            const companySpend = gsts
              .filter((g) => g.isPaymentDone)
              .reduce((sum, g) => sum + (g.planAmount ?? 0), 0);
            const companyActive = gsts.filter((g) => getStatus(g) === 'ACTIVE').length;

            return (
              <div key={company.id} className={styles.companySection}>
                <div className={styles.companyHeader}>
                  <span className={styles.companyName}>{company.companyName}</span>
                  <span className={styles.companyCount}>{plural(gsts.length, 'GST number')}</span>
                  {companyActive > 0 && <span className={styles.companyActive}>{companyActive} active</span>}
                  {companySpend > 0 && (
                    <span className={styles.companySpend}>
                      <span className={styles.companySpendLabel}>spend</span>
                      {money(companySpend)}
                    </span>
                  )}
                </div>

                <div className={styles.tableCard}>
                  {gsts.length === 0 ? (
                    <div className={styles.emptyRow}>No GST numbers added yet for this company.</div>
                  ) : (
                    <DataTable
                      rowData={gsts}
                      columnDefs={gstColumns}
                      hideHeader
                      variant="nested"
                      rowClassRules={rowClassRules}
                      hideFilterBar
                      hidePagination={gsts.length <= 10}
                    />
                  )}
                </div>
              </div>
            );
          })}

        </>
      )}
    </div>
  );
}
