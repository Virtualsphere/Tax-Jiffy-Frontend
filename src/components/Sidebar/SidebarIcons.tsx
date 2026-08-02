type IconProps = {
  className?: string;
  filled?: boolean;
};

const iconSize = { width: 20, height: 20 };

/* ── Chevron Icons ── */

export function IconChevronLeft({ className }: IconProps) {
  return (
    <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export function IconChevronRight({ className }: IconProps) {
  return (
    <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function IconChevronDown({ className }: IconProps) {
  return (
    <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/* ── Supplies (Box / Package) Icon ── */

export function IconSupplies({ className, filled }: IconProps) {
  if (filled) {
    return (
      <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
        <path d="M12 1L3 5.5V18.5L12 23L21 18.5V5.5L12 1Z" />
        <path d="M12 12L3 7.5" stroke="currentColor" strokeWidth="0" />
        <line x1="3" y1="5.5" x2="12" y2="10" stroke="white" strokeWidth="1.2" />
        <line x1="21" y1="5.5" x2="12" y2="10" stroke="white" strokeWidth="1.2" />
        <line x1="12" y1="10" x2="12" y2="23" stroke="white" strokeWidth="1.2" />
        <path d="M7.5 3.25L16.5 8" stroke="white" strokeWidth="1" />
      </svg>
    );
  }
  return (
    <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
      <line x1="7.5" y1="4.21" x2="16.5" y2="9.29" />
    </svg>
  );
}

/* ── Outward Supply Icon ── */

export function IconOutwardSupply({ className, filled }: IconProps) {
  if (filled) {
    return (
      <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="white" strokeWidth="1.2" fill="none" />
        <line x1="12" y1="22.08" x2="12" y2="12" stroke="white" strokeWidth="1.2" />
        <path d="M16 12l-4-4-4 4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
      <path d="M16 14l-4-4-4 4" strokeWidth="1.5" />
    </svg>
  );
}

/* ── Inward Supply Icon ── */

export function IconInwardSupply({ className, filled }: IconProps) {
  if (filled) {
    return (
      <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="white" strokeWidth="1.2" fill="none" />
        <line x1="12" y1="22.08" x2="12" y2="12" stroke="white" strokeWidth="1.2" />
        <path d="M8 12l4 4 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
      <path d="M8 10l4 4 4-4" strokeWidth="1.5" />
    </svg>
  );
}

/* ── GST Returns (Document with GST text + Checkmark) Icon ── */

export function IconGSTReturns({ className, filled }: IconProps) {
  if (filled) {
    return (
      <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
        <path d="M6 2C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2H6z" />
        <text x="12" y="10" fill="white" fontSize="5.5" fontWeight="700" textAnchor="middle" fontFamily="Arial, sans-serif">GST</text>
        <line x1="7" y1="13" x2="17" y2="13" stroke="white" strokeWidth="1.2" />
        <line x1="7" y1="15.5" x2="17" y2="15.5" stroke="white" strokeWidth="1.2" />
        <circle cx="17.5" cy="18.5" r="4" fill="#22c55e" stroke="white" strokeWidth="1" />
        <path d="M15.5 18.5l1.2 1.2 2.3-2.3" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="2" width="14" height="18" rx="2" ry="2" fill="none" />
      <text x="11" y="10" fill="currentColor" fontSize="5.5" fontWeight="700" textAnchor="middle" fontFamily="Arial, sans-serif" stroke="none">GST</text>
      <line x1="7" y1="13" x2="15" y2="13" />
      <line x1="7" y1="15.5" x2="15" y2="15.5" />
      <circle cx="17" cy="18" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M15.2 18l1 1 2-2" strokeWidth="1.3" />
    </svg>
  );
}

/* ── E-Way Bill (Truck) Icon ── */

export function IconTruck({ className, filled }: IconProps) {
  if (filled) {
    return (
      <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
        <path d="M1 3h15v13H1z" />
        <path d="M16 8h4l3 4v4h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" fill="currentColor" stroke="white" strokeWidth="1.5" />
        <circle cx="18.5" cy="18.5" r="2.5" fill="currentColor" stroke="white" strokeWidth="1.5" />
        {/* Speed lines */}
        <line x1="0" y1="8" x2="3" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="0" y1="11" x2="2" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="0" y1="14" x2="3" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 4v4h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

/* ── E-Invoice (Document with ₹ Symbol) Icon ── */

export function IconEInvoice({ className, filled }: IconProps) {
  if (filled) {
    return (
      <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" />
        <path d="M14 2v6h6" fill="white" opacity="0.3" />
        <text x="11" y="16" fill="white" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="Arial, sans-serif">₹</text>
      </svg>
    );
  }
  return (
    <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <text x="11" y="16" fill="currentColor" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="Arial, sans-serif" stroke="none">₹</text>
    </svg>
  );
}

/* ── Settings (Gear/Cog) Icon ── */

export function IconSettings({ className, filled }: IconProps) {
  if (filled) {
    return (
      <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
        <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1112 8.4a3.6 3.6 0 010 7.2z" />
        <circle cx="12" cy="12" r="2" fill="white" />
      </svg>
    );
  }
  return (
    <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

/* ── Document (Generic) Icon ── */

export function IconDocument({ className, filled }: IconProps) {
  if (filled) {
    return (
      <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" />
        <path d="M14 2v6h6" fill="white" opacity="0.3" />
        <line x1="8" y1="13" x2="16" y2="13" stroke="white" strokeWidth="1.2" />
        <line x1="8" y1="16" x2="14" y2="16" stroke="white" strokeWidth="1.2" />
      </svg>
    );
  }
  return (
    <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="16" x2="14" y2="16" />
    </svg>
  );
}

/* ── Clipboard Icon ── */

export function IconClipboard({ className, filled }: IconProps) {
  if (filled) {
    return (
      <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
        <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" fill="white" />
        <line x1="8" y1="12" x2="16" y2="12" stroke="white" strokeWidth="1.2" />
        <line x1="8" y1="15" x2="14" y2="15" stroke="white" strokeWidth="1.2" />
      </svg>
    );
  }
  return (
    <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="15" x2="14" y2="15" />
    </svg>
  );
}

/* ── Clipboard Check Icon ── */

export function IconClipboardCheck({ className, filled }: IconProps) {
  if (filled) {
    return (
      <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
        <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" fill="white" />
        <path d="M9 13l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M9 13l2 2 4-4" />
    </svg>
  );
}

/* ── GSTR-9 Icon ── */

export function IconGstr9({ className, filled }: IconProps) {
  if (filled) {
    return (
      <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" />
        <path d="M14 2v6h6" fill="white" opacity="0.3" />
        <text x="11" y="16" fill="white" fontSize="5" fontWeight="700" textAnchor="middle" fontFamily="Arial, sans-serif">9</text>
      </svg>
    );
  }
  return (
    <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <text x="11" y="16" fill="currentColor" fontSize="5" fontWeight="700" textAnchor="middle" fontFamily="Arial, sans-serif" stroke="none">9</text>
    </svg>
  );
}

/* ── Wallet Icon ── */

export function IconWallet({ className, filled }: IconProps) {
  if (filled) {
    return (
      <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
        <path d="M21 18V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2z" />
        <path d="M3 6l9-4 9 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="17" cy="13" r="1.5" fill="white" />
      </svg>
    );
  }
  return (
    <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="6" width="18" height="14" rx="2" ry="2" />
      <path d="M3 6l9-4 9 4" />
      <circle cx="17" cy="13" r="1.5" />
    </svg>
  );
}

/* ── Book / Ledger Icon ── */

export function IconBook({ className, filled }: IconProps) {
  if (filled) {
    return (
      <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20V2H6.5A2.5 2.5 0 004 4.5v15z" />
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20v5H6.5A2.5 2.5 0 014 19.5z" opacity="0.7" />
        <line x1="8" y1="7" x2="16" y2="7" stroke="white" strokeWidth="1.2" />
        <line x1="8" y1="10" x2="13" y2="10" stroke="white" strokeWidth="1.2" />
      </svg>
    );
  }
  return (
    <svg className={className} {...iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="10" x2="13" y2="10" />
    </svg>
  );
}
