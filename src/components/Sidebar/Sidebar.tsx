import { useCallback, useEffect, useId, useRef, useState } from 'react';
import logo from '@/assets/logo-icon.png';
import {
  DEFAULT_SIDEBAR_ENTITY,
  SIDEBAR_NAV_LINKS,
  SIDEBAR_NAV_SECTIONS,
} from '@/components/Sidebar/sidebar-config';
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
} from '@/components/Sidebar/SidebarIcons';
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
  defaultActiveItemId?: string;
  onActiveItemChange?: (itemId: string) => void;
};

const DEFAULT_EXPANDED_SECTIONS = SIDEBAR_NAV_SECTIONS.map((section) => section.id);

export function Sidebar({
  entity = DEFAULT_SIDEBAR_ENTITY,
  defaultCollapsed = false,
  defaultActiveItemId = 'gstr-1',
  onActiveItemChange,
}: SidebarProps) {
  const navId = useId();
  const sidebarRef = useRef<HTMLElement>(null);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [activeItemId, setActiveItemId] = useState(defaultActiveItemId);
  const [expandedSections, setExpandedSections] = useState<string[]>(
    DEFAULT_EXPANDED_SECTIONS,
  );
  const [openFlyoutSectionId, setOpenFlyoutSectionId] = useState<string | null>(null);

  const setActiveItem = useCallback(
    (itemId: string) => {
      setActiveItemId(itemId);
      onActiveItemChange?.(itemId);
    },
    [onActiveItemChange],
  );

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

  return (
    <aside
      ref={sidebarRef}
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}
      aria-label="Application navigation"
    >
      <div className={styles.header}>
        <div className={styles.brand}>
          <img src={logo} alt="" className={styles.logo} width={36} height={36} />
          <span className={styles.brandName}>TAXJIFFY</span>
        </div>
        <button
          type="button"
          className={styles.collapseBtn}
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <IconChevronRight className={styles.collapseIcon} />
          ) : (
            <IconChevronLeft className={styles.collapseIcon} />
          )}
        </button>
      </div>

      <div className={styles.entityCard}>
        <p className={styles.companyName}>{entity.companyName}</p>
        <p className={styles.gstin}>
          <span className={styles.gstinLabel}>GSTIN:</span> {entity.gstin}
        </p>
        <p className={styles.location}>{entity.location}</p>
        <p className={styles.period}>
          <span className={styles.periodLabel}>PERIOD:</span> {entity.period}
        </p>
      </div>

      <nav id={navId} className={styles.nav} aria-label="GST modules">
        <ul className={styles.navList}>
          {SIDEBAR_NAV_SECTIONS.map((section) => {
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
                        <button
                          type="button"
                          className={`${styles.subItem} ${
                            activeItemId === child.id ? styles.subItemActive : ''
                          }`}
                          onClick={() => {
                            setActiveItem(child.id);
                            if (collapsed) setOpenFlyoutSectionId(null);
                          }}
                          aria-current={activeItemId === child.id ? 'page' : undefined}
                          title={collapsed ? child.label : undefined}
                        >
                          <span className={styles.subIcon}>{child.icon}</span>
                          <span className={styles.subLabel}>{child.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}

          {SIDEBAR_NAV_LINKS.map((link) => (
            <li key={link.id}>
              <button
                type="button"
                className={`${styles.navLink} ${
                  activeItemId === link.id ? styles.navLinkActive : ''
                }`}
                onClick={() => setActiveItem(link.id)}
                aria-current={activeItemId === link.id ? 'page' : undefined}
                title={collapsed ? link.label : undefined}
              >
                <span className={styles.navLinkIcon}>{link.icon}</span>
                <span className={styles.navLinkLabel}>{link.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
