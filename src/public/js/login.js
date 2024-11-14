async function handleSubmit(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const wrongInput = document.getElementById('wrong-input');

  const credentials = { username, password };

  try {
    const response = await fetch('/app/v1/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ credentials })
    });

    if (response.status === 200) {
      window.location.href = '/app/v1/dashboard';
    } else if (response.status === 404 || response.status === 401) {
      const html = await response.text();
      document.body.innerHTML = html;

      const acceptButton = document.querySelector('.button');
      acceptButton.addEventListener('click', function() {
        window.location.href = '/app/v1/';
      });
    }
  } catch (error) {
    wrongInput.textContent = 'Error de conexión con el servidor';
    wrongInput.style.display = 'block';
  }
}
