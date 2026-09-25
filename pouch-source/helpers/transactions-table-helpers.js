import formatBalance from './format-balance'

const getSender = (tx, username, hideUsername = false) => {
  const { transactionType, senderName, accountNumber, bankName } = tx
  if (hideUsername && senderName === username) {
    return ''
  } else if (transactionType === 'Isle Wallet') {
    return senderName ? `@${senderName}` : ''
  } else if (transactionType === 'Bank Transfer') {
    if (senderName === username) {
      return senderName ? `@${senderName}` : ''
    }
    return `${senderName} \n ${accountNumber} \n ${bankName}`
  }
  return senderName
}

const getRecipient = (tx, username, hideUsername = false) => {
  const { transactionType, recipientName, accountNumber, bankName } = tx
  if (hideUsername && recipientName === username) {
    return ''
  } else if (transactionType === 'Isle Wallet') {
    return recipientName ? `@${recipientName}` : ''
  } else if (transactionType === 'Bank Transfer') {
    if (recipientName === username) {
      return recipientName ? `@${recipientName}` : ''
    }
    return `${recipientName} \n ${accountNumber} \n ${bankName}`
  }
  return recipientName
}

const getTotal = (tx, username, currency) => {
  const amount = tx.totalValue || tx.amountValue
  const isOutgoingTx = tx.senderName === username
  let formattedAmount = ''
  if (tx.status === 'completed') {
    formattedAmount = isOutgoingTx ? '- ' : '+ '
  }
  formattedAmount += formatBalance(amount, currency)
  return formattedAmount
}

const getAmount = (tx, username, currency) => {
  const isOutgoingTx = tx.senderName === username
  let formattedAmount = ''
  if (tx.status === 'completed') {
    formattedAmount = isOutgoingTx ? '- ' : '+ '
  }
  formattedAmount += formatBalance(tx.amountValue, currency)
  return formattedAmount
}

const getFee = (tx, currency) => {
  return tx.feeValue ? `-${formatBalance(tx.feeValue, currency)}` : null
}

export {
  getSender,
  getRecipient,
  getTotal,
  getAmount,
  getFee
}
