(() => {
  'use strict';
  const KEY = 'todo-intelligente.tasks.v1';
  const $ = id => document.getElementById(id);
  const { localDate, dateState, compareTasks, matches, isValidTask } = TaskUtils;
  const list = $('task-list');
  const dialog = $('task-dialog');
  const form = $('task-form');
  let editingId = null;
  let tasks = [];

  function warn(message) {
    $('storage-warning').textContent = message;
    $('storage-warning').hidden = false;
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || !parsed.every(isValidTask)) throw new Error('Données invalides');
      tasks = parsed;
    }
  } catch (error) {
    warn('Impossible de lire les données enregistrées. Vérifiez le stockage du navigateur avant de poursuivre : un nouvel enregistrement pourrait les remplacer.');
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(tasks)); }
    catch (error) { warn('Impossible de sauvegarder les tâches. Vos modifications resteront uniquement dans cette page.'); }
  }
  function textElement(tag, text, className) {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    return element;
  }
  function refreshCategories() {
    const select = $('category-filter');
    const previous = select.value;
    const categories = [...new Set(tasks.map(task => task.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
    select.replaceChildren(new Option('Toutes les catégories', 'all'));
    const suggestions = $('category-suggestions');
    suggestions.replaceChildren();
    categories.forEach(category => {
      select.add(new Option(category, category));
      suggestions.append(new Option(category, category));
    });
    select.value = categories.includes(previous) ? previous : 'all';
  }
  function render() {
    refreshCategories();
    const today = localDate();
    $('todo-count').textContent = tasks.filter(task => !task.done).length;
    $('done-count').textContent = tasks.filter(task => task.done).length;
    $('late-count').textContent = tasks.filter(task => dateState(task, today) === 'late').length;
    const filters = { query: $('search').value, status: $('status-filter').value, priority: $('priority-filter').value, category: $('category-filter').value };
    const visible = tasks.filter(task => matches(task, filters)).sort(compareTasks);
    list.replaceChildren();
    $('list-message').hidden = visible.length > 0;
    $('list-message').textContent = tasks.length ? 'Aucune tâche ne correspond à vos filtres.' : 'Aucune tâche pour le moment. Ajoutez votre première tâche !';
    visible.forEach(task => {
      const item = document.createElement('li');
      item.className = `task${task.done ? ' done' : ''}`;
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox'; checkbox.checked = task.done;
      checkbox.setAttribute('aria-label', `${task.done ? 'Rouvrir' : 'Terminer'} la tâche ${task.title}`);
      checkbox.addEventListener('change', () => { task.done = checkbox.checked; save(); render(); });
      const content = textElement('div', '', 'task-content');
      content.append(textElement('div', task.title, 'task-title'));
      if (task.description) content.append(textElement('p', task.description, 'description'));
      const badges = textElement('div', '', 'badges');
      const labels = { high: 'Priorité élevée', normal: 'Priorité normale', low: 'Priorité faible' };
      badges.append(textElement('span', labels[task.priority], `badge ${task.priority}`));
      if (task.category) badges.append(textElement('span', task.category, 'badge'));
      if (task.dueDate) {
        const state = dateState(task, today);
        const dateLabel = task.dueDate.split('-').reverse().join('/');
        badges.append(textElement('span', `${state === 'late' ? 'En retard · ' : state === 'today' ? 'Aujourd’hui · ' : 'Échéance · '}${dateLabel}`, `badge ${state}`));
      }
      content.append(badges);
      const actions = textElement('div', '', 'actions');
      const edit = textElement('button', 'Modifier', 'text-button'); edit.type = 'button';
      edit.setAttribute('aria-label', `Modifier la tâche ${task.title}`);
      edit.addEventListener('click', () => openForm(task));
      const remove = textElement('button', 'Supprimer', 'text-button delete'); remove.type = 'button';
      remove.setAttribute('aria-label', `Supprimer la tâche ${task.title}`);
      remove.addEventListener('click', () => {
        if (window.confirm(`Supprimer la tâche « ${task.title} » ?`)) { tasks = tasks.filter(t => t.id !== task.id); save(); render(); }
      });
      actions.append(edit, remove); item.append(checkbox, content, actions); list.append(item);
    });
  }
  function openForm(task = null) {
    editingId = task ? task.id : null;
    form.reset();
    $('form-title').textContent = task ? 'Modifier la tâche' : 'Ajouter une tâche';
    $('title').value = task?.title || '';
    $('description').value = task?.description || '';
    $('priority').value = task?.priority || 'normal';
    $('due-date').value = task?.dueDate || '';
    $('category').value = task?.category || '';
    dialog.showModal();
    $('title').focus();
  }
  $('new-task').addEventListener('click', () => openForm());
  $('close-dialog').addEventListener('click', () => dialog.close());
  $('cancel').addEventListener('click', () => dialog.close());
  form.addEventListener('submit', event => {
    event.preventDefault();
    const title = $('title').value.trim();
    if (!title) { $('title').setCustomValidity('Veuillez saisir un titre.'); $('title').reportValidity(); return; }
    $('title').setCustomValidity('');
    const values = { title, description: $('description').value.trim(), priority: $('priority').value, dueDate: $('due-date').value, category: $('category').value.trim() };
    if (editingId !== null) {
      const task = tasks.find(item => item.id === editingId);
      if (task) Object.assign(task, values);
    } else {
      const id = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      tasks.push({ id, ...values, done: false, createdAt: Date.now() });
    }
    save(); dialog.close(); render();
  });
  $('title').addEventListener('input', () => $('title').setCustomValidity(''));
  ['search', 'status-filter', 'priority-filter', 'category-filter'].forEach(id => $(id).addEventListener(id === 'search' ? 'input' : 'change', render));
  // Actualise les indicateurs lorsque l'utilisateur revient sur la page après minuit.
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
  render();
})();
