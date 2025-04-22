const statusMessage = document.querySelector("#status-message");

function showStatus(message, isSuccessful) {
  statusMessage.innerText = message;

  if (isSuccessful) {
    statusMessage.classList.remove("fail");
    statusMessage.classList.add("success");
  } else {
    statusMessage.classList.remove("success");
    statusMessage.classList.add("fail");
  }

  statusMessage.classList.remove("hidden");

  setTimeout(() => {
    statusMessage.classList.add("hidden");
  }, "4000");
}

export { showStatus };
