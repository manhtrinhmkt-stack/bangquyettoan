
/**
 * Formats a number to Vietnamese string format (e.g., 1000.5 -> "1.000,5")
 */
export const formatVND = (num: number | undefined | null): string => {
  if (num === undefined || num === null || isNaN(num)) return "";
  
  // Sử dụng toLocaleString để tự động xử lý dấu chấm hàng nghìn và dấu phẩy thập phân theo chuẩn VN
  return num.toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4, // Cho phép tối đa 4 chữ số thập phân (ví dụ cho kích thước)
  });
};

/**
 * Parses a Vietnamese formatted string back to a number
 */
export const parseVND = (str: string): number => {
  if (!str) return 0;
  // Loại bỏ dấu chấm (hàng nghìn) và thay dấu phẩy (thập phân) bằng dấu chấm để Float parse được
  const cleanStr = str.replace(/\./g, "").replace(/,/g, ".");
  const num = parseFloat(cleanStr);
  return isNaN(num) ? 0 : num;
};

const DIGITS = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
const UNITS = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

/**
 * Refined Vietnamese money reading logic.
 * Note: Decimals in total money are usually rounded in VN context reading.
 */
export const readMoneyToText = (amount: number): string => {
  if (amount === 0) return "Không đồng";
  
  // Làm tròn để đọc số tiền chẵn (phổ biến trong quyết toán)
  const absAmount = Math.floor(Math.abs(amount));
  let str = absAmount.toString();
  
  const groups: string[] = [];
  while (str.length > 0) {
    groups.push(str.slice(-3).padStart(3, '0'));
    str = str.slice(0, -3);
  }

  const readThreeDigits = (group: string, isFirstGroupFromLeft: boolean): string => {
    let res = "";
    const h = parseInt(group[0]);
    const t = parseInt(group[1]);
    const o = parseInt(group[2]);

    if (!isFirstGroupFromLeft || h > 0) {
      res += DIGITS[h] + " trăm ";
    }

    if (t > 1) {
      res += DIGITS[t] + " mươi ";
    } else if (t === 1) {
      res += "mười ";
    } else if (res !== "" && o > 0) {
      res += "lẻ ";
    }

    if (o === 1 && t > 1) {
      res += "mốt";
    } else if (o === 5 && t > 0) {
      res += "lăm";
    } else if (o === 4 && t > 1) {
      res += "tư";
    } else if (o > 0 || (h === 0 && t === 0 && isFirstGroupFromLeft)) {
      if (o > 0 || isFirstGroupFromLeft) res += DIGITS[o];
    }

    return res.trim();
  };

  let result = "";
  let foundNonZeroGroup = false;

  for (let i = groups.length - 1; i >= 0; i--) {
    const val = parseInt(groups[i]);
    if (val > 0) {
      const isFirstGroupFromLeft = !foundNonZeroGroup;
      const groupText = readThreeDigits(groups[i], isFirstGroupFromLeft);
      result += groupText + " " + UNITS[i] + " ";
      foundNonZeroGroup = true;
    }
  }

  result = result.trim();
  if (!result) return "Không đồng";

  result = result.charAt(0).toUpperCase() + result.slice(1);
  return (amount < 0 ? "Âm " : "") + result + " đồng chẵn";
};
