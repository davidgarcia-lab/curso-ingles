/* =========================================
   HELLO ENGLISH — PRÁCTICA
========================================= */

(() => {
  "use strict";

  function init() {
    document.querySelectorAll("[data-practice]").forEach(root => {
      if (root.dataset.initialized) return;

      const form = root.querySelector("form");
      const questions = [
        ...root.querySelectorAll(".he-practice__question")
      ];

      const score = root.querySelector("[data-score]");
      const scoreBar = root.querySelector("[data-score-bar]");
      const completion = root.querySelector("[data-completion]");
      const counter = root.querySelector("[data-count]");
      const message = root.querySelector("[data-message]");
      const title = root.querySelector("[data-result-title]");
      const result = root.querySelector("[data-result]");

      if (
        !form ||
        !questions.length ||
        !score ||
        !scoreBar ||
        !completion ||
        !counter ||
        !message ||
        !title ||
        !result
      ) {
        return;
      }

      root.dataset.initialized = "true";

      const total = questions.length;
      let graded = false;

      scoreBar.max = total;
      completion.max = total;

      /* Obtener la respuesta de una pregunta */
      function getValue(question) {
        if (question.querySelector('input[type="radio"]')) {
          return (
            question.querySelector('input[type="radio"]:checked')
              ?.value ?? ""
          );
        }

        return (
          question.querySelector('input[type="text"]')
            ?.value.trim() ?? ""
        );
      }

      /* Normalizar respuestas escritas */
      function normalize(text, mode) {
        const clean = String(text)
          .trim()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/[’‘]/g, "'");

        return mode === "spelling"
          ? clean.replace(/[\s.\-–—]/g, "")
          : clean.replace(/\s+/g, " ");
      }

      /* Actualizar puntuación */
      function setScore(points) {
        const denominator = document.createElement("span");
        denominator.textContent = `/${total}`;

        score.replaceChildren(
          document.createTextNode(String(points)),
          denominator
        );

        scoreBar.value = points;
      }

      /* Actualizar avance y preguntas pendientes */
      function updateProgress() {
        const answered = questions.filter(
          question => getValue(question) !== ""
        ).length;

        const remaining = total - answered;

        completion.value = answered;

        completion.setAttribute(
          "aria-valuetext",
          `${answered} de ${total} respondidas. ` +
          `${remaining} pendientes.`
        );

        counter.textContent = remaining === 0
          ? `${answered}/${total} · Completado`
          : `${answered}/${total} · ${
              remaining === 1 ? "Falta 1" : `Faltan ${remaining}`
            }`;
      }

      /* Limpiar correcciones anteriores */
      function clearFeedback() {
        questions.forEach(question => {
          delete question.dataset.state;

          const feedback = question.querySelector(
            ".he-practice__feedback"
          );

          if (feedback) {
            feedback.hidden = true;
            feedback.textContent = "";
          }

          question.querySelectorAll("input").forEach(input => {
            input.removeAttribute("aria-invalid");
          });

          question
            .querySelectorAll(".he-practice__option")
            .forEach(option => {
              option.classList.remove("is-correct", "is-wrong");
            });
        });
      }

      /* Desplazamiento respetando movimiento reducido */
      function scrollToElement(element) {
        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

        element.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "center"
        });
      }

      /* Actualizar al marcar o escribir */
      function handleChange() {
        if (graded) {
          graded = false;

          clearFeedback();
          setScore(0);

          title.textContent = "Respuestas modificadas.";
          message.textContent =
            "Vuelve a comprobar para actualizar tu resultado.";
        }

        updateProgress();
      }

      form.addEventListener("input", handleChange);
      form.addEventListener("change", handleChange);

      /* Comprobar respuestas */
      form.addEventListener("submit", event => {
        event.preventDefault();

        clearFeedback();

        let correct = 0;
        let unanswered = 0;

        questions.forEach(question => {
          const response = getValue(question);
          const empty = response === "";

          const accepted = (
            question.dataset.answer ?? ""
          ).split("|");

          const ok = !empty && accepted.some(answer =>
            normalize(response, question.dataset.mode) ===
            normalize(answer, question.dataset.mode)
          );

          if (ok) correct++;
          if (empty) unanswered++;

          question.dataset.state = ok
            ? "correct"
            : empty
              ? "unanswered"
              : "incorrect";

          const solution = question.dataset.solution ?? "";
          const explanation = question.dataset.explanation ?? "";

          const feedback = question.querySelector(
            ".he-practice__feedback"
          );

          if (feedback) {
            let text;

            if (ok) {
              text = "✓ Correcto. ";
            } else if (empty) {
              text = `○ Sin responder. Respuesta: ${solution}. `;
            } else {
              text = `× Revisa tu respuesta. Correcta: ${solution}. `;
            }

            feedback.textContent = text + explanation;
            feedback.hidden = false;
          }

          question.querySelectorAll("input").forEach(input => {
            input.setAttribute("aria-invalid", String(!ok));
          });

          question
            .querySelectorAll('input[type="radio"]')
            .forEach(input => {
              const option = input.closest(
                ".he-practice__option"
              );

              if (!option) return;

              option.classList.toggle(
                "is-correct",
                accepted.includes(input.value)
              );

              option.classList.toggle(
                "is-wrong",
                input.checked && !ok
              );
            });
        });

        graded = true;

        setScore(correct);
        updateProgress();

        if (correct === total) {
          title.textContent = "¡Lo lograste! Excelente trabajo.";
        } else if (correct / total >= 0.8) {
          title.textContent = "¡Muy bien! Ya casi lo tienes.";
        } else {
          title.textContent =
            "Cada intento cuenta. Sigue practicando.";
        }

        const incorrect = total - correct - unanswered;

        message.textContent =
          `${correct} correctas · ` +
          `${incorrect} incorrectas · ` +
          `${unanswered} sin responder. ` +
          (
            correct === total
              ? "Dominas esta práctica."
              : "Revisa las explicaciones de cada pregunta."
          );

        result.focus({ preventScroll: true });
        scrollToElement(result);
      });

      /* Intentar de nuevo */
      form.addEventListener("reset", () => {
        queueMicrotask(() => {
          graded = false;

          clearFeedback();
          setScore(0);
          updateProgress();

          title.textContent =
            "Todo empieza con un intento.";

          message.textContent =
            "Responde las preguntas y comprueba tu resultado.";

          const firstQuestion = questions[0];
          const firstInput = firstQuestion.querySelector("input");

          firstInput?.focus({ preventScroll: true });
          scrollToElement(firstQuestion);
        });
      });

      setScore(0);
      updateProgress();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, {
      once: true
    });
  } else {
    init();
  }
})();