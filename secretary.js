const store = window.SecureGateStore;
const metricVisitors = document.getElementById("metricVisitors");
const metricApproved = document.getElementById("metricApproved");
const metricComplaints = document.getElementById("metricComplaints");
const secretaryVisitorList = document.getElementById("secretaryVisitorList");
const secretaryComplaintList = document.getElementById("secretaryComplaintList");
const flatFilterInput = document.getElementById("flatFilterInput");
const statusFilter = document.getElementById("statusFilter");

function isMatchingStatus(visitor, filterValue) {
  if (filterValue === "all") return true;
  if (filterValue === "came") return visitor.status === "approved";
  if (filterValue === "not-came") return visitor.status === "waiting" || visitor.status === "rejected";
  return visitor.status === filterValue;
}

function renderSummary() {
  const summary = store.getSummary();
  metricVisitors.textContent = summary.visitors;
  metricApproved.textContent = summary.approved;
  metricComplaints.textContent = summary.complaints;
}

function renderVisitors() {
  const data = store.getData();
  const flatFilter = flatFilterInput.value.trim().toUpperCase();
  const statusValue = statusFilter.value;
  const visitors = data.visitors.filter((visitor) => {
    const flatMatch = !flatFilter || visitor.flat.includes(flatFilter);
    const statusMatch = isMatchingStatus(visitor, statusValue);
    return flatMatch && statusMatch;
  });

  if (!visitors.length) {
    secretaryVisitorList.innerHTML = '<div class="list-item">No visitor found for this filter.</div>';
    return;
  }

  secretaryVisitorList.innerHTML = visitors
    .map((visitor) => {
      const cameLabel = visitor.status === "approved" ? "Came" : "Not Came";
      return `<div class="list-item">${visitor.name} - ${visitor.flat} - ${visitor.status} - ${cameLabel} - ${store.formatTime(visitor.createdAt)}</div>`;
    })
    .join("");
}

function renderComplaints() {
  const complaints = store.getData().complaints;
  if (!complaints.length) {
    secretaryComplaintList.innerHTML = '<div class="list-item">No complaints available.</div>';
    return;
  }

  secretaryComplaintList.innerHTML = complaints
    .map((item) => `<div class="list-item">${item.residentName} - ${item.flat} - ${item.text}</div>`)
    .join("");
}

flatFilterInput.addEventListener("input", renderVisitors);
statusFilter.addEventListener("change", renderVisitors);

store.ensureSeed();
renderSummary();
renderVisitors();
renderComplaints();
store.subscribe(() => {
  renderSummary();
  renderVisitors();
  renderComplaints();
});
