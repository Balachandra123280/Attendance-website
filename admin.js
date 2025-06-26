// ==========================
// Admin Dashboard Script
// ==========================

// Load data
let hubs = JSON.parse(localStorage.getItem('hubs')) || {};
let employees = JSON.parse(localStorage.getItem('employees')) || [];
let attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || {};

// Save data
function saveData() {
  localStorage.setItem('hubs', JSON.stringify(hubs));
  localStorage.setItem('employees', JSON.stringify(employees));
  localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
}

// Sidebar toggle
function toggleMenu() {
  document.getElementById('sidebar').classList.toggle('open');
}

// Section switch
function showSection(id) {
  document.querySelectorAll('.form-section').forEach(s => s.style.display = 'none');
  document.getElementById(id).style.display = 'block';
}

// Popup message
function showPopup(msg) {
  const el = document.getElementById('popupMsg');
  el.innerText = msg;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 3000);
}

// ====================
// HUB & CHECKPOST
// ====================
function addHub() {
  const hubName = document.getElementById('newHubName').value.trim();
  if (!hubName) return showPopup("Enter hub name");

  if (!hubs[hubName]) hubs[hubName] = [];
  document.getElementById('newHubName').value = '';
  saveData();
  populateHubSelects();
  showPopup("Hub added");
}

function addCheckpost() {
  const hub = document.getElementById('hubSelect').value;
  const cp = document.getElementById('newCheckpostName').value.trim();
  if (!hub || !cp) return showPopup("Select hub and enter checkpost");

  if (!hubs[hub].includes(cp)) hubs[hub].push(cp);
  document.getElementById('newCheckpostName').value = '';
  saveData();
  populateHubSelects();
  showPopup("Checkpost added");
}

function populateHubSelects() {
  const hubSelects = [
    'hubSelect', 'empHubSelect', 'attendanceHubSelect',
    'reportHubSelect', 'reportMonthHubSelect'
  ];
  hubSelects.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '';
    Object.keys(hubs).forEach(hub => {
      const opt = document.createElement('option');
      opt.value = opt.textContent = hub;
      sel.appendChild(opt);
    });
  });

  updateEmpCheckpostSelect();
}

// ====================
// EMPLOYEES
// ====================
function updateEmpCheckpostSelect() {
  const hub = document.getElementById('empHubSelect').value;
  const checkpostSelect = document.getElementById('empCheckpostSelect');
  checkpostSelect.innerHTML = '';
  if (!hubs[hub]) return;
  hubs[hub].forEach(cp => {
    const opt = document.createElement('option');
    opt.value = opt.textContent = cp;
    checkpostSelect.appendChild(opt);
  });
}

function addEmployee() {
  const emp = {
    name: document.getElementById('empName').value.trim(),
    surname: document.getElementById('empSurname').value.trim(),
    mobile: document.getElementById('empMobile').value.trim(),
    location: document.getElementById('empLocation').value.trim(),
    account: document.getElementById('empBankAccount').value.trim(),
    ifsc: document.getElementById('empIFSC').value.trim(),
    bank: document.getElementById('empBankName').value.trim(),
    pan: document.getElementById('empPAN').value.trim(),
    hub: document.getElementById('empHubSelect').value,
    checkpost: document.getElementById('empCheckpostSelect').value
  };

  if (!emp.name || !emp.surname || !emp.mobile) {
    return showPopup("Fill all required fields");
  }

  employees.push(emp);
  saveData();
  showPopup("Employee added");
  clearEmployeeForm();
  displayEmployees();
}

function clearEmployeeForm() {
  ['empName', 'empSurname', 'empMobile', 'empLocation',
   'empBankAccount', 'empIFSC', 'empBankName', 'empPAN']
    .forEach(id => document.getElementById(id).value = '');
}

// ====================
// VIEW / DELETE / SEARCH EMPLOYEES
// ====================
function displayEmployees(filtered = null) {
  const list = filtered || employees;
  const div = document.getElementById('employeeTable');
  if (!div) return;

  if (list.length === 0) return div.innerHTML = "<p>No employees found</p>";

  let html = `<table><tr>
    <th>Name</th><th>Mobile</th><th>Location</th><th>Bank</th><th>Hub</th><th>Checkpost</th><th>Delete</th>
  </tr>`;
  list.forEach((e, i) => {
    html += `<tr>
      <td>${e.surname} ${e.name}</td>
      <td>${e.mobile}</td>
      <td>${e.location}</td>
      <td>${e.bank}</td>
      <td>${e.hub}</td>
      <td>${e.checkpost}</td>
      <td><button onclick="deleteEmployee(${i})">🗑️</button></td>
    </tr>`;
  });
  html += `</table>`;
  div.innerHTML = html;
}

function deleteEmployee(index) {
  if (!confirm("Delete this employee?")) return;
  employees.splice(index, 1);
  saveData();
  displayEmployees();
  showPopup("Employee deleted");
}

function searchEmployee() {
  const q = document.getElementById('employeeSearchInput').value.toLowerCase();
  const results = employees.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.surname.toLowerCase().includes(q) ||
    e.mobile.includes(q) ||
    e.hub.toLowerCase().includes(q) ||
    e.checkpost.toLowerCase().includes(q)
  );
  displayEmployees(results);
}

// ====================
// ATTENDANCE
// ====================
function getAttendanceKey() {
  const hub = document.getElementById('attendanceHubSelect').value;
  const month = document.getElementById('attendanceMonth').value;
  return `attendance_${hub}_${month}`;
}

function selectAttendanceMonthHub() {
  const key = getAttendanceKey();
  const monthStr = document.getElementById('attendanceMonth').value;
  const hub = document.getElementById('attendanceHubSelect').value;
  const container = document.getElementById('attendanceTable');
  if (!monthStr || !hub) return showPopup("Select both month and hub");

  const [year, month] = monthStr.split("-").map(Number);
  const days = new Date(year, month, 0).getDate();
  const saved = JSON.parse(localStorage.getItem(key) || '{}');

  const filtered = employees.filter(e => e.hub === hub);
  let html = `<table><thead><tr><th>Employee</th>`;
  for (let d = 1; d <= days; d++) html += `<th>${d}</th>`;
  html += `</tr></thead><tbody>`;

  filtered.forEach((e, i) => {
    html += `<tr><td>${e.surname} ${e.name}</td>`;
    for (let d = 1; d <= days; d++) {
      const cellId = `${i}_${d}`;
      const val = saved[cellId] || '';
      const bg = val === 'P' ? '#c8e6c9' : val === 'A' ? '#ffcdd2' : '#fff';
      html += `<td contenteditable="true" style="background:${bg}" data-cell="${cellId}" oninput="updateCellColor(this)">${val}</td>`;
    }
    html += `</tr>`;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

function updateCellColor(cell) {
  const v = cell.innerText.trim().toUpperCase();
  cell.style.backgroundColor = v === 'P' ? '#c8e6c9' : v === 'A' ? '#ffcdd2' : '#fff';
}

function saveAttendance() {
  const key = getAttendanceKey();
  const data = {};
  document.querySelectorAll('#attendanceTable td[contenteditable="true"]').forEach(td => {
    const id = td.dataset.cell;
    const val = td.innerText.trim().toUpperCase();
    if (id) data[id] = val;
  });
  localStorage.setItem(key, JSON.stringify(data));
  showPopup("Attendance saved");
}

function exportAttendanceCSV() {
  const table = document.querySelector("#attendanceTable table");
  if (!table) return showPopup("No table to export");

  let csv = "";
  table.querySelectorAll("tr").forEach(row => {
    let line = [];
    row.querySelectorAll("th, td").forEach(cell => {
      let text = cell.innerText.replace(/"/g, '""');
      line.push(`"${text}"`);
    });
    csv += line.join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${getAttendanceKey()}.csv`;
  link.click();
}

// ====================
// REPORTS
// ====================
function downloadMonthlyReport() {
  const month = document.getElementById('reportMonth').value;
  if (!month) return showPopup("Please select a month");

  const [year, monthNum] = month.split("-").map(Number);
  const daysInMonth = new Date(year, monthNum, 0).getDate();

  const workbook = XLSX.utils.book_new();

  Object.keys(hubs).forEach(hub => {
    const key = `attendance_${hub}_${month}`;
    const data = JSON.parse(localStorage.getItem(key) || '{}');

    const hubEmployees = employees.filter(emp => emp.hub === hub);

    const rows = [["Employee Name", "Contact Number", "Bank Account Number", "IFSC Code", "Bank Name", "Total Working Days"]];
    
    hubEmployees.forEach((emp, index) => {
      let presentDays = 0;

      for (let d = 1; d <= daysInMonth; d++) {
        const val = data[`${index}_${d}`];
        if (val === 'P') presentDays++;
      }

      rows.push([
        `${emp.surname} ${emp.name}`,
        emp.mobile,
        emp.account,
        emp.ifsc,
        emp.bank,
        presentDays
      ]);
    });

    const sheet = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, hub);
  });

  XLSX.writeFile(workbook, `Monthly_Report_${month}.xlsx`);
  showPopup("Excel report downloaded!");
}


function generateDailyReport() {
  // Placeholder — implement if needed
  console.log("Generate Daily Report");
}

// ====================
// INIT
// ====================
window.onload = () => {
  populateHubSelects();
  displayEmployees();
};
function filterAttendanceTable() {
  const input = document.getElementById("attendanceSearchInput").value.toLowerCase();
  const rows = document.querySelectorAll("#attendanceTable tbody tr");

  rows.forEach(row => {
    const nameCell = row.querySelector("td");
    const name = nameCell?.innerText.toLowerCase() || "";
    row.style.display = name.includes(input) ? "" : "none";
  });
}
