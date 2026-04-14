document.addEventListener("DOMContentLoaded", function () {

  var DUE_DATE = new Date('2026-04-18T18:00:00Z');

  var PRIORITY_MAP = {
    high:   { icon: 'fa-solid fa-bolt', badge: 'priority-high', label: 'Priority: High', text: 'High' },
    medium: { icon: 'fa-solid fa-signal', badge: 'priority-medium', label: 'Priority: Medium', text: 'Medium' },
    low:    { icon: 'fa-solid fa-arrow-down', badge: 'priority-low', label: 'Priority: Low', text: 'Low' }
  };

  var STATUS_MAP = {
    pending:    { icon: 'fa-solid fa-hourglass-half', badge: 'status-pending', label: 'Status: Pending', text: 'Pending' },
    inprogress: { icon: 'fa-solid fa-circle-half-stroke', badge: 'status-inprogress', label: 'Status: In Progress', text: 'In Progress' },
    done:       { icon: 'fa-solid fa-circle-check', badge: 'status-done', label: 'Status: Done', text: 'Done' }
  };

  var currentPriority = 'high';
  var currentStatus = 'inprogress';

  var currentDateEl = document.getElementById('current-date-text');
  var toggle = document.getElementById('complete-toggle');
  var taskTitle = document.getElementById('task-title');
  var taskDescription = document.getElementById('task-description');
  var priorityBadge = document.getElementById('priority-badge');
  var taskStatus = document.getElementById('task-status');
  var priorityText = document.getElementById('priority-text');
  var statusText = document.getElementById('status-text');
  var editBtn = document.getElementById('edit-btn');
  var editPanel = document.getElementById('edit-panel');
  var editTitleInput = document.getElementById('edit-title-input');
  var editDescInput = document.getElementById('edit-desc-input');
  var editPrioritySelect = document.getElementById('edit-priority-select');
  var editStatusSelect = document.getElementById('edit-status-select');
  var editSaveBtn = document.getElementById('edit-save-btn');
  var editCancelBtn = document.getElementById('edit-cancel-btn');
  var deleteBtn = document.getElementById('delete-btn');
  var deleteModal = document.getElementById('delete-modal');
  var deleteConfirmBtn = document.getElementById('delete-confirm-btn');
  var deleteCancelBtn = document.getElementById('delete-cancel-btn');
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

  function renderDueText() {
    var diff = DUE_DATE.getTime() - Date.now();
    var days = Math.max(0, Math.ceil(diff / 86400000));
    var dueTextEl = document.querySelector('.due-text');
    dueTextEl.textContent = days > 0 ? ('Due ' + days + 'd') : 'Due today';
  }
  renderDueText();

  // PRIORITY + STATUS
  function applyPriority(value) {
    var cfg = PRIORITY_MAP[value] || PRIORITY_MAP.high;
    currentPriority = value;
    priorityBadge.className = 'due-pill ' + cfg.badge;
    priorityBadge.setAttribute('aria-label', cfg.label);
    priorityBadge.querySelector('i').className = cfg.icon;
    priorityText.textContent = cfg.text;
  }

  function applyStatus(value) {
    var cfg = STATUS_MAP[value] || STATUS_MAP.inprogress;
    currentStatus = value;
    taskStatus.className = 'due-pill ' + cfg.badge;
    taskStatus.setAttribute('aria-label', cfg.label);
    taskStatus.querySelector('i').className = cfg.icon;
    statusText.textContent = cfg.text;
  }

  applyPriority(currentPriority);
  applyStatus(currentStatus);

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
  function openDeleteModal() {
    deleteModal.hidden = false;
  }

  function closeDeleteModal() {
    deleteModal.hidden = true;
  }

  deleteBtn.addEventListener('click', openDeleteModal);
  deleteCancelBtn.addEventListener('click', closeDeleteModal);
  deleteConfirmBtn.addEventListener('click', function () {
    cardEl.remove();
  });

  deleteModal.addEventListener('click', function (event) {
    if (event.target === deleteModal) closeDeleteModal();
  });

});
