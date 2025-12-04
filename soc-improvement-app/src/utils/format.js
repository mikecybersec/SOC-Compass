export const formatBudgetAmount = (value) => {
  const stringValue = value?.toString() ?? '';
  const cleaned = stringValue.replace(/,/g, '').replace(/[^0-9.]/g, '');

  if (!cleaned) return '';

  const [integerPartRaw, decimalPartRaw] = cleaned.split('.');
  const formattedInteger = (integerPartRaw || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (decimalPartRaw !== undefined) {
    return decimalPartRaw ? `${formattedInteger}.${decimalPartRaw}` : `${formattedInteger}.`;
  }

  return formattedInteger;
};
