import React, { useState } from 'react'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'

const types = ['pouch', 'bank']

const BatchPayment = ({ user }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [step, setStep] = useState(1)
  const [pouchUserRows, setPouchUserRows] = useState([])
  const [bankAccountRows, setBankAccountRows] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [batchPayResponse, setBatchPayResponse] = useState(null)
  const [inquiryData, setInquiryData] = useState(null)

  const rows = activeTab === 0 ? pouchUserRows : bankAccountRows

  return (
    <>
      {step === 1 ? (
        <Step1
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pouchUserRows={pouchUserRows}
          setPouchUserRows={setPouchUserRows}
          bankAccountRows={bankAccountRows}
          setBankAccountRows={setBankAccountRows}
          setStep={setStep}
          totalAmount={totalAmount}
          setTotalAmount={setTotalAmount}
        />
      ) : null}
      {step === 2 ? (
        <Step2
          type={types[activeTab]}
          rows={rows}
          totalAmount={totalAmount}
          setStep={setStep}
          username={user.username}
          primaryCurrency={user.primaryCurrency}
          setBatchPayResponse={setBatchPayResponse}
          setInquiryData={setInquiryData}
        />
      ) : null}
      {step === 3 ? (
        <Step3
          type={types[activeTab]}
          batchPayResponse={batchPayResponse}
          inquiryData={inquiryData}
          totalAmount={totalAmount}
          setTotalAmount={setTotalAmount}
          totalUsers={rows.length}
          username={user.username}
          primaryCurrency={user.primaryCurrency}
          setPouchUserRows={setPouchUserRows}
          setBankAccountRows={setBankAccountRows}
          setStep={setStep}
        />
      ) : null}
    </>
  )
}

export default BatchPayment
