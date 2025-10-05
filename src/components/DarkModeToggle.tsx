import { Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from './ThemeProvider';

export function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 mr-3" />
      ) : (
        <Sun className="w-4 h-4 mr-3" />
      )}
      {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
    </Button>
  );
}