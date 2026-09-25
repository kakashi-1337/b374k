const formatBusinessType = (value) => {
  switch (value) {
    case 'corporation': return 'Corporation'
    case 'sole_proprietorship_or_partnership': return 'Sole Proprietoryship or Partnership'
    case 'cooperative': return 'Cooperative'
    default: 'N/A'
  }
}

export default formatBusinessType
