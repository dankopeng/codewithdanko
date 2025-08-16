# Contributing to CodeWithDanko

Thank you for considering contributing to CodeWithDanko! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

Before submitting a bug report:
- Check the issue tracker to see if the bug has already been reported
- Make sure you're using the latest version
- Collect information about your environment (OS, Node.js version, etc.)

When submitting a bug report, please include:
- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior vs. actual behavior
- Screenshots or code snippets if applicable
- Any relevant logs or error messages

### Suggesting Enhancements

Enhancement suggestions are welcome! Please include:
- A clear and descriptive title
- A detailed description of the proposed functionality
- Any relevant examples or mockups
- An explanation of why this enhancement would be useful

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies** with `npm install`
3. **Make your changes** following our coding standards
4. **Add tests** for your changes if applicable
5. **Ensure all tests pass** with `npm test`
6. **Update documentation** if needed
7. **Submit your pull request** with a clear description of the changes

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/dankopeng/codewithdanko.git
   cd codewithdanko
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Cloudflare resources as described in the README

4. Start the development server:
   ```bash
   npm run dev
   ```

## Coding Standards

- Follow the existing code style
- Use TypeScript for type safety
- Write meaningful commit messages
- Comment your code where necessary
- Keep functions small and focused
- Use descriptive variable names

## Testing

- Write tests for new features
- Ensure existing tests pass
- Test across different environments if possible

## Documentation

- Update the README.md if you change functionality
- Document new features
- Keep API documentation up-to-date
- Add comments to explain complex code

## Commit Guidelines

We follow conventional commits:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding or modifying tests
- `chore:` for maintenance tasks

## Review Process

1. A maintainer will review your PR
2. Changes may be requested
3. Once approved, a maintainer will merge your PR
4. Your contribution will be part of the next release

## Questions?

If you have any questions, feel free to open an issue or contact the maintainers.

Thank you for contributing to CodeWithDanko!
