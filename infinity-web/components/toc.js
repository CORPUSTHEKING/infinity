// ./components/toc.js
const DEFAULTS = {
  title: "Table of Contents",
  minLevel: 1,
  maxLevel: 5,
  headingSelector: "h1, h2, h3, h4, h5",
  contentSelectors: [
    "[data-page-root]",
    "[data-content-root]",
    "main",
    "article",
    ".inf-page",
    "#app",
    "#content",
    ".page",
  ],
  tocSlotSelector: "[data-toc-slot]",
  tocClassName: "toc",
  tocGeneratedAttr: "data-generated-toc",
  tocRootAttr: "data-toc-root",
  closeByDefault: true,
  observe: true,
  updateOnHashChange: true,
  updateOnPopState: true,
  insertIfMissing: true,
};

function initTOC(userOptions = {}) {
  const config = { ...DEFAULTS, ...userOptions };

  let destroyed = false;
  let observer = null;
  let rafId = 0;
  let scheduled = false;

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&[a-z]+;/g, " ")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function uniqueTopLevelElements(elements) {
    const out = [];
    for (const el of elements) {
      if (!out.some((parent) => parent !== el && parent.contains(el))) {
        out.push(el);
      }
    }
    return out;
  }

  function getContentRoots() {
    for (const selector of config.contentSelectors) {
      const matches = Array.from(document.querySelectorAll(selector));
      if (matches.length) {
        return uniqueTopLevelElements(matches);
      }
    }

    const fallback = document.body || document.documentElement;
    return fallback ? [fallback] : [];
  }

  function findTocSlot(root) {
    return root.querySelector(config.tocSlotSelector);
  }

  function collectHeadings(root) {
    const all = Array.from(root.querySelectorAll(config.headingSelector));

    return all
      .filter((el) => !el.closest(`[${config.tocGeneratedAttr}="true"]`))
      .map((el) => {
        const level = Number(el.tagName.slice(1));
        return {
          el,
          level,
          text: (el.textContent || "").trim(),
        };
      })
      .filter(
        (item) =>
          item.text &&
          item.level >= config.minLevel &&
          item.level <= config.maxLevel
      );
  }

  function ensureHeadingIds(headings) {
    for (const item of headings) {
      const existing = item.el.id ? String(item.el.id).trim() : "";
      let base = existing || slugify(item.text) || "section";
      let id = base;
      let i = 2;

      while (document.getElementById(id)) {
        if (document.getElementById(id) === item.el) break;
        id = `${base}-${i++}`;
      }

      item.el.id = id;
      item.id = id;
    }
  }

  function buildTree(headings) {
    const root = { level: config.minLevel - 1, children: [] };
    const stack = [root];

    for (const item of headings) {
      while (stack.length > 1 && stack[stack.length - 1].level >= item.level) {
        stack.pop();
      }

      const node = {
        level: item.level,
        id: item.id,
        text: item.text,
        children: [],
      };

      stack[stack.length - 1].children.push(node);
      stack.push(node);
    }

    return root.children;
  }

  function renderList(nodes) {
    const ol = document.createElement("ol");
    ol.className = `${config.tocClassName}__list`;

    for (const node of nodes) {
      const li = document.createElement("li");
      li.className = `${config.tocClassName}__item`;
      li.dataset.level = String(node.level);

      const a = document.createElement("a");
      a.className = `${config.tocClassName}__link`;
      a.href = `#${node.id}`;
      a.textContent = node.text;

      li.appendChild(a);

      if (node.children.length) {
        li.appendChild(renderList(node.children));
      }

      ol.appendChild(li);
    }

    return ol;
  }

  function buildTOC(headings) {
    const nav = document.createElement("nav");
    nav.className = config.tocClassName;
    nav.setAttribute("aria-label", config.title);
    nav.setAttribute(config.tocGeneratedAttr, "true");
    nav.setAttribute(config.tocRootAttr, "true");

    const details = document.createElement("details");
    details.className = `${config.tocClassName}__details`;
    details.open = !config.closeByDefault;

    const summary = document.createElement("summary");
    summary.className = `${config.tocClassName}__summary`;

    const title = document.createElement("span");
    title.className = `${config.tocClassName}__title`;
    title.textContent = config.title;

    summary.appendChild(title);
    details.appendChild(summary);

    const body = document.createElement("div");
    body.className = `${config.tocClassName}__body`;
    body.appendChild(renderList(buildTree(headings)));

    details.appendChild(body);
    nav.appendChild(details);

    return nav;
  }

  function removeExistingTOC(root) {
    root
      .querySelectorAll(
        `[${config.tocGeneratedAttr}="true"], [${config.tocRootAttr}="true"]`
      )
      .forEach((node) => node.remove());
  }

  function insertTOC(root, tocNode) {
    const slot = findTocSlot(root);
    if (slot) {
      slot.replaceChildren(tocNode);
      return;
    }

    const firstHeading = root.querySelector(config.headingSelector);
    if (firstHeading) {
      root.insertBefore(tocNode, firstHeading);
      return;
    }

    if (config.insertIfMissing) {
      root.prepend(tocNode);
    }
  }

  function renderRoot(root) {
    if (!root || typeof root.querySelectorAll !== "function") return;

    removeExistingTOC(root);

    const headings = collectHeadings(root);
    if (!headings.length) return;

    ensureHeadingIds(headings);

    const toc = buildTOC(headings);
    insertTOC(root, toc);
  }

  function refresh() {
    if (destroyed) return;

    scheduled = false;

    const roots = getContentRoots();
    for (const root of roots) {
      renderRoot(root);
    }
  }

  function scheduleRefresh() {
    if (destroyed || scheduled) return;

    scheduled = true;
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(refresh);
  }

  function startObserver() {
    if (!config.observe || destroyed) return;

    if (observer) observer.disconnect();

    observer = new MutationObserver(() => {
      scheduleRefresh();
    });

    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["id", "class"],
    });
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  function onHashChange() {
    if (!config.updateOnHashChange) return;
    scheduleRefresh();
  }

  function onPopState() {
    if (!config.updateOnPopState) return;
    scheduleRefresh();
  }

  window.addEventListener("hashchange", onHashChange, { passive: true });
  window.addEventListener("popstate", onPopState, { passive: true });

  refresh();
  startObserver();

  return {
    refresh,
    destroy() {
      destroyed = true;
      cancelAnimationFrame(rafId);
      stopObserver();
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onPopState);
    },
  };
}

if (typeof window !== "undefined") {
  window.initTOC = initTOC;
}

export { initTOC };
export default initTOC;
