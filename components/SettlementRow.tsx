import React from 'react';
import { RowData, InputMode } from '../types';
import { NumberInput } from './NumberInput';
import { Trash2, Calculator, Edit3, Layers, Copy, Ruler } from 'lucide-react';
import { MODE_OPTIONS } from '../constants';

interface SettlementRowProps {
  index: number;
  data: RowData;
  onChange: (id: string, field: keyof RowData, value: any) => void;
  onRemove: (id: string) => void;
  onDuplicate: (index: number) => void;
  orientation?: 'landscape' | 'portrait';
}

const SettlementRow: React.FC<SettlementRowProps> = ({ index, data, onChange, onRemove, onDuplicate, orientation = 'landscape' }) => {
  
  const update = (field: keyof RowData, val: any) => onChange(data.id, field, val);

  const handleDuplicate = () => {
      onDuplicate(index);
  };

  const getSubtotal = () => {
    switch (data.mode) {
      case 'dim_qty': return data.length * data.width * data.quantity * data.unitPrice;
      case 'size_qty': return data.size * data.quantity * data.unitPrice;
      case 'direct': return data.quantity * data.unitPrice;
      case 'manual': return data.manualTotal;
      default: return 0;
    }
  };

  const getArea = () => {
      if (data.mode === 'dim_qty') return data.length * data.width * data.quantity;
      return 0;
  }

  const subtotal = getSubtotal();
  const area = getArea();

  const getModeIcon = () => {
    switch(data.mode) {
      case 'dim_qty': return <Layers size={14} className="text-purple-500" />;
      case 'size_qty': return <Ruler size={14} className="text-indigo-500" />;
      case 'direct': return <Calculator size={14} className="text-green-500" />;
      case 'manual': return <Edit3 size={14} className="text-orange-500" />;
    }
  }

  const isPortrait = orientation === 'portrait';

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50 print:border-black print:hover:bg-transparent break-inside-avoid">
      <td className="text-center border border-slate-300 print:border-black py-2 font-medium text-slate-500 print:text-black">
        {index + 1}
      </td>

      <td className="border border-slate-300 print:border-black p-2 align-top overflow-hidden">
        <div className="flex flex-col h-full justify-between gap-1 group">
          <div className="hidden print:block cell-content leading-tight">
            {data.content}
          </div>
          
          <textarea
            value={data.content}
            onChange={(e) => update('content', e.target.value)}
            placeholder="Nhập tên hạng mục..."
            rows={1}
            className="w-full bg-transparent border-none p-0 focus:ring-0 resize-none overflow-hidden font-medium text-slate-800 placeholder-slate-400 print:hidden text-base leading-tight"
            style={{ minHeight: '1.5rem', height: 'auto' }}
            onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
            }}
          />

          <div className="flex items-center justify-between no-print mt-1">
            <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-500">
              {getModeIcon()}
              <select
                value={data.mode}
                onChange={(e) => update('mode', e.target.value as InputMode)}
                className="bg-transparent border-none p-0 pr-4 text-xs font-medium focus:ring-0 cursor-pointer text-slate-600 max-w-[150px] truncate"
              >
                {MODE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            <button 
                onClick={handleDuplicate}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity p-1"
                title="Nhân bản dòng này"
            >
                <Copy size={14} />
            </button>
          </div>
        </div>
      </td>

      {data.mode === 'manual' ? (
        <>
          <td colSpan={4} className="border border-slate-300 print:border-black p-2 bg-slate-50/50 print:bg-transparent"></td>
          <td className="border border-slate-300 print:border-black p-2">
            <NumberInput
              value={data.manualTotal}
              onChange={(val) => update('manualTotal', val)}
              variant="transparent"
              className="text-right font-bold text-orange-600 print:text-black"
            />
          </td>
        </>
      ) : (
        <>
          <td className="border border-slate-300 print:border-black p-1 text-center overflow-hidden">
            {data.mode === 'dim_qty' && (
              <div className="flex items-center justify-center gap-0.5">
                 <NumberInput 
                    value={data.length} onChange={(val) => update('length', val)} 
                    variant="transparent"
                    placeholder="D" className={`text-center ${isPortrait ? 'w-[40%]' : 'w-[45%]'}`} align="center"
                  />
                  <span className="text-slate-400 print:text-black text-[10px]">x</span>
                  <NumberInput 
                    value={data.width} onChange={(val) => update('width', val)} 
                    variant="transparent"
                    placeholder="R" className={`text-center ${isPortrait ? 'w-[40%]' : 'w-[45%]'}`} align="center"
                  />
              </div>
            )}
            {data.mode === 'size_qty' && (
               <NumberInput 
                  value={data.size} onChange={(val) => update('size', val)} 
                  variant="transparent"
                  placeholder="KT" className="text-center w-full" align="center"
                />
            )}
          </td>

           <td className="border border-slate-300 print:border-black p-1 text-center overflow-hidden">
             {data.mode === 'dim_qty' ? (
               <NumberInput value={area} onChange={() => {}} readOnly variant="transparent" className="text-slate-500 print:text-black" align="center" />
             ) : <span className="text-slate-300 print:hidden">-</span>}
           </td>
          
          <td className="border border-slate-300 print:border-black p-1 overflow-hidden">
            <NumberInput 
               value={data.unitPrice} onChange={(val) => update('unitPrice', val)} 
               variant="transparent"
               className="font-medium"
               placeholder="0"
            />
          </td>

          <td className="border border-slate-300 print:border-black p-1 overflow-hidden">
            {(data.mode === 'direct' || data.mode === 'dim_qty' || data.mode === 'size_qty') ? (
               <NumberInput 
                  value={data.quantity} onChange={(val) => update('quantity', val)} 
                  variant="transparent"
                  placeholder="0" className="text-center font-semibold text-slate-700 print:text-black" align="center"
                />
            ) : null}
          </td>

          <td className="border border-slate-300 print:border-black p-1 overflow-hidden">
             <NumberInput 
               value={subtotal} onChange={() => {}} readOnly 
               variant="transparent"
               className="font-bold text-blue-700 print:text-black"
             />
          </td>
        </>
      )}

      <td className="border-t border-b border-slate-300 p-0 text-center no-print align-middle print:hidden border-l-0 border-r-0">
        <button
          onClick={() => onRemove(data.id)}
          className="text-slate-300 hover:text-red-500 p-2 transition-colors mx-auto block"
          title="Xóa dòng"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
};

export default SettlementRow;