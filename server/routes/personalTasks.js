const express = require("express");
const crypto = require("node:crypto");
const { state, save } = require("../db");
const { requireAuth } = require("../auth");

const router = express.Router();
router.use(requireAuth);

function serializeTask(task) {
  const entries = state.personalTaskEntries.filter((e) => e.taskId === task.id);
  const approved = entries.filter((e) => e.status === "approved");
  const progress = task.targetType === "sum" ? approved.reduce((a, e) => a + (e.amount || 0), 0) : approved.length;
  const target = task.targetType === "sum" ? task.targetSum : task.targetCount;
  return {
    ...task,
    entries,
    progress,
    target,
    isExpired: task.status === "active" && new Date(task.deadline).getTime() < Date.now(),
  };
}

// ---- manager: my assigned personal tasks ----------------------------------
router.get("/my-personal-tasks", (req, res) => {
  const tasks = state.personalTasks.filter((t) => t.assigneeId === req.auth.id).map(serializeTask);
  res.json({ tasks });
});

// ---- manager: submit a progress entry (a worked client / a payment) ------
router.post("/personal-tasks/:id/entries", (req, res) => {
  const task = state.personalTasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: "not_found" });
  if (task.assigneeId !== req.auth.id) return res.status(403).json({ error: "forbidden" });
  if (task.status !== "active") return res.status(400).json({ error: "task_not_active" });

  const { label, amount, note } = req.body || {};
  if (!label) return res.status(400).json({ error: "missing_label" });

  const entry = {
    id: crypto.randomUUID(),
    taskId: task.id,
    label: String(label).trim(),
    amount: amount !== undefined && amount !== "" ? Number(amount) || 0 : null,
    note: note || "",
    status: "pending",
    submittedAt: new Date().toISOString(),
    approvedAt: null,
  };
  state.personalTaskEntries.push(entry);
  save();
  res.status(201).json({ entry });
});

module.exports = { router, serializeTask };
