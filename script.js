const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const themeToggleButton = document.getElementById('theme-toggle');
const themeLabel = themeToggleButton.querySelector('.theme-label');

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const nextLabel = theme === 'dark' ? 'Light' : 'Dark';
  if (themeLabel) themeLabel.textContent = nextLabel;
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

function createTodoItem(text) {
  const item = document.createElement('li');
  item.className = 'todo-item item-enter';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'toggle';
  checkbox.setAttribute('aria-label', `Mark ${text} complete`);
  checkbox.addEventListener('change', () => {
    item.classList.toggle('completed', checkbox.checked);
  });

  const label = document.createElement('div');
  label.className = 'label';
  label.textContent = text;

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'item-delete';
  deleteButton.setAttribute('aria-label', `Delete ${text}`);
  deleteButton.innerHTML = '✕';

  deleteButton.addEventListener('click', () => {
    // play removal animation, then remove from DOM
    item.classList.add('item-removing');
    item.addEventListener('animationend', () => item.remove(), { once: true });
  });

  item.appendChild(checkbox);
  item.appendChild(label);
  item.appendChild(deleteButton);

  // remove enter class after animation completes
  item.addEventListener('animationend', (e) => {
    if (e.animationName === 'itemEnter') item.classList.remove('item-enter');
  });

  return item;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  const item = createTodoItem(text);
  list.appendChild(item);

  input.value = '';
  input.focus();
});

// keyboard focus: add enter key to add when input focused
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    form.dispatchEvent(new Event('submit', { cancelable: true }));
  }
});
