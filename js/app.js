(() => {  
  "use strict";

  const parts = window.SLIT_LAMP_PARTS;  
  const pos = window.SLIT_LAMP_HOTSPOTS;  
  const $ = (id) => document.getElementById(id);

  let selected = 0;  
  let panelDismissed = false;

  const viewed = new Set();  
  const partButtons = [];  
  const dotButtons = [];

  const partsList = $("partsList");  
  const hotspots = $("hotspots");  
  const dots = $("dots");  
  const teachingPanel = $("teachingPanel");  
  const partsSearch = $("partsSearch");  
  const showUnviewedOnly = $("showUnviewedOnly");  
  const partsEmptyState = $("partsEmptyState");  
  const leftDock = $("leftDock");  
  const rightDock = $("rightDock");

  parts.forEach((part, i) => {  
    const li = document.createElement("li");  
    li.dataset.name = `${part.id} ${part.name}`.toLowerCase();

    const b = document.createElement("button");  
    b.innerHTML = `<span>${part.id}</span><em>${part.name}</em><i>›</i>`;  
    b.onclick = () => {  
      panelDismissed = false;  
      select(i, true);  
      closePartsDropdown();  
    };

    li.appendChild(b);  
    partsList.appendChild(li);  
    partButtons.push(b);

    const h = document.createElement("button");  
    h.className = "hotspot";  
    h.style.left = `${pos[i].x}%`;  
    h.style.top = `${pos[i].y}%`;  
    h.setAttribute("aria-label", `${part.id}. ${part.name}`);  
    h.title = `${part.id}. ${part.name}`;  
    h.onclick = () => {  
      panelDismissed = false;  
      select(i, true);  
    };  
    hotspots.appendChild(h);

    const dot = document.createElement("button");  
    dot.type = "button";  
    dot.className = "dot-button";  
    dot.title = `${part.id}. ${part.name}`;  
    dot.setAttribute("aria-label", `Go to part ${part.id}: ${part.name}`);  
    dot.onclick = () => {  
      panelDismissed = false;  
      select(i, true);  
    };  
    dots.appendChild(dot);  
    dotButtons.push(dot);  
  });

  function applyPartFilters() {  
    const query = (partsSearch?.value || "").trim().toLowerCase();  
    const unviewedOnly = !!showUnviewedOnly?.checked;  
    let visibleCount = 0;

    [...partsList.children].forEach((li, i) => {  
      const matchesQuery = li.dataset.name.includes(query);  
      const matchesViewed = !unviewedOnly || !viewed.has(i);  
      const visible = matchesQuery && matchesViewed;  
      li.classList.toggle("hidden", !visible);  
      if (visible) visibleCount++;  
    });

    if (partsEmptyState) {  
      partsEmptyState.classList.toggle("hidden", visibleCount !== 0);  
    }  
  }

  function updateProgress() {  
    const count = viewed.size;  
    const percent = Math.round((count / parts.length) * 100);

    $("progressLabel").textContent = `${count} of ${parts.length} components viewed`;  
    $("progressBar").style.width = `${percent}%`;  
    $("progressPercent").textContent = `${percent}%`;

    dotButtons.forEach((d, n) => {  
      d.classList.toggle("done", viewed.has(n));  
      d.classList.toggle("active", n === selected);  
      d.classList.toggle("unseen", !viewed.has(n));  
      d.textContent = n + 1;  
    });

    if (window.setMechanicsPercent) {  
      window.setMechanicsPercent(percent);  
    }

    applyPartFilters();  
  }

  function hideTeachingPanel() {  
    teachingPanel.classList.add("hidden");  
  }

  function showTeachingPanel() {  
    teachingPanel.classList.remove("hidden");  
  }

  function dockTeachingPanel(i) {  
    if (window.innerWidth <= 980 || panelDismissed) return;

    leftDock.innerHTML = "";  
    rightDock.innerHTML = "";

    if (pos[i].x < 50) {  
      rightDock.appendChild(teachingPanel);  
    } else {  
      leftDock.appendChild(teachingPanel);  
    }  
  }

  function select(i, track = true) {  
    selected = Math.max(0, Math.min(parts.length - 1, i));  
    const p = parts[selected];

    if (track) viewed.add(selected);

    partButtons.forEach((b, n) => {  
      b.classList.toggle("active", n === selected);  
      if (n === selected) b.setAttribute("aria-current", "step");  
      else b.removeAttribute("aria-current");  
    });

    document.querySelectorAll(".hotspot").forEach((b, n) => {  
      b.classList.toggle("active", n === selected);  
    });

    $("partNumber").textContent = `COMPONENT ${String(p.id).padStart(2, "0")}`;  
    $("partName").textContent = p.name;  
    $("functionText").textContent = p.function;  
    $("useText").textContent = p.use;  
    $("pearlText").textContent = p.pearl;  
    $("mistakeText").textContent = p.mistake;

    $("lessonCount").textContent = `Part ${selected + 1} of ${parts.length}`;  
    $("previousName").textContent = selected ? parts[selected - 1].name : "Start";  
    $("nextName").textContent =  
      selected < parts.length - 1  
        ? parts[selected + 1].name  
        : viewed.size === parts.length  
        ? "Start quiz"  
        : "Review remaining";

    $("previous").disabled = selected === 0;  
    $("next").disabled = selected === parts.length - 1 && viewed.size < parts.length;  
    $("next").classList.toggle("quizReady", selected === parts.length - 1 && viewed.size === parts.length);

    updateProgress();

    if (!panelDismissed) {  
      showTeachingPanel();  
      dockTeachingPanel(selected);  
    }  
  }

  $("previous").onclick = () => {  
    panelDismissed = false;  
    select(selected - 1);  
  };

  $("next").onclick = () => {  
    if (selected === parts.length - 1 && viewed.size === parts.length) {  
      openQuiz();  
      return;  
    }  
    panelDismissed = false;  
    select(selected + 1);  
  };

  window.addEventListener("resize", () => {  
    if (!panelDismissed) dockTeachingPanel(selected);  
  });

  document.addEventListener("keydown", (e) => {  
    if (!$("quizOverlay").hidden) {  
      if (e.key === "Escape") closeQuiz();  
      return;  
    }

    if (e.key === "ArrowLeft") {  
      panelDismissed = false;  
      select(selected - 1);  
    }

    if (e.key === "ArrowRight") {  
      panelDismissed = false;  
      select(selected + 1);  
    }

    if (e.key === "Escape") {  
      closePartsDropdown();  
    }  
  });

  const togglePartsDropdown = $("togglePartsDropdown");  
  const closePartsDropdownBtn = $("closePartsDropdown");  
  const partsDropdown = $("partsDropdown");

  function openPartsDropdown() {  
    partsDropdown.hidden = false;  
    togglePartsDropdown.setAttribute("aria-expanded", "true");  
    applyPartFilters();  
  }

  function closePartsDropdown() {  
    partsDropdown.hidden = true;  
    togglePartsDropdown.setAttribute("aria-expanded", "false");  
  }

  togglePartsDropdown.addEventListener("click", () => {  
    if (partsDropdown.hidden) openPartsDropdown();  
    else closePartsDropdown();  
  });

  closePartsDropdownBtn.addEventListener("click", closePartsDropdown);

  if (partsSearch) partsSearch.addEventListener("input", applyPartFilters);  
  if (showUnviewedOnly) showUnviewedOnly.addEventListener("change", applyPartFilters);

  document.addEventListener("click", (e) => {  
    if (partsDropdown.hidden) return;  
    const inside = partsDropdown.contains(e.target) || togglePartsDropdown.contains(e.target);  
    if (!inside) closePartsDropdown();  
  });

  $("closeTeachingPanel").addEventListener("click", () => {  
    panelDismissed = true;  
    hideTeachingPanel();  
  });

  $("resetMechanicsProgressBtn").addEventListener("click", () => {  
    if (confirm("Reset all stored progress for this browser?")) {  
      resetCourseProgress();  
      window.location.href = "index.html";  
    }  
  });

  const quizQuestions = [  
    { q: "Click the Magnification Changer (Drum).", a: 1 },  
    { q: "Click the Joystick.", a: 12 },  
    { q: "Click the Chin Rest.", a: 7 },  
    { q: "Click the Illumination Arm.", a: 13 },  
    { q: "Click the Handle Bar.", a: 10 }  
  ];

  let quizIndex = 0;  
  let quizScore = 0;  
  let quizAnswered = false;

  function renderQuiz() {  
    quizIndex = 0;  
    quizScore = 0;  
    quizAnswered = false;  
    $("quizForm").hidden = false;  
    $("quizRetry").hidden = true;  
    if ($("moduleCompleteActions")) $("moduleCompleteActions").hidden = true;  
    renderQuizQuestion();  
  }

  function renderQuizQuestion() {  
    quizAnswered = false;  
    $("quizQuestionCount").textContent = `Question ${quizIndex + 1} of ${quizQuestions.length}`;  
    $("quizScore").textContent = `Score: ${quizScore}`;  
    $("quizPrompt").textContent = quizQuestions[quizIndex].q;  
    $("quizResult").textContent = "Choose a location on the image.";  
    $("quizResult").className = "quizResult";  
    $("quizNext").hidden = true;  
    $("quizHotspots").innerHTML = "";

    pos.forEach((spot, i) => {  
      const b = document.createElement("button");  
      b.type = "button";  
      b.className = "quizHotspot";  
      b.style.left = `${spot.x}%`;  
      b.style.top = `${spot.y}%`;  
      b.setAttribute("aria-label", `Location ${i + 1}`);  
      b.onclick = () => answerQuiz(i, b);  
      $("quizHotspots").appendChild(b);  
    });  
  }

  function answerQuiz(choice, button) {  
    if (quizAnswered) return;  
    quizAnswered = true;

    const correct = choice === quizQuestions[quizIndex].a;

    if (correct) {  
      quizScore++;  
      button.classList.add("correct");  
    } else {  
      button.classList.add("incorrect");  
      $("quizHotspots").children[quizQuestions[quizIndex].a].classList.add("reveal");  
    }

    $("quizScore").textContent = `Score: ${quizScore}`;  
    $("quizResult").textContent = correct ? "Correct." : "Not quite. The correct location is highlighted.";  
    $("quizResult").className = `quizResult ${correct ? "correctText" : "incorrectText"}`;  
    $("quizNext").textContent = quizIndex === quizQuestions.length - 1 ? "See results" : "Next question";  
    $("quizNext").hidden = false;  
  }

  function openQuiz() {  
    renderQuiz();  
    $("quizOverlay").hidden = false;  
    document.body.classList.add("quizOpen");  
    $("quizClose").focus();  
  }

  function closeQuiz() {  
    $("quizOverlay").hidden = true;  
    document.body.classList.remove("quizOpen");  
  }

  $("quizClose").onclick = closeQuiz;  
  $("quizOverlay").onclick = (e) => {  
    if (e.target === $("quizOverlay")) closeQuiz();  
  };

  $("quizNext").onclick = () => {  
    if (quizIndex < quizQuestions.length - 1) {  
      quizIndex++;  
      renderQuizQuestion();  
      return;  
    }

    $("quizForm").hidden = true;  
    $("quizNext").hidden = true;  
    $("quizRetry").hidden = false;  
    $("quizResult").className = "quizResult finalResult";  
    $("quizResult").textContent =  
      quizScore === quizQuestions.length  
        ? `Excellent — ${quizScore} of ${quizQuestions.length} correct.`  
        : `You identified ${quizScore} of ${quizQuestions.length} correctly.`;

    if (window.markCourseStepComplete) window.markCourseStepComplete("mechanics");  
    if (window.renderCourseProgress) window.renderCourseProgress();  
    if ($("moduleCompleteActions")) $("moduleCompleteActions").hidden = false;  
  };

  $("quizRetry").onclick = () => {  
    $("quizForm").hidden = false;  
    renderQuiz();  
  };

  if (window.renderCourseProgress) window.renderCourseProgress();  
  select(0, false);  
})();  
