const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const themeToggleButton = document.getElementById('theme-toggle');

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const nextLabel = theme === 'dark' ? 'Light' : 'Dark';
  themeToggleButton.textContent = nextLabel;
  themeToggleButton.setAttribute('aria-label', `Switch to ${nextLabel.toLowerCase()} mode`);
  localStorage.setItem('theme', theme);
}

function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
}

themeToggleButton.addEventListener('click', () => {
  const currentTheme = document.documentElement.dataset.theme;
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

initializeTheme();

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) {
    return;
  }

  const item = document.createElement('li');
  item.className = 'todo-item';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'toggle';
  checkbox.addEventListener('change', () => {
    item.classList.toggle('completed', checkbox.checked);
  });

  const label = document.createElement('span');
  label.textContent = text;

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => {
    item.remove();
  });

  item.appendChild(checkbox);
  item.appendChild(label);
  item.appendChild(deleteButton);

  list.appendChild(item);
  input.value = '';
  input.focus();
});
