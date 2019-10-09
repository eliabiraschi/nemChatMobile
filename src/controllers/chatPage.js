import messageTemplate from '../templates/message.html'
import {
  compileTemplate,
  compileAndRenderTemplate,
  scrollToBottomOnMutation,
  displayError,
  catchGenericErrors
} from '../tools'
import { helpers } from 'nemchat'

const isConnected = Chat => new Promise((resolve, reject) => {
  try {
    Chat.on(Chat.EVENTS.CONNECTED, () => resolve(Chat))
  } catch (error) {
    reject(Errors.cannotConnectToChat)
  }
})

const loadConversationTitle = Chat => new Promise((resolve, reject) => {
  try {
    const conversationTitle = document.getElementById('conversation-title')
    conversationTitle.innerText = Chat._.counterpart.address
    resolve(Chat)
  } catch (error) {
    reject(Errors.failedLodingConversationTitle)
  }
})

const loadMessages = Chat => new Promise((resolve, reject) => {
  Chat.getHistory()
    .then(messages => {
      const renderTemplate = compileTemplate(messageTemplate)
      const messagesElement = document.getElementById('messages')
      messagesElement.innerHTML = messages.map(message => {
        message.hasPayment = message.amount > 0
        message.amount = helpers.formatValue(message.amount)
        return renderTemplate(message)
      }).join('')
      resolve(Chat)
    })
    .catch(reject) // eb_TODO: this will be an undocumented error
})

const assignMessageHandlers = Chat => new Promise((resolve, reject) => {
  try {
    const renderTemplate = compileTemplate(messageTemplate)
    const messagesElement = document.getElementById('messages')
    const observer = new MutationObserver(scrollToBottomOnMutation(messagesElement))
    observer.observe(messagesElement, { childList: true })
    Chat.on(Chat.EVENTS.MESSAGE, message => {
      message.hasPayment = message.amount > 0
      messagesElement.innerHTML += renderTemplate(message)
    })
    Chat.on(Chat.EVENTS.MESSAGE_INCOMING, data => {
      ons.notification.toast({ message: 'message incoming', timeout: 2000 })
    })
    Chat.on(Chat.EVENTS.MESSAGE_SENDING, data => {
      ons.notification.toast({ message: 'sending message', timeout: 2000 })
    })
    resolve(Chat)
  } catch (error) {
    reject(Errors.failedToAssignonMessageHandlers)
  }
})

const addEventListeners = Chat => new Promise((resolve, reject) => {
  try {
    const outgoingMessage = document.getElementById('outgoing-message')
    const fee = document.getElementById('fee')
    const amount = document.getElementById('amount')
    const send = document.getElementById('send')
    const menu = document.getElementById('menu')
  
    outgoingMessage.addEventListener('keyup', e => {
      const isTooLong = helpers.getByteLen(outgoingMessage.value) > 512
      if (isTooLong) {
        displayError(Errors.messageIsTooLong)
      } else {
        const isLenZero = outgoingMessage.value.length === 0
        send.disabled = isLenZero || isTooLong
        fee.value = isLenZero ? '0.0' : Chat.getMessageFee(outgoingMessage.value, amount.value)
      }
    })

    send.addEventListener('click', e => {
      Chat.sendMessage(outgoingMessage.value, amount.value)
        .then(res => {
          if (res.code !== 1) displayError(res.message) // eb_TODO: fix the undocumented error
          outgoingMessage.value = ''
          amount.value = '0.0'
        })
        .catch(displayError) // eb_TODO: fix the undocumented error
    })
  
    menu.addEventListener('click', e => {
      document.getElementById('chatMenuPopover').show(e.target)
    })

    resolve(Chat)
  } catch (error) {
    reject(Errors.failedToAssignEventListeners)
  }
})

function chatPage(page) {
  isConnected(page.data.chat)
    .then(catchGenericErrors)
    .then(Chat => Promise.all([
      loadConversationTitle(Chat),
      loadMessages(Chat),
      assignMessageHandlers(Chat),
      addEventListeners(Chat)
    ]))
    .catch(displayError)
}

export default chatPage
