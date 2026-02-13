import React, { useState, useEffect, useRef } from 'react';
import { formatVND, parseVND } from '../utils/numberUtils';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
  align?: 'left' | 'center' | 'right';
  variant?: 'default' | 'paper' | 'transparent';
}

export const NumberInput: React.FC<NumberInputProps> = ({ 
  value, 
  onChange, 
  className = "", 
  placeholder,
  readOnly = false,
  align = 'right',
  variant = 'default'
}) => {
  const [displayValue, setDisplayValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayValue(formatVND(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (!/^[\d.,]*$/.test(inputValue)) return;
    if ((inputValue.match(/,/g) || []).length > 1) return;

    setDisplayValue(inputValue);
    const numericValue = parseVND(inputValue);
    onChange(numericValue);
  };

  const handleBlur = () => {
    setDisplayValue(formatVND(value));
  };

  // Style variants
  let baseStyles = "";
  if (variant === 'default') {
    baseStyles = readOnly 
      ? "bg-transparent border-none font-bold text-slate-900 shadow-none focus:ring-0 cursor-default" 
      : "bg-white border border-slate-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all";
  } else if (variant === 'paper') {
    baseStyles = "input-paper font-medium text-slate-900 focus:text-blue-700";
  } else if (variant === 'transparent') {
    baseStyles = "bg-transparent border-none p-0 focus:ring-0";
  }

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`block w-full text-sm py-1.5 px-2 ${baseStyles} ${className}`}
      style={{ textAlign: align }}
    />
  );
};