export default {
  viewportWidth: 390,
  viewportHeight: 844,
  projectId: "7x8dx5",  
  chromeWebSecurity: false,
  e2e: {
    baseUrl: "http://localhost:8100",
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
  },
}
