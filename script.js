// ---------- state ----------
let entries = JSON.parse(localStorage.getItem('ledger-entries') || '[]');
let currentType = 'expense';

const catIcon = {
  food: '🍽',
  transport: '🚌',
  bills: '⚡',
  shopping: '🛍',
  health: '➕',
  other: '•'
};

// ---------- elements ----------
const form = document.getElementById('entryForm');
const descInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const typeToggle = document.getElementById('typeToggle');
const filterCategory = document.getElementById('filterCategory');
const entryList = document.getElementById('entryList');
const emptyState = document.getElementById('emptyState');

const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expenseTotalEl = document.getElementById('expenseTotal');


// default date to today
dateInput.value = new Date().toISOString().split('T')[0];

// ---------- helpers ----------
function formatCurrency(n) {
  return '₹' + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function save() {
  localStorage.setItem('ledger-entries', JSON.stringify(entries));
}

function calcTotals() {
  let income = 0, expense = 0;
  entries.forEach(e => {
    if (e.type === 'income') income += e.amount;
    else expense += e.amount;
  });
  return { income, expense, balance: income - expense };
}

function render() {
  const { income, expense, balance } = calcTotals();
  balanceEl.textContent = formatCurrency(balance);
  incomeEl.textContent = formatCurrency(income);
  expenseTotalEl.textContent = formatCurrency(expense);

  const filter = filterCategory.value;
  const filtered = entries
    .filter(e => filter === 'all' || e.category === filter)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  entryList.innerHTML = '';
  emptyState.classList.toggle('show', entries.length === 0);

  filtered.forEach(e => {
    const li = document.createElement('li');
    li.className = 'entry';
    li.innerHTML = `
      <div class="entry-icon cat-${e.category}">${catIcon[e.category] || '•'}</div>
      <div class="entry-info">
        <p class="entry-desc">${escapeHtml(e.description)}</p>
        <p class="entry-meta">${capitalize(e.category)} · ${formatDate(e.date)}</p>
      </div>
      <span class="entry-amount ${e.type}">${e.type === 'income' ? '+' : '-'}${formatCurrency(e.amount)}</span>
      <button class="entry-delete" data-id="${e.id}" aria-label="Delete entry">✕</button>
    `;
    entryList.appendChild(li);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------- events ----------
typeToggle.addEventListener('click', (e) => {
  const btn = e.target.closest('.toggle-btn');
  if (!btn) return;
  currentType = btn.dataset.type;
  typeToggle.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const amount = parseFloat(amountInput.value);
  if (!amount || amount <= 0) return;

  entries.push({
    id: Date.now().toString(),
    description: descInput.value.trim(),
    amount,
    category: categoryInput.value,
    date: dateInput.value,
    type: currentType
  });

  save();
  render();
  form.reset();
  dateInput.value = new Date().toISOString().split('T')[0];
  descInput.focus();
});

entryList.addEventListener('click', (e) => {
  const btn = e.target.closest('.entry-delete');
  if (!btn) return;
  entries = entries.filter(en => en.id !== btn.dataset.id);
  save();
  render();
});

filterCategory.addEventListener('change', render);

// ---------- init ----------
render();