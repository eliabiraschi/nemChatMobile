/* global document */

import style from './index.less'
import accountPage from './controllers/accountPage'
import landingPage from './controllers/landingPage'
import chatPage from './controllers/chatPage'

const controllers = {
  accountPage,
  landingPage,
  chatPage
}

window._ = {}

const hideDialog = e => document.getElementById(e.target.getAttribute('data-dialog-id')).hide()

window.addEventListener('load', e => {
  document.getElementById('app').style.height = window.innerHeight + 'px'
  Array
    .from(document.getElementsByClassName('hide-dialog'))
    .forEach(element => element.addEventListener('click', hideDialog))
})

document.addEventListener('init', event => {
  document.getElementById('close-scanner').addEventListener('click', e => {
    window.QRScanner.destroy()
    document.getElementById('app').classList = ''
  })
  const page = event.target
  if (Object.keys(controllers).includes(page.id)) {
    controllers[page.id](page)
  } else {
    console.warn(`missing controller for ${page.id}, skipping`)
  }
})

document.addEventListener('deviceready', e => {
  window.open = cordova.InAppBrowser.open
})
