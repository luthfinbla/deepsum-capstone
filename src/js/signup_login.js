document.addEventListener('DOMContentLoaded', () => {
  const btnSignup = document.getElementById('btn-signup');
  const btnLogin = document.getElementById('btn-login');
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');

  btnSignup.addEventListener('click', () => {
    btnSignup.classList.add('active');
    btnLogin.classList.remove('active');
    signupForm.classList.add('active');
    loginForm.classList.remove('active');
  });

  btnLogin.addEventListener('click', () => {
    btnLogin.classList.add('active');
    btnSignup.classList.remove('active');
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
  });

  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    btnLogin.click();
    signupForm.reset();
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    window.location.href = 'homepage.html';
  });
});
