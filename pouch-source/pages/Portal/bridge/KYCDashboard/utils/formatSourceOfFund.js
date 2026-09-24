const formatSourceOfFund = (value) => {
  switch (value) {
    case 'salary': return 'Salary'
    case 'pension': return 'Pension'
    case 'allowance': return 'Allowance'
    case 'investments': return 'Investments'
    case 'business': return 'Business'
    case 'gambling': return 'Gambling'
    case 'rental_income': return 'Rental Income'
    case 'royalties_franchising_fees': return 'Royalties Franchising Fees'
    case 'loans_and_financing': return 'Loans and Financing'
    case 'commissions': return 'Commissions'
    case 'sales_of_goods_and_services': return 'Sales of Goods and Services'
    case 'cryptocurrencdy': return 'Cryptocurrency'
    default: value
  }
}

export default formatSourceOfFund
