const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const statusMessage = document.getElementById("statusMessage");
const statusPanel = document.getElementById("statusPanel");
const adminPanel = document.getElementById("adminPanel");
const createForm = document.getElementById("createForm");
const recordsList = document.getElementById("recordsList");
const refreshBtn = document.getElementById("refreshBtn");
const confirmDialog = document.getElementById("confirmDialog");
const cancelDeleteBtn = document.getElementById("cancelDelete");
const confirmDeleteBtn = document.getElementById("confirmDelete");
const imageFileInput = document.getElementById("imageFile");
const imagePreview = document.getElementById("imagePreview");
const previewImg = document.getElementById("previewImg");

let records = [];
let pendingDeleteId = null;

const CLOUDINARY_CLOUD_NAME = "REEMPLAZA_ESTO";
const CLOUDINARY_UPLOAD_PRESET = "REEMPLAZA_ESTO";

function setStatus(text) {
  statusMessage.textContent = text;
}

function showAdmin(show) {
  adminPanel.hidden = !show;
  logoutBtn.hidden = !show;
  loginBtn.hidden = show;
}

async function checkAccess() {
  const user = netlifyIdentity.currentUser();
  if (!user) {
    showAdmin(false);
    setStatus("Conecta tu cuenta para continuar.");
    return false;
  }

  setStatus("Validando acceso...");
  const token = await user.jwt(true);
  const response = await fetch("/.netlify/functions/admin", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();

  if (!response.ok || !data.allowed) {
    showAdmin(false);
    setStatus("Tu correo no tiene acceso. Contacta al administrador.");
    netlifyIdentity.logout();
    return false;
  }

  showAdmin(true);
  setStatus(`Conectado como ${data.email}`);
  await loadRecords(token);
  return true;
}

function recordRowTemplate(record) {
  return `
    <div class="record-row" data-id="${record.id}">
      <div>
        <strong>${record.album}</strong> — ${record.artist}
        <div><small>${record.year || "Sin año"} · ${record.status || "Sin status"}</small></div>
      </div>
      <div class="record-actions">
        <button class="ghost-btn" data-action="edit">Editar</button>
        <button class="ghost-btn" data-action="delete">Eliminar</button>
      </div>
    </div>
  `;
}

function renderRecords() {
  if (!records.length) {
    recordsList.innerHTML = "<p>No hay registros aún.</p>";
    return;
  }
  recordsList.innerHTML = records.map(recordRowTemplate).join("");
}

async function loadRecords(token) {
  const response = await fetch("/.netlify/functions/admin", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    setStatus("Error al cargar registros.");
    return;
  }
  records = data.records || [];
  renderRecords();
}

async function createRecord(formData) {
  const user = netlifyIdentity.currentUser();
  const token = await user.jwt(true);

  let imageUrl = "";
  const file = imageFileInput.files && imageFileInput.files[0];
  if (file) {
    imageUrl = await uploadImage(file);
  }

  const payload = {
    album: formData.get("album"),
    artist: formData.get("artist"),
    year: formData.get("year"),
    status: formData.get("status"),
    image: imageUrl,
  };

  const response = await fetch("/.netlify/functions/admin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    setStatus("No se pudo guardar el vinil.");
    return;
  }

  createForm.reset();
  await loadRecords(token);
  setStatus("Vinil guardado.");
}

async function updateRecord(id, payload) {
  const user = netlifyIdentity.currentUser();
  const token = await user.jwt(true);

  const response = await fetch("/.netlify/functions/admin", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id, ...payload }),
  });

  if (!response.ok) {
    setStatus("No se pudo actualizar.");
    return;
  }

  await loadRecords(token);
  setStatus("Registro actualizado.");
}

async function deleteRecord(id) {
  const user = netlifyIdentity.currentUser();
  const token = await user.jwt(true);

  const response = await fetch("/.netlify/functions/admin", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    setStatus("No se pudo eliminar.");
    return;
  }

  await loadRecords(token);
  setStatus("Registro eliminado.");
}

async function uploadImage(file) {
  if (!CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME === "REEMPLAZA_ESTO") {
    throw new Error("Configura Cloudinary en admin.js");
  }
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "Error al subir imagen");
  }
  return data.secure_url;
}

loginBtn.addEventListener("click", () => {
  netlifyIdentity.open("login", { loginMethod: "google" });
});

logoutBtn.addEventListener("click", () => {
  netlifyIdentity.logout();
});

netlifyIdentity.on("login", async () => {
  netlifyIdentity.close();
  await checkAccess();
});

netlifyIdentity.on("logout", () => {
  showAdmin(false);
  setStatus("Sesión cerrada.");
});

createForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(createForm);
  try {
    await createRecord(formData);
  } catch (error) {
    setStatus(error.message || "Error al guardar.");
  }
});

refreshBtn.addEventListener("click", async () => {
  const user = netlifyIdentity.currentUser();
  if (!user) return;
  const token = await user.jwt(true);
  await loadRecords(token);
});

recordsList.addEventListener("click", async (event) => {
  const action = event.target.getAttribute("data-action");
  const row = event.target.closest(".record-row");
  if (!action || !row) return;

  const id = row.dataset.id;
  const record = records.find((item) => item.id === id);
  if (!record) return;

  if (action === "delete") {
    pendingDeleteId = id;
    confirmDialog.showModal();
    return;
  }

  if (action === "edit") {
    const album = prompt("Album", record.album);
    if (album === null) return;
    const artist = prompt("Artista", record.artist);
    if (artist === null) return;
    const year = prompt("Año", record.year || "");
    if (year === null) return;
    const status = prompt("Status (Lo tengo / Wishlist)", record.status || "");
    if (status === null) return;
    const image = prompt("Imagen URL", record.image || "");
    if (image === null) return;

    await updateRecord(id, { album, artist, year, status, image });
  }
});

cancelDeleteBtn.addEventListener("click", () => {
  pendingDeleteId = null;
  confirmDialog.close();
});

confirmDeleteBtn.addEventListener("click", async () => {
  if (!pendingDeleteId) return;
  await deleteRecord(pendingDeleteId);
  pendingDeleteId = null;
  confirmDialog.close();
});

imageFileInput.addEventListener("change", () => {
  const file = imageFileInput.files && imageFileInput.files[0];
  if (!file) {
    imagePreview.hidden = true;
    previewImg.src = "";
    return;
  }
  previewImg.src = URL.createObjectURL(file);
  imagePreview.hidden = false;
});

netlifyIdentity.init();
checkAccess();
