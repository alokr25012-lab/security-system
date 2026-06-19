const store = window.SecureGateStore;
const guardPhotoButton = document.getElementById("guardPhotoButton");
const guardPhotoStatus = document.getElementById("guardPhotoStatus");
const guardVisitorInput = document.getElementById("guardVisitorInput");
const guardFlatInput = document.getElementById("guardFlatInput");
const guardSendButton = document.getElementById("guardSendButton");
const guardStatus = document.getElementById("guardStatus");
const guardRequestList = document.getElementById("guardRequestList");
const guardVideo = document.getElementById("guardVideo");
const guardPhotoPreview = document.getElementById("guardPhotoPreview");
const guardCanvas = document.getElementById("guardCanvas");

let cameraStream = null;
let capturedPhoto = "";

function stopCamera() {
  if (!cameraStream) return;
  cameraStream.getTracks().forEach((track) => track.stop());
  cameraStream = null;
}

function renderGuardRequests() {
  const visitors = store.getData().visitors.slice(0, 5);
  if (!visitors.length) {
    guardRequestList.innerHTML = '<div class="list-item">No request sent yet.</div>';
    return;
  }

  guardRequestList.innerHTML = visitors
    .map((item) => `<div class="list-item">${item.name} - ${item.flat} - ${item.status}</div>`)
    .join("");
}

async function openCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    guardPhotoStatus.textContent = "Camera is not supported in this browser.";
    return;
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
    guardVideo.srcObject = cameraStream;
    guardVideo.classList.remove("hidden");
    guardPhotoPreview.classList.add("hidden");
    guardPhotoButton.textContent = "Capture Photo";
    guardPhotoStatus.textContent = "Camera opened. Click again to capture photo.";
  } catch (_error) {
    guardPhotoStatus.textContent = "Camera permission was denied or camera is unavailable.";
  }
}

function capturePhoto() {
  const width = guardVideo.videoWidth || 640;
  const height = guardVideo.videoHeight || 480;
  guardCanvas.width = width;
  guardCanvas.height = height;
  guardCanvas.getContext("2d").drawImage(guardVideo, 0, 0, width, height);
  capturedPhoto = guardCanvas.toDataURL("image/png");
  guardPhotoPreview.src = capturedPhoto;
  guardPhotoPreview.classList.remove("hidden");
  guardVideo.classList.add("hidden");
  stopCamera();
  guardPhotoButton.textContent = "Retake Photo";
  guardPhotoStatus.textContent = "Visitor photo captured successfully.";
}

guardPhotoButton.addEventListener("click", () => {
  if (cameraStream) {
    capturePhoto();
    return;
  }

  if (capturedPhoto) {
    capturedPhoto = "";
    openCamera();
    return;
  }

  openCamera();
});

guardSendButton.addEventListener("click", () => {
  const visitor = guardVisitorInput.value.trim() || "Visitor";
  const flat = guardFlatInput.value.trim().toUpperCase() || "Unknown Flat";
  if (!capturedPhoto) {
    guardStatus.textContent = "Take visitor photo before sending the request.";
    return;
  }

  store.addVisitorRequest({ name: visitor, flat, photoData: capturedPhoto });
  guardStatus.textContent = `Request sent for ${visitor} to ${flat}. Entry allowed only after owner approval.`;
  renderGuardRequests();
  guardVisitorInput.value = "";
  guardFlatInput.value = "";
  capturedPhoto = "";
  guardPhotoPreview.classList.add("hidden");
  guardPhotoButton.textContent = "Open Camera";
  guardPhotoStatus.textContent = "Photo sent with the request.";
});

store.ensureSeed();
renderGuardRequests();
store.subscribe(renderGuardRequests);
