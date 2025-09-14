// Debug script to test search functionality
const testName = "MD SHOHEL RANA";
const searchTerm = "rana";

console.log("Testing search functionality:");
console.log("Full name:", testName);
console.log("Search term:", searchTerm);
console.log("Lowercase full name:", testName.toLowerCase());
console.log("Lowercase search term:", searchTerm.toLowerCase());

// Test if LIKE pattern would match
const pattern = `%${searchTerm.toLowerCase()}%`;
console.log("Search pattern:", pattern);
console.log("Would match:", testName.toLowerCase().includes(searchTerm.toLowerCase()));

// Test SQL LIKE simulation
function sqlLikeTest(text, pattern) {
  // Convert SQL LIKE pattern to regex
  const regexPattern = pattern
    .replace(/%/g, '.*')
    .replace(/_/g, '.');
  const regex = new RegExp(`^${regexPattern}$`, 'i');
  return regex.test(text);
}

console.log("SQL LIKE simulation result:", sqlLikeTest(testName, pattern));