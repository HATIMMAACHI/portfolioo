// Modern Portfolio JavaScript
function initApp() {
  initializeLoadingScreen();
  initializeThemeToggle();
  fetchDynamicProfile(); // Fetch and hydrate profile variables dynamically
  initializeMobileMenu();
  initializeSmoothScrolling();
  initializeTypingEffect();
  initializeScrollAnimations();
  initializeContactForm();
  initializeBackToTop();
  initializeSkillLevels();
  initializeParticles();
  initializeThreeJSBackground();
  initialize3DParallaxAndTilt();
  initializeSkillsTagSphere();
  initializeScrollDrivenPerspective();
  initializeAOS();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

// Fetch and hydrate profile variables dynamically from FastAPI profile endpoint
async function fetchDynamicProfile() {
  const apiHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : 'https://votre-backend.up.railway.app'; // <--- REMPLACEZ PAR VOTRE URL DE PRODUCTION RAILWAY (ex: https://portfolio-api.up.railway.app)
  try {
    const res = await fetch(`${apiHost}/api/profile`);
    if (!res.ok) throw new Error("Impossible de charger le profil dynamique");
    const profile = await res.json();
    
    // Hydrate DOM
    if (profile.name) {
      const heroName = document.querySelector(".hero-title .name");
      if (heroName) heroName.innerText = profile.name;
      const loaderName = document.querySelector(".loader-text");
      if (loaderName) loaderName.innerText = profile.name.toUpperCase();
      
      const logoText = document.querySelector(".logo-text");
      const logoAccent = document.querySelector(".logo-accent");
      if (logoText && logoAccent) {
        const parts = profile.name.split(" ");
        if (parts.length >= 2) {
          logoText.innerText = parts[0];
          logoAccent.innerText = parts.slice(1).join(" ");
        }
      }
      
      const footerLogo = document.querySelector(".footer-logo h3");
      if (footerLogo) {
        const parts = profile.name.split(" ");
        if (parts.length >= 2) {
          footerLogo.innerHTML = `${parts[0]} <span>${parts.slice(1).join(" ")}</span>`;
        }
      }
    }
    
    if (profile.subtitle) {
      window.dynamicTypingTexts = [
        profile.subtitle,
        "Développeur Web",
        "Passionné de Technologie"
      ];
      
      const floatingTitle = document.querySelector(".floating-card span");
      if (floatingTitle) floatingTitle.innerText = profile.subtitle;
      
      const footerSub = document.querySelector(".footer-logo p");
      if (footerSub) footerSub.innerText = profile.subtitle;
    }
    
    if (profile.bio) {
      const heroDesc = document.querySelector(".hero-description");
      if (heroDesc) heroDesc.innerText = profile.bio;
    }
    
    if (profile.about_title) {
      const aboutTitle = document.querySelector(".about-text h3");
      if (aboutTitle) aboutTitle.innerText = profile.about_title;
    }
    
    if (profile.about_bio) {
      const aboutBio = document.querySelector(".about-text p");
      if (aboutBio) aboutBio.innerText = profile.about_bio;
    }
    
    if (profile.experience_years) {
      const expYears = document.querySelector(".experience-badge .years");
      if (expYears) expYears.innerText = profile.experience_years;
    }
    
    if (profile.stats) {
      const statItems = document.querySelectorAll(".about-stats .stat-item");
      if (statItems.length >= 3) {
        statItems[0].querySelector(".stat-number").innerText = profile.stats.projects_count || "";
        statItems[1].querySelector(".stat-number").innerText = profile.stats.tech_count || "";
        statItems[2].querySelector(".stat-number").innerText = profile.stats.studies_years || "";
      }
    }
    
    if (profile.contact) {
      const contactDetails = document.querySelectorAll(".contact-details p");
      if (contactDetails.length >= 3) {
        contactDetails[0].innerText = profile.contact.email || "";
        contactDetails[1].innerText = profile.contact.phone || "";
        contactDetails[2].innerText = profile.contact.location || "";
      }
    }
    
    if (profile.socials) {
      const contactSocials = document.querySelectorAll(".contact-info .social-link");
      contactSocials.forEach(link => {
        const icon = link.querySelector("i");
        if (icon) {
          if (icon.classList.contains("fa-github") && profile.socials.github) link.href = profile.socials.github;
          if (icon.classList.contains("fa-linkedin") && profile.socials.linkedin) link.href = profile.socials.linkedin;
          if (icon.classList.contains("fa-facebook") && profile.socials.facebook) link.href = profile.socials.facebook;
          if (icon.classList.contains("fa-instagram") && profile.socials.instagram) link.href = profile.socials.instagram;
        }
      });
      
      const footerSocials = document.querySelectorAll(".footer-social a");
      footerSocials.forEach(link => {
        const icon = link.querySelector("i");
        if (icon) {
          if (icon.classList.contains("fa-github") && profile.socials.github) link.href = profile.socials.github;
          if (icon.classList.contains("fa-linkedin") && profile.socials.linkedin) link.href = profile.socials.linkedin;
          if (icon.classList.contains("fa-facebook") && profile.socials.facebook) link.href = profile.socials.facebook;
          if (icon.classList.contains("fa-instagram") && profile.socials.instagram) link.href = profile.socials.instagram;
        }
      });
    }
    
    if (profile.skills && profile.skills.length > 0) {
      const skillsGrid = document.querySelector(".skills-grid");
      if (skillsGrid) {
        skillsGrid.innerHTML = '';
        profile.skills.forEach((cat, idx) => {
          const catDiv = document.createElement("div");
          catDiv.className = "skill-category";
          catDiv.setAttribute("data-aos", "fade-up");
          catDiv.setAttribute("data-aos-delay", `${(idx + 1) * 100}`);
          
          let iconClass = "fa-code";
          if (cat.category.toLowerCase().includes("backend") || cat.category.toLowerCase().includes("data")) iconClass = "fa-server";
          else if (cat.category.toLowerCase().includes("database") || cat.category.toLowerCase().includes("base")) iconClass = "fa-database";
          else if (cat.category.toLowerCase().includes("tool") || cat.category.toLowerCase().includes("outil") || cat.category.toLowerCase().includes("method")) iconClass = "fa-tools";
          
          let skillItemsHtml = '';
          cat.items.forEach(item => {
            let itemIcon = "fa-code";
            if (item.toLowerCase().includes("react")) itemIcon = "fab fa-react";
            else if (item.toLowerCase().includes("vue")) itemIcon = "fab fa-vuejs";
            else if (item.toLowerCase().includes("tailwind")) itemIcon = "fab fa-css3-alt";
            else if (item.toLowerCase().includes("typescript") || item.toLowerCase().includes("js")) itemIcon = "fab fa-js-square";
            else if (item.toLowerCase().includes("spring") || item.toLowerCase().includes("java")) itemIcon = "fab fa-java";
            else if (item.toLowerCase().includes("python")) itemIcon = "fab fa-python";
            else if (item.toLowerCase().includes("php")) itemIcon = "fab fa-php";
            else if (item.toLowerCase().includes("mysql") || item.toLowerCase().includes("postgre") || item.toLowerCase().includes("sql")) itemIcon = "fas fa-database";
            else if (item.toLowerCase().includes("nosql") || item.toLowerCase().includes("mongo")) itemIcon = "fas fa-leaf";
            else if (item.toLowerCase().includes("git")) itemIcon = "fab fa-git-alt";
            else if (item.toLowerCase().includes("docker")) itemIcon = "fab fa-docker";
            else if (item.toLowerCase().includes("uml") || item.toLowerCase().includes("agile")) itemIcon = "fas fa-project-diagram";
            
            skillItemsHtml += `
              <div class="skill-item" data-skill="${item}">
                <i class="${itemIcon}"></i>
                <span>${item}</span>
                <div class="skill-level" data-level="85" style="--level: 85%;"></div>
              </div>
            `;
          });
          
          catDiv.innerHTML = `
            <h3><i class="fas ${iconClass}"></i> ${cat.category}</h3>
            <div class="skill-items">
              ${skillItemsHtml}
            </div>
          `;
          skillsGrid.appendChild(catDiv);
        });
        
        initializeSkillLevels();
      }
    }
    
    if (profile.projects && profile.projects.length > 0) {
      const projectsGrid = document.querySelector(".projects-grid");
      if (projectsGrid) {
        projectsGrid.innerHTML = '';
        profile.projects.forEach((proj, idx) => {
          const card = document.createElement("div");
          card.className = "project-card";
          card.setAttribute("data-aos", "fade-up");
          card.setAttribute("data-aos-delay", `${(idx + 1) * 100}`);
          
          let techHtml = '';
          proj.tech.forEach(t => {
            techHtml += `<span class="tech-tag">${t}</span>`;
          });
          
          card.innerHTML = `
            <div class="project-content">
              <h3>${proj.title}</h3>
              <p>${proj.description}</p>
              <div class="project-tech">
                ${techHtml}
              </div>
            </div>
          `;
          projectsGrid.appendChild(card);
        });
      }
    }
    
    // Trigger Typing Effect init if texts were populated asynchronously
    const typingEl = document.getElementById("typing-text");
    if (typingEl && typingEl.textContent === "") {
      initializeTypingEffect();
    }
    
  } catch (err) {
    console.warn("Dynamic profile loading failed:", err);
  }
}

// Loading Screen
function initializeLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    setTimeout(() => {
      loadingScreen.classList.add("hidden");
      setTimeout(() => {
        loadingScreen.style.display = "none";
      }, 500);
    }, 1500);
  }
}

// Global Theme Helper & Event Delegation
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || document.body?.getAttribute("data-theme") || "dark";
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", newTheme);
  if (document.body) {
    document.body.setAttribute("data-theme", newTheme);
  }
  localStorage.setItem("theme", newTheme);
  updateThemeIcon(newTheme);

  // Notify chat iframe if present
  const iframe = document.getElementById("chat-iframe");
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage({ type: "theme-change", theme: newTheme }, "*");
  }
}

// Global delegated click listener for theme toggle buttons
document.addEventListener("click", function (e) {
  const btn = e.target.closest("#theme-toggle, .theme-toggle");
  if (btn) {
    e.preventDefault();
    e.stopPropagation();
    toggleTheme();
  }
});

function initializeThemeToggle() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  if (document.body) {
    document.body.setAttribute("data-theme", savedTheme);
  }
  updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
  const currentTheme = theme || localStorage.getItem("theme") || "dark";
  const themeToggles = document.querySelectorAll("#theme-toggle, .theme-toggle");
  themeToggles.forEach((btn) => {
    const icon = btn.querySelector("i");
    if (icon) {
      icon.className = currentTheme === "dark" ? "fas fa-sun" : "fas fa-moon";
    }
  });
}

// Mobile Menu
function initializeMobileMenu() {
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileMenuClose = document.getElementById("mobile-menu-close");
  const mobileLinks = document.querySelectorAll(".mobile-link");

  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener("click", () => {
      mobileMenu.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  }

  if (mobileMenuClose && mobileMenu) {
    mobileMenuClose.addEventListener("click", () => {
      mobileMenu.classList.remove("active");
      document.body.style.overflow = "";
    });
  }

  // Close menu when clicking on links
  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("active");
      document.body.style.overflow = "";
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (mobileMenu && mobileMenu.classList.contains("active")) {
      if (
        !mobileMenu.contains(e.target) &&
        !mobileMenuToggle.contains(e.target)
      ) {
        mobileMenu.classList.remove("active");
        document.body.style.overflow = "";
      }
    }
  });
}

// Smooth Scrolling
function initializeSmoothScrolling() {
  const navLinks = document.querySelectorAll('a[href^="#"]');

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });

        // Update active nav link
        updateActiveNavLink(targetId);
      }
    });
  });
}

function updateActiveNavLink(activeId) {
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === activeId) {
      link.classList.add("active");
    }
  });
}

// Typing Effect
function initializeTypingEffect() {
  const typingText = document.getElementById("typing-text");
  if (!typingText) return;

  const texts = window.dynamicTypingTexts || [
    "Étudiant en Master SDSI — Sciences des Données et Systèmes Intelligents",
    "Développeur Web",
    "Passionné de Technologie",
    "Apprenant Curieux",
  ];

  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function typeWriter() {
    const currentText = texts[textIndex];

    if (isDeleting) {
      typingText.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      typingText.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 100;
    }

    if (!isDeleting && charIndex === currentText.length) {
      // Pause at end
      typingSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
      typingSpeed = 500;
    }

    setTimeout(typeWriter, typingSpeed);
  }

  // Start typing effect after a delay
  setTimeout(typeWriter, 1000);
}

// Scroll Animations
function initializeScrollAnimations() {
  const sections = document.querySelectorAll("section[id]");

  function updateActiveSection() {
    const scrollPosition = window.scrollY + 100;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        updateActiveNavLink(`#${sectionId}`);
      }
    });
  }

  window.addEventListener("scroll", updateActiveSection);
  updateActiveSection(); // Initial call
}

// Contact Form
function initializeContactForm() {
  const contactForm = document.getElementById("contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;

      // Show loading state
      submitButton.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Envoi...';
      submitButton.disabled = true;

      try {
        // Simulate form submission (replace with actual backend endpoint)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Show success message
        showNotification("Message envoyé avec succès !", "success");
        contactForm.reset();
      } catch (error) {
        showNotification("Échec de l'envoi. Veuillez réessayer.", "error");
      } finally {
        // Reset button state
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
      }
    });
  }
}

// Notification System
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${
              type === "success"
                ? "check-circle"
                : type === "error"
                  ? "exclamation-circle"
                  : "info-circle"
            }"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;

  // Add styles (colors remain the same since they're standard)
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${
          type === "success"
            ? "#1A1A1A"
            : type === "error"
              ? "#1A1A1A"
              : "#1A1A1A"
        };
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  // Auto remove after 5 seconds
  setTimeout(() => {
    removeNotification(notification);
  }, 5000);

  // Close button
  const closeBtn = notification.querySelector(".notification-close");
  closeBtn.addEventListener("click", () => {
    removeNotification(notification);
  });
}

function removeNotification(notification) {
  notification.style.transform = "translateX(100%)";
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
}

// Back to Top Button
function initializeBackToTop() {
  const backToTop = document.createElement("button");
  backToTop.className = "back-to-top";
  backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
  document.body.appendChild(backToTop);

  backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }
  });
}

// Skill Levels Animation
function initializeSkillLevels() {
  const skillItems = document.querySelectorAll(".skill-item");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const skillLevel = entry.target.querySelector(".skill-level");
          const level = skillLevel.getAttribute("data-level");
          skillLevel.style.setProperty("--level", `${level}%`);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 },
  );

  skillItems.forEach((item) => {
    observer.observe(item);
  });
}

// Particles Background
function initializeParticles() {
  const particlesContainer = document.getElementById("particles");
  if (!particlesContainer) return;

  const particleCount = 50;
  const particles = [];

  // Create particles
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            pointer-events: none;
            animation: float-particle ${
              3 + Math.random() * 4
            }s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
        `;

    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;

    particlesContainer.appendChild(particle);
    particles.push(particle);
  }

  // Add CSS animation
  const style = document.createElement("style");
  style.textContent = `
        @keyframes float-particle {
            0%, 100% { 
                transform: translateY(0px) translateX(0px);
                opacity: 0.3;
            }
            50% { 
                transform: translateY(-20px) translateX(10px);
                opacity: 0.8;
            }
        }
    `;
  document.head.appendChild(style);
}

// Initialize AOS
function initializeAOS() {
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
      once: true,
      offset: 100,
    });
  }
}

// Performance Optimizations
function optimizeImages() {
  const images = document.querySelectorAll('img[loading="lazy"]');

  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.remove("lazy");
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  }
}

// Utility Functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Enhanced scroll handling
const throttledScrollHandler = throttle(() => {
  // Handle scroll-based animations
  const scrolled = window.pageYOffset;
  const parallax = document.querySelector(".hero-background");

  if (parallax) {
    const speed = scrolled * 0.5;
    parallax.style.transform = `translateY(${speed}px)`;
  }
}, 16);

window.addEventListener("scroll", throttledScrollHandler);

// Keyboard Navigation
document.addEventListener("keydown", (e) => {
  // Escape key closes mobile menu
  if (e.key === "Escape") {
    const mobileMenu = document.getElementById("mobile-menu");
    if (mobileMenu && mobileMenu.classList.contains("active")) {
      mobileMenu.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  // Ctrl/Cmd + K for search (placeholder)
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    // Implement search functionality here
    console.log("Search triggered");
  }
});

// Service Worker Registration (for PWA features)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

// Analytics (placeholder)
function trackEvent(eventName, eventData = {}) {
  // Implement analytics tracking here
  console.log("Event tracked:", eventName, eventData);
}

// Track important interactions
document.addEventListener("click", (e) => {
  if (e.target.matches(".btn, .nav-link, .social-link")) {
    trackEvent("click", {
      element: e.target.tagName,
      text: e.target.textContent.trim(),
      href: e.target.href || null,
    });
  }
});

// Export functions for global access (if needed)
window.portfolioUtils = {
  showNotification,
  trackEvent,
  debounce,
  throttle,
};

// ==========================================================================
// 3D PORTFOLIO FUNCTIONALITY (Three.js & CSS 3D Parallax)
// ==========================================================================

// Three.js 3D Constellation Background
// Three.js 3D Moroccan Star Background
function initializeThreeJSBackground() {
  const container = document.getElementById("hero-3d-container") || document.getElementById("about-3d-container");
  if (!container || typeof THREE === "undefined") return;

  const scene = new THREE.Scene();

  // Camera Setup
  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 80;

  // Renderer Setup (Transparent background, high performance)
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Moroccan Star Mathematically Defined Vertices (Pentagram on XY plane)
  const R = window.innerWidth < 768 ? 16 : 24;
  const vertices = [];
  for (let i = 0; i < 5; i++) {
    // Start at top (pi/2) and step counter-clockwise/clockwise to draw a star
    const theta = (Math.PI / 2) - (i * 2 * Math.PI / 5);
    vertices.push(new THREE.Vector3(R * Math.cos(theta), R * Math.sin(theta), 0));
  }

  // Pentagram order to connect: 0 -> 2 -> 4 -> 1 -> 3 -> 0
  const starSegments = [
    [vertices[0], vertices[2]],
    [vertices[2], vertices[4]],
    [vertices[4], vertices[1]],
    [vertices[1], vertices[3]],
    [vertices[3], vertices[0]]
  ];

  // Two separate particle systems: Star outline & surrounding Stardust
  const starParticleCount = 200;
  const stardustParticleCount = 80;

  // 1. Star Geometry setup
  const starGeometry = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starParticleCount * 3);
  const starData = [];

  for (let i = 0; i < starParticleCount; i++) {
    const segIndex = i % 5;
    const t = Math.random();
    const speed = 0.0015 + Math.random() * 0.002;
    // Fluffy cloud offset around the segments for 3D thickness
    const offset = new THREE.Vector3(
      (Math.random() - 0.5) * 2.5,
      (Math.random() - 0.5) * 2.5,
      (Math.random() - 0.5) * 6
    );
    const phase = Math.random() * Math.PI * 2;

    starData.push({ segIndex, t, speed, offset, phase });

    // Initial positions along segments
    const seg = starSegments[segIndex];
    const start = seg[0];
    const end = seg[1];
    starPositions[i * 3] = start.x + t * (end.x - start.x) + offset.x;
    starPositions[i * 3 + 1] = start.y + t * (end.y - start.y) + offset.y;
    starPositions[i * 3 + 2] = offset.z;
  }
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));

  // 2. Stardust Geometry setup
  const stardustGeometry = new THREE.BufferGeometry();
  const stardustPositions = new Float32Array(stardustParticleCount * 3);
  const stardustData = [];

  for (let i = 0; i < stardustParticleCount; i++) {
    const r = R * (1.1 + Math.random() * 1.3);
    const angle = Math.random() * Math.PI * 2;
    const orbitSpeed = 0.0006 + Math.random() * 0.0008;
    const yOffset = (Math.random() - 0.5) * R * 0.8;
    const phase = Math.random() * Math.PI * 2;

    stardustData.push({ r, angle, orbitSpeed, yOffset, phase });

    stardustPositions[i * 3] = r * Math.cos(angle);
    stardustPositions[i * 3 + 1] = yOffset;
    stardustPositions[i * 3 + 2] = r * Math.sin(angle);
  }
  stardustGeometry.setAttribute("position", new THREE.BufferAttribute(stardustPositions, 3));

  // Theme configuration for Monochrome Star (Pure White in dark theme, Pure Black in light theme)
  const getThemeColors = () => {
    const isDark = document.body.getAttribute("data-theme") === "dark";
    return {
      particle: isDark ? 0xffffff : 0x000000,    // Pure white in dark theme, pure black in light theme
      line: isDark ? 0xffffff : 0x000000,        // Pure white in dark theme, pure black in light theme
      lineOpacity: isDark ? 0.55 : 0.4,
      particleOpacity: isDark ? 1.0 : 0.85
    };
  };

  let colors = getThemeColors();

  // Create customized high-end circular glowing sprite texture
  const createCircleTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, "rgba(255, 255, 255, 1)");
    grad.addColorStop(0.3, "rgba(255, 255, 255, 0.8)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    
    return new THREE.CanvasTexture(canvas);
  };

  const circleTexture = createCircleTexture();

  // Star points material (larger, glows brighter)
  const starMaterial = new THREE.PointsMaterial({
    size: 2.2,
    sizeAttenuation: true,
    color: colors.particle,
    transparent: true,
    opacity: colors.particleOpacity,
    map: circleTexture,
    blending: document.body.getAttribute("data-theme") === "dark" ? THREE.AdditiveBlending : THREE.NormalBlending,
    depthWrite: false
  });

  const starParticleSystem = new THREE.Points(starGeometry, starMaterial);
  scene.add(starParticleSystem);

  // Stardust points material (smaller, fainter, orbits around)
  const stardustMaterial = new THREE.PointsMaterial({
    size: 1.2,
    sizeAttenuation: true,
    color: colors.particle,
    transparent: true,
    opacity: colors.particleOpacity * 0.45,
    map: circleTexture,
    blending: document.body.getAttribute("data-theme") === "dark" ? THREE.AdditiveBlending : THREE.NormalBlending,
    depthWrite: false
  });

  const stardustParticleSystem = new THREE.Points(stardustGeometry, stardustMaterial);
  scene.add(stardustParticleSystem);

  // Connection Lines setup (specifically connecting star outline points)
  const maxConnections = 500;
  const lineGeometry = new THREE.BufferGeometry();
  const linePositions = new Float32Array(maxConnections * 2 * 3);
  lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));

  const lineMaterial = new THREE.LineBasicMaterial({
    color: colors.line,
    transparent: true,
    opacity: colors.lineOpacity,
    depthWrite: false
  });

  const lineSystem = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lineSystem);

  // Mouse Coordinate tracking variables (for interactive orbit parallax)
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  window.addEventListener("mousemove", (e) => {
    mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Watch for Theme Attribute mutations
  const themeObserver = new MutationObserver(() => {
    const nextColors = getThemeColors();
    colors = nextColors;
    
    starMaterial.color.setHex(colors.particle);
    starMaterial.opacity = colors.particleOpacity;
    
    stardustMaterial.color.setHex(colors.particle);
    stardustMaterial.opacity = colors.particleOpacity * 0.45;
    
    lineMaterial.color.setHex(colors.line);
    lineMaterial.opacity = colors.lineOpacity;
    
    const isDark = document.body.getAttribute("data-theme") === "dark";
    starMaterial.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
    stardustMaterial.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
  });
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });

  // Scroll warp tracking properties
  let scrollSpeedTarget = 0;
  let lastScrollY = window.scrollY;
  let currentScrollSpeed = 0;

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    const delta = Math.abs(currentScrollY - lastScrollY);
    scrollSpeedTarget = delta * 0.15; // Warp scaling factor
    lastScrollY = currentScrollY;
  });

  // WebGL Render Loop
  const starPosArr = starGeometry.attributes.position.array;
  const stardustPosArr = stardustGeometry.attributes.position.array;
  let timer = 0;

  function animateScene() {
    requestAnimationFrame(animateScene);
    timer += 0.0035;

    // Smoothly ease scroll-warp stretch speed and decay target
    currentScrollSpeed += (scrollSpeedTarget - currentScrollSpeed) * 0.08;
    scrollSpeedTarget *= 0.88;

    // Dampen mouse movement to achieve a high-end elastic float transition
    mouse.x += (mouse.targetX - mouse.x) * 0.06;
    mouse.y += (mouse.targetY - mouse.y) * 0.06;

    camera.position.x = mouse.x * 20;
    camera.position.y = mouse.y * 15;
    camera.lookAt(scene.position);

    // Subtle ambient rotations of the star systems (Z-axis spin to keep the star shape visible, with static tilts on X/Y)
    starParticleSystem.rotation.z = timer * 0.08;
    starParticleSystem.rotation.x = 0.25;
    starParticleSystem.rotation.y = 0.15;

    stardustParticleSystem.rotation.z = -timer * 0.04;
    stardustParticleSystem.rotation.x = 0.25;
    stardustParticleSystem.rotation.y = 0.15;

    lineSystem.rotation.z = timer * 0.08;
    lineSystem.rotation.x = 0.25;
    lineSystem.rotation.y = 0.15;

    // 1. Update Star Particle positions (flow along pentagram segments)
    const activeStarPositions = [];
    for (let i = 0; i < starParticleCount; i++) {
      const data = starData[i];
      // Move along the segment
      data.t += data.speed * (1 + currentScrollSpeed * 3);
      if (data.t > 1) {
        data.t = 0;
        data.segIndex = (data.segIndex + 1) % 5; // Move to the next connected segment in sequence
      }

      const seg = starSegments[data.segIndex];
      const start = seg[0];
      const end = seg[1];

      // Base coordinate along line
      const baseX = start.x + data.t * (end.x - start.x);
      const baseY = start.y + data.t * (end.y - start.y);

      // Shimmering and scroll Z stretch offset
      const shimmer = Math.sin(timer * 2.5 + data.phase) * 0.35;
      const zOffset = data.offset.z + Math.sin(timer * 1.5 + data.phase) * currentScrollSpeed * 18;

      const px = baseX + data.offset.x + shimmer;
      const py = baseY + data.offset.y + shimmer;
      const pz = zOffset;

      starPosArr[i * 3] = px;
      starPosArr[i * 3 + 1] = py;
      starPosArr[i * 3 + 2] = pz;

      activeStarPositions.push(new THREE.Vector3(px, py, pz));
    }
    starGeometry.attributes.position.needsUpdate = true;

    // 2. Update Stardust Particle positions (orbiting dust)
    for (let i = 0; i < stardustParticleCount; i++) {
      const data = stardustData[i];
      data.angle += data.orbitSpeed * (1 + currentScrollSpeed * 2);

      const px = data.r * Math.cos(data.angle);
      const py = data.yOffset + Math.sin(timer * 0.6 + data.phase) * 2;
      const pz = data.r * Math.sin(data.angle);

      stardustPosArr[i * 3] = px;
      stardustPosArr[i * 3 + 1] = py;
      stardustPosArr[i * 3 + 2] = pz;
    }
    stardustGeometry.attributes.position.needsUpdate = true;

    // 3. Draw connection segments based on star particle proximity
    const linePosArr = lineGeometry.attributes.position.array;
    let currentLinesCount = 0;
    const maxConnectionDistance = window.innerWidth < 768 ? 10 : 13;

    // Reset line vertices
    for (let i = 0; i < linePosArr.length; i++) {
      linePosArr[i] = 0;
    }

    for (let i = 0; i < starParticleCount; i++) {
      const p1 = activeStarPositions[i];
      for (let j = i + 1; j < starParticleCount; j++) {
        const p2 = activeStarPositions[j];
        const dist = p1.distanceTo(p2);

        if (dist < maxConnectionDistance && currentLinesCount < maxConnections) {
          const baseIndex = currentLinesCount * 6;
          
          linePosArr[baseIndex] = p1.x;
          linePosArr[baseIndex + 1] = p1.y;
          linePosArr[baseIndex + 2] = p1.z;

          linePosArr[baseIndex + 3] = p2.x;
          linePosArr[baseIndex + 4] = p2.y;
          linePosArr[baseIndex + 5] = p2.z;

          currentLinesCount++;
        }
      }
    }

    lineGeometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  }

  animateScene();

  // Screen Resizing Event
  const onScreenResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  window.addEventListener("resize", debounce(onScreenResize, 150));
}

// 3D Glassmorphic Card Parallax and Tilt Effects
function initialize3DParallaxAndTilt() {
  const tiltElements = document.querySelectorAll(
    ".project-card, .skill-category, .stat-item, .experience-badge, .about-hero-image img, .certificate-item"
  );
  const heroImageContainer = document.querySelector(".hero-image .image-container");

  // 1. Generic Card Tilt handler
  tiltElements.forEach((element) => {
    element.classList.add("tilt-card");

    // Wrap card's internal content to provide perspective translation depth
    const children = Array.from(element.children);
    const wrapper = document.createElement("div");
    wrapper.className = "tilt-card-content";
    
    while (element.firstChild) {
      wrapper.appendChild(element.firstChild);
    }
    element.appendChild(wrapper);

    element.addEventListener("mousemove", (e) => {
      const rect = element.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;

      const percentX = relativeX / rect.width;
      const percentY = relativeY / rect.height;

      // Max tilt degrees
      const maxTilt = 16;
      const tiltX = (percentY - 0.5) * -maxTilt;
      const tiltY = (percentX - 0.5) * maxTilt;

      element.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
      
      // Update variables for shine spotlight
      element.style.setProperty("--shine-x", `${percentX * 100}%`);
      element.style.setProperty("--shine-y", `${percentY * 100}%`);
    });

    element.addEventListener("mouseleave", () => {
      element.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    });
  });

  // 2. Specialized Profile Holographic Depth
  if (heroImageContainer) {
    heroImageContainer.classList.add("tilt-card");
    const floatingBadge = heroImageContainer.querySelector(".floating-card");

    heroImageContainer.addEventListener("mousemove", (e) => {
      const rect = heroImageContainer.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;

      const percentX = relativeX / rect.width;
      const percentY = relativeY / rect.height;

      const tiltX = (percentY - 0.5) * -20;
      const tiltY = (percentX - 0.5) * 20;

      heroImageContainer.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.04, 1.04, 1.04)`;

      heroImageContainer.style.setProperty("--shine-x", `${percentX * 100}%`);
      heroImageContainer.style.setProperty("--shine-y", `${percentY * 100}%`);

      // Translate the floating badge in opposite coordinate to emphasize a separate Z depth layer
      if (floatingBadge) {
        const badgeTranslateX = (percentX - 0.5) * -25;
        const badgeTranslateY = (percentY - 0.5) * -25;
        floatingBadge.style.transform = `translateZ(50px) translateX(${badgeTranslateX}px) translateY(${badgeTranslateY}px)`;
      }
    });

    heroImageContainer.addEventListener("mouseleave", () => {
      heroImageContainer.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      if (floatingBadge) {
        floatingBadge.style.transform = "translateZ(40px) translateX(0px) translateY(0px)";
      }
    });
  }
}

// WebGL Interactive Skills Tag Sphere (Fibonacci distribution with inertia drag physics)
function initializeSkillsTagSphere() {
  const container = document.getElementById("skills-3d-container");
  const canvas = document.getElementById("skills-3d-canvas");
  if (!container || !canvas) return;

  const ctx = canvas.getContext("2d");
  
  // Tag cloud content representing Hatim's professional domain
  const skillTags = [
    "React", "Vue.js", "Spring Boot", "Python", "TypeScript", 
    "Docker", "Git/GitHub", "MySQL", "Java EE", "NoSQL", 
    "Tailwind CSS", "Scikit-learn", "Machine Learning", "REST APIs", "Data Science"
  ];
  
  const numTags = skillTags.length;
  const tags = [];
  const R = 135; // Sphere Radius

  // Distribute tags uniformly across a sphere using Fibonacci spiral projection
  for (let i = 0; i < numTags; i++) {
    const k = -1 + (2 * i + 1) / numTags;
    const theta = Math.acos(k);
    const phi = Math.sqrt(numTags * Math.PI) * theta;

    tags.push({
      text: skillTags[i],
      x: R * Math.sin(theta) * Math.cos(phi),
      y: R * Math.sin(theta) * Math.sin(phi),
      z: R * Math.cos(theta),
      screenX: 0,
      screenY: 0,
      scale: 1,
      opacity: 1,
      hovered: false,
      glowIntensity: 0
    });
  }

  // Physics rotation states
  let angleX = 0.0035; // Ambient rotation speed
  let angleY = 0.0035;
  let targetAngleX = 0.0035;
  let targetAngleY = 0.0035;
  
  let isDragging = false;
  let startMouseX = 0;
  let startMouseY = 0;
  
  let mouseCanvasX = -1000;
  let mouseCanvasY = -1000;

  // Adapt sizing to device pixel ratio
  let width = container.clientWidth;
  let height = container.clientHeight;
  
  const resizeCanvas = () => {
    width = container.clientWidth;
    height = container.clientHeight;
    
    // Scale canvas buffer matching client layout sizes
    canvas.width = width;
    canvas.height = height;
  };
  
  resizeCanvas();
  window.addEventListener("resize", debounce(resizeCanvas, 150));

  // Rotate points in 3D matrices
  function rotate3D(tag, rotX, rotY) {
    // 1. Rotate Y Axis
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x1 = tag.x * cosY - tag.z * sinY;
    const z1 = tag.z * cosY + tag.x * sinY;

    // 2. Rotate X Axis
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const y2 = tag.y * cosX - z1 * sinX;
    const z2 = z1 * cosX + tag.y * sinX;

    tag.x = x1;
    tag.y = y2;
    tag.z = z2;
  }

  // Interaction handlers
  canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    startMouseX = e.clientX;
    startMouseY = e.clientY;
    canvas.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseCanvasX = e.clientX - rect.left;
    mouseCanvasY = e.clientY - rect.top;

    if (!isDragging) return;

    // Drag torque translation
    const deltaX = e.clientX - startMouseX;
    const deltaY = e.clientY - startMouseY;
    
    targetAngleY = deltaX * 0.00018;
    targetAngleX = -deltaY * 0.00018;
    
    startMouseX = e.clientX;
    startMouseY = e.clientY;
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
    canvas.style.cursor = "grab";
  });

  // Touch controls for screen dragging compatibility
  canvas.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      startMouseX = e.touches[0].clientX;
      startMouseY = e.touches[0].clientY;
    }
  });

  canvas.addEventListener("touchmove", (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    
    const rect = canvas.getBoundingClientRect();
    mouseCanvasX = e.touches[0].clientX - rect.left;
    mouseCanvasY = e.touches[0].clientY - rect.top;

    const deltaX = e.touches[0].clientX - startMouseX;
    const deltaY = e.touches[0].clientY - startMouseY;

    targetAngleY = deltaX * 0.00028;
    targetAngleX = -deltaY * 0.00028;

    startMouseX = e.touches[0].clientX;
    startMouseY = e.touches[0].clientY;
  });

  canvas.addEventListener("touchend", () => {
    isDragging = false;
  });

  // Dynamic contrast configuration
  const getTagColor = (hovered, glow) => {
    const isDark = document.body.getAttribute("data-theme") === "dark";
    if (hovered) {
      return isDark ? "#ffffff" : "#000000"; // Highlight color upon hovers (White/Black)
    }
    // Return colors with contrasting gradients depending on theme states
    if (isDark) {
      // Shading to soft whites
      return `rgba(255, 255, 255, ${0.4 + glow * 0.6})`;
    } else {
      // Shading to charcoal
      return `rgba(26, 26, 26, ${0.4 + glow * 0.6})`;
    }
  };

  // Rendering Loop
  function drawTags() {
    requestAnimationFrame(drawTags);

    ctx.clearRect(0, 0, width, height);

    // Apply kinetic deceleration friction (organic damping)
    if (!isDragging) {
      targetAngleX += (0.0018 - targetAngleX) * 0.04;
      targetAngleY += (0.0018 - targetAngleY) * 0.04;
    }

    angleX += (targetAngleX - angleX) * 0.08;
    angleY += (targetAngleY - angleY) * 0.08;

    // Projection focal length depth
    const depth = 280;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // Rotate points
    tags.forEach(tag => {
      rotate3D(tag, angleX, angleY);

      // Perspective scale calculations
      const perspectiveScale = depth / (depth + tag.z);
      tag.scale = perspectiveScale;
      
      // Calculate opacity shading matching depth layering
      tag.opacity = Math.max(0.18, Math.min(1.0, (depth - tag.z) / (depth * 1.5)));

      tag.screenX = halfWidth + tag.x * perspectiveScale;
      tag.screenY = halfHeight + tag.y * perspectiveScale;
    });

    // Sort nodes dynamically matching Z value (Painters layering algorithm)
    const sortedTags = [...tags].sort((a, b) => b.z - a.z);

    // Render text to canvas buffer
    sortedTags.forEach(tag => {
      // Base tag font sizing scaled by depth projection
      const baseFontSize = window.innerWidth < 768 ? 12 : 15;
      const fontSize = Math.round(baseFontSize * tag.scale * (tag.hovered ? 1.25 : 1.0));
      
      ctx.font = `${tag.hovered ? "700" : "500"} ${fontSize}px var(--font-family)`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Detect cursor coordinate overlap inside text bounding boxes
      const textWidth = ctx.measureText(tag.text).width;
      const textHeight = fontSize;
      
      const isMouseOver = 
        mouseCanvasX >= tag.screenX - textWidth / 2 - 8 &&
        mouseCanvasX <= tag.screenX + textWidth / 2 + 8 &&
        mouseCanvasY >= tag.screenY - textHeight / 2 - 6 &&
        mouseCanvasY <= tag.screenY + textHeight / 2 + 6;

      tag.hovered = isMouseOver;

      // Glow metrics easing
      if (tag.hovered) {
        tag.glowIntensity += (1.0 - tag.glowIntensity) * 0.15;
        // Pause auto rotation if hovered to ease click-through highlights
        if (!isDragging) {
          targetAngleX *= 0.85;
          targetAngleY *= 0.85;
        }
      } else {
        tag.glowIntensity += (0.0 - tag.glowIntensity) * 0.15;
      }

      // Draw shadow glow backdrop underneath active nodes
      if (tag.glowIntensity > 0.01) {
        const isDark = document.body.getAttribute("data-theme") === "dark";
        ctx.shadowColor = isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = Math.round(15 * tag.glowIntensity * tag.scale);
      } else {
        ctx.shadowBlur = 0;
      }

      // Paint tag text matching theme specifications
      ctx.fillStyle = getTagColor(tag.hovered, tag.opacity);
      ctx.fillText(tag.text, tag.screenX, tag.screenY);
      
      // Reset canvas contexts for successive buffers
      ctx.shadowBlur = 0;
    });
  }

  drawTags();
}

// Scroll-Driven CSS 3D Viewport entry tilts (cylindrical scrolling mesh)
function initializeScrollDrivenPerspective() {
  const sections = document.querySelectorAll(
    ".hero-section, .about-section, .skills-section, .projects-section, .contact-section, .about-page section"
  );
  
  if (sections.length === 0) return;

  function performScrollTransformations() {
    const viewportHeight = window.innerHeight;
    const viewportCenter = viewportHeight / 2;

    sections.forEach((section) => {
      // Inject scroll class if missing
      if (!section.classList.contains("scroll-3d-section")) {
        section.classList.add("scroll-3d-section");
      }

      const rect = section.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      
      // Calculate delta distance relative to screen centers
      const delta = sectionCenter - viewportCenter;
      
      // Compute delta ratio bounded between -1 and 1
      const ratio = Math.max(-1, Math.min(1, delta / viewportHeight));

      // Map scale limits and perspective tilt angles
      const maxTiltAngle = window.innerWidth < 768 ? 6 : 9; // Subtle tilts
      const currentTiltX = ratio * maxTiltAngle;
      
      // Make elements fade out slightly as they exit viewport boundaries
      const opacityFactor = 1 - Math.abs(ratio) * 0.18;

      // Apply perspective matrix transformations elastically
      section.style.transform = `perspective(1200px) rotateX(${currentTiltX}deg) translateZ(0px)`;
      section.style.opacity = `${opacityFactor}`;
    });
  }

  // Bind throttle event triggers
  window.addEventListener("scroll", performScrollTransformations);
  // Perform immediate setup invocation
  performScrollTransformations();
}

// The profile is hydrated dynamically by the fetchDynamicProfile function at the top of this file.


