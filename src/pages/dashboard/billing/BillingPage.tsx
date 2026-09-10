import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useMyCompanies } from '@/pages/dashboard/user/hooks/useMyCompanies';
import { companyGSTApi } from '@/pages/dashboard/user/api/company-gst.api';
import type { CompanyGSTResponse } from '@/pages/dashboard/user/types/company-gst.types';
import type { ColDef } from 'ag-grid-community';
import { DataTable, column } from '@/components/UnifiedTable';
import styles from './BillingPage.module.css';

type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'DEACTIVATED';

function money(v: number | null): string {
  if (v == null) return '—';
  return v.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}

function formatDate(v: string | null): string {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getStatus(gst: CompanyGSTResponse): SubscriptionStatus {
  if (!gst.isActive) return 'DEACTIVATED';
  if (!gst.isPaymentDone) return 'PENDING';
  if (gst.endDate && new Date(gst.endDate).getTime() < Date.now()) return 'EXPIRED';
  return 'ACTIVE';
}

const STATUS_META: Record<SubscriptionStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'statusActive' },
  EXPIRED: { label: 'Expired', className: 'statusExpired' },
  PENDING: { label: 'Payment Pending', className: 'statusPending' },
  DEACTIVATED: { label: 'Deactivated', className: 'statusDeactivated' },
};

/** Days until endDate; negative once it's passed. Null when there's no endDate to measure. */
function daysUntil(endDate: string | null): number | null {
  if (!endDate) return null;
  const ms = new Date(endDate).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function BillingPage() {
  const { data: companies, isLoading: isCompaniesLoading, isError: isCompaniesError } = useMyCompanies();

  const companyIds = useMemo(() => companies?.map((c) => c.id) ?? [], [companies]);

  const gstQueries = useQueries({
    queries: companyIds.map((companyId) => ({
      queryKey: ['company-gsts-all', companyId],
      queryFn: () => companyGSTApi.getAllByCompany(companyId),
    })),
  });

  const isLoading = isCompaniesLoading || gstQueries.some((q) => q.isLoading);
  const isError = isCompaniesError || gstQueries.some((q) => q.isError);

  const gstsByCompany = useMemo(() => {
    const map = new Map<number, CompanyGSTResponse[]>();
    companyIds.forEach((companyId, i) => {
      map.set(companyId, gstQueries[i]?.data ?? []);
    });
    return map;
  }, [companyIds, gstQueries]);

  const allGsts = useMemo(() => Array.from(gstsByCompany.values()).flat(), [gstsByCompany]);

  const gstColumns: ColDef[] = useMemo(
    () => [
      column.text('gstNumber', 'GSTIN', { minWidth: 170, cellClass: 'ag-cell-left ' + styles.gstin }),
      column.text('subscriptionPlanName', 'Plan'),
      {
        ...column.tag('status', 'Status'),
        field: undefined,
        colId: 'status',
        valueGetter: (p) => (p.data ? STATUS_META[getStatus(p.data)].label : null),
      },
      column.date('startDate', 'Start Date'),
      column.date('endDate', 'Expiry Date'),
      {
        ...column.number('planAmount', 'Plan Amount'),
        valueFormatter: (p) => money(p.value ?? null),
      },
      column.number('planUserCount', 'User Limit'),
      column.number('planTransactionCount', 'Transaction Limit'),
    ],
    [],
  );

  const summary = useMemo(() => {
    const active = allGsts.filter((g) => getStatus(g) === 'ACTIVE');
    const totalSpend = allGsts
      .filter((g) => g.isPaymentDone)
      .reduce((sum, g) => sum + (g.planAmount ?? 0), 0);

    const upcomingExpiries = active
      .map((g) => ({ gst: g, days: daysUntil(g.endDate) }))
      .filter((x): x is { gst: CompanyGSTResponse; days: number } => x.days != null)
      .sort((a, b) => a.days - b.days);

    return {
      totalGstNumbers: allGsts.length,
      activeCount: active.length,
      totalSpend,
      nextExpiry: upcomingExpiries[0] ?? null,
    };
  }, [allGsts]);

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Billing</h1>
        <p className={styles.subtitle}>Your subscription plans, GST number history, and spend across every company you own.</p>
      </div>

      {isLoading ? (
        <p>Loading your billing details...</p>
      ) : isError ? (
        <p>Error loading billing details.</p>
      ) : (
        <>
          <div className={styles.statGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>GST Numbers Purchased</div>
              <div className={styles.statValue}>{summary.totalGstNumbers}</div>
              <div className={styles.statHint}>{summary.activeCount} active</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Active Subscriptions</div>
              <div className={styles.statValue}>{summary.activeCount}</div>
              <div className={styles.statHint}>of {summary.totalGstNumbers} total</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Total Spend</div>
              <div className={styles.statValue}>{money(summary.totalSpend)}</div>
              <div className={styles.statHint}>across all paid subscriptions</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Next Renewal</div>
              {summary.nextExpiry ? (
                <>
                  <div className={styles.statValue}>{formatDate(summary.nextExpiry.gst.endDate)}</div>
                  <div className={summary.nextExpiry.days <= 7 ? `${styles.statHint} ${styles.expiryWarning}` : styles.statHint}>
                    {summary.nextExpiry.gst.gstNumber} · {summary.nextExpiry.days <= 0 ? 'expiring today' : `${summary.nextExpiry.days} day${summary.nextExpiry.days === 1 ? '' : 's'} left`}
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.statValue}>—</div>
                  <div className={styles.statHint}>No active subscriptions</div>
                </>
              )}
            </div>
          </div>

          {(companies?.length ?? 0) === 0 && (
            <p className={styles.emptyState}>No companies found. Connect a company and purchase a GST subscription to see billing details here.</p>
          )}

          {companies?.map((company) => {
            const gsts = gstsByCompany.get(company.id) ?? [];
            return (
              <div key={company.id} className={styles.companySection}>
                <div className={styles.companyHeader}>
                  <span className={styles.companyName}>{company.companyName}</span>
                  <span className={styles.companyCount}>{gsts.length} GST number{gsts.length === 1 ? '' : 's'}</span>
                </div>

                <div className={styles.tableCard}>
                  {gsts.length === 0 ? (
                    <p className={styles.emptyState}>No GST numbers added yet for this company.</p>
                  ) : (
                      <DataTable
                        rowData={gsts}
                        columnDefs={gstColumns}
                        hideHeader
                        variant="nested"
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
