tsParticles.load({
  id: "tsparticles",
  options: {
    particles: {
      shape: {
        type: "square", 
      },
    },
    preset: "triangles",
  },
});


// parallax on scroll
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  document.getElementById("tsparticles").style.transform = `translateY(${scrollY * -0.2}px)`;
});


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


function togglePanel(panel) {
    var isOpen = panel.style.transform === 'scaleX(1)';
    if (isOpen) {
        panel.style.transform = 'scaleX(0)';
    } else {
        panel.style.transform = 'scaleX(1)';
    }
}

function setupAllToggleButtons() {
    var wrappers = document.querySelectorAll('.imagelinkwrapper');
    for (var i = 0; i < wrappers.length; i++) {
        var img = wrappers[i].querySelector('img');
        var panel = wrappers[i].querySelector('.slideoutpanel');
        if (img && panel) {
            img.addEventListener('click', (function(panelRef) {
                return function() {
                    togglePanel(panelRef);
                };
            })(panel));
        }
    }
}

window.addEventListener('load', setupAllToggleButtons);


const input = document.getElementById("chatinput");
const maxlength = input.getAttribute("maxlength");
const charCount = document.getElementById("charCount");

input.addEventListener("input", function() {
    const remainingChars = input.value.length;
    charCount.textContent = "Character limit: " + remainingChars + "/" + maxlength;
});





const askButton = document.querySelector('#chatform button');
const chatPopup = document.getElementById('chatbox-wrapper');
const closeBtn = document.getElementById('close-chat');
const sendBtn = document.getElementById('send-chat');
const inputBox = document.getElementById('chat-user-input');
const chatMessages = document.getElementById('chat-messages');


askButton.addEventListener("click", (e) => {
  e.preventDefault(); 
  document.body.style.overflow = 'hidden';
  chatPopup.classList.add("visible");
});

closeBtn.addEventListener("click", () => {
  document.body.style.overflow = '';
  chatPopup.classList.remove("visible");
});


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
