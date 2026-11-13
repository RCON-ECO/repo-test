'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { localDate, dateState, compareTasks, matches, isValidTask } = require('../task-utils.js');
const task = (overrides = {}) => ({ id: '1', title: 'Acheter du pain', description: '', category: 'Courses', priority: 'normal', dueDate: '', done: false, createdAt: 1, ...overrides });

test('date locale et statut des échéances', () => {
  assert.equal(localDate(new Date(2026, 10, 13)), '2026-11-13');
  assert.equal(dateState(task({ dueDate: '2026-11-12' }), '2026-11-13'), 'late');
  assert.equal(dateState(task({ dueDate: '2026-11-13' }), '2026-11-13'), 'today');
  assert.equal(dateState(task({ dueDate: '2026-11-12', done: true }), '2026-11-13'), '');
});
test('tri : à faire, échéance, priorité, puis création', () => {
  const tasks = [task({ id: 'done', done: true, dueDate: '2020-01-01' }), task({ id: 'none' }), task({ id: 'low', dueDate: '2026-11-15', priority: 'low' }), task({ id: 'high', dueDate: '2026-11-15', priority: 'high' }), task({ id: 'late', dueDate: '2026-11-01' })];
  assert.deepEqual(tasks.sort(compareTasks).map(t => t.id), ['late', 'high', 'low', 'none', 'done']);
});
test('recherche et filtres cumulés', () => {
  const filters = { query: 'PAIN', status: 'todo', priority: 'normal', category: 'Courses' };
  assert.equal(matches(task(), filters), true);
  assert.equal(matches(task({ done: true }), filters), false);
  assert.equal(matches(task({ category: 'Travail' }), filters), false);
});
test('validation des données chargées', () => {
  assert.ok(isValidTask(task()));
  assert.ok(!isValidTask(task({ title: '  ' })));
  assert.ok(!isValidTask(task({ priority: 'urgent' })));
  assert.ok(!isValidTask(task({ dueDate: 'hier' })));
});
