import { RowData } from './types';

export const MODE_OPTIONS = [
  { value: 'dim_qty', label: 'Dài x Rộng x SL' },
  { value: 'size_qty', label: 'Kích thước x SL' },
  { value: 'direct', label: 'Nhập số lượng & Đơn giá' },
  { value: 'manual', label: 'Nhập tay hoàn toàn' },
];

export const INITIAL_ROW: RowData = {
  id: '',
  mode: 'dim_qty',
  content: '',
  length: 0,
  width: 0,
  size: 0,
  quantity: 1,
  unitPrice: 0,
  manualTotal: 0,
};