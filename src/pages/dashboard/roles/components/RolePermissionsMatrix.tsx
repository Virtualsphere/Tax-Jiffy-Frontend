import { useState, useMemo } from 'react';
import styles from './RolePermissionsMatrix.module.css';
import { useRoles } from '../hooks/useRoles';
import { useRoleMappings, useSaveRoleMapping } from '../hooks/useRoleMapping';
import type { RoleMappingRequest } from '../types/roleMapping.types';
import { useMyCompanies } from '../../user/hooks/useMyCompanies';
import { useCompanyGSTs } from '../../user/hooks/useCompanyGSTs';

// Hardcoded screens list to map permissions against
const AVAILABLE_SCREENS = [
  { pageName: 'Menus', screenName: 'Appearance - Menus' },
  { pageName: 'Dashboard', screenName: 'Dashboard View' },
  { pageName: 'User Management', screenName: 'Users List' },
  { pageName: 'GSTR-1', screenName: 'B2B Invoices' },
  { pageName: 'GSTR-1', screenName: 'B2C Invoices' },
];

export function RolePermissionsMatrix() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | ''>('');
  const [selectedGSTId, setSelectedGSTId] = useState<number | ''>('');
  const [selectedRoleId, setSelectedRoleId] = useState<number | ''>('');
  
  // State to track which row is being edited
  const [editingRowIdx, setEditingRowIdx] = useState<number | null>(null);
  
  // Temporary state for the row currently being edited
  const [editState, setEditState] = useState<{
    id?: number;
    add: boolean;
    edit: boolean;
    view: boolean;
    delete: boolean;
  } | null>(null);

  const { data: companies, isLoading: isCompaniesLoading } = useMyCompanies();
  const { data: gsts, isLoading: isGstsLoading } = useCompanyGSTs(
    selectedCompanyId ? Number(selectedCompanyId) : 0
  );
  const { data: roles, isLoading: isRolesLoading } = useRoles(selectedCompanyId, selectedGSTId);

  const { data: roleMappings, isLoading: isMappingsLoading } = useRoleMappings(
    selectedRoleId,
    selectedGSTId
  );
  
  const saveMapping = useSaveRoleMapping();

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCompanyId(e.target.value ? Number(e.target.value) : '');
    setSelectedGSTId('');
  };

  // Combine available screens with fetched mappings
  const matrixData = useMemo(() => {
    return AVAILABLE_SCREENS.map((screen, idx) => {
      const mapping = roleMappings?.find(
        (m) => m.pageNumber === screen.pageName && m.screenNumber === screen.screenName
      );
      return {
        ...screen,
        mappingId: mapping?.id,
        add: mapping?.add ?? false,
        edit: mapping?.edit ?? false,
        view: mapping?.view ?? false,
        delete: mapping?.delete ?? false,
        index: idx,
      };
    });
  }, [roleMappings]);

  const handleEdit = (row: typeof matrixData[0]) => {
    setEditingRowIdx(row.index);
    setEditState({
      id: row.mappingId,
      add: row.add,
      edit: row.edit,
      view: row.view,
      delete: row.delete,
    });
  };

  const handleCancel = () => {
    setEditingRowIdx(null);
    setEditState(null);
  };

  const handleSave = async (row: typeof matrixData[0]) => {
    if (!editState || !selectedCompanyId || !selectedGSTId || !selectedRoleId) return;
    
    const requestData: RoleMappingRequest = {
      roleId: Number(selectedRoleId),
      companyId: Number(selectedCompanyId),
      companyGstId: Number(selectedGSTId),
      pageNumber: row.pageName,
      screenNumber: row.screenName,
      add: editState.add,
      edit: editState.edit,
      view: editState.view,
      delete: editState.delete,
    };
    
    try {
      await saveMapping.mutateAsync({
        id: editState.id,
        data: requestData,
      });
      setEditingRowIdx(null);
      setEditState(null);
    } catch (err) {
      console.error('Failed to save mapping', err);
      alert('Failed to save mapping. Please try again.');
    }
  };

  const togglePermission = (field: 'add' | 'edit' | 'view' | 'delete') => {
    if (editState) {
      setEditState({
        ...editState,
        [field]: !editState[field],
      });
    }
  };

  return (
    <div className={styles.container}>
      {/* Filters Row */}
      <div className={styles.filtersRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Select Company</label>
          <select
            className={styles.select}
            value={selectedCompanyId}
            onChange={handleCompanyChange}
            disabled={isCompaniesLoading}
          >
            <option value="">-- Choose Company --</option>
            {companies?.map((c) => (
              <option key={c.id} value={c.id}>{c.companyName}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Select GSTIN</label>
          <select
            className={styles.select}
            value={selectedGSTId}
            onChange={(e) => setSelectedGSTId(e.target.value ? Number(e.target.value) : '')}
            disabled={isGstsLoading || !selectedCompanyId}
          >
            <option value="">-- Choose GSTIN --</option>
            {gsts?.map((g) => (
              <option key={g.id} value={g.id}>{g.gstNumber}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Select Role</label>
          <select
            className={styles.select}
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value ? Number(e.target.value) : '')}
            disabled={isRolesLoading}
          >
            <option value="">-- Choose Role --</option>
            {roles?.map((r) => (
              <option key={r.id} value={r.id}>{r.roleName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Matrix Table */}
      <div className={styles.matrixSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Permissions Matrix</h3>
        </div>

        <div className={styles.tableContainer}>
          {!selectedCompanyId || !selectedGSTId || !selectedRoleId ? (
            <div className={styles.emptyState}>
              Please select Company, GSTIN, and Role to view and manage permissions.
            </div>
          ) : isMappingsLoading ? (
            <div className={styles.emptyState}>Loading permissions...</div>
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
                  <th className={styles.thCenter}>Action</th>
                </tr>
              </thead>
              <tbody>
                {matrixData.map((row) => {
                  const isEditing = editingRowIdx === row.index;
                  
                  // Render cell helper
                  const renderCheckbox = (field: 'add' | 'edit' | 'view' | 'delete', isChecked: boolean) => {
                    if (isEditing) {
                      return (
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            className={styles.checkboxInput}
                            checked={editState?.[field] ?? false}
                            onChange={() => togglePermission(field)}
                          />
                        </label>
                      );
                    }
                    // Read only view
                    return isChecked ? (
                      <span className={styles.badgeYes}>YES</span>
                    ) : (
                      <span className={styles.badgeNo}>NO</span>
                    );
                  };

                  return (
                    <tr key={row.index} className={styles.tr}>
                      <td className={styles.td}>
                        <span className={styles.pageName}>{row.pageName}</span>
                      </td>
                      <td className={styles.td}>
                        <span className={styles.screenName}>{row.screenName}</span>
                      </td>
                      <td className={styles.tdCenter}>{renderCheckbox('view', row.view)}</td>
                      <td className={styles.tdCenter}>{renderCheckbox('add', row.add)}</td>
                      <td className={styles.tdCenter}>{renderCheckbox('edit', row.edit)}</td>
                      <td className={styles.tdCenter}>{renderCheckbox('delete', row.delete)}</td>
                      <td className={styles.tdCenter}>
                        <div className={styles.actionCell}>
                          {isEditing ? (
                            <>
                              <button 
                                className={styles.saveBtn} 
                                onClick={() => handleSave(row)}
                                disabled={saveMapping.isPending}
                              >
                                {saveMapping.isPending ? 'Saving...' : 'Save'}
                              </button>
                              <button 
                                className={styles.cancelBtn} 
                                onClick={handleCancel}
                                disabled={saveMapping.isPending}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button 
                              className={styles.editBtn} 
                              onClick={() => handleEdit(row)}
                            >
                              Edit
                            </button>
                          )}
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
    </div>
  );
}
