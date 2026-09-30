export function formatCurrency(amount: number, compact: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '$0';
  
  if (compact) {
    const abs = Math.abs(amount);
    if (abs >= 1_000_000_000) {
      return (amount / 1_000_000_000).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
      }) + 'B';
    }
    if (abs >= 1_000_000) {
      return (amount / 1_000_000).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
      }) + 'M';
    }
    if (abs >= 1_000) {
      return (amount / 1_000).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1
      }) + 'k';
    }
  }

  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

export function formatPercent(value: number, includeSign: boolean = true): string {
  if (isNaN(value) || value === null || value === undefined) return '0.0%';
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatMonthLabel(periodMonth: string): string {
  if (!periodMonth) return '';
  const [year, month] = periodMonth.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mIndex = parseInt(month, 10) - 1;
  return `${monthNames[mIndex]} ${year.slice(2)}`;
}

export function formatFullMonthYear(periodMonth: string): string {
  if (!periodMonth) return '';
  const [year, month] = periodMonth.split('-');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const mIndex = parseInt(month, 10) - 1;
  return `${monthNames[mIndex]} ${year}`;
}
