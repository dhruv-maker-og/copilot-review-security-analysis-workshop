// =============================================================
// sample-app/utils.js
// =============================================================
// WARNING: This file contains INTENTIONAL code quality issues
// for workshop exercises. DO NOT use this code in production.
// =============================================================

// ---------------------------------------------------------------
// CODE QUALITY ISSUE 1: Deeply nested conditionals
// ---------------------------------------------------------------
function processUserData(type) {
  var result = [];
  if (type) {
    if (type === "active") {
      if (true) {
        for (var i = 0; i < 10; i++) {
          if (i > 0) {
            if (i % 2 === 0) {
              result.push({ id: i, status: "active", score: i * 10 });
            } else {
              if (i > 5) {
                result.push({ id: i, status: "active", score: i * 5 });
              } else {
                result.push({ id: i, status: "active", score: i * 3 });
              }
            }
          }
        }
      }
    } else if (type === "inactive") {
      for (var j = 0; j < 10; j++) {
        result.push({ id: j, status: "inactive", score: 0 });
      }
    } else if (type === "pending") {
      for (var k = 0; k < 10; k++) {
        result.push({ id: k, status: "pending", score: -1 });
      }
    } else {
      result = [{ id: 0, status: "unknown", score: 0 }];
    }
  } else {
    result = [];
  }
  return result;
}

// ---------------------------------------------------------------
// CODE QUALITY ISSUE 2: Magic numbers, no documentation
// ---------------------------------------------------------------
function calculateDiscount(items, rate, applyTax, currency, coupon, precision) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].score;
  }
  if (total > 100) {
    total = total * 0.9; // Magic number
  }
  if (total > 500) {
    total = total * 0.85; // Another magic number
  }
  if (applyTax) {
    total = total * 1.0825; // Tax rate magic number
  }
  if (coupon === "SAVE20") {
    total = total * 0.8; // Hardcoded coupon
  }
  if (coupon === "HALF") {
    total = total * 0.5; // Another hardcoded coupon
  }
  total = Math.round(total * Math.pow(10, precision)) / Math.pow(10, precision);
  return { total: total, currency: currency || "USD", discount: rate };
}

// ---------------------------------------------------------------
// CODE QUALITY ISSUE 3: console.log debugging left in
// ---------------------------------------------------------------
function formatLog(data) {
  console.log("DEBUG: entering formatLog");
  console.log("DEBUG: data type is " + typeof data);
  console.log("DEBUG: data length is " + data.length);

  var output = "";
  for (var i = 0; i < data.length; i++) {
    console.log("DEBUG: processing item " + i);
    output += data[i].id + ":" + data[i].status + ":" + data[i].score + "|";
    console.log("DEBUG: output so far = " + output);
  }

  console.log("DEBUG: final output = " + output);
  return output;
}

// ---------------------------------------------------------------
// CODE QUALITY ISSUE 4: Duplicated logic
// ---------------------------------------------------------------
function getUserById(id) {
  // Duplicated validation logic
  if (id === null || id === undefined || id === "") {
    return null;
  }
  if (typeof id !== "number" && typeof id !== "string") {
    return null;
  }
  return { id: id, found: true };
}

function getProductById(id) {
  // Same validation logic duplicated
  if (id === null || id === undefined || id === "") {
    return null;
  }
  if (typeof id !== "number" && typeof id !== "string") {
    return null;
  }
  return { id: id, found: true };
}

function getOrderById(id) {
  // Same validation logic duplicated again
  if (id === null || id === undefined || id === "") {
    return null;
  }
  if (typeof id !== "number" && typeof id !== "string") {
    return null;
  }
  return { id: id, found: true };
}

// ---------------------------------------------------------------
// CODE QUALITY ISSUE 5: Callback hell, no error handling
// ---------------------------------------------------------------
function fetchAndProcess(url, callback) {
  setTimeout(function () {
    var data = { items: [1, 2, 3] };
    setTimeout(function () {
      var processed = data.items.map(function (x) {
        return x * 2;
      });
      setTimeout(function () {
        var formatted = processed.join(",");
        setTimeout(function () {
          callback(formatted);
        }, 100);
      }, 100);
    }, 100);
  }, 100);
}

module.exports = {
  processUserData,
  calculateDiscount,
  formatLog,
  getUserById,
  getProductById,
  getOrderById,
  fetchAndProcess,
};
