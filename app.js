const growthApi = window.PlantGrowth || {};

const growthOverlayOpacity =
  typeof growthApi.overlayOpacity === "function"
    ? growthApi.overlayOpacity
    : (progress) => {
        const p = Math.min(1, Math.max(0, Number(progress) || 0));
        if (p <= 0.3) {
          return p / 0.3;
        }
        if (p >= 0.7) {
          return (1 - p) / 0.3;
        }
        return 1;
      };

const growthCreatePlantRenderer =
  typeof growthApi.createPlantRenderer === "function"
    ? growthApi.createPlantRenderer
    : () => ({
        resize() {},
        drawHint() {},
        render() {}
      });

const PAGES = {
  "home": {
    "eyebrow": "Seiki Home",
    "title": "生机主页",
    "subtitle": "把植物的生长轨迹变成页面切换语言。拖拽边缘虚影时，主题色与枝叶一同显形，再像呼吸一样淡出。",
    "panels": [
      {
        "heading": "空间叙事",
        "text": "每个方向是一种植物人格：向左边缘拖向右、向右边缘拖向左、上边缘向下、下边缘向上。"
      },
      {
        "heading": "交互节奏",
        "text": "拖拽到中心线会完成内容切换；未过线释放自动回缩，过线释放自动完成翻页。下边缘上拖进入向日葵主题翻页。"
      }
    ]
  },
  "about": {
    "eyebrow": "About",
    "title": "植物语言",
    "subtitle": "以低多边形块面塑造植物的骨架感，保留折面、切角和单色系渐进层次。",
    "panels": [
      {
        "heading": "形态原则",
        "text": "叶片采用折平面，茎干由角柱分节堆叠，拒绝真实纹理，保持矢量平涂。"
      },
      {
        "heading": "方向交互",
        "text": "此页可向右边缘拖向左返回主页，也可向左边缘拖向右进入银杏主题页。"
      }
    ]
  },
  "ginkgo": {
    "eyebrow": "Ginkgo",
    "title": "银杏折扇",
    "subtitle": "左翻进入暖金银杏场域：扇叶以低多边形折面展开，细枝分叉从边缘伸入，叶片沿拖拽方向斜向下飘落。",
    "panels": [
      {
        "heading": "形态语法",
        "text": "银杏叶采用宽弧扇形与中心缺刻结构，叶脉用接近叶色的浅线暗示放射分叉，保持几何风格而不突兀。"
      },
      {
        "heading": "导航关系",
        "text": "在本页向右边缘拖向左可返回“植物语言”页；拖拽时枝干与叶片同步显影，并保持暖金到褐金的层次。"
      }
    ]
  },
  "gallery": {
    "eyebrow": "Gallery",
    "title": "枝影画廊",
    "subtitle": "樱花花枝以棱角枝节延展，花团在拖拽进度中分批显影，形成带结构感的绽放。",
    "panels": [
      {
        "heading": "色彩绑定",
        "text": "樱枝方向绑定粉红系主题色，色层先聚合后消隐，确保翻页阶段有明确视觉峰值。"
      },
      {
        "heading": "场景留白",
        "text": "背景维持高留白与轻雾块，强调植物生长路径在过渡中的运动质感。"
      }
    ]
  },
  "poem": {
    "eyebrow": "Poem",
    "title": "薰衣草短诗",
    "subtitle": "上翻进入轻紫场域，花穗沿轴线渐次点亮，像风把句子一节一节推向远处。",
    "panels": [
      {
        "heading": "动态结构",
        "text": "主茎先长，花穗后现。每一组花穗都由几何菱形构成，遵循低多边形平涂语法。"
      },
      {
        "heading": "导航关系",
        "text": "此页可从下边缘向上拖返回主页，也支持方向键快速切换。"
      }
    ]
  },
  "sunflower": {
    "eyebrow": "Sunflower",
    "title": "向日葵",
    "subtitle": "这是主页下方的主题页，橙黄单色系以几何向日葵为主视觉，保留低多边形拼贴与平涂层次。",
    "panels": [
      {
        "heading": "主题方向",
        "text": "从主页下边缘上拖进入该页，橙黄遮罩与向日葵生长同步出现，形成暖色翻页峰值。"
      },
      {
        "heading": "导航关系",
        "text": "在本页从上边缘下拖可回到主页；继续从下边缘上拖可进入竹子主题翻页。"
      }
    ]
  },
  "bamboo": {
    "eyebrow": "Bamboo",
    "title": "竹影风廊",
    "subtitle": "向下翻入竹子场域，节间与叶片以低多边形折面层叠生长，形成更克制清爽的东方植物节奏。",
    "panels": [
      {
        "heading": "形态语言",
        "text": "竹秆强调节间与分段粗细变化，叶片以细长折片成簇展开，保持几何平涂而不丢失竹子的挺拔感。"
      },
      {
        "heading": "导航关系",
        "text": "在本页从上边缘下拖可回到向日葵翻页场，交互阈值、回拉与覆盖逻辑与其他方向保持一致。"
      }
    ]
  },
  "new_page": {
    "eyebrow": "New",
    "title": "新页面",
    "subtitle": "这里是新页面描述。",
    "panels": [
      {
        "heading": "模块一",
        "text": "描述"
      },
      {
        "heading": "模块二",
        "text": "描述"
      }
    ]
  }
};

const ROUTES = {
  "home": {
    "left": {
      "targetPage": "about",
      "motif": "sprout",
      "themeColor": "#9FD97A"
    },
    "up": {
      "targetPage": "poem",
      "motif": "lavender",
      "themeColor": "#A788E8"
    },
    "down": {
      "targetPage": "sunflower",
      "motif": "sunflower",
      "themeColor": "#F2A02D"
    }
  },
  "about": {
    "left": {
      "targetPage": "ginkgo",
      "motif": "ginkgo",
      "themeColor": "#D9A73A"
    },
    "right": {
      "targetPage": "home",
      "motif": "sprout",
      "themeColor": "#9FD97A"
    }
  },
  "ginkgo": {
    "right": {
      "targetPage": "about",
      "motif": "ginkgo",
      "themeColor": "#D9A73A"
    },
    "up": {
      "targetPage": "new_page",
      "motif": "cherry_branch",
      "themeColor": "#F2A7C2"
    }
  },
  "gallery": {
    "left": {
      "targetPage": "home",
      "motif": "cherry_branch",
      "themeColor": "#F2A7C2"
    }
  },
  "poem": {
    "down": {
      "targetPage": "home",
      "motif": "lavender",
      "themeColor": "#A788E8"
    }
  },
  "sunflower": {
    "up": {
      "targetPage": "home",
      "motif": "sunflower",
      "themeColor": "#F2A02D"
    },
    "down": {
      "targetPage": "bamboo",
      "motif": "bamboo",
      "themeColor": "#6FA85E"
    }
  },
  "bamboo": {
    "up": {
      "targetPage": "sunflower",
      "motif": "bamboo",
      "themeColor": "#6FA85E"
    }
  },
  "new_page": {
    "right": {
      "targetPage": "poem",
      "motif": "ginkgo",
      "themeColor": "#D9A73A"
    },
    "left": {
      "targetPage": "gallery",
      "motif": "sunflower",
      "themeColor": "#F2A02D"
    },
    "up": {
      "targetPage": "bamboo",
      "motif": "lavender",
      "themeColor": "#A788E8"
    }
  }
};

const MOTIF_LABEL = {
  "sprout": "嫩芽",
  "ginkgo": "银杏",
  "cherry_branch": "樱枝",
  "lavender": "薰衣草",
  "sunflower": "向日葵",
  "bamboo": "竹子"
};

const DRAG_PROMPT = {
  left: "向右拖动",
  right: "向左拖动",
  up: "向下拖动",
  down: "向上拖动"
};

const KEY_TO_EDGE_DIRECTION = {
  ArrowRight: "left",
  ArrowLeft: "right",
  ArrowDown: "up",
  ArrowUp: "down"
};

const appEl = document.querySelector("#app");
const titleEl = document.querySelector("#page-title");
const eyebrowEl = document.querySelector("#page-eyebrow");
const subtitleEl = document.querySelector("#page-subtitle");
const panelsEl = document.querySelector("#page-panels");
const overlayEl = document.querySelector("#theme-overlay");
const plantCanvas = document.querySelector("#plant-canvas");
const srStatusEl = document.querySelector("#sr-status");

const hintButtons = Array.from(document.querySelectorAll(".hint"));
const plantRenderer = growthCreatePlantRenderer(plantCanvas);

const state = {
  phase: "idle",
  currentPage: "home",
  originPage: "home",
  targetPage: "home",
  activeDirection: null,
  activeRoute: null,
  progress: 0,
  pointerId: null,
  startX: 0,
  startY: 0,
  switchedForward: false,
  switchedBackOnRollback: false,
  reduceMotion:
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
};

function showBootError(error) {
  const message = error && error.message ? error.message : String(error || "Unknown boot error");
  const node = document.createElement("div");
  node.id = "boot-error";
  node.style.position = "fixed";
  node.style.left = "12px";
  node.style.bottom = "12px";
  node.style.zIndex = "9999";
  node.style.maxWidth = "min(640px, calc(100vw - 24px))";
  node.style.padding = "10px 12px";
  node.style.borderRadius = "10px";
  node.style.background = "rgba(58, 18, 18, 0.9)";
  node.style.color = "#ffe6e6";
  node.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, monospace";
  node.style.fontSize = "12px";
  node.style.lineHeight = "1.4";
  node.textContent = `JS boot error: ${message}`;
  document.body.appendChild(node);
}

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function easeInOutCubic(t) {
  const clamped = clamp(t);
  return clamped < 0.5 ? 4 * clamped ** 3 : 1 - ((-2 * clamped + 2) ** 3) / 2;
}

function pageForKey(pageName) {
  return PAGES[pageName] || PAGES.home;
}

function activeRoutesForCurrentPage() {
  return ROUTES[state.currentPage] || {};
}

function setPageContent(pageName) {
  const page = pageForKey(pageName);
  state.currentPage = pageName;
  appEl.dataset.page = pageName;
  eyebrowEl.textContent = page.eyebrow;
  titleEl.textContent = page.title;
  subtitleEl.textContent = page.subtitle;
  panelsEl.innerHTML = page.panels
    .map(
      (panel) =>
        `<article class="panel"><h2>${panel.heading}</h2><p>${panel.text}</p></article>`
    )
    .join("");
  syncHints();
}

function resizeScene() {
  plantRenderer.resize();
  renderMotion();
}

function syncHints() {
  const routes = activeRoutesForCurrentPage();

  hintButtons.forEach((button) => {
    const direction = button.dataset.direction;
    const route = routes[direction];
    const hintCanvas = document.querySelector(`#canvas-${direction}`);

    if (!route) {
      button.hidden = true;
      if (hintCanvas) hintCanvas.style.display = "none";
      return;
    }

    button.hidden = false;
    if (hintCanvas) hintCanvas.style.display = "block";

    const motifText = MOTIF_LABEL[route.motif] || route.motif;
    const targetTitle = pageForKey(route.targetPage).title;
    button.setAttribute("aria-label", `${DRAG_PROMPT[direction]}切换到${targetTitle}（${motifText}）`);

    if (hintCanvas) {
      plantRenderer.drawHint(hintCanvas, route, direction);
    }
  });
}

function beginGesture(direction, pointerX, pointerY, pointerId = null, phase = "dragging") {
  const route = activeRoutesForCurrentPage()[direction];
  if (!route || state.phase !== "idle") {
    return false;
  }

  state.phase = phase;
  state.originPage = state.currentPage;
  state.targetPage = route.targetPage;
  state.activeDirection = direction;
  state.activeRoute = route;
  state.progress = 0;
  state.pointerId = pointerId;
  state.startX = pointerX;
  state.startY = pointerY;
  state.switchedForward = false;
  state.switchedBackOnRollback = false;

  overlayEl.style.backgroundColor = route.themeColor;
  appEl.classList.add("page-switching");

  hintButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.direction === direction);
  });

  renderMotion();
  return true;
}

function endGesture() {
  state.phase = "idle";
  state.originPage = state.currentPage;
  state.targetPage = state.currentPage;
  state.activeDirection = null;
  state.activeRoute = null;
  state.progress = 0;
  state.pointerId = null;
  state.switchedForward = false;
  state.switchedBackOnRollback = false;

  overlayEl.style.opacity = "0";
  appEl.classList.remove("page-switching");
  hintButtons.forEach((button) => button.classList.remove("is-active"));
  plantRenderer.render(null, null, 0);
}

function switchPage(pageName) {
  if (!PAGES[pageName]) {
    return;
  }

  setPageContent(pageName);
  srStatusEl.textContent = `已切换到 ${pageForKey(pageName).title}`;
}

function updateProgress(progress, source = "drag") {
  state.progress = clamp(progress);

  if (!state.switchedForward && state.progress >= 0.5) {
    switchPage(state.targetPage);
    state.switchedForward = true;
  } else if (state.switchedForward && state.progress < 0.5) {
    switchPage(state.originPage);
    state.switchedForward = false;
    state.switchedBackOnRollback = true;
  }

  renderMotion();
}

function renderMotion() {
  if (!state.activeDirection || !state.activeRoute) {
    overlayEl.style.opacity = "0";
    plantRenderer.render(null, null, 0);
    return;
  }

  overlayEl.style.opacity = growthOverlayOpacity(state.progress).toFixed(3);
  plantRenderer.render(state.activeDirection, state.activeRoute, state.progress);
}

function axisDistance(direction, x, y) {
  switch (direction) {
    case "left":
      return x - state.startX;
    case "right":
      return state.startX - x;
    case "up":
      return y - state.startY;
    case "down":
      return state.startY - y;
    default:
      return 0;
  }
}

function axisLength(direction) {
  return direction === "left" || direction === "right"
    ? Math.max(window.innerWidth, 1)
    : Math.max(window.innerHeight, 1);
}

function animateProgress(target, duration, phase, done) {
  if (state.reduceMotion) {
    state.phase = phase;
    updateProgress(target, phase);
    done();
    return;
  }

  const from = state.progress;
  const start = performance.now();
  state.phase = phase;

  function tick(now) {
    const t = clamp((now - start) / duration);
    const eased = easeInOutCubic(t);
    const value = from + (target - from) * eased;
    updateProgress(value, phase);

    if (t < 1) {
      requestAnimationFrame(tick);
      return;
    }

    done();
  }

  requestAnimationFrame(tick);
}

function releaseGesture() {
  if (state.phase !== "dragging") {
    return;
  }

  const shouldCommit = state.progress >= 0.5;
  if (shouldCommit) {
    animateProgress(1, 460, "commit", () => {
      switchPage(state.targetPage);
      endGesture();
    });
  } else {
    animateProgress(0, 640, "rollback", () => {
      switchPage(state.originPage);
      endGesture();
    });
  }
}

function onPointerMove(event) {
  if (state.phase !== "dragging") {
    return;
  }

  if (state.pointerId !== null && event.pointerId !== state.pointerId) {
    return;
  }

  const delta = axisDistance(state.activeDirection, event.clientX, event.clientY);
  const progress = clamp(delta / axisLength(state.activeDirection));
  updateProgress(progress);
}

function onPointerUp(event) {
  if (state.pointerId !== null && event.pointerId !== state.pointerId) {
    return;
  }

  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
  window.removeEventListener("pointercancel", onPointerUp);
  releaseGesture();
}

function handlePointerStart(event) {
  const button = event.currentTarget;
  const direction = button.dataset.direction;

  if (!beginGesture(direction, event.clientX, event.clientY, event.pointerId, "dragging")) {
    return;
  }

  event.preventDefault();
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
}

function handleKeyboardFlip(direction) {
  if (!beginGesture(direction, window.innerWidth / 2, window.innerHeight / 2, null, "commit")) {
    return;
  }

  animateProgress(1, 420, "commit", () => {
    switchPage(state.targetPage);
    endGesture();
  });
}

function bootstrap() {
  if (!window.PlantGrowth) {
    console.warn("PlantGrowth API not found. Running with fallback renderer.");
  }

  hintButtons.forEach((button) => {
    button.addEventListener("pointerdown", handlePointerStart);
  });

  window.addEventListener("resize", resizeScene);
  window.addEventListener("keydown", (event) => {
    if (state.phase !== "idle") {
      return;
    }

    const direction = KEY_TO_EDGE_DIRECTION[event.key];
    if (!direction) {
      return;
    }

    event.preventDefault();
    handleKeyboardFlip(direction);
  });

  setPageContent("home");
  resizeScene();
}

try {
  bootstrap();
} catch (error) {
  console.error("Homepage bootstrap failed", error);
  showBootError(error);
}
