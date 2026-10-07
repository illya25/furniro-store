const form = document.querySelector('#contact-form');
if (form) {
  const status = document.querySelector('#contact-status');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const draft = Object.fromEntries(new window.FormData(form));
    try {
      localStorage.setItem('furniro-contact-draft', JSON.stringify(draft));
      status.textContent =
        'Your message has been saved on this device. This demo does not send emails.';
    } catch {
      status.textContent =
        'Your browser could not save the message. Please keep a copy of your text.';
    }
    status.hidden = false;
    status.focus();
  });
}
