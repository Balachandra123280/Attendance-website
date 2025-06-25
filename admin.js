// ==========================
// Admin Dashboard Script
// ==========================

// ====== Initial Load from localStorage ======
let hubs = JSON.parse(localStorage.getItem('hubs')) || {};
let employees = JSON.parse(localStorage.getItem('employees')) || [];
let attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || {};

// ====== Data Persistence ======
function saveData() {
  localStorage.setItem('hubs', JSON.stringify(hubs));
  localStorage.setItem('employees', JSON.stringify(employees));
  localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
}

// ====== UI Helper Functions ======

function showSection(sectionId) {
  document.querySelectorAll('.form-section').forEach(section => {
    section.style.display = 'none';
  });
  const section = document.getElementById(sectionId);
  if (section) section.style.display = 'block';
}

function showPopup(message, type = 'success') {
  const popup = document.getElementById('popupMsg');
  popup.innerText = message;
  popup.className = ''; // Reset classes
  popup.classList.add(type === 'error' ? 'popup-error' : 'popup-success');
  popup.style.display = 'block';
  setTimeout(() => popup.style.display = 'none', 2500);
}

// ====== HUB and Checkpost Management ======

function updateDropdowns() {
  const hubDropdowns = [
    'hubSelect', 'empHubSelect', 'attendanceHubSelect', 
    'reportMonthHubSelect', 'reportHubSelect'
  ];

  hubDropdowns.forEach(id => {
    const select = document.getElementById(id);
    if (!select) return;

    select.innerHTML = '<option disabled selected>Select HUB</option>';
    Object.keys(hubs).forEach(hubName => {
      const option = document.createElement('option');
      option.value = option.text = hubName;
      select.appendChild(option);
    });
  });

  updateEmpCheckpostSelect(); // Update dependent dropdown
}

function updateEmpCheckpostSelect() {
  const hub = document.getElementById('empHubSelect')?.value;
  const select = document.getElementById('empCheckpostSelect');
  if (!hub || !select) return;

  select.innerHTML = '<option disabled selected>Select Checkpost</option>';
  (hubs[hub] || []).forEach(cp => {
    const option = document.createElement('option');
    option.value = option.text = cp;
    select.appendChild(option);
  });
}

function addHub() {
  const hubName = document.getElementById('newHubName').value.trim();
  if (!hubName || hubs[hubName]) return showPopup('Invalid or existing HUB', 'error');

  hubs[hubName] = [];
  saveData();
  updateDropdowns();
  showPopup('✅ HUB added successfully');
  document.getElementById('newHubName').value = '';
}

function addCheckpost() {
  const hub = document.getElementById('hubSelect')?.value;
  const cpName = document.getElementById('newCheckpostName').value.trim();

  if (!hub || !cpName || hubs[hub]?.includes(cpName)) {
    return showPopup('Invalid or duplicate Checkpost', 'error');
  }

  hubs[hub].push(cpName);
  saveData();
  updateDropdowns();
  showPopup('✅ Checkpost added successfully');
  document.getElementById('newCheckpostName').value = '';
}

// ====== Employee Management ======

function addEmployee() {
  const emp = {
    id: Date.now(),
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

  if (!emp.name || !emp.hub || !emp.checkpost) {
    return showPopup('Please fill in all required fields.', 'error');
  }

  employees.push(emp);
  saveData();
  renderEmployees();
  showPopup('✅ Employee added successfully');

  // Reset input fields
  document.querySelectorAll('#employeeSection input').forEach(input => input.value = '');
}

function renderEmployees() {
  const table = document.getElementById('employeeTable');
  if (!table) return;

  table.innerHTML = `<table>
    <tr><th>Name</th><th>Mobile</th><th>Hub</th><th>Checkpost</th><th>Action</th></tr>
    ${employees.map(emp => `
      <tr>
        <td>${emp.name} ${emp.surname}</td>
        <td>${emp.mobile}</td>
        <td>${emp.hub}</td>
        <td>${emp.checkpost}</td>
        <td><button onclick="deleteEmployee(${emp.id})">🗑️ Delete</button></td>
      </tr>`).join('')}
    </table>`;
}

function deleteEmployee(empId) {
  if (!confirm('Are you sure you want to delete this employee?')) return;

  employees = employees.filter(emp => emp.id !== empId);
  saveData();
  renderEmployees();
  showPopup('🗑️ Employee deleted');
}

// ====== Attendance Management ======

function markAttendance(key, index, value) {
  if (!attendanceData[key]) attendanceData[key] = [];
  attendanceData[key][index] = value;
  saveData();
  renderAttendance();

  if (value === 'A') {
    const [empId, month] = key.split('_');
    const emp = employees.find(e => e.id == empId);
    if (emp) {
      const timestamp = new Date().toLocaleString();
      alert(`📢 Notification\nName: ${emp.name} ${emp.surname}\nMobile: ${emp.mobile}\nStatus: ABSENT\nMarked on: ${timestamp}`);
    }
  }
}

function renderAttendance() {
  const hub = document.getElementById('attendanceHubSelect').value;
  const month = document.getElementById('attendanceMonth').value;
  if (!hub || !month) return;

  const days = new Date(new Date(`${month}-01`).getFullYear(), new Date(`${month}-01`).getMonth() + 1, 0).getDate();
  const table = document.getElementById('attendanceTable');
  const filtered = employees.filter(e => e.hub === hub);

  let html = `<table><tr><th>Name</th>`;
  for (let i = 1; i <= days; i++) html += `<th>${i}</th>`;
  html += `<th>Total Present</th></tr>`;

  filtered.forEach(emp => {
    const key = `${emp.id}_${month}`;
    if (!attendanceData[key]) attendanceData[key] = Array(days).fill('');
    let present = 0;

    html += `<tr><td>${emp.name}</td>`;
    attendanceData[key].forEach((status, i) => {
      if (status === 'P') present++;
      html += `<td style="background-color: ${status === 'P' ? '#c8f7c5' : status === 'A' ? '#f7c5c5' : ''}">
        <select onchange="markAttendance('${key}', ${i}, this.value)">
          <option value="" ${status === '' ? 'selected' : ''}></option>
          <option value="P" ${status === 'P' ? 'selected' : ''}>P</option>
          <option value="A" ${status === 'A' ? 'selected' : ''}>A</option>
        </select></td>`;
    });
    html += `<td>${present}</td></tr>`;
  });

  html += `</table>`;
  table.innerHTML = html;
}

// ====== Reports ======

function renderMonthlyReport() {
  const hub = document.getElementById('reportMonthHubSelect').value;
  const month = document.getElementById('reportMonth').value;
  const reportTable = document.getElementById('monthlyReportTable');
  if (!hub || !month || !reportTable) return;

  const days = new Date(month + "-01").getDate();
  let csv = [['Name', 'Mobile', 'Bank Acc', 'IFSC', 'Total Days', 'Present', 'Absent', 'Absent Link']];
  let html = `<table><tr><th>Name</th><th>Mobile</th><th>Bank Acc</th><th>IFSC</th><th>Total</th><th>Present</th><th>Absent</th><th>Notify</th></tr>`;

  employees.filter(e => e.hub === hub).forEach(emp => {
    const key = `${emp.id}_${month}`;
    const data = attendanceData[key] || [];
    const present = data.filter(d => d === 'P').length;
    const absent = data.filter(d => d === 'A').length;
    const notifyLink = `mailto:${emp.mobile}@sms.gateway.com?subject=ABSENT%20NOTICE&body=You were absent in ${month}. Please contact supervisor.`;

    csv.push([`${emp.name} ${emp.surname}`, emp.mobile, emp.account, emp.ifsc, days, present, absent, notifyLink]);

    html += `<tr>
      <td>${emp.name} ${emp.surname}</td>
      <td>${emp.mobile}</td>
      <td>${emp.account}</td>
      <td>${emp.ifsc}</td>
      <td>${days}</td>
      <td>${present}</td>
      <td>${absent}</td>
      <td><a href="${notifyLink}" target="_blank">📧</a></td>
    </tr>`;
  });

  html += `</table>`;
  reportTable.innerHTML = html;

  const btn = document.createElement('button');
  btn.textContent = 'Download CSV';
  btn.onclick = () => downloadCSV(csv, 'monthly_report.csv');
  reportTable.appendChild(btn);
}

function renderDailyReport() {
  const hub = document.getElementById('reportHubSelect').value;
  const date = document.getElementById('reportDateInput').value;
  if (!hub || !date) return;

  const day = new Date(date).getDate();
  const month = date.substring(0, 7);
  const table = document.getElementById('dailyReportTable');
  let html = `<table><tr><th>Name</th><th>Status (${date})</th></tr>`;

  employees.filter(e => e.hub === hub).forEach(emp => {
    const key = `${emp.id}_${month}`;
    const data = attendanceData[key] || [];
    html += `<tr><td>${emp.name}</td><td>${data[day - 1] || 'N/A'}</td></tr>`;
  });

  html += `</table>`;
  table.innerHTML = html;
}

// ====== Export Utilities ======

function exportToCSV() {
  let csv = 'Name,Surname,Mobile,Location,Bank Acc,IFSC,Bank,PAN,Hub,Checkpost\n';
  employees.forEach(e => {
    csv += `${e.name},${e.surname},${e.mobile},${e.location},${e.account},${e.ifsc},${e.bank},${e.pan},${e.hub},${e.checkpost}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'employees.csv';
  link.click();
}

function downloadCSV(data, filename) {
  const csv = data.map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// ====== Init Dashboard on Load ======

updateDropdowns();
renderEmployees();

<script>
  function showSection(sectionId) {
    document.querySelectorAll('.form-section').forEach(sec => sec.style.display = 'none');
    document.getElementById(sectionId).style.display = 'flex';
  }

  // Show the first section by default
  window.onload = () => showSection('hubSection');
</script>

