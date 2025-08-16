export const formatPKR = (n) =>
  `₨ ${Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
