(() => {
  "use strict";

  const SIDEBAR_GAP = 24;
  const STICKY_TOP = 20;
  const SIDEBAR_WIDTH = 264;
  const MIN_SIDEBAR_WIDTH = 230;
  const VIEWPORT_EDGE = 16;

  function initializeClassBlocks() {
    const segment = document.querySelector("#segmento");
    const sidebar = document.querySelector(".he-class-sidebar");
    const shareButton = document.querySelector(".he-share-button");
    const container = segment?.closest(".contenedor");

    if (!segment || !sidebar || !container) return;

    let frameRequested = false;

    function positionSidebar() {
      frameRequested = false;

      const containerRect = container.getBoundingClientRect();
      const availableWidth =
        window.innerWidth -
        containerRect.width -
        SIDEBAR_GAP -
        (VIEWPORT_EDGE * 2);

      if (availableWidth < MIN_SIDEBAR_WIDTH) {
        container.style.removeProperty("margin-left");
        container.style.removeProperty("margin-right");
        sidebar.classList.add("he-is-inline", "he-is-ready");
        sidebar.style.removeProperty("top");
        sidebar.style.removeProperty("left");
        sidebar.style.removeProperty("width");
        sidebar.style.removeProperty("max-height");
        return;
      }

      const width = Math.min(SIDEBAR_WIDTH, availableWidth);
      const combinedWidth = containerRect.width + SIDEBAR_GAP + width;
      const centeredLeft = Math.max(
        VIEWPORT_EDGE,
        (window.innerWidth - combinedWidth) / 2
      );

      /* Centra el conjunto completo sin cambiar ningún ancho. */
      container.style.marginLeft = `${centeredLeft}px`;
      container.style.marginRight = "auto";

      const segmentRect = segment.getBoundingClientRect();
      const top = Math.max(STICKY_TOP, segmentRect.top);

      sidebar.classList.remove("he-is-inline");
      sidebar.classList.add("he-is-ready");
      sidebar.style.top = `${top}px`;
      sidebar.style.left = `${segmentRect.right + SIDEBAR_GAP}px`;
      sidebar.style.width = `${width}px`;
      sidebar.style.maxHeight = `${Math.max(240, window.innerHeight - top - VIEWPORT_EDGE)}px`;
    }

    function requestPositionUpdate() {
      if (frameRequested) return;
      frameRequested = true;
      window.requestAnimationFrame(positionSidebar);
    }

    window.addEventListener("scroll", requestPositionUpdate, { passive: true });
    window.addEventListener("resize", requestPositionUpdate);
    window.addEventListener("load", requestPositionUpdate);

    if (shareButton) {
      shareButton.addEventListener("click", (event) => {
        event.preventDefault();

        const message = `Te recomiendo esta lección de inglés: ${document.title} ${window.location.href}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      });
    }

    positionSidebar();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeClassBlocks);
  } else {
    initializeClassBlocks();
  }
})();
