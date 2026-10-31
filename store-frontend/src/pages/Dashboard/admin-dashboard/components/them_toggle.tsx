interface Props {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeToggle = ({ darkMode, toggleDarkMode }: Props) => {
  return <button onClick={toggleDarkMode}>{darkMode ? "" : ""}</button>;
};

export default DarkModeToggle;
