const updateCurrencyInput = (val, setAmount) => {
  val = val
    .replace(/[^\d.]+/g, '') // strip out everything that isn't a digit or dot
    .replace(/[.](?=.*[.])/g, '') // strip out all dots except the last one

  const num = Number(val)
  const endsInDot = val[val.length - 1] === '.'
  const hasOnlyOneDot = (val.match(/[.]/g) || []).length === 1
  if (val === '') {
    setAmount('')
  } else if (!isNaN(num) || (endsInDot && hasOnlyOneDot)) {
    setAmount(val)
  } else {
    setAmount('')
  }
}

export default updateCurrencyInput
