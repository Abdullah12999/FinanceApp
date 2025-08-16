export const monthISO = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export const todayISO = () => new Date().toISOString().slice(0, 10);
