import {
  Box,
  Grid,
  ScrollArea,
  Skeleton,
  Text,
  createStyles,
} from '@mantine/core'
import React, { useEffect, useState } from 'react'
import formatAddress from '../utils/formatAddress'
import formatUserInfoValue from '../utils/formatUserInfoValue'
import formatBusinessType from '../utils/formatBusinessType'
import formatNumberWithCommas from '../utils/formatNumberWithCommas'
import formatSourceOfFund from '../utils/formatSourceOfFund'
import formatIdType from '../utils/formatIdType'
import { getUserDocumentImageUrls } from './migrationApplicationsHelpers'
import { IconFile } from '@tabler/icons'
import { useBalances, useUserContext } from 'hooks'

const ReviewUserInfoModal = ({ user }) => {
  const { user: loggedInUser } = useUserContext()
  const { classes } = useStyles()
  const [documentImages, setDocumentImages] = useState([])
  const [loading, setLoading] = useState(true)
  const { balances, fetchBalances, loading: balancesLoading } = useBalances()

  const isAdmin = loggedInUser.role === 'admin'

  useEffect(() => {
    fetchBalances(user.username)
  }, [])

  const accountAndPersonalInformation = [
    { label: 'Username', value: user.username },
    { label: 'First Name', value: user.firstName },
    { label: 'Middle Name', value: user.middleName },
    { label: 'Last Name', value: user.lastName },
    { label: 'Suffix', value: user.suffix },
    { label: 'Email', value: user.email },
    { label: 'Phone No.', value: user.phone },
    {
      label: 'Birthday',
      value:
        user.personalInformation && user.personalInformation?.dateOfBirth
          ? user.personalInformation?.dateOfBirth
          : '',
    },
    {
      label: 'Country of Birth',
      value:
        user.personalInformation && user.personalInformation?.countryOfBirth
          ? user.personalInformation?.countryOfBirth
          : '',
    },
    {
      label: 'City of Birth',
      value:
        user.personalInformation && user.personalInformation?.countryOfBirthCity
          ? user.personalInformation?.countryOfBirthCity
          : '',
    },
    {
      label: 'Gender',
      value:
        user.personalInformation && user.personalInformation?.gender
          ? user.personalInformation?.gender
          : '',
    },
    {
      label: 'Citizenship',
      value:
        user.personalInformation && user.personalInformation?.citizenship
          ? user.personalInformation?.citizenship
          : '',
    },
    {
      label: 'Other Citizenship',
      value:
        user.personalInformation && user.personalInformation?.otherCitizenship
          ? user.personalInformation?.otherCitizenship
          : '',
    },
    {
      label: 'Current Address',
      value:
        user.personalInformation && user.personalInformation?.currentAddress
          ? formatAddress(user.personalInformation?.currentAddress)
          : '',
    },
    {
      label: 'Is Politically exposed person?',
      value:
        user.personalInformation && user.personalInformation?.isPEP
          ? 'YES'
          : 'NO',
    },
    {
      label: 'Source of Funds',
      value:
        user.personalInformation && user.personalInformation?.sourceOfFunds
          ? formatSourceOfFund(user.personalInformation?.sourceOfFunds.type)
          : '--',
    },
  ]

  const bankInformation = [
    { label: 'Account ID', value: user?.bankDetails?.accountId },
    { label: 'Account CIF', value: user?.bankDetails?.accountCif },
    { label: 'Account Number', value: user?.bankDetails?.accountNumber },
    {
      label: 'Account Signatory ID',
      value: user?.bankDetails?.signatoryAccountId,
    },
    {
      label: 'Account Signatory CIF',
      value: user?.bankDetails?.signatoryAccountCif,
    },
  ]

  const identityInformation = [
    {
      label: 'Type',
      value: user.identityDocument
        ? formatIdType(user.identityDocument.type)
        : '',
    },
    {
      label: 'ID Number',
      value: user.identityDocument ? user.identityDocument.idNumber : '',
    },
    {
      label: 'Issuer',
      value: user.identityDocument ? user.identityDocument.issuer : '',
    },
    {
      label: 'Issuer Country',
      value: user.identityDocument ? user.identityDocument.issuerCountry : '',
    },
  ]

  const businessInformation = [
    {
      label: 'Name',
      value: user.name ? user.name : '--',
    },
    {
      label: 'Trade Name',
      value: user.businessInformation
        ? user.businessInformation?.tradeName
        : '--',
    },
    {
      label: 'Type',
      value: user.businessInformation
        ? formatBusinessType(user.businessInformation?.type)
        : '--',
    },
    {
      label: 'Current Address',
      value: user.businessInformation
        ? formatAddress(user.businessInformation?.currentAddress)
        : '--',
    },
    {
      label: 'Incorporation Country',
      value: user.businessInformation
        ? user.businessInformation?.incorporationCountry
        : '--',
    },
    {
      label: 'Founded Date',
      value: user.businessInformation
        ? user.businessInformation?.foundedDate
        : '--',
    },
    {
      label: 'Ultimate Beneficial Owner',
      value: user.businessInformation
        ? user.businessInformation?.ultimateBeneficialOwnerName
        : '--',
    },
    {
      label: 'Annual Income',
      value:
        user.businessMetadata.isBusiness &&
        user.businessInformation?.annualIncome
          ? 'PHP ' +
            formatNumberWithCommas(user.businessInformation?.annualIncome)
          : '--',
    },
    {
      label: 'Total Assets',
      value:
        user.businessMetadata.isBusiness &&
        user.businessInformation?.totalAssets
          ? 'PHP ' +
            formatNumberWithCommas(user.businessInformation?.totalAssets)
          : '--',
    },
    {
      label: 'Source of Funds',
      value: user.businessInformation
        ? formatSourceOfFund(user.businessInformation?.sourceOfFunds.type)
        : '--',
    },
    {
      label: 'SEC | DTI | CDA Registration Number',
      value: user.businessInformation
        ? user.businessInformation?.registrationNumber
        : '--',
    },
    {
      label: 'SEC | DTI | CDA Issuer',
      value: user.businessInformation ? user.businessInformation?.issuer : '--',
    },
    {
      label: 'SEC | DTI | CDA Issuer Country',
      value: user.businessInformation
        ? user.businessInformation?.issuerCountry
        : '--',
    },
    {
      label: "Mayor's Permit Issuer",
      value: user.businessInformation
        ? user.businessInformation?.mayorsPermitIssuer
        : '--',
    },
    {
      label: "Mayor's Permit Issuer Country",
      value: user.businessInformation
        ? user.businessInformation?.mayorsPermitIssuerCountry
        : '--',
    },
    {
      label: 'Income Tax Return (ITR) Issuer',
      value: user.businessInformation
        ? user.businessInformation?.incomeTaxReturnIssuer
        : '--',
    },
    {
      label: 'Income Tax Return (ITR) Issuer Country',
      value: user.businessInformation
        ? user.businessInformation?.incomeTaxReturnIssuerCountry
        : '--',
    },
    {
      label: 'Value-Added Tax (VAT) Certificate Issuer',
      value: user.businessInformation
        ? user.businessInformation?.vatCertificateIssuer
        : '--',
    },
    {
      label: 'Value-Added Tax (VAT) Certificate Issuer Country',
      value: user.businessInformation
        ? user.businessInformation?.vatCertificateIssuerCountry
        : '--',
    },
    {
      label: 'Bank Statement Issuer',
      value: user.businessInformation
        ? user.businessInformation?.bankStatementIssuer
        : '--',
    },
    {
      label: 'Bank Statement Issuer Country',
      value: user.businessInformation
        ? user.businessInformation?.bankStatementIssuerCountry
        : '--',
    },
    {
      label: 'Community Tax Certificate (CTC) Issuer',
      value: user.businessInformation
        ? user.businessInformation?.communityTaxCertificateIssuer
        : '--',
    },
    {
      label: 'Community Tax Certificate (CTC) Issuer Country',
      value: user.businessInformation
        ? user.businessInformation?.communityTaxCertificateIssuerCountry
        : '--',
    },
    {
      label: 'Articles of Incorporation Issuer',
      value: user.businessInformation
        ? user.businessInformation?.articlesOfIncorporationIssuer
        : '--',
    },
    {
      label: 'Articles of Incorporation Issuer Country',
      value: user.businessInformation
        ? user.businessInformation?.articlesOfIncorporationissuerCountry
        : '--',
    },
    {
      label: "Secretary's Certificate Issuer",
      value: user.businessInformation
        ? user.businessInformation?.secretarysCertificateIssuer
        : '--',
    },
    {
      label: "Secretary's Certificate Issuer Country",
      value: user.businessInformation
        ? user.businessInformation?.secretarysCertificateIssuerCountry
        : '--',
    },
    {
      label: 'Board Resolution Issuer',
      value: user.businessInformation
        ? user.businessInformation?.boardResolutionIssuer
        : '--',
    },
    {
      label: 'Board Resolution Issuer Country',
      value: user.businessInformation
        ? user.businessInformation?.boardResolutionIssuerCountry
        : '--',
    },
    {
      label: 'By-Laws Issuer',
      value: user.businessInformation
        ? user.businessInformation?.byLawsIssuer
        : '--',
    },
    {
      label: 'By-Laws Issuer Country',
      value: user.businessInformation
        ? user.businessInformation?.byLawsIssuerCountry
        : '--',
    },
    {
      label: 'General Information Sheet Issuer',
      value: user.businessInformation
        ? user.businessInformation?.generalInformarionSheetIssuer
        : '--',
    },
    {
      label: 'General Information Sheet Issuer Country',
      value: user.businessInformation
        ? user.businessInformation?.generalInformationSheetIssuerCountry
        : '--',
    },
  ]

  const riskAssessments = [
    { label: 'Risk Assessment', value: '' },
    { label: 'Is duplicate?', value: user.isDuplicate ? 'YES' : 'NO' },
    { label: 'Is found in banned?', value: user.banned ? 'YES' : 'NO' },
  ]

  useEffect(() => {
    const fetchUserDocumentImageUrls = async () => {
      try {
        const images = await getUserDocumentImageUrls(user)
        setDocumentImages(images)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserDocumentImageUrls(user)
  }, [])

  if (loading) {
    return (
      <Grid>
        <Grid.Col md={1} lg={6}>
          <Skeleton height="80vh" />
        </Grid.Col>
        <Grid.Col md={1} lg={6}>
          <Skeleton height="80vh" />
        </Grid.Col>
      </Grid>
    )
  }

  return (
    <>
      <Text className={classes.title}>{`Review @${user.username}`}</Text>
      <Grid gutter={100} gutterSm={20} gutterXs={20} gutterMd={20}>
        <Grid.Col lg={isAdmin ? 6 : 12} xl={isAdmin ? 5 : 12}>
          <ScrollArea type="auto" style={{ height: '70vh', paddingRight: 30 }}>
            <Box>
              <Box sx={() => classes.informationContainer}>
                <Text weight={700} size={16}>
                  Account and Personal Information
                </Text>
                <Box className={classes.detailsContainer}>
                  <Text className={classes.infoTitle}>Bitcoin Balance</Text>
                  <Text className={classes.infoValue}>
                    {balancesLoading ? 'Loading...' : balances?.btc || '--'}
                  </Text>
                </Box>
                <Box className={classes.detailsContainer}>
                  <Text className={classes.infoTitle}>Risk Score</Text>
                  <Text className={classes.infoValue}>
                    {user?.riskScore || '--'}
                  </Text>
                </Box>
                {accountAndPersonalInformation?.map((info) => {
                  return (
                    <Box key={info.label} className={classes.detailsContainer}>
                      <Text className={classes.infoTitle}>{info.label}</Text>
                      <Text className={classes.infoValue}>
                        {formatUserInfoValue(info.value)}
                      </Text>
                    </Box>
                  )
                })}
              </Box>

              <Box sx={() => classes.informationContainer}>
                <Text weight={700} size={16}>
                  Identity Information
                </Text>
                {identityInformation.map((info) => {
                  return (
                    <Box key={info.label} className={classes.detailsContainer}>
                      <Text className={classes.infoTitle}>{info.label}</Text>
                      <Text className={classes.infoValue}>
                        {formatUserInfoValue(info.value)}
                      </Text>
                    </Box>
                  )
                })}
              </Box>

              {user.businessMetadata.isBusiness && (
                <Box sx={() => classes.informationContainer}>
                  <Text weight={700} size={16}>
                    Business Information
                  </Text>
                  {businessInformation?.map((info) => {
                    return (
                      <Box
                        key={info.label}
                        className={classes.detailsContainer}
                      >
                        <Text className={classes.infoTitle}>{info.label}</Text>
                        <Text className={classes.infoValue}>
                          {formatUserInfoValue(info.value)}
                        </Text>
                      </Box>
                    )
                  })}
                </Box>
              )}

              <Box sx={() => classes.informationContainer}>
                <Text weight={700} size={16}>
                  Assessment
                </Text>
                {riskAssessments.map((info) => {
                  return (
                    <Box key={info.label} className={classes.detailsContainer}>
                      <Text className={classes.infoTitle}>{info.label}</Text>
                      <Text className={classes.infoValue}>
                        {formatUserInfoValue(info.value)}
                      </Text>
                    </Box>
                  )
                })}
              </Box>
              <Box sx={() => classes.informationContainer}>
                <Text weight={700} size={16}>
                  Bank Information
                </Text>
                {bankInformation.map((info) => {
                  return (
                    <Box key={info.label} className={classes.detailsContainer}>
                      <Text className={classes.infoTitle}>{info.label}</Text>
                      <Text className={classes.infoValue}>
                        {formatUserInfoValue(info.value)}
                      </Text>
                    </Box>
                  )
                })}
              </Box>
              <Box sx={() => classes.informationContainer}>
                <Text weight={700} size={16}>
                  Other
                </Text>
                <Box className={classes.detailsContainer}>
                  <Text className={classes.infoTitle}>Retake Note</Text>
                  <Text className={classes.infoValue}>
                    {user?.verified?.retakeNote || '--'}
                  </Text>
                </Box>
              </Box>
            </Box>
          </ScrollArea>
        </Grid.Col>
        {isAdmin ? (
          <Grid.Col md={1} lg={7}>
            <ScrollArea type="auto" style={{ height: '70vh' }}>
              {documentImages.length ? (
                documentImages.map((item) => {
                  return (
                    <Box mb={20} key={item.url}>
                      {item.url && (
                        <Text weight={700} mb={10}>
                          {item.label}
                        </Text>
                      )}
                      {item.url ? (
                        item.label.toLowerCase().includes('pdf') ? (
                          <Box
                            style={{
                              display: 'flex',
                              gap: 6,
                              alignItems: 'center',
                              color: '#6922FF',
                              fontWeight: 600,
                            }}
                          >
                            <IconFile />
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Open PDF
                            </a>
                          </Box>
                        ) : (
                          <img
                            src={item.url}
                            style={{
                              width: 'auto',
                              height: 'auto',
                              maxWidth: '800px',
                              maxHeight: '600px',
                              margin: 10,
                            }}
                          />
                        )
                      ) : null}
                    </Box>
                  )
                })
              ) : (
                <Text weight={700}>Documents are not available</Text>
              )}
            </ScrollArea>
          </Grid.Col>
        ) : null}
      </Grid>
    </>
  )
}

const useStyles = createStyles(() => ({
  informationContainer: {
    marginBottom: 40,
  },
  title: {
    fontWeight: 700,
    fontSize: 24,
  },
  detailsContainer: {
    marginTop: 12,
    display: 'flex',
    justifyContent: 'space-between',
  },
  infoTitle: {
    fontWeight: 600,
    fontSize: 12,
  },
  infoValue: {
    fontWeight: 400,
    fontSize: 12,
  },
  skeletonStyle: {
    height: 200,
    width: '100%',
    marginBottom: 20,
  },
}))

export default ReviewUserInfoModal
