const SUPABASE_URL = "https://neiskgzufuvhxcexbmzs.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5laXNrZ3p1ZnV2aHhjZXhibXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4ODYwODcsImV4cCI6MjA2OTQ2MjA4N30.NDqe7az36l7vgLu8S7C4vw03TVkduT_cKpzJWw1nsZQ";
const BUCKET = "gallery";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
  const galleryGrid = document.querySelector(".gallery-grid");
  const filterButtons = document.querySelectorAll(".filter-btn");
  let imagesData = [];
  // ================= Watch Portfolio Button =================
// ================= Watch Portfolio Button =================
const watchButton = document.querySelector(".hero-buttons .secondary");

watchButton.addEventListener("click", () => {
  const watchVideos = imagesData.filter(item => item.category === "watch" && item.isVideo);
  if (watchVideos.length === 0) {
    alert("No Watch Portfolio videos available yet.");
    return;
  }

  // Clear lightbox and make it active
  lightbox.innerHTML = '<span id="lightbox-close">&times;</span>';
  lightbox.classList.add('active');

  // Fullscreen container
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexWrap = "wrap";
  container.style.justifyContent = "center";
  container.style.gap = "20px";
  container.style.padding = "20px";
  container.style.maxHeight = "90vh"; // full-screen height minus some padding
  container.style.overflowY = "auto";

  // Add each video
  watchVideos.forEach(item => {
    const videoWrapper = document.createElement("div");
    videoWrapper.style.flex = "0 1 300px";
    videoWrapper.style.cursor = "pointer";

    const video = document.createElement("video");
    video.src = item.url;
    video.controls = false;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.style.width = "100%";
    video.style.height = "200px";
    video.style.objectFit = "cover";
    video.style.borderRadius = "8px";
    video.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";

    // Click to open zoomable lightbox
    video.addEventListener("click", () => openLightbox(item.url, true));

    videoWrapper.appendChild(video);
    container.appendChild(videoWrapper);
    // ================= Navbar Toggle =================
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
});

  });

  lightbox.appendChild(container);

  // Close button
  document.getElementById('lightbox-close').onclick = closeLightbox;
  lightbox.onclick = (e) => { if (e.target === lightbox) closeLightbox(); };
});


  // ================= Lightbox Setup =================
  // Use the existing lightbox from index.html
  const lightbox = document.getElementById("lightbox");

  function openLightbox(url, isVideo) {
    lightbox.innerHTML = `<span class="close-btn" id="lightbox-close">&times;</span>` +
                         (isVideo ? `<video src="${url}" controls autoplay></video>` 
                                  : `<img src="${url}" alt="Preview Image">`);
    lightbox.classList.add('active');

    const media = lightbox.querySelector('img, video');

    // Zoom using mouse wheel
    let scale = 1;
    media.onwheel = (e) => {
      e.preventDefault();
      scale += e.deltaY * -0.001;
      scale = Math.min(Math.max(.5, scale), 3);
      media.style.transform = `scale(${scale})`;
    };

    // Drag to move image/video
    let isDragging = false, startX, startY, currentX = 0, currentY = 0;
    media.onmousedown = (e) => {
      isDragging = true;
      startX = e.clientX - currentX;
      startY = e.clientY - currentY;
      media.style.cursor = "grabbing";
    };
    document.onmouseup = () => { isDragging = false; media.style.cursor = "grab"; };
    document.onmousemove = (e) => {
      if (!isDragging) return;
      currentX = e.clientX - startX;
      currentY = e.clientY - startY;
      media.style.transform = `scale(${scale}) translate(${currentX}px, ${currentY}px)`;
    };

    // Always attach close event after showing lightbox
    const closeBtn = document.getElementById('lightbox-close');
    if (closeBtn) closeBtn.onclick = closeLightbox;
    lightbox.onclick = (e) => { if (e.target === lightbox) closeLightbox(); };
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.innerHTML = '<span class="close-btn" id="lightbox-close">&times;</span>';
  }

  // ================= Helpers =================
  function detectCategoryAndProject(filename) {
    const lower = filename.toLowerCase();
    let category = "all";
    let project = "default";
    
    if (lower.includes("living")) category = "living";
    else if (lower.includes("bedroom")) category = "bedroom";
    else if (lower.includes("kitchen")) category = "kitchen";
    else if (lower.includes("puja")) category = "puja";
    else if (lower.includes("turnkey")) category = "turnkey";
    else if (lower.includes("watch")) category = "watch"; // Watch Portfolio

    if (category === "living") {
      const projectMatch = lower.match(/project(\d+)/);
      if (projectMatch) project = `project${projectMatch[1]}`;
    }

    return { category, project };
  }

  function isVideo(filename) {
    return /\.(mp4|mov|avi|wmv|flv|webm)$/i.test(filename);
  }

  function isImage(filename) {
    return /\.(jpeg|jpg|png|gif|webp)$/i.test(filename);
  }

  // ================= Fetch Images =================
  async function fetchImages() {
    galleryGrid.innerHTML = "<p style='text-align: center; color: #666;'>Loading gallery...</p>";
    
    const { data, error } = await supabase.storage.from(BUCKET).list('', { limit: 100 });
    if (error || !data) {
      galleryGrid.innerHTML = "<p style='text-align:center;color:red;'>Failed to load gallery.</p>";
      return;
    }

    imagesData = data.map(file => {
      const { category, project } = detectCategoryAndProject(file.name);
      return {
        url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${file.name}`,
        category,
        project,
        isVideo: isVideo(file.name),
        isImage: isImage(file.name),
        filename: file.name
      };
    }).filter(item => item.isVideo || item.isImage);

    renderImages("all");
  }

  // ================= Render =================
  function renderImages(filter) {
    galleryGrid.innerHTML = "";
    const filtered = imagesData.filter(img => filter === "all" || img.category === filter);
    
    if (filtered.length === 0) {
      galleryGrid.innerHTML = "<p style='text-align:center;color:#999;'>No media found in this category.</p>";
      return;
    }
    
    if (filter === "living") {
      const projects = {};
      filtered.forEach(item => {
        if (!projects[item.project]) projects[item.project] = [];
        projects[item.project].push(item);
      });

      Object.keys(projects).forEach(projectName => {
        const projectHeader = document.createElement("h3");
        projectHeader.className = "project-header clickable-project";
        projectHeader.textContent = projectName.charAt(0).toUpperCase() + projectName.slice(1).replace(/([A-Z])/g, ' $1');
        galleryGrid.appendChild(projectHeader);

        const projectContainer = document.createElement("div");
        projectContainer.className = "project-container";
        projectContainer.style.display = "flex";
        projectContainer.style.flexWrap = "wrap";
        projectContainer.style.gap = "10px";

        projects[projectName].forEach(item => {
          const mediaElement = createMediaElement(item);
          projectContainer.appendChild(mediaElement);
        });

        galleryGrid.appendChild(projectContainer);

        projectHeader.addEventListener("click", () => {
          projectContainer.style.display = projectContainer.style.display === "none" ? "flex" : "none";
        });
      });
    } else if (filter === "watch") {
      const watchVideos = filtered.filter(item => item.isVideo);
      if (watchVideos.length === 0) {
        galleryGrid.innerHTML = "<p style='text-align:center;color:#999;'>No Watch Portfolio videos yet.</p>";
        return;
      }

      const sectionHeader = document.createElement("h3");
      sectionHeader.className = "project-header";
      sectionHeader.textContent = "Watch Portfolio";
      galleryGrid.appendChild(sectionHeader);

      const sectionContainer = document.createElement("div");
      sectionContainer.className = "project-container";
      sectionContainer.style.display = "flex";
      sectionContainer.style.flexWrap = "wrap";
      sectionContainer.style.gap = "10px";

      watchVideos.forEach(item => {
        const mediaElement = createMediaElement(item);
        sectionContainer.appendChild(mediaElement);
      });

      galleryGrid.appendChild(sectionContainer);
    } else {
      filtered.forEach(item => {
        const mediaElement = createMediaElement(item);
        galleryGrid.appendChild(mediaElement);
      });
    }
  }

  function createMediaElement(item) {
    const div = document.createElement("div");
    div.className = "gallery-item fade-in";
    div.setAttribute("data-category", item.category);
    div.style.flex = "0 1 calc(33.33% - 10px)";
    div.style.boxSizing = "border-box";

    if (item.isVideo) {
      const video = document.createElement("video");
      video.src = item.url;
      video.controls = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.style.width = "100%";
      video.style.height = "200px";
      video.style.objectFit = "cover";

      const playButton = document.createElement("div");
      playButton.className = "video-play-button";
      playButton.innerHTML = '<i class="fas fa-play"></i>';
      playButton.addEventListener('click', () => {
        if (video.paused) {
          video.play();
          playButton.style.display = 'none';
        } else {
          video.pause();
          playButton.style.display = 'flex';
        }
      });
      video.addEventListener('play', () => { playButton.style.display = 'none'; });
      video.addEventListener('pause', () => { playButton.style.display = 'flex'; });

      // Open video in lightbox
      video.addEventListener('click', () => openLightbox(item.url, true));

      div.appendChild(video);
      div.appendChild(playButton);
    } else if (item.isImage) {
      const img = document.createElement("img");
      img.src = item.url;
      img.alt = `${item.category} image`;
      img.loading = "lazy";
      img.style.width = "100%";
      img.style.height = "200px";
      img.style.objectFit = "cover";
      img.onerror = function() { div.remove(); };

      // Open image in lightbox
      img.addEventListener('click', () => openLightbox(item.url, false));

      div.appendChild(img);
    }

    return div;
  }

  // ================= Filter Buttons =================
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
s
// Navigation hamburger toggle for mobile
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  // Toggle menu on click
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', navMenu.classList.contains('active'));
  });
  // Toggle menu on Enter/Space
  hamburger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navMenu.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', navMenu.classList.contains('active'));
    }
  });
  // Close menu when clicking a link (mobile UX)
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        navMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  });
});
s