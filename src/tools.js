import handlebars from 'handlebars'
import { curry } from 'ramda'
import Errors from './Errors'

const compileAndRenderTemplate = (template, context) => handlebars.compile(template)(context)
const compileTemplate = template => handlebars.compile(template)

const scrollToBottomOnMutation = curry((target, mutationsList) => target.scrollTo({
  left: 0,
  top: target.scrollHeight,
  behavior: 'smooth' 
}))

const displayError = error => {
  if (error) {
    let message
    if (Object.keys(Errors).includes(error)) {
      // TODO: fetch the right error message from the collection
      message = Errors[error]
    } else {
      console.warn('Undocumented error.')
      console.error(error)
      message = error.message || error.error || error.data ? error.data.message : error
    }
    console.warn(message)
    document.getElementById('error-message').innerText = message
    document.getElementById('error-warning.html').show()
  }
}

const catchGenericErrors = Client => new Promise((resolve, reject) => {
  try {
    Client.on(Client.EVENTS.ERROR, displayError)
    Client.on(Client.EVENTS.NETWORK_ERROR, displayError)
    resolve(Client)
  } catch (error) {
    reject(Errors.failedToAssignGenericErrorsHandler)
  }
})

const toggleProgressBar = currentPage => document.querySelector(`#${currentPage} > .page__content > .progress-bar`).classList.toggle('visible')

const showQRScanner = handler => e => {
  const app = document.getElementById('app')
  app.classList.toggle('scanning')
  window.QRScanner.scan(handler)
  window.QRScanner.show()
}

const hideQRScanner = (isAccountPage = false) => {
  const app = document.getElementById('app')
  if (app.classList.contains('scanning')) {
    window.QRScanner.hide()
    app.classList.toggle('scanning')
    if (isAccountPage) {
      document.getElementsByClassName('page__background')[0].style.opacity = 1
    }
  }
}
// eb_TODO: find out why it does not work when closing a scan on the account view
const validateScan = (error, value) => new Promise((resolve, reject) => {
  if (error) {
    if (error.code === 6) {
      reject(null)
    } else {
      reject(Errors.QRCodeScanningError)
    }
  } else {
    resolve(value)
  }
})

export {
  compileTemplate,
  compileAndRenderTemplate,
  scrollToBottomOnMutation,
  displayError,
  catchGenericErrors,
  toggleProgressBar,
  showQRScanner,
  hideQRScanner,
  validateScan
}
