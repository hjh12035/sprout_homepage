(function () {
  const shared = window.PlantGrowthShared;

  function drawFacetStem(ctx, progress, color, sizeBoost) {
    const p = shared.easeOutCubic(progress);
    const length = (64 + 212 * p) * sizeBoost;
    const nodes = [];
    const widths = [];

    for (let index = 0; index <= 9; index += 1) {
      const t = index / 9;
      const bend = Math.sin(t * 2.6) * (4.2 + (1 - t) * 2.4) * p;
      nodes.push({
        x: length * t,
        y: bend
      });
      widths.push(8.4 - t * 2.4 + p * 1.8);
    }

    shared.drawFacetedRibbon(ctx, nodes, widths, [
      "#95a93f",
      "#819535",
      "#6d802b",
      "#8ea23a"
    ]);

    return { length, nodes };
  }

  function drawFacetLeaf(ctx, x, y, rotate, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotate);
    ctx.scale(scale, scale);

    shared.fillPolygon(
      ctx,
      [
        { x: 0, y: 0 },
        { x: 22, y: -8 },
        { x: 36, y: -1 },
        { x: 24, y: 11 },
        { x: 8, y: 9 }
      ],
      "#8aa03b"
    );

    shared.fillPolygon(
      ctx,
      [
        { x: 3, y: 1 },
        { x: 16, y: -2 },
        { x: 27, y: 3 },
        { x: 14, y: 8 }
      ],
      "#748b30"
    );

    ctx.restore();
  }

  function drawFacetPetals(ctx, scale) {
    const petalPalette = ["#ffd253", "#ffbe33", "#ffcf4a", "#f8b22d", "#ffca42", "#f2a02d"];
    for (let index = 0; index < 14; index += 1) {
      const angle = (Math.PI * 2 * index) / 14;
      ctx.save();
      ctx.rotate(angle);
      ctx.scale(scale, scale);
      shared.fillPolygon(
        ctx,
        [
          { x: 0, y: -8 },
          { x: 10, y: -4 },
          { x: 22, y: 0 },
          { x: 10, y: 5 },
          { x: 0, y: 8 },
          { x: 3, y: 0 }
        ],
        petalPalette[index % petalPalette.length]
      );
      ctx.restore();
    }
  }

  function drawFacetDisk(ctx, radius) {
    shared.fillPolygon(
      ctx,
      [
        { x: 0, y: -radius },
        { x: radius * 0.72, y: -radius * 0.5 },
        { x: radius, y: radius * 0.16 },
        { x: radius * 0.48, y: radius },
        { x: -radius * 0.42, y: radius * 0.86 },
        { x: -radius, y: radius * 0.14 },
        { x: -radius * 0.66, y: -radius * 0.64 }
      ],
      "#6f3b0a"
    );

    shared.fillPolygon(
      ctx,
      [
        { x: -radius * 0.28, y: -radius * 0.32 },
        { x: radius * 0.4, y: -radius * 0.2 },
        { x: radius * 0.26, y: radius * 0.38 },
        { x: -radius * 0.34, y: radius * 0.28 }
      ],
      "#8b4e13"
    );
  }

  function drawSunflower(ctx, progress, color, sizeBoost = 1) {
    const p = shared.easeOutCubic(progress);
    const stem = drawFacetStem(ctx, progress, color, sizeBoost);

    if (p > 0.18) {
      const leafProgress = shared.easeOutCubic((p - 0.18) / 0.82);
      const anchor = stem.nodes[3];
      drawFacetLeaf(ctx, anchor.x + 6, anchor.y + 4, -0.72, 0.52 + leafProgress * 0.9);
    }

    if (p > 0.34) {
      const leafProgress = shared.easeOutCubic((p - 0.34) / 0.66);
      const anchor = stem.nodes[5];
      drawFacetLeaf(ctx, anchor.x + 2, anchor.y + 14, 0.72, 0.46 + leafProgress * 0.86);
    }

    if (p > 0.5) {
      const bloomProgress = shared.easeOutCubic((p - 0.5) / 0.5);
      ctx.save();
      ctx.translate(stem.length * 0.84, -10);
      ctx.scale(0.46 + bloomProgress * 0.62, 0.46 + bloomProgress * 0.62);
      drawFacetPetals(ctx, 1);
      drawFacetDisk(ctx, 12);
      ctx.restore();
    }
  }

  function drawHint(ctx) {
    ctx.save();
    ctx.scale(0.9, 0.9);
    drawFacetPetals(ctx, 0.74);
    drawFacetDisk(ctx, 9);
    ctx.restore();
  }

  window.PlantGrowthMotifs = window.PlantGrowthMotifs || {};
  window.PlantGrowthMotifs.sunflower = {
    draw: drawSunflower,
    drawHint
  };
})();
