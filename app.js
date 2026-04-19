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
    "eyebrow": "Placeholder A",
    "title": "占位符标题-首页",
    "subtitle": "占位符副标题-首页。",
    "panels": [
      {
        "heading": "占位符模块 A1",
        "text": "占位符文本 A1。"
      },
      {
        "heading": "占位符模块 A2",
        "text": "占位符文本 A2。"
      }
    ]
  },
  "about": {
    "eyebrow": "Placeholder B",
    "title": "占位符标题-页面B",
    "subtitle": "占位符副标题-页面B。",
    "panels": [
      {
        "heading": "占位符模块 B1",
        "text": "占位符文本 B1。"
      },
      {
        "heading": "占位符模块 B2",
        "text": "占位符文本 B2。"
      }
    ]
  },
  "ginkgo": {
    "eyebrow": "Placeholder C",
    "title": "占位符标题-页面C",
    "subtitle": "占位符副标题-页面C。",
    "panels": [
      {
        "heading": "占位符模块 C1",
        "text": "占位符文本 C1。"
      },
      {
        "heading": "占位符模块 C2",
        "text": "占位符文本 C2。"
      }
    ]
  },
  "gallery": {
    "eyebrow": "Placeholder D",
    "title": "占位符标题-页面D",
    "subtitle": "占位符副标题-页面D。",
    "panels": [
      {
        "heading": "占位符模块 D1",
        "text": "占位符文本 D1。"
      },
      {
        "heading": "占位符模块 D2",
        "text": "占位符文本 D2。"
      }
    ]
  },
  "poem": {
    "eyebrow": "Placeholder E",
    "title": "占位符标题-页面E",
    "subtitle": "占位符副标题-页面E。",
    "panels": [
      {
        "heading": "占位符模块 E1",
        "text": "占位符文本 E1。"
      },
      {
        "heading": "占位符模块 E2",
        "text": "占位符文本 E2。"
      }
    ]
  },
  "sunflower": {
    "eyebrow": "Placeholder F",
    "title": "占位符标题-页面F",
    "subtitle": "占位符副标题-页面F。",
    "panels": [
      {
        "heading": "占位符模块 F1",
        "text": "占位符文本 F1。"
      },
      {
        "heading": "占位符模块 F2",
        "text": "占位符文本 F2。"
      }
    ]
  },
  "bamboo": {
    "eyebrow": "Placeholder G",
    "title": "占位符标题-页面G",
    "subtitle": "占位符副标题-页面G。",
    "panels": [
      {
        "heading": "占位符模块 G1",
        "text": "占位符文本 G1。"
      },
      {
        "heading": "占位符模块 G2",
        "text": "占位符文本 G2。"
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
    "right": {
      "targetPage": "gallery",
      "motif": "cherry_branch",
      "themeColor": "#F2A7C2"
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
