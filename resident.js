const params = new URLSearchParams(window.location.search);
const store = window.SecureGateStore;
const residentWelcome = document.getElementById("residentWelcome");
const residentVisitorName = document.getElementById("residentVisitorName");
const residentVisitorInfo = document.getElementById("residentVisitorInfo");
const residentVisitorPhoto = document.getElementById("residentVisitorPhoto");
const residentStatus = document.getElementById("residentStatus");
const approveVisitor = document.getElementById("approveVisitor");
const rejectVisitor = document.getElementById("rejectVisitor");
const complaintPageLink = document.getElementById("complaintPageLink");
const graphApproved = document.getElementById("graphApproved");
const graphWaiting = document.getElementById("graphWaiting");
const graphRejected = document.getElementById("graphRejected");
const graphApprovedCount = document.getElementById("graphApprovedCount");
const graphWaitingCount = document.getElementById("graphWaitingCount");
const graphRejectedCount = document.getElementById("graphRejectedCount");

const flat = params.get("flat") || "A-302";
const name = params.get("name") || "Ananya Patel";
let activeVisitorId = null;

residentWelcome.textContent = `${name} (${flat})`;
complaintPageLink.href = `complaint.html?flat=${encodeURIComponent(flat)}&name=${encodeURIComponent(name)}`;

function renderTrackingGraph() {
  const visitors = store.getData().visitors.filter((item) => item.flat === flat);
  const counts = {
    approved: visitors.filter((item) => item.status === "approved").length,
    waiting: visitors.filter((item) => item.status === "waiting").length,
    rejected: visitors.filter((item) => item.status === "rejected").length
  };
  const max = Math.max(counts.approved, counts.waiting, counts.rejected, 1);

  graphApproved.style.width = `${(counts.approved / max) * 100}%`;
  graphWaiting.style.width = `${(counts.waiting / max) * 100}%`;
  graphRejected.style.width = `${(counts.rejected / max) * 100}%`;
  graphApprovedCount.textContent = counts.approved;
  graphWaitingCount.textContent = counts.waiting;
  graphRejectedCount.textContent = counts.rejected;
}

function renderVisitorRequest() {
  const pending = store.getPendingVisitorForFlat(flat);
  const latest = pending || store.getLatestVisitorForFlat(flat);

  if (!latest) {
    residentVisitorName.textContent = "No visitor request";
    residentVisitorInfo.textContent = `No request found for ${flat}.`;
    residentStatus.textContent = "No action needed.";
    residentVisitorPhoto.classList.add("hidden");
    approveVisitor.disabled = true;
    rejectVisitor.disabled = true;
    activeVisitorId = null;
    return;
  }

  activeVisitorId = latest.id;
  residentVisitorName.textContent = latest.name;
  residentVisitorInfo.textContent = `Flat ${latest.flat} request is ${latest.status}.`;
  residentStatus.textContent =
    latest.status === "waiting"
      ? "Please approve or reject this visitor."
      : `Last action: ${latest.status}.`;
  approveVisitor.disabled = latest.status !== "waiting";
  rejectVisitor.disabled = latest.status !== "waiting";

  if (latest.photoData) {
    residentVisitorPhoto.src = latest.photoData;
    residentVisitorPhoto.classList.remove("hidden");
  } else {
    residentVisitorPhoto.classList.add("hidden");
  }
}

approveVisitor.addEventListener("click", () => {
  if (!activeVisitorId) return;
  store.updateVisitorStatus(activeVisitorId, "approved");
  residentStatus.textContent = "Visitor approved. Guard can now allow entry.";
  renderVisitorRequest();
  renderTrackingGraph();
});

rejectVisitor.addEventListener("click", () => {
  if (!activeVisitorId) return;
  store.updateVisitorStatus(activeVisitorId, "rejected");
  residentStatus.textContent = "Visitor rejected. Guard should stop entry.";
  renderVisitorRequest();
  renderTrackingGraph();
});

store.ensureSeed();
renderVisitorRequest();
renderTrackingGraph();
store.subscribe(() => {
  renderVisitorRequest();
  renderTrackingGraph();
});
