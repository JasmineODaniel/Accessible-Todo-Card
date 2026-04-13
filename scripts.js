/* ============================================================
   TODO CARD — script.js
   Handles:
     1. Live current date in banner
     2. Live time-remaining countdown (updates every 60s)
     3. Checkbox toggle: strike-through title + status icon change
     4. Edit panel: fully editable title, description, priority, status
     5. Delete: confirmation overlay, then removes card from DOM
   ============================================================ */

/* ------------------------------------------------------------------
   CONFIG
   ------------------------------------------------------------------ */
var DUE_DATE = new Date('2026-04-18T18:00:00Z');

/* ------------------------------------------------------------------
   PRIORITY CONFIG — icon class + badge class per value
   ------------------------------------------------------------------ */
var PRIORITY_MAP = {
  high:   { icon: 'fa-solid fa-bolt',              badge: 'priority-high',   label: 'Priority: High' },
  medium: { icon: 'fa-solid fa-signal',            badge: 'priority-medium', label: 'Priority: Medium' },
  low:    { icon: 'fa-solid fa-arrow-down',         badge: 'priority-low',    label: 'Priority: Low' }
};

/* ------------------------------------------------------------------
   STATUS CONFIG — icon class + badge class per value
   ------------------------------------------------------------------ */
var STATUS_MAP = {
  pending:    { icon: 'fa-solid fa-circle',             badge: 'status-pending',    label: 'Status: Pending' },
  inprogress: { icon: 'fa-solid fa-circle-half-stroke', badge: 'status-inprogress', label: 'Status: In Progress' },
  done:       { icon: 'fa-solid fa-circle-check',       badge: 'status-done',       label: 'Status: Done' }
};

/* ------------------------------------------------------------------
   STATE — tracks current priority and status values
   ------------------------------------------------------------------ */
var currentPriority = 'high';
var currentStatus   = 'inprogress';

/* ------------------------------------------------------------------
   DOM REFERENCES
   ------------------------------------------------------------------ */
var currentDateEl      = document.getElementById('current-date');
var toggle             = document.getElementById('complete-toggle');
var taskTitle          = document.getElementById('task-title');
var taskDescription    = document.getElementById('task-description');
var priorityBadge      = document.getElementById('priority-badge');
var taskStatus         = document.getElementById('task-status');
var timeRemainingEl    = document.getElementById('time-remaining');
var timeRemainingTxt   = document.getElementById('time-remaining-text');

/* Edit panel */
var editBtn            = document.getElementById('edit-btn');
var editPanel          = document.getElementById('edit-panel');
var editTitleInput     = document.getElementById('edit-title-input');
var editDescInput      = document.getElementById('edit-desc-input');
var editPrioritySelect = document.getElementById('edit-priority-select');
var editStatusSelect   = document.getElementById('edit-status-select');
var editSaveBtn        = document.getElementById('edit-save-btn');
var editCancelBtn      = document.getElementById('edit-cancel-btn');

/* Delete */
var deleteBtn          = document.getElementById('delete-btn');

/* Card root */
var cardEl             = document.querySelector('article[data-testid="test-todo-card"]');

/* ------------------------------------------------------------------
   1. CURRENT DATE in banner
   ------------------------------------------------------------------ */
function renderCurrentDate() {
  var now = new Date();
  var options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  var formatted = now.toLocaleDateString('en-US', options);
  currentDateEl.textContent = formatted;
  currentDateEl.setAttribute('datetime', now.toISOString().slice(0, 10));
}

renderCurrentDate();

/* ------------------------------------------------------------------
   2. TIME REMAINING — returns { text, cls }
   ------------------------------------------------------------------ */
function getTimeRemaining(due) {
  var diff  = due.getTime() - Date.now();
  var abs   = Math.abs(diff);
  var mins  = Math.floor(abs / 60000);
  var hours = Math.floor(abs / 3600000);
  var days  = Math.floor(abs / 86400000);

  if (diff < 0) {
    if (mins < 60)  return { text: 'Overdue by ' + mins  + ' min'  + (mins  !== 1 ? 's' : ''), cls: 'overdue' };
    if (hours < 24) return { text: 'Overdue by ' + hours + ' hr'   + (hours !== 1 ? 's' : ''), cls: 'overdue' };
    return              { text: 'Overdue by ' + days  + ' day'  + (days  !== 1 ? 's' : ''), cls: 'overdue' };
  }

  if (mins < 2)   return { text: 'Due now!',                                                    cls: 'overdue' };
  if (mins < 60)  return { text: 'Due in ' + mins  + ' min'  + (mins  !== 1 ? 's' : ''),        cls: 'soon' };
  if (hours < 24) return { text: 'Due in ' + hours + ' hr'   + (hours !== 1 ? 's' : ''),        cls: 'soon' };
  if (days === 1) return  { text: 'Due tomorrow',                                                cls: 'soon' };
  return                  { text: 'Due in ' + days  + ' days',                                  cls: '' };
}

function updateTimeDisplay() {
  var result = getTimeRemaining(DUE_DATE);
  timeRemainingTxt.textContent = result.text;
  timeRemainingEl.className = '';
  if (result.cls) { timeRemainingEl.classList.add(result.cls); }
}

updateTimeDisplay();
setInterval(updateTimeDisplay, 60000);

/* ------------------------------------------------------------------
   3. CHECKBOX TOGGLE
   ------------------------------------------------------------------ */
toggle.addEventListener('change', function () {
  if (this.checked) {
    taskTitle.classList.add('done');
    applyStatus('done');
  } else {
    taskTitle.classList.remove('done');
    applyStatus(currentStatus === 'done' ? 'inprogress' : currentStatus);
  }
});

/* ------------------------------------------------------------------
   HELPER — apply priority badge icon + class
   ------------------------------------------------------------------ */
function applyPriority(value) {
  var cfg = PRIORITY_MAP[value] || PRIORITY_MAP['high'];
  currentPriority = value;

  /* Clear old badge classes */
  priorityBadge.classList.remove('priority-high', 'priority-medium', 'priority-low');
  priorityBadge.classList.add(cfg.badge);
  priorityBadge.setAttribute('aria-label', cfg.label);
  priorityBadge.setAttribute('title', cfg.label);

  var icon = priorityBadge.querySelector('i');
  icon.className = cfg.icon;
  icon.setAttribute('aria-hidden', 'true');
}

/* ------------------------------------------------------------------
   HELPER — apply status badge icon + class
   ------------------------------------------------------------------ */
function applyStatus(value) {
  var cfg = STATUS_MAP[value] || STATUS_MAP['inprogress'];
  currentStatus = value;

  /* Clear old badge classes */
  taskStatus.classList.remove('status-pending', 'status-inprogress', 'status-done');
  taskStatus.classList.add(cfg.badge);
  taskStatus.setAttribute('aria-label', cfg.label);
  taskStatus.setAttribute('title', cfg.label);

  var icon = taskStatus.querySelector('i');
  icon.className = cfg.icon;
  icon.setAttribute('aria-hidden', 'true');
}

/* ------------------------------------------------------------------
   4. EDIT PANEL — open
   ------------------------------------------------------------------ */
function openEditPanel() {
  /* Pre-fill fields with current values */
  editTitleInput.value     = taskTitle.textContent.trim();
  editDescInput.value      = taskDescription.textContent.trim();
  editPrioritySelect.value = currentPriority;
  editStatusSelect.value   = currentStatus;

  /* Show panel */
  editPanel.hidden = false;
  editPanel.setAttribute('aria-hidden', 'false');
  editTitleInput.focus();

  console.log('edit clicked');
}

/* ------------------------------------------------------------------
   4. EDIT PANEL — save
   ------------------------------------------------------------------ */
function saveEdit() {
  var newTitle = editTitleInput.value.trim();
  var newDesc  = editDescInput.value.trim();

  if (newTitle) { taskTitle.textContent = newTitle; }
  if (newDesc)  { taskDescription.textContent = newDesc; }

  applyPriority(editPrioritySelect.value);
  applyStatus(editStatusSelect.value);

  /* Sync checkbox if status was set to done */
  if (editStatusSelect.value === 'done') {
    toggle.checked = true;
    taskTitle.classList.add('done');
  } else {
    toggle.checked = false;
    taskTitle.classList.remove('done');
  }

  closeEditPanel();
}

/* ------------------------------------------------------------------
   4. EDIT PANEL — close (cancel)
   ------------------------------------------------------------------ */
function closeEditPanel() {
  editPanel.hidden = true;
  editPanel.setAttribute('aria-hidden', 'true');
  editBtn.focus();
}

editBtn.addEventListener('click', openEditPanel);
editSaveBtn.addEventListener('click', saveEdit);
editCancelBtn.addEventListener('click', closeEditPanel);

/* Close edit panel on Escape */
editPanel.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') { closeEditPanel(); }
});

/* ------------------------------------------------------------------
   5. DELETE — confirmation overlay (created dynamically)
   ------------------------------------------------------------------ */
function openDeleteOverlay() {
  /* Build overlay if not already present */
  var existing = document.getElementById('delete-overlay');
  if (existing) {
    existing.hidden = false;
    existing.setAttribute('aria-hidden', 'false');
    existing.querySelector('.btn-confirm-delete').focus();
    return;
  }

  var overlay = document.createElement('div');
  overlay.id = 'delete-overlay';
  overlay.className = 'delete-overlay';
  overlay.setAttribute('role', 'alertdialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Confirm delete');
  overlay.innerHTML =
    '<div class="delete-overlay-icon" aria-hidden="true">' +
      '<i class="fa-solid fa-trash"></i>' +
    '</div>' +
    '<p class="delete-overlay-title">Delete this task?</p>' +
    '<p class="delete-overlay-sub">This action cannot be undone.</p>' +
    '<div class="delete-overlay-actions">' +
      '<button class="btn-confirm-delete" id="confirm-delete-btn" aria-label="Confirm delete">' +
        '<i class="fa-solid fa-trash" aria-hidden="true"></i> Delete' +
      '</button>' +
      '<button class="btn-cancel-delete" id="cancel-delete-btn" aria-label="Cancel delete">' +
        '<i class="fa-solid fa-xmark" aria-hidden="true"></i> Cancel' +
      '</button>' +
    '</div>';

  cardEl.appendChild(overlay);

  document.getElementById('confirm-delete-btn').addEventListener('click', function () {
    /* Animate card out then remove */
    cardEl.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
    cardEl.style.opacity    = '0';
    cardEl.style.transform  = 'scale(0.92) translateY(20px)';
    setTimeout(function () {
      cardEl.remove();
    }, 380);
  });

  document.getElementById('cancel-delete-btn').addEventListener('click', function () {
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    deleteBtn.focus();
  });

  /* Trap Escape key */
  overlay.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden', 'true');
      deleteBtn.focus();
    }
  });

  /* Focus confirm button */
  document.getElementById('confirm-delete-btn').focus();
}

deleteBtn.addEventListener('click', openDeleteOverlay);
