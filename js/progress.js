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
  saveCourseProgress(progress);  
  updateCourseProgress();  
}

function renderCourseProgress() {  
  updateCourseProgress();  
  const progress = getCourseProgress();

  const fill = document.getElementById("overallProgressFill");  
  const text = document.getElementById("overallProgressText");

  if (fill) fill.style.width = progress.percent + "%";  
  if (text) text.textContent = progress.percent + "%";  
}

function resetCourseProgress() {  
  localStorage.removeItem(COURSE_PROGRESS_KEY);  
}  
