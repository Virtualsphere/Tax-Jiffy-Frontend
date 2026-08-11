import { useState } from 'react';
import styles from './UserManagementPage.module.css';
import { useGSTUsers } from '../user/hooks/useGSTUsers';
import { useCompanyUsers } from '../user/hooks/useCompanyUsers';
import { useCreateSubUser } from '../user/hooks/useCreateSubUser';
import { useDeactivateMapping } from '../user/hooks/useDeactivateMapping';
import { useSubscriptions } from '../user/hooks/useSubscriptions';
import { useCurrentEntity } from '@/hooks/useCurrentEntity';

export function UserManagementPage() {
  const { data: currentEntity } = useCurrentEntity();
  const selectedCompanyId = currentEntity.companyId || null;
  const selectedGSTId = currentEntity.id || null;

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
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
      });

      // Clear form
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setIsAddModalOpen(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to create user');
    }
  };

  // Filter users by search term
  const filteredMappings = mappings?.filter((m) => {
    const email = companyUsers?.find((cu) => cu.id === m.userId)?.userEmail || '';
    const searchString = `${m.userName} ${email} ${m.roleName}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const isLoading = isMappingsLoading;

  return (
    <div className={styles.container}>
      {/* Top Header Row with dropdown selectors and Add button */}
      <div className={styles.headerRow}>
        <div className={styles.controls}>
        </div>

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
      </div>

      {/* Main card box containing table and search */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h3 className={styles.cardTitle}>Users List</h3>
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
                  letterSpacing: '0.025em'
                }}
              >
                Limit: {currentActiveUsersCount} / {userLimit} ({activePlanName || 'Plan'})
              </span>
            )}
          </div>
          <div className={styles.searchWrapper}>
            <svg
              className={styles.searchIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tableContainer}>
          {isLoading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
              Loading users...
            </div>
          ) : !selectedGSTId ? (
            <div className={styles.emptyState}>
              Please select a company and active GSTIN to manage users.
            </div>
          ) : !filteredMappings || filteredMappings.length === 0 ? (
            <div className={styles.emptyState}>
              No users found for the selected GSTIN. Click '+ Add User' to invite someone.
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>User ID</th>
                  <th className={styles.th}>User Name</th>
                  <th className={styles.th}>Email</th>
                  <th className={styles.th}>Role</th>
                  <th className={styles.th} style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMappings.map((m) => {
                  const email = companyUsers?.find((cu) => cu.id === m.userId)?.userEmail || 'N/A';
                  return (
                    <tr key={m.id}>
                      <td className={styles.td}>
                        <span className={styles.userIdText}>U{String(m.userId).padStart(4, '0')}</span>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.userNameText}>
                          <span className={m.isActive ? styles.statusIndicator : styles.statusIndicatorInactive} />
                          {m.userName}
                        </div>
                      </td>
                      <td className={styles.td}>{email}</td>
                      <td className={styles.td}>{m.roleName || 'USER'}</td>
                      <td className={styles.td} style={{ textAlign: 'right' }}>
                        <div className={styles.actionsCell} style={{ justifyContent: 'flex-end' }}>
                          <button className={styles.editBtn} disabled>
                            📝 Edit
                          </button>
                          <button 
                            className={styles.deleteBtn}
                            onClick={() => handleDeleteUser(m.id)}
                            disabled={deactivateMapping.isPending}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

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
    </div>
  );
}
