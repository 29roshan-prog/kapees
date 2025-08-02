// ================= Supabase Setup =================
const SUPABASE_URL = "https://neiskgzufuvhxcexbmzs.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5laXNrZ3p1ZnV2aHhjZXhibXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4ODYwODcsImV4cCI6MjA2OTQ2MjA4N30.NDqe7az36l7vgLu8S7C4vw03TVkduT_cKpzJWw1nsZQ";
const BUCKET = "gallery";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ================= DOMContentLoaded Setup =================
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });
  document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
  }));

  // Smooth Scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Navbar Scroll Effect
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
      navbar.style.background = 'rgba(255, 255, 255, 0.98)';
      navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
      navbar.style.background = 'rgba(255, 255, 255, 0.95)';
      navbar.style.boxShadow = 'none';
    }
  });

  // Fade-In Animations
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, observerOptions);
  document.querySelectorAll('.service-card, .about-text, .about-image, .contact-info, .contact-form, .section-title')
    .forEach(el => {
      el.classList.add('fade-in');
      observer.observe(el);
    });

  // Contact Form Submission (Simulated)
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = this.querySelector('input[type="text"]').value;
      const email = this.querySelector('input[type="email"]').value;
      const subject = this.querySelector('input[type="text"]:nth-of-type(2)').value;
      const message = this.querySelector('textarea').value;
      const button = this.querySelector('button');
      const originalText = button.textContent;

      if (name && email && subject && message) {
        button.textContent = 'Sending...';
        button.disabled = true;
        setTimeout(() => {
          button.textContent = 'Message Sent!';
          button.style.background = '#27ae60';
          this.reset();
          setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
            button.style.background = 'linear-gradient(45deg, #e74c3c, #c0392b)';
          }, 3000);
        }, 2000);
      } else {
        alert('Please fill in all fields');
      }
    });
  }

  // Parallax Scroll
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
      heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
  });

  // CTA Button Scroll
  const ctaButton = document.querySelector('.cta-button');
  if (ctaButton) {
    ctaButton.addEventListener('click', () => {
      document.querySelector('#gallery').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Page Load
  window.addEventListener('load', () => {
    document.body.classList.add('loaded');
  });

  // Stats Counter
  const animateCounters = () => {
    const counters = document.querySelectorAll('.stat-item h3');
    counters.forEach(counter => {
      const target = parseInt(counter.textContent);
      const increment = target / 100;
      let current = 0;
      const updateCounter = () => {
        if (current < target) {
          current += increment;
          counter.textContent = Math.ceil(current) + '+';
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target + '+';
        }
      };
      updateCounter();
    });
  };
  const aboutSection = document.querySelector('.about');
  if (aboutSection) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counterObserver.observe(aboutSection);
  }

  // Lazy Load Images
  const images = document.querySelectorAll('img');
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('loaded');
          imageObserver.unobserve(entry.target);
        }
      });
    });
    images.forEach(img => imageObserver.observe(img));
  }

  // Gallery Loader from Supabase
  const galleryGrid = document.querySelector(".gallery-grid");
  const filterButtons = document.querySelectorAll(".filter-btn");
  let imagesData = [];

  function detectCategory(filename) {
    const lower = filename.toLowerCase();
    if (lower.includes("living")) return "living";
    if (lower.includes("bedroom")) return "bedroom";
    if (lower.includes("kitchen")) return "kitchen";
    if (lower.includes("office")) return "office";
    return "all";
  }

  async function fetchImages() {
    const { data, error } = await supabase.storage.from(BUCKET).list('', { limit: 100 });
    if (error || !data) {
      galleryGrid.innerHTML = "<p style='text-align:center;color:red;'>Failed to load gallery.</p>";
      return;
    }

    imagesData = data.map(file => ({
      url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${file.name}`,
      category: detectCategory(file.name)
    }));

    renderImages("all");
  }

  function renderImages(filter) {
    galleryGrid.innerHTML = "";
    const filtered = imagesData.filter(img => filter === "all" || img.category === filter);
    if (filtered.length === 0) {
      galleryGrid.innerHTML = "<p style='text-align:center;color:#999;'>No images found in this category.</p>";
      return;
    }
    filtered.forEach(img => {
      const div = document.createElement("div");
      div.className = "gallery-item fade-in";
      div.setAttribute("data-category", img.category);
      div.innerHTML = `<img src="${img.url}" alt="${img.category} image" loading="lazy" />`;
      galleryGrid.appendChild(div);
    });
  }

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      filterButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      const filter = button.getAttribute("data-filter");
      renderImages(filter);
    });
  });

  fetchImages();
});
