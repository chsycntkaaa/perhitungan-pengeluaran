// State Aplikasi
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let userXP = parseInt(localStorage.getItem('userXP')) || 0;
let expenseChart = null;

// DOM Elements
const expenseForm = document.getElementById('expense-form');
const expenseNameInput = document.getElementById('expense-name');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseCategoryInput = document.getElementById('expense-category');
const expenseList = document.getElementById('expense-list');
const totalExpenseEl = document.getElementById('total-expense');
const userLevelEl = document.getElementById('user-level');
const userXpEl = document.getElementById('user-xp');
const xpBarEl = document.getElementById('xp-bar');
const userTitleEl = document.getElementById('user-title');

// Gelar Berdasarkan Level
const titles = ['Pemula Saku', 'Penyimpan Handal', 'Master Hemat', 'Sultan Wisely'];

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
  updateUI();
  initChart();
});

// Event Listener Form Submit
expenseForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = expenseNameInput.value;
  const amount = parseFloat(expenseAmountInput.value);
  const category = expenseCategoryInput.value;

  if (name && amount) {
    const newExpense = {
      id: Date.now(),
      name,
      amount,
      category,
      date: new Date().toLocaleDateString('id-ID')
    };

    expenses.push(newExpense);
    addXP(20); // Tambah 20 XP setiap kali mencatat
    saveData();
    updateUI();

    // Reset Form
    expenseNameInput.value = '';
    expenseAmountInput.value = '';
  }
});

// Fungsi Tambah XP & Level Up
function addXP(amount) {
  userXP += amount;
  localStorage.setItem('userXP', userXP);
}

function calculateGamification() {
  const level = Math.floor(userXP / 100) + 1;
  const currentXP = userXP % 100;
  const titleIndex = Math.min(level - 1, titles.length - 1);

  userLevelEl.textContent = level;
  userXpEl.textContent = currentXP;
  xpBarEl.style.width = `${currentXP}%`;
  userTitleEl.textContent = titles[titleIndex];
}

// Simpan Data Ke LocalStorage
function saveData() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Format Rupiah
function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
}

// Pembaruan Antarmuka (UI)
function updateUI() {
  calculateGamification();

  // Render Riwayat
  expenseList.innerHTML = '';
  let total = 0;

  expenses.slice().reverse().forEach((item) => {
    total += item.amount;
    const li = document.createElement('li');
    li.className = 'expense-item';
    li.innerHTML = `
      <div class="expense-item-info">
        <strong>${item.name}</strong>
        <span>${item.category} • ${item.date}</span>
      </div>
      <div class="expense-amount">- ${formatRupiah(item.amount)}</div>
    `;
    expenseList.appendChild(li);
  });

  totalExpenseEl.textContent = formatRupiah(total);
  updateChart();
}

// Inisialisasi Chart.js
function initChart() {
  const ctx = document.getElementById('expenseChart').getContext('2d');
  expenseChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: ['#f87171', '#38bdf8', '#fbbf24', '#34d399', '#a78bfa']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#fff' } }
      }
    }
  });
  updateChart();
}

// Pembaruan Data Grafik
function updateChart() {
  if (!expenseChart) return;

  const categories = {};
  expenses.forEach(item => {
    categories[item.category] = (categories[item.category] || 0) + item.amount;
  });

  expenseChart.data.labels = Object.keys(categories);
  expenseChart.data.datasets[0].data = Object.values(categories);
  expenseChart.update();
}
