/**
 * Formats a monetary value with the format:  USD 1'290,000.15
 * Optionally appends /KL or /ANO based on tipo_unidad.
 */
export const formatMoney = (val: number, tipoUnidad?: string | null): string => {
  if (isNaN(val) || val === null || val === undefined) return 'USD 0';

  const intlStr = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(val);

  const parts = intlStr.split(',');
  let withApostrophe = intlStr;
  if (parts.length > 2) {
    const lastPart = parts.pop();
    withApostrophe = parts.join("'") + ',' + lastPart;
  }

  const suffix = tipoUnidad === 'kilo' ? '/KL' : tipoUnidad === 'año' ? '/AÑO' : '';
  return `USD${suffix} ${withApostrophe}`;
};

export const formatMoneyCompact = (val: number, tipoUnidad?: string | null): string => {
  if (!val || isNaN(val)) return '';
  return formatMoney(val, tipoUnidad);
};