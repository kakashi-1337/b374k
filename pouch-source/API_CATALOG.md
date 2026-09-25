# Pouch.ph API Endpoint Catalog

**Source:** React frontend extracted from app.pouch.ph
**Date:** 2026-09-24
**Files Analyzed:** 152 files in `/pouch-source/`
**Purpose:** Authorized security research -- comprehensive API surface mapping

---

## Table of Contents

1. [Auth Endpoints](#1-auth-endpoints)
2. [User / Profile Endpoints](#2-user--profile-endpoints)
3. [Transaction Endpoints](#3-transaction-endpoints)
4. [Banking / Payment Endpoints](#4-banking--payment-endpoints)
5. [ADMIN/BRIDGE Endpoints (PRIMARY ATTACK SURFACE)](#5-adminbridge-endpoints-primary-attack-surface)
6. [KYC Endpoints](#6-kyc-endpoints)
7. [File / Upload Endpoints](#7-file--upload-endpoints)
8. [Notification Endpoints](#8-notification-endpoints)
9. [Other Endpoints](#9-other-endpoints)
10. [Security Observations](#10-security-observations)

---

## Client-Side Role Gating Summary

The `/bridge/*` routes in the React router are gated by:
```js
// pages/Portal/index.js:121
{['admin'].includes(user.role) && (
  <>
    <Route path="/bridge" ...>
      ...UserList, Businesses, BridgeTransactions, ExchangeRates, Mailroom, KYCDashboard...
    </Route>
  </>
)}
```
**IMPORTANT:** This is CLIENT-SIDE ONLY. All bridge/admin API endpoints must be tested for server-side authorization enforcement. A regular user's session cookie should be tested against every `/api/v*/bridge/*` endpoint.

---

## 1. Auth Endpoints

| # | Method | Endpoint | Request Body / Params | Source File | Client Role Check |
|---|--------|----------|-----------------------|-------------|-------------------|
| 1 | POST | `/api/v0/auth` | `{ username, password }` | `pages/Portal/Signin.js:39` | None (public login) |
| 2 | DELETE | `/api/v0/auth` | None | `components/PortalLayout/UserMenuDrawer.js:136` | None (authenticated user logout) |
| 3 | GET | `/api/v0/auth/send-auth-code` | Params: `{ contactMethod, contact }` | `pages/Portal/ForgotPassword/Verification.js:39` | None (public - forgot password flow) |
| 4 | GET | `/api/v0/auth/verify-auth-code` | Params: `{ contactMethod, contact, code, successKey }` | `pages/Portal/ForgotPassword/Verification.js:60` | None (public - forgot password flow) |

---

## 2. User / Profile Endpoints

| # | Method | Endpoint | Request Body / Params | Source File | Client Role Check |
|---|--------|----------|-----------------------|-------------|-------------------|
| 5 | GET | `/api/v0/user` | None (session cookie) | `context/UserContext.js:30` | None (authenticated) |
| 6 | GET | `/api/v0/user?username={u}` | Query: `username` | `pages/PrintQR/Single.js:59`, `pages/PrintQR/Multiple8.js:97` | None |
| 7 | PATCH | `/api/v0/user/reset-password` | `{ contactMethod, contact, password, mfaKey }` | `pages/Portal/ForgotPassword/ResetPassword.js:63` | None (public - MFA-gated) |
| 8 | GET | `/api/v2/user/profile-picture` | Params: `{ string: username, size }` | `hooks/useProfilePicture.js:10` | None |
| 9 | PATCH | `/api/v2/user/change-password` | `{ oldPassword, newPassword }` | `pages/Portal/Dashboard/Account/ChangePassword.js:56` | None (authenticated user) |
| 10 | POST | `/api/v2/user/contact` | `{ entityType: 'pouch-user', entityIdentifier: username }` | `pages/Portal/Dashboard/ManageContacts/AddPouchContact.js:43` | None (authenticated user) |

---

## 3. Transaction Endpoints

| # | Method | Endpoint | Request Body / Params | Source File | Client Role Check |
|---|--------|----------|-----------------------|-------------|-------------------|
| 11 | GET | `/api/v0/transactions?activeProfileUsername={username}` | Query: `activeProfileUsername`, `page`, `fromDate`, `toDate`, `limit` | `pages/Portal/Transactions/index.js:192` | None (regular user path) |
| 12 | POST | `/api/v0/transaction/create-bolt11` | `{ amount, username, memo }` | `pages/Portal/Dashboard/Receive/index.js:73` | None (authenticated user) |
| 13 | GET | `/api/v0/transaction/check-bolt11` | Params: `{ bolt11 }` | `pages/Portal/Dashboard/Receive/index.js:106` | None (authenticated user) |
| 14 | GET | `/api/v0/transaction/batch-payment` | Params: `{ sender: username }` | `pages/Portal/BatchPayment/Step2.js:35` | None (authenticated user) |
| 15 | POST | `/api/v0/transaction/batch-payment/{type}` | Body: array of `[{ username, amount, currency }]` | `pages/Portal/BatchPayment/Step2.js:63` | None (authenticated user) |
| 16 | GET | `/api/v3/custom/transactions` | `responseType: 'blob'` (CSV download) | `pages/Portal/Transactions/index.js:282` | `['admin', 'biller'].includes(user.role)` -- client-side only |

---

## 4. Banking / Payment Endpoints

| # | Method | Endpoint | Request Body / Params | Source File | Client Role Check |
|---|--------|----------|-----------------------|-------------|-------------------|
| 17 | GET | `/api/v0/bank/payment-methods` | None | `components/SelectPaymentMethod.js:34` | None |
| 18 | GET | `/api/v0/bank/recipients?activeProfileUsername={username}` | Query: `activeProfileUsername` | `pages/Portal/Dashboard/ManageContacts/index.js:158` | None (authenticated user) |
| 19 | POST | `/api/v0/bank/recipients?activeProfileUsername={username}` | `{ type, accountName, accountNumber, bankCode? }` | `pages/Portal/Dashboard/ManageContacts/AddBankRecipient.js:49` | None (authenticated user) |
| 20 | DELETE | `/api/v0/bank/recipients/{recipientId}?activeProfileUsername={activeProfileUsername}` | None | `pages/Portal/Dashboard/ManageContacts/index.js:44` | None (authenticated user) |
| 21 | GET | `/api/v2/netbank/banks` | None | `hooks/useBanks.js:11` | None |
| 22 | GET | `/api/v2/netbank/transactions/{transactionId}` | Path param: `transactionId` | `pages/Portal/bridge/BridgeTransactions/MoreFeatures.js:36` | Bridge page (client-side admin check on route) |

---

## 5. ADMIN/BRIDGE Endpoints (PRIMARY ATTACK SURFACE)

> **CRITICAL:** All of these endpoints are used within components rendered only when `['admin'].includes(user.role)` at the React router level (`pages/Portal/index.js:121`). This is a **client-side check only**. The server MUST enforce authorization independently. Every endpoint below should be tested with a non-admin session cookie.

### 5a. Bridge User Management

| # | Method | Endpoint | Request Body / Params | Source File | Client Role Check |
|---|--------|----------|-----------------------|-------------|-------------------|
| 23 | GET | `/api/v3/bridge/users` | Params: `{ limit, page, isIdUploaded, isVerified, isBanned, isBusiness, usernameRegex, firstName, lastName, name, email, phone, organizationName, organizationRole, organizationUnit, upgradeStatus, notUpgradeStatus, isUpgraded, isOld, hasRetakeFields, isForMigration, isForMigrationAccepted }` | `pages/Portal/bridge/UserList/index.js:176`, `pages/Portal/bridge/KYCDashboard/hooks/useUserManagement.js:56`, `pages/Portal/bridge/KYCDashboard/hooks/useApplications.js:66`, `pages/Portal/bridge/KYCDashboard/migration-applications/useMigrationApplications.js:51` | Bridge route (client-side admin) |
| 24 | PUT | `/api/v3/bridge/users/{id}/update` | `{ action: 'upgrade'/'retake'/'update'/'accept', riskScore?, fields?, retakeNote? }` | `pages/Portal/bridge/KYCDashboard/applications/applicationsHelpers.js:139,184`, `pages/Portal/bridge/KYCDashboard/applications/EditModal.js:26`, `pages/Portal/bridge/KYCDashboard/applications/ReviewUserInfoModal.js:45`, `pages/Portal/bridge/KYCDashboard/migration-applications/migrationApplicationsHelpers.js:118,137,150`, `pages/Portal/bridge/UserList/EditModal.js:18` | Bridge route (client-side admin) |
| 25 | PUT | `/api/v0/bridge/user/manual-review` | `{ username, action: 'approve'/'delete'/'unapprove'/'retake' }` | `pages/Portal/bridge/UserList/index.js:601,615,625,643`, `pages/Portal/bridge/KYCDashboard/user-management/userManagementHelpers.js:17,45`, `pages/Portal/bridge/KYCDashboard/applications/applicationsHelpers.js:156` | Bridge route (client-side admin) |
| 26 | PUT | `/api/v0/bridge/user/ban` | `{ username, ban: true/false }` | `pages/Portal/bridge/UserList/index.js:668,691`, `pages/Portal/bridge/KYCDashboard/user-management/userManagementHelpers.js:31`, `pages/Portal/bridge/KYCDashboard/applications/applicationsHelpers.js:170` | Bridge route (client-side admin) |
| 27 | PUT | `/api/v0/bridge/user/ambassador` | `{ username, makeAmbassador: true/false }` | `pages/Portal/bridge/UserList/index.js:679`, `pages/Portal/bridge/KYCDashboard/user-management/userManagementHelpers.js:65` | Bridge route (client-side admin) |
| 28 | PUT | `/api/v0/bridge/user/convert-primary-currency` | `{ username, toCurrency }` | `pages/Portal/bridge/UserList/index.js:656` | Bridge route (client-side admin) |
| 29 | POST | `api/v0/bridge/user/toggle-account-tag` | `{ username, tag }` | `pages/Portal/bridge/UserList/index.js:582` | Bridge route (client-side admin). **NOTE:** Missing leading `/` in URL -- may be a bug or relative path. |
| 30 | GET | `/api/v0/bridge/user/view-id?username={username}` | Query: `username` | `pages/Portal/bridge/UserList/index.js:702` | Bridge route (client-side admin) |
| 31 | GET | `/api/v3/bridge/users/balances?username={username}` | Query: `username` | `hooks/useBalances.js:14` | Used from ReviewUserInfoModal (admin context) |

### 5b. Bridge Transaction Management

| # | Method | Endpoint | Request Body / Params | Source File | Client Role Check |
|---|--------|----------|-----------------------|-------------|-------------------|
| 32 | GET | `/api/v3/bridge/transactions?username={username}` | Query: `username`, `type`, `page`, `fromDate`, `toDate`, `limit` | `pages/Portal/Transactions/index.js:195` | `['admin'].includes(user.role)` (client-side) |
| 33 | POST | `/api/v0/bridge/transaction/issue-manual-deposit` | `{ creditToUsername, amountInPHP, unionbankReferenceId }` | `pages/Portal/bridge/BridgeTransactions/MoreFeatures.js:91` | `user.role !== 'admin' ? return null` (client-side, **ManualTransactionMaker component**) |
| 34 | GET | `/api/v0/bridge/transaction/list?status=pending-review` | Query: `status=pending-review` | `pages/Portal/bridge/BridgeTransactions/MoreFeatures.js:142` | Bridge route (client-side admin) |
| 35 | PATCH | `/api/v0/bridge/transaction/approve-deposit` | `{ intakeFormRefId }` | `pages/Portal/bridge/BridgeTransactions/MoreFeatures.js:184` | Bridge route (client-side admin) |
| 36 | GET | `/api/v0/transaction/cashback/all?page={page}&limit={limit}&search={search}` | Query: `page`, `limit`, `search` | `pages/Portal/bridge/CashbackTransaction/hooks/useGetCashbackTransactions.js:23` | Bridge route (client-side admin) |

### 5c. Bridge Business Management

| # | Method | Endpoint | Request Body / Params | Source File | Client Role Check |
|---|--------|----------|-----------------------|-------------|-------------------|
| 37 | GET | `/api/v0/bridge/business/list` | None | `pages/Portal/bridge/Businesses/useBusiness.js:12` | Bridge route (client-side admin) |

### 5d. Bridge User Config (Sweep / Cashback)

| # | Method | Endpoint | Request Body / Params | Source File | Client Role Check |
|---|--------|----------|-----------------------|-------------|-------------------|
| 38 | PUT | `/api/v3/bridge/users/{userId}/config/sweep` | `{ useSweeping, bankCode, accountName, accountNumber, frequency, threshold, username? }` | `pages/Portal/Dashboard/Account/BusinessSettings/AutomaticWithdrawals.js:82,129` | Used when `isBridgeUser` is true (admin managing another user) |
| 39 | PUT | `/api/v3/users/config/sweep` | `{ useSweeping, bankCode, accountName, accountNumber, frequency, threshold }` | `pages/Portal/Dashboard/Account/BusinessSettings/AutomaticWithdrawals.js:92,139` | None (self-service for own account) |
| 40 | PUT | `/api/v3/bridge/users/{userId}/config/merchant-cashback` | `{ enabled: true/false }` | `pages/Portal/Dashboard/Account/BusinessSettings/MerchantCashback.js:31` | Used when `isBridgeUser` is true (admin managing another user) |
| 41 | PUT | `/api/v3/users/config/merchant-cashback` | `{ enabled: true/false }` | `pages/Portal/Dashboard/Account/BusinessSettings/MerchantCashback.js:37` | None (self-service for own account) |

### 5e. Bridge KYC Dashboard

| # | Method | Endpoint | Request Body / Params | Source File | Client Role Check |
|---|--------|----------|-----------------------|-------------|-------------------|
| 42 | GET | `/api/v3/bridge/kyc-dashboard/audit-trails?timeframe={timeframe}` | Query: `timeframe` (TODAY/THIS_WEEK/THIS_MONTH/THIS_YEAR/ALL) | `pages/Portal/bridge/KYCDashboard/hooks/useAuditTrails.js:14` | Bridge route (client-side admin) |

### 5f. Bridge Organization

| # | Method | Endpoint | Request Body / Params | Source File | Client Role Check |
|---|--------|----------|-----------------------|-------------|-------------------|
| 43 | GET | `/api/v3/organizations/coop` | None | `pages/Portal/bridge/UserList/index.js:117` | Bridge route (client-side admin) |

---

## 6. KYC Endpoints

| # | Method | Endpoint | Request Body / Params | Source File | Client Role Check |
|---|--------|----------|-----------------------|-------------|-------------------|
| 44 | GET | `/api/v0/kyc/user/PH` | Params: `{ userId, documents: true }` | `pages/Portal/bridge/UserList/index.js:710` | Bridge route (client-side admin) |
| 45 | GET | `/api/v0/image/url/{key}` | Path param: `key` (S3/storage key) | `pages/Portal/bridge/UserList/index.js:714` | Bridge route (client-side admin) |

---

## 7. File / Upload Endpoints

| # | Method | Endpoint | Request Body / Params | Source File | Client Role Check |
|---|--------|----------|-----------------------|-------------|-------------------|
| 46 | GET | `/api/v3/files` | Params: `{ key }` | `hooks/useFile.js:11` | None (authenticated) |
| 47 | POST | `/api/v3/bridge/files/upload/{userId}` | `FormData { key, file }` (multipart) | `hooks/useFile.js:44,70` | Called from admin ReviewUserInfoModal context |
| 48 | GET | `/api/v3/bridge/users/{userId}/files?key={key}` | Query: `key` | `pages/Portal/bridge/KYCDashboard/applications/applicationsHelpers.js:105`, `pages/Portal/bridge/KYCDashboard/migration-applications/migrationApplicationsHelpers.js:87` | Bridge route (client-side admin) |

---

## 8. Notification Endpoints

| # | Method | Endpoint | Request Body / Params | Source File | Client Role Check |
|---|--------|----------|-----------------------|-------------|-------------------|
| 49 | POST | `/api/v2/notifications/batch-notifications` | `{ type: 'all-users'/'specific-users', message, title, specificUsers }` | `pages/Portal/bridge/Mailroom.js:22` | Bridge route (client-side admin) |

---

## 9. Other Endpoints

| # | Method | Endpoint | Request Body / Params | Source File | Client Role Check |
|---|--------|----------|-----------------------|-------------|-------------------|
| 50 | GET | `/api/v0/exchange-rates` | None | `pages/Portal/bridge/ExchangeRates.js:16` | Bridge route (client-side admin, but data likely public) |
| 51 | GET | `/api/v2/intake-form?referenceId={intakeFormRefId}` | Query: `referenceId` | `pages/Portal/bridge/BridgeTransactions/MoreFeatures.js:164` | Bridge route (client-side admin) |

---

## 10. Security Observations

### 10.1 Critical: Client-Side Only Authorization

The entire `/bridge/*` admin panel is gated by a single client-side check:
```js
['admin'].includes(user.role)
```
at `pages/Portal/index.js:121`. This means:
- The React router simply does not render bridge components for non-admin users
- **No evidence of client-side token differentiation** -- all requests use the same session cookie
- **Every `/api/v*/bridge/*` endpoint must be tested for server-side authz**

### 10.2 High-Risk Endpoints for Testing

These are the most dangerous endpoints if server-side authorization is missing:

| Priority | Endpoint | Risk |
|----------|----------|------|
| **P0** | `POST /api/v0/bridge/transaction/issue-manual-deposit` | **Direct money creation** -- credits PHP to any user. Double client-side check (`user.role !== 'admin'` in ManualTransactionMaker), but server enforcement is critical. |
| **P0** | `PATCH /api/v0/bridge/transaction/approve-deposit` | **Approves pending deposits** -- could approve fraudulent deposits |
| **P0** | `POST /api/v0/transaction/batch-payment/{type}` | **Mass payments** -- sends funds to multiple users. No visible admin check even client-side. |
| **P1** | `PUT /api/v0/bridge/user/ban` | **Account takeover enabler** -- ban/unban any user |
| **P1** | `PUT /api/v0/bridge/user/manual-review` | **Approve/delete any user** -- manipulate KYC status |
| **P1** | `PUT /api/v3/bridge/users/{id}/update` | **Modify any user record** -- update names, KYC status, risk scores |
| **P1** | `PUT /api/v0/bridge/user/convert-primary-currency` | **Currency conversion** for any user |
| **P1** | `PUT /api/v0/bridge/user/ambassador` | **Privilege escalation** -- ambassador status modification |
| **P2** | `POST /api/v3/bridge/files/upload/{userId}` | **File upload to any user** -- replace KYC documents |
| **P2** | `POST /api/v2/notifications/batch-notifications` | **Mass notification** -- phishing vector to all users |
| **P2** | `PUT /api/v3/bridge/users/{userId}/config/sweep` | **Redirect auto-withdrawals** for any user to attacker bank account |
| **P2** | `GET /api/v3/bridge/users` | **Full user enumeration** -- PII exposure (names, emails, phones, balances) |
| **P3** | `GET /api/v0/bridge/user/view-id` | **View government IDs** of any user |
| **P3** | `GET /api/v0/kyc/user/PH` | **Access KYC documents** of any user |
| **P3** | `GET /api/v3/bridge/users/{userId}/files?key={key}` | **Access uploaded files** for any user |

### 10.3 IDOR Candidates

Endpoints using user-controlled path/query parameters for resource access:

| Endpoint | Parameter | Risk |
|----------|-----------|------|
| `/api/v0/bank/recipients/{recipientId}?activeProfileUsername={x}` | `recipientId`, `activeProfileUsername` | Delete other users' bank recipients |
| `/api/v0/bank/recipients?activeProfileUsername={x}` | `activeProfileUsername` | View/create recipients for other users |
| `/api/v0/transactions?activeProfileUsername={x}` | `activeProfileUsername` | View transactions of other users |
| `/api/v3/bridge/users/{id}/update` | `id` | Modify arbitrary user |
| `/api/v3/bridge/users/{userId}/config/sweep` | `userId` | Change withdrawal config for arbitrary user |
| `/api/v3/bridge/files/upload/{userId}` | `userId` | Upload files to arbitrary user profile |
| `/api/v0/user?username={u}` | `username` | User information disclosure |

### 10.4 Missing Leading Slash

```js
// pages/Portal/bridge/UserList/index.js:582
.post('api/v0/bridge/user/toggle-account-tag', { username, tag })
```
Missing the leading `/`. This may cause relative URL resolution issues depending on the current page path. This could be a bug worth investigating -- it might fail or resolve to an unexpected endpoint.

### 10.5 Exposed Banking Fields in User Object

The user object returned by `/api/v0/user` and bridge user listing endpoints contains `netbankAccountNumber` -- the user's linked bank account number. Combined with user enumeration (via bridge endpoints or NoSQLi), this exposes real banking credentials at scale.

### 10.6 Socket.IO Connection

```js
// pages/Portal/Dashboard/Receive/index.js:92
const socket = io('/', { autoConnect: false })
socket.emit('subscribe_to_tx_id', tx._id)
```
WebSocket connection for real-time transaction status. Test whether arbitrary transaction IDs can be subscribed to for information leakage.

### 10.6 API Version Spread

The frontend uses three API versions:
- `/api/v0/` -- majority of endpoints (auth, transactions, bridge user management)
- `/api/v2/` -- user profile, netbank, notifications, intake forms
- `/api/v3/` -- bridge users CRUD, files, organizations, custom transactions, KYC dashboard

This suggests incremental API development. Older v0 endpoints may have weaker authorization controls.

### 10.7 Batch Payment Endpoint -- No Visible Admin Gate

`POST /api/v0/transaction/batch-payment/{type}` and `GET /api/v0/transaction/batch-payment` are used from `pages/Portal/BatchPayment/Step2.js`, which is rendered at `/batch-payment` -- this route is available to ALL authenticated users (not inside the admin-gated `/bridge` routes). If the server does not enforce role checks, any user could trigger batch payments.

### 10.8 Sweep Config -- Potential Fund Redirect

`PUT /api/v3/bridge/users/{userId}/config/sweep` allows setting the bank account where automatic withdrawals are sent. If an attacker can access this endpoint, they could redirect another user's automatic withdrawals to their own bank account. The `bankCode`, `accountName`, and `accountNumber` fields are fully attacker-controlled.

---

## Endpoint Count Summary

| Category | Count |
|----------|-------|
| Auth | 4 |
| User/Profile | 6 |
| Transaction | 6 |
| Banking/Payment | 6 |
| Admin/Bridge | 22 |
| KYC | 2 |
| File/Upload | 3 |
| Notification | 1 |
| Other | 2 |
| **Total Unique Endpoints** | **52** |
