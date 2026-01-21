import { useEffect, useRef, useState } from 'react';
import { ICON_OPTIONS } from '@/constants/icons';
import { IconDisplay } from '@/components/IconPicker/IconPicker';
import styles from './IconDropdown.module.css';

interface IconDropdownProps {
  selectedIcon: string;
  onSelectIcon: (iconPath: string) => void;
  size?: 'small' | 'medium';
  className?: string; // Wrapper class
  menuClassName?: string; // Menu overrides
}

export default function IconDropdown({ selectedIcon, onSelectIcon, size = 'small', className, menuClassName }: IconDropdownProps) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const handleSelect = (iconPath: string) => {
    onSelectIcon(iconPath);
    setOpen(false);
  };

  const iconSize = size === 'small' ? '28px' : '36px';
  const buttonClass = size === 'small' ? styles.selectBtnSmall : styles.selectBtn;

  return (
    <div className={`${styles.selectWrap} ${className || ''}`} ref={boxRef}>
      <button
        type="button"
        className={buttonClass}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="아이콘 선택"
      >
        <IconDisplay icon={selectedIcon} size={iconSize} />
        <ChevronDown open={open} />
      </button>

      {open && (
        <div className={`${styles.menu} ${menuClassName || ''}`} role="listbox" aria-label="아이콘 선택">
          {ICON_OPTIONS.map((icon) => {
            const isSelected = selectedIcon === icon.path;
            return (
              <button
                key={icon.path}
                type="button"
                className={`${styles.menuItem} ${isSelected ? styles.active : ''}`}
                onClick={() => handleSelect(icon.path)}
              >
                <div className={styles.iconWrapper}>
                  <img src={icon.path} alt={icon.label} className={styles.iconImage} />
                </div>
                <span className={styles.label}>{icon.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 120ms',
        flexShrink: 0
      }}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="#7b8a8b"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
