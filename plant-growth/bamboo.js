(function () {
  const shared = window.PlantGrowthShared;

  function drawBambooLeaf(ctx, x, y, angle, scale, colorA, colorB) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    shared.fillPolygon(
      ctx,
      [
        { x: -2, y: 0 },
        { x: 10, y: -4 },
        { x: 34, y: -1 },
        { x: 12, y: 5 },
        { x: 0, y: 4 }
      ],
      colorA
    );

    shared.fillPolygon(
      ctx,
      [
        { x: 0, y: 1 },
        { x: 9, y: -1 },
        { x: 21, y: 1 },
        { x: 8, y: 4 }
      ],
      colorB
    );

    ctx.restore();
  }

  function drawNodeBand(ctx, x, y, halfWidth, bandColor, seamColor) {
    shared.fillPolygon(
      ctx,
      [
        { x: x - 1.05, y: y - halfWidth * 0.96 },
        { x: x + 1.05, y: y - halfWidth * 0.91 },
        { x: x + 1.1, y: y + halfWidth * 0.91 },
        { x: x - 1.0, y: y + halfWidth * 0.96 }
      ],
      bandColor
    );

    shared.fillPolygon(
      ctx,
      [
        { x: x - 0.46, y: y - halfWidth * 0.84 },
        { x: x + 0.46, y: y - halfWidth * 0.82 },
        { x: x + 0.48, y: y + halfWidth * 0.82 },
        { x: x - 0.44, y: y + halfWidth * 0.84 }
      ],
      seamColor
    );
  }

  function drawCulm(ctx, progress, color, options) {
    const p = shared.clamp(progress, 0, 1);
    if (p <= 0) {
      return;
    }

    const length = options.length * p;
    const offsetY = options.offsetY;
    const tilt = options.tilt;
    const thickness = options.thickness;

    const nodes = [];
    const widths = [];
    const segmentCount = 8;

    for (let index = 0; index <= segmentCount; index += 1) {
      const t = index / segmentCount;
      const sway =
        (Math.sin(t * Math.PI * 2.1 + options.phase) * (1.4 + (1 - t) * 0.9) +
          Math.sin(t * Math.PI * 5.2 + options.phase * 1.8) * 0.36) *
        p;

      nodes.push({
        x: length * t,
        y: offsetY + sway + tilt * t * t * 14
      });
      widths.push(thickness * (1 - t * 0.2));
    }

    const culmPalette = [
      shared.lighten(color, 20),
      shared.lighten(color, 8),
      shared.darken(color, 8),
      shared.lighten(color, 14)
    ];

    shared.drawFacetedRibbon(ctx, nodes, widths, culmPalette);

    const ringGap = 30;
    const ringCount = Math.floor(length / ringGap);
    for (let index = 1; index <= ringCount; index += 1) {
      const x = Math.min(length - 3, index * ringGap);
      const t = length > 0 ? x / length : 0;
      const ringY = offsetY + tilt * t * t * 14;
      const ringHalfWidth = thickness * (1 - t * 0.2) * 0.4;
      drawNodeBand(
        ctx,
        x,
        ringY,
        ringHalfWidth,
        shared.darken(color, 8),
        shared.darken(color, 14)
      );
    }

    if (p > 0.24) {
      const leafProgress = shared.easeOutCubic((p - 0.24) / 0.76);
      const leafA = {
        x: length * 0.36,
        y: offsetY + tilt * 2
      };
      const leafB = {
        x: length * 0.58,
        y: offsetY - 2 + tilt * 4
      };

      drawBambooLeaf(
        ctx,
        leafA.x,
        leafA.y,
        -0.92,
        (0.58 + leafProgress * 0.52) * options.leafScale,
        shared.lighten(color, 16),
        shared.darken(color, 6)
      );

      drawBambooLeaf(
        ctx,
        leafA.x + 2,
        leafA.y + 6,
        0.72,
        (0.54 + leafProgress * 0.46) * options.leafScale,
        shared.lighten(color, 10),
        shared.darken(color, 10)
      );

      drawBambooLeaf(
        ctx,
        leafB.x,
        leafB.y,
        -0.7,
        (0.48 + leafProgress * 0.42) * options.leafScale,
        shared.lighten(color, 14),
        shared.darken(color, 8)
      );
    }
  }

  function drawBamboo(ctx, progress, color, sizeBoost = 1) {
    const p = shared.easeOutCubic(progress);

    drawCulm(ctx, p, color, {
      length: 232 * sizeBoost,
      offsetY: 0,
      tilt: -0.04,
      thickness: 13 * sizeBoost,
      phase: 0.2,
      leafScale: 1.06 * sizeBoost
    });

    if (p > 0.2) {
      drawCulm(ctx, shared.clamp((p - 0.2) / 0.8, 0, 1), color, {
        length: 188 * sizeBoost,
        offsetY: -18 * sizeBoost,
        tilt: -0.08,
        thickness: 9.4 * sizeBoost,
        phase: 1.1,
        leafScale: 0.92 * sizeBoost
      });
    }

    if (p > 0.38) {
      drawCulm(ctx, shared.clamp((p - 0.38) / 0.62, 0, 1), color, {
        length: 164 * sizeBoost,
        offsetY: 20 * sizeBoost,
        tilt: 0.06,
        thickness: 8.4 * sizeBoost,
        phase: 2.2,
        leafScale: 0.86 * sizeBoost
      });
    }
  }

  function drawHint(ctx, color) {
    ctx.save();
    ctx.translate(-4, 2);
    drawCulm(ctx, 1, color, {
      length: 62,
      offsetY: 0,
      tilt: -0.03,
      thickness: 7.4,
      phase: 0.3,
      leafScale: 0.62
    });
    ctx.restore();
  }

  window.PlantGrowthMotifs = window.PlantGrowthMotifs || {};
  window.PlantGrowthMotifs.bamboo = {
    draw: drawBamboo,
    drawHint
  };
})();
