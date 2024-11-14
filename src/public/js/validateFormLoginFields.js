document.addEventListener('DOMContentLoaded', () => {
  const usernameField = document.getElementById('username');
  const passwordField = document.getElementById('password');
  const wrongInput = document.getElementById('wrong-input');
  const form = document.querySelector('.login-form');

  usernameField.addEventListener('input', validateUsernameField);
  usernameField.addEventListener('blur', validateUsernameField);

  passwordField.addEventListener('input', validatePasswordField);
  passwordField.addEventListener('blur', validatePasswordField);

  const redShadow = '0px 5px 5px rgba(194, 18, 18, 0.6)';
  const blackShadow = '0px 5px 5px rgba(0, 0, 0, 0.6)';

  function validateUsernameField() {
    const usernameRegEx = /^[a-zA-Z0-9._-]{3,20}$/;
    const isValid = usernameRegEx.test(usernameField.value);

    if (!isValid) {
      usernameField.style.boxShadow = redShadow;
      showError("El usuario debe tener entre 3 y 20 caracteres.");
      return false;
    } else {
      clearError(usernameField);
      return true;
    }
  }

  function validatePasswordField() {
    const passwordRegEx = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{5,30}$/;
    const isValid = passwordRegEx.test(passwordField.value);

    if (!isValid) {
      passwordField.style.boxShadow = redShadow;
      showError("La contraseña debe tener entre 5 y 30 caracteres e incluir al menos un número.");
      return false;
    } else {
      clearError(passwordField);
      return true;
    }
  }

  function showError(message) {
    wrongInput.style.display = 'flex';
    wrongInput.textContent = message;
  }

  function clearError(field) {
    wrongInput.style.display = 'none';
    wrongInput.textContent = '';
    field.style.boxShadow = blackShadow;
  }

  form.addEventListener('submit', (event) => {
    const isUsernameValid = validateUsernameField();
    const isPasswordValid = validatePasswordField();

    if (!isUsernameValid || !isPasswordValid) {
      event.preventDefault();
      showError("Por favor, corrija los errores antes de continuar.");
    }
  });
});
