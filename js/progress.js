const COURSE_PROGRESS_KEY = "lampLearnerProgress";

function getCourseProgress() {  
  const saved = localStorage.getItem(COURSE_PROGRESS_KEY);  
  if (saved) return JSON.parse(saved);

  return {  
    mechanics: false,  
    anterior: false,  
    posterior: false,  
    mechanicsPercent: 0,  
    anteriorPercent: 0,  
    posteriorPercent: 0,  
    percent: 0  
  };  
}

function saveCourseProgress(progress) {  
  localStorage.setItem(COURSE_PROGRESS_KEY, JSON.stringify(progress));  
}

function updateCourseProgress() {  
  const progress = getCourseProgress();  
  const modules = [progress.mechanics, progress.anterior, progress.posterior];  
  const completeCount = modules.filter(Boolean).length;  
  progress.percent = Math.round((completeCount / modules.length) * 100);  
  saveCourseProgress(progress);  
}

function markCourseStepComplete(step) {  
  const progress = getCourseProgress();  
  progress[step] = true;

  if (step === "mechanics") progress.mechanicsPercent = 100;  
  if (step === "anterior") progress.anteriorPercent = 100;  
  if (step === "posterior") progress.posteriorPercent = 100;

  saveCourseProgress(progress);  
  updateCourseProgress();  
}

function setMechanicsPercent(percent) {  
  const progress = getCourseProgress();  
  progress.mechanicsPercent = percent;  
  saveCourseProgress(progress);  
}

function renderCourseProgress() {  
  updateCourseProgress();  
  const progress = getCourseProgress();

  const fill = document.getElementById("overallProgressFill");  
  const text = document.getElementById("overallProgressText");

  if (fill) fill.style.width = progress.percent + "%";  
  if (text) text.textContent = progress.percent + "%";  
}

function isAnteriorUnlocked() {  
  return getCourseProgress().mechanics === true;  
}

function isPosteriorUnlocked() {  
  return getCourseProgress().mechanics === true;  
}

function protectModuleAccess(moduleName) {  
  if (moduleName === "anterior" && !isAnteriorUnlocked()) {  
    window.location.href = "index.html";  
  }

  if (moduleName === "posterior" && !isPosteriorUnlocked()) {  
    window.location.href = "index.html";  
  }  
}

function lockCard(card) {  
  if (!card) return;  
  card.classList.add("locked");  
  card.classList.remove("unlocked");  
  card.setAttribute("aria-disabled", "true");  
}

function unlockCard(card, href) {  
  if (!card) return;

  const replacement = document.createElement("a");  
  replacement.id = card.id;  
  replacement.className = "module-progress-card unlocked";  
  replacement.href = href;  
  replacement.innerHTML = card.innerHTML;  
  card.replaceWith(replacement);  
}

function renderDashboardProgress() {  
  updateCourseProgress();  
  const progress = getCourseProgress();

  renderCourseProgress();

  const mechanicsFill = document.getElementById("mechanicsProgressFill");  
  const mechanicsText = document.getElementById("mechanicsProgressText");  
  const anteriorFill = document.getElementById("anteriorProgressFill");  
  const anteriorText = document.getElementById("anteriorProgressText");  
  const posteriorFill = document.getElementById("posteriorProgressFill");  
  const posteriorText = document.getElementById("posteriorProgressText");

  if (mechanicsFill) mechanicsFill.style.width = `${progress.mechanicsPercent}%`;  
  if (mechanicsText) mechanicsText.textContent = `${progress.mechanicsPercent}%`;

  if (anteriorFill) anteriorFill.style.width = `${progress.anteriorPercent}%`;  
  if (anteriorText) anteriorText.textContent = `${progress.anteriorPercent}%`;

  if (posteriorFill) posteriorFill.style.width = `${progress.posteriorPercent}%`;  
  if (posteriorText) posteriorText.textContent = `${progress.posteriorPercent}%`;

  const anteriorCard = document.getElementById("anteriorCard");  
  const posteriorCard = document.getElementById("posteriorCard");

  if (isAnteriorUnlocked() && anteriorCard && anteriorCard.tagName !== "A") {  
    unlockCard(anteriorCard, "anterior.html");  
  } else {  
    lockCard(anteriorCard);  
  }

  if (isPosteriorUnlocked() && posteriorCard && posteriorCard.tagName !== "A") {  
    unlockCard(posteriorCard, "posterior.html");  
  } else {  
    lockCard(posteriorCard);  
  }  
}

function resetCourseProgress() {  
  localStorage.removeItem(COURSE_PROGRESS_KEY);  
}  
