import commaNumber from 'comma-number'

export const toFixedFloored = (num = 0, places) => {
  const splitStr = num.toString().split('.')
  const beforeDecimalPoint = splitStr[0]
  const afterDecimalPoint = splitStr[1] || ''
  let decimalResult = ''
  for (let i = 0; i < places; i++) {
    decimalResult += afterDecimalPoint[i] || '0'
  }
  return places > 0
    ? beforeDecimalPoint + '.' + decimalResult
    : beforeDecimalPoint
}

export const getCurrencySymbol = (currency) => {
  if (currency === 'PHP') return '₱'
  if (['CAD', 'USD'].includes(currency)) return '$'
  return ''
}

const formatBalance = (amount, currency) => {
  if (currency === 'BTC') return commaNumber(toFixedFloored(Number(amount), 0)) + ' SAT'
  if (currency === 'PHP') return '₱' + commaNumber(toFixedFloored(Number(amount), 2))
  if (['CAD', 'USD'].includes(currency)) return '$' + commaNumber(toFixedFloored(Number(amount), 2))
  return 'invalid currency'
}

export default formatBalance
