export type InputMode = 'direct' | 'manual' | 'dim_qty' | 'size_qty';

export interface RowData {
  id: string;
  mode: InputMode;
  content: string;
  length: number;
  width: number;
  size: number;
  quantity: number;
  unitPrice: number;
  manualTotal: number;
}