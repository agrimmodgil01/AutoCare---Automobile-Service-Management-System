const storageKey = "autoServiceRecords";

const form = document.querySelector("#registrationForm");
const recordsBody = document.querySelector("#recordsBody");
const lookupResults = document.querySelector("#lookupResults");
const resultTemplate = document.querySelector("#resultTemplate");
const formMessage = document.querySelector("#formMessage");
const submitBtn = document.querySelector("#submitBtn");
const searchName = document.querySelector("#searchName");
const userCount = document.querySelector("#userCount");
const vehicleCount = document.querySelector("#vehicleCount");
const pageLinks = document.querySelectorAll("[data-page-link]");
const pages = document.querySelectorAll("[data-page]");

const fields = [
  "recordId",
  "userName",
  "phone",
  "email",
  "address",
  "vehicleNumber",
  "make",
  "model",
  "year",
  "fuelType",
  "odometer",
  "diagnosis",
  "status",
  "estimatedCost",
  "serviceDate"
];

function getRecords() {
  return JSON.parse(localStorage.getItem(storageKey) || "[]");
}

function saveRecords(records) {
  localStorage.setItem(storageKey, JSON.stringify(records));
}

function getFieldValue(id) {
  return document.querySelector(`#${id}`).value.trim();
}

function formatCurrency(value) {
  if (!value) return "Not estimated";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value));
}

function formatOdometer(value) {
  if (!value) return "Not recorded";
  return `${Number(value).toLocaleString("en-IN")} km`;
}

function vehicleName(record) {
  return `${record.year ? `${record.year} ` : ""}${record.make} ${record.model}`.trim();
}

function escapeText(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function showMessage(text) {
  formMessage.textContent = text;
  window.clearTimeout(showMessage.timer);
  showMessage.timer = window.setTimeout(() => {
    formMessage.textContent = "";
  }, 2800);
}

function resetForm() {
  form.reset();
  document.querySelector("#recordId").value = "";
  document.querySelector("#serviceDate").valueAsDate = new Date();
  submitBtn.textContent = "Register User & Vehicle";
}

function showPage(pageId) {
  const pageExists = Array.from(pages).some((page) => page.dataset.page === pageId);
  const activePageId = pageExists ? pageId : "registration";

  pages.forEach((page) => {
    page.classList.toggle("active-page", page.dataset.page === activePageId);
  });

  pageLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.pageLink === activePageId);
  });

  if (window.location.hash !== `#${activePageId}`) {
    history.replaceState(null, "", `#${activePageId}`);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderStats(records) {
  const uniqueUsers = new Set(records.map((record) => record.userName.toLowerCase()));
  userCount.textContent = uniqueUsers.size;
  vehicleCount.textContent = records.length;
}

function renderRecords() {
  const records = getRecords();
  renderStats(records);

  if (!records.length) {
    recordsBody.innerHTML = `
      <tr>
        <td colspan="6">No registrations yet. Add a user and vehicle above.</td>
      </tr>
    `;
    return;
  }

  recordsBody.innerHTML = records.map((record) => `
    <tr>
      <td>
        <strong>${escapeText(record.userName)}</strong><br>
        <small>${escapeText(record.phone)}</small>
      </td>
      <td>
        <strong>${escapeText(record.vehicleNumber)}</strong><br>
        <small>${escapeText(vehicleName(record))}</small>
      </td>
      <td>${escapeText(record.diagnosis)}</td>
      <td>${escapeText(record.status)}</td>
      <td>${formatCurrency(record.estimatedCost)}</td>
      <td>
        <div class="action-group">
          <button class="small-btn" type="button" data-action="edit" data-id="${record.id}">Edit</button>
          <button class="small-danger-btn" type="button" data-action="delete" data-id="${record.id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function fillResultCard(card, record) {
  const values = {
    userName: record.userName,
    phone: record.phone,
    email: record.email || "Not provided",
    vehicleNumber: record.vehicleNumber,
    vehicleName: vehicleName(record),
    fuelType: record.fuelType,
    odometer: formatOdometer(record.odometer),
    diagnosis: record.diagnosis,
    estimatedCost: formatCurrency(record.estimatedCost),
    status: record.status
  };

  Object.entries(values).forEach(([field, value]) => {
    const node = card.querySelector(`[data-field="${field}"]`);
    if (node) node.textContent = value;
  });
}

function searchRecords() {
  const query = searchName.value.trim().toLowerCase();
  const records = getRecords();

  if (!query) {
    lookupResults.className = "lookup-results empty-state";
    lookupResults.textContent = "Enter a registered user name to view linked vehicle and diagnosis details.";
    return;
  }

  const matches = records.filter((record) => record.userName.toLowerCase().includes(query));
  lookupResults.className = matches.length ? "lookup-results" : "lookup-results empty-state";
  lookupResults.innerHTML = "";

  if (!matches.length) {
    lookupResults.textContent = `No vehicle found for "${searchName.value.trim()}".`;
    return;
  }

  matches.forEach((record) => {
    const card = resultTemplate.content.firstElementChild.cloneNode(true);
    fillResultCard(card, record);
    lookupResults.appendChild(card);
  });
}

function collectFormRecord() {
  return {
    id: getFieldValue("recordId") || crypto.randomUUID(),
    userName: getFieldValue("userName"),
    phone: getFieldValue("phone"),
    email: getFieldValue("email"),
    address: getFieldValue("address"),
    vehicleNumber: getFieldValue("vehicleNumber").toUpperCase(),
    make: getFieldValue("make"),
    model: getFieldValue("model"),
    year: getFieldValue("year"),
    fuelType: getFieldValue("fuelType"),
    odometer: getFieldValue("odometer"),
    diagnosis: getFieldValue("diagnosis"),
    status: getFieldValue("status"),
    estimatedCost: getFieldValue("estimatedCost"),
    serviceDate: getFieldValue("serviceDate"),
    updatedAt: new Date().toISOString()
  };
}

function editRecord(id) {
  const record = getRecords().find((item) => item.id === id);
  if (!record) return;

  fields.forEach((field) => {
    const input = document.querySelector(`#${field}`);
    if (!input) return;
    input.value = field === "recordId" ? record.id : record[field] || "";
  });

  submitBtn.textContent = "Update Registration";
  showPage("registration");
}

function deleteRecord(id) {
  const records = getRecords().filter((record) => record.id !== id);
  saveRecords(records);
  renderRecords();
  searchRecords();
  showMessage("Record deleted.");
}

function loadSampleData() {
  const samples = [
    {
      id: crypto.randomUUID(),
      userName: "Riya Sharma",
      phone: "9876543210",
      email: "riya@example.com",
      address: "Sector 21, Delhi",
      vehicleNumber: "DL 01 AB 1234",
      make: "Honda",
      model: "City",
      year: "2021",
      fuelType: "Petrol",
      odometer: "38500",
      diagnosis: "Brake pads worn out and front suspension noise during turns.",
      status: "In Service",
      estimatedCost: "7200",
      serviceDate: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      userName: "Aman Verma",
      phone: "9988776655",
      email: "aman@example.com",
      address: "MG Road, Gurugram",
      vehicleNumber: "HR 26 CD 4567",
      make: "Hyundai",
      model: "i20",
      year: "2020",
      fuelType: "Diesel",
      odometer: "54200",
      diagnosis: "Engine check light on; scanner reports EGR flow issue.",
      status: "Waiting for Parts",
      estimatedCost: "9600",
      serviceDate: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString()
    }
  ];

  saveRecords(samples);
  resetForm();
  renderRecords();
  searchRecords();
  showMessage("Sample records loaded.");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const record = collectFormRecord();
  const records = getRecords();
  const existingIndex = records.findIndex((item) => item.id === record.id);

  if (existingIndex >= 0) {
    records[existingIndex] = record;
    showMessage("Registration updated.");
  } else {
    records.push(record);
    showMessage("User, vehicle, and diagnosis registered.");
  }

  saveRecords(records);
  resetForm();
  renderRecords();
  searchRecords();
});

recordsBody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  if (button.dataset.action === "edit") editRecord(button.dataset.id);
  if (button.dataset.action === "delete") deleteRecord(button.dataset.id);
});

document.querySelector("#searchBtn").addEventListener("click", searchRecords);
searchName.addEventListener("input", searchRecords);
document.querySelector("#clearFormBtn").addEventListener("click", resetForm);
document.querySelector("#clearAllBtn").addEventListener("click", () => {
  if (!getRecords().length) return;
  const confirmed = window.confirm("Clear all auto service records?");
  if (!confirmed) return;
  saveRecords([]);
  resetForm();
  renderRecords();
  searchRecords();
  showMessage("All records cleared.");
});

pageLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showPage(link.dataset.pageLink);
  });
});

resetForm();
renderRecords();
showPage(window.location.hash.replace("#", "") || "registration");
