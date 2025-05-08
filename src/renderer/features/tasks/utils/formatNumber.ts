export function formatNumber(num: number, _: boolean): string {
  if (num >= 1000000) {
    // For millions
    const formatted = (num / 1000000).toFixed(2);
    return `${parseFloat(formatted)}M`;
  } else if (num >= 1000) {
    // For thousands
    const formatted = (num / 1000).toFixed(2);
    return `${parseFloat(formatted)}k`;
  } else {
    const formatted = num.toFixed(2);
    return parseFloat(formatted).toString();
  }
}
