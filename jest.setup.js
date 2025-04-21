import "@testing-library/jest-dom";

global.Request = jest.fn(); // Mock Request globally for all tests
global.Response = jest.fn(); // Mock Request globally for all tests

if (typeof TextEncoder === "undefined") {
  global.TextEncoder = require("util").TextEncoder;
}
