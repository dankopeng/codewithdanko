# Security Policy

## Reporting a Vulnerability

At DANKO AI LIMITED, we take security seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report a Security Vulnerability

**Please DO NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to [security@dankopeng.com](mailto:security@dankopeng.com). You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information in your report:

- Type of vulnerability
- Full path of source file(s) related to the vulnerability
- Location of affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability, including how an attacker might exploit it

### Preferred Languages

We prefer all communications to be in English.

## Security Update Process

When we receive a security bug report, we will:

1. Confirm the problem and determine the affected versions
2. Audit code to find any potential similar problems
3. Prepare fixes for all supported releases
4. Release patches as soon as possible

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Best Practices for Users

When using CodeWithDanko, please follow these security best practices:

1. **Keep dependencies updated**: Regularly update all dependencies to their latest versions
2. **Secure your JWT secret**: Use a strong, unique JWT secret and rotate it periodically
3. **Implement proper access controls**: Ensure your application has proper authorization checks
4. **Validate all user inputs**: Never trust user input without validation
5. **Enable security headers**: Use appropriate security headers in your application
6. **Monitor your application**: Set up logging and monitoring for suspicious activities

## Disclosure Policy

When we receive a security bug report, we will assign it to a primary handler. This person will coordinate the fix and release process, involving the following steps:

- Confirm the problem and determine the affected versions
- Audit code to find any potential similar problems
- Prepare fixes for all supported releases
- Release patches as soon as possible

## Comments on this Policy

If you have suggestions on how this process could be improved, please submit a pull request or open an issue to discuss.
