VANTA.TOPOLOGY({
    el: "#vanta-bg",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.00,
    minWidth: 200.00,
    scale: 1.00,
    scaleMobile: 1.00,
    mobile: true,
    color: 0xff6600,
    backgroundColor: 0x000000
});
// parallax on scroll
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  document.getElementById("vanta-bg").style.transform = `translateY(${scrollY * -0.2}px)`;
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