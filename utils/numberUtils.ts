/**
 * Formats a number to Vietnamese string format (e.g., 1000.5 -> "1.000")
 */
export const formatVND = (num: number | undefined | null): string => {
  if (num === undefined || num === null || isNaN(num)) return "";
  
  const str = Math.floor(num).toString();
  const parts = [str];
  
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  return parts.join(',');
};

/**
 * Parses a Vietnamese formatted string back to a number
 */
export const parseVND = (str: string): number => {
  if (!str) return 0;
  const cleanStr = str.replace(/\./g, "").replace(/,/g, ".");
  const num = parseFloat(cleanStr);
  return isNaN(num) ? 0 : num;
};

const DIGITS = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
const UNITS = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

/**
 * Refined Vietnamese money reading logic to fix the "không trăm" issue on leading groups.
 */
export const readMoneyToText = (amount: number): string => {
  if (amount === 0) return "Không đồng";
  
  const absAmount = Math.floor(Math.abs(amount));
  let str = absAmount.toString();
  
  // Split into groups of 3
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

    // Handle hundredth
    if (!isFirstGroupFromLeft || h > 0) {
      res += DIGITS[h] + " trăm ";
    }

    // Handle tenth
    if (t > 1) {
      res += DIGITS[t] + " mươi ";
    } else if (t === 1) {
      res += "mười ";
    } else if (res !== "" && o > 0) {
      res += "lẻ ";
    }

    // Handle unit
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
    } else if (foundNonZeroGroup && i % 3 === 0 && i > 0) {
        // Handle billionaire markers or complex units if needed
    }
  }

  result = result.trim();
  if (!result) return "Không đồng";

  result = result.charAt(0).toUpperCase() + result.slice(1);
  return (amount < 0 ? "Âm " : "") + result + " đồng chẵn";
};
