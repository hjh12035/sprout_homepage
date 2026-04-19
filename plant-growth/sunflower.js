(function () {
  const shared = window.PlantGrowthShared;

  function drawFacetStem(ctx, progress, color, sizeBoost) {
    const p = shared.easeOutCubic(progress);
    const length = (84 + 240 * p) * sizeBoost;
    const nodes = [];
    const widths = [];
    const baseWidth = 18 + p * 6;
    const tipWidth = 8 + p * 3;

    for (let index = 0; index <= 11; index += 1) {
      const t = index / 11;
      const bend = (
        Math.sin(t * Math.PI * 1.9 - 0.4) * (7.2 + (1 - t) * 4.0) +
        Math.sin(t * Math.PI * 4.2) * 1.6
      ) * p;
      nodes.push({
        x: length * t,
        y: bend
      });
      const taper = baseWidth + (tipWidth - baseWidth) * t;
      const swell = Math.sin(Math.max(0, (1 - t) * Math.PI)) * 4.2;
      widths.push(Math.max(8, taper + swell * (0.75 + p * 0.2)));
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
        { x: 30, y: -12 },
        { x: 54, y: -2 },
        { x: 32, y: 18 },
        { x: 12, y: 14 }
      ],
      "#8aa03b"
    );

    shared.fillPolygon(
      ctx,
      [
        { x: 5, y: 2 },
        { x: 20, y: -4 },
        { x: 36, y: 2 },
        { x: 18, y: 12 }
      ],
      "#748b30"
    );

    ctx.restore();
  }

  function drawFacetPetals(ctx, scale) {
    const petalPalette = ["#ffd253", "#ffbe33", "#ffcf4a", "#f8b22d", "#ffca42", "#f2a02d"];
    const outerCount = 18;
    const innerCount = 10;

    for (let index = 0; index < outerCount; index += 1) {
      const angle = (Math.PI * 2 * index) / outerCount;
      ctx.save();
      ctx.rotate(angle);
      ctx.scale(scale, scale);
      shared.fillPolygon(
        ctx,
        [
          { x: 0, y: -10 },
          { x: 12, y: -5 },
          { x: 28, y: 0 },
          { x: 12, y: 6 },
          { x: 0, y: 10 },
          { x: 4, y: 2 }
        ],
        petalPalette[index % petalPalette.length]
      );
      ctx.restore();
    }

    for (let index = 0; index < innerCount; index += 1) {
      const angle = (Math.PI * 2 * index) / innerCount + Math.PI / innerCount;
      ctx.save();
      ctx.rotate(angle);
      ctx.scale(scale * 0.8, scale * 0.8);
      shared.fillPolygon(
        ctx,
        [
          { x: 0, y: -6 },
          { x: 8, y: -3 },
          { x: 16, y: 0 },
          { x: 8, y: 4 },
          { x: 0, y: 6 }
        ],
        petalPalette[(index + 2) % petalPalette.length]
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
      drawFacetLeaf(ctx, anchor.x + 2, anchor.y + 14, 0.72, 0.76 + leafProgress * 1.12);
    }

    if (p > 0.46) {
      const leafProgress = shared.easeOutCubic((p - 0.46) / 0.54);
      const anchor = stem.nodes[7];
      drawFacetLeaf(ctx, anchor.x - 4, anchor.y + 20, -0.38, 0.68 + leafProgress * 1.04);
    }

    if (p > 0.5) {
      const bloomProgress = shared.easeOutCubic((p - 0.5) / 0.5);
      ctx.save();
      const tip = stem.nodes[stem.nodes.length - 1];
      ctx.translate(tip.x, tip.y);
      ctx.scale(0.6 + bloomProgress * 0.9, 0.6 + bloomProgress * 0.9);
      drawFacetPetals(ctx, 1);
      drawFacetDisk(ctx, 16);
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
