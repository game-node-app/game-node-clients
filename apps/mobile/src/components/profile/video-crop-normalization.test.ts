import { describe, expect, it } from "vitest";
import { normalizeVideoCrop } from "../../../../../packages/ui/src/components/profile/util/normalizeVideoCrop";

const expectUnitBounds = (crop: {
  x: number;
  y: number;
  width: number;
  height: number;
}) => {
  expect(crop.x).toBeGreaterThanOrEqual(0);
  expect(crop.y).toBeGreaterThanOrEqual(0);
  expect(crop.width).toBeGreaterThan(0);
  expect(crop.height).toBeGreaterThan(0);
  expect(crop.x + crop.width).toBeLessThanOrEqual(1);
  expect(crop.y + crop.height).toBeLessThanOrEqual(1);
};

describe("normalizeVideoCrop", () => {
  it("converts percentages into 0..1 values", () => {
    expect(normalizeVideoCrop({ x: 25, y: 50, width: 20, height: 30 })).toEqual(
      { x: 0.25, y: 0.5, width: 0.2, height: 0.3 },
    );
  });

  it("keeps a crop touching the right and bottom edges within bounds", () => {
    const crop = normalizeVideoCrop({
      x: 72.5,
      y: 55.55,
      width: 27.5,
      height: 44.45,
    });

    expectUnitBounds(crop);
    expect(crop.x + crop.width).toBeCloseTo(1, 10);
    expect(crop.y + crop.height).toBeCloseTo(1, 10);
  });

  it("does not exceed 1 when rounded values would overflow", () => {
    const crop = normalizeVideoCrop({
      x: 33.333333,
      y: 66.666667,
      width: 66.666667,
      height: 33.333333,
    });

    expectUnitBounds(crop);
    expect(crop.x + crop.width).toBeLessThanOrEqual(1);
    expect(crop.y + crop.height).toBeLessThanOrEqual(1);
  });

  it("clamps an origin pushed past the far edge", () => {
    const crop = normalizeVideoCrop({ x: 90, y: 95, width: 20, height: 10 });

    expect(crop).toEqual({ x: 0.8, y: 0.9, width: 0.2, height: 0.1 });
    expectUnitBounds(crop);
  });

  it("clamps out-of-range and negative values", () => {
    const crop = normalizeVideoCrop({ x: -20, y: -5, width: 150, height: 120 });

    expect(crop).toEqual({ x: 0, y: 0, width: 1, height: 1 });
    expectUnitBounds(crop);
  });

  it("keeps width and height greater than zero for degenerate crops", () => {
    const crop = normalizeVideoCrop({ x: 0, y: 0, width: 0, height: 0 });

    expect(crop.width).toBeGreaterThan(0);
    expect(crop.height).toBeGreaterThan(0);
    expectUnitBounds(crop);
  });

  it("treats non-finite values as zero", () => {
    const crop = normalizeVideoCrop({
      x: Number.NaN,
      y: Number.POSITIVE_INFINITY,
      width: Number.NaN,
      height: Number.NEGATIVE_INFINITY,
    });

    expect(crop.x).toBe(0);
    expect(crop.y).toBe(0);
    expect(crop.width).toBeGreaterThan(0);
    expect(crop.height).toBeGreaterThan(0);
    expectUnitBounds(crop);
  });
});
