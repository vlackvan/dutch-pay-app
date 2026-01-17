import { NavLink, Outlet } from "react-router-dom";
import styles from "./AppShell.module.css";

export default function AppShell() {
  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <Outlet />
      </main>

      <nav className={styles.nav} aria-label="하단 탭">
        <NavItem to="/settlements" label="정산" icon={<MoneyIcon />} />
        <NavItem to="/games" label="게임" icon={<GameIcon />} />
        <NavItem to="/profile" label="프로필" icon={<UserIcon />} />
      </nav>
    </div>
  );
}

function NavItem({
  to,
  label,
  icon,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${styles.item} ${isActive ? styles.active : ""}`
      }
    >
      <div className={styles.icon}>{icon}</div>
      <div className={styles.label}>{label}</div>
    </NavLink>
  );
}

function MoneyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M7 9h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 13h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="17" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function GameIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 16l-1.5-4.5A3 3 0 0 1 8.3 7h7.4a3 3 0 0 1 2.8 4.5L17 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M8 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15.5 10.5h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M17.5 12.5h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 21a8 8 0 0 0-16 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
