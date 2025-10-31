# Edulite Monorepo 🚀

Welcome to the **Edulite Project**!
This repository is organized as a **monorepo** using **npm workspaces**, with separate applications for **mobile (Expo/React Native)** and **backend (Next.js API-only)**.

The goal of this README is to ensure every team member can set up the project locally, collaborate effectively, and follow best practices for consistent development.

## 📦 Project Structure

```arduino
edulite/
│── .github # GitHub workflows (CI/CD)
│── .vscode
│── apps/
│ ├── mobile/ # Expo React Native app
│ └── backend/ # Next.js API backend (no frontend)
│── .gitignore
│── .prettierignore
│── .prettierrc.json
│── package-lock.json
│── package.json # Root workspace configuration
│── README.md # You're here!
```

## 🛠️ Required Tools

- **Node.js 20+** → [Download](https://nodejs.org/)
- **npm 9+** (comes with Node.js)
- **Expo App** (recommended)
- **Git** → [Download](https://git-scm.com/)
- **Prettier extension** (mandatory for VS Code users)

## ⚙️ Setup Instructions

1.  Clone the repository

    ```bash
    git clone https://github.com/QuintonCodes/edulite.git
    cd edulite
    ```

2.  Install dependencies

    At the root:

    ```bash
    npm install
    ```

    This will install dependencies for all workspaces (mobile + backend).

3.  Running the apps
    **Mobile (Expo)**:

    ```bash
    npm run start:mobile
    ```

    or

    ```bash
    cd apps/mobile
    npm run start
    ```

    - Opens Expo CLI for development builds
    - You can test on:
      - **Android Emulator**
      - **iOS simulator**
      - **Expo Go** app on your device

    **Backend (Next.js API)**:

    ```bash
    npm run dev:backend
    ```

    or

    ```bash
    cd apps/backend
    npm run dev
    ```

    - Starts the API-only server on [http://localhost:4000].

## 📖 Development Workflow

We use the following tools to ensure consistency:

- **ESLint** for code linting and enforcing coding standards
- **Jest** for running unit tests
- **Prettier** for automatic code formatting
- **TypeScript** for static type checking
- **GitHub Actions** for CI pipelines (lint, format, type-check and tests)

Before pushing code, always run:

```bash
npm run lint
npm run format:check
npm run type-check
npm run test
```

## 🎨 Prettier Setup (Required)

All developers **must install Prettier** to keep formatting consistent

1.  Install the **Prettier extension** in your editor:
    - [VS Code Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

2.  Enable **Format on Save** in your editor settings:

    ```json
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode"
    ```

3.  Run auto-formatting manually when needed:
    ```bash
    npm run format
    ```

## 🌿 Git Workflow (Collaboration Rules)

We follow a branch-based workflow.
👉 Never commit directly to [main].

1.  Create your branch for your task:
    - [feature/] -> for new features
    - [fix/] -> for bug fixes
    - [chore/] -> for maintenance tasks (configs, cleanup)
    - [docs/] -> for documentation updates

    Example:

    ```bash
    git checkout -b feature/authentication-flow
    ```

2.  Commit Messages
    Follow [Conventional Commits](https://www.conventionalcommits.org/):
    - [feat:] -> for new features
    - [fix:] -> for bug fixes
    - [chore:] -> for tooling/config updates
    - [docs:] -> for docs only changes
      Example:
    ```scss
    feat(auth): add JWT authentication middleware
    fix(api): resolve 500 error on login route
    ```
3.  Push Your Branch
    ```bash
    git push origin feature/authentication-flow
    ```
4.  Create a Pull Request (PR)
    - Go to GitHub -> Open a **Pull Request** into [main]
    - Fill out PR description:
      - **Summary of changes**
      - **Related issue/task**
      - **Screenshots** (if UI-related)
      - **Checklist** (lint, tests passing)

    The CI pipeline will:
    - Run **lint**
    - Check **formatting**
    - Run **type-checks**
    - Execute **tests**

    ✅ Only merge when all checks pass.

## 🧪 Running Tests

Currently, only the mobile app has tests.

```bash
npm run test:mobile
```

CI will also run tests automatically on PRs

## 📚 Learning Resources

To learn more about developing our project with Expo, look at the following resources:

- [Expo Docs](https://docs.expo.dev/)
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
