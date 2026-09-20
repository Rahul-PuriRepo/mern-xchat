module.exports = {
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "assessment/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",

    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
};