
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
  const isFocused = useRef(false);

  // Cập nhật giá trị hiển thị khi giá trị thực thay đổi từ bên ngoài (ví dụ tính toán lại)
  useEffect(() => {
    if (!isFocused.current) {
      setDisplayValue(formatVND(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Chỉ cho phép số, dấu chấm và dấu phẩy
    if (!/^[\d.,]*$/.test(inputValue)) return;
    
    // Chỉ cho phép tối đa 1 dấu phẩy thập phân
    if ((inputValue.match(/,/g) || []).length > 1) return;

    setDisplayValue(inputValue);
    
    // Parse để cập nhật giá trị số thực cho logic tính toán
    const numericValue = parseVND(inputValue);
    if (!isNaN(numericValue)) {
      onChange(numericValue);
    }
  };

  const handleFocus = () => {
    isFocused.current = true;
  };

  const handleBlur = () => {
    isFocused.current = false;
    // Khi thoát focus, định dạng lại số cho đẹp (ví dụ "1,50" -> "1,5")
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
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`block w-full text-sm py-1.5 px-2 ${baseStyles} ${className}`}
      style={{ textAlign: align }}
    />
  );
};
