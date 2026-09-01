import React, { useState, useRef, useEffect } from 'react';

export interface ColorOption {
  label: string;
  value: string;
}

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  options: ColorOption[];
  className?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, options, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="w-full flex items-center justify-between p-2 border-b border-border-subtle bg-transparent outline-none focus:border-primary transition-colors text-on-surface hover:bg-surface-muted rounded-t"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-full ${selectedOption?.value} border border-black/10`}></div>
          <span className="text-[13px]">{selectedOption?.label}</span>
        </div>
        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-1 bg-surface border border-border-subtle rounded-lg shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-surface-muted transition-colors ${
                value === option.value ? 'bg-primary/5 text-primary font-bold' : 'text-on-surface'
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <div className={`w-4 h-4 rounded-full ${option.value} border border-black/10`}></div>
              <span>{option.label}</span>
              {value === option.value && (
                <span className="material-symbols-outlined text-[16px] ml-auto">check</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
