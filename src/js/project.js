document.addEventListener("DOMContentLoaded", () => {
  const menuItems = document.querySelectorAll('.menu-item');
  const projectSection = document.querySelector('.project-section');
  const menu1Section = document.querySelector('.menu1-section');

  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const menu = item.dataset.menu;

      if (menu === "home") {
        e.preventDefault();

        if (projectSection) projectSection.classList.remove('hidden');
        if (menu1Section) menu1Section.classList.add('hidden');

        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      }
    });
  });

  const projectItems = document.querySelectorAll('.project-item');
  if (projectItems) {
    projectItems.forEach(project => {
      project.addEventListener('click', () => {
        const target = project.dataset.target;

        if (target === 'menu1') {
          if (projectSection) projectSection.classList.add('hidden');
          if (menu1Section) menu1Section.classList.remove('hidden');
        }
      });
    });
  }
});
