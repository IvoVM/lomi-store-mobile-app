const { login, logout } = require('./authentication.cy')

let xhrResponse;

describe('Inicia la aplicación', () => {  

    beforeEach(() => {
      window.localStorage.setItem('isCypress', true)

    })

    before(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
      indexedDB.deleteDatabase("_ionicstorage")
      cy.viewport('iphone-xr')
      cy.visit('http://localhost:8100', {
        headers: {
          'user-agent' : 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
        }
      })
    })

  it('Muestra el modal de comuna', ()=>{
    cy.get("#county-select-input")
  })

  it('Selecciona comuna "La Florida" ', ()=>{
    cy.get("#county-select-input").click()
    cy.wait(2000)
    cy.get("#searchbar-county").type("La Florida")
    cy.get("#La-Florida").click()
    cy.get("#county-select-button").click()
  })

  it('El Stock location es correcto', ()=>{
    cy.get(".address").contains("Av. Vicuña")
  })

  return

  it('Inicia sesion en el home', () => {
    cy.get('.sign-in-tab').click()
    login()
    logout()
  })    

  it('Inicia sesión en al seleccionar direccion', ()=>{
    cy.get('app-shipping-selector').click()
    cy.get('.delivery-button').click()
    login()
    logout()
  })

})