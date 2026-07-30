const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
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

const TODOS_STORAGE_KEY = 'todos';

function updateEmptyState() {
  emptyState.hidden = list.children.length > 0;
}

function saveTodos() {
  const todos = Array.from(list.querySelectorAll('.todo-item')).map((item) => ({
    text: item.querySelector('.label').textContent,
    completed: item.classList.contains('completed'),
  }));
  localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
  updateEmptyState();
}

function loadTodos() {
  let todos;
  try {
    todos = JSON.parse(localStorage.getItem(TODOS_STORAGE_KEY)) || [];
  } catch {
    todos = [];
  }
  todos.forEach(({ text, completed }) => {
    const item = createTodoItem(text, completed);
    item.classList.remove('item-enter');
    list.appendChild(item);
  });
  updateEmptyState();
}

function createTodoItem(text, completed = false) {
  const item = document.createElement('li');
  item.className = 'todo-item item-enter';
  if (completed) item.classList.add('completed');

  let currentText = text;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'toggle';
  checkbox.checked = completed;
  checkbox.setAttribute('aria-label', `Mark ${currentText} complete`);
  checkbox.addEventListener('change', () => {
    item.classList.toggle('completed', checkbox.checked);
    saveTodos();
  });

  const label = document.createElement('div');
  label.className = 'label';
  label.textContent = currentText;
  label.title = 'Double-click to edit';

  function updateAriaLabels() {
    checkbox.setAttribute('aria-label', `Mark ${currentText} complete`);
    editButton.setAttribute('aria-label', `Edit ${currentText}`);
    deleteButton.setAttribute('aria-label', `Delete ${currentText}`);
  }

  function enterEditMode() {
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'label-edit';
    editInput.value = currentText;
    label.replaceWith(editInput);
    editInput.focus();
    editInput.select();

    function commit() {
      const newText = editInput.value.trim();
      if (newText) {
        currentText = newText;
        label.textContent = currentText;
        updateAriaLabels();
        saveTodos();
      }
      editInput.replaceWith(label);
    }

    function cancel() {
      editInput.replaceWith(label);
    }

    editInput.addEventListener('blur', commit);
    editInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        editInput.blur();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        editInput.removeEventListener('blur', commit);
        cancel();
      }
    });
  }

  label.addEventListener('dblclick', enterEditMode);

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'item-edit';
  editButton.setAttribute('aria-label', `Edit ${currentText}`);
  editButton.innerHTML = '✎';
  editButton.addEventListener('click', enterEditMode);

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'item-delete';
  deleteButton.setAttribute('aria-label', `Delete ${currentText}`);
  deleteButton.innerHTML = '✕';

  deleteButton.addEventListener('click', () => {
    // play removal animation, then remove from DOM. Fall back to a timeout
    // in case animationend never fires (e.g. animations disabled/skipped).
    let removed = false;
    const finishRemoval = () => {
      if (removed) return;
      removed = true;
      item.remove();
      saveTodos();
    };
    item.classList.add('item-removing');
    item.addEventListener('animationend', finishRemoval, { once: true });
    setTimeout(finishRemoval, 300);
  });

  item.appendChild(checkbox);
  item.appendChild(label);
  item.appendChild(editButton);
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
  saveTodos();

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

loadTodos();
