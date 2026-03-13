// =============================================================
// sample-app/test/server.test.js
// =============================================================
// Basic test suite for the sample app.
// Run with: npm test (or node test/server.test.js)
// =============================================================

const assert = require("assert");
const {
  processUserData,
  calculateDiscount,
  formatLog,
  getUserById,
  getProductById,
  getOrderById,
} = require("../utils");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ❌ ${name}: ${err.message}`);
    failed++;
  }
}

console.log("\n=== Sample App Tests ===\n");

// --- processUserData tests ---
console.log("processUserData:");

test("returns active users for type 'active'", () => {
  const result = processUserData("active");
  assert.ok(Array.isArray(result));
  assert.ok(result.length > 0);
  assert.strictEqual(result[0].status, "active");
});

test("returns inactive users for type 'inactive'", () => {
  const result = processUserData("inactive");
  assert.ok(result.length === 10);
  assert.strictEqual(result[0].status, "inactive");
});

test("returns empty array for null type", () => {
  const result = processUserData(null);
  assert.ok(Array.isArray(result));
  assert.strictEqual(result.length, 0);
});

test("returns unknown for unrecognized type", () => {
  const result = processUserData("xyz");
  assert.strictEqual(result[0].status, "unknown");
});

// --- calculateDiscount tests ---
console.log("\ncalculateDiscount:");

test("calculates total from item scores", () => {
  const items = [{ score: 10 }, { score: 20 }, { score: 30 }];
  const result = calculateDiscount(items, 0.1, false, "USD", null, 2);
  assert.strictEqual(result.total, 60);
  assert.strictEqual(result.currency, "USD");
});

test("applies 10% discount for totals over 100", () => {
  const items = [{ score: 60 }, { score: 60 }];
  const result = calculateDiscount(items, 0.1, false, "USD", null, 2);
  assert.strictEqual(result.total, 108); // 120 * 0.9 = 108
});

test("applies tax when applyTax is true", () => {
  const items = [{ score: 50 }];
  const result = calculateDiscount(items, 0.1, true, "EUR", null, 2);
  assert.strictEqual(result.total, 54.13); // 50 * 1.0825 = 54.125, rounded
});

// --- getUserById tests ---
console.log("\ngetUserById:");

test("returns user for valid id", () => {
  const result = getUserById(1);
  assert.ok(result);
  assert.strictEqual(result.id, 1);
  assert.strictEqual(result.found, true);
});

test("returns null for null id", () => {
  const result = getUserById(null);
  assert.strictEqual(result, null);
});

test("returns null for empty string id", () => {
  const result = getUserById("");
  assert.strictEqual(result, null);
});

// --- Summary ---
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
if (failed > 0) {
  process.exit(1);
}
