import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

function ThemeToggle({ className = '', showLabel = false }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      className={`theme-toggle-btn ${className}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className="theme-toggle-icon-wrap">
        {isDark ? <Sun size={17} className="theme-sun-icon" /> : <Moon size={17} className="theme-moon-icon" />}
      </span>
      {showLabel && (
        <span className="theme-toggle-label">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
      )}
    </button>
  );
}

export default ThemeToggle;

