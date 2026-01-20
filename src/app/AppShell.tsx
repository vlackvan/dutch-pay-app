import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import styles from "./AppShell.module.css";

export default function AppShell() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <Outlet />
      </main>

      <nav className={styles.nav} aria-label="하단 탭">
        <NavItem to="/settlements" label="정산" iconSrc="/tabs/settlements.png" />
        <NavItem to="/games" label="게임" iconSrc="/tabs/SaltySpitoonTab.png" />
        <NavItem to="/profile" label="프로필" iconSrc="/tabs/ProfileTab.png" />
      </nav>
    </div>
  );
}

function NavItem({
  to,
  label,
  iconSrc,
}: {
  to: string;
  label: string;
  iconSrc: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${styles.item} ${isActive ? styles.active : ""}`
      }
    >
      <div className={styles.icon}>
        <img className={styles.iconImg} src={iconSrc} alt="" aria-hidden="true" />
      </div>
      <div className={styles.label}>{label}</div>
    </NavLink>
  );
}
