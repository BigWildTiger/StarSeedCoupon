const csCodeInput = document.querySelector('#csCodeInput');
const saveButton = document.querySelector('#csCodeSaveButton');

window.addEventListener('load', async () => {
  const current = (await chrome.storage.sync.get('csCode'))['csCode'];
  if (current != null) {
    csCodeInput.value = current;
  }
});

saveButton.addEventListener('click', async () => {
  const csCode = csCodeInput.value;
  chrome.storage.sync.set({ 'csCode': csCode });
  window.close();
});
