const express = require("express");
const crypto = require("node:crypto");
const { state, save } = require("../db");
const { requireAuth, requireRole } = require("../auth");
const { serializeTask } = require("./personalTasks");

const router = express.Router();
router.use(requireAuth, requireRole("rop", "admin"));

router.get("/personal-tasks", (_req, res) => {
  const tasks = state.personalTasks.map((t) => {
    const assignee = state.accounts.find((a) => a.id === t.assigneeId);
    return { ...serializeTask(t), assigneeName: assignee?.name ?? "—" };
  });
  res.json({ tasks });
});

router.post("/personal-tasks", (req, res) => {
  const {
    type, title, description, assigneeIds, targetType, targetSum, targetCount, universeCount,
    deadline, xpReward, coinReward, perEntryXp, perEntryCoins,
  } = req.body || {};

  if (!title || !Array.isArray(assigneeIds) || assigneeIds.length === 0 || !targetType || !deadline) {
    return res.status(400).json({ error: "missing_fields" });
  }

  const createdIds = [];
  for (const assigneeId of assigneeIds) {
    const assignee = state.accounts.find((a) => a.id === assigneeId);
    if (!assignee) continue;
    const task = {
      id: crypto.randomUUID(),
      type: type || "individual_kpi",
      title,
      description: description || "",
      assigneeId,
      targetType, // 'sum' | 'count'
      targetSum: targetType === "sum" ? Number(targetSum) || 0 : null,
      targetCount: targetType === "count" ? Number(targetCount) || 0 : null,
      universeCount: universeCount ? Number(universeCount) : null,
      deadline: new Date(deadline).toISOString(),
      xpReward: Number(xpReward) || 0,
      coinReward: Number(coinReward) || 0,
      perEntryXp: Number(perEntryXp) || 0,
      perEntryCoins: Number(perEntryCoins) || 0,
      status: "active",
      rewardGranted: false,
      createdAt: new Date().toISOString(),
    };
    state.personalTasks.push(task);
    createdIds.push(task.id);
  }
  save();
  res.status(201).json({ ids: createdIds });
});

router.put("/personal-tasks/:id", (req, res) => {
  const task = state.personalTasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: "not_found" });

  const { title, description, targetSum, targetCount, universeCount, deadline, xpReward, coinReward, perEntryXp, perEntryCoins, status } = req.body || {};
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (targetSum !== undefined) task.targetSum = Number(targetSum) || 0;
  if (targetCount !== undefined) task.targetCount = Number(targetCount) || 0;
  if (universeCount !== undefined) task.universeCount = Number(universeCount) || null;
  if (deadline !== undefined) task.deadline = new Date(deadline).toISOString();
  if (xpReward !== undefined) task.xpReward = Number(xpReward) || 0;
  if (coinReward !== undefined) task.coinReward = Number(coinReward) || 0;
  if (perEntryXp !== undefined) task.perEntryXp = Number(perEntryXp) || 0;
  if (perEntryCoins !== undefined) task.perEntryCoins = Number(perEntryCoins) || 0;
  if (status !== undefined) task.status = status;
  save();
  res.status(204).end();
});

router.delete("/personal-tasks/:id", (req, res) => {
  state.personalTasks = state.personalTasks.filter((t) => t.id !== req.params.id);
  state.personalTaskEntries = state.personalTaskEntries.filter((e) => e.taskId !== req.params.id);
  save();
  res.status(204).end();
});

function creditAccount(accountId, xp, coins) {
  const account = state.accounts.find((a) => a.id === accountId);
  if (!account) return;
  account.xp += xp;
  account.coins += coins;
  account.level = Math.floor(account.xp / 1000) + 1;
}

router.post("/personal-tasks/:id/entries/:entryId/approve", (req, res) => {
  const task = state.personalTasks.find((t) => t.id === req.params.id);
  const entry = state.personalTaskEntries.find((e) => e.id === req.params.entryId && e.taskId === req.params.id);
  if (!task || !entry) return res.status(404).json({ error: "not_found" });

  entry.status = "approved";
  entry.approvedAt = new Date().toISOString();

  if (task.perEntryXp || task.perEntryCoins) {
    creditAccount(task.assigneeId, task.perEntryXp || 0, task.perEntryCoins || 0);
  }

  const serialized = serializeTask(task);
  if (!task.rewardGranted && serialized.progress >= serialized.target) {
    creditAccount(task.assigneeId, task.xpReward || 0, task.coinReward || 0);
    task.rewardGranted = true;
    task.status = "completed";
  }

  save();
  res.json({ task: serializeTask(task) });
});

router.post("/personal-tasks/:id/entries/:entryId/reject", (req, res) => {
  const entry = state.personalTaskEntries.find((e) => e.id === req.params.entryId && e.taskId === req.params.id);
  if (!entry) return res.status(404).json({ error: "not_found" });
  entry.status = "rejected";
  entry.approvedAt = new Date().toISOString();
  save();
  res.status(204).end();
});

module.exports = router;
