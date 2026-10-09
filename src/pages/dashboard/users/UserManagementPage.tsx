import { useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import styles from './UserManagementPage.module.css';
import { DataTable, column, rowActionsColumn } from '@/components/UnifiedTable';
import { useGSTUsers } from '../user/hooks/useGSTUsers';
import { useCompanyUsers } from '../user/hooks/useCompanyUsers';
import { useCreateSubUser } from '../user/hooks/useCreateSubUser';
import { useDeactivateMapping } from '../user/hooks/useDeactivateMapping';
import { useSubscriptions } from '../user/hooks/useSubscriptions';
import { useCurrentEntity } from '@/hooks/useCurrentEntity';
import { usePermissions } from '@/features/permissions';
import { useRoles } from '../roles/hooks/useRoles';
import { useUpdateUserRole } from '../user/hooks/useUpdateUserRole';

/** One row of the users grid. */
type UserRow = {
  mappingId: number;
  userIdLabel: string;
  userName: string;
  email: string;
  roleId: number | null;
  roleName: string;
  isAdmin: boolean;
  isActive: boolean;
};

/** User name with the active/inactive dot the old table rendered. */
function UserNameCell({ data }: ICellRendererParams<UserRow>) {
  if (!data) return null;
  return (
    <span className={styles.userNameText}>
      <span className={data.isActive ? styles.statusIndicator : styles.statusIndicatorInactive} />
      {data.userName}
    </span>
  );
}

export function UserManagementPage() {
  const { data: currentEntity } = useCurrentEntity();
  const selectedCompanyId = currentEntity.companyId || null;
  const selectedGSTId = currentEntity.id || null;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [editRoleId, setEditRoleId] = useState<number | ''>('');
  const [editError, setEditError] = useState('');

  const { can } = usePermissions();
  const canAddUser = can('User Management', 'add');
  const canEditUser = can('User Management', 'edit');
  const canDeleteUser = can('User Management', 'delete');

  // Roles a user can be given on this GST. ADMIN belongs to the GST owner only.
  const { data: roles } = useRoles(selectedCompanyId ?? '', selectedGSTId ?? '');
  const assignableRoles = useMemo(
    () => (roles ?? []).filter((r) => r.roleName.toUpperCase() !== 'ADMIN'),
    [roles],
  );

  // Add User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRoleId, setNewUserRoleId] = useState<number | ''>('');
  const [formError, setFormError] = useState('');

  // Queries
  const { data: plans } = useSubscriptions();

  // Fetch users mapping and company users for email resolution
  const { data: mappings, isLoading: isMappingsLoading } = useGSTUsers(selectedGSTId || undefined);
  const { data: companyUsers } = useCompanyUsers(selectedCompanyId || undefined);

  // Get active GST plan details
  const activePlanName = currentEntity.subscriptionPlanName;
  const matchedPlan = plans?.find(p => p.name === activePlanName);
  const userLimit = matchedPlan ? matchedPlan.userCount : 1;

  const currentActiveUsersCount = mappings?.filter(m => m.isActive).length || 0;
  const isLimitReached = currentActiveUsersCount >= userLimit;

  // Mutations
  const createSubUser = useCreateSubUser();
  const deactivateMapping = useDeactivateMapping();
  const updateUserRole = useUpdateUserRole();

  const openEditRole = (row: UserRow) => {
    setEditError('');
    setEditRoleId(row.roleId ?? '');
    setEditingUser(row);
  };

  const handleEditRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editRoleId) {
      setEditError('Please select a role.');
      return;
    }
    try {
      await updateUserRole.mutateAsync({
        mappingId: editingUser.mappingId,
        roleId: Number(editRoleId),
        gstId: selectedGSTId!,
      });
      setEditingUser(null);
    } catch (err) {
      const serverMessage = isAxiosError<{ message?: string }>(err) ? err.response?.data?.message : undefined;
      setEditError(serverMessage || (err instanceof Error ? err.message : '') || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (mappingId: number) => {
    if (confirm('Are you sure you want to remove this user from this GST registration?')) {
      try {
        await deactivateMapping.mutateAsync({ mappingId, gstId: selectedGSTId! });
      } catch (err: any) {
        alert(err.response?.data?.message || err.message || 'Failed to remove user');
      }
    }
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (isLimitReached) {
      setFormError(`User limit reached. Your plan allows a maximum of ${userLimit} user(s).`);
      return;
    }

    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      setFormError('All fields are required.');
      return;
    }

    try {
      await createSubUser.mutateAsync({
        companyGstId: selectedGSTId!,
        userName: newUserName,
        userEmail: newUserEmail,
        userPassword: newUserPassword,
        roleId: newUserRoleId ? Number(newUserRoleId) : undefined,
      });

      // Clear form
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRoleId('');
      setIsAddModalOpen(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to create user');
    }
  };

  const rowData: UserRow[] = useMemo(
    () =>
      (mappings ?? []).map((m) => ({
        mappingId: m.id,
        userIdLabel: `U${String(m.userId).padStart(4, '0')}`,
        userName: m.userName,
        email: companyUsers?.find((cu) => cu.id === m.userId)?.userEmail || 'N/A',
        roleId: m.roleId ?? null,
        roleName: m.roleName || 'USER',
        isAdmin: !!m.isAdmin,
        isActive: m.isActive,
      })),
    [mappings, companyUsers],
  );

  const columnDefs: ColDef[] = useMemo(
    () => [
      column.text('userIdLabel', 'User ID', { maxWidth: 120 }),
      { ...column.text('userName', 'User Name', { minWidth: 180 }), cellRenderer: UserNameCell },
      column.text('email', 'Email', { minWidth: 220 }),
      column.text('roleName', 'Role'),
      rowActionsColumn<UserRow>([
        {
          label: 'Edit',
          onClick: openEditRole,
          // The GST admin's role is fixed; the backend rejects changing it.
          hidden: (row) => !canEditUser || row.isAdmin,
          title: 'Change role',
        },
        {
          label: 'Delete',
          variant: 'danger',
          onClick: (row) => handleDeleteUser(row.mappingId),
          disabled: () => deactivateMapping.isPending,
          hidden: (row) => !canDeleteUser || row.isAdmin,
        },
      ]),
    ],
    // handleDeleteUser closes over selectedGSTId, which is the part that matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deactivateMapping.isPending, selectedGSTId, canEditUser, canDeleteUser],
  );

  const emptyMessage = !selectedGSTId
    ? 'Please select a company and active GSTIN to manage users.'
    : "No users found for the selected GSTIN. Click '+ Add User' to invite someone.";

  return (
    <div className={styles.container}>
      {/* Top Header Row with dropdown selectors and Add button */}
      <div className={styles.headerRow}>
        <div className={styles.controls}>
          {selectedGSTId && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '12px',
                backgroundColor: isLimitReached ? '#fef2f2' : '#f0fdf4',
                color: isLimitReached ? '#ef4444' : '#10b981',
                border: `1px solid ${isLimitReached ? '#fca5a5' : '#bbf7d0'}`,
                letterSpacing: '0.025em',
              }}
            >
              Limit: {currentActiveUsersCount} / {userLimit} ({activePlanName || 'Plan'})
            </span>
          )}
        </div>

        {canAddUser && (
        <button
          className={styles.addBtn}
          onClick={() => {
            setFormError('');
            setIsAddModalOpen(true);
          }}
          disabled={!selectedGSTId || createSubUser.isPending || isLimitReached}
          title={isLimitReached ? `User limit reached (${currentActiveUsersCount}/${userLimit} users allowed on ${activePlanName || 'Plan'})` : undefined}
          style={isLimitReached ? { opacity: 0.5, cursor: 'not-allowed', backgroundColor: '#64748b' } : undefined}
        >
          <span>+</span> Add User
        </button>
        )}
      </div>

      <DataTable
        title="Users List"
        rowData={rowData}
        columnDefs={columnDefs}
        loading={isMappingsLoading}
        loadingMessage="Loading users…"
        emptyMessage={emptyMessage}
      />

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h4 className={styles.modalTitle}>Add Sub-User</h4>
              <button className={styles.closeBtn} onClick={() => setIsAddModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleAddUserSubmit}>
              <div className={styles.modalBody}>
                {formError && <div className={styles.errorAlert}>{formError}</div>}

                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Enter full name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address</label>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="Enter email address"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Password</label>
                  <input
                    type="password"
                    className={styles.input}
                    placeholder="Enter temporary password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Role</label>
                  <select
                    className={styles.input}
                    value={newUserRoleId}
                    onChange={(e) => setNewUserRoleId(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">Default (USER)</option>
                    {assignableRoles.map((r) => (
                      <option key={r.id} value={r.id}>{r.roleName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={createSubUser.isPending}>
                  {createSubUser.isPending ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {editingUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h4 className={styles.modalTitle}>Change Role</h4>
              <button className={styles.closeBtn} onClick={() => setEditingUser(null)}>×</button>
            </div>
            <form onSubmit={handleEditRoleSubmit}>
              <div className={styles.modalBody}>
                {editError && <div className={styles.errorAlert}>{editError}</div>}

                <div className={styles.formGroup}>
                  <label className={styles.label}>User</label>
                  <input type="text" className={styles.input} value={editingUser.userName} readOnly />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Role</label>
                  <select
                    className={styles.input}
                    value={editRoleId}
                    onChange={(e) => setEditRoleId(e.target.value ? Number(e.target.value) : '')}
                    required
                  >
                    <option value="" disabled>Select a role</option>
                    {assignableRoles.map((r) => (
                      <option key={r.id} value={r.id}>{r.roleName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={updateUserRole.isPending}>
                  {updateUserRole.isPending ? 'Saving...' : 'Save Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
