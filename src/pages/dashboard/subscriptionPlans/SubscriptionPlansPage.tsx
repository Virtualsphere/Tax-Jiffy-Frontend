import { useState } from 'react';
import { useSubscriptions } from '../user/hooks/useSubscriptions';
import {
  useCreateSubscriptionPlan,
  useUpdateSubscriptionPlan,
  useDeleteSubscriptionPlan,
} from '../user/hooks/useCreateSubscriptionPlan';
import type { SubscriptionPlanResponse } from '../user/types/subscription.types';
import type { CreateSubscriptionPlanRequest } from '../user/api/subscription.api';
import styles from './SubscriptionPlansPage.module.css';

const EMPTY_FORM: CreateSubscriptionPlanRequest = {
  name: '',
  userCount: 1,
  transactionCount: 100,
  planAmount: 0,
  isActive: true,
};

export function SubscriptionPlansPage() {
  const { data: plans, isLoading, isError } = useSubscriptions();
  const createPlan = useCreateSubscriptionPlan();
  const updatePlan = useUpdateSubscriptionPlan();
  const deletePlan = useDeleteSubscriptionPlan();

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanResponse | null>(null);
  const [form, setForm] = useState<CreateSubscriptionPlanRequest>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreate = () => {
    setEditingPlan(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (plan: SubscriptionPlanResponse) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      userCount: plan.userCount,
      transactionCount: plan.transactionCount,
      planAmount: plan.planAmount,
      isActive: plan.isActive,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPlan(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : type === 'number'
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim()) {
      setFormError('Plan name is required.');
      return;
    }

    try {
      if (editingPlan) {
        await updatePlan.mutateAsync({ id: editingPlan.id, data: form });
      } else {
        await createPlan.mutateAsync(form);
      }
      closeModal();
    } catch (err: any) {
      setFormError(
        err.response?.data?.message || err.message || 'An error occurred. Please try again.'
      );
    }
  };

  const handleDelete = async (plan: SubscriptionPlanResponse) => {
    if (!window.confirm(`Are you sure you want to delete the "${plan.name}" plan?`)) return;
    try {
      await deletePlan.mutateAsync(plan.id);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to delete plan.');
    }
  };

  const isSaving = createPlan.isPending || updatePlan.isPending;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Subscription Plans</h1>
          <p className={styles.subtitle}>Manage the plans available for users to purchase.</p>
        </div>
        <button className={styles.addBtn} onClick={openCreate}>
          <span className={styles.addIcon}>+</span> New Plan
        </button>
      </div>

      {isLoading ? (
        <div className={styles.stateBox}>Loading plans...</div>
      ) : isError ? (
        <div className={styles.stateBox}>Failed to load plans. Please refresh.</div>
      ) : !plans || plans.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <h3 className={styles.emptyTitle}>No subscription plans found</h3>
          <p className={styles.emptyText}>
            Click <strong>New Plan</strong> to create your first subscription plan. Plans will
            appear in the "Buy Subscription" modal for users.
          </p>
          <button className={styles.addBtn} onClick={openCreate}>
            Create First Plan
          </button>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Plan Name</th>
                <th className={styles.th}>Amount (₹)</th>
                <th className={styles.th}>Users Allowed</th>
                <th className={styles.th}>Transactions</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className={styles.tr}>
                  <td className={styles.td}>
                    <span className={styles.planName}>{plan.name}</span>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.amount}>₹{plan.planAmount.toLocaleString('en-IN')}</span>
                  </td>
                  <td className={styles.td}>{plan.userCount}</td>
                  <td className={styles.td}>{plan.transactionCount}</td>
                  <td className={styles.td}>
                    <span className={plan.isActive ? styles.badgeActive : styles.badgeInactive}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className={styles.td} style={{ textAlign: 'right' }}>
                    <div className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => openEdit(plan)}>
                        ✏️ Edit
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(plan)}
                        disabled={deletePlan.isPending}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
              </h2>
              <button className={styles.closeBtn} onClick={closeModal} aria-label="Close">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {formError && <p className={styles.errorAlert}>{formError}</p>}

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="name">Plan Name *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={styles.input}
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Basic, Standard, Premium"
                  required
                />
              </div>

              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="planAmount">Amount (₹) *</label>
                  <input
                    id="planAmount"
                    name="planAmount"
                    type="number"
                    min={0}
                    className={styles.input}
                    value={form.planAmount}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="userCount">Users Allowed *</label>
                  <input
                    id="userCount"
                    name="userCount"
                    type="number"
                    min={1}
                    className={styles.input}
                    value={form.userCount}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="transactionCount">Transactions Allowed *</label>
                <input
                  id="transactionCount"
                  name="transactionCount"
                  type="number"
                  min={1}
                  className={styles.input}
                  value={form.transactionCount}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.checkboxGroup}>
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  className={styles.checkbox}
                  checked={form.isActive}
                  onChange={handleChange}
                />
                <label htmlFor="isActive" className={styles.checkboxLabel}>
                  Active (visible to users in the subscription modal)
                </label>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={isSaving}>
                  {isSaving ? 'Saving...' : editingPlan ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
