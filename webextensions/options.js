function saveOptions(event) {
  browser.storage.local.set({
    days: document.querySelector("#days").value || 0
  });
  event.preventDefault();
}

function restoreOptions() {
  browser.storage.local.get('days').then(({ days = 0 } = {}) => {
    document.querySelector("#days").value = days;
  }).catch(() => {
    document.querySelector("#days").value = 0;
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("#days").addEventListener("change", saveOptions);
