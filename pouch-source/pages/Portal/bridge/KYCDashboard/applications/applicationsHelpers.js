import axios from 'axios'

export const getUserDocumentImageUrls = async (user) => {
  const imageKeys = [
    {
      label: 'Front Image',
      field: 'identityDocument.frontImage',
      key: user.identityDocument?.frontImage ?? '',
    },
    {
      label: 'Selfie Image',
      field: 'identityDocument.selfieImage',
      key: user.identityDocument?.selfieImage ?? '',
    },
    {
      label: 'Signature Image',
      field: 'identityDocument.signatureImage',
      key: user.identityDocument?.signatureImage ?? '',
    },
  ]
  if (user.businessMetadata.isBusiness) {
    imageKeys.push(
      {
        label: 'Proof of Address Image',
        field: 'businessInformation.proofOfAddressImage',
        key: user.businessInformation?.proofOfAddressImage ?? '',
      },
      {
        label: 'SEC Registration Image',
        field: 'businessInformation.secRegistrationImage',
        key: user.businessInformation?.secRegistrationImage ?? '',
      },
      {
        label: 'DTI Registration Image',
        field: 'businessInformation.dtiRegistrationImage',
        key: user.businessInformation?.dtiRegistrationImage ?? '',
      },
      {
        label: 'CDA Registration Image',
        field: 'businessInformation.cdaRegistrationImage',
        key: user.businessInformation?.cdaRegistrationImage ?? '',
      },
      {
        label: "Mayor's Permit Image",
        field: 'businessInformation.mayorsPermitImage',
        key: user.businessInformation?.mayorsPermitImage ?? '',
      },
      {
        label: 'Income Tax Return (ITR) PDF',
        field: 'businessInformation.incomeTaxReturnPdf',
        key: user.businessInformation?.incomeTaxReturnPdf ?? '',
      },
      {
        label: 'Value-Added Tax (VAT) Certificate Image',
        field: 'businessInformation.vatCertificateImage',
        key: user.businessInformation?.vatCertificateImage ?? '',
      },
      {
        label: 'Bank Statement PDF',
        field: 'businessInformation.bankStatementPdf',
        key: user.businessInformation?.bankStatementPdf ?? '',
      },
      {
        label: 'Community Tax Certificate (CTC) Image',
        field: 'businessInformation.communityTaxCertificateImage',
        key: user.businessInformation?.communityTaxCertificateImage ?? '',
      },
      {
        label: 'Articles of Incorporation PDF',
        field: 'businessInformation.articlesOfIncorporationPdf',
        key: user.businessInformation?.articlesOfIncorporationPdf ?? '',
      },
      {
        label: 'Secretary Certificate PDF',
        field: 'businessInformation.secretarysCertificatePdf',
        key: user.businessInformation?.secretarysCertificatePdf ?? '',
      },
      {
        label: 'Board Resolution PDF',
        field: 'businessInformation.boardResolutionPdf',
        key: user.businessInformation?.boardResolutionPdf ?? '',
      },
      {
        label: 'By-Laws PDF',
        field: 'businessInformation.byLawsPdf',
        key: user.businessInformation?.byLawsPdf ?? '',
      },
      {
        label: 'General Information Sheet PDF',
        field: 'businessInformation.generalInformationSheetPdf',
        key: user.businessInformation?.generalInformationSheetPdf ?? '',
      },
    )
  }
  try {
    const imageList = imageKeys.map(async (item) => {
      if (!item.key) {
        return {
          label: item.label,
          field: item.field,
          url: '',
        }
      }
      const { data } = await axios.get(
        `/api/v3/bridge/users/${user.id}/files?key=${item.key}`,
      )
      return {
        label: item.label,
        field: item.field,
        url: data.data.url,
      }
    })
    const urls = await Promise.all(imageList)
    console.log(urls)
    return urls
  } catch (err) {
    console.log('err.response', err.response)
    return []
  }
}

export const onViewTransactions = (username) => {
  window.open(`${
    process.env.REACT_APP_POUCH_WEB_URL || 'http://localhost:5173'
  }/bridge/transactions/${username}`, '_blank').focus()
}

export const onUpgradeUser = async (user) => {
  const riskScore = prompt(
    'Are you sure you want to upgrade this user?\nPlease put risk score.',
  )

  if (!/^\d+$/.test(riskScore) || !riskScore) {
    alert('Risk score is neither empty or invalid (not a number)')
    return
  }

  try {
    await axios.put(`/api/v3/bridge/users/${user.id}/update`, {
      action: 'upgrade',
      riskScore,
    })
  } catch (error) {
    console.error(error)
    alert('Something went wrong upgrading the user')
  }
}

export const onDeleteUser = async (user) => {
  if (
    window.confirm(
      'Are you sure? A user may be deleted if they have no balance, and are not already approved',
    )
  ) {
    try {
      await axios.put('/api/v0/bridge/user/manual-review', {
        username: user.username,
        action: 'delete',
      })
    } catch (error) {
      alert('Something went wrong deleting user')
      console.error(error)
    }
  }
}

export const onBanUser = async (user, isBan) => {
  if (window.confirm('Are you sure you want to ban this user?')) {
    try {
      await axios.put('/api/v0/bridge/user/ban', {
        username: user.username,
        ban: isBan,
      })
    } catch (error) {
      alert('Something went wrong banning user')
      console.error(error)
    }
  }
}

export const onRetakeUser = async (user, fields, retakeNote) => {
  try {
    console.log('user', user)
    await axios.put(`/api/v3/bridge/users/${user.id}/update`, {
      action: 'retake',
      fields,
      retakeNote,
    })
  } catch (error) {
    console.error(error)
  }
}

export const getActions = (activeTab) => {
  if (activeTab === 'FOR_REVIEW') {
    return [
      { label: 'Actions', value: 'action', disabled: true },
      { label: 'View Details', value: 'view' },
      { label: 'View Transactions', value: 'view_transactions' },
      { label: 'Upgrade', value: 'upgrade' },
      { label: 'Retake', value: 'retake' },
      { label: 'Edit', value: 'edit' },
      { label: 'Ban', value: 'ban' },
      { label: 'Delete', value: 'delete' },
    ]
  } else if (activeTab === 'PENDING') {
    return [
      { label: 'Actions', value: 'action', disabled: true },
      { label: 'View Details', value: 'view' },
      { label: 'View Transactions', value: 'view_transactions' },
    ]
  } else if (activeTab === 'RETAKE_NETBANK') {
    return [
      { label: 'Actions', value: 'action', disabled: true },
      { label: 'View Details', value: 'view' },
      { label: 'View Transactions', value: 'view_transactions' },
      { label: 'Retake', value: 'retake' },
    ]
  } else if (activeTab === 'RETAKE_POUCH') {
    return [
      { label: 'Actions', value: 'action', disabled: true },
      { label: 'View Details', value: 'view' },
      { label: 'View Transactions', value: 'view_transactions' },
    ]
  } else if (activeTab === 'FAILED') {
    return [
      { label: 'Actions', value: 'action', disabled: true },
      { label: 'View Details', value: 'view' },
      { label: 'View Transactions', value: 'view_transactions' },
    ]
  } else if (activeTab === 'COMPLETED') {
    return [
      { label: 'Actions', value: 'action', disabled: true },
      { label: 'View Details', value: 'view' },
      { label: 'View Transactions', value: 'view_transactions' },
      { label: 'Edit', value: 'edit' },
      { label: 'Ban', value: 'ban' },
      { label: 'Delete', value: 'delete' },
    ]
  }
}
