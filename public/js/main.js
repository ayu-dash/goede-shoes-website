// Navbar scroll effect
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 10) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// Active nav link on scroll
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-link");

function updateActiveNav() {
  const scrollPos = window.scrollY + 100;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute("id");

    if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
      navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${sectionId}` || 
            (sectionId === "beranda" && link.getAttribute("href") === "/")) {
          link.classList.add("active");
        }
      });
    }
  });
}

window.addEventListener("scroll", updateActiveNav);

// Mobile hamburger toggle
const hamburger = document.getElementById("hamburger");
const navLinksEl = document.getElementById("nav-links");

if (hamburger) {
  hamburger.addEventListener("click", () => {
    navLinksEl.classList.toggle("open");
    hamburger.classList.toggle("active");
  });
}

// ===========================
// AUTH PAGES INTERACTIONS
// ===========================

// Password toggle visibility
document.querySelectorAll(".password-toggle").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const input = toggle.parentElement.querySelector("input");
    const icon = toggle.querySelector("i");

    if (input.type === "password") {
      input.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      input.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  });
});

// OTP Input auto-focus & behavior
const otpGroup = document.getElementById("otp-group");
if (otpGroup) {
  const otpInputs = otpGroup.querySelectorAll(".otp-input");

  otpInputs.forEach((input, index) => {
    // Auto-focus to next input on entry
    input.addEventListener("input", (e) => {
      const value = e.target.value;

      // Only allow digits
      e.target.value = value.replace(/[^0-9]/g, "");

      if (e.target.value && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }

      // Add filled class
      if (e.target.value) {
        e.target.classList.add("filled");
      } else {
        e.target.classList.remove("filled");
      }
    });

    // Handle backspace to go to previous input
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !e.target.value && index > 0) {
        otpInputs[index - 1].focus();
        otpInputs[index - 1].value = "";
        otpInputs[index - 1].classList.remove("filled");
      }
    });

    // Handle paste
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const pasteData = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
      pasteData.split("").forEach((char, i) => {
        if (otpInputs[index + i]) {
          otpInputs[index + i].value = char;
          otpInputs[index + i].classList.add("filled");
          if (index + i < otpInputs.length - 1) {
            otpInputs[index + i + 1].focus();
          }
        }
      });
    });
  });

  // Combine OTP values on form submit
  const verifyForm = document.getElementById("verify-form");
  if (verifyForm) {
    verifyForm.addEventListener("submit", (e) => {
      const otpHidden = document.getElementById("otp-hidden");
      let otp = "";
      otpInputs.forEach((input) => {
        otp += input.value;
      });
      otpHidden.value = otp;
    });
  }
}
