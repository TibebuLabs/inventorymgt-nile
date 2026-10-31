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
      className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
        darkMode
          ? "bg-slate-800 border-slate-600 text-white placeholder-slate-400"
          : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
      }`}
    />
  );
};

export default SearchBar;
