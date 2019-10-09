/* global document, window */
import QRCode from 'qrcode'
import transactionsTemplate from '../templates/transaction.html'
import accountTemplate from '../templates/account.html'
import {
  compileTemplate,
  compileAndRenderTemplate,
  scrollToBottomOnMutation,
  displayError,
  toggleProgressBar,
  catchGenericErrors,
  showQRScanner,
  hideQRScanner,
  validateScan
} from '../tools'
import Errors from '../Errors'
import { chatFactory, accountFactory, helpers, Account } from 'nemchat'

const launchChat = (error, value) => {
  toggleProgressBar('accountPage')
  hideQRScanner(true)
  validateScan(error, value)
    .then(address => chatFactory(window._.account.passphrase, address))
    .then(chat => {
      document.querySelector('#navigator').pushPage('views/chatPage.html', { data: { chat }})
    })
    .catch(displayError)
    .then(() => toggleProgressBar('accountPage')) 
}

const assignHandlers = () => new Promise((resolve, reject) => {
  try {
    document
      .getElementById('accountPageMenu')
      .addEventListener('click', e => document.getElementById('accountPageMenuPopover').show(e.target))
    
    document
      .getElementById('create-from-text')
      .addEventListener('click', e => {
        ons.notification.prompt({ message: 'Recipient address:' })
          .then(text => launchChat(null, text))
          .catch(error => displayError(Errors.promptError))
      })
    
    document
      .getElementById('create-from-qr')
      .addEventListener('click', showQRScanner(launchChat))
    
    document
      .getElementById('logout')
      .addEventListener('click', e => {
        document.getElementById('accountPageMenuPopover').hide()
        window._.account.closeConnetion()
        window._.account.destroy()
        document.querySelector('#navigator').resetToPage('views/landingPage.html')
      })
    
    Array.from(document.getElementsByClassName('topup-button'))
      .forEach(button => {
        button.addEventListener('click', e => {
          window.open('https://nem.io/investors/getting-started-on-nem/', '_blank', 'location=yes');
        })
      })

    resolve(true)
  } catch (error) {
    reject(Errors.failedToAssignHandlers)
  }
})

const displayAccountData = ({accountData, Account}) => new Promise((resolve, reject) => {
  try {
    accountData.needsTopUp = accountData.balance < 1000
    accountData.needsActivation = !accountData.publicKey
    accountData.balance = helpers.formatValue(accountData.balance)
    document.getElementById('account').innerHTML = compileAndRenderTemplate(accountTemplate, accountData)
    resolve({accountData, Account})
  } catch(error) {
    reject(Errors.failedDisplayingAccountData)
  }
})

const setupQRCode = ({accountData, Account}) => new Promise((resolve, reject) => {
  try {
    const QRCodeCanvas = document.getElementById('qr-code-canvas')
    const QRCodeMask = document.getElementById('qr-code-mask')

    QRCode.toCanvas(QRCodeCanvas, accountData.address, { errorCorrectionLevel: 'H' }, error => {
      if (error) {
        reject(Errors.QRCodeGenrationFailed)
      }
    })

    QRCodeMask.addEventListener('click', e => {
      QRCodeMask.classList.toggle('sharing')
      document.getElementById('speed-dial').toggle('sharing')
    })

    resolve(Account)
  } catch (error) {
    reject(Errors.QRCodeSetupFailed)
  }
})

const displayPaymentsData = payments => new Promise((resolve, reject) => {
  try {
    const transactions = document.getElementById('transactions')
    const observer = new MutationObserver(scrollToBottomOnMutation(transactions.parentElement))
    observer.observe(transactions, { childList: true })  
    const renderTemplate = compileTemplate(transactionsTemplate)
    transactions.innerHTML = payments.map(payment => {
      payment.amount = helpers.formatValue(payment.amount)
      payment.fee = helpers.formatValue(payment.fee)
      return renderTemplate(payment)
    }).join('')
    resolve(payments)
  } catch (error) {
    reject(Errors.failedPaymentsDataDisplay)
  }
})

const assignPaymentOnClickHandlers = payments => new Promise((resolve, reject) => {
  try {
    Array.from(document.getElementsByClassName('open-chat')).forEach(element => {
      element.addEventListener('click', e => {
        const signer = element.getAttribute('data-signer')
        const address = signer ? helpers.getAddress(signer) : element.getAttribute('data-address')
        launchChat(null, address)
      })
    })
    resolve(payments)
  } catch (error) {
    reject(Errors.failedToAssignHandlersToPayments)
  }
})

const isConnected = Account => new Promise((resolve, reject) => {
  try {
    if (window._.account.isConnected) {
      resolve(Account)
    } else {
      Account.on(Account.EVENTS.CONNECTED, () => {
        ons.notification.toast({ message: 'Connected to the blockchain', timeout: 1500 })
        resolve(Account)
      })
    }
  } catch (error) {
    reject(Errors.failedToConnectToTheAccount)
  }
})

const getAccountData = Account => new Promise(async (resolve, reject) => {
  try {
    const { account } = await Account.getAccountInfo()
    resolve({accountData: account, Account})
  } catch (error) {
    reject(error) // eb_TODO: undocumented error
  }
})

function accountPage(page) {
  isConnected(window._.account)
    .then(catchGenericErrors)
    .then(Account => Promise.all([
        getAccountData(Account)
          .then(displayAccountData)
          .then(setupQRCode),
        Account.getPayments()
        .then(displayPaymentsData)
        .then(assignPaymentOnClickHandlers)
      ]))
    .then((/*data*/) => assignHandlers())
    .catch(displayError)
}

export default accountPage
