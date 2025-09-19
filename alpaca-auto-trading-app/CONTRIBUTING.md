# Contributing

## Install
```bash
npm install
```

## Development
```bash
npm run dev
```

## Testing
```bash
npm run test
npm run test:watch
```

## Linting
```bash
npm run lint
npm run format
```

## Build
```bash
npm run build
```

## Project Structure
- `src/` - Source code
- `app/` - Next.js app router pages
- `tests/` - Test files
- `scripts/` - Build and utility scripts
- `agent/` - AI agent knowledge and utilities

## Code Style
- Use TypeScript strict mode
- Follow ESLint configuration
- Use Prettier for formatting
- Add file headers for new files
- Write tests for new features

## Git Hooks
- Pre-commit: Runs linting and tests
- Pre-push: Runs full CI checks

## Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run `npm run check` to verify
6. Submit a pull request

## Issues
- Use GitHub issues for bug reports
- Use GitHub discussions for questions
- Follow the issue template
