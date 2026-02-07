const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const statusPill = document.getElementById("statusPill");
const resultsGrid = document.getElementById("resultsGrid");
const resultsCount = document.getElementById("resultsCount");
const showAllBtn = document.getElementById("showAllBtn");
const allGrid = document.getElementById("allGrid");
const allCount = document.getElementById("allCount");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

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

function setStatus(text) {
  statusPill.textContent = text;
}

function formatRecord(record) {
  return {
    id: record.id,
    album: record.fields["Album Name"] || "Sin título",
    year: record.fields["Album Year"] || "",
    artist: record.fields["Artist"] || "",
    status: record.fields["Status"] || "",
    image:
      (record.fields.Images && record.fields.Images[0] && record.fields.Images[0].url) ||
      fallbackCover,
  };
}

function renderCards(target, items) {
  target.innerHTML = "";
  if (!items.length) {
    target.innerHTML = "<p>No hay resultados aún.</p>";
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.image}" alt="${item.album}" loading="lazy" />
      <div>
        <h3>${item.album}</h3>
        <p>${item.artist}</p>
      </div>
      <div class="meta">
        ${item.year ? `<span class="chip">${item.year}</span>` : ""}
        ${item.status ? `<span class="chip">${item.status}</span>` : ""}
      </div>
    `;
    target.appendChild(card);
  });
}

function updateResults(query) {
  if (!query) {
    resultsGrid.innerHTML = "";
    resultsCount.textContent = "0 resultados";
    return;
  }
  const matches = fuse.search(query).map((result) => result.item);
  renderCards(resultsGrid, matches);
  resultsCount.textContent = `${matches.length} resultados`;
}

function updateAllRecords() {
  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  currentPage = Math.min(currentPage, totalPages);

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = records.slice(start, start + PAGE_SIZE);

  renderCards(allGrid, pageItems);
  allCount.textContent = `${records.length} registros`;
  pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;

  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
}

async function fetchRecords() {
  setStatus("Cargando...");
  try {
    const response = await fetch("/.netlify/functions/airtable");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error al cargar");

    records = data.records.map(formatRecord);

    fuse = new Fuse(records, {
      keys: ["album", "artist", "year", "status"],
      threshold: 0.35,
      distance: 80,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });

    updateAllRecords();
    setStatus("Listo");
  } catch (error) {
    console.error(error);
    setStatus("Error al cargar");
  }
}

searchBtn.addEventListener("click", () => {
  updateResults(searchInput.value.trim());
});

searchInput.addEventListener("input", (event) => {
  updateResults(event.target.value.trim());
});

clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  updateResults("");
});

showAllBtn.addEventListener("click", () => {
  document.getElementById("allRecords").scrollIntoView({ behavior: "smooth" });
});

prevPageBtn.addEventListener("click", () => {
  currentPage -= 1;
  updateAllRecords();
});

nextPageBtn.addEventListener("click", () => {
  currentPage += 1;
  updateAllRecords();
});

fetchRecords();
