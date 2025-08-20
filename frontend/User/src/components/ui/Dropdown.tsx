import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multi?: boolean;
  placeholder?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({ label, options, selected, onChange, multi = false, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    if (multi) {
      if (selected.includes(option)) {
        onChange(selected.filter(s => s !== option));
      } else {
        onChange([...selected, option]);
      }
    } else {
      onChange([option]);
      setOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        className="w-full flex items-center justify-between rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 hover:border-primary"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selected.length > 0 ? selected.join(', ') : (placeholder || `Select ${label}`)}</span>
        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        className={`absolute left-0 z-30 mt-2 w-full rounded-lg bg-background border border-input shadow-xl transition-all duration-300 origin-top scale-y-0 opacity-0 ${open ? 'scale-y-100 opacity-100' : ''}`}
        style={{ maxHeight: open ? 240 : 0, overflowY: 'auto' }}
        role="listbox"
      >
        {options.map(option => (
          <div
            key={option}
            className={`flex items-center px-4 py-2 cursor-pointer hover:bg-primary/10 transition-colors ${selected.includes(option) ? 'bg-primary/10 font-semibold' : ''}`}
            onClick={() => handleSelect(option)}
            role="option"
            aria-selected={selected.includes(option)}
          >
            {multi && (
              <span className="mr-2">{selected.includes(option) ? <Check className="h-4 w-4 text-primary" /> : <span className="inline-block w-4" />}</span>
            )}
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};
