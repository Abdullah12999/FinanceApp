export default function cx(...cls) {
  return cls.filter(Boolean).join(" ");
}
