const faqItems = document.querySelectorAll('.faq-item');
const questions = document.querySelectorAll('.faq-question');

   document.getElementById('startBtn').addEventListener('click', () => {
      document.getElementById('startSection').scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('howBtn').addEventListener('click', () => {
      document.getElementById('howSection').scrollIntoView({ behavior: 'smooth' });
    });

faqItems.forEach(item => {
  item.addEventListener('click', () => {
    item.classList.toggle('active');
  });
});

  document.getElementById('startBtn').addEventListener('click', function () {
    window.location.href = 'project.html';
  });

  questions.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.faq-answer').forEach(ans => {
        if (ans !== btn.nextElementSibling) {
          ans.classList.remove('open');
        }
      });

      btn.nextElementSibling.classList.toggle('open');
    });
  });