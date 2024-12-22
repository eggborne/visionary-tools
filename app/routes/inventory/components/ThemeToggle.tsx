import styles from './ThemeToggle.module.css';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

const ThemeToggle = ({ isDarkMode, onToggle }: ThemeToggleProps) => {
  return (
    <div className={styles.ThemeToggle}>
      <button
        onClick={onToggle}
        className={styles.toggle}
        role="switch"
        aria-checked={isDarkMode}
      >
        <div className={styles.iconContainer}>
          <Sun
            size={24}
            className={`${styles.icon} ${styles.sunIcon} ${isDarkMode ? styles.hidden : ''}`}
          />
        </div>
        <div className={`${styles.iconContainer} ${styles.moonContainer}`}>
          <Moon
            size={24}
            className={`${styles.icon} ${styles.moonIcon} ${isDarkMode ? '' : styles.hidden}`}
          />
        </div>
        <div className={`${styles.slider} ${isDarkMode ? styles.sliderRight : ''}`} />
      </button>
    </div>
  );
};

export default ThemeToggle;