(function () {
  const shared = window.PlantGrowthShared;

  function branchNodePath(length, swayScale, progress) {
    const nodes = [];
    const widths = [];

    for (let index = 0; index <= 10; index += 1) {
      const t = index / 10;
      const wave = Math.sin(t * 2.7) * swayScale * progress;
      const drift = Math.cos(t * 1.3) * swayScale * 0.35 * progress;
      nodes.push({
        x: length * t,
        y: wave + drift
      });
      widths.push(14 - t * 5.5 + progress * 3.5);
    }

    return { nodes, widths };
  }

  function drawFacetFlower(ctx, x, y, scale, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    const petalColors = [
      shared.lighten(color, 18),
      shared.lighten(color, 10),
      shared.darken(color, 4),
      shared.lighten(color, 14),
      shared.darken(color, 2)
    ];

    for (let index = 0; index < 5; index += 1) {
      ctx.save();
      ctx.rotate((Math.PI * 2 * index) / 5);
      shared.fillPolygon(
        ctx,
        [
          { x: 0, y: 0 },
          { x: 10, y: -3 },
          { x: 16, y: 0 },
          { x: 10, y: 4 },
          { x: 3, y: 3 }
        ],
        petalColors[index]
      );
      ctx.restore();
    }

    shared.fillPolygon(
      ctx,
      [
        { x: -3, y: -3 },
        { x: 3, y: -3 },
        { x: 6, y: 3 },
        { x: 0, y: 8 },
        { x: -6, y: 3 }
      ],
      shared.darken(color, 14)
    );

    ctx.restore();
  }

  function drawCherryBranch(ctx, progress, color, sizeBoost = 1) {
    const p = shared.easeOutCubic(progress);
    const length = (68 + 250 * p) * sizeBoost;
    const branch = branchNodePath(length, 11 * sizeBoost, p);
    const palette = [
      shared.darken(color, 24),
      shared.darken(color, 12),
      color,
      shared.lighten(color, 10)
    ];

    shared.drawFacetedRibbon(ctx, branch.nodes, branch.widths, palette);

    const offshootCount = Math.floor(3 * p);
    for (let index = 0; index < offshootCount; index += 1) {
      const anchorIndex = 3 + index * 2;
      const anchor = branch.nodes[anchorIndex];
      if (!anchor) {
        continue;
      }

      const offshootLength = (28 + index * 14 + p * 28) * sizeBoost;
      const branchLift = index % 2 === 0 ? -1 : 1;
      const offshootNodes = [
        { x: anchor.x, y: anchor.y },
        { x: anchor.x + offshootLength * 0.4, y: anchor.y + branchLift * 10 * sizeBoost },
        { x: anchor.x + offshootLength, y: anchor.y + branchLift * 18 * sizeBoost }
      ];
      const offshootWidths = [7 - index * 0.6, 6 - index * 0.4, 4.5];

      shared.drawFacetedRibbon(ctx, offshootNodes, offshootWidths, [
        shared.darken(color, 20),
        shared.lighten(color, 8)
      ]);
    }

    if (p > 0.2) {
      const blossomProgress = shared.easeOutCubic((p - 0.2) / 0.8);
      drawFacetFlower(ctx, length * 0.34, -18 * sizeBoost, 0.48 + blossomProgress * 0.72, color);
    }

    if (p > 0.4) {
      const blossomProgress = shared.easeOutCubic((p - 0.4) / 0.6);
      drawFacetFlower(ctx, length * 0.62, 18 * sizeBoost, 0.4 + blossomProgress * 0.6, color);
    }

    if (p > 0.62) {
      const blossomProgress = shared.easeOutCubic((p - 0.62) / 0.38);
      drawFacetFlower(ctx, length * 0.84, -16 * sizeBoost, 0.34 + blossomProgress * 0.58, color);
    }
  }

  function drawHint(ctx, color) {
    ctx.save();
    ctx.translate(0, -2);
    drawFacetFlower(ctx, 0, 0, 1.05, color);
    ctx.restore();
  }

  window.PlantGrowthMotifs = window.PlantGrowthMotifs || {};
  window.PlantGrowthMotifs.cherry_branch = {
    draw: drawCherryBranch,
    drawHint
  };
})();
