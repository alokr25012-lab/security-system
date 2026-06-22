const params = new URLSearchParams(window.location.search);
const store = window.SecureGateStore;
const flatParam = params.get("flat") || "A-302";
const nameParam = params.get("name") || "Ananya Patel";

const complaintResidentHeading = document.getElementById("complaintResidentHeading");
const complaintInput = document.getElementById("complaintInput");
const complaintSubmitButton = document.getElementById("complaintSubmitButton");
const complaintStatus = document.getElementById("complaintStatus");
const complaintHistory = document.getElementById("complaintHistory");
const backToResident = document.getElementById("backToResident");

backToResident.href = `resident.html?flat=${encodeURIComponent(flatParam)}&name=${encodeURIComponent(nameParam)}`;
complaintResidentHeading.textContent = `${nameParam} (${flatParam})`;

function renderComplaints() {
  const complaints = store.getData().complaints.filter((item) => item.flat === flatParam);
  if (!complaints.length) {
    complaintHistory.innerHTML = '<div class="list-item">No complaints for this flat yet.</div>';
    return;
  }

  complaintHistory.innerHTML = complaints
    .map((item) => `<div class="list-item">${item.text} - ${store.formatTime(item.createdAt)}</div>`)
    .join("");
}

complaintSubmitButton.addEventListener("click", () => {
  const text = complaintInput.value.trim();
  if (!text) return;
  store.addComplaint({ flat: flatParam, residentName: nameParam, text });
  complaintStatus.textContent = "Complaint submitted successfully.";
  complaintInput.value = "";
  renderComplaints();
});

store.ensureSeed();
renderComplaints();
store.subscribe(renderComplaints);
