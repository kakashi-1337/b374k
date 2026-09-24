const formatIdType = (value) => {
  switch (value) {
    case 'passport': return 'Passport'
    case 'drivers_license': return 'Driver\'s License'
    case 'prc': return 'PRC'
    case 'nbi': return 'NBI Clearance'
    case 'police_clearance': return 'Police Clearance'
    case 'postal': return 'Postal'
    case 'gsis': return 'GSIS'
    case 'sss': return 'SSS'
    case 'umid': return 'UMID'
    case 'senior': return 'Senior Citizen'
    case 'owwa': return 'OWWA OFW e-Card'
    case 'ofw': return 'OWF e-Card'
    case 'seaman': return 'Seafarer\'s Identity Document'
    case 'acr': return 'ACR I-Card'
    case 'voter': return 'Voter'
    case 'pagibig': return 'PAG-IBIG'
    case 'pwd': return 'PWD'
    case 'dswd': return 'DSWD'
    case 'ibp': return 'IBP'
    case 'student': return 'Student'
    case 'company': return 'Company'
    case 'philsys': return 'National ID (Philsys)'
    default: value
  }
}

export default formatIdType
