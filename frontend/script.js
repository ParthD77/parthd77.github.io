tsParticles.loadJSON("tsparticles", "assets/particles.json");


// parallax on scroll
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  document.getElementById("tsparticles").style.transform = `translateY(${scrollY * -0.2}px)`;
});


/// Smooth scroll for navbar links and no http link issue
document.querySelectorAll('.navbar nav a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetId = link.dataset.scrollTo;
    const target = document.getElementById(targetId);
    if (!target) return;

    const navHeight = document.querySelector('.navbar').offsetHeight;
    const offset = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;

    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
});


/// i am a ... typwriter effect
var i = 0;
var txt = ["computer science major.", "AI enthusiast.", "software developer.", "team leader.", "passionate learner."];
var speed = 100;
var desc = 0;

function iAmTypeWriter() {
    if (i < txt[desc].length){
        document.getElementById("heropara").innerHTML += txt[desc].charAt(i);
        i++;
        setTimeout(iAmTypeWriter, speed);
    }
    else if (i == txt[desc].length) {
        setTimeout(resetTypeWriter, 2000);
    }
}

function resetTypeWriter() {
    desc++;
    if (desc >= txt.length) {
        desc = 0;
    }
    i = 0;
    document.getElementById("heropara").innerHTML = "";
    setTimeout(iAmTypeWriter, speed);
}

iAmTypeWriter();



/// Character count for chat input on base screen
const input = document.getElementById("chatinput");
const maxlength = input.getAttribute("maxlength");
const charCount1 = document.getElementById("charCount1");

input.addEventListener("input", function() {
    const remainingChars = input.value.length;
    charCount1.textContent = "Character limit: " + remainingChars + "/" + maxlength;
});




/// ai chatbot screen
const askButton = document.querySelector('#chatform button');
const chatPopup = document.getElementById('chatbox-wrapper');
const closeBtn = document.getElementById('close-chat');
const sendBtn = document.getElementById('send-chat');
const inputBox = document.getElementById('chat-user-input');
const chatMessages = document.getElementById('chat-messages');


/// Character count for chat input on ai chat screen
const charCount2 = document.getElementById("charCount2");

inputBox.addEventListener("input", function() {
    const remainingChars = inputBox.value.length;
    charCount2.textContent = "Character limit: " + remainingChars + "/" + maxlength;
});

function handleChatAskButton(e) {
  e.preventDefault();  
  document.body.style.overflow = 'hidden'; // disable page scrolling
  chatPopup.classList.add("visible");
  inputBox.value = input.value;
  inputBox.dispatchEvent(new Event('input'));
  inputBox.focus();
}
askButton.addEventListener("click", handleChatAskButton);

function handleChatCloseBtn(e) {
  e.preventDefault();
  document.body.style.overflow = '';
  chatPopup.classList.remove("visible");
  input.value = inputBox.value;
  input.dispatchEvent(new Event('input'));
}
closeBtn.addEventListener("click", handleChatCloseBtn)



// Send message
async function sendMessage() {
  const userText = inputBox.value.trim();
  if (!userText) return;

  inputBox.value = "";
  sendBtn.disabled = true;
  inputBox.disabled = true;

  // Add user message
  const userBubble = document.createElement('div');
  userBubble.className = 'message user';
  userBubble.textContent = userText;
  chatMessages.appendChild(userBubble);

  // fetch from AI backend
  const botBubble = document.createElement('div');
  botBubble.className = 'message bot';
  botBubble.textContent = "Thinking...";

  chatMessages.appendChild(botBubble);
    requestAnimationFrame(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
    });


  const response = await ask_ai_api(userText);
  botBubble.textContent = response;

  setTimeout(() => {
    requestAnimationFrame(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  }, 500);

  chatMessages.scrollTop = chatMessages.scrollHeight;
  inputBox.dispatchEvent(new Event('input'));
  sendBtn.disabled = false;
  inputBox.disabled = false;
}

sendBtn.addEventListener('click', sendMessage);
inputBox.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});





// BACKEND
async function ask_ai_api(userInput) {


  // fetch from AI backend
  try{
    const response  = await fetch("http://127.0.0.1:5000/chat",  {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body:  JSON.stringify({ question: userInput })
    });
    if (!response.ok) {
      const errText = await response.text(); 
      throw new Error(`Server error ${response.status}: ${errText}`);
    }

    const data = await response.text();
    return data;
  } 
  catch (error) {
    console.error("Error fetching AI response:", error);
    return "⚠️ Something went wrong please try again later."; 
  }
}





// Add to your script.js (extend what you already have)
const modal = document.getElementById('project-modal');
const modalCard = modal.querySelector('.modal-card');
const modalTitle = document.getElementById('modal-title');
const modalBody  = document.getElementById('modal-body');
const modalImage = document.getElementById('modal-image');
const modalRepo  = document.getElementById('modal-repo');
const closeSumBtn   = modal.querySelector('.modal-close');
const backdrop   = modal.querySelector('.modal-backdrop');

function setModalOriginFrom(el){
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top  + r.height / 2;
  modalCard.style.setProperty('--start-x', cx + 'px');
  modalCard.style.setProperty('--start-y', cy + 'px');
}

function openProjectModal(card, originEl){
  const title = card.dataset.title || card.querySelector('h3')?.textContent || 'Project';
  const desc  = card.dataset.desc  || 'More details coming soon.';
  const repo  = card.dataset.repo  || ''; // e.g., https://github.com/ParthD77/rot_vid_gen
  const img   = card.dataset.modalimg || card.querySelector('.project-thumb img')?.src || '';

  modalTitle.textContent = title;
  modalBody.innerHTML = `<p>${desc}</p>`;

  if (img) {
    modalImage.src = img;
    modalImage.alt = `${title} preview`;
    modalImage.parentElement.style.display = '';
  } else {
    modalImage.src = '';
    modalImage.parentElement.style.display = 'none';
  }

  if (repo) {
    modalRepo.href = repo;
    modalRepo.style.display = 'inline-flex';
    modalRepo.setAttribute('aria-label', `Open ${title} on GitHub`);
  } else {
    modalRepo.removeAttribute('href');
    modalRepo.style.display = 'none';
  }

  setModalOriginFrom(originEl || card.querySelector('.project-cta') || card);
  modal.classList.remove('closing');
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal(){
  modal.classList.add('closing');
  const onEnd = (e)=>{
    if (e.propertyName !== 'transform') return;
    modal.classList.remove('show','open','closing');
    document.body.style.overflow = '';
    modalCard.removeEventListener('transitionend', onEnd);
  };
  modalCard.addEventListener('transitionend', onEnd);
}

// Open from card buttons
document.querySelectorAll('.project-cta').forEach(btn=>{
  btn.addEventListener('click', e=>{
    const card = e.currentTarget.closest('.project');
    openProjectModal(card, e.currentTarget);
  });
});
closeSumBtn.addEventListener('click', closeProjectModal);
backdrop.addEventListener('click', closeProjectModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && (modal.classList.contains('show') || modal.classList.contains('open'))) {
    closeProjectModal();
  }
});
