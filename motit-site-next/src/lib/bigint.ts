// src/lib/bigint.ts
// Глобальный сериализатор BigInt для JSON.stringify
// (нужен, потому что Prisma возвращает BigInt для id/created_at и т.п.)
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

if (typeof BigInt !== "undefined" && !BigInt.prototype.toJSON) {
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };
}

export {};
