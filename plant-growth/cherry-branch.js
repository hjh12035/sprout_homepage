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
      shared.lighten(color, 12),
      shared.darken(color, 2),
      shared.lighten(color, 14),
      shared.darken(color, 4),
      shared.lighten(color, 8),
      shared.darken(color, 8)
    ];

    for (let index = 0; index < 7; index += 1) {
      ctx.save();
      ctx.rotate((Math.PI * 2 * index) / 7);
      shared.fillPolygon(
        ctx,
        [
          { x: 0, y: 0 },
          { x: 12, y: -4 },
          { x: 20, y: 0 },
          { x: 12, y: 5 },
          { x: 2, y: 4 }
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
      "#5c3317",
      "#6a3f20",
      "#7f5236",
      "#93704f"
    ];

    shared.drawFacetedRibbon(ctx, branch.nodes, branch.widths, palette);

    const offshootCount = Math.floor(4 * p);
    for (let index = 0; index < offshootCount; index += 1) {
      const anchorIndex = 2 + index * 2;
      const anchor = branch.nodes[anchorIndex];
      if (!anchor) {
        continue;
      }

      const offshootLength = (20 + index * 10 + p * 22) * sizeBoost;
      const branchLift = index % 2 === 0 ? -1 : 1;
      const offshootNodes = [
        { x: anchor.x, y: anchor.y },
        { x: anchor.x + offshootLength * 0.32, y: anchor.y + branchLift * 8 * sizeBoost },
        { x: anchor.x + offshootLength, y: anchor.y + branchLift * 10 * sizeBoost }
      ];
      const offshootWidths = [10 - index * 0.8, 8 - index * 0.4, 6];

      shared.drawFacetedRibbon(ctx, offshootNodes, offshootWidths, [
        "#4f2712",
        "#8f5d42"
      ]);
    }

    if (p > 0.16) {
      const blossomProgress = shared.easeOutCubic((p - 0.16) / 0.84);
      drawFacetFlower(ctx, length * 0.16, -10 * sizeBoost, 0.54 + blossomProgress * 0.62, color);
    }

    if (p > 0.34) {
      const blossomProgress = shared.easeOutCubic((p - 0.34) / 0.66);
      drawFacetFlower(ctx, length * 0.34, 10 * sizeBoost, 0.5 + blossomProgress * 0.64, color);
    }

    if (p > 0.52) {
      const blossomProgress = shared.easeOutCubic((p - 0.52) / 0.48);
      drawFacetFlower(ctx, length * 0.52, -12 * sizeBoost, 0.44 + blossomProgress * 0.58, color);
    }

    if (p > 0.68) {
      const blossomProgress = shared.easeOutCubic((p - 0.68) / 0.32);
      drawFacetFlower(ctx, length * 0.68, 8 * sizeBoost, 0.38 + blossomProgress * 0.52, color);
    }

    if (p > 0.82) {
      const blossomProgress = shared.easeOutCubic((p - 0.82) / 0.18);
      drawFacetFlower(ctx, length * 0.82, -4 * sizeBoost, 0.34 + blossomProgress * 0.5, color);
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
