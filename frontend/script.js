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
const charCount = document.getElementById("charCount");

input.addEventListener("input", function() {
    const remainingChars = input.value.length;
    charCount.textContent = "Character limit: " + remainingChars + "/" + maxlength;
});


/// ai chatbot screen
const askButton = document.querySelector('#chatform button');
const chatPopup = document.getElementById('chatbox-wrapper');
const closeBtn = document.getElementById('close-chat');
const sendBtn = document.getElementById('send-chat');
const inputBox = document.getElementById('chat-user-input');
const chatMessages = document.getElementById('chat-messages');


function handleChatAskButton(e) {
  e.preventDefault();  
  document.body.style.overflow = 'hidden'; // disable page scrolling
  chatPopup.classList.add("visible");
}
askButton.addEventListener("click", handleChatAskButton);

function handleChatCloseBtn(e) {
  e.preventDefault();
  document.body.style.overflow = '';
  chatPopup.classList.remove("visible");
}
closeBtn.addEventListener("click", handleChatCloseBtn)



// Send message
function sendMessage() {
  const userText = inputBox.value.trim();
  if (!userText) return;

  // Add user message
  const userBubble = document.createElement('div');
  userBubble.className = 'message user';
  userBubble.textContent = userText;
  chatMessages.appendChild(userBubble);

  // Simulate AI reply
  const botBubble = document.createElement('div');
  botBubble.className = 'message bot';
  botBubble.textContent = `That's a great question about Parth!`;

  setTimeout(() => {
    chatMessages.appendChild(botBubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 500);

  inputBox.value = '';
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendBtn.addEventListener('click', sendMessage);
inputBox.addEventListener('keypress', e => {
  if (e.key === 'Enter') sendMessage();
});





// BACKEND
async function ask_ai_api() {
  const user_question = document.getElementsByClassName(ai-quest-input)
}