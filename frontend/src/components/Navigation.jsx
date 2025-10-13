import { Link } from "react-router-dom";
import styles from './Navigation.module.css';

export default function Navigation() {
  return (
    <header className={styles['header']}>
      <div className={styles['container']}>
        <div className={styles['brand']}>
          <Link to="/" className={styles['brand-link']}><img src="/logo.png" alt="Docket Logo" className={styles['logo']} /></Link>
        </div>
        <nav className={styles['nav']}>
          <Link to="/login" className={styles['nav-link']}>Login</Link>
          <Link to="/register" className={`${styles['nav-link']} ${styles['signup-button']}`}>Sign Up</Link>
        </nav>
      </div>
    </header>
  );
}
