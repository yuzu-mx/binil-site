const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const resultsGrid = document.getElementById("resultsGrid");
const resultsCount = document.getElementById("resultsCount");
const showAllBtn = document.getElementById("showAllBtn");
const allGrid = document.getElementById("allGrid");
const allCount = document.getElementById("allCount");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");
const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeImageModalBtn = document.getElementById("closeImageModal");
const statusFilter = document.getElementById("statusFilter");
const artistFilter = document.getElementById("artistFilter");
const resetFiltersBtn = document.getElementById("resetFilters");

let records = [];
let fuse = null;
let currentPage = 1;
const PAGE_SIZE = 20;

const fallbackCover =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
      <rect width='400' height='400' fill='#DDD66B'/>
      <text x='50%' y='50%' text-anchor='middle' fill='#222D00' font-size='24' font-family='Arial' dy='.35em'>Sin portada</text>
    </svg>`
  );


function formatRecord(record) {
  const imageField = record.fields.Images && record.fields.Images[0];
  const thumb =
    (imageField &&
      imageField.thumbnails &&
      (imageField.thumbnails.large?.url ||
        imageField.thumbnails.small?.url ||
        imageField.thumbnails.full?.url)) ||
    "";
  const rawGender = record.fields["Gender"];
  const genderValue = Array.isArray(rawGender)
    ? rawGender.join(", ")
    : rawGender && typeof rawGender === "object"
      ? rawGender.name || rawGender.value || rawGender.text || rawGender.result || ""
      : rawGender || "";

  return {
    id: record.id,
    album: record.fields["Album Name"] || "Sin título",
    year: record.fields["Album Year"] || "",
    artist: record.fields["Artist"] || "",
    status: record.fields["Status"] || "",
    gift: record.fields["Gift"] || "",
    gender: genderValue,
    rating: record.fields["Rating"] || 0,
    image: thumb || (imageField && imageField.url) || fallbackCover,
  };
}

function renderCards(target, items) {
  target.innerHTML = "";
  if (!items.length) {
    target.innerHTML = "<p>No hay resultados aún.</p>";
    return;
  }

  items.forEach((item) => {
    const statusLabel = item.status
      ? item.status === "Wishlist"
        ? `💫 ${item.status}`
        : `✅ ${item.status}`
      : "";
    const card = document.createElement("article");
    const giftLabel = item.gift ? `🎁 ${item.gift}` : "";
    const genderLabel = item.gender ? `✨ ${item.gender}` : "";
    const rating = Number(item.rating) || 0;
    const stars = "★★★★★"
      .split("")
      .map((star, idx) => (idx < rating ? "★" : "☆"))
      .join("");
    card.className = "card";
    card.innerHTML = `
      <div class="image-wrap skeleton" data-image="${item.image}">
        <img src="${item.image}" alt="${item.album}" loading="lazy" decoding="async" />
      </div>
      <div class="card-body">
        <div class="card-top">
          <div>
            <h3>${item.album}</h3>
            <p>${item.artist}</p>
          </div>
          ${
            rating
              ? `<div class="rating"><span class="stars">${stars}</span><span class="score">${rating}</span></div>`
              : ""
          }
        </div>
        <div class="meta">
          ${item.year ? `<span class="chip">${item.year}</span>` : ""}
          ${statusLabel ? `<span class="chip">${statusLabel}</span>` : ""}
          ${giftLabel ? `<span class="chip">${giftLabel}</span>` : ""}
          ${genderLabel ? `<span class="chip">${genderLabel}</span>` : ""}
        </div>
      </div>
    `;
    const img = card.querySelector("img");
    const wrap = card.querySelector(".image-wrap");
    if (img && wrap) {
      img.addEventListener("load", () => {
        wrap.classList.remove("skeleton");
      });
    }
    target.appendChild(card);
  });
}

function updateResults(query) {
  if (!query) {
    resultsGrid.innerHTML = "";
    resultsCount.textContent = "0 resultados";
    clearSearchBtn.classList.remove("visible");
    return;
  }
  clearSearchBtn.classList.add("visible");
  const matches = fuse.search(query).map((result) => result.item);
  renderCards(resultsGrid, matches);
  resultsCount.textContent = `${matches.length} resultados`;
}

function updateAllRecords() {
  const filtered = records.filter((item) => {
    const statusOk = !statusFilter.value || item.status === statusFilter.value;
    const artistOk = !artistFilter.value || item.artist === artistFilter.value;
    return statusOk && artistOk;
  });
  const filtersActive = Boolean(statusFilter.value || artistFilter.value);
  resetFiltersBtn.hidden = !filtersActive;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  currentPage = Math.min(currentPage, totalPages);

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  renderCards(allGrid, pageItems);
  allCount.textContent = `${filtered.length} registros`;
  pageInfo.textContent = `${currentPage} de ${totalPages}`;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  prevPageBtn.hidden = !hasPrev;
  nextPageBtn.hidden = !hasNext;
}

function populateFilters() {
  const statuses = Array.from(new Set(records.map((r) => r.status).filter(Boolean))).sort();
  const artists = Array.from(new Set(records.map((r) => r.artist).filter(Boolean))).sort();

  statusFilter.innerHTML = "<option value=\"\">Todos</option>";
  statuses.forEach((status) => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    statusFilter.appendChild(option);
  });

  artistFilter.innerHTML = "<option value=\"\">Todos</option>";
  artists.forEach((artist) => {
    const option = document.createElement("option");
    option.value = artist;
    option.textContent = artist;
    artistFilter.appendChild(option);
  });
}

async function fetchRecords() {
  // no status pill
  try {
    const response = await fetch("/.netlify/functions/airtable");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error al cargar");

    records = data.records.map(formatRecord);
    records.sort((a, b) => a.artist.localeCompare(b.artist));

    fuse = new Fuse(records, {
      keys: ["album", "artist", "year", "status"],
      threshold: 0.35,
      distance: 80,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });

    populateFilters();
    updateAllRecords();
    // loaded
  } catch (error) {
    console.error(error);
  }
}

searchBtn.addEventListener("click", () => {
  updateResults(searchInput.value.trim());
  document.getElementById("results").scrollIntoView({ behavior: "smooth" });
});

searchInput.addEventListener("input", (event) => {
  updateResults(event.target.value.trim());
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    updateResults(searchInput.value.trim());
    document.getElementById("results").scrollIntoView({ behavior: "smooth" });
  }
});

clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  updateResults("");
  searchInput.focus();
});

function openImageModal(src, alt) {
  if (!imageModal || !modalImage) return;
  modalImage.src = src;
  modalImage.alt = alt || "Vinil";
  imageModal.hidden = false;
}

function closeImageModal() {
  if (!imageModal) return;
  imageModal.hidden = true;
  if (modalImage) {
    modalImage.src = "";
  }
}

if (closeImageModalBtn) {
  closeImageModalBtn.addEventListener("click", closeImageModal);
}

if (imageModal) {
  imageModal.addEventListener("click", (event) => {
    if (event.target.dataset && event.target.dataset.close === "true") {
      closeImageModal();
    }
  });
}

document.addEventListener("click", (event) => {
  const wrap = event.target.closest && event.target.closest(".image-wrap");
  if (!wrap) return;
  const img = wrap.querySelector("img");
  const src = wrap.getAttribute("data-image");
  if (src) {
    openImageModal(src, img ? img.alt : "Vinil");
  }
});


showAllBtn.addEventListener("click", () => {
  document.getElementById("allRecords").scrollIntoView({ behavior: "smooth" });
});

prevPageBtn.addEventListener("click", () => {
  currentPage -= 1;
  updateAllRecords();
  document.getElementById("allRecords").scrollIntoView({ behavior: "smooth" });
});

nextPageBtn.addEventListener("click", () => {
  currentPage += 1;
  updateAllRecords();
  document.getElementById("allRecords").scrollIntoView({ behavior: "smooth" });
});

statusFilter.addEventListener("change", () => {
  currentPage = 1;
  updateAllRecords();
});

artistFilter.addEventListener("change", () => {
  currentPage = 1;
  updateAllRecords();
});

resetFiltersBtn.addEventListener("click", () => {
  statusFilter.value = "";
  artistFilter.value = "";
  currentPage = 1;
  updateAllRecords();
});

fetchRecords();
