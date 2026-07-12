/** @type {import('jest').Config} */
module.exports = {
  rootDir: "src",
  testEnvironment: "node",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  moduleFileExtensions: ["js", "json", "ts"],
  testRegex: ".*\\.spec\\.ts$",
  moduleNameMapper: {
    "^@tokutei-ginou/shared$": "<rootDir>/../../../packages/shared/src",
    "^@tokutei-ginou/db$": "<rootDir>/../../../packages/db/src",
  },
};
