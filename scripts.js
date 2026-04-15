document.addEventListener("DOMContentLoaded", function () {
  var DUE_DATE = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  var COLLAPSE_THRESHOLD = 120;
  var timerId = null;
  var isExpanded = false;

  var PRIORITY_MAP = {
    high: { icon: "fa-solid fa-bolt", badge: "priority-high", label: "Priority: High", text: "High", indicator: "priority-high" },
    medium: { icon: "fa-solid fa-signal", badge: "priority-medium", label: "Priority: Medium", text: "Medium", indicator: "priority-medium" },
    low: { icon: "fa-solid fa-arrow-down", badge: "priority-low", label: "Priority: Low", text: "Low", indicator: "priority-low" }
  };

  var STATUS_MAP = {
    pending: { icon: "fa-solid fa-hourglass-half", badge: "status-pending", label: "Status: Pending", text: "Pending" },
    inprogress: { icon: "fa-solid fa-circle-half-stroke", badge: "status-inprogress", label: "Status: In Progress", text: "In Progress" },
    done: { icon: "fa-solid fa-circle-check", badge: "status-done", label: "Status: Done", text: "Done" }
  };

  var currentPriority = "high";
  var currentStatus = "inprogress";

  var currentDateEl = document.getElementById("current-date-text");
  var dueDateEl = document.getElementById("due-date");
  var dueTextEl = document.querySelector(".due-text");
  var toggle = document.getElementById("complete-toggle");
  var statusControl = document.getElementById("status-control");
  var taskTitle = document.getElementById("task-title");
  var taskDescription = document.getElementById("task-description");
  var collapsibleSection = document.getElementById("description-collapsible");
  var expandToggle = document.getElementById("expand-toggle");
  var priorityBadge = document.getElementById("priority-badge");
  var priorityIndicator = document.getElementById("priority-indicator");
  var taskStatus = document.getElementById("task-status");
  var priorityText = document.getElementById("priority-text");
  var statusText = document.getElementById("status-text");
  var timeRemainingEl = document.getElementById("time-remaining");
  var timeRemainingText = document.getElementById("time-remaining-text");
  var overdueIndicator = document.getElementById("overdue-indicator");
  var editBtn = document.getElementById("edit-btn");
  var editPanel = document.getElementById("edit-panel");
  var editForm = document.getElementById("edit-form");
  var editTitleInput = document.getElementById("edit-title-input");
  var editDescInput = document.getElementById("edit-desc-input");
  var editPrioritySelect = document.getElementById("edit-priority-select");
  var editDueDateInput = document.getElementById("edit-due-date-input");
  var editStatusSelect = document.getElementById("edit-status-select");
  var editCancelBtn = document.getElementById("edit-cancel-btn");
  var deleteBtn = document.getElementById("delete-btn");
  var deleteModal = document.getElementById("delete-modal");
  var deleteConfirmBtn = document.getElementById("delete-confirm-btn");
  var deleteCancelBtn = document.getElementById("delete-cancel-btn");
  var cardEl = document.querySelector('article[data-testid="test-todo-card"]');

  function formatDueDate(date) {
    var options = { month: "short", day: "numeric", year: "numeric" };
    return "Due " + date.toLocaleDateString("en-US", options);
  }

  function renderCurrentDate() {
    var now = new Date();
    var options = { weekday: "short", month: "short", day: "numeric", year: "numeric" };
    currentDateEl.textContent = now.toLocaleDateString("en-US", options);
    var dateTime = document.getElementById("current-date");
    dateTime.setAttribute("datetime", now.toISOString().slice(0, 10));
  }

  function renderDueDate() {
    dueTextEl.textContent = formatDueDate(DUE_DATE);
    dueDateEl.setAttribute("datetime", DUE_DATE.toISOString());
  }

  function getTimeRemainingText(due) {
    var diffMs = due.getTime() - Date.now();
    var absMs = Math.abs(diffMs);
    var minutes = Math.max(1, Math.floor(absMs / 60000));
    var hours = Math.max(1, Math.floor(absMs / 3600000));
    var days = Math.max(1, Math.floor(absMs / 86400000));

    if (diffMs < 0) {
      if (minutes < 60) return "Overdue by " + minutes + " minutes";
      if (hours < 24) return "Overdue by " + hours + " hours";
      return "Overdue by " + days + " days";
    }
    if (minutes < 60) return "Due in " + minutes + " minutes";
    if (hours < 24) return "Due in " + hours + " hours";
    return "Due in " + days + " days";
  }

  function startTimer() {
    if (timerId !== null) return;
    timerId = setInterval(updateTimeRemaining, 60000);
  }

  function stopTimer() {
    if (timerId === null) return;
    clearInterval(timerId);
    timerId = null;
  }

  function updateTimeRemaining() {
    if (currentStatus === "done") {
      timeRemainingText.textContent = "Completed";
      timeRemainingEl.classList.remove("soon", "overdue");
      overdueIndicator.hidden = true;
      cardEl.classList.remove("is-overdue");
      return;
    }

    var text = getTimeRemainingText(DUE_DATE);
    var isOverdue = text.indexOf("Overdue") === 0;
    timeRemainingText.textContent = text;
    timeRemainingEl.classList.remove("soon", "overdue");
    if (isOverdue) timeRemainingEl.classList.add("overdue");
    else timeRemainingEl.classList.add("soon");
    overdueIndicator.hidden = !isOverdue;
    cardEl.classList.toggle("is-overdue", isOverdue);
  }

  function applyPriority(value) {
    var cfg = PRIORITY_MAP[value] || PRIORITY_MAP.high;
    currentPriority = value;
    priorityBadge.className = "due-pill " + cfg.badge;
    priorityBadge.setAttribute("aria-label", cfg.label);
    priorityBadge.querySelector("i").className = cfg.icon;
    priorityText.textContent = cfg.text;
    priorityIndicator.className = "priority-indicator " + cfg.indicator;
    priorityIndicator.setAttribute("aria-label", cfg.text + " priority");
  }

  function applyStatus(value) {
    var cfg = STATUS_MAP[value] || STATUS_MAP.pending;
    currentStatus = value;
    taskStatus.className = "due-pill " + cfg.badge;
    taskStatus.setAttribute("aria-label", cfg.label);
    taskStatus.querySelector("i").className = cfg.icon;
    statusText.textContent = cfg.text;
    statusControl.value = value;
    editStatusSelect.value = value;
    toggle.checked = value === "done";
    taskTitle.classList.toggle("done", value === "done");
    cardEl.classList.toggle("is-done", value === "done");
    if (value === "done") stopTimer();
    else startTimer();
    updateTimeRemaining();
  }

  function updateCollapseState() {
    var tooLong = taskDescription.textContent.trim().length > COLLAPSE_THRESHOLD;
    if (!tooLong) {
      collapsibleSection.classList.remove("collapsed");
      expandToggle.hidden = true;
      expandToggle.setAttribute("aria-expanded", "true");
      expandToggle.textContent = "Show less";
      return;
    }
    expandToggle.hidden = false;
    collapsibleSection.classList.toggle("collapsed", !isExpanded);
    expandToggle.setAttribute("aria-expanded", isExpanded ? "true" : "false");
    expandToggle.textContent = isExpanded ? "Show less" : "Show more";
  }

  function toInputDateValue(date) {
    return date.toISOString().slice(0, 10);
  }

  function openEditPanel() {
    editTitleInput.value = taskTitle.textContent.trim();
    editDescInput.value = taskDescription.textContent.trim();
    editPrioritySelect.value = currentPriority;
    editStatusSelect.value = currentStatus;
    editDueDateInput.value = toInputDateValue(DUE_DATE);
    editPanel.hidden = false;
    editTitleInput.focus();
  }

  function closeEditPanel() {
    editPanel.hidden = true;
    editBtn.focus();
  }

  function saveEdit(event) {
    event.preventDefault();
    taskTitle.textContent = editTitleInput.value.trim() || "Untitled Task";
    taskDescription.textContent = editDescInput.value.trim() || "No description.";
    if (editDueDateInput.value) {
      DUE_DATE = new Date(editDueDateInput.value + "T18:00:00");
    }
    applyPriority(editPrioritySelect.value);
    applyStatus(editStatusSelect.value);
    renderDueDate();
    isExpanded = false;
    updateCollapseState();
    closeEditPanel();
  }

  function openDeleteModal() {
    deleteModal.hidden = false;
  }

  function closeDeleteModal() {
    deleteModal.hidden = true;
  }

  renderCurrentDate();
  renderDueDate();
  applyPriority(currentPriority);
  applyStatus(currentStatus);
  updateCollapseState();
  startTimer();

  toggle.addEventListener("change", function () {
    if (toggle.checked) applyStatus("done");
    else if (currentStatus === "done") applyStatus("pending");
  });

  statusControl.addEventListener("change", function () {
    applyStatus(statusControl.value);
  });

  expandToggle.addEventListener("click", function () {
    isExpanded = !isExpanded;
    updateCollapseState();
  });

  editBtn.addEventListener("click", openEditPanel);
  editForm.addEventListener("submit", saveEdit);
  editCancelBtn.addEventListener("click", closeEditPanel);

  deleteBtn.addEventListener("click", openDeleteModal);
  deleteCancelBtn.addEventListener("click", closeDeleteModal);
  deleteConfirmBtn.addEventListener("click", function () {
    cardEl.remove();
  });

  deleteModal.addEventListener("click", function (event) {
    if (event.target === deleteModal) closeDeleteModal();
  });
});
