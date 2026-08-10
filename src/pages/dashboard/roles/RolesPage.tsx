import { useState, useMemo, useEffect } from 'react';
import styles from './RolesPage.module.css';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from './hooks/useRoles';
import { useMyCompanies } from '../user/hooks/useMyCompanies';
import { useCompanyGSTs } from '../user/hooks/useCompanyGSTs';
import type { RolesResponse } from './types/roles.types';
import { UserManagementPage } from '../users/UserManagementPage';
import { useSaveRoleMapping, useRoleMappings } from './hooks/useRoleMapping';
import type { RoleMappingRequest } from './types/roleMapping.types';
import { useCurrentEntity } from '@/hooks/useCurrentEntity';

const ITEMS_PER_PAGE = 10;

/* ── Helpers ─────────────────────────────────────────── */
function formatRoleId(id: number): string {
  return `R${String(id).padStart(4, '0')}`;
}


const AVAILABLE_SCREENS = [
  { pageName: 'Menus', screenName: 'Appearance - Menus' },
  { pageName: 'Dashboard', screenName: 'Dashboard View' },
  { pageName: 'User Management', screenName: 'Users List' },
  { pageName: 'GSTR-1', screenName: 'B2B Invoices' },
  { pageName: 'GSTR-1', screenName: 'B2C Invoices' },
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
    AVAILABLE_SCREENS.map(s => ({ ...s, add: false, edit: false, view: false, delete: false }))
  );

  const togglePermission = (index: number, field: 'add' | 'edit' | 'view' | 'delete') => {
    const newPerms = [...permissions];
    newPerms[index] = { ...newPerms[index], [field]: !newPerms[index][field] };
    setPermissions(newPerms);
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

      const mappingPromises = permissions.map(p => {
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
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Page Name</th>
                    <th className={styles.th}>Screen Name</th>
                    <th className={styles.thCenter}>View</th>
                    <th className={styles.thCenter}>Add</th>
                    <th className={styles.thCenter}>Edit</th>
                    <th className={styles.thCenter}>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((row, idx) => (
                    <tr key={idx} className={styles.tr}>
                      <td className={styles.td}>{row.pageName}</td>
                      <td className={styles.td}>{row.screenName}</td>
                      <td className={styles.tdCenter}><input type="checkbox" checked={row.view} onChange={() => togglePermission(idx, 'view')} /></td>
                      <td className={styles.tdCenter}><input type="checkbox" checked={row.add} onChange={() => togglePermission(idx, 'add')} /></td>
                      <td className={styles.tdCenter}><input type="checkbox" checked={row.edit} onChange={() => togglePermission(idx, 'edit')} /></td>
                      <td className={styles.tdCenter}><input type="checkbox" checked={row.delete} onChange={() => togglePermission(idx, 'delete')} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
    AVAILABLE_SCREENS.map(s => ({ ...s, add: false, edit: false, view: false, delete: false }))
  );

  useEffect(() => {
    if (existingMappings && existingMappings.length > 0) {
      const merged = AVAILABLE_SCREENS.map(screen => {
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

  const togglePermission = (index: number, field: 'add' | 'edit' | 'view' | 'delete') => {
    const newPerms = [...permissions];
    newPerms[index] = { ...newPerms[index], [field]: !newPerms[index][field] };
    setPermissions(newPerms);
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

      const mappingPromises = permissions.map(p => {
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
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Page Name</th>
                      <th className={styles.th}>Screen Name</th>
                      <th className={styles.thCenter}>View</th>
                      <th className={styles.thCenter}>Add</th>
                      <th className={styles.thCenter}>Edit</th>
                      <th className={styles.thCenter}>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((row, idx) => (
                      <tr key={idx} className={styles.tr}>
                        <td className={styles.td}>{row.pageName}</td>
                        <td className={styles.td}>{row.screenName}</td>
                        <td className={styles.tdCenter}><input type="checkbox" checked={row.view} onChange={() => togglePermission(idx, 'view')} /></td>
                        <td className={styles.tdCenter}><input type="checkbox" checked={row.add} onChange={() => togglePermission(idx, 'add')} /></td>
                        <td className={styles.tdCenter}><input type="checkbox" checked={row.edit} onChange={() => togglePermission(idx, 'edit')} /></td>
                        <td className={styles.tdCenter}><input type="checkbox" checked={row.delete} onChange={() => togglePermission(idx, 'delete')} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RolesResponse | null>(null);
  const [deletingRole, setDeletingRole] = useState<RolesResponse | null>(null);

  // Queries
  const { data: currentEntity, isLoading: isEntityLoading } = useCurrentEntity();
  const selectedCompanyId = currentEntity.companyId || '';
  const selectedGSTId = currentEntity.id || '';

  const { data: roles, isLoading: isRolesLoading } = useRoles(selectedCompanyId, selectedGSTId);
  if (currentEntity) { console.log('Current Entity in RolesPage 2:', currentEntity); }

  // Filtered + paginated roles
  const filteredRoles = useMemo(() => {
    if (!roles) return [];
    const term = searchTerm.toLowerCase();
    return roles.filter(
      (r) =>
        r.roleName.toLowerCase().includes(term) ||
        formatRoleId(r.id).toLowerCase().includes(term)
    );
  }, [roles, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / ITEMS_PER_PAGE));
  const paginatedRoles = filteredRoles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Auto-reset page when search changes
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

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
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Roles List</h3>
              <div className={styles.searchWrapper}>
                <svg
                  className={styles.searchIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  id="roles-search"
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.tableContainer}>
              {isLoading ? (
                <div className={styles.loadingRow}>Loading roles...</div>
              ) : filteredRoles.length === 0 ? (
                <div className={styles.emptyState}>
                  {searchTerm
                    ? 'No roles match your search.'
                    : 'No roles found. Click "+ Add Role" to create the first one.'}
                </div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Role ID</th>
                      <th className={styles.th}>Role Name</th>
                      <th className={styles.th} style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRoles.map((role) => (
                      <tr key={role.id} className={styles.tr}>
                        <td className={styles.td}>
                          <span className={styles.roleIdText}>{formatRoleId(role.id)}</span>
                        </td>
                        <td className={styles.td}>
                          <div className={styles.roleNameCell}>
                            <span className={`${styles.dotIndicator} ${!role.isActive ? styles.dotInactive : ''}`} />
                            {role.roleName}
                          </div>
                        </td>
                        <td className={styles.td}>
                          <div className={styles.actionsCell}>
                            <button
                              id={`edit-role-${role.id}`}
                              className={styles.editBtn}
                              onClick={() => setEditingRole(role)}
                              title="Edit role"
                            >
                              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              id={`delete-role-${role.id}`}
                              className={styles.deleteBtn}
                              onClick={() => setDeletingRole(role)}
                              title="Delete role"
                            >
                              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {!isLoading && filteredRoles.length > 0 && (
              <div className={styles.pagination}>
                <div className={styles.pageInfo}>
                  Showing{' '}
                  <strong>
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredRoles.length)}
                  </strong>{' '}
                  of <strong>{filteredRoles.length}</strong>
                </div>
                <div className={styles.pageControls}>
                  <button
                    className={styles.pageBtn}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    title="Previous page"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`${styles.pageBtn} ${page === currentPage ? styles.active : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className={styles.pageBtn}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    title="Next page"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
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
