export const validateNumber = (value, min = 0, max = Infinity) => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  return num >= min && num <= max;
};

export const formatNumber = (value, decimals = 1) => {
  const num = parseFloat(value);
  if (isNaN(num)) return "";
  return num.toFixed(decimals);
};
