interface Props {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  darkMode: boolean;
}

const SearchBar = ({ searchQuery, setSearchQuery, darkMode }: Props) => {
  return (
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search employees..."
    />
  );
};

export default SearchBar;
