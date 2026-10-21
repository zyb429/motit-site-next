export function serialize<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_k, v) => (typeof v === "bigint" ? v.toString() : v))
  );
}

export function toPlain<T>(v: T): T {
  if (typeof v === "bigint") return String(v) as unknown as T;
  if (Array.isArray(v)) return v.map(toPlain) as unknown as T;
  if (v && typeof v === "object") {
    const out: any = {};
    for (const [k, val] of Object.entries(v as object)) out[k] = toPlain(val);
    return out;
  }
  return v;
}