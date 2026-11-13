/* Fonctions pures partagées par l'application et les tests Node.js. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TaskUtils = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const priorityOrder = { high: 0, normal: 1, low: 2 };
  function localDate(date = new Date()) {
    const pad = value => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
  function dateState(task, today = localDate()) {
    if (task.done || !task.dueDate) return '';
    if (task.dueDate < today) return 'late';
    if (task.dueDate === today) return 'today';
    return '';
  }
  function compareTasks(a, b) {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const dateA = a.dueDate || '9999-99-99';
    const dateB = b.dueDate || '9999-99-99';
    if (dateA !== dateB) return dateA < dateB ? -1 : 1;
    const priorityDifference = priorityOrder[a.priority] - priorityOrder[b.priority];
    return priorityDifference || a.createdAt - b.createdAt;
  }
  function matches(task, filters) {
    const query = filters.query.trim().toLocaleLowerCase('fr');
    return task.title.toLocaleLowerCase('fr').includes(query)
      && (filters.status === 'all' || (filters.status === 'done' ? task.done : !task.done))
      && (filters.priority === 'all' || task.priority === filters.priority)
      && (filters.category === 'all' || task.category === filters.category);
  }
  function isValidTask(task) {
    return task && typeof task.id === 'string' && typeof task.title === 'string' && task.title.trim().length > 0
      && typeof task.description === 'string' && typeof task.category === 'string'
      && ['high', 'normal', 'low'].includes(task.priority) && typeof task.done === 'boolean'
      && typeof task.createdAt === 'number' && Number.isFinite(task.createdAt)
      && typeof task.dueDate === 'string' && (!task.dueDate || /^\d{4}-\d{2}-\d{2}$/.test(task.dueDate));
  }
  return { localDate, dateState, compareTasks, matches, isValidTask };
});
