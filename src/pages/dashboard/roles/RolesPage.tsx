import { useState, useMemo, useEffect } from 'react';
import styles from './RolesPage.module.css';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from './hooks/useRoles';
import type { RolesResponse } from './types/roles.types';
import { UserManagementPage } from '../users/UserManagementPage';
import { useSaveRoleMapping, useRoleMappings } from './hooks/useRoleMapping';
import type { RoleMappingRequest } from './types/roleMapping.types';
import { useCurrentEntity } from '@/hooks/useCurrentEntity';
import { APP_PAGES } from '@/config/app-pages';
import type { ColDef } from 'ag-grid-community';
import { DataTable, column, rowActionsColumn } from '@/components/UnifiedTable';

/* ── Helpers ─────────────────────────────────────────── */
function formatRoleId(id: number): string {
  return `R${String(id).padStart(4, '0')}`;
}


type PermissionField = 'view' | 'add' | 'edit' | 'delete';

const PERMISSION_FIELDS: { field: PermissionField; label: string }[] = [
  { field: 'view', label: 'View' },
  { field: 'add', label: 'Add' },
  { field: 'edit', label: 'Edit' },
  { field: 'delete', label: 'Delete' },
];

type ScreenPermission = {
  pageName: string;
  screenName: string;
  add: boolean;
  edit: boolean;
  view: boolean;
  delete: boolean;
  mappingId?: number;
};

/* ── Permissions matrix (shared by the Add and Edit dialogs) ── */
interface PermissionsTableProps {
  permissions: ScreenPermission[];
  onToggle: (index: number, field: PermissionField) => void;
  onToggleColumn: (field: PermissionField, checked: boolean) => void;
}

function PermissionsTable({ permissions, onToggle, onToggleColumn }: PermissionsTableProps) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.th}>Page Name</th>
          <th className={styles.th}>Screen Name</th>
          {PERMISSION_FIELDS.map(({ field, label }) => {
            const allChecked = permissions.length > 0 && permissions.every((row) => row[field]);
            return (
              <th key={field} className={styles.thCenter}>
                <div>{label}</div>
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={(e) => onToggleColumn(field, e.target.checked)}
                  title={`${allChecked ? 'Clear' : 'Select'} ${label} on every screen`}
                />
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {permissions.map((row, idx) => (
          <tr key={`${row.pageName}||${row.screenName}`} className={styles.tr}>
            <td className={styles.td}>{row.pageName}</td>
            <td className={styles.td}>{row.screenName}</td>
            {PERMISSION_FIELDS.map(({ field }) => (
              <td key={field} className={styles.tdCenter}>
                <input type="checkbox" checked={row[field]} onChange={() => onToggle(idx, field)} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── Add Role Modal ───────────────────────────────────── */
interface AddRoleModalProps {
  nextRoleId: number;
  companyId: number | '';
  companyGstId: number | '';
  onClose: () => void;
}

function AddRoleModal({ nextRoleId, companyId, companyGstId, onClose }: AddRoleModalProps) {
  const [roleName, setRoleName] = useState('');
  const [error, setError] = useState('');
  const createRole = useCreateRole();
  const saveMapping = useSaveRoleMapping();

  const [permissions, setPermissions] = useState<ScreenPermission[]>(
    APP_PAGES.map(s => ({ ...s, add: false, edit: false, view: false, delete: false }))
  );

  const togglePermission = (index: number, field: PermissionField) => {
    const newPerms = [...permissions];
    newPerms[index] = { ...newPerms[index], [field]: !newPerms[index][field] };
    setPermissions(newPerms);
  };

  const toggleColumn = (field: PermissionField, checked: boolean) => {
    setPermissions((prev) => prev.map((row) => ({ ...row, [field]: checked })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!roleName.trim()) {
      setError('Role name is required.');
      return;
    }
    if (!companyId || !companyGstId) {
      setError('Please select a Company and GSTIN from the top dropdowns.');
      return;
    }
    try {
      const createdRole = await createRole.mutateAsync({ 
        roleName: roleName.trim(),
        companyId: Number(companyId),
        companyGstId: Number(companyGstId),
      });

      const grantedPermissions = permissions.filter(
        (p) => p.view || p.add || p.edit || p.delete,
      );

      const mappingPromises = grantedPermissions.map(p => {
        const req: RoleMappingRequest = {
          roleId: createdRole.id,
          companyId: Number(companyId),
          companyGstId: Number(companyGstId),
          pageNumber: p.pageName,
          screenNumber: p.screenName,
          add: p.add,
          edit: p.edit,
          view: p.view,
          delete: p.delete,
        };
        return saveMapping.mutateAsync({ data: req });
      });

      await Promise.all(mappingPromises);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create role.');
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.modalContent} ${styles.modalContentLg}`} style={{ maxWidth: '800px', width: '90%' }}>
        <div className={styles.modalHeader}>
          <h4 className={styles.modalTitle}>Add New Role</h4>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {error && <div className={styles.errorAlert}>{error}</div>}

            <div className={styles.formGroupRow} style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label className={styles.label}>Role ID</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    className={`${styles.input} ${styles.inputReadonly}`}
                    value={formatRoleId(nextRoleId)}
                    readOnly
                  />
                </div>
              </div>

              <div className={styles.formGroup} style={{ flex: 2 }}>
                <label className={styles.label}>Role Name</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Enter role name"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <h5 className={styles.sectionTitle} style={{ marginTop: '20px', marginBottom: '10px', fontSize: '1.1rem', fontWeight: 600 }}>Permissions</h5>
            <div className={styles.tableContainer} style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <PermissionsTable
                permissions={permissions}
                onToggle={togglePermission}
                onToggleColumn={toggleColumn}
              />
            </div>

          </div>
          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={createRole.isPending || saveMapping.isPending}>
              {createRole.isPending || saveMapping.isPending ? 'Saving...' : 'Save Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Edit Role Modal ──────────────────────────────────── */
interface EditRoleModalProps {
  role: RolesResponse;
  companyId: number | '';
  companyGstId: number | '';
  onClose: () => void;
}

function EditRoleModal({ role, companyId, companyGstId, onClose }: EditRoleModalProps) {
  const [roleName, setRoleName] = useState(role.roleName);
  const [error, setError] = useState('');
  const updateRole = useUpdateRole();
  const saveMapping = useSaveRoleMapping();
  
  const { data: existingMappings, isLoading: isMappingsLoading } = useRoleMappings(role.id, companyGstId);

  const [permissions, setPermissions] = useState<ScreenPermission[]>(
    APP_PAGES.map(s => ({ ...s, add: false, edit: false, view: false, delete: false }))
  );

  useEffect(() => {
    if (existingMappings && existingMappings.length > 0) {
      const merged = APP_PAGES.map(screen => {
        const mapping = existingMappings.find(m => m.pageNumber === screen.pageName && m.screenNumber === screen.screenName);
        return {
          ...screen,
          mappingId: mapping?.id,
          add: mapping?.add ?? false,
          edit: mapping?.edit ?? false,
          view: mapping?.view ?? false,
          delete: mapping?.delete ?? false,
        };
      });
      setPermissions(merged);
    }
  }, [existingMappings]);

  const togglePermission = (index: number, field: PermissionField) => {
    const newPerms = [...permissions];
    newPerms[index] = { ...newPerms[index], [field]: !newPerms[index][field] };
    setPermissions(newPerms);
  };

  const toggleColumn = (field: PermissionField, checked: boolean) => {
    setPermissions((prev) => prev.map((row) => ({ ...row, [field]: checked })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!roleName.trim()) {
      setError('Role name is required.');
      return;
    }
    if (!companyId || !companyGstId) {
      setError('Please select a Company and GSTIN from the top dropdowns.');
      return;
    }
    try {
      await updateRole.mutateAsync({ 
        id: role.id, 
        data: { 
          roleName: roleName.trim(),
          companyId: Number(companyId),
          companyGstId: Number(companyGstId),
        } 
      });

      const changedPermissions = permissions.filter(
        (p) => p.mappingId != null || p.view || p.add || p.edit || p.delete,
      );

      const mappingPromises = changedPermissions.map(p => {
        const req: RoleMappingRequest = {
          roleId: role.id,
          companyId: Number(companyId),
          companyGstId: Number(companyGstId),
          pageNumber: p.pageName,
          screenNumber: p.screenName,
          add: p.add,
          edit: p.edit,
          view: p.view,
          delete: p.delete,
        };
        return saveMapping.mutateAsync({ id: p.mappingId, data: req });
      });

      await Promise.all(mappingPromises);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update role.');
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.modalContent} ${styles.modalContentLg}`} style={{ maxWidth: '800px', width: '90%' }}>
        <div className={styles.modalHeader}>
          <h4 className={styles.modalTitle}>Edit Role</h4>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {error && <div className={styles.errorAlert}>{error}</div>}
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Role Name</label>
              <input
                type="text"
                className={styles.input}
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                autoFocus
              />
            </div>

            <h5 className={styles.sectionTitle} style={{ marginTop: '20px', marginBottom: '10px', fontSize: '1.1rem', fontWeight: 600 }}>Permissions</h5>
            <div className={styles.tableContainer} style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {isMappingsLoading ? (
                 <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading permissions...</p>
              ) : (
                <PermissionsTable
                  permissions={permissions}
                  onToggle={togglePermission}
                  onToggleColumn={toggleColumn}
                />
              )}
            </div>
            
          </div>
          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={updateRole.isPending || saveMapping.isPending}>
              {updateRole.isPending || saveMapping.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Delete Role Modal ────────────────────────────────── */
interface DeleteRoleModalProps {
  role: RolesResponse;
  onClose: () => void;
}

function DeleteRoleModal({ role, onClose }: DeleteRoleModalProps) {
  const [error, setError] = useState('');
  const deleteRole = useDeleteRole();

  const handleDelete = async () => {
    setError('');
    try {
      await deleteRole.mutateAsync(role.id);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete role.');
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.modalContent} ${styles.modalContentSm}`}>
        <div className={styles.modalHeader}>
          <h4 className={styles.modalTitle}>Delete Role</h4>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className={styles.modalBody}>
          {error && <div className={styles.errorAlert}>{error}</div>}
          <p className={styles.deleteMessage}>
            Are you sure you want to delete this role?{' '}
            <strong>This action cannot be undone.</strong>
          </p>
        </div>
        <div className={styles.modalFooter}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.deleteConfirmBtn}
            onClick={handleDelete}
            disabled={deleteRole.isPending}
          >
            {deleteRole.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────── */
export function RolesPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'users'>('roles');

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RolesResponse | null>(null);
  const [deletingRole, setDeletingRole] = useState<RolesResponse | null>(null);

  // Queries
  const { data: currentEntity } = useCurrentEntity();
  const selectedCompanyId = currentEntity.companyId || '';
  const selectedGSTId = currentEntity.id || '';

  const { data: roles, isLoading: isRolesLoading } = useRoles(selectedCompanyId, selectedGSTId);
  if (currentEntity) { console.log('Current Entity in RolesPage 2:', currentEntity); }

  // Roles as grid rows. Search and pagination are handled by DataTable.
  const roleRows = useMemo(
    () =>
      (roles ?? []).map((role) => ({
        ...role,
        roleIdLabel: formatRoleId(role.id),
      })),
    [roles],
  );

  type RoleRow = (typeof roleRows)[number];

  const columnDefs: ColDef[] = useMemo(
    () => [
      column.text('roleIdLabel', 'Role ID', { maxWidth: 140 }),
      column.text('roleName', 'Role Name', { minWidth: 200 }),
      rowActionsColumn<RoleRow>([
        { label: 'Edit', onClick: (role) => setEditingRole(role), title: 'Edit role' },
        {
          label: 'Delete',
          variant: 'danger',
          onClick: (role) => setDeletingRole(role),
          title: 'Delete role',
        },
      ]),
    ],
    [],
  );

  // Next role ID prediction (max id + 1)
  const nextRoleId = roles && roles.length > 0
    ? Math.max(...roles.map((r) => r.id)) + 1
    : 1;

  const isLoading = isRolesLoading;

  return (
    <div className={styles.container}>
      {/* ── Tabs ── */}
      <div className={styles.tabsRow}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'roles' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          Manage Roles
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'users' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Manage Users
        </button>
      </div>

      {activeTab === 'users' ? (
        <UserManagementPage />
      ) : (
        <>
          {/* ── Header ── */}
          <div className={styles.headerRow}>
            <div className={styles.titleBlock}>
              <span className={styles.sectionLabel}>Administration</span>
              <h1 className={styles.pageTitle}>Roles</h1>
            </div>
            <div className={styles.controls}>

          <button
            id="roles-add-btn"
            className={styles.addBtn}
            onClick={() => setIsAddModalOpen(true)}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Role
          </button>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className={styles.mainContent}>
        {/* ── Roles Table Card ── */}
        <div>
          <div className={styles.card}>
            <DataTable
              title="Roles List"
              rowData={roleRows}
              columnDefs={columnDefs}
              loading={isLoading}
              loadingMessage="Loading roles..."
              emptyMessage={'No roles found. Click "+ Add Role" to create the first one.'}
              variant="nested"
            />
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className={styles.sidebar}>
          <div className={styles.infoCard}>
            <div className={styles.infoCardHeader}>
              <div className={styles.infoCardIcon}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className={styles.infoCardTitle}>Role Permissions Matrix</h4>
            </div>
            <p className={styles.infoCardText}>
              System roles define the functional boundaries for every user in the TaxJiffy
              ecosystem. Changes to these roles will propagate immediately across all assigned
              user accounts. We recommend regular audits of "Super Admin" privileges to ensure
              fiscal security.
            </p>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Assignments</div>
            <div className={styles.statValue}>
              {isLoading ? '—' : roles?.length ?? 0}
            </div>
            <div className={styles.statChange}>↑ Active roles in system</div>
          </div>
        </div>
      </div>
      </>
      )}

      {/* ── Modals ── */}
      {isAddModalOpen && (
        <AddRoleModal
          nextRoleId={nextRoleId}
          companyId={selectedCompanyId}
          companyGstId={selectedGSTId}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {editingRole && (
        <EditRoleModal
          role={editingRole}
          companyId={selectedCompanyId}
          companyGstId={selectedGSTId}
          onClose={() => setEditingRole(null)}
        />
      )}

      {deletingRole && (
        <DeleteRoleModal
          role={deletingRole}
          onClose={() => setDeletingRole(null)}
        />
      )}
    </div>
  );
}
