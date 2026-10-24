import { forwardRef } from 'react';
import { Search, X } from 'lucide-react';

/**
 * Large search field with an inline clear control and a keyboard-shortcut hint.
 * @param {{value: string, onChange: (value: string) => void, placeholder?: string}} props
 */
const SearchBar = forwardRef(function SearchBar({ value, onChange, placeholder = 'Search products, categories or features' }, ref) {
  return (
    <div className="glass group relative flex items-center rounded-2xl transition focus-within:border-neon-violet/70 focus-within:shadow-glow">
      <Search size={20} className="pointer-events-none absolute left-4 text-slate-500 transition group-focus-within:text-neon-cyan" />
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
        className="w-full bg-transparent py-4 pl-12 pr-24 text-base text-white placeholder:text-slate-500 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button type="button" onClick={() => onChange('')} className="absolute right-3 rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white" aria-label="Clear search">
          <X size={18} />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-4 hidden rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-xs font-medium text-slate-400 sm:block">/</kbd>
      )}
    </div>
  );
});

export default SearchBar;
