/**
 * Centralized Fixed-Scale Quantity Representation and Arithmetic.
 * Supports up to 4 decimal places (numeric(14, 4)) for units like FT, LBS, SHEET, EA.
 * All arithmetic is performed on scaled bigints to eliminate floating-point drift.
 */

const SCALE = 10000n; // 10^4
const SCALE_DECIMALS = 4;

export class Quantity {
  private readonly raw: bigint;

  private constructor(raw: bigint) {
    this.raw = raw;
  }

  static fromString(val: string): Quantity {
    const trimmed = val.trim();
    if (!trimmed || !/^-?\d+(\.\d+)?$/.test(trimmed)) {
      throw new Error(`Invalid numeric quantity string: '${val}'`);
    }

    const isNegative = trimmed.startsWith("-");
    const absStr = isNegative ? trimmed.substring(1) : trimmed;
    const [intPart, decPart = ""] = absStr.split(".");

    if (decPart.length > SCALE_DECIMALS) {
      throw new Error(`Quantity precision exceeds maximum 4 decimal places: '${val}'`);
    }

    const paddedDec = decPart.padEnd(SCALE_DECIMALS, "0");
    const combined = BigInt(intPart) * SCALE + BigInt(paddedDec);
    return new Quantity(isNegative ? -combined : combined);
  }

  static fromNumber(val: number): Quantity {
    if (!Number.isFinite(val)) {
      throw new Error(`Quantity must be a finite number, received: ${val}`);
    }
    // Round to 4 decimal places safely
    const rounded = Math.round(val * 10000) / 10000;
    return Quantity.fromString(rounded.toFixed(4));
  }

  static zero(): Quantity {
    return new Quantity(0n);
  }

  add(other: Quantity): Quantity {
    return new Quantity(this.raw + other.raw);
  }

  subtract(other: Quantity): Quantity {
    return new Quantity(this.raw - other.raw);
  }

  isZero(): boolean {
    return this.raw === 0n;
  }

  isPositive(): boolean {
    return this.raw > 0n;
  }

  isNegative(): boolean {
    return this.raw < 0n;
  }

  isLessThan(other: Quantity): boolean {
    return this.raw < other.raw;
  }

  isGreaterThan(other: Quantity): boolean {
    return this.raw > other.raw;
  }

  isGreaterThanOrEqual(other: Quantity): boolean {
    return this.raw >= other.raw;
  }

  toNumber(): number {
    return Number(this.raw) / Number(SCALE);
  }

  toString(): string {
    const isNeg = this.raw < 0n;
    const absVal = isNeg ? -this.raw : this.raw;
    const intPart = absVal / SCALE;
    const decPart = (absVal % SCALE).toString().padStart(SCALE_DECIMALS, "0");
    const trimmedDec = decPart.replace(/0+$/, "");
    const res = trimmedDec.length > 0 ? `${intPart}.${trimmedDec}` : `${intPart}`;
    return isNeg ? `-${res}` : res;
  }

  toDbString(): string {
    const isNeg = this.raw < 0n;
    const absVal = isNeg ? -this.raw : this.raw;
    const intPart = absVal / SCALE;
    const decPart = (absVal % SCALE).toString().padStart(SCALE_DECIMALS, "0");
    return isNeg ? `-${intPart}.${decPart}` : `${intPart}.${decPart}`;
  }
}
