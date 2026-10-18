tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          500: '#8b5cf6',
          600: '#4f46e5',
          700: '#4338ca',
        }
      }
    }
  }
};
// Universal App State
const AppState = {
  apiBaseUrl: (window.ENV && window.ENV.API_URL) ? window.ENV.API_URL : 'http://localhost:5050/api',
  auth: {
    token: localStorage.getItem('excelinsight_token') || null,
    user: JSON.parse(localStorage.getItem('excelinsight_user') || 'null')
  },
  fileName: 'Dummy_Student_and_Employee_Data.xlsx',
  activeSheet: 'Students',
  sheets: {},
  currentRows: [],
  originalRows: [],
  filteredRows: [],
  columns: [],
  colMeta: {},
  grid: {
    page: 1,
    pageSize: 50,
    sortCol: null,
    sortDir: 'asc',
    searchQuery: '',
    columnFilter: 'all'
  },
  categoryChartInstance: null,
  studioChartInstance: null,
  threeJs: {
    renderer: null,
    scene: null,
    camera: null,
    animationId: null
  },
  lastAiInsight: ''
};

// Preloaded Datasets
const SAMPLE_DATASETS = {
  sales: {
    fileName: 'Sales_Performance_Q3.xlsx',
    sheets: {
      'Sales': [
        { "OrderID": "SO-1001", "Region": "North America", "Category": "Electronics", "SubCategory": "Laptops", "Sales": 10500, "Profit": 2100, "Units": 14 },
        { "OrderID": "SO-1002", "Region": "Europe", "Category": "Furniture", "SubCategory": "Chairs", "Sales": 3000, "Profit": 450, "Units": 25 },
        { "OrderID": "SO-1003", "Region": "Asia Pacific", "Category": "Office Supplies", "SubCategory": "Paper", "Sales": 1200, "Profit": 320, "Units": 80 },
        { "OrderID": "SO-1004", "Region": "North America", "Category": "Furniture", "SubCategory": "Desks", "Sales": 3600, "Profit": 720, "Units": 8 },
        { "OrderID": "SO-1005", "Region": "Europe", "Category": "Electronics", "SubCategory": "Monitors", "Sales": 6600, "Profit": 1650, "Units": 30 },
        { "OrderID": "SO-1006", "Region": "Latin America", "Category": "Office Supplies", "SubCategory": "Binders", "Sales": 810, "Profit": 190, "Units": 45 },
        { "OrderID": "SO-1007", "Region": "Asia Pacific", "Category": "Electronics", "SubCategory": "Smartphones", "Sales": 13200, "Profit": 3300, "Units": 22 },
        { "OrderID": "SO-1008", "Region": "Middle East", "Category": "Furniture", "SubCategory": "Bookcases", "Sales": 3720, "Profit": 600, "Units": 12 },
        { "OrderID": "SO-1009", "Region": "North America", "Category": "Office Supplies", "SubCategory": "Storage", "Sales": 1400, "Profit": 280, "Units": 35 },
        { "OrderID": "SO-1010", "Region": "Europe", "Category": "Electronics", "SubCategory": "Accessories", "Sales": 2250, "Profit": 700, "Units": 90 },
        { "OrderID": "SO-1011", "Region": "Asia Pacific", "Category": "Furniture", "SubCategory": "Tables", "Sales": 3300, "Profit": 420, "Units": 6 },
        { "OrderID": "SO-1012", "Region": "Latin America", "Category": "Electronics", "SubCategory": "Laptops", "Sales": 7200, "Profit": 1400, "Units": 10 },
        { "OrderID": "SO-1013", "Region": "Middle East", "Category": "Electronics", "SubCategory": "Smartphones", "Sales": 8900, "Profit": 1900, "Units": 15 },
        { "OrderID": "SO-1014", "Region": "North America", "Category": "Furniture", "SubCategory": "Chairs", "Sales": 4500, "Profit": 850, "Units": 20 },
        { "OrderID": "SO-1015", "Region": "Europe", "Category": "Office Supplies", "SubCategory": "Paper", "Sales": 950, "Profit": 210, "Units": 50 },
        { "OrderID": "SO-1016", "Region": "Asia Pacific", "Category": "Office Supplies", "SubCategory": "Binders", "Sales": 1100, "Profit": 240, "Units": 60 },
        { "OrderID": "SO-1017", "Region": "Latin America", "Category": "Furniture", "SubCategory": "Desks", "Sales": 2900, "Profit": -45, "Units": 7 },
        { "OrderID": "SO-1018", "Region": "Middle East", "Category": "Office Supplies", "SubCategory": "Storage", "Sales": 1650, "Profit": 310, "Units": 28 }
      ],
      'Targets': [
        { "Region": "North America", "Target": 25000 },
        { "Region": "Europe", "Target": 18000 },
        { "Region": "Asia Pacific", "Target": 20000 }
      ]
    }
  },
  students: {
    fileName: 'Dummy_Student_and_Employee_Data.xlsx',
    sheets: {
      'Students': [
        { "StudentID": "STU-001", "Name": "Aarav Sharma", "Gender": "Male", "Class": "12-B", "Math": 52, "Physics": 46, "Chemistry": 92, "English": 62 },
        { "StudentID": "STU-002", "Name": "Aditya Sharma", "Gender": "Female", "Class": "10-B", "Math": 53, "Physics": 92, "Chemistry": 51, "English": 88 },
        { "StudentID": "STU-003", "Name": "Arjun Sharma", "Gender": "Male", "Class": "12-A", "Math": 50, "Physics": 82, "Chemistry": 72, "English": 47 },
        { "StudentID": "STU-004", "Name": "Kabir Sharma", "Gender": "Female", "Class": "10-A", "Math": 58, "Physics": 59, "Chemistry": 65, "English": 70 },
        { "StudentID": "STU-005", "Name": "Diya Patel", "Gender": "Female", "Class": "10-A", "Math": 88, "Physics": 78, "Chemistry": 85, "English": 90 },
        { "StudentID": "STU-006", "Name": "Ishaan Verma", "Gender": "Male", "Class": "11-A", "Math": 70, "Physics": 75, "Chemistry": 68, "English": 72 },
        { "StudentID": "STU-007", "Name": "Kavya Nair", "Gender": "Female", "Class": "11-B", "Math": 65, "Physics": 70, "Chemistry": 80, "English": 70 },
        { "StudentID": "STU-008", "Name": "Rohan Gupta", "Gender": "Male", "Class": "10-A", "Math": 92, "Physics": 85, "Chemistry": 89, "English": 78 },
        { "StudentID": "STU-009", "Name": "Ananya Iyer", "Gender": "Female", "Class": "12-A", "Math": 78, "Physics": 84, "Chemistry": 80, "English": 82 },
        { "StudentID": "STU-010", "Name": "Manish Kumar", "Gender": "Male", "Class": "10-B", "Math": 60, "Physics": 58, "Chemistry": 62, "English": 64 },
        { "StudentID": "STU-011", "Name": "Pooja Reddy", "Gender": "Female", "Class": "12-B", "Math": 85, "Physics": 80, "Chemistry": 76, "English": 84 },
        { "StudentID": "STU-012", "Name": "Varun Joshi", "Gender": "Male", "Class": "11-A", "Math": 45, "Physics": 52, "Chemistry": 50, "English": 58 },
        { "StudentID": "STU-013", "Name": "Sneha Kulkarni", "Gender": "Female", "Class": "11-B", "Math": 72, "Physics": 76, "Chemistry": 74, "English": 68 },
        { "StudentID": "STU-014", "Name": "Karan Mehra", "Gender": "Male", "Class": "10-A", "Math": 58, "Physics": 64, "Chemistry": 60, "English": 62 },
        { "StudentID": "STU-015", "Name": "Meera Rao", "Gender": "Female", "Class": "12-B", "Math": 90, "Physics": 88, "Chemistry": 92, "English": 85 },
        { "StudentID": "STU-016", "Name": "Nikhil Bose", "Gender": "Male", "Class": "10-B", "Math": 74, "Physics": 70, "Chemistry": 68, "English": 72 },
        { "StudentID": "STU-017", "Name": "Priya Sen", "Gender": "Female", "Class": "12-A", "Math": 48, "Physics": 50, "Chemistry": 52, "English": 60 },
        { "StudentID": "STU-018", "Name": "Siddharth Das", "Gender": "Male", "Class": "11-A", "Math": 82, "Physics": 80, "Chemistry": 85, "English": 79 }
      ],
      'Employees': [
        { "EmpID": "EMP-101", "FullName": "Rajesh Kumar", "Department": "Engineering", "Location": "Delhi", "MonthlySalary": 85000, "ExperienceYears": 6, "Status": "Active" },
        { "EmpID": "EMP-102", "FullName": "Sunita Verma", "Department": "Finance", "Location": "Mumbai", "MonthlySalary": 72000, "ExperienceYears": 4, "Status": "Active" },
        { "EmpID": "EMP-103", "FullName": "Amit Singh", "Department": "Human Resources", "Location": "Delhi ", "MonthlySalary": 62000, "ExperienceYears": 3, "Status": "Active" },
        { "EmpID": "EMP-104", "FullName": "Priya Nair", "Department": "Engineering", "Location": "Bangalore", "MonthlySalary": 96000, "ExperienceYears": 8, "Status": "Active" },
        { "EmpID": "EMP-105", "FullName": "Vikram Patel", "Department": "Marketing", "Location": "Delhi", "MonthlySalary": 58000, "ExperienceYears": 2, "Status": "On Leave" },
        { "EmpID": "EMP-106", "FullName": "Ananya Roy", "Department": "Finance", "Location": "Bangalore", "MonthlySalary": 79000, "ExperienceYears": 5, "Status": "Active" }
      ]
    }
  },
  employees: {
    fileName: 'HR_Payroll_Directory.xlsx',
    sheets: {
      'Staff': [
        { "EmpID": "EMP-101", "FullName": "Rajesh Kumar", "Department": "Engineering", "Location": "Delhi", "MonthlySalary": 85000, "ExperienceYears": 6, "Status": "Active" },
        { "EmpID": "EMP-102", "FullName": "Sunita Verma", "Department": "Finance", "Location": "Mumbai", "MonthlySalary": 72000, "ExperienceYears": 4, "Status": "Active" },
        { "EmpID": "EMP-103", "FullName": "Amit Singh", "Department": "Human Resources", "Location": "Delhi ", "MonthlySalary": 62000, "ExperienceYears": 3, "Status": "Active" },
        { "EmpID": "EMP-104", "FullName": "Priya Nair", "Department": "Engineering", "Location": "Bangalore", "MonthlySalary": 96000, "ExperienceYears": 8, "Status": "Active" },
        { "EmpID": "EMP-105", "FullName": "Vikram Patel", "Department": "Marketing", "Location": "Delhi", "MonthlySalary": 58000, "ExperienceYears": 2, "Status": "On Leave" },
        { "EmpID": "EMP-106", "FullName": "Ananya Roy", "Department": "Finance", "Location": "Bangalore", "MonthlySalary": 79000, "ExperienceYears": 5, "Status": "Active" }
      ]
    }
  }
};
window.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  checkAuthState();
  loadSampleDataset('sales'); // Matches screenshot default (OrderID, Region, Category, Sales, Profit)

  // Dismiss dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    const sBtn = document.getElementById('sampleDropdownBtn');
    const sMenu = document.getElementById('sampleDropdownMenu');
    if (sBtn && sMenu && !sBtn.contains(e.target) && !sMenu.contains(e.target)) {
      sMenu.classList.add('hidden');
    }

    const eBtn = document.getElementById('exportDropdownBtn');
    const eMenu = document.getElementById('exportDropdownMenu');
    if (eBtn && eMenu && !eBtn.contains(e.target) && !eMenu.contains(e.target)) {
      eMenu.classList.add('hidden');
    }
  });
});

function toggleSampleMenu() {
  document.getElementById('sampleDropdownMenu').classList.toggle('hidden');
}
function toggleExportMenu() {
  document.getElementById('exportDropdownMenu').classList.toggle('hidden');
}

function loadSampleDataset(key) {
  const sample = SAMPLE_DATASETS[key];
  if (!sample) return;
  AppState.fileName = sample.fileName;
  AppState.sheets = JSON.parse(JSON.stringify(sample.sheets));
  AppState.activeSheet = Object.keys(sample.sheets)[0];
  loadActiveSheet();
  showToast(`Loaded ${sample.fileName}`);
  document.getElementById('sampleDropdownMenu').classList.add('hidden');
}

function switchSheet(sheetName) {
  if (!AppState.sheets[sheetName]) return;
  AppState.activeSheet = sheetName;
  loadActiveSheet();
}

function loadActiveSheet() {
  const rows = AppState.sheets[AppState.activeSheet] || [];
  AppState.originalRows = JSON.parse(JSON.stringify(rows));
  AppState.currentRows = JSON.parse(JSON.stringify(rows));
  AppState.filteredRows = [...AppState.currentRows];

  analyzeColumns();

  // Update banner indicators
  document.getElementById('bannerFileName').textContent = AppState.fileName;
  document.getElementById('bannerRowCount').textContent = `${AppState.currentRows.length} Rows`;
  document.getElementById('bannerColCount').textContent = `${AppState.columns.length} Columns`;

  renderSheetPills();
  populateDropdowns();

  // Reset grid pagination and filters
  AppState.grid.page = 1;
  AppState.grid.searchQuery = '';
  AppState.grid.columnFilter = 'all';
  AppState.grid.sortCol = null;
  document.getElementById('gridSearchInput').value = '';

  // Render tab panels
  renderGridData();
  renderColumnProfiles();
  runCategoryAggregation();
  renderStudioChart();
  updateKpiCards();
  populatePivotDropdowns();
  renderPivotMatrix();
  populateDiffDropdowns();
  populateAnomalyDropdown();

  lucide.createIcons();
}

function renderSheetPills() {
  const container = document.getElementById('sheetPillContainer');
  container.innerHTML = '';
  const sheetNames = Object.keys(AppState.sheets);

  sheetNames.forEach(name => {
    const btn = document.createElement('button');
    const isActive = name === AppState.activeSheet;
    btn.onclick = () => switchSheet(name);
    btn.className = `px-3.5 py-1 rounded-full text-xs font-semibold transition shrink-0 ${
      isActive
        ? 'bg-indigo-600 text-white shadow-xs'
        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
    }`;
    btn.textContent = name;
    container.appendChild(btn);
  });
}

function analyzeColumns() {
  if (AppState.currentRows.length === 0) {
    AppState.columns = [];
    AppState.colMeta = {};
    return;
  }

  AppState.columns = Object.keys(AppState.currentRows[0]);
  AppState.colMeta = {};

  AppState.columns.forEach(col => {
    let nonNull = 0;
    let numCount = 0;
    let sum = 0;
    let min = Infinity;
    let max = -Infinity;
    const freqMap = {};

    AppState.currentRows.forEach(row => {
      const val = row[col];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        nonNull++;
        const strVal = String(val).trim();
        freqMap[strVal] = (freqMap[strVal] || 0) + 1;

        const n = Number(val);
        if (!isNaN(n) && typeof val !== 'boolean') {
          numCount++;
          sum += n;
          if (n < min) min = n;
          if (n > max) max = n;
        }
      }
    });

    // Column typing
    const isNumeric = nonNull > 0 && (numCount / nonNull) > 0.6;
    const distinctKeys = Object.keys(freqMap);
    let modeKey = '-';
    let modeCount = 0;

    distinctKeys.forEach(k => {
      if (freqMap[k] > modeCount) {
        modeCount = freqMap[k];
        modeKey = k;
      }
    });

    AppState.colMeta[col] = {
      type: isNumeric ? 'numeric' : 'categorical',
      nonNull,
      nullCount: AppState.currentRows.length - nonNull,
      percentFilled: Math.round((nonNull / (AppState.currentRows.length || 1)) * 100),
      distinctCount: distinctKeys.length,
      sum: isNumeric ? sum : null,
      avg: isNumeric && numCount > 0 ? (sum / numCount) : null,
      min: isNumeric && numCount > 0 ? min : null,
      max: isNumeric && numCount > 0 ? max : null,
      mode: modeKey,
      modeCount
    };
  });
}

function populateDropdowns() {
  // 1. Grid Column Filter
  const gridColSelect = document.getElementById('gridColumnFilterSelect');
  gridColSelect.innerHTML = '<option value="all">All Columns</option>';
  AppState.columns.forEach(col => {
    gridColSelect.innerHTML += `<option value="${col}">${col}</option>`;
  });

  // 2. Category Aggregation Selectors
  const catGroup = document.getElementById('categoryGroupSelect');
  const catMetric = document.getElementById('categoryMetricSelect');
  catGroup.innerHTML = '';
  catMetric.innerHTML = '';

  AppState.columns.forEach(col => {
    catGroup.innerHTML += `<option value="${col}">${col}</option>`;
  });

  const numCols = AppState.columns.filter(c => AppState.colMeta[c]?.type === 'numeric');
  (numCols.length > 0 ? numCols : AppState.columns).forEach(col => {
    catMetric.innerHTML += `<option value="${col}">${col}</option>`;
  });

  // Defaults
  const catCol = AppState.columns.find(c => AppState.colMeta[c]?.type === 'categorical');
  if (catCol) catGroup.value = catCol;
  if (numCols.length > 0) catMetric.value = numCols[0];

  // 3. Studio Chart Selectors
  const studioX = document.getElementById('studioXCol');
  const studioY = document.getElementById('studioYCol');
  studioX.innerHTML = '';
  studioY.innerHTML = '';

  AppState.columns.forEach(c => studioX.innerHTML += `<option value="${c}">${c}</option>`);
  (numCols.length > 0 ? numCols : AppState.columns).forEach(c => studioY.innerHTML += `<option value="${c}">${c}</option>`);

  if (catCol) studioX.value = catCol;
  if (numCols.length > 0) studioY.value = numCols[0];
}

// Exact recreation of the Column Profiles & Data Health cards shown in screenshot
function renderColumnProfiles() {
  const container = document.getElementById('columnProfilesContainer');
  container.innerHTML = '';

  AppState.columns.forEach(col => {
    const meta = AppState.colMeta[col];
    const isNumeric = meta.type === 'numeric';

    // Format numbers cleanly (e.g. 3100 -> 3.1k)
    const formatVal = (val) => {
      if (val === null || val === undefined || isNaN(val)) return '-';
      if (Math.abs(val) >= 1000000) return (val / 1000000).toFixed(1) + 'M';
      if (Math.abs(val) >= 1000) return (val / 1000).toFixed(1) + 'k';
      return Number.isInteger(val) ? val : val.toFixed(1);
    };

    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3';

    // Pill badge colors matching screenshot
    const badgeHtml = isNumeric
      ? `<span class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200/70">numeric</span>`
      : `<span class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200/70">categorical</span>`;

    let metricsHtml = '';
    if (isNumeric) {
      metricsHtml = `
        <div class="flex justify-between items-center text-xs font-mono text-slate-500">
          <span>Filled:</span>
          <span class="font-medium text-slate-800">${meta.nonNull} (${meta.percentFilled}%)</span>
        </div>
        <div class="flex justify-between items-center text-xs font-mono text-slate-500">
          <span>Unique:</span>
          <span class="font-medium text-slate-800">${meta.distinctCount}</span>
        </div>
        <div class="flex justify-between items-center text-xs font-mono text-slate-500">
          <span>Min:</span>
          <span class="font-medium text-slate-800">${formatVal(meta.min)}</span>
        </div>
        <div class="flex justify-between items-center text-xs font-mono text-slate-500">
          <span>Max:</span>
          <span class="font-medium text-slate-800">${formatVal(meta.max)}</span>
        </div>
        <div class="flex justify-between items-center text-xs font-mono text-slate-500">
          <span>Mean:</span>
          <span class="font-medium text-indigo-600">${formatVal(meta.avg)}</span>
        </div>
        <div class="flex justify-between items-center text-xs font-mono text-slate-500">
          <span>Sum:</span>
          <span class="font-medium text-slate-800">${formatVal(meta.sum)}</span>
        </div>
      `;
    } else {
      metricsHtml = `
        <div class="flex justify-between items-center text-xs font-mono text-slate-500">
          <span>Filled:</span>
          <span class="font-medium text-slate-800">${meta.nonNull} (${meta.percentFilled}%)</span>
        </div>
        <div class="flex justify-between items-center text-xs font-mono text-slate-500">
          <span>Unique:</span>
          <span class="font-medium text-slate-800">${meta.distinctCount}</span>
        </div>
        <div class="flex justify-between items-center text-xs font-mono text-slate-500">
          <span>Top Value:</span>
          <span class="font-medium text-slate-800 truncate max-w-[150px]">${meta.mode}</span>
        </div>
        <div class="flex justify-between items-center text-xs font-mono text-slate-500">
          <span>Frequency:</span>
          <span class="font-medium text-slate-800">${meta.modeCount}x</span>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="flex items-center justify-between pb-1 border-b border-slate-100">
        <h4 class="font-bold text-sm text-slate-900 truncate" title="${col}">${col}</h4>
        ${badgeHtml}
      </div>

      <div class="space-y-1.5 pt-1">
        ${metricsHtml}
      </div>

      <!-- Completeness Bar -->
      <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
        <div class="h-full ${meta.percentFilled === 100 ? 'bg-emerald-500' : 'bg-amber-500'}" style="width: ${meta.percentFilled}%"></div>
      </div>
    `;

    container.appendChild(card);
  });
}

// Quick Data Transformations Handlers
function hygieneRemoveDuplicates() {
  const initial = AppState.currentRows.length;
  const seen = new Set();
  AppState.currentRows = AppState.currentRows.filter(row => {
    const s = JSON.stringify(row);
    if (seen.has(s)) return false;
    seen.add(s);
    return true;
  });

  const removed = initial - AppState.currentRows.length;
  refreshPostTransformation(`Removed ${removed} duplicate row(s)`);
}

function hygieneStripNullRows() {
  const initial = AppState.currentRows.length;
  AppState.currentRows = AppState.currentRows.filter(row => {
    return Object.values(row).some(v => v !== undefined && v !== null && String(v).trim() !== '');
  });

  const removed = initial - AppState.currentRows.length;
  refreshPostTransformation(`Stripped ${removed} empty/blank row(s)`);
}

function hygieneTrimWhitespace() {
  let count = 0;
  AppState.currentRows.forEach(row => {
    Object.keys(row).forEach(k => {
      if (typeof row[k] === 'string') {
        const trimmed = row[k].trim().replace(/\s+/g, ' ');
        if (trimmed !== row[k]) {
          row[k] = trimmed;
          count++;
        }
      }
    });
  });
  refreshPostTransformation(`Trimmed and standardized ${count} cell(s) with trailing spaces`);
}

function hygieneRestoreOriginal() {
  AppState.currentRows = JSON.parse(JSON.stringify(AppState.originalRows));
  refreshPostTransformation('Restored original dataset successfully');
}

function refreshPostTransformation(message) {
  analyzeColumns();
  document.getElementById('bannerRowCount').textContent = `${AppState.currentRows.length} Rows`;
  renderGridData();
  renderColumnProfiles();
  runCategoryAggregation();
  renderStudioChart();
  showToast(message);
}

// Grid Rendering
function renderGridData() {
  const colFilter = document.getElementById('gridColumnFilterSelect').value;
  const search = (document.getElementById('gridSearchInput').value || '').toLowerCase().trim();

  let list = [...AppState.currentRows];
  if (search) {
    list = list.filter(row => {
      if (colFilter === 'all') {
        return AppState.columns.some(col => String(row[col] ?? '').toLowerCase().includes(search));
      } else {
        return String(row[colFilter] ?? '').toLowerCase().includes(search);
      }
    });
  }

  if (AppState.grid.sortCol) {
    const col = AppState.grid.sortCol;
    const dir = AppState.grid.sortDir === 'asc' ? 1 : -1;
    const isNum = AppState.colMeta[col]?.type === 'numeric';

    list.sort((a, b) => {
      const valA = a[col];
      const valB = b[col];
      if (isNum) return (Number(valA || 0) - Number(valB || 0)) * dir;
      return String(valA || '').localeCompare(String(valB || '')) * dir;
    });
  }

  AppState.filteredRows = list;

  document.getElementById('gridShowingCountLabel').textContent =
    `Showing ${list.length} of ${AppState.currentRows.length}`;

  renderGridHeaders();
  renderGridRows();
  updateGridPagination();
}

function renderGridHeaders() {
  const tr = document.getElementById('gridHeaderRow');
  tr.innerHTML = '';

  const thIdx = document.createElement('th');
  thIdx.className = 'py-3 px-3.5 w-12 text-slate-400 font-semibold border-r border-slate-100/80';
  thIdx.textContent = '#';
  tr.appendChild(thIdx);

  AppState.columns.forEach(col => {
    const meta = AppState.colMeta[col];
    const isNumeric = meta?.type === 'numeric';
    const isSorted = AppState.grid.sortCol === col;
    const th = document.createElement('th');
    th.className = 'py-3 px-3.5 font-semibold text-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-100 transition select-none';
    th.onclick = () => sortGridBy(col);

    let sortIcon = '<i data-lucide="chevrons-up-down" class="w-3 h-3 text-slate-300 inline ml-1"></i>';
    if (isSorted) {
      sortIcon = AppState.grid.sortDir === 'asc'
        ? '<i data-lucide="chevron-up" class="w-3 h-3 text-indigo-600 inline ml-1"></i>'
        : '<i data-lucide="chevron-down" class="w-3 h-3 text-indigo-600 inline ml-1"></i>';
    }

    const typeBadge = isNumeric
      ? '<span class="text-[9.5px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/60">123</span>'
      : '<span class="text-[9.5px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">ABC</span>';

    th.innerHTML = `
      <div class="flex items-center justify-between gap-3">
        <span>${col}</span>
        <div class="flex items-center gap-1.5">
          ${typeBadge}
          ${sortIcon}
        </div>
      </div>
    `;
    tr.appendChild(th);
  });

  lucide.createIcons();
}

function renderGridRows() {
  const tbody = document.getElementById('gridTableBody');
  tbody.innerHTML = '';

  const { page, pageSize } = AppState.grid;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageRows = AppState.filteredRows.slice(start, end);

  if (pageRows.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="${AppState.columns.length + 1}" class="py-12 text-center text-slate-400">
          No matching records found.
        </td>
      </tr>
    `;
    return;
  }

  pageRows.forEach((row, i) => {
    const rowNumber = start + i + 1;
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-indigo-50/30 transition-colors border-b border-slate-100';

    let html = `<td class="py-2.5 px-3.5 text-slate-400 font-mono text-[11px] border-r border-slate-100/80">${rowNumber}</td>`;

    AppState.columns.forEach(col => {
      const val = row[col];
      const isNum = AppState.colMeta[col]?.type === 'numeric';
      const displayVal = (val === null || val === undefined || String(val).trim() === '')
        ? '<span class="text-slate-300 italic">null</span>'
        : String(val);

      html += `<td data-row-idx="${start + i}" data-col="${col}" ondblclick="makeCellEditable(this)" title="Double click to edit" class="py-2.5 px-3.5 whitespace-nowrap text-slate-700 cursor-cell hover:bg-amber-50/70 transition-colors ${isNum ? 'font-mono text-right' : ''}">${displayVal}</td>`;
    });

    tr.innerHTML = html;
    tbody.appendChild(tr);
  });
}

function sortGridBy(col) {
  if (AppState.grid.sortCol === col) {
    AppState.grid.sortDir = AppState.grid.sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    AppState.grid.sortCol = col;
    AppState.grid.sortDir = 'asc';
  }
  renderGridData();
}

function handleGridSearch(val) {
  AppState.grid.searchQuery = val;
  AppState.grid.page = 1;
  renderGridData();
}

function resetGridSearch() {
  document.getElementById('gridSearchInput').value = '';
  document.getElementById('gridColumnFilterSelect').value = 'all';
  AppState.grid.sortCol = null;
  AppState.grid.page = 1;
  renderGridData();
}

function updateGridPagination() {
  const total = AppState.filteredRows.length;
  const totalPages = Math.ceil(total / AppState.grid.pageSize) || 1;
  document.getElementById('gridPageIndicator').textContent = `Page ${AppState.grid.page} of ${totalPages}`;
  document.getElementById('btnGridPrev').disabled = AppState.grid.page <= 1;
  document.getElementById('btnGridNext').disabled = AppState.grid.page >= totalPages;
}

function navigateGridPage(delta) {
  const totalPages = Math.ceil(AppState.filteredRows.length / AppState.grid.pageSize) || 1;
  const newPage = AppState.grid.page + delta;
  if (newPage >= 1 && newPage <= totalPages) {
    AppState.grid.page = newPage;
    renderGridRows();
    updateGridPagination();
  }
}

function changeGridPageSize(size) {
  AppState.grid.pageSize = Number(size);
  AppState.grid.page = 1;
  renderGridData();
}

// Category Summary & Averages Engine
function runCategoryAggregation() {
  const groupCol = document.getElementById('categoryGroupSelect').value;
  const metricCol = document.getElementById('categoryMetricSelect').value;

  if (!groupCol || !metricCol) return;

  const groupMap = {};
  let grandTotalSum = 0;
  let grandTotalCount = 0;

  AppState.currentRows.forEach(row => {
    const key = String(row[groupCol] || '(Blank)').trim();
    const val = Number(row[metricCol]) || 0;

    if (!groupMap[key]) {
      groupMap[key] = { count: 0, sum: 0, min: Infinity, max: -Infinity };
    }

    groupMap[key].count++;
    groupMap[key].sum += val;
    grandTotalSum += val;
    grandTotalCount++;

    if (val < groupMap[key].min) groupMap[key].min = val;
    if (val > groupMap[key].max) groupMap[key].max = val;
  });

  const categories = Object.keys(groupMap).sort();
  const tbody = document.getElementById('categoryTableBody');
  const tfoot = document.getElementById('categoryTableFoot');
  tbody.innerHTML = '';
  tfoot.innerHTML = '';

  const chartLabels = [];
  const chartAverages = [];

  categories.forEach(cat => {
    const item = groupMap[cat];
    const avg = item.sum / (item.count || 1);
    const pctOfTotal = grandTotalSum > 0 ? ((item.sum / grandTotalSum) * 100) : 0;

    chartLabels.push(cat);
    chartAverages.push(parseFloat(avg.toFixed(2)));

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition border-b border-slate-100';
    tr.innerHTML = `
      <td class="py-2.5 px-3 font-sans font-semibold text-slate-900">${cat}</td>
      <td class="py-2.5 px-3">${item.count.toLocaleString()}</td>
      <td class="py-2.5 px-3 font-semibold">${item.sum.toLocaleString(undefined, { maximumFractionDigits: 1 })}</td>
      <td class="py-2.5 px-3 font-bold text-indigo-600">${avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
      <td class="py-2.5 px-3 text-slate-500">${item.min === Infinity ? '-' : item.min}</td>
      <td class="py-2.5 px-3 text-slate-500">${item.max === -Infinity ? '-' : item.max}</td>
      <td class="py-2.5 px-3 text-right font-medium">${pctOfTotal.toFixed(1)}%</td>
    `;
    tbody.appendChild(tr);
  });

  const overallAvg = grandTotalSum / (grandTotalCount || 1);
  tfoot.innerHTML = `
    <tr>
      <td class="py-2.5 px-3">Grand Total (${categories.length} Categories)</td>
      <td class="py-2.5 px-3">${grandTotalCount.toLocaleString()}</td>
      <td class="py-2.5 px-3">${grandTotalSum.toLocaleString(undefined, { maximumFractionDigits: 1 })}</td>
      <td class="py-2.5 px-3 text-indigo-700">${overallAvg.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
      <td class="py-2.5 px-3">-</td>
      <td class="py-2.5 px-3">-</td>
      <td class="py-2.5 px-3 text-right">100.0%</td>
    </tr>
  `;

  document.getElementById('categoryChartTitle').textContent = `Average ${metricCol} by ${groupCol}`;

  const ctx = document.getElementById('categoryChartCanvas').getContext('2d');
  if (AppState.categoryChartInstance) AppState.categoryChartInstance.destroy();

  AppState.categoryChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartLabels,
      datasets: [{
        label: `Average ${metricCol}`,
        data: chartAverages,
        backgroundColor: '#4f46e5',
        borderRadius: 6,
        barThickness: categories.length > 8 ? undefined : 28
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` Average ${metricCol}: ${ctx.raw}`
          }
        }
      },
      scales: {
        y: { ticks: { font: { family: 'Inter', size: 10 } }, grid: { color: '#f1f5f9' } },
        x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 10 } } }
      }
    }
  });
}

// Chart Studio with 2D Chart.js and 3D Three.js
function renderStudioChart() {
  const xCol = document.getElementById('studioXCol').value;
  const yCol = document.getElementById('studioYCol').value;
  const type = document.getElementById('studioChartType').value;
  const agg = document.getElementById('studioAgg').value;

  if (!xCol || !yCol) return;

  const canvas = document.getElementById('studioChartCanvas');
  const threeContainer = document.getElementById('threeJsCanvasContainer');

  // Handle 3D Three.js Visualization
  if (type === '3d-column') {
    canvas.classList.add('hidden');
    threeContainer.classList.remove('hidden');
    if (AppState.studioChartInstance) {
      AppState.studioChartInstance.destroy();
      AppState.studioChartInstance = null;
    }
    renderThreeJsColumns(xCol, yCol, agg);
    document.getElementById('studioChartTitle').textContent = `3D Column Visualizer: ${agg.toUpperCase()} of ${yCol} by ${xCol}`;
    document.getElementById('studioChartDesc').textContent = 'Rendered in interactive WebGL with real-time lighting and shadows';
    return;
  }

  // Restore 2D Canvas
  threeContainer.classList.add('hidden');
  canvas.classList.remove('hidden');
  cleanupThreeJs();

  const grouped = {};
  AppState.currentRows.forEach(row => {
    const k = String(row[xCol] || '(Blank)').trim();
    const v = Number(row[yCol]) || 0;

    if (!grouped[k]) {
      grouped[k] = { sum: 0, count: 0, min: Infinity, max: -Infinity };
    }
    grouped[k].sum += v;
    grouped[k].count++;
    if (v < grouped[k].min) grouped[k].min = v;
    if (v > grouped[k].max) grouped[k].max = v;
  });

  const labels = Object.keys(grouped);
  const data = labels.map(k => {
    const item = grouped[k];
    if (agg === 'avg') return parseFloat((item.sum / (item.count || 1)).toFixed(2));
    if (agg === 'count') return item.count;
    if (agg === 'max') return item.max;
    if (agg === 'min') return item.min;
    return item.sum;
  });

  const ctx = canvas.getContext('2d');
  if (AppState.studioChartInstance) AppState.studioChartInstance.destroy();

  const palette = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b', '#3b82f6', '#14b8a6', '#f97316'];

  let chartConfigType = type;
  let chartDatasets = [];

  if (type === 'area') {
    chartConfigType = 'line';
    chartDatasets = [{
      label: `${agg.toUpperCase()}(${yCol})`,
      data: data,
      fill: true,
      backgroundColor: 'rgba(79, 70, 229, 0.25)',
      borderColor: '#4f46e5',
      tension: 0.35,
      borderWidth: 2
    }];
  } else if (type === 'scatter') {
    chartConfigType = 'scatter';
    const scatterPoints = AppState.currentRows.map(r => ({
      x: Number(r[xCol]) || 0,
      y: Number(r[yCol]) || 0
    })).filter(p => !isNaN(p.x) && !isNaN(p.y));

    chartDatasets = [{
      label: `${yCol} vs ${xCol}`,
      data: scatterPoints,
      backgroundColor: '#4f46e5',
      borderColor: '#4338ca',
      pointRadius: 5
    }];
  } else if (type === 'radar') {
    chartConfigType = 'radar';
    chartDatasets = [{
      label: `${agg.toUpperCase()}(${yCol})`,
      data: data,
      backgroundColor: 'rgba(79, 70, 229, 0.25)',
      borderColor: '#4f46e5',
      borderWidth: 2
    }];
  } else {
    chartDatasets = [{
      label: `${agg.toUpperCase()}(${yCol})`,
      data: data,
      backgroundColor: ['doughnut', 'pie'].includes(type) ? palette : '#4f46e5',
      borderWidth: 1.5,
      borderColor: '#ffffff',
      borderRadius: type === 'bar' ? 6 : 0
    }];
  }

  AppState.studioChartInstance = new Chart(ctx, {
    type: chartConfigType,
    data: {
      labels: type === 'scatter' ? undefined : labels,
      datasets: chartDatasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: ['doughnut', 'pie', 'radar'].includes(type),
          position: 'bottom',
          labels: { boxWidth: 10, font: { family: 'Inter', size: 10 } }
        }
      },
      scales: ['doughnut', 'pie', 'radar'].includes(type) ? {} : {
        y: { grid: { color: '#f1f5f9' }, ticks: { font: { family: 'Inter', size: 10 } } },
        x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 10 } } }
      }
    }
  });

  document.getElementById('studioChartTitle').textContent = `${agg.toUpperCase()} of ${yCol} by ${xCol}`;
  document.getElementById('studioChartDesc').textContent = `Plotted across ${labels.length} segments with dynamic calculations`;
}

function downloadStudioChart() {
  if (!AppState.studioChartInstance) return;
  const url = AppState.studioChartInstance.toBase64Image();
  const a = document.createElement('a');
  a.href = url;
  a.download = `SheetPulse_Chart_${Date.now()}.png`;
  a.click();
  showToast('Chart snapshot downloaded as PNG');
}

// File Upload Handler (SheetJS)
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  AppState.fileName = file.name;
  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      AppState.sheets = {};
      workbook.SheetNames.forEach(sheetName => {
        AppState.sheets[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
      });

      AppState.activeSheet = workbook.SheetNames[0];
      loadActiveSheet();
      showToast(`Uploaded ${file.name}`);
    } catch (err) {
      console.error(err);
      showToast('Failed to parse uploaded Excel file', true);
    }
  };

  reader.readAsArrayBuffer(file);
  event.target.value = '';
}

// Export Options
function exportCurrentData(format) {
  const ext = format === 'csv' ? 'csv' : format === 'xlsx' ? 'xlsx' : 'json';
  if (ext === 'json') {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(AppState.filteredRows, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `SheetPulse_${AppState.activeSheet}_${Date.now()}.json`;
    a.click();
  } else {
    const ws = XLSX.utils.json_to_sheet(AppState.filteredRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, AppState.activeSheet);
    XLSX.writeFile(wb, `SheetPulse_${AppState.activeSheet}_${Date.now()}.${ext}`);
  }
  showToast(`Exported ${AppState.filteredRows.length} records to .${ext}`);
  document.getElementById('exportDropdownMenu').classList.add('hidden');
}

// Tab Navigation Switcher
function switchTab(tabId) {
  document.querySelectorAll('.tab-panel').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-nav-btn').forEach(btn => {
    btn.classList.remove('text-indigo-600', 'border-indigo-600');
    btn.classList.add('text-slate-500', 'border-transparent');
  });

  const targetPane = document.getElementById(`tabContent-${tabId}`);
  const targetBtn = document.getElementById(`tabBtn-${tabId}`);

  if (targetPane) targetPane.classList.remove('hidden');
  if (targetBtn) {
    targetBtn.classList.add('text-indigo-600', 'border-indigo-600');
    targetBtn.classList.remove('text-slate-500', 'border-transparent');
  }

  if (tabId === 'category' && AppState.categoryChartInstance) {
    AppState.categoryChartInstance.resize();
  }
  if (tabId === 'charts' && AppState.studioChartInstance) {
    AppState.studioChartInstance.resize();
  }

  lucide.createIcons();
}

function showToast(msg, isError = false) {
  const toast = document.getElementById('toastNotification');
  const msgSpan = document.getElementById('toastMessage');
  const icon = document.getElementById('toastIcon');

  msgSpan.textContent = msg;
  if (isError) {
    icon.setAttribute('data-lucide', 'alert-circle');
    icon.className = 'w-4 h-4 text-rose-400';
  } else {
    icon.setAttribute('data-lucide', 'check-circle');
    icon.className = 'w-4 h-4 text-emerald-400';
  }

  toast.classList.remove('opacity-0', 'translate-y-20', 'pointer-events-none');
  lucide.createIcons();

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-20', 'pointer-events-none');
  }, 3000);
}

// -------------------------------------------------------------
// 🌟 1. Real-Time Animated KPI Cards
// -------------------------------------------------------------
function updateKpiCards() {
  const totalRowsEl = document.getElementById('kpiTotalRows');
  const totalColsEl = document.getElementById('kpiTotalCols');
  const m1Label = document.getElementById('kpiMetric1Label');
  const m1Val = document.getElementById('kpiMetric1Val');
  const m2Label = document.getElementById('kpiMetric2Label');
  const m2Val = document.getElementById('kpiMetric2Val');

  if (!totalRowsEl) return;

  totalRowsEl.textContent = AppState.currentRows.length.toLocaleString();
  totalColsEl.textContent = AppState.columns.length.toLocaleString();

  const numCols = AppState.columns.filter(c => AppState.colMeta[c]?.type === 'numeric');

  if (numCols.length > 0) {
    const col1 = numCols[0];
    const meta1 = AppState.colMeta[col1];
    m1Label.textContent = `Total ${col1}`;
    m1Val.textContent = meta1?.sum ? (meta1.sum > 10000 ? Math.round(meta1.sum).toLocaleString() : meta1.sum.toFixed(1)) : '0';

    if (numCols.length > 1) {
      const col2 = numCols[1];
      const meta2 = AppState.colMeta[col2];
      m2Label.textContent = `Avg ${col2}`;
      m2Val.textContent = meta2?.avg ? meta2.avg.toFixed(1) : '0';
    } else {
      m2Label.textContent = `Avg ${col1}`;
      m2Val.textContent = meta1?.avg ? meta1.avg.toFixed(1) : '0';
    }
  } else {
    m1Label.textContent = 'Categories';
    m1Val.textContent = AppState.columns.length;
    m2Label.textContent = 'Active Sheet';
    m2Val.textContent = AppState.activeSheet;
  }
}

// -------------------------------------------------------------
// 🤖 2. Google Gemini AI Smart Executive Summary
// -------------------------------------------------------------
async function requestGeminiInsight() {
  const btn = document.getElementById('btnGenerateAiInsight');
  const contentEl = document.getElementById('aiInsightContent');
  const badgeEl = document.getElementById('aiInsightBadge');

  if (!AppState.auth.token) {
    showToast('Please sign in first to run Gemini AI insights', true);
    openAuthModal();
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Analyzing with Gemini...</span>`;
  lucide.createIcons();

  contentEl.innerHTML = `<div class="flex items-center gap-2 text-indigo-200 py-3"><i data-lucide="sparkles" class="w-4 h-4 animate-pulse"></i> Generating executive summary from Google Gemini 1.5 Flash...</div>`;
  lucide.createIcons();

  try {
    const res = await fetch(`${AppState.apiBaseUrl}/ai/insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AppState.auth.token}`
      },
      body: JSON.stringify({
        fileName: AppState.fileName,
        totalRows: AppState.currentRows.length,
        totalColumns: AppState.columns.length,
        columnStats: AppState.colMeta,
        sampleRows: AppState.currentRows.slice(0, 10)
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'AI request failed');
    }

    AppState.lastAiInsight = data.insight;
    badgeEl.textContent = `Source: ${data.source}`;
    
    // Convert basic markdown bullet points to clean HTML
    const formatted = data.insight
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\* /g, '• ');

    contentEl.innerHTML = `<div class="space-y-1.5 text-xs sm:text-sm text-indigo-50 leading-relaxed font-sans">${formatted}</div>`;
    showToast('Gemini AI executive insights generated successfully!');
  } catch (err) {
    console.error(err);
    contentEl.innerHTML = `<div class="text-rose-300 text-xs py-2">⚠️ ${err.message}. Showing local rule-based statistical overview.</div>`;
    showToast(err.message, true);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i data-lucide="wand-2" class="w-4 h-4"></i><span>Generate Insights</span>`;
    lucide.createIcons();
  }
}

function copyAiInsight() {
  const text = AppState.lastAiInsight || document.getElementById('aiInsightContent').innerText;
  navigator.clipboard.writeText(text);
  showToast('Copied AI insights to clipboard');
}

// -------------------------------------------------------------
// 🌟 3. Three.js Interactive 3D Column Grid Visualizer
// -------------------------------------------------------------
function cleanupThreeJs() {
  if (AppState.threeJs.animationId) {
    cancelAnimationFrame(AppState.threeJs.animationId);
    AppState.threeJs.animationId = null;
  }
  const container = document.getElementById('threeJsCanvasContainer');
  if (container) container.innerHTML = '';
}

function renderThreeJsColumns(xCol, yCol, agg) {
  cleanupThreeJs();
  const container = document.getElementById('threeJsCanvasContainer');
  if (!container) return;

  const width = container.clientWidth || 700;
  const height = 380;

  // Aggregate Data
  const grouped = {};
  AppState.currentRows.forEach(row => {
    const k = String(row[xCol] || '(Blank)').trim();
    const v = Number(row[yCol]) || 0;
    if (!grouped[k]) grouped[k] = { sum: 0, count: 0 };
    grouped[k].sum += v;
    grouped[k].count++;
  });

  const categories = Object.keys(grouped).slice(0, 16);
  if (categories.length === 0) return;

  let maxVal = 1;
  const vals = categories.map(k => {
    const item = grouped[k];
    const val = agg === 'avg' ? (item.sum / (item.count || 1)) : item.sum;
    if (val > maxVal) maxVal = val;
    return val;
  });

  // Three.js Scene Setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f172a); // Slate-900

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 12, 22);
  camera.lookAt(0, 2, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0x818cf8, 1.2);
  dirLight.position.set(10, 20, 15);
  dirLight.castShadow = true;
  scene.add(dirLight);

  // Grid Ground
  const gridHelper = new THREE.GridHelper(20, 20, 0x4f46e5, 0x334155);
  gridHelper.position.y = 0;
  scene.add(gridHelper);

  // 3D Columns
  const spacing = 1.8;
  const startX = -((categories.length - 1) * spacing) / 2;
  const columnMeshes = [];

  const colors = [0x4f46e5, 0x06b6d4, 0x10b981, 0xf59e0b, 0xec4899, 0x8b5cf6, 0x3b82f6];

  categories.forEach((cat, idx) => {
    const rawVal = vals[idx];
    const targetHeight = Math.max(0.4, (rawVal / maxVal) * 8);

    const geometry = new THREE.BoxGeometry(1.2, targetHeight, 1.2);
    const material = new THREE.MeshPhongMaterial({
      color: colors[idx % colors.length],
      shininess: 90,
      specular: 0xffffff
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(startX + idx * spacing, targetHeight / 2, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    columnMeshes.push(mesh);
  });

  // Animation Loop with Smooth Slow Rotation
  let angle = 0;
  function animate() {
    AppState.threeJs.animationId = requestAnimationFrame(animate);
    angle += 0.006;
    camera.position.x = Math.sin(angle) * 18;
    camera.position.z = Math.cos(angle) * 18;
    camera.lookAt(0, 3, 0);

    renderer.render(scene, camera);
  }

  animate();
  AppState.threeJs.renderer = renderer;
  AppState.threeJs.scene = scene;
  AppState.threeJs.camera = camera;
}

// -------------------------------------------------------------
// 🗂️ 4. Dynamic Pivot Matrix Crosstab
// -------------------------------------------------------------
function populatePivotDropdowns() {
  const rowSel = document.getElementById('pivotRowSelect');
  const colSel = document.getElementById('pivotColSelect');
  const valSel = document.getElementById('pivotValSelect');
  if (!rowSel || !colSel || !valSel) return;

  rowSel.innerHTML = '';
  colSel.innerHTML = '';
  valSel.innerHTML = '';

  AppState.columns.forEach((col, idx) => {
    rowSel.innerHTML += `<option value="${col}">${col}</option>`;
    colSel.innerHTML += `<option value="${col}">${col}</option>`;
  });

  const numCols = AppState.columns.filter(c => AppState.colMeta[c]?.type === 'numeric');
  (numCols.length > 0 ? numCols : AppState.columns).forEach(col => {
    valSel.innerHTML += `<option value="${col}">${col}</option>`;
  });

  if (AppState.columns.length > 1) {
    rowSel.selectedIndex = 0;
    colSel.selectedIndex = 1;
  }
}

function renderPivotMatrix() {
  const rowCol = document.getElementById('pivotRowSelect')?.value;
  const colCol = document.getElementById('pivotColSelect')?.value;
  const valCol = document.getElementById('pivotValSelect')?.value;
  const agg = document.getElementById('pivotAggSelect')?.value || 'sum';

  if (!rowCol || !colCol || !valCol) return;

  const matrix = {};
  const distinctColVals = new Set();
  const distinctRowVals = new Set();

  AppState.currentRows.forEach(r => {
    const rKey = String(r[rowCol] || '(Blank)').trim();
    const cKey = String(r[colCol] || '(Blank)').trim();
    const val = Number(r[valCol]) || 0;

    distinctRowVals.add(rKey);
    distinctColVals.add(cKey);

    if (!matrix[rKey]) matrix[rKey] = {};
    if (!matrix[rKey][cKey]) matrix[rKey][cKey] = { sum: 0, count: 0 };

    matrix[rKey][cKey].sum += val;
    matrix[rKey][cKey].count++;
  });

  const colHeaders = Array.from(distinctColVals).sort();
  const rowHeaders = Array.from(distinctRowVals).sort();

  const thead = document.getElementById('pivotTableHead');
  const tbody = document.getElementById('pivotTableBody');
  if (!thead || !tbody) return;

  let headHtml = `<tr><th class="py-2.5 px-3 bg-slate-100 font-bold text-slate-800">${rowCol} \\ ${colCol}</th>`;
  colHeaders.forEach(ch => {
    headHtml += `<th class="py-2.5 px-3 text-right bg-slate-50">${ch}</th>`;
  });
  headHtml += `<th class="py-2.5 px-3 text-right font-bold bg-indigo-50 text-indigo-700">Total</th></tr>`;
  thead.innerHTML = headHtml;

  let bodyHtml = '';
  rowHeaders.forEach(rh => {
    bodyHtml += `<tr class="hover:bg-slate-50/70"><td class="py-2.5 px-3 font-sans font-semibold text-slate-900 border-r border-slate-100">${rh}</td>`;
    let rowTotal = 0;

    colHeaders.forEach(ch => {
      const cell = matrix[rh]?.[ch];
      let val = 0;
      if (cell) {
        val = agg === 'avg' ? (cell.sum / (cell.count || 1)) : agg === 'count' ? cell.count : cell.sum;
        rowTotal += cell.sum;
      }
      bodyHtml += `<td class="py-2.5 px-3 text-right ${val > 0 ? 'text-slate-800 font-medium' : 'text-slate-300'}">${val ? val.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '-'}</td>`;
    });

    bodyHtml += `<td class="py-2.5 px-3 text-right font-bold text-indigo-600 bg-indigo-50/40">${rowTotal.toLocaleString(undefined, { maximumFractionDigits: 1 })}</td></tr>`;
  });

  tbody.innerHTML = bodyHtml;
}

// -------------------------------------------------------------
// ✏️ 5. Double Click Inline Cell Editing
// -------------------------------------------------------------
function makeCellEditable(td) {
  if (td.querySelector('input')) return;
  const currentVal = td.innerText.trim() === 'null' ? '' : td.innerText.trim();
  const rowIdx = parseInt(td.getAttribute('data-row-idx'));
  const colName = td.getAttribute('data-col');

  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentVal;
  input.className = 'w-full px-2 py-1 text-xs border border-indigo-500 rounded bg-white shadow-xs focus:outline-none';

  td.innerHTML = '';
  td.appendChild(input);
  input.focus();

  const saveCell = () => {
    const newVal = input.value.trim();
    if (AppState.filteredRows[rowIdx]) {
      AppState.filteredRows[rowIdx][colName] = AppState.colMeta[colName]?.type === 'numeric' && !isNaN(Number(newVal))
        ? Number(newVal)
        : newVal;
    }
    td.innerHTML = newVal || '<span class="text-slate-300 italic">null</span>';
    td.classList.add('bg-amber-50');
    analyzeColumns();
    updateKpiCards();
    showToast(`Updated ${colName} row #${rowIdx + 1}`);
  };

  input.addEventListener('blur', saveCell);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      input.blur();
    } else if (e.key === 'Escape') {
      td.innerHTML = currentVal || '<span class="text-slate-300 italic">null</span>';
    }
  });
}

// -------------------------------------------------------------
// 📥 6. Full Analysis PDF Report Generator (jsPDF + html2canvas)
// -------------------------------------------------------------
async function exportAnalysisReportPDF() {
  if (!window.jspdf || !window.html2canvas) {
    showToast('PDF libraries loading, please wait...', true);
    return;
  }

  showToast('Generating high-resolution PDF Executive Report...');
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');

  // Header Banner
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(0, 0, 210, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('EXCEL INSIGHT — EXECUTIVE DATA REPORT', 14, 16);

  // Metadata
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`File: ${AppState.fileName}`, 14, 34);
  doc.text(`Sheet: ${AppState.activeSheet}`, 14, 40);
  doc.text(`Records: ${AppState.currentRows.length} rows | Columns: ${AppState.columns.length}`, 14, 46);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 52);

  // Capture Chart Canvas
  const chartCanvas = document.getElementById('studioChartCanvas');
  if (chartCanvas && !chartCanvas.classList.contains('hidden')) {
    const chartImg = chartCanvas.toDataURL('image/png', 1.0);
    doc.addImage(chartImg, 'PNG', 14, 60, 180, 85);
  }

  // AI Summary Block
  if (AppState.lastAiInsight) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(79, 70, 229);
    doc.text('Google Gemini AI Executive Insight', 14, 156);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const splitText = doc.splitTextToSize(AppState.lastAiInsight, 180);
    doc.text(splitText, 14, 164);
  }

  doc.save(`ExcelInsight_Report_${AppState.activeSheet}_${Date.now()}.pdf`);
  showToast('PDF Report downloaded successfully!');
  document.getElementById('exportDropdownMenu').classList.add('hidden');
}

// -------------------------------------------------------------
// 🔐 7. User Authentication & Admin Management
// -------------------------------------------------------------
let authMode = 'login';

function openAuthModal() {
  document.getElementById('authModal').classList.remove('hidden');
}

function closeAuthModal() {
  document.getElementById('authModal').classList.add('hidden');
}

function switchAuthMode(mode) {
  authMode = mode;
  const isLogin = mode === 'login';
  document.getElementById('authTabLogin').className = isLogin
    ? 'flex-1 pb-2.5 text-xs font-bold text-indigo-600 border-b-2 border-indigo-600 text-center'
    : 'flex-1 pb-2.5 text-xs font-bold text-slate-400 border-b-2 border-transparent hover:text-slate-700 text-center';
  document.getElementById('authTabRegister').className = !isLogin
    ? 'flex-1 pb-2.5 text-xs font-bold text-indigo-600 border-b-2 border-indigo-600 text-center'
    : 'flex-1 pb-2.5 text-xs font-bold text-slate-400 border-b-2 border-transparent hover:text-slate-700 text-center';

  document.getElementById('authNameGroup').classList.toggle('hidden', isLogin);
  document.getElementById('authRoleGroup').classList.toggle('hidden', isLogin);
  document.getElementById('authSubmitBtn').textContent = isLogin ? 'Sign In' : 'Create Account';
  document.getElementById('authModalTitle').textContent = isLogin ? 'Sign in to Excel Insight' : 'Create your Account';
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('authEmailInput').value;
  const password = document.getElementById('authPasswordInput').value;
  const name = document.getElementById('authNameInput').value;
  const role = document.getElementById('authRoleInput').value;

  const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
  const payload = authMode === 'login' ? { email, password } : { email, password, name, role };

  try {
    const res = await fetch(`${AppState.apiBaseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Authentication error');
    }

    localStorage.setItem('excelinsight_token', data.token);
    localStorage.setItem('excelinsight_user', JSON.stringify(data.user));
    AppState.auth.token = data.token;
    AppState.auth.user = data.user;

    checkAuthState();
    closeAuthModal();
    showToast(`Welcome, ${data.user.name}!`);

    // Save current active spreadsheet to history automatically
    saveUploadHistoryRecord();
  } catch (err) {
    showToast(err.message, true);
  }
}

function handleUserLogout() {
  localStorage.removeItem('excelinsight_token');
  localStorage.removeItem('excelinsight_user');
  AppState.auth.token = null;
  AppState.auth.user = null;
  checkAuthState();
  showToast('Signed out successfully');
}

function checkAuthState() {
  const loginBtn = document.getElementById('authLoginBtn');
  const userMenu = document.getElementById('authUserMenu');
  const userName = document.getElementById('authUserName');
  const roleBadge = document.getElementById('authUserRoleBadge');
  const adminTab = document.getElementById('tabBtn-admin');
  const historyNotice = document.getElementById('historyAuthNotice');

  if (AppState.auth.user && AppState.auth.token) {
    loginBtn.classList.add('hidden');
    userMenu.classList.remove('hidden');
    userName.textContent = AppState.auth.user.name;

    const isAdmin = AppState.auth.user.role === 'admin';
    roleBadge.classList.toggle('hidden', !isAdmin);
    adminTab.classList.toggle('hidden', !isAdmin);
    if (historyNotice) historyNotice.classList.add('hidden');
  } else {
    loginBtn.classList.remove('hidden');
    userMenu.classList.add('hidden');
    adminTab.classList.add('hidden');
    if (historyNotice) historyNotice.classList.remove('hidden');
  }
  lucide.createIcons();
}

// -------------------------------------------------------------
// 📂 8. MongoDB Upload History Service
// -------------------------------------------------------------
async function saveUploadHistoryRecord() {
  if (!AppState.auth.token) return;

  try {
    await fetch(`${AppState.apiBaseUrl}/uploads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AppState.auth.token}`
      },
      body: JSON.stringify({
        fileName: AppState.fileName,
        sheetsCount: Object.keys(AppState.sheets).length,
        sheetNames: Object.keys(AppState.sheets),
        totalRows: AppState.currentRows.length,
        totalColumns: AppState.columns.length,
        columns: AppState.columns.map(c => ({ name: c, type: AppState.colMeta[c]?.type || 'categorical' }))
      })
    });
  } catch (err) {
    console.warn('Auto-save history note:', err);
  }
}

async function fetchUploadHistory() {
  if (!AppState.auth.token) {
    showToast('Sign in to view cloud upload history', true);
    return;
  }

  const tbody = document.getElementById('historyTableBody');
  tbody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-slate-400 font-sans"><i data-lucide="loader-2" class="w-5 h-5 animate-spin mx-auto text-indigo-600 mb-1"></i> Loading MongoDB History...</td></tr>`;
  lucide.createIcons();

  try {
    const res = await fetch(`${AppState.apiBaseUrl}/uploads`, {
      headers: { 'Authorization': `Bearer ${AppState.auth.token}` }
    });
    const result = await res.json();

    if (!result.data || result.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-slate-400 font-sans">No saved uploads in MongoDB yet.</td></tr>`;
      return;
    }

    let rowsHtml = '';
    result.data.forEach(item => {
      const dateStr = new Date(item.uploadedAt).toLocaleDateString() + ' ' + new Date(item.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      rowsHtml += `
        <tr class="hover:bg-slate-50 transition border-b border-slate-100">
          <td class="py-2.5 px-3 font-semibold text-slate-900">${item.fileName}</td>
          <td class="py-2.5 px-3 text-slate-600">${item.sheetsCount} sheets</td>
          <td class="py-2.5 px-3 text-slate-700 font-mono">${item.totalRows}</td>
          <td class="py-2.5 px-3 text-slate-700 font-mono">${item.totalColumns}</td>
          <td class="py-2.5 px-3 text-slate-500 font-sans text-xs">${dateStr}</td>
          <td class="py-2.5 px-3 text-right">
            <button onclick="deleteUploadRecord('${item._id}')" class="text-rose-500 hover:text-rose-700 text-xs font-semibold px-2 py-1 rounded hover:bg-rose-50 transition">
              Delete
            </button>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = rowsHtml;
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-rose-500 font-sans">Failed to load history: ${err.message}</td></tr>`;
  }
}

async function deleteUploadRecord(id) {
  try {
    const res = await fetch(`${AppState.apiBaseUrl}/uploads/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${AppState.auth.token}` }
    });
    if (res.ok) {
      showToast('Record removed from history');
      fetchUploadHistory();
    }
  } catch (err) {
    showToast(err.message, true);
  }
}

// -------------------------------------------------------------
// 🛡️ 9. Admin Dashboard Service
// -------------------------------------------------------------
async function fetchAdminData() {
  if (!AppState.auth.token) return;

  try {
    // 1. Fetch Stats
    const statsRes = await fetch(`${AppState.apiBaseUrl}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${AppState.auth.token}` }
    });
    const statsData = await statsRes.json();
    if (statsData.success) {
      document.getElementById('adminTotalUsers').textContent = statsData.data.totalUsers.toLocaleString();
      document.getElementById('adminTotalUploads').textContent = statsData.data.totalUploads.toLocaleString();
      document.getElementById('adminTotalRows').textContent = statsData.data.totalRowsProcessed.toLocaleString();
    }

    // 2. Fetch Users
    const usersRes = await fetch(`${AppState.apiBaseUrl}/admin/users`, {
      headers: { 'Authorization': `Bearer ${AppState.auth.token}` }
    });
    const usersData = await usersRes.json();
    if (usersData.success) {
      const tbody = document.getElementById('adminUsersTableBody');
      let html = '';
      usersData.users.forEach(u => {
        const isAdm = u.role === 'admin';
        html += `
          <tr class="hover:bg-slate-50 transition border-b border-slate-100">
            <td class="py-2.5 px-3 font-semibold text-slate-900">${u.name}</td>
            <td class="py-2.5 px-3 text-slate-600 font-sans">${u.email}</td>
            <td class="py-2.5 px-3">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${isAdm ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700'}">${u.role}</span>
            </td>
            <td class="py-2.5 px-3 font-mono">${u.uploadsCount}</td>
            <td class="py-2.5 px-3 text-slate-500 font-sans text-xs">${new Date(u.createdAt).toLocaleDateString()}</td>
            <td class="py-2.5 px-3 text-right">
              <button onclick="toggleUserRole('${u.id}', '${isAdm ? 'user' : 'admin'}')" class="text-indigo-600 hover:text-indigo-800 text-xs font-semibold px-2 py-1 rounded hover:bg-indigo-50 transition">
                Make ${isAdm ? 'User' : 'Admin'}
              </button>
            </td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    }
  } catch (err) {
    showToast(err.message, true);
  }
}

async function toggleUserRole(userId, newRole) {
  try {
    const res = await fetch(`${AppState.apiBaseUrl}/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AppState.auth.token}`
      },
      body: JSON.stringify({ role: newRole })
    });
    if (res.ok) {
      showToast(`Role updated to ${newRole}`);
      fetchAdminData();
    }
  } catch (err) {
    showToast(err.message, true);
  }
}

// -------------------------------------------------------------
// 🧮 10. Interactive In-Browser Formula Engine (fx)
// -------------------------------------------------------------
function executeFormulaBar() {
  const input = document.getElementById('excelFormulaInput');
  const badge = document.getElementById('formulaResultBadge');
  if (!input) return;

  let expr = input.value.trim();
  if (!expr) return;

  if (expr.startsWith('=')) expr = expr.substring(1).trim();

  try {
    // 1. Evaluate SUM(colName)
    const sumMatch = expr.match(/SUM\((.*?)\)/i);
    if (sumMatch) {
      const col = sumMatch[1].trim();
      const sum = AppState.currentRows.reduce((acc, r) => acc + (Number(r[col]) || 0), 0);
      badge.classList.remove('hidden', 'text-rose-700', 'bg-rose-50');
      badge.classList.add('text-emerald-700', 'bg-emerald-50');
      badge.textContent = `SUM(${col}) = ${sum.toLocaleString()}`;
      showToast(`Computed SUM: ${sum.toLocaleString()}`);
      return;
    }

    // 2. Evaluate AVERAGE(colName)
    const avgMatch = expr.match(/AVERAGE\((.*?)\)/i);
    if (avgMatch) {
      const col = avgMatch[1].trim();
      const sum = AppState.currentRows.reduce((acc, r) => acc + (Number(r[col]) || 0), 0);
      const avg = sum / (AppState.currentRows.length || 1);
      badge.classList.remove('hidden', 'text-rose-700', 'bg-rose-50');
      badge.classList.add('text-emerald-700', 'bg-emerald-50');
      badge.textContent = `AVERAGE(${col}) = ${avg.toFixed(2)}`;
      showToast(`Computed AVERAGE: ${avg.toFixed(2)}`);
      return;
    }

    // 3. Evaluate COUNT(colName)
    const countMatch = expr.match(/COUNT\((.*?)\)/i);
    if (countMatch) {
      const col = countMatch[1].trim();
      const count = AppState.currentRows.filter(r => r[col] !== undefined && r[col] !== '').length;
      badge.classList.remove('hidden');
      badge.textContent = `COUNT(${col}) = ${count}`;
      return;
    }

    // 4. Safe mathematical expression fallback
    const sanitized = expr.replace(/[^0-9+\-*/().]/g, '');
    const result = Function(`'use strict'; return (${sanitized})`)();
    badge.classList.remove('hidden', 'text-rose-700', 'bg-rose-50');
    badge.classList.add('text-emerald-700', 'bg-emerald-50');
    badge.textContent = `Result = ${result}`;
    showToast(`Result: ${result}`);
  } catch (err) {
    badge.classList.remove('hidden', 'text-emerald-700', 'bg-emerald-50');
    badge.classList.add('text-rose-700', 'bg-rose-50');
    badge.textContent = 'Formula Error';
    showToast('Invalid Excel formula syntax', true);
  }
}

// -------------------------------------------------------------
// ⚖️ 11. Dual-Sheet & File Comparison (Excel Diff Engine)
// -------------------------------------------------------------
function populateDiffDropdowns() {
  const baseSel = document.getElementById('diffBaseSheetSelect');
  const targetSel = document.getElementById('diffTargetSheetSelect');
  if (!baseSel || !targetSel) return;

  baseSel.innerHTML = '';
  targetSel.innerHTML = '';
  const sheetNames = Object.keys(AppState.sheets);

  sheetNames.forEach(name => {
    baseSel.innerHTML += `<option value="${name}">${name}</option>`;
    targetSel.innerHTML += `<option value="${name}">${name}</option>`;
  });

  if (sheetNames.length > 1) {
    targetSel.selectedIndex = 1;
  }
}

function runSheetComparison() {
  const baseName = document.getElementById('diffBaseSheetSelect')?.value;
  const targetName = document.getElementById('diffTargetSheetSelect')?.value;

  if (!baseName || !targetName) return;

  const baseRows = AppState.sheets[baseName] || [];
  const targetRows = AppState.sheets[targetName] || [];

  const summary = document.getElementById('diffSummaryContainer');
  const thead = document.getElementById('diffHeaderRow');
  const tbody = document.getElementById('diffTableBody');

  summary.classList.remove('hidden');

  const allCols = Array.from(new Set([
    ...(baseRows[0] ? Object.keys(baseRows[0]) : []),
    ...(targetRows[0] ? Object.keys(targetRows[0]) : [])
  ]));

  thead.innerHTML = `<th class="py-2.5 px-3">Diff Status</th><th class="py-2.5 px-3">Row #</th>` +
    allCols.map(c => `<th class="py-2.5 px-3">${c}</th>`).join('');

  let identical = 0;
  let modified = 0;
  let rowsHtml = '';
  const maxRows = Math.max(baseRows.length, targetRows.length);

  for (let i = 0; i < maxRows; i++) {
    const bRow = baseRows[i];
    const tRow = targetRows[i];

    if (!bRow) {
      // Added Row
      rowsHtml += `<tr class="bg-emerald-50/50"><td class="py-2 px-3 text-emerald-700 font-bold">+ ADDED</td><td class="py-2 px-3">${i + 1}</td>`;
      allCols.forEach(c => rowsHtml += `<td class="py-2 px-3 text-emerald-800">${tRow[c] ?? '-'}</td>`);
      rowsHtml += `</tr>`;
      modified++;
    } else if (!tRow) {
      // Deleted Row
      rowsHtml += `<tr class="bg-rose-50/50"><td class="py-2 px-3 text-rose-700 font-bold">- REMOVED</td><td class="py-2 px-3">${i + 1}</td>`;
      allCols.forEach(c => rowsHtml += `<td class="py-2 px-3 text-rose-800 line-through">${bRow[c] ?? '-'}</td>`);
      rowsHtml += `</tr>`;
      modified++;
    } else {
      let isRowModified = false;
      let cellTds = '';

      allCols.forEach(c => {
        const bVal = bRow[c];
        const tVal = tRow[c];
        if (bVal !== tVal) {
          isRowModified = true;
          cellTds += `<td class="py-2 px-3 bg-amber-100 text-amber-900 font-bold" title="Original: ${bVal}"><span>${tVal}</span> <span class="text-[10px] text-amber-600 block">(was ${bVal})</span></td>`;
        } else {
          cellTds += `<td class="py-2 px-3">${bVal ?? '-'}</td>`;
        }
      });

      if (isRowModified) {
        modified++;
        rowsHtml += `<tr class="hover:bg-slate-50"><td class="py-2 px-3 text-amber-600 font-bold">&Delta; MODIFIED</td><td class="py-2 px-3">${i + 1}</td>${cellTds}</tr>`;
      } else {
        identical++;
        rowsHtml += `<tr class="hover:bg-slate-50"><td class="py-2 px-3 text-slate-400">MATCH</td><td class="py-2 px-3 text-slate-400">${i + 1}</td>${cellTds}</tr>`;
      }
    }
  }

  tbody.innerHTML = rowsHtml || `<tr><td colspan="${allCols.length + 2}" class="py-6 text-center text-slate-400">No differences detected.</td></tr>`;

  document.getElementById('diffIdenticalCount').textContent = identical;
  document.getElementById('diffModifiedCount').textContent = modified;
  document.getElementById('diffVarianceCount').textContent = `${Math.abs(baseRows.length - targetRows.length)} rows`;

  showToast(`Diff analysis: ${modified} variance rows detected`);
}

// -------------------------------------------------------------
// 🚨 12. Statistical Anomaly & Outlier Detector (Z-Score + IQR)
// -------------------------------------------------------------
function populateAnomalyDropdown() {
  const select = document.getElementById('anomalyColSelect');
  if (!select) return;

  select.innerHTML = '';
  const numCols = AppState.columns.filter(c => AppState.colMeta[c]?.type === 'numeric');
  (numCols.length > 0 ? numCols : AppState.columns).forEach(c => {
    select.innerHTML += `<option value="${c}">${c}</option>`;
  });

  if (numCols.length > 0) runAnomalyDetection();
}

function runAnomalyDetection() {
  const col = document.getElementById('anomalyColSelect')?.value;
  if (!col) return;

  const vals = AppState.currentRows.map((r, idx) => ({ val: Number(r[col]), rowIdx: idx, row: r })).filter(item => !isNaN(item.val));
  if (vals.length < 3) return;

  const rawVals = vals.map(v => v.val).sort((a, b) => a - b);
  const n = rawVals.length;

  // Mean & Std Dev
  const mean = rawVals.reduce((a, b) => a + b, 0) / n;
  const variance = rawVals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance) || 1;

  // Quartiles (IQR)
  const q1 = rawVals[Math.floor(n * 0.25)];
  const q3 = rawVals[Math.floor(n * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  document.getElementById('anomalyMean').textContent = mean.toFixed(1);
  document.getElementById('anomalyStdDev').textContent = stdDev.toFixed(1);
  document.getElementById('anomalyIqrRange').textContent = `[${lowerBound.toFixed(1)} to ${upperBound.toFixed(1)}]`;

  // Detect Flagged Records
  const flagged = [];
  vals.forEach(item => {
    const zScore = (item.val - mean) / stdDev;
    const isOutlierZ = Math.abs(zScore) >= 2.0;
    const isOutlierIQR = item.val < lowerBound || item.val > upperBound;

    if (isOutlierZ || isOutlierIQR) {
      flagged.push({
        ...item,
        zScore: zScore.toFixed(2),
        type: item.val > upperBound ? 'High Outlier' : 'Low Outlier'
      });
    }
  });

  document.getElementById('anomalyCount').textContent = flagged.length;
  const tbody = document.getElementById('anomalyTableBody');

  if (flagged.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-emerald-600 font-sans font-semibold">✅ No statistical anomalies detected in ${col}. Data falls within normal bounds.</td></tr>`;
    return;
  }

  let html = '';
  flagged.forEach(f => {
    const labelCol = AppState.columns.find(c => c !== col) || col;
    html += `
      <tr class="hover:bg-slate-50 transition border-b border-slate-100">
        <td class="py-2.5 px-3 font-mono text-slate-500">#${f.rowIdx + 1}</td>
        <td class="py-2.5 px-3 font-semibold text-slate-800">${f.row[labelCol] || '-'}</td>
        <td class="py-2.5 px-3 font-bold text-rose-600">${f.val.toLocaleString()}</td>
        <td class="py-2.5 px-3 font-mono text-indigo-600 font-bold">${f.zScore} &sigma;</td>
        <td class="py-2.5 px-3">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${f.type === 'High Outlier' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'}">${f.type}</span>
        </td>
        <td class="py-2.5 px-3 text-right">
          <button onclick="isolateOutlier(${f.rowIdx})" class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1 rounded hover:bg-indigo-50">
            Inspect
          </button>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

function clampOutliers() {
  const col = document.getElementById('anomalyColSelect')?.value;
  if (!col) return;

  const vals = AppState.currentRows.map(r => Number(r[col])).filter(v => !isNaN(v)).sort((a, b) => a - b);
  const n = vals.length;
  const q1 = vals[Math.floor(n * 0.25)];
  const q3 = vals[Math.floor(n * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  let clampedCount = 0;
  AppState.currentRows.forEach(r => {
    const v = Number(r[col]);
    if (!isNaN(v)) {
      if (v > upperBound) {
        r[col] = Math.round(upperBound);
        clampedCount++;
      } else if (v < lowerBound) {
        r[col] = Math.round(lowerBound);
        clampedCount++;
      }
    }
  });

  analyzeColumns();
  runAnomalyDetection();
  renderGridData();
  renderStudioChart();
  showToast(`Clamped ${clampedCount} outliers within normal IQR boundaries`);
}

function isolateOutlier(rowIdx) {
  switchTab('grid');
  AppState.grid.page = Math.floor(rowIdx / AppState.grid.pageSize) + 1;
  renderGridData();
  showToast(`Navigated to flagged record #${rowIdx + 1}`);
}

// -------------------------------------------------------------
// 🗣️ 13. AI NLQ Assistant Drawer (Chat with your Data)
// -------------------------------------------------------------
function toggleAiChatDrawer() {
  const drawer = document.getElementById('aiChatDrawer');
  drawer.classList.toggle('hidden');
}

function askPresetQuestion(text) {
  document.getElementById('aiChatInput').value = text;
  handleSendAiChatMessage(new Event('submit'));
}

async function handleSendAiChatMessage(e) {
  if (e && e.preventDefault) e.preventDefault();
  const input = document.getElementById('aiChatInput');
  const question = input.value.trim();
  if (!question) return;

  const container = document.getElementById('aiChatMessages');

  // Append User Bubble
  container.innerHTML += `
    <div class="flex justify-end">
      <div class="p-3 rounded-2xl bg-indigo-600 text-white max-w-[85%] shadow-xs leading-relaxed">
        ${question}
      </div>
    </div>
  `;

  input.value = '';
  container.scrollTop = container.scrollHeight;

  // Append Thinking Indicator
  const thinkingId = 'thinking_' + Date.now();
  container.innerHTML += `
    <div id="${thinkingId}" class="flex items-center gap-2 text-slate-500 py-2">
      <i data-lucide="loader-2" class="w-4 h-4 animate-spin text-indigo-600"></i>
      <span>Gemini 3.8 Flash is analyzing data...</span>
    </div>
  `;
  lucide.createIcons();
  container.scrollTop = container.scrollHeight;

  try {
    const res = await fetch(`${AppState.apiBaseUrl}/ai/nlq`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AppState.auth.token || ''}`
      },
      body: JSON.stringify({
        question,
        fileName: AppState.fileName,
        columns: AppState.columns,
        columnStats: AppState.colMeta,
        sampleRows: AppState.currentRows.slice(0, 10)
      })
    });

    const data = await res.json();
    document.getElementById(thinkingId)?.remove();

    let chartActionHtml = '';
    if (data.suggestedChart && data.suggestedChart.x && data.suggestedChart.y) {
      chartActionHtml = `
        <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
          <span class="text-[10px] text-slate-500">Suggested: ${data.suggestedChart.type || 'bar'} (${data.suggestedChart.y} by ${data.suggestedChart.x})</span>
          <button onclick="applyAiChart('${data.suggestedChart.type}', '${data.suggestedChart.x}', '${data.suggestedChart.y}', '${data.suggestedChart.agg || 'sum'}')"
            class="px-2 py-1 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold hover:bg-indigo-100 transition">
            Plot in Studio
          </button>
        </div>
      `;
    }

    container.innerHTML += `
      <div class="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 shadow-xs space-y-1.5">
        <div class="flex items-center gap-1.5 font-bold text-indigo-600 text-[11px]">
          <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
          <span>Gemini Intelligence</span>
        </div>
        <p class="leading-relaxed">${data.answer || 'Analysis complete.'}</p>
        ${chartActionHtml}
      </div>
    `;

    lucide.createIcons();
    container.scrollTop = container.scrollHeight;
  } catch (err) {
    document.getElementById(thinkingId)?.remove();
    container.innerHTML += `
      <div class="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
        ⚠️ Error: ${err.message}. Please verify server connectivity.
      </div>
    `;
    container.scrollTop = container.scrollHeight;
  }
}

function applyAiChart(type, x, y, agg) {
  switchTab('charts');
  if (type) document.getElementById('studioChartType').value = type;
  if (x) document.getElementById('studioXCol').value = x;
  if (y) document.getElementById('studioYCol').value = y;
  if (agg) document.getElementById('studioAgg').value = agg;
  renderStudioChart();
  toggleAiChatDrawer();
  showToast(`Auto-plotted ${type || 'bar'} chart for ${y} by ${x}`);
}