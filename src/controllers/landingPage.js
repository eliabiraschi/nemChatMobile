/* global document, window */

import { accountFactory } from 'nemchat'
import Errors from '../Errors'
import {
  displayError,
  toggleProgressBar,
  showQRScanner,
  hideQRScanner,
  validateScan
} from '../tools'

const validatePassphrase = value => new Promise((resolve, reject) => {
  // eb_TODO: change the length to be 40!
  if (value.length >= 1) {
    resolve(value)
  } else {
    reject(Errors.invalidPassphrase)
  }
})

const login = (error, passphrase) => {
  toggleProgressBar('landingPage')
  hideQRScanner()
  validateScan(error, passphrase)
    .then(validatePassphrase)
    .then(accountFactory)
    .then(account => {
      account.passphrase = passphrase
      window._.account = account
      document.querySelector('#navigator').pushPage('views/accountPage.html')
    })
    .catch(displayError)
    .then(() => toggleProgressBar('landingPage'))
}

function landingPage(page) {
  page
    .querySelector('#access')
    .addEventListener('click', e => {
      login(null, document.getElementById('passphrase').value)
    })
  page
    .querySelector('#scan')
    .addEventListener('click', showQRScanner(login))
}

export default landingPage
