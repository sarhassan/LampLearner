(()=>{"use strict";
const parts=window.SLIT_LAMP_PARTS,pos=window.SLIT_LAMP_HOTSPOTS,$=id=>document.getElementById(id);
let selected=0;
const viewed=new Set();

parts.forEach((part,i)=>{
 const li=document.createElement("li"),b=document.createElement("button");
 b.innerHTML=`<span>${part.id}</span><em>${part.name}</em><i>›</i>`;
 b.onclick=()=>select(i,true,true);li.appendChild(b);$("partsList").appendChild(li);
 const h=document.createElement("button");
 h.className="hotspot";h.style.left=pos[i].x+"%";h.style.top=pos[i].y+"%";
 h.setAttribute("aria-label",`${part.id}. ${part.name}`);h.title=`${part.id}. ${part.name}`;
 h.onclick=()=>select(i,true,true);$("hotspots").appendChild(h);
 $("dots").appendChild(document.createElement("i"));
});

function updateProgress(){
 const count=viewed.size,percent=Math.round(count/parts.length*100);
 $("progressLabel").textContent=`${count} of ${parts.length} components viewed`;
 $("progressBar").style.width=`${percent}%`;$("progressPercent").textContent=percent+"%";
 document.querySelectorAll("#dots i").forEach((d,n)=>d.classList.toggle("done",viewed.has(n)));
}

function select(i,track=true,scroll=false){
 selected=Math.max(0,Math.min(parts.length-1,i));const p=parts[selected];
 if(track)viewed.add(selected);
 document.querySelectorAll("#partsList button").forEach((b,n)=>{
  b.classList.toggle("active",n===selected);
  if(n===selected)b.setAttribute("aria-current","step");else b.removeAttribute("aria-current");
 });
 document.querySelectorAll(".hotspot").forEach((b,n)=>b.classList.toggle("active",n===selected));
 $("partNumber").textContent=`COMPONENT ${String(p.id).padStart(2,"0")}`;$("partName").textContent=p.name;
 ["function","use","pearl","mistake"].forEach(k=>$(k+"Text").textContent=p[k]);
 $("lessonCount").textContent=`Lesson ${selected+1} of ${parts.length}`;
 $("previousName").textContent=selected?parts[selected-1].name:"Introduction";
 $("nextName").textContent=selected<parts.length-1?parts[selected+1].name:(viewed.size===parts.length?"Start the quiz":"Review remaining parts");
 $("previous").disabled=selected===0;
 $("next").disabled=selected===parts.length-1&&viewed.size<parts.length;
 $("next").classList.toggle("quizReady",selected===parts.length-1&&viewed.size===parts.length);
 updateProgress();
 if(scroll&&innerWidth<1000)$("teachingPanel").scrollIntoView({behavior:"smooth"});
}

$("previous").onclick=()=>select(selected-1);
$("next").onclick=()=>selected===parts.length-1&&viewed.size===parts.length?openQuiz():select(selected+1);
document.addEventListener("keydown",e=>{
 if(!$("quizOverlay").hidden)return;
 if(e.key==="ArrowLeft")select(selected-1);
 if(e.key==="ArrowRight")select(selected+1);
});

const quizQuestions=[
 {q:"Click the Magnification Changer (Drum).",a:1},
 {q:"Click the Joystick.",a:12},
 {q:"Click the Chin Rest.",a:7},
 {q:"Click the Illumination Arm.",a:13},
 {q:"Click the Handle Bar.",a:10}
];
let quizIndex=0,quizScore=0,quizAnswered=false;
function renderQuiz(){
 quizIndex=0;quizScore=0;$("quizForm").hidden=false;renderQuizQuestion();
 $("quizRetry").hidden=true;
}
function renderQuizQuestion(){
 quizAnswered=false;
 $("quizQuestionCount").textContent=`Question ${quizIndex+1} of ${quizQuestions.length}`;
 $("quizScore").textContent=`Score: ${quizScore}`;
 $("quizPrompt").textContent=quizQuestions[quizIndex].q;
 $("quizResult").textContent="Choose a location on the image.";
 $("quizResult").className="quizResult";
 $("quizNext").hidden=true;
 $("quizHotspots").innerHTML="";
 pos.forEach((spot,i)=>{
  const b=document.createElement("button");
  b.type="button";b.className="quizHotspot";
  b.style.left=spot.x+"%";b.style.top=spot.y+"%";
  b.setAttribute("aria-label",`Location ${i+1}`);
  b.onclick=()=>answerQuiz(i,b);
  $("quizHotspots").appendChild(b);
 });
}
function answerQuiz(choice,button){
 if(quizAnswered)return;
 quizAnswered=true;
 const correct=choice===quizQuestions[quizIndex].a;
 if(correct){quizScore++;button.classList.add("correct");}
 else{
  button.classList.add("incorrect");
  $("quizHotspots").children[quizQuestions[quizIndex].a].classList.add("reveal");
 }
 $("quizScore").textContent=`Score: ${quizScore}`;
 $("quizResult").textContent=correct?"Correct!":`Not quite. The correct location is highlighted in green.`;
 $("quizResult").className=`quizResult ${correct?"correctText":"incorrectText"}`;
 $("quizNext").textContent=quizIndex===quizQuestions.length-1?"See results":"Next question";
 $("quizNext").hidden=false;
}
function openQuiz(){
 renderQuiz();$("quizOverlay").hidden=false;document.body.classList.add("quizOpen");$("quizClose").focus();
}
function closeQuiz(){$("quizOverlay").hidden=true;document.body.classList.remove("quizOpen")}
$("quizClose").onclick=closeQuiz;
$("quizOverlay").onclick=e=>{if(e.target===$("quizOverlay"))closeQuiz()};
$("quizNext").onclick=()=>{
 if(quizIndex<quizQuestions.length-1){quizIndex++;renderQuizQuestion();return;}
 $("quizForm").hidden=true;$("quizNext").hidden=true;$("quizRetry").hidden=false;
 $("quizResult").className="quizResult finalResult";
 $("quizResult").textContent=quizScore===quizQuestions.length
  ?`Excellent — ${quizScore} of ${quizQuestions.length} correct.`
  :`You identified ${quizScore} of ${quizQuestions.length} components correctly.`;
};
$("quizRetry").onclick=()=>{$("quizForm").hidden=false;renderQuiz()};
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("quizOverlay").hidden)closeQuiz()});
select(0,false);
})();
