import React from 'react'
import formatDateAndTimeToLocal from '../utils/formatDateAndTimeToLocal'

const TableBody = ({ data }) => {
  return (
    <tbody>
      {data.map((auditTrail) => {
        return (
          <tr style={{ borderBottom: '1px solid black' }} key={auditTrail._id}>
            <td
              style={{
                padding: 20
              }}
            >
              {auditTrail.message}
            </td>
            <td
              style={{
                padding: 20,
                wordWrap: 'break-word'
              }}
            >
              {auditTrail.details ? (
                auditTrail.details.retakeFields ? (
                  <>
                    <div style={{ fontWeight: 700 }}>Retake Fields</div>
                    {auditTrail.details.retakeFields.map((field) => (
                      <div key={field}>{field}</div>
                    ))}
                  </>
                ) : (
                  JSON.stringify(auditTrail.details)
                )
              ) : (
                ''
              )}
            </td>
            <td
              style={{
                padding: 20
              }}
            >
              {auditTrail.performedBy}
            </td>
            <td
              style={{
                padding: 20
              }}
            >
              {auditTrail.performedTo}
            </td>
            <td
              style={{
                padding: 20
              }}
            >
              {formatDateAndTimeToLocal(auditTrail.createdAt)}
            </td>
          </tr>
        )
      })}
    </tbody>
  )
}

export default TableBody
