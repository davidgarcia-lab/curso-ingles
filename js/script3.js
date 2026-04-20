document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.querySelector(".reading-container") || document.getElementById("texto");
  if (!contenedor) return;

  let elementosVisibles = [];
  let indice = -1;

  // 1. FILTRADO ESTRICTO DE VISIBILIDAD
  const refrescarElementos = () => {
    // Solo seleccionamos contenedores de BLOQUE para evitar el resaltado por línea
    const candidatos = Array.from(contenedor.querySelectorAll("h3, p, li"));
    
    elementosVisibles = candidatos.filter(el => {
      // Verificación de visibilidad real (Display y Opacidad)
      const estilo = window.getComputedStyle(el);
      const estaVisible = estilo.display !== "none" && 
                          estilo.visibility !== "hidden" && 
                          el.offsetWidth > 0 && 
                          el.offsetHeight > 0;
      
      // Solo incluimos si tiene texto y no es un contenedor de otros elementos ya listados
      // (Para evitar resaltar el P y luego el LI por separado si están anidados)
      return estaVisible && el.textContent.trim().length > 0;
    });
  };

  // 2. FUNCIÓN DE RESALTADO UNIFICADO
  function actualizarResaltado(nuevoIndice) {
    refrescarElementos(); // Crucial: Detecta qué ocultó el botón de traducción

    if (elementosVisibles.length === 0) return;

    // Limpieza absoluta de cualquier rastro previo
    contenedor.querySelectorAll(".segment-highlight").forEach(el => {
      el.classList.remove("segment-highlight");
    });

    // Ajuste de límites
    if (nuevoIndice >= elementosVisibles.length) nuevoIndice = 0;
    if (nuevoIndice < 0) nuevoIndice = elementosVisibles.length - 1;

    indice = nuevoIndice;
    const activo = elementosVisibles[indice];

    if (activo) {
      activo.classList.add("segment-highlight");
      
      // Aseguramos que el scroll sea suave y centrado
      activo.scrollIntoView({ 
        behavior: "smooth", 
        block: "center" 
      });
    }
  }

  // 3. MANEJO DE EVENTOS (TECLADO)
  document.addEventListener("keydown", (e) => {
    if (["INPUT", "TEXTAREA"].includes(e.target.tagName) || e.target.isContentEditable) return;

    if (e.key === "Tab") {
      e.preventDefault();
      e.shiftKey ? actualizarResaltado(indice - 1) : actualizarResaltado(indice + 1);
    } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      actualizarResaltado(indice + 1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "Backspace") {
      e.preventDefault();
      actualizarResaltado(indice - 1);
    }
  });

  // 4. CLICK INTELIGENTE (Detecta el bloque, no la línea)
  contenedor.addEventListener("click", (e) => {
    if (e.target.closest("a, button, input")) return;

    refrescarElementos();
    // Buscamos el ancestro de bloque más cercano (P, LI o H3)
    const bloqueCercano = e.target.closest("p, li, h3");
    
    if (bloqueCercano && elementosVisibles.includes(bloqueCercano)) {
      actualizarResaltado(elementosVisibles.indexOf(bloqueCercano));
    } else {
      actualizarResaltado(indice + 1);
    }
  });

  // 5. SOPORTE GESTUAL (SWIPE)
  let touchStartX = 0;
  contenedor.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].screenX;
  }, {passive: true});

  contenedor.addEventListener("touchend", e => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 60) {
      diff > 0 ? actualizarResaltado(indice + 1) : actualizarResaltado(indice - 1);
    }
  }, {passive: true});
});