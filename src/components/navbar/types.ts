import { ComponentType, SVGProps } from 'react';

export type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

// --- Brand ---
export interface NavBrand {
  href: string;
  lines: string[];
}

// --- Dropdown menu items (inside a dropdown panel) ---
export interface DropdownLinkItem {
  kind: 'link';
  id: string;
  href: string;
  icon?: HeroIcon;
  label: string;
}

export interface DropdownToggleItem {
  kind: 'toggle';
  id: string;
  icon?: HeroIcon;
  label: string;
  isOn: boolean;
  onToggle: () => void;
}

export interface DropdownActionItem {
  kind: 'action';
  id: string;
  icon?: HeroIcon;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

export interface DropdownDivider {
  kind: 'divider';
}

export type DropdownMenuItem =
  | DropdownLinkItem
  | DropdownToggleItem
  | DropdownActionItem
  | DropdownDivider;

// --- Top-level nav items ---
export interface NavLinkItem {
  kind: 'link';
  id: string;
  href: string;
  icon?: HeroIcon;
  label: string;
  title?: string;
}

export interface NavDropdownItem {
  kind: 'dropdown';
  id: string;
  icon?: HeroIcon;
  label: string;
  items: DropdownMenuItem[];
  mobileLabel?: string;
}

export type NavItem = NavLinkItem | NavDropdownItem;

// --- Navbar props ---
export interface NavbarProps {
  brand: NavBrand;
  display?: 'icon' | 'text' | 'both';
  showBorder?: boolean;
  centerItems?: NavItem[];
  rightItems?: NavItem[];
}
