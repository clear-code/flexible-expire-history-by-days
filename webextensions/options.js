function saveOptions(event) {
  browser.storage.local.set({
    days: document.querySelector("#days").value || 0,
    frequency: parseInt(document.querySelector("#frequency").value)
  });
  event.preventDefault();
}

function restoreOptions() {
  browser.storage.local.get('days').then(({ days = 0 } = {}) => {
    document.querySelector("#days").value = days;
  }).catch(() => {
    document.querySelector("#days").value = 0;
  });
  browser.storage.local.get('frequency').then(({ frequency = 0 } = {}) => {
    document.querySelector("#frequency").value = frequency;
  }).catch(() => {
    document.querySelector("#frequency").value = 0;
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("#days").addEventListener("change", saveOptions);
document.querySelector("#frequency").addEventListener("change", saveOptions);
