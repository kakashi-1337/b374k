const retakeFields = [
  {
    label: 'First Name',
    value: 'firstName',
    disabled: (_user) => false
  },
  {
    label: 'Middle Name',
    value: 'middleName',
    disabled: (_user) => false
  },
  {
    label: 'Last Name',
    value: 'lastName',
    disabled: (_user) => false
  },
  {
    label: 'Suffix',
    value: 'suffix',
    disabled: (_user) => false
  },
  {
    label: 'Name',
    value: 'name',
    disabled: (user) => !user.businessMetadata.isBusiness
  },
  {
    label: 'Date of birth',
    value: 'personalInformation?.dateOfBirth',
    disabled: (_user) => false
  },
  {
    label: 'Country of birth',
    value: 'personalInformation?.countryOfBirth',
    disabled: (_user) => false
  },
  {
    label: 'City of birth',
    value: 'personalInformation?.countryOfBirthCity',
    disabled: (_user) => false
  },
  {
    label: 'Gender',
    value: 'personalInformation?.gender',
    disabled: (_user) => false
  },
  {
    label: 'Citizenship',
    value: 'personalInformation?.citizenship',
    disabled: (_user) => false
  },
  {
    label: 'Other citizenship',
    value: 'personalInformation?.otherCitizenship',
    disabled: (_user) => false
  },
  {
    label: 'Current Address Country',
    value: 'personalInformation?.currentAddress.country',
    disabled: (_user) => false
  },  
  {
    label: 'Current Address State',
    value: 'personalInformation?.currentAddress.state',
    disabled: (_user) => false
  },
  {
    label: 'Current Address City',
    value: 'personalInformation?.currentAddress.city',
    disabled: (_user) => false
  },
  {
    label: 'Current Address Line 1',
    value: 'personalInformation?.currentAddress.line1',
    disabled: (_user) => false
  },
  {
    label: 'Current Address Post Code',
    value: 'personalInformation?.currentAddress.postCode',
    disabled: (_user) => false
  },  
  {
    label: 'Source of Funds',
    value: 'personalInformation?.sourceOfFunds.type',
    disabled: (_user) => false
  },
  {
    label: 'Is Politically Exposed Person',
    value: 'personalInformation?.isPEP',
    disabled: (_user) => false
  },
  {
    label: 'Front Image',
    value: 'identityDocument.frontImage',
    disabled: (_user) => false
  },
  {
    label: 'Signature Image',
    value: 'identityDocument.signatureImage',
    disabled: (_user) => false
  },
  {
    label: 'Selfie Image',
    value: 'identityDocument.selfieImage',
    disabled: (_user) => false
  },
  {
    label: 'Trade Name',
    value: 'businessInformation?.tradeName',
    disabled: (user) => !user.businessMetadata.isBusiness
  },
  {
    label: 'Founded Date',
    value: 'businessInformation?.foundedDate',
    disabled: (user) => !user.businessMetadata.isBusiness
  },
  {
    label: 'DTI Registration Image',
    value: 'businessInformation?.dtiRegistrationImage',
    disabled: (user) =>
      !(
        user.businessMetadata.isBusiness &&
        user.businessInformation?.type ===
          'sole_proprietorship_or_partnership' &&
        user.businessInformation?.incorporationCountry === 'PH'
      )
  },
  {
    label: 'SEC Registration Image',
    value: 'businessInformation?.secRegistrationImage',
    disabled: (user) =>
      !(
        user.businessMetadata.isBusiness &&
        user.businessInformation?.type === 'corporation' &&
        user.businessInformation?.incorporationCountry === 'PH'
      )
  },
  {
    label: 'CDA Registration Image',
    value: 'businessInformation?.cdaRegistrationImage',
    disabled: (user) =>
      !(
        user.businessMetadata.isBusiness &&
        user.businessInformation?.type === 'cooperative'
      )
  },
  {
    label: 'Mayor\'s Permit Image',
    value: 'businessInformation?.mayorsPermitImage',
    disabled: (user) => 
      !(
        user.businessMetadata.isBusiness &&
        user.businessInformation?.type === 'sole_proprietorship_or_partnership' &&
        user.businessInformation?.incorporationCountry === 'PH'
      )
  },
  {
    label: 'Income Tax Return (ITR) PDF',
    value: 'businessInformation?.incomeTaxReturnPdf',
    disabled: (user) => 
      !(
        user.businessMetadata.isBusiness &&
        user.businessInformation?.type === 'sole_proprietorship_or_partnership' &&
        user.businessInformation?.incorporationCountry === 'PH'
      )
  },
  {
    label: 'Value-Added Tax (VAT) Certificate Image',
    value: 'businessInformation?.vatCertificateImage',
    disabled: (user) => 
      !(
        user.businessMetadata.isBusiness &&
        user.businessInformation?.type === 'sole_proprietorship_or_partnership' &&
        user.businessInformation?.incorporationCountry === 'PH'
      )
  },
  {
    label: 'Bank Statement PDF',
    value: 'businessInformation?.bankStatementPdf',
    disabled: (user) => 
      !(
        user.businessMetadata.isBusiness &&
        user.businessInformation?.type === 'sole_proprietorship_or_partnership' &&
        user.businessInformation?.incorporationCountry === 'PH'
      )
  },  
  {
    label: 'Community Tax Certificate (CTC) Image',
    value: 'businessInformation?.communityTaxCertificateImage',
    disabled: (user) => 
      !(
        user.businessMetadata.isBusiness &&
        user.businessInformation?.type === 'sole_proprietorship_or_partnership' &&
        user.businessInformation?.incorporationCountry === 'PH'
      )
  },
  {
    label: 'Articles of Incorporation PDF',
    value: 'businessInformation?.articlesOfIncorporationPdf',
    disabled: (user) => {
      if (!user.businessMetadata.isBusiness) {
        return true
      }

      if (['corporation'].includes(user.businessInformation?.type)) {
        return false
      }

      return true
    }
  },
  {
    label: 'Secretary Certificate PDF',
    value: 'businessInformation?.secretarysCertificatePdf',
    disabled: (user) => {
      if (!user.businessMetadata.isBusiness) {
        return true
      }

      if (['cooperative', 'corporation'].includes(user.businessInformation?.type)) {
        return false
      }

      return true
    }
  },
  {
    label: 'Board Resolution PDF',
    value: 'businessInformation?.boardResolutionPdf',
    disabled: (user) => {
      if (!user.businessMetadata.isBusiness) {
        return true
      }

      if (['cooperative', 'corporation'].includes(user.businessInformation?.type)) {
        return false
      }

      return true
    },
  },
  {
    label: 'By-Laws PDF',
    value: 'businessInformation?.byLawsPdf',
    disabled: (user) =>
      !user.businessMetadata.isBusiness ||
      user.businessInformation?.type !== 'cooperative'
  },
  {
    label: 'General Information Sheet PDF',
    value: 'businessInformation?.generalInformationSheetPdf',
    disabled: (user) => {
      if (!user.businessMetadata.isBusiness) {
        return true
      }

      if (['corporation'].includes(user.businessInformation?.type)) {
        return false
      }

      return true
    }
  },
  {
    label: 'Business Proof of Address Image',
    value: 'businessInformation?.proofOfAddressImage',
    disabled: (user) => !user.businessMetadata.isBusiness
  },
  {
    label: 'Business Address Country',
    value: 'businessInformation?.currentAddress.country',
    disabled: (user) => !user.businessMetadata.isBusiness
  },  
  {
    label: 'Business Address State',
    value: 'businessInformation?.currentAddress.state',
    disabled: (user) => !user.businessMetadata.isBusiness
  },
  {
    label: 'Business Address City',
    value: 'businessInformation?.currentAddress.city',
    disabled: (user) => !user.businessMetadata.isBusiness
  },
  {
    label: 'Business Address Line1',
    value: 'businessInformation?.currentAddress.line1',
    disabled: (user) => !user.businessMetadata.isBusiness
  },
  {
    label: 'Business Address Post Code',
    value: 'businessInformation?.currentAddress.postCode',
    disabled: (user) => !user.businessMetadata.isBusiness
  },
  {
    label: 'Business Address Ownership',
    value: 'businessInformation?.currentAddress.ownership',
    disabled: (user) => !user.businessMetadata.isBusiness
  },
  {
    label: 'Business Source of Funds',
    value: 'businessInformation?.sourceOfFunds.type',
    disabled: (user) => !user.businessMetadata.isBusiness
  },
  {
    label: 'Business Annual Income',
    value: 'businessInformation?.annualIncome',
    disabled: (user) => !user.businessMetadata.isBusiness
  },
  {
    label: 'Business Total Assets',
    value: 'businessInformation?.totalAssets',
    disabled: (user) => !user.businessMetadata.isBusiness
  }
]

export default retakeFields
