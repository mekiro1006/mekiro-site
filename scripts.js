document.getElementById('scrollToProjects').addEventListener('click', function(e) {
  e.preventDefault();

  const target = document.getElementById('projects');
  const offsetTop = target.getBoundingClientRect().top + window.scrollY;

  window.scrollTo({
    top: offsetTop,
    behavior: 'smooth'
  });
});
