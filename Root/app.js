document.addEventListener('DOMContentLoaded', async () => {
  // --- 1. DATA MANAGEMENT (API) ---
  const API_URL = "http://localhost:5000/api";
  
  const getToken = () => localStorage.getItem('bankify_token');

  const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
  if (!getToken() && !isIndexPage) {
    window.location.href = 'index.html';
    return;
  }

  // Handle Logout
  const logoutLinks = document.querySelectorAll('a[href="index.html"]');
  logoutLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Only trigger if it's the logout link (which usually has index.html or nav-item class)
      if (link.innerText.includes('Log out')) {
        localStorage.removeItem('bankify_token');
        localStorage.removeItem('bankify_user');
      }
    });
  });

  const getTransactions = async () => {
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      return await res.json();
    } catch(err) {
      console.error(err);
      return [];
    }
  };

  const addTransaction = async (transaction) => {
    try {
      await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(transaction)
      });
    } catch(err) {
      console.error(err);
    }
  };

  let cachedCategories = null;
  const getCategories = async (type) => {
    if (!cachedCategories) {
      try {
        const res = await fetch(`${API_URL}/transactions/categories`, {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (res.ok) {
          cachedCategories = await res.json();
        } else {
          cachedCategories = { Income: [], Expense: [] };
        }
      } catch(err) {
        console.error(err);
        cachedCategories = { Income: [], Expense: [] };
      }
    }
    return cachedCategories[type] || [];
  };

  const saveCategory = async (type, category) => {
    try {
      const res = await fetch(`${API_URL}/transactions/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ type, action: 'add', category })
      });
      const data = await res.json();
      if(data.success) cachedCategories[type] = data.categories;
    } catch(err) {
      console.error(err);
    }
  };

  const deleteCategory = async (type, category) => {
    try {
      const res = await fetch(`${API_URL}/transactions/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ type, action: 'remove', category })
      });
      const data = await res.json();
      if(data.success) cachedCategories[type] = data.categories;
    } catch(err) {
      console.error(err);
    }
  };

  const showCustomPrompt = (title, onConfirm, onCancel) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    const card = document.createElement('div');
    card.className = 'modal-card';
    
    const heading = document.createElement('div');
    heading.className = 'modal-title';
    heading.innerText = title;
    
    const fg = document.createElement('div');
    fg.className = 'form-group';
    fg.style.marginBottom = '0';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control';
    input.placeholder = 'e.g. Subscriptions';
    
    fg.appendChild(input);
    
    const actions = document.createElement('div');
    actions.className = 'modal-actions';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-secondary';
    cancelBtn.innerText = 'Cancel';
    
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn-primary';
    confirmBtn.style.width = 'auto'; // override default 100%
    confirmBtn.style.padding = '10px 24px';
    confirmBtn.innerText = 'Add';
    
    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);
    
    card.appendChild(heading);
    card.appendChild(fg);
    card.appendChild(actions);
    overlay.appendChild(card);
    
    document.body.appendChild(overlay);
    input.focus();
    
    const cleanup = () => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    };
    
    cancelBtn.addEventListener('click', () => {
      cleanup();
      if(onCancel) onCancel();
    });
    
    confirmBtn.addEventListener('click', () => {
      const val = input.value.trim();
      cleanup();
      if (val) onConfirm(val);
      else if (onCancel) onCancel();
    });
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = input.value.trim();
        cleanup();
        if (val) onConfirm(val);
        else if (onCancel) onCancel();
      } else if (e.key === 'Escape') {
        cleanup();
        if(onCancel) onCancel();
      }
    });
  };

  const showManagePrompt = (type, onRefresh) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    const card = document.createElement('div');
    card.className = 'modal-card';
    card.style.maxHeight = '80vh';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    
    const heading = document.createElement('div');
    heading.className = 'modal-title';
    heading.innerText = `Manage ${type} Categories`;
    
    const listContainer = document.createElement('div');
    listContainer.style.overflowY = 'auto';
    listContainer.style.flex = '1';
    listContainer.style.marginBottom = '24px';
    listContainer.style.display = 'flex';
    listContainer.style.flexDirection = 'column';
    listContainer.style.gap = '8px';

    const renderList = async () => {
      listContainer.innerHTML = '';
      const categories = await getCategories(type);
      categories.forEach(cat => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.padding = '12px 16px';
        row.style.border = '1px solid var(--border-light)';
        row.style.borderRadius = 'var(--radius-sm)';
        
        const name = document.createElement('span');
        name.className = 'font-semibold';
        name.innerText = cat;
        
        const removeBtn = document.createElement('button');
        removeBtn.style.color = 'var(--expense-red)';
        removeBtn.style.fontWeight = 'bold';
        removeBtn.style.fontSize = '24px';
        removeBtn.style.lineHeight = '1';
        removeBtn.style.padding = '0 8px';
        removeBtn.innerText = '−';
        removeBtn.title = 'Remove Category';
        removeBtn.addEventListener('click', async () => {
          if (confirm(`Remove "${cat}"?`)) {
            await deleteCategory(type, cat);
            renderList();
          }
        });
        
        row.appendChild(name);
        row.appendChild(removeBtn);
        listContainer.appendChild(row);
      });
    };
    renderList();
    
    const actions = document.createElement('div');
    actions.className = 'modal-actions';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-primary';
    closeBtn.style.width = '100%'; 
    closeBtn.innerText = 'Done';
    
    actions.appendChild(closeBtn);
    
    card.appendChild(heading);
    card.appendChild(listContainer);
    card.appendChild(actions);
    overlay.appendChild(card);
    
    document.body.appendChild(overlay);
    
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
      onRefresh();
    });
  };


  // --- 2. ADD TRANSACTION PAGE LOGIC ---
  const addTxForm = document.getElementById('add-transaction-form');
  if (addTxForm) {
    const categorySelect = document.getElementById('txt-category');
    
    const populateCategories = async (type) => {
      if (!categorySelect) return;
      const categories = await getCategories(type);
      let optionsHtml = '';
      categories.forEach(cat => {
        optionsHtml += `<option value="${cat}">${cat}</option>`;
      });
      optionsHtml += `<option value="__ADD_NEW__">+ Add category...</option>`;
      optionsHtml += `<option value="__MANAGE__">⚙️ Manage Categories...</option>`;
      categorySelect.innerHTML = optionsHtml;
    };

    // Initialize with default (Expense)
    populateCategories('Expense');

    // Handle dropdown "Add Category" logic
    if (categorySelect) {
      categorySelect.addEventListener('change', async (e) => {
        const currentTypeBtn = document.querySelector('.segment-btn.active');
        const currentType = currentTypeBtn ? currentTypeBtn.getAttribute('data-type') : 'Expense';

        if (e.target.value === '__ADD_NEW__') {
          showCustomPrompt('Add New Category', async (newCat) => {
            await saveCategory(currentType, newCat);
            await populateCategories(currentType);
            categorySelect.value = newCat;
          }, () => {
            // Revert back on cancel
            categorySelect.selectedIndex = 0;
          });
        } else if (e.target.value === '__MANAGE__') {
          showManagePrompt(currentType, async () => {
            await populateCategories(currentType);
            categorySelect.selectedIndex = 0;
          });
        }
      });
    }

    // Handle toggle buttons logic
    const segmentBtns = document.querySelectorAll('.segment-btn');
    segmentBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        segmentBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Dynamically change category options depending on type
        const type = btn.getAttribute('data-type');
        await populateCategories(type);
      });
    });

    addTxForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const typeBtn = document.querySelector('.segment-btn.active');
      const type = typeBtn ? typeBtn.getAttribute('data-type') : 'Expense';

      const amount = parseFloat(document.getElementById('txt-amount').value);
      const category = document.getElementById('txt-category').value;
      const date = document.getElementById('txt-date').value;

      if (!amount || amount <= 0) {
        alert('Please enter a valid amount.');
        return;
      }

      await addTransaction({
        type,
        amount,
        category,
        date
      });

      // Clear the form and redirect to dashboard
      addTxForm.reset();
      window.location.href = 'dashboard.html';
    });
  }


  // --- 3. DASHBOARD LOGIC ---
  const transactionsTbody = document.getElementById('transactions-tbody');
  if (transactionsTbody) {
    const transactions = await getTransactions();
    let totalExpense = 0;
    let totalIncome = 0;

    if (transactions.length === 0) {
      transactionsTbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-secondary" style="text-align: center">
            No records found.
          </td>
        </tr>
      `;
    } else {
      transactionsTbody.innerHTML = '';
      transactions.forEach(tx => {
        if (tx.type === 'Expense') {
          totalExpense += tx.amount;
        } else {
          totalIncome += tx.amount;
        }

        const dateObj = new Date(tx.date);
        const dateStr = dateObj.toLocaleDateString();

        // Style amount depending on type
        const amountDisplay = tx.type === 'Expense'
          ? `<span class="text-red">-${tx.amount.toFixed(2)} Mad</span>`
          : `<span class="text-green">+${tx.amount.toFixed(2)} Mad</span>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${dateStr}</td>
          <td>${amountDisplay}</td>
          <td>${tx.category}</td>
          <td><span class="text-secondary" style="font-size:12px;">${tx.type}</span></td>
        `;
        transactionsTbody.appendChild(tr);
      });
    }

    const totalBalance = totalIncome - totalExpense;

    document.getElementById('total-expense').innerText = `${totalExpense.toFixed(2)} Mad`;
    document.getElementById('total-income').innerText = `${totalIncome.toFixed(2)} Mad`;
    document.getElementById('total-balance').innerText = `${totalBalance.toFixed(2)} Mad`;
  }


  // --- 4. REPORTS LOGIC ---
  const donutChartCanvas = document.getElementById('donutChart');
  if (donutChartCanvas && typeof Chart !== 'undefined') {
    const transactions = await getTransactions();

    // Group only Expenses by category for the donut chart
    const expenseByCategory = {};
    const incomeByDate = {};
    const expenseByDate = {};

    transactions.forEach(tx => {
      const dateStr = tx.date; // YYYY-MM-DD
      if (tx.type === 'Expense') {
        expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
        expenseByDate[dateStr] = (expenseByDate[dateStr] || 0) + tx.amount;
      } else {
        incomeByDate[dateStr] = (incomeByDate[dateStr] || 0) + tx.amount;
      }
    });

    const categoryLabels = Object.keys(expenseByCategory);
    const categoryData = Object.values(expenseByCategory);

    // Chart.js global defaults for beautiful design
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = "#65676b";

    // Render Donut Chart (Expenses by Category)
    if (categoryLabels.length > 0) {
      new Chart(donutChartCanvas, {
        type: 'doughnut',
        data: {
          labels: categoryLabels,
          datasets: [{
            data: categoryData,
            backgroundColor: [
              '#0a66c2', // Primary blue
              '#34c759', // Green
              '#ff3b30', // Red
              '#f59e0b', // Orange
              '#8b5cf6', // Purple
              '#ec4899', // Pink
            ],
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            title: {
              display: true,
              text: 'Expenses by Category',
              font: { size: 16, weight: 'bold' },
              color: '#1c1e21'
            }
          },
          cutout: '70%'
        }
      });
    } else {
      // Empty state
      new Chart(donutChartCanvas, {
        type: 'doughnut',
        data: {
          labels: ['No Data'],
          datasets: [{ data: [1], backgroundColor: ['#ebedf0'], borderWidth: 0 }]
        },
        options: {
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'No Expenses Recorded' },
            tooltip: { enabled: false }
          },
          cutout: '70%'
        }
      });
    }

    // Optional: Render a simple Line Chart showing Income vs Expense over dates
    const lineChartCanvas = document.getElementById('lineChart');
    if (lineChartCanvas) {
      // Get unique sorted dates
      const allDatesArray = [...new Set([...Object.keys(incomeByDate), ...Object.keys(expenseByDate)])].sort();

      if (allDatesArray.length > 0) {
        const incomeTrend = allDatesArray.map(date => incomeByDate[date] || 0);
        const expenseTrend = allDatesArray.map(date => expenseByDate[date] || 0);

        new Chart(lineChartCanvas, {
          type: 'line',
          data: {
            labels: allDatesArray,
            datasets: [
              {
                label: 'Income',
                data: incomeTrend,
                borderColor: '#34c759',
                backgroundColor: 'rgba(52, 199, 89, 0.1)',
                fill: true,
                tension: 0.4
              },
              {
                label: 'Expense',
                data: expenseTrend,
                borderColor: '#ff3b30',
                backgroundColor: 'rgba(255, 59, 48, 0.1)',
                fill: true,
                tension: 0.4
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Cashflow Trend',
                font: { size: 16, weight: 'bold' },
                color: '#1c1e21'
              }
            },
            scales: {
              y: { beginAtZero: true }
            }
          }
        });
      } else {
        new Chart(lineChartCanvas, {
          type: 'line',
          data: {
            labels: ['Day 1', 'Day 2', 'Day 3'],
            datasets: [{ label: 'Empty', data: [0, 0, 0], borderColor: '#ebedf0' }]
          },
          options: { plugins: { title: { display: true, text: 'No Data for Trend' } } }
        });
      }
    }
  }

  // Set User Profile UI across pages if logged in
  const userText = document.querySelector('.user-profile .font-semibold');
  if (userText) {
    userText.innerText = localStorage.getItem('bankify_user') || 'User';
  }
});
