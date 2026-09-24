const formatAddress = (address) => {
  return ['line1', 'city', 'state', 'country', 'postCode']
    .map((field) => address[field])
    .filter(Boolean)
    .join(', ')
}

export default formatAddress
