tsParticles.loadJSON("tsparticles", "frontend/assets/particles.json");

const API_BASE = 'https://parthdhroovji.me'; 


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
    const response  = await fetch(`${API_BASE}/chat`,  {
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






// grab elements
var contactSheet = document.getElementById('contact-sheet');
if (contactSheet) {
  var contactBackdrop = contactSheet.querySelector('.contact-sheet-backdrop');
  var contactIcon     = document.getElementById('contact-sheet-icon');
  var contactTitle    = document.getElementById('contact-sheet-title');
  var contactLink     = document.getElementById('contact-sheet-link');
  var contactCopyBtn  = document.getElementById('contact-sheet-copy');
  var contactOpenBtn  = document.getElementById('contact-sheet-open');
  var contactCloseBtn = contactSheet.querySelector('.contact-sheet-close');

  // extract a clean identifier (username, email, phone) from href
  function contactExtractId(href) {
    if (href.startsWith("mailto:"))       return href.replace("mailto:", "");
    if (href.startsWith("tel:"))          return href.replace("tel:", "");
    if (href.includes("github.com/"))     return href.split("github.com/")[1];
    if (href.includes("instagram.com/"))  return href.split("instagram.com/")[1];
    if (href.includes(".pdf"))            return href.split('/').pop();

    return href; // fallback 
  }

  // set the icon based on the clicked anchor image
  function contactSetIconFromAnchor(anchor) {
    var img = anchor.querySelector('img');
    if (img) {
      var src = img.getAttribute('src');
      if (src) {
        contactIcon.src = src;
      } else {
        contactIcon.removeAttribute('src');
      }
      var alt = img.getAttribute('alt');
      if (alt && alt.length > 0) {
        contactIcon.alt = alt + ' icon';
      } else {
        contactIcon.alt = '';
      }
    } else {
      contactIcon.removeAttribute('src');
      contactIcon.alt = '';
    }
    return img;
  }

  // provider display name for the title
  function contactProviderName(img) {
      var a = img.getAttribute('alt');
      if (a && a.length > 0) {
        return a;
      }
      else {
        return 'Contact';
      }
  }

  function isPDF(href) {
    return href.toLowerCase().endsWith('.pdf');
  }

  // open the sheet
  function openContactSheet(anchor) {
    var href = anchor.getAttribute('href');
    if (!href) {
      href = '#';
    }

    var img  = contactSetIconFromAnchor(anchor);
    var provider = contactProviderName(img);
    var id = contactExtractId(href);

    contactTitle.textContent = provider;
    contactLink.textContent = id;
    contactOpenBtn.href = href;

    if (isPDF(href)) {
      contactTitle.textContent = 'Resume';
      contactLink.style.display = 'none';
      contactCopyBtn.style.display = 'none';
      contactOpenBtn.textContent = 'Download PDF';

    }
    else {
      contactLink.style.display = 'inline-flex';
      contactCopyBtn.style.display = 'inline-flex';
      contactOpenBtn.textContent = 'Open Link';

      // copy handler with fallback when clipboard API is missing
      contactCopyBtn.textContent = 'Copy ID';
      contactCopyBtn.onclick = function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(id).then(function () {
            var prev = contactCopyBtn.textContent;
            contactCopyBtn.textContent = 'Copied!';
            setTimeout(function () { contactCopyBtn.textContent = prev; }, 1200);
          }).catch(function () {
            var prev1 = contactCopyBtn.textContent;
            contactCopyBtn.textContent = 'Failed';
            setTimeout(function () { contactCopyBtn.textContent = prev1; }, 1200);
          });
        } else {
          // fallback method
          var temp = document.createElement('input');
          temp.type = 'text';
          temp.value = id;
          document.body.appendChild(temp);
          temp.select();
          try { document.execCommand('copy'); } catch (err) {}
          document.body.removeChild(temp);

          var prev2 = contactCopyBtn.textContent;
          contactCopyBtn.textContent = 'Copied!';
          setTimeout(function () { contactCopyBtn.textContent = prev2; }, 1200);
        }
      };
  }
    document.body.style.overflow = 'hidden';
    contactSheet.classList.add('visible');
    contactSheet.setAttribute('aria-hidden', 'false');
    contactOpenBtn.focus();
  }

  // close the sheet
  function closeContactSheet() {
    contactSheet.classList.remove('visible');
    contactSheet.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // intercept clicks on contact icons
  var contactAnchors = document.querySelectorAll('#contact-links a');
  var i = 0;
  while (i < contactAnchors.length) {
    contactAnchors[i].addEventListener('click', function (e) {
      e.preventDefault();
      openContactSheet(this);
    });
    i = i + 1;
  }

  // backdrop and close button
  contactBackdrop.addEventListener('click', function () { closeContactSheet(); });
  contactCloseBtn.addEventListener('click', function (e) {
    e.preventDefault();
    closeContactSheet();
  });

  // escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && contactSheet.classList.contains('visible')) {
      closeContactSheet();
    }
  });
}



// ----- Contact form submit with reCAPTCHA verification -----
(function () {
  var form = document.getElementById('contact-form');
  if (!form) { return; }

  var status = document.getElementById('contact-status');
  var btn = form.querySelector('button[type="submit"]');

  function setStatus(text, ok) {
    if (status) {
      status.textContent = text || '';
      status.style.color = ok ? 'var(--accent2)' : 'var(--subtext)';
    }
  }

  form.addEventListener('submit', async function (e) {
    // use browser's built-in HTML validation
    if (!form.checkValidity()) { return; }

    e.preventDefault();

    // ensure reCAPTCHA solved (UX only; server must still verify)
    var captchaOk = (typeof grecaptcha !== 'undefined') &&
                    grecaptcha.getResponse &&
                    grecaptcha.getResponse().length > 0;
    if (!captchaOk) {
      setStatus('Please complete the CAPTCHA.', false);
      return;
    }

    // lock UI
    if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
    setStatus('Sending your message…', true);

    try {
      var fd = new FormData(form);
      var r = await fetch(`${API_BASE}/contact`, { method: 'POST', body: fd });


      if (!r.ok) { throw new Error('Bad status ' + r.status); }
   

      setStatus('Message sent. I’ll get back to you soon.', true);
      try { form.reset(); } catch (err) {}
      try { if (typeof grecaptcha !== 'undefined') { grecaptcha.reset(); } } catch (err) {}
    } catch (err) {
      setStatus('Send failed. Please try again.', false);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Send Email'; }
    }
  });
})();
