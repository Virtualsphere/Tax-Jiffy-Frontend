import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import styles from './CompaniesDashboardPage.module.css';
import { useMyCompanies } from '../user/hooks/useMyCompanies';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ConnectEntityModal } from '../user/components/ConnectEntityModal/ConnectEntityModal';

interface TiltState {
  rotateX: number;
  rotateY: number;
  glareX: number;
  glareY: number;
  glareOpacity: number;
}

function TiltCard({ children, className, onClick }: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [tilt, setTilt] = useState<TiltState>({
    rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, glareOpacity: 0,
  });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const maxTilt = 6;
      const rotateY = ((x - centerX) / centerX) * maxTilt;
      const rotateX = ((centerY - y) / centerY) * maxTilt;

      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;

      setTilt({ rotateX, rotateY, glareX, glareY, glareOpacity: 0.15 });
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, glareOpacity: 0 });
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={className}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(1.01, 1.01, 1.01)`,
        transition: tilt.glareOpacity > 0
          ? 'box-shadow 0.2s ease'
          : 'transform 0.4s ease, box-shadow 0.4s ease',
      }}
    >
      {children}
      <div
        className={styles.glare}
        style={{
          background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,${tilt.glareOpacity}), transparent 60%)`,
        }}
      />
    </div>
  );
}

export function CompaniesDashboardPage() {
  const navigate = useNavigate();
  const [isConnectModalOpen, setConnectModalOpen] = useState(false);
  
  const { data: user } = useCurrentUser();
  const { data: companies, isLoading } = useMyCompanies();

  useEffect(() => {
    const handleOpenModal = () => setConnectModalOpen(true);
    window.addEventListener('open-connect-company-modal', handleOpenModal);
    return () => window.removeEventListener('open-connect-company-modal', handleOpenModal);
  }, []);

  const handleNavigateToCompany = (companyId: number) => {
    navigate(`${ROUTES.dashboard.user}?companyId=${companyId}`);
  };

  const handleConnectEntityClose = (companyId?: number, isNew?: boolean) => {
    setConnectModalOpen(false);
    if (typeof companyId === 'number') {
      if (isNew) {
        navigate(ROUTES.dashboard.companies);
      } else {
        handleNavigateToCompany(companyId);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>My Companies</h1>
          <p className={styles.subtitle}>Select a company to view its active GST reconciliations.</p>
        </div>
      </div>

      {isLoading ? (
        <p>Loading your companies...</p>
      ) : (
        <div className={styles.grid}>
          {companies.map((company) => (
            <TiltCard 
              key={company.id} 
              className={styles.tile}
              onClick={() => handleNavigateToCompany(company.id)}
            >
              {company.companyLogo && (
                <>
                  <img src={company.companyLogo} alt="" className={styles.tileBackground} />
                  <div className={styles.tileOverlay} />
                </>
              )}
              
              <div className={company.companyLogo ? styles.tileContentWithBg : styles.tileContent}>
                {!company.companyLogo && (
                  <div className={styles.logoWrapper}>
                    <span style={{ fontSize: '32px', color: '#cbd5e1' }}>🏢</span>
                  </div>
                )}
                <h2 className={company.companyLogo ? styles.companyNameLight : styles.companyName}>
                  {company.companyName}
                </h2>
                <div className={company.companyLogo ? styles.companyStatusLight : styles.companyStatus}>
                  {company.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </TiltCard>
          ))}

          <TiltCard 
            className={`${styles.tile} ${styles.addNewTile}`}
            onClick={() => setConnectModalOpen(true)}
          >
            <div className={styles.addIcon}>
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className={styles.addNewText}>Add New Company</div>
          </TiltCard>
        </div>
      )}

      {isConnectModalOpen && (
        <ConnectEntityModal onClose={handleConnectEntityClose} />
      )}
    </div>
  );
}
