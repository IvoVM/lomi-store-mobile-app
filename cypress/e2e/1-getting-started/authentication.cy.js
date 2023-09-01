const user = "cypress@pruebacypress.cl"
const pass = "cy123123"

export function logout(){
  cy.get('ion-tab-button[tab=menu]').click()
  cy.get('.singOut').click()
}

export function login(){
  cy.get('input[type=email]').type(user)
  cy.get('input[type=password]').type(pass)
  cy.get('#google-sign-in').click()
}

function loginWithGoogle(){
  cy.get(".googleButton").click()
}