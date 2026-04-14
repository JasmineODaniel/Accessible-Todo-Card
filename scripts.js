document.addEventListener("DOMContentLoaded", function () {

  var DUE_DATE = new Date('2026-04-18T18:00:00Z');

  var PRIORITY_MAP = {
    high:   { icon: 'fa-solid fa-bolt', badge: 'priority-high', label: 'Priority: High' },
    medium: { icon: 'fa-solid fa-signal', badge: 'priority-medium', label: 'Priority: Medium' },
    low:    { icon: 'fa-solid fa-arrow-down', badge: 'priority-low', label: 'Priority: Low' }
  };

  var STATUS_MAP = {
    pending:    { icon: 'fa-solid fa-circle', badge: 'status-pending', label: 'Status: Pending' },
    inprogress: { icon: 'fa-solid fa-circle-half-stroke', badge: 'status-inprogress', label: 'Status: In Progress' },
    done:       { icon: 'fa-solid fa-circle-check', badge: 'status-done', label: 'Status: Done' }
  };

  var currentPriority = 'high';
  var currentStatus = 'inprogress';

  var currentDateEl = document.getElementById('current-date-text');
  var toggle = document.getElementById('complete-toggle');
  var taskTitle = document.getElementById('task-title');
  var taskDescription = document.getElementById('task-description');
  var priorityBadge = document.getElementById('priority-badge');
  var taskStatus = document.getElementById('task-status');
  var timeRemainingEl = document.getElementById('time-remaining');
  var timeRemainingTxt = document.getElementById('time-remaining-text');
  var editBtn = document.getElementById('edit-btn');
  var editPanel = document.getElementById('edit-panel');
  var editTitleInput = document.getElementById('edit-title-input');
  var editDescInput = document.getElementById('edit-desc-input');
  var editPrioritySelect = document.getElementById('edit-priority-select');
  var editStatusSelect = document.getElementById('edit-status-select');
  var editSaveBtn = document.getElementById('edit-save-btn');
  var editCancelBtn = document.getElementById('edit-cancel-btn');
  var deleteBtn = document.getElementById('delete-btn');
  var cardEl = document.querySelector('article[data-testid="test-todo-card"]');

  // DATE
  function renderCurrentDate() {
    var now = new Date();
    var options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    currentDateEl.textContent = now.toLocaleDateString('en-US', options);
    var dateTime = document.getElementById('current-date');
    dateTime.setAttribute('datetime', now.toISOString().slice(0, 10));
  }
  renderCurrentDate();

  // TIME REMAINING
  function getTimeRemaining(due) {
    var diff = due.getTime() - Date.now();
    var abs = Math.abs(diff);
    var mins = Math.floor(abs / 60000);
    var hours = Math.floor(abs / 3600000);
    var days = Math.floor(abs / 86400000);
    if (diff < 0) return { text: 'Overdue', cls: 'overdue' };
    if (mins < 60) return { text: 'Due in ' + mins + ' min', cls: 'soon' };
    if (hours < 24) return { text: 'Due in ' + hours + ' hr', cls: 'soon' };
    return { text: 'Due in ' + days + ' days', cls: '' };
  }

  function updateTimeDisplay() {
    var result = getTimeRemaining(DUE_DATE);
    timeRemainingTxt.textContent = result.text;
    timeRemainingEl.className = '';
    if (result.cls) timeRemainingEl.classList.add(result.cls);
  }
  updateTimeDisplay();
  setInterval(updateTimeDisplay, 60000);

  // PRIORITY + STATUS
  function applyPriority(value) {
    var cfg = PRIORITY_MAP[value] || PRIORITY_MAP.high;
    currentPriority = value;
    priorityBadge.className = 'badge-icon ' + cfg.badge;
    priorityBadge.querySelector('i').className = cfg.icon;
  }

  function applyStatus(value) {
    var cfg = STATUS_MAP[value] || STATUS_MAP.inprogress;
    currentStatus = value;
    taskStatus.className = 'badge-icon ' + cfg.badge;
    taskStatus.querySelector('i').className = cfg.icon;
  }

  // CHECKBOX
  toggle.addEventListener('change', function () {
    if (this.checked) {
      taskTitle.classList.add('done');
      applyStatus('done');
    } else {
      taskTitle.classList.remove('done');
      applyStatus('inprogress');
    }
  });

  // EDIT
  function openEditPanel() {
    editTitleInput.value = taskTitle.textContent;
    editDescInput.value = taskDescription.textContent.trim();
    editPrioritySelect.value = currentPriority;
    editStatusSelect.value = currentStatus;
    editPanel.hidden = false;
  }

  function closeEditPanel() {
    editPanel.hidden = true;
  }

  function saveEdit() {
    taskTitle.textContent = editTitleInput.value;
    taskDescription.textContent = editDescInput.value;
    applyPriority(editPrioritySelect.value);
    applyStatus(editStatusSelect.value);
    closeEditPanel();
  }

  editBtn.addEventListener('click', openEditPanel);
  editSaveBtn.addEventListener('click', saveEdit); 
  editCancelBtn.addEventListener('click', closeEditPanel);

  // DELETE
  deleteBtn.addEventListener('click', function () {
    if (confirm("Delete this task?")) {
      cardEl.remove();
    }
  });

});
