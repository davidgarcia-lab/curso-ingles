(() => {
  "use strict";

  /* =====================================================================
     SISTEMA ESTÁNDAR MULTICURSO
     - Posiciona la barra lateral .course-class-sidebar
     - Activa Compartir por WhatsApp
     - Corrige ejercicios genéricos de .course-practice
     ===================================================================== */

  const SIDEBAR_GAP = 24;
  const STICKY_TOP = 20;
  const SIDEBAR_WIDTH = 264;
  const MIN_SIDEBAR_WIDTH = 230;
  const VIEWPORT_EDGE = 16;

  function initializeCourseSidebar() {
    const segment = document.querySelector("#segmento");
    const sidebar = document.querySelector(".course-class-sidebar");
    const shareButton = document.querySelector(".course-share-button");
    const container = segment?.closest(".contenedor");

    if (!segment || !sidebar || !container) return;

    let frameRequested = false;

    function positionSidebar() {
      frameRequested = false;

      const containerRect = container.getBoundingClientRect();
      const availableWidth =
        window.innerWidth - containerRect.width - SIDEBAR_GAP - (VIEWPORT_EDGE * 2);

      if (availableWidth < MIN_SIDEBAR_WIDTH) {
        container.style.removeProperty("margin-left");
        container.style.removeProperty("margin-right");
        sidebar.classList.add("course-is-inline", "course-is-ready");
        sidebar.style.removeProperty("top");
        sidebar.style.removeProperty("left");
        sidebar.style.removeProperty("width");
        sidebar.style.removeProperty("max-height");
        return;
      }

      const width = Math.min(SIDEBAR_WIDTH, availableWidth);
      const combinedWidth = containerRect.width + SIDEBAR_GAP + width;
      const centeredLeft = Math.max(VIEWPORT_EDGE, (window.innerWidth - combinedWidth) / 2);

      container.style.marginLeft = `${centeredLeft}px`;
      container.style.marginRight = "auto";

      const segmentRect = segment.getBoundingClientRect();
      const top = Math.max(STICKY_TOP, segmentRect.top);

      sidebar.classList.remove("course-is-inline");
      sidebar.classList.add("course-is-ready");
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
        const message = `Te recomiendo esta lección: ${document.title} ${window.location.href}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      });
    }

    positionSidebar();
  }

  function initializeCoursePractice() {
    document.querySelectorAll(".course-practice").forEach((root) => {
      const form = root.querySelector("[data-course-practice-form]");
      if (!form || form.dataset.courseInitialized === "true") return;
      form.dataset.courseInitialized = "true";

      const resetButton = root.querySelector("[data-course-practice-reset]");
      const result = root.querySelector("[data-course-practice-result]");
      const scoreText = root.querySelector("[data-course-practice-score]");
      const message = root.querySelector("[data-course-practice-message]");
      const progress = root.querySelector("[data-course-practice-progress]");
      const questions = [...root.querySelectorAll("[data-question][data-answer]")];

      if (!questions.length) return;

      const normalize = (value = "") => value
        .trim()
        .toLowerCase()
        .replace(/[’‘]/g, "'")
        .replace(/\s+/g, " ");

      const clearQuestionState = (question) => {
        question.querySelectorAll(".is-correct, .is-wrong").forEach((element) => {
          element.classList.remove("is-correct", "is-wrong");
        });
        const feedback = question.querySelector(".course-practice__feedback");
        if (feedback) {
          feedback.className = "course-practice__feedback";
          feedback.textContent = "";
        }
      };

      const getControl = (question) => {
        const checkedRadio = question.querySelector('input[type="radio"]:checked');
        const checkedCheckboxes = [...question.querySelectorAll('input[type="checkbox"]:checked')];
        if (checkedRadio) return { type: "radio", element: checkedRadio, value: checkedRadio.value };
        if (checkedCheckboxes.length) {
          return {
            type: "checkbox",
            element: checkedCheckboxes[0],
            elements: checkedCheckboxes,
            value: checkedCheckboxes.map((item) => item.value).sort().join("|")
          };
        }
        const field = question.querySelector(".course-practice__input, .course-practice__select, input[type='text'], textarea, select");
        return field ? { type: field.tagName.toLowerCase(), element: field, value: field.value } : null;
      };

      const displayAnswer = (question) => question.dataset.answer.split("|")[0];

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        let correctAnswers = 0;

        questions.forEach((question) => {
          clearQuestionState(question);
          const control = getControl(question);
          const acceptedAnswers = question.dataset.answer.split("||").map(normalize);
          const userAnswer = control ? normalize(control.value) : "";
          const isCorrect = userAnswer !== "" && acceptedAnswers.includes(userAnswer);
          const feedback = question.querySelector(".course-practice__feedback");

          if (isCorrect) {
            correctAnswers += 1;
            if (control?.type === "radio") control.element.closest(".course-practice__option")?.classList.add("is-correct");
            else if (control?.type === "checkbox") control.elements.forEach(el => el.closest(".course-practice__option")?.classList.add("is-correct"));
            else control?.element.classList.add("is-correct");
            if (feedback) {
              feedback.textContent = "¡Correcto!";
              feedback.classList.add("is-visible", "is-correct");
            }
          } else {
            if (control?.type === "radio") control.element.closest(".course-practice__option")?.classList.add("is-wrong");
            else if (control?.type === "checkbox") control.elements.forEach(el => el.closest(".course-practice__option")?.classList.add("is-wrong"));
            else control?.element.classList.add("is-wrong");
            if (feedback) {
              feedback.textContent = userAnswer
                ? `Revisa. Respuesta correcta: ${displayAnswer(question)}.`
                : `Falta responder. Respuesta correcta: ${displayAnswer(question)}.`;
              feedback.classList.add("is-visible", "is-wrong");
            }
          }
        });

        const total = questions.length;
        const percentage = Math.round((correctAnswers / total) * 100);
        if (scoreText) scoreText.textContent = `${correctAnswers}/${total}`;
        if (progress) progress.style.width = `${percentage}%`;

        if (message) {
          if (percentage === 100) message.textContent = "¡Excelente! Dominas los contenidos principales de esta clase.";
          else if (percentage >= 75) message.textContent = "¡Muy bien! Revisa las respuestas señaladas y vuelve a intentarlo.";
          else if (percentage >= 50) message.textContent = "Buen avance. Repasa las ideas clave antes de un nuevo intento.";
          else message.textContent = "Sigue practicando. Revisa la clase y vuelve a responder.";
        }

        result?.classList.add("is-visible");
        result?.focus({ preventScroll: true });
        result?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });

      form.addEventListener("input", (event) => {
        const question = event.target.closest("[data-question]");
        if (question) clearQuestionState(question);
      });

      resetButton?.addEventListener("click", () => {
        form.reset();
        questions.forEach(clearQuestionState);
        result?.classList.remove("is-visible");
        if (scoreText) scoreText.textContent = `0/${questions.length}`;
        if (progress) progress.style.width = "0%";
        if (message) message.textContent = "";
        root.querySelector("input, select, textarea")?.focus();
        root.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function initializeCourseBlocks() {
    initializeCourseSidebar();
    initializeCoursePractice();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeCourseBlocks);
  } else {
    initializeCourseBlocks();
  }
})();
