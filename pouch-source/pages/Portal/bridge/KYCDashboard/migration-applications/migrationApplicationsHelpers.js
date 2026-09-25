import axios from 'axios'

export const getUserDocumentImageUrls = async (user) => {
  const imageKeys = [
    {
      label: 'Front Image',
      key: user.identityDocument.frontImage
    },
    {
      label: 'Selfie Image',
      key: user.identityDocument.selfieImage
    },
    {
      label: 'Signature Image',
      key: user.identityDocument.signatureImage
    }
  ]
  if (user.businessMetadata.isBusiness) {
    imageKeys.push(
      {
        label: 'Proof of Address Image',
        key: user.businessInformation?.proofOfAddressImage ?? ''
      },
      {
        label: 'SEC Registration Image',
        key: user.businessInformation?.secRegistrationImage ?? ''
      },
      {
        label: 'DTI Registration Image',
        key: user.businessInformation?.dtiRegistrationImage ?? ''
      },
      {
        label: 'CDA Registration Image',
        key: user.businessInformation?.cdaRegistrationImage ?? ''
      },
      {
        label: 'Mayor\'s Permit Image',
        key: user.businessInformation?.mayorsPermitImage ?? ''
      },
      {
        label: 'Income Tax Return (ITR) PDF',
        key: user.businessInformation?.incomeTaxReturnPdf ?? ''
      },
      {
        label: 'Value-Added Tax (VAT) Certificate Image',
        key: user.businessInformation?.vatCertificateImage ?? ''
      },
      {
        label: 'Bank Statement PDF',
        key: user.businessInformation?.bankStatementPdf ?? ''
      },      
      {
        label: 'Community Tax Certificate (CTC) Image',
        key: user.businessInformation?.communityTaxCertificateImage ?? ''
      },
      {
        label: 'Articles of Incorporation PDF',
        key: user.businessInformation?.articlesOfIncorporationPdf ?? ''
      },
      {
        label: 'Secretary Certificate PDF',
        key: user.businessInformation?.secretarysCertificatePdf ?? ''
      },
      {
        label: 'Board Resolution PDF',
        key: user.businessInformation?.boardResolutionPdf ?? ''
      },
      {
        label: 'By-Laws PDF',
        key: user.businessInformation?.byLawsPdf ?? ''
      },
      {
        label: 'General Information Sheet PDF',
        key: user.businessInformation?.generalInformationSheetPdf ?? ''
      }
    )
  }
  try {
    const imageList = imageKeys.map(async (item) => {
      if (!item.key) {
        return {
          label: item.label,
          url: ''
        }
      }
      const { data } = await axios.get(
        `/api/v3/bridge/users/${user.id}/files?key=${item.key}`
      )
      return {
        label: item.label,
        url: data.data.url
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
  const riskScore = prompt("Are you sure you want to upgrade this user?\nPlease put risk score.");

  if (!/^\d+$/.test(riskScore) || !riskScore) {
    alert("Risk score is neither empty or invalid (not a number)");
    return;
  }

  try {
    await axios.put(`/api/v3/bridge/users/${user.id}/update`, {
      action: 'upgrade',
      riskScore
    })
  } catch (error) {
    console.error(error)
    alert('Something went wrong upgrading the user')
  }
}

export const onAcceptUser = async (user) => {
  const riskScore = prompt("Are you sure you want to upgrade this user?\nPlease put risk score.");

  if (!/^\d+$/.test(riskScore) || !riskScore) {
    alert("Risk score is neither empty or invalid (not a number)");
    return;
  }

  try {
    await axios.put(`/api/v3/bridge/users/${user.id}/update`, {
      action: 'accept',
      riskScore
    })
  } catch (error) {
    console.error(error)
    alert('Something went wrong upgrading the user')
  }
}

export const onRetakeUser = async (user, fields, retakeNote) => {
  try {
    console.log('user', user)
    await axios.put(`/api/v3/bridge/users/${user.id}/update`, {
      action: 'retake',
      fields,
      retakeNote
    })
  } catch (error) {
    console.error(error)
  }
}

export const getActions = (activeTab) => {
  if (activeTab === 'FOR_MIGRATION') {
    return [
      { label: 'Actions', value: 'action', disabled: true },
      { label: 'View Details', value: 'view' },
      { label: 'View Transactions', value: 'view_transactions' },
      { label: 'Accept', value: 'accept' },
      { label: 'Retake', value: 'retake' }
    ]
  } else if (activeTab === 'FOR_MIGRATION_ACCEPTED') {
    return [
      { label: 'Actions', value: 'action', disabled: true },
      { label: 'View Details', value: 'view' },
      { label: 'View Transactions', value: 'view_transactions' },
      { label: 'Upgrade', value: 'upgrade', disabled: true }
    ]
  } else if (activeTab === 'RETAKE_POUCH') {
    return [
      { label: 'Actions', value: 'action', disabled: true },
      { label: 'View Details', value: 'view' },
      { label: 'View Transactions', value: 'view_transactions' },
    ]
  }
}
