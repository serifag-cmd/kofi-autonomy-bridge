"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const htmlPath = path.join(__dirname, "index.html");
const html = fs.readFileSync(htmlPath, "utf8");
const match = html.match(/<script id="scopeguard-core">([\s\S]*?)<\/script>/);
assert.ok(match, "scopeguard-core script must exist");

const sandbox = { window: {} };
vm.runInNewContext(match[1], sandbox, { filename: "scopeguard-core.js" });
const core = sandbox.window.ScopeGuardCore;
assert.equal(typeof core.classifyAssessment, "function");
assert.equal(typeof core.calculateEstimate, "function");

const base = {
  deliverable: "yes",
  quantity: "yes",
  purpose: "yes",
  requirements: "yes",
  revision: "na",
  materialChanges: []
};

assert.equal(core.classifyAssessment(base).state, "inside", "all confirmed included");
assert.equal(core.classifyAssessment({ ...base, deliverable: "no" }).state, "potential", "scope mismatch");
assert.equal(core.classifyAssessment({ ...base, quantity: "unclear" }).state, "clarify", "unknown comparison");
assert.equal(core.classifyAssessment({ ...base, revision: "no" }).state, "potential", "excluded revision");
assert.equal(core.classifyAssessment({ ...base, revision: "unclear" }).state, "clarify", "unknown revision");
assert.equal(core.classifyAssessment({ ...base, materialChanges: ["newIntegration"] }).state, "potential", "material change flag");
assert.equal(core.classifyAssessment({ ...base, materialChanges: ["newDeliverable", "urgent"] }).material.length, 2);

const estimate = core.calculateEstimate({ hours: 3.5, rate: 60, costs: 15, buffer: 10 });
assert.equal(estimate.valid, true);
assert.equal(estimate.labour, 210);
assert.equal(estimate.reserve, 21);
assert.equal(estimate.costs, 15);
assert.equal(estimate.total, 246);
assert.equal(estimate.currency, "EUR");
assert.equal(core.calculateEstimate({ hours: -1, rate: 60, costs: 0, buffer: 10 }).valid, false);
assert.equal(core.calculateEstimate({ hours: 1, rate: 60, costs: 0, buffer: 101 }).valid, false);
assert.equal(core.calculateEstimate({ hours: "not a number", rate: 60, costs: 0, buffer: 10 }).valid, false);
assert.equal(core.calculateEstimate({ hours: 1, rate: "", costs: 0, buffer: 10 }).valid, false);

assert.doesNotMatch(html, /<script[^>]+src=/i, "no remote scripts");
assert.doesNotMatch(match[1], /\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon/, "core has no network calls");
assert.match(html, /textContent\s*=\s*reason/, "reasons are rendered as text");
assert.match(html, /Los datos han cambiado/, "editing inputs invalidates stale results");

console.log("ScopeGuard v2 core: PASS (16 assertions plus offline/safety checks)");
