import { useState } from "react";

const themes = { light: "light", dark: "dark" };

function setTheme(theme: string) {
  document.documentElement.setAttribute("data-theme", theme);
}

function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState(themes.dark); // Initial theme

  const toggleTheme = () => {
    const newTheme = currentTheme === themes.light ? themes.dark : themes.light;
    setCurrentTheme(newTheme);
    setTheme(newTheme); // Update document theme
  };

  const getEmoji: () => string = (): string => {
    return currentTheme === themes.light ? "🌞" : "🌚"; // Choose emojis based on theme
  };

  return <a onClick={toggleTheme}>{getEmoji()}</a>;
}

export default ThemeSelector;
