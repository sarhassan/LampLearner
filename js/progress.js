const COURSE_PROGRESS_KEY = "lampLearnerProgress";

function getCourseProgress() {  
  const saved = localStorage.getItem(COURSE_PROGRESS_KEY);  
  if (saved) return JSON.parse(saved);

  return {  
    mechanics: false,  
    anterior: false,  
    posterior: false,  
    percent: 0  
  };  
}

function saveCourseProgress(progress) {  
  localStorage.setItem(COURSE_PROGRESS_KEY, JSON.stringify(progress));  
}

function markCourseStepComplete(step) {  
  const progress = getCourseProgress();  
  progress[step] = true;  
  saveCourseProgress(progress);  
  updateCourseProgress();  
}

function updateCourseProgress() {  
  const progress = getCourseProgress();  
  const steps = [  
    progress.mechanics,  
    progress.anterior,  
    progress.posterior  
  ];

  const done = steps.filter(Boolean).length;  
  progress.percent = Math.round((done / steps.length) * 100);  
  saveCourseProgress(progress);  
}

function renderCourseProgress() {  
  updateCourseProgress();  
  const progress = getCourseProgress();

  const text = document.getElementById("overallProgressText");  
  const fill = document.getElementById("overallProgressFill");

  if (text) text.textContent = `${progress.percent}%`;  
  if (fill) fill.style.width = `${progress.percent}%`;  
}

function resetCourseProgress() {  
  localStorage.removeItem(COURSE_PROGRESS_KEY);  
}  
