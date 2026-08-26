import { describe, expect, it } from "bun:test";
import { Quantity } from "../modules/inventory/domain/quantity";

describe("Inventory Quantity Policy & Fixed-Scale Decimal Arithmetic Suite", () => {
  it("parses valid integer and fractional quantity strings up to 4 decimal places", () => {
    const q1 = Quantity.fromString("100");
    expect(q1.toString()).toBe("100");
    expect(q1.toDbString()).toBe("100.0000");

    const q2 = Quantity.fromString("12.5");
    expect(q2.toString()).toBe("12.5");
    expect(q2.toDbString()).toBe("12.5000");

    const q3 = Quantity.fromString("0.1234");
    expect(q3.toString()).toBe("0.1234");
    expect(q3.toDbString()).toBe("0.1234");
  });

  it("rejects invalid inputs or precision exceeding 4 decimal places", () => {
    expect(() => Quantity.fromString("12.12345")).toThrow("precision exceeds maximum 4 decimal places");
    expect(() => Quantity.fromString("abc")).toThrow("Invalid numeric quantity");
    expect(() => Quantity.fromString("")).toThrow("Invalid numeric quantity");
    expect(() => Quantity.fromNumber(NaN)).toThrow("must be a finite number");
    expect(() => Quantity.fromNumber(Infinity)).toThrow("must be a finite number");
  });

  it("performs exact addition and subtraction without floating-point drift", () => {
    const a = Quantity.fromString("0.1000");
    const b = Quantity.fromString("0.2000");
    const c = a.add(b);
    expect(c.toString()).toBe("0.3");
    expect(c.toNumber()).toBe(0.3);

    const diff = c.subtract(a);
    expect(diff.toString()).toBe("0.2");
  });

  it("correctly evaluates comparison operators and sign checks", () => {
    const zero = Quantity.zero();
    const pos = Quantity.fromString("15.25");
    const small = Quantity.fromString("5.10");

    expect(zero.isZero()).toBe(true);
    expect(pos.isPositive()).toBe(true);
    expect(pos.isGreaterThan(small)).toBe(true);
    expect(small.isLessThan(pos)).toBe(true);
    expect(pos.isGreaterThanOrEqual(pos)).toBe(true);
  });
});
