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
const editDialog = document.getElementById("editDialog");
const editForm = document.getElementById("editForm");
const cancelEditBtn = document.getElementById("cancelEdit");
const editImageFileInput = document.getElementById("editImageFile");
const editImagePreview = document.getElementById("editImagePreview");
const editPreviewImg = document.getElementById("editPreviewImg");
const userMenu = document.getElementById("userMenu");
const userChip = document.getElementById("userChip");
const userEmail = document.getElementById("userEmail");
const logoutBtnMini = document.getElementById("logoutBtnMini");

let records = [];
let pendingDeleteId = null;
let pendingEditId = null;

const CLOUDINARY_CLOUD_NAME = "dvu2hx2hf";
const CLOUDINARY_UPLOAD_PRESET = "binil_unsigned";

function setStatus(text) {
  statusMessage.textContent = text;
}

function setLocked(locked) {
  document.body.classList.toggle("admin-locked", locked);
}

function showAdmin(show) {
  adminPanel.hidden = !show;
  logoutBtn.hidden = !show;
  loginBtn.hidden = show;
  userMenu.hidden = !show;
  setLocked(!show);
}

async function checkAccess(identity) {
  if (!identity) {
    setStatus("No se pudo cargar el login. Recarga la página.");
    return false;
  }

  const user = identity.currentUser();
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
    identity.logout();
    window.location.replace("/admin/no-access.html");
    return false;
  }

  showAdmin(true);
  setStatus(`Conectado como ${data.email}`);
  userEmail.textContent = data.email;
  userChip.textContent = data.email.slice(0, 2).toUpperCase();
  await loadRecords(token);
  return true;
}

function recordRowTemplate(record) {
  const image = record.image
    ? `<img class="record-thumb" src="${record.image}" alt="${record.album}" />`
    : `<div class="record-thumb"></div>`;
  return `
    <div class="record-row" data-id="${record.id}">
      ${image}
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

function setUserBadge(user) {
  if (!user || !user.email) return;
  userEmail.textContent = user.email;
  userChip.textContent = user.email.slice(0, 2).toUpperCase();
}

function setupIdentity(identity) {
  if (!identity) {
    setStatus("No se pudo cargar el login. Recarga la página.");
    return;
  }

  loginBtn.addEventListener("click", () => {
    identity.open("login", { loginMethod: "google" });
  });

  logoutBtn.addEventListener("click", () => {
    identity.logout();
  });

  logoutBtnMini.addEventListener("click", () => {
    identity.logout();
  });

  identity.on("login", async (user) => {
    identity.close();
    setUserBadge(user);
    await checkAccess(identity);
  });

  identity.on("logout", () => {
    showAdmin(false);
    setStatus("Sesión cerrada.");
    setLocked(true);
  });

  identity.on("init", async (user) => {
    setUserBadge(user);
    await checkAccess(identity);
  });

  identity.init();

  const params = new URLSearchParams(window.location.search);
  if (params.get("login") === "1") {
    identity.open("login", { loginMethod: "google" });
  }

  // Fallback: wait for identity to populate user
  let attempts = 0;
  const poll = setInterval(async () => {
    const user = identity.currentUser();
    if (user) {
      setUserBadge(user);
      await checkAccess(identity);
      clearInterval(poll);
    }
    attempts += 1;
    if (attempts > 10) clearInterval(poll);
  }, 500);
}

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
    pendingEditId = id;
    editForm.album.value = record.album || "";
    editForm.artist.value = record.artist || "";
    editForm.year.value = record.year || "";
    editForm.status.value = record.status || "";
    if (record.image) {
      editPreviewImg.src = record.image;
      editImagePreview.hidden = false;
    } else {
      editPreviewImg.src = "";
      editImagePreview.hidden = true;
    }
    editImageFileInput.value = "";
    editDialog.showModal();
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

cancelEditBtn.addEventListener("click", () => {
  pendingEditId = null;
  editDialog.close();
});

editForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!pendingEditId) return;

  let imageUrl = "";
  const file = editImageFileInput.files && editImageFileInput.files[0];
  if (file) {
    try {
      imageUrl = await uploadImage(file);
    } catch (error) {
      setStatus(error.message || "Error al subir imagen.");
      return;
    }
  } else {
    const current = records.find((item) => item.id === pendingEditId);
    imageUrl = current ? current.image : "";
  }

  await updateRecord(pendingEditId, {
    album: editForm.album.value,
    artist: editForm.artist.value,
    year: editForm.year.value,
    status: editForm.status.value,
    image: imageUrl,
  });

  pendingEditId = null;
  editDialog.close();
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

editImageFileInput.addEventListener("change", () => {
  const file = editImageFileInput.files && editImageFileInput.files[0];
  if (!file) {
    return;
  }
  editPreviewImg.src = URL.createObjectURL(file);
  editImagePreview.hidden = false;
});

setLocked(true);

window.addEventListener("load", () => {
  const identity = window.netlifyIdentity || null;
  setupIdentity(identity);
});
