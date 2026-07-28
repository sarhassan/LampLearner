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
  const progress = getCourseProgress();  
  return progress.mechanics === true;  
}

function isPosteriorUnlocked() {  
  const progress = getCourseProgress();  
  return progress.mechanics === true;  
}

function protectModuleAccess(moduleName) {  
  if (moduleName === "anterior" && !isAnteriorUnlocked()) {  
    window.location.href = "index.html";  
  }

  if (moduleName === "posterior" && !isPosteriorUnlocked()) {  
    window.location.href = "index.html";  
  }  
}

function setLockedCardState(card, locked) {  
  if (!card) return;

  if (locked) {  
    card.classList.add("locked");  
    card.classList.remove("unlocked");  
    card.setAttribute("aria-disabled", "true");  
    card.addEventListener("click", preventLockedClick);  
  } else {  
    card.classList.remove("locked");  
    card.classList.add("unlocked");  
    card.removeAttribute("aria-disabled");  
    card.removeEventListener("click", preventLockedClick);  
  }  
}

function preventLockedClick(e) {  
  e.preventDefault();  
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

  setLockedCardState(anteriorCard, !isAnteriorUnlocked());  
  setLockedCardState(posteriorCard, !isPosteriorUnlocked());  
}

function resetCourseProgress() {  
  localStorage.removeItem(COURSE_PROGRESS_KEY);  
}  
