import iconBook from '@/assets/icons/icon-book.png';
import iconReceipt from '@/assets/icons/icon-receipt.png';
import iconClipboard from '@/assets/icons/icon-clipboard.png';
import iconClipboardCheck from '@/assets/icons/icon-clipboard-check.png';
import iconDocument from '@/assets/icons/icon-document.png';
import iconRegister from '@/assets/icons/icon-register.png';
import iconWallet from '@/assets/icons/icon-wallet.png';
import iconTruck from '@/assets/icons/icon-truck.png';
import iconOutwardSupply from '@/assets/icons/icon-outward-supply.png';
import iconInwardSupply from '@/assets/icons/icon-inward-supply.png';

type IconProps = {
  className?: string;
};

const iconDefaults = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function IconChevronLeft({ className }: IconProps) {
  return (
    <svg className={className} {...iconDefaults}>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export function IconChevronRight({ className }: IconProps) {
  return (
    <svg className={className} {...iconDefaults}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function IconChevronDown({ className }: IconProps) {
  return (
    <svg className={className} {...iconDefaults}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function IconOutwardSupply({ className }: IconProps) {
  return (
    <img
      className={className}
      src={iconOutwardSupply}
      alt=""
      width={12}
      height={15}
      aria-hidden
    />
  );
}

export function IconInwardSupply({ className }: IconProps) {
  return (
    <img
      className={className}
      src={iconInwardSupply}
      alt=""
      width={12}
      height={15}
      aria-hidden
    />
  );
}

export function IconRegister({ className }: IconProps) {
  return (
    <img
      className={className}
      src={iconReceipt}
      alt=""
      width={12}
      height={15}
      aria-hidden
    />
  );
}

export function IconClipboard({ className }: IconProps) {
  return (
    <img
      className={className}
      src={iconClipboard}
      alt=""
      width={12}
      height={15}
      aria-hidden
    />
  );
}

export function IconClipboardCheck({ className }: IconProps) {
  return (
    <img
      className={className}
      src={iconClipboardCheck}
      alt=""
      width={12}
      height={15}
      aria-hidden
    />
  );
}

export function IconDocument({ className }: IconProps) {
  return (
    <img
      className={className}
      src={iconDocument}
      alt=""
      width={12}
      height={15}
      aria-hidden
    />
  );
}

export function IconGstr9({ className }: IconProps) {
  return (
    <img
      className={className}
      src={iconRegister}
      alt=""
      width={12}
      height={15}
      aria-hidden
    />
  );
}

export function IconTruck({ className }: IconProps) {
  return (
    <img
      className={className}
      src={iconTruck}
      alt=""
      width={12}
      height={15}
      aria-hidden
    />
  );
}

export function IconWallet({ className }: IconProps) {
  return (
    <img
      className={className}
      src={iconWallet}
      alt=""
      width={12}
      height={15}
      aria-hidden
    />
  );
}

export function IconBook({ className }: IconProps) {
  return (
    <img
      className={className}
      src={iconBook}
      alt=""
      width={12}
      height={15}
      aria-hidden
    />
  );
}
