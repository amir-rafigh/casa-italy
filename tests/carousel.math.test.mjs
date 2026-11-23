import assert from "node:assert/strict";
import test from "node:test";
import { carouselPosition, circularOffset, wrapIndex } from "../lib/carousel/carousel.math.ts";
import { responsiveCarouselConfig } from "../lib/carousel/carousel.config.ts";

test("negative and repeated turns preserve the circular order", () => {
  assert.equal(wrapIndex(-1, 4), 3);
  assert.equal(wrapIndex(4001, 4), 1);
  for (const count of [1, 2, 3, 4, 6, 7, 15, 34]) {
    for (let progress = -8; progress <= 8; progress += 0.125) {
      for (let index = 0; index < count; index++) {
        assert.equal(circularOffset(index, progress, count), circularOffset(index, progress + count, count));
      }
    }
  }
});

test("intermediate positions follow the ellipse throughout a transition", () => {
  for (const width of [320, 375, 390, 430, 768, 1440]) {
    const config = responsiveCarouselConfig(width);
    const active = carouselPosition(0, config);
    assert.equal(active.scale, 1);
    assert.equal(active.opacity, 1);
    for (let offset = -1; offset <= 1; offset += 0.025) {
      const p = carouselPosition(offset, config);
      const ellipse = (p.x / config.radiusX) ** 2 + (1 - p.y / config.radiusY) ** 2;
      assert.ok(Math.abs(ellipse - 1) < 1e-12);
      assert.ok(p.scale <= active.scale && p.scale >= config.inactiveScale);
      assert.ok(p.zIndex <= active.zIndex);
      assert.ok(Math.abs(p.rotation) <= config.maxRotation);
    }
  }
});

test("the wrap seam is invisible for filtered and unfiltered collections", () => {
  const config = responsiveCarouselConfig(390);
  for (const count of [3, 4, 6, 7, 15, 34]) {
    for (const sign of [-1, 1]) {
      assert.equal(carouselPosition(sign * count / 2, config, count).opacity, 0);
      assert.ok(carouselPosition(sign * (count / 2 - 0.001), config, count).opacity < 0.002);
    }
    assert.ok(carouselPosition(1, config, count).opacity > 0.6);
  }
});
