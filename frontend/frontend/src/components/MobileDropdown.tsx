import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface MobileDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MobileDropdown: React.FC<MobileDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'below' | 'above'>('below');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find(option => option.value === value);

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

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      const dropdownHeight = Math.min(192, spaceBelow - 20); // Reserve 20px for bottom nav
      
      // If there's not enough space below but enough space above, position above
      if (spaceBelow < dropdownHeight + 20 && spaceAbove > dropdownHeight) {
        setPosition('above');
      } else {
        setPosition('below');
      }
    }
  }, [isOpen]);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleButtonClick}
        className="w-full px-2.5 py-1.5 lg:px-3 lg:py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-left text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex items-center justify-between"
      >
        <span className={selectedOption ? "text-gray-900 font-medium" : "text-gray-500"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={`h-3.5 w-3.5 lg:h-4 lg:w-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <div 
          className={`absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg overflow-y-auto ${
            position === 'above' ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
          style={{ 
            maxHeight: position === 'below' 
              ? `${Math.min(192, Math.max(120, window.innerHeight - (buttonRef.current?.getBoundingClientRect().bottom || 0) - 100))}px`
              : `${Math.min(192, Math.max(120, (buttonRef.current?.getBoundingClientRect().top || 0) - 40))}px`
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option.value)}
              className={`w-full px-2.5 py-1.5 lg:px-3 lg:py-2 text-left text-xs lg:text-sm focus:outline-none first:rounded-t-lg last:rounded-b-lg mobile-dropdown-option ${
                option.value === value ? 'selected' : ''
              }`}
              style={{
                color: option.value === value ? '#1e40af' : '#1f2937',
                backgroundColor: option.value === value ? '#dbeafe' : 'white',
                fontWeight: option.value === value ? '600' : '400'
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileDropdown;
