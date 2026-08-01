import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Hamburger from 'hamburger-react';
import logo from '@/assets/logo-icon.png';
import {
  DEFAULT_SIDEBAR_ENTITY,
  SIDEBAR_ITEMS,
} from '@/components/Sidebar/sidebar-config';
import {
  IconChevronDown,
} from '@/components/Sidebar/SidebarIcons';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { authStorage } from '@/features/auth/lib/auth-storage';
import { ROUTES } from '@/config/routes';

import styles from '@/components/Sidebar/Sidebar.module.css';

export type SidebarEntity = {
  companyName: string;
  gstin: string;
  location: string;
  period: string;
};

export type SidebarProps = {
  entity?: SidebarEntity;
  defaultCollapsed?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

const DEFAULT_EXPANDED_SECTIONS = SIDEBAR_ITEMS
  .filter((item) => item.type === 'section')
  .map((section) => section.id);

export function Sidebar({
  entity = DEFAULT_SIDEBAR_ENTITY,
  defaultCollapsed = false,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const navId = useId();
  const sidebarRef = useRef<HTMLElement>(null);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [expandedSections, setExpandedSections] = useState<string[]>(
    DEFAULT_EXPANDED_SECTIONS,
  );
  const [openFlyoutSectionId, setOpenFlyoutSectionId] = useState<string | null>(null);

  const { data: user } = useCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    authStorage.clearToken();
    navigate(ROUTES.home);
  };

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev);
    setOpenFlyoutSectionId(null);
  }, []);

  const toggleSection = useCallback(
    (sectionId: string) => {
      if (collapsed) {
        setOpenFlyoutSectionId((prev) => (prev === sectionId ? null : sectionId));
        return;
      }

      setExpandedSections((prev) =>
        prev.includes(sectionId)
          ? prev.filter((id) => id !== sectionId)
          : [...prev, sectionId],
      );
    },
    [collapsed],
  );

  // Close flyout on outside click / Escape
  useEffect(() => {
    if (!collapsed || !openFlyoutSectionId) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!sidebarRef.current?.contains(event.target as Node)) {
        setOpenFlyoutSectionId(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenFlyoutSectionId(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [collapsed, openFlyoutSectionId]);



  /** Build className for NavLink sub-items */
  const subItemClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.subItem} ${isActive ? styles.subItemActive : ''}`;

  /** Build className for NavLink top-level links */
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`;

  return (
    <aside
      ref={sidebarRef}
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}
      aria-label="Application navigation"
    >
      <div className={styles.header}>
        <div className={styles.brand}>
          <img src={logo} alt="" className={styles.logo} width={36} height={36} />
          <span className={styles.brandName}>TAXJIFFY</span>
        </div>
        <div className={styles.collapseBtn}>
          <Hamburger
            toggled={!collapsed}
            toggle={toggleCollapsed}
            size={20}
          />
        </div>
      </div>

      <div className={styles.entityCard}>
        <p className={styles.companyName} style={{ color: '#000' }}>
          {entity.gstin || 'No GSTIN Added'}
        </p>
        <div className={styles.gstin} style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'nowrap', minWidth: 0 }}>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entity.companyName}</span>
          <span style={{ color: 'var(--sidebar-divider)', flexShrink: 0 }}>•</span>
          <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>{entity.location}</span>
        </div>
      </div>

      <nav id={navId} className={styles.nav} aria-label="GST modules">
        <ul className={styles.navList}>
          {SIDEBAR_ITEMS.map((item) => {
            if (item.type === 'section') {
              const section = item;
              const isExpanded = expandedSections.includes(section.id);
              const isFlyoutOpen = openFlyoutSectionId === section.id;

              return (
                <li key={section.id} className={styles.navSection}>
                  <button
                    type="button"
                    className={`${styles.sectionToggle} ${
                      (collapsed ? isFlyoutOpen : isExpanded) ? styles.sectionToggleExpanded : ''
                    }`}
                    onClick={() => toggleSection(section.id)}
                    aria-expanded={collapsed ? isFlyoutOpen : isExpanded}
                    aria-controls={`${navId}-${section.id}-children`}
                    title={collapsed ? section.label : undefined}
                  >
                    <span className={styles.sectionIcon}>{section.icon}</span>
                    <span className={styles.sectionLabel}>{section.label}</span>
                    <IconChevronDown
                      className={`${styles.sectionChevron} ${
                        (collapsed ? isFlyoutOpen : isExpanded) ? styles.sectionChevronOpen : ''
                      }`}
                    />
                  </button>

                  {(collapsed ? isFlyoutOpen : isExpanded) && (
                    <ul
                      id={`${navId}-${section.id}-children`}
                      className={`${styles.subList} ${collapsed ? styles.subListFlyout : ''}`}
                    >
                      {section.children.map((child) => (
                        <li key={child.id}>
                          <NavLink
                            to={child.path}
                            className={subItemClass}
                            onClick={() => {
                              if (collapsed) setOpenFlyoutSectionId(null);
                              onMobileClose?.();
                            }}
                            title={collapsed ? child.label : undefined}
                            end
                          >
                            <span className={styles.subIcon}>{child.icon}</span>
                            <span className={styles.subLabel}>{child.label}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }

            const link = item;
            return (
              <li key={link.id}>
                <NavLink
                  to={link.path}
                  className={navLinkClass}
                  title={collapsed ? link.label : undefined}
                  onClick={() => onMobileClose?.()}
                  end
                >
                  <span className={styles.navLinkIcon}>{link.icon}</span>
                  <span className={styles.navLinkLabel}>{link.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.userProfile}>
        <div className={styles.avatar} aria-label="User avatar" title={user.name}>{user.initials}</div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user.name}</span>
          <span className={styles.userEmail}>{user.email}</span>
        </div>
        <button onClick={handleLogout} className={styles.logoutButton} title="Logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </aside>
  );
}
