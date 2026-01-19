import { ICON_OPTIONS, isEmoji } from '@/constants/icons';
import styles from './IconPicker.module.css';

interface IconPickerProps {
  selectedIcon: string;
  onSelectIcon: (iconPath: string) => void;
  className?: string;
}

export default function IconPicker({ selectedIcon, onSelectIcon, className }: IconPickerProps) {
  return (
    <div className={`${styles.iconPicker} ${className || ''}`}>
      {ICON_OPTIONS.map((icon) => {
        const isSelected = selectedIcon === icon.path;

        return (
          <button
            key={icon.path}
            type="button"
            className={`${styles.iconItem} ${isSelected ? styles.iconItemSelected : ''}`}
            onClick={() => onSelectIcon(icon.path)}
          >
            <div className={styles.iconImageWrapper}>
              <img src={icon.path} alt={icon.label} className={styles.iconImage} />
            </div>
            <span className={styles.iconLabel}>{icon.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Helper component to display an icon (handles both emoji fallback and icon paths)
 */
interface IconDisplayProps {
  icon: string | undefined;
  alt?: string;
  className?: string;
  size?: string;
}

export function IconDisplay({ icon, alt = 'icon', className = '', size = '48px' }: IconDisplayProps) {
  if (!icon) {
    return <img src="/icons/money.png" alt={alt} className={className} style={{ width: size, height: size }} />;
  }

  // If it's an emoji (doesn't start with /), display as text
  if (isEmoji(icon)) {
    return (
      <span className={className} style={{ fontSize: size, lineHeight: size }}>
        {icon}
      </span>
    );
  }

  // Otherwise, it's an icon path
  return <img src={icon} alt={alt} className={className} style={{ width: size, height: size }} />;
}
