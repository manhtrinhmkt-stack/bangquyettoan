import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, Printer, Box, Layout, Smartphone } from 'lucide-react';
import { RowData } from './types';
import { INITIAL_ROW } from './constants';
import SettlementRow from './components/SettlementRow';
import { NumberInput } from './components/NumberInput';
import { readMoneyToText, formatVND } from './utils/numberUtils';

const App: React.FC = () => {
  const [title, setTitle] = useState("BẢNG QUYẾT TOÁN CÔNG VIỆC");
  const [recipient, setRecipient] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [rows, setRows] = useState<RowData[]>([{ ...INITIAL_ROW, id: crypto.randomUUID() }]);
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');

  // Dynamic print orientation control
  useEffect(() => {
    const styleId = 'print-orientation-style';
    let styleElement = document.getElementById(styleId);
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    styleElement.innerHTML = `@media print { @page { size: A4 ${orientation}; } }`;
  }, [orientation]);

  const addRow = () => setRows(prev => [...prev, { ...INITIAL_ROW, id: crypto.randomUUID() }]);
  const removeRow = (id: string) => { if (rows.length === 1) return; setRows(prev => prev.filter(r => r.id !== id)); };
  const duplicateRow = (index: number) => {
    const rowToClone = rows[index];
    const newRow = { ...rowToClone, id: crypto.randomUUID() };
    setRows(prev => {
        const newRows = [...prev];
        newRows.splice(index + 1, 0, newRow);
        return newRows;
    });
  };
  const updateRow = useCallback((id: string, field: keyof RowData, value: any) => {
    setRows(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  }, []);

  const totalAmount = useMemo(() => rows.reduce((sum, row) => {
    let rowTotal = 0;
    switch (row.mode) {
      case 'dim_qty': rowTotal = row.length * row.width * row.quantity * row.unitPrice; break;
      case 'size_qty': rowTotal = row.size * row.quantity * row.unitPrice; break;
      case 'direct': rowTotal = row.quantity * row.unitPrice; break;
      case 'manual': rowTotal = row.manualTotal; break;
    }
    return sum + rowTotal;
  }, 0), [rows]);

  const remainingAmount = totalAmount - advanceAmount;
  const amountToRead = advanceAmount > 0 ? remainingAmount : totalAmount;
  const moneyText = useMemo(() => readMoneyToText(amountToRead), [amountToRead]);
  const formattedDate = useMemo(() => {
    if (!date) return ".../.../20...";
    const d = new Date(date);
    return `Ngày ${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`;
  }, [date]);

  const isPortrait = orientation === 'portrait';

  return (
    <div className="min-h-screen bg-slate-100/50 text-slate-800 pb-20 print:pb-0 print:bg-white">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 no-print px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3 text-blue-700">
              <Box size={24} strokeWidth={2.5} />
              <span className="font-bold text-xl tracking-tight hidden sm:inline">Quyết Toán Pro</span>
              <span className="font-bold text-xl tracking-tight sm:hidden">QT Pro</span>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button 
                        onClick={() => setOrientation('landscape')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${orientation === 'landscape' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Layout size={14} className="rotate-90" />
                        Khổ ngang
                    </button>
                    <button 
                        onClick={() => setOrientation('portrait')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${orientation === 'portrait' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Layout size={14} />
                        Khổ dọc
                    </button>
                </div>

                <button onClick={() => window.print()} className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-sm text-sm">
                  <Printer size={16} />
                  <span className="hidden sm:inline">In ấn / Xuất PDF</span>
                  <span className="sm:hidden">In</span>
                </button>
            </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-4 md:py-8 print:py-0 print:max-w-none">
        <div className={`print-container bg-white shadow-lg border border-slate-200 print:shadow-none print:border-none relative mx-auto overflow-hidden transition-all duration-300 ${isPortrait ? 'max-w-[850px] is-portrait' : 'max-w-7xl'}`}>
          <div className="p-4 md:p-10 print:px-0 print:py-4">
            
            <header className="mb-6">
               <div className="flex justify-center mb-2 no-print">
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="text-2xl md:text-4xl font-bold text-center w-full uppercase border-none focus:ring-0 p-0 text-slate-800" />
               </div>
               <h1 className="hidden print:block font-bold text-center uppercase mb-1 print-text-18">{title}</h1>
               <div className="text-center mb-6 italic text-slate-500 print:text-black">
                  <div className="no-print flex justify-center items-center gap-2">
                     <span className="text-sm">Ngày lập:</span>
                     <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-slate-300 rounded px-2 py-1 text-sm text-slate-700" />
                  </div>
                  <span className="hidden print:block">{formattedDate}</span>
               </div>
               <div className="flex items-end gap-2 text-base mb-4 print:text-12">
                  <span className="font-bold min-w-max">Kính gửi:</span>
                  <div className="flex-1 border-b border-dotted border-slate-400 print:border-black relative">
                     <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} className="w-full bg-transparent border-none p-0 focus:ring-0 font-medium text-slate-900 print:font-bold pb-1" placeholder="..." />
                  </div>
               </div>
            </header>

            <div className="mb-4 overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed min-w-[800px] print:min-w-full">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-sm font-bold print:bg-gray-100 print:text-black">
                    <th className={`${isPortrait ? 'w-[40px]' : 'w-[50px]'} border border-slate-300 print:border-black py-3 whitespace-nowrap text-center`}>STT</th>
                    <th className="border border-slate-300 print:border-black px-2 py-3 text-center">Nội dung công việc</th>
                    <th className={`${isPortrait ? 'w-[90px]' : 'w-[120px]'} border border-slate-300 print:border-black py-3 text-center`}>Kích thước<br/>(m)</th>
                    <th className={`${isPortrait ? 'w-[80px]' : 'w-[100px]'} border border-slate-300 print:border-black py-3 text-center`}>Diện tích<br/>(m²)</th>
                    <th className={`${isPortrait ? 'w-[110px]' : 'w-[120px]'} border border-slate-300 print:border-black px-2 py-3 text-center`}>Đơn giá</th>
                    <th className={`${isPortrait ? 'w-[45px]' : 'w-[45px]'} border border-slate-300 print:border-black py-3 text-center`}>SL</th>
                    <th className={`${isPortrait ? 'w-[130px]' : 'w-[150px]'} border border-slate-300 print:border-black px-2 py-3 text-center`}>Thành tiền</th>
                    <th className="w-[40px] border border-slate-300 print:hidden bg-white border-t-0 border-r-0 border-b-0"></th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {rows.map((row, index) => (
                    <SettlementRow 
                        key={row.id} 
                        index={index} 
                        data={row} 
                        onChange={updateRow} 
                        onRemove={removeRow} 
                        onDuplicate={duplicateRow}
                        orientation={orientation}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center mb-6 no-print">
               <button onClick={addRow} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold px-4 py-2 hover:bg-blue-50 rounded-full transition-colors">
                  <Plus size={18} /> Thêm dòng mới
               </button>
            </div>

            <div className="flex flex-col gap-2 print:gap-0 break-inside-avoid">
               <div className="flex justify-end">
                  <div className={`w-full md:w-1/2 ${isPortrait ? 'print:w-[62%]' : 'print:w-[45%]'}`}>
                     <div className="flex justify-between items-center py-1 print-text-13-5">
                        <span className="font-bold uppercase">Tổng cộng:</span>
                        <div className="w-[180px] text-right font-bold print-text-13-5">{formatVND(totalAmount)}</div>
                     </div>
                     <div className={`flex justify-between items-center py-1 ${advanceAmount === 0 ? 'print:hidden' : ''}`}>
                        <span className="font-bold text-base uppercase text-slate-800 print:text-black print-text-13-5">Đã tạm ứng:</span>
                        <div className="w-[180px] flex justify-end">
                           <div className="w-40"><NumberInput value={advanceAmount} onChange={setAdvanceAmount} variant="paper" align="right" className="font-bold text-xl text-slate-800 print:text-black print-text-13-5" /></div>
                        </div>
                     </div>
                     <div className={`h-px bg-slate-300 my-1 print:h-0 print:border-t print:border-black print:border-solid ${advanceAmount === 0 ? 'print:hidden' : ''}`}></div>
                     <div className={`flex justify-between items-center py-1 ${advanceAmount === 0 ? 'print:hidden' : ''}`}>
                        <span className="font-bold text-lg uppercase text-blue-800 print:text-black print-text-13-5">Còn lại:</span>
                        <div className="w-[180px] text-right font-bold text-2xl text-blue-800 print:text-black print-text-13-5">{formatVND(remainingAmount)}</div>
                     </div>
                  </div>
               </div>

               <div className="flex justify-end mb-4 italic print-text-12 text-right">
                  <div className="max-w-full md:max-w-[85%]">
                    <span className="font-bold">Bằng chữ: </span>"{moneyText}"
                  </div>
               </div>

               <div className="flex flex-col md:flex-row justify-between items-start print:flex-row print:mt-1 gap-6 md:gap-0">
                  <div className={`payment-box-frame border border-slate-200 rounded-xl p-4 bg-slate-50 print:bg-transparent w-full md:w-auto ${isPortrait ? 'md:min-w-[380px] print:w-[380px]' : 'md:min-w-[420px]'}`}>
                     <h4 className="font-bold underline mb-3 print:no-underline print:uppercase print:mb-3 print:text-11">Thông tin thanh toán:</h4>
                     <div className="flex flex-col print-text-11">
                        <div className="payment-line whitespace-nowrap">
                           <span className="text-slate-500 font-semibold print:text-black w-[135px] shrink-0">Ngân hàng:</span>
                           <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className="input-paper w-full print:border-none print:font-medium" placeholder="..." />
                        </div>
                        <div className="payment-line whitespace-nowrap">
                           <span className="text-slate-500 font-semibold print:text-black w-[135px] shrink-0">Số tài khoản:</span>
                           <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="input-paper w-full print:border-none print:font-medium" placeholder="..." />
                        </div>
                        <div className="payment-line whitespace-nowrap">
                           <span className="text-slate-500 font-semibold print:text-black w-[135px] shrink-0">Chủ tài khoản:</span>
                           <input type="text" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} className="input-paper w-full print:border-none print:font-medium uppercase" placeholder="..." />
                        </div>
                     </div>
                  </div>

                  {/* Tăng print:-translate-x-44 lên translate-x-60 cho khổ ngang để xích trái nhiều hơn */}
                  <div className={`text-center w-full md:w-[250px] print:w-[240px] print-text-12 pt-2 ${isPortrait ? 'print:-translate-x-12' : 'print:-translate-x-60'}`}>
                      <p className="font-bold uppercase mb-1">Người lập biểu</p>
                      <p className="italic text-xs mb-12 no-print">(Họ tên, chữ ký)</p>
                      <div className="mb-12 hidden print:block"></div>
                      <div className="no-print mb-2">
                         <input type="text" value={creatorName} onChange={(e) => setCreatorName(e.target.value)} placeholder="Nhập tên..." className="input-paper text-center w-full" />
                      </div>
                      {/* Bỏ in đậm tên người lập biểu khi in bằng class print:font-normal */}
                      <p className="font-bold text-lg print:font-normal print:text-lg">{creatorName}</p>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;