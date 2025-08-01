const fileInput = document.getElementById("fileInput");
const thumbnails = document.getElementById("thumbnails");
const viewer = document.getElementById("viewer");
const storyImage = document.getElementById("storyImage");
const progressBars = document.getElementById("progressBars");
const deleteBtn = document.getElementById("deleteBtn");
const menuBtn = document.getElementById("menuBtn");
const menuOptions = document.getElementById("menuOptions");
const shareBtn = document.getElementById("shareBtn");

let stories = JSON.parse(localStorage.getItem("stories") || "[]").filter(
  s => Date.now() - s.time < 86400000
);
let currentIndex = 0;
let interval;

function saveStories() {
  localStorage.setItem("stories", JSON.stringify(stories));
}

function renderThumbnails() {
  thumbnails.innerHTML = "";
  stories.forEach((s, i) => {
    const img = document.createElement("img");
    img.src = s.img;
    img.onclick = () => openViewer(i);
    thumbnails.appendChild(img);
  });
}

function openViewer(index) {
  currentIndex = index;
  viewer.style.display = "flex";
  renderProgress();
  playStory();
}

function renderProgress() {
  progressBars.innerHTML = "";
  stories.forEach((_, i) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.id = `bar-${i}`;
    fill.style.width = i < currentIndex ? "100%" : "0%";
    bar.appendChild(fill);
    progressBars.appendChild(bar);
  });
}

function playStory() {
  storyImage.src = stories[currentIndex].img;

  clearInterval(interval);
  let fill = document.getElementById(`bar-${currentIndex}`);
  let width = 0;
  if (fill) fill.style.width = "0%";

  interval = setInterval(() => {
    width += 1;
    if (fill) fill.style.width = width + "%";

    if (width >= 100) {
      clearInterval(interval);
      if (currentIndex < stories.length - 1) {
        currentIndex++;
        renderProgress();
        playStory();
      } else {
        viewer.style.display = "none";
      }
    }
  }, 30); // ~3s
}

fileInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    stories.unshift({ img: reader.result, time: Date.now() });
    saveStories();
    renderThumbnails();
  };
  reader.readAsDataURL(file);
};

viewer.addEventListener("click", (e) => {
  const bounds = viewer.getBoundingClientRect();
  const clickX = e.clientX - bounds.left;

  if (clickX < bounds.width / 2 && currentIndex > 0) {
    currentIndex--;
  } else if (clickX >= bounds.width / 2 && currentIndex < stories.length - 1) {
    currentIndex++;
  } else {
    viewer.style.display = "none";
    return;
  }

  renderProgress();
  playStory();
});

let startX = 0;
viewer.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});
viewer.addEventListener("touchend", (e) => {
  const delta = e.changedTouches[0].clientX - startX;

  if (Math.abs(delta) > 30) {
    if (delta > 0 && currentIndex > 0) {
      currentIndex--;
    } else if (delta < 0 && currentIndex < stories.length - 1) {
      currentIndex++;
    } else {
      viewer.style.display = "none";
      return;
    }

    renderProgress();
    playStory();
  }
});

renderThumbnails();

deleteBtn.onclick = () => {
  if (confirm("Are you sure you want to delete this story?")) {
    stories.splice(currentIndex, 1);
    saveStories();
    renderThumbnails();

    if (stories.length === 0) {
      viewer.style.display = "none";
    } else {
      if (currentIndex >= stories.length) {
        currentIndex = stories.length - 1;
      }
      renderProgress();
      playStory();
    }
  }
};
menuBtn.onclick = (e) => {
  e.stopPropagation();
  menuOptions.classList.toggle("hidden");
};

// Close menu if clicking outside
document.addEventListener("click", (e) => {
  if (!menuOptions.classList.contains("hidden")) {
    menuOptions.classList.add("hidden");
  }
});
deleteBtn.onclick = () => {
  if (confirm("Are you sure you want to delete this story?")) {
    stories.splice(currentIndex, 1);
    saveStories();
    renderThumbnails();

    menuOptions.classList.add("hidden");

    if (stories.length === 0) {
      viewer.style.display = "none";
    } else {
      if (currentIndex >= stories.length) {
        currentIndex = stories.length - 1;
      }
      renderProgress();
      playStory();
    }
  }
};
shareBtn.onclick = () => {
  const story = stories[currentIndex];
  menuOptions.classList.add("hidden");

  if (navigator.share) {
    navigator
      .share({
        title: "My Story",
        text: "Check out this story!",
        url: story.img,
      })
      .catch(console.error);
  } else {
    alert("Sharing is not supported in this browser.");
  }
};
