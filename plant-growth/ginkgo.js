(function () {
  const shared = window.PlantGrowthShared;

  function leafPalette(baseColor) {
    return [
      shared.lighten(baseColor, 26),
      shared.lighten(baseColor, 10),
      shared.darken(baseColor, 12)
    ];
  }

  function drawFanLeaf(ctx, x, y, scale, rotate, palette, veinColor) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotate);
    ctx.scale(scale, scale);

    const petioleNodes = [
      { x: -1, y: 28 },
      { x: 2, y: 18 },
      { x: 1, y: 8 },
      { x: 0, y: 0 }
    ];
    shared.drawFacetedRibbon(ctx, petioleNodes, [2.5, 2.2, 1.8, 1.3], [
      "#8B7355",
      "#A0826D",
      "#B2937C"
    ]);

    shared.fillPolygon(
      ctx,
      [
        { x: 0, y: 10 },
        { x: -10, y: 8 },
        { x: -20, y: 3 },
        { x: -25, y: -7 },
        { x: -16, y: -20 },
        { x: -4, y: -27 },
        { x: 0, y: -23 }
      ],
      palette[0]
    );

    shared.fillPolygon(
      ctx,
      [
        { x: 0, y: 10 },
        { x: -4, y: -27 },
        { x: 0, y: -21 },
        { x: 4, y: -27 },
        { x: 10, y: 8 }
      ],
      palette[1]
    );

    shared.fillPolygon(
      ctx,
      [
        { x: 0, y: 10 },
        { x: 10, y: 8 },
        { x: 20, y: 3 },
        { x: 25, y: -7 },
        { x: 16, y: -20 },
        { x: 4, y: -27 },
        { x: 0, y: -23 }
      ],
      palette[2]
    );

    shared.fillPolygon(
      ctx,
      [
        { x: 0, y: 8 },
        { x: 1, y: 7 },
        { x: 0, y: -19 },
        { x: -1, y: -19 }
      ],
      veinColor
    );

    shared.fillPolygon(
      ctx,
      [
        { x: 0, y: 8 },
        { x: -1, y: 7 },
        { x: -11, y: -9 },
        { x: -9, y: -10 }
      ],
      veinColor
    );

    shared.fillPolygon(
      ctx,
      [
        { x: 0, y: 8 },
        { x: -1, y: 8 },
        { x: -17, y: -2 },
        { x: -15, y: -3 }
      ],
      veinColor
    );

    shared.fillPolygon(
      ctx,
      [
        { x: 0, y: 8 },
        { x: 1, y: 7 },
        { x: 11, y: -9 },
        { x: 9, y: -10 }
      ],
      veinColor
    );

    shared.fillPolygon(
      ctx,
      [
        { x: 0, y: 8 },
        { x: 1, y: 8 },
        { x: 17, y: -2 },
        { x: 15, y: -3 }
      ],
      veinColor
    );

    ctx.restore();
  }

  function drawDriftingLeaves(ctx, progress, color, sizeBoost) {
    const p = shared.easeOutCubic(progress);
    const base = shared.lighten(color, 4);
    const palette = leafPalette(base);
    const veinColor = shared.lighten(palette[1], 4);

    const anchorScale = (0.54 + p * 0.14) * sizeBoost;
    drawFanLeaf(ctx, -8 * sizeBoost, -22 * sizeBoost, anchorScale, -0.42, palette, veinColor);

    const leaves = [
      {
        start: 0.12,
        x: 28,
        y: -29,
        driftX: 30,
        dropY: 64,
        sway: 7,
        spin: 0.08,
        scale: 0.56,
        tilt: -0.76
      },
      {
        start: 0.38,
        x: 64,
        y: -20,
        driftX: 26,
        dropY: 56,
        sway: 6,
        spin: 0.09,
        scale: 0.5,
        tilt: 0.26
      },
      {
        start: 0.62,
        x: 98,
        y: -10,
        driftX: 22,
        dropY: 48,
        sway: 6,
        spin: 0.1,
        scale: 0.46,
        tilt: -1.02
      }
    ];

    for (let index = 0; index < leaves.length; index += 1) {
      const config = leaves[index];
      const local = shared.clamp((p - config.start) / (1 - config.start), 0, 1);
      if (local <= 0) {
        continue;
      }

      const swayX = Math.sin(local * 5.2 + index * 0.9) * config.sway;
      const swayY = Math.sin(local * 4.4 + index * 1.2) * config.sway * 0.36;
      const x = (config.x + config.driftX * local + swayX) * sizeBoost;
      const y = (config.y + config.dropY * local + swayY) * sizeBoost;
      const rotate =
        config.tilt +
        Math.sin(local * (4.2 + index * 0.9) + index * 1.3) * config.spin -
        local * (0.08 + index * 0.04);
      const scale = config.scale * (0.8 + local * 0.36) * sizeBoost;

      drawFanLeaf(ctx, x, y, scale, rotate, palette, veinColor);
    }
  }

  function drawGinkgo(ctx, progress, color, sizeBoost = 1) {
    const p = shared.easeOutCubic(progress);
    drawDriftingLeaves(ctx, p, color, sizeBoost);
  }

  function drawHint(ctx, color) {
    const paleBase = shared.lighten(color, 20);
    const palette = [
      shared.lighten(paleBase, 16),
      shared.lighten(paleBase, 8),
      shared.darken(paleBase, 6)
    ];

    ctx.save();
    drawFanLeaf(ctx, 0, 2, 1.06, -0.2, palette, shared.lighten(palette[1], 4));
    ctx.restore();
  }

  window.PlantGrowthMotifs = window.PlantGrowthMotifs || {};
  window.PlantGrowthMotifs.ginkgo = {
    draw: drawGinkgo,
    drawHint
  };
})();
