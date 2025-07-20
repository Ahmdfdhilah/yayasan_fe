# 🚀 Frontend Monorepo

A modern, scalable web frontend built with React, TypeScript, and Turborepo monorepo architecture. This project provides a robust foundation for building high-performance web applications with shared UI components and configurations.

## 🏗️ Architecture

This project uses a monorepo structure powered by Turborepo, enabling efficient code sharing and coordinated development across multiple applications.

### 📱 Applications
- **SAMPLE** - React application demonstrating the monorepo capabilities

### 📦 Shared Packages
- **@workspace/ui** - Reusable UI components built with Tailwind CSS and Radix UI
- **@workspace/eslint** - Centralized ESLint configuration for consistent code quality
- **@workspace/prettier** - Shared code formatting rules
- **@workspace/tailwind** - Common Tailwind CSS configuration and design tokens
- **@workspace/typescript** - Unified TypeScript configuration

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your system:

- **Node.js** >= 20.0.0
- **pnpm** >= 9.15.4

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Ahmdfdhilah/turborepo_boilerplate
cd turborepo_boilerplate
```

2. **Install dependencies:**
```bash
pnpm install
```

### Development

**Start all applications in development mode:**

For Linux/macOS:
```bash
pnpm run dev:apps:linux
```

For Windows:
```bash
pnpm run dev:apps:windows
```

**Start individual applications:**
```bash
# Company Profile app example
pnpm --filter company-profile dev

# Or any other specific app
pnpm --filter <app-name> dev
```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all applications in development mode |
| `pnpm build` | Build all applications for production |
| `pnpm lint` | Run ESLint across all packages |
| `pnpm format` | Format code with Prettier |
| `pnpm check-types` | Run TypeScript type checking |
| `pnpm clean` | Clean build artifacts and dependencies |

## 🛠️ Tech Stack

### Core Framework
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Lightning-fast build tool and dev server

### State Management
- **Redux Toolkit** - Modern Redux with less boilerplate
- **Redux Persist** - Automatic state persistence

### Styling & UI
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible UI primitives
- **Framer Motion** - Production-ready motion library

### Forms & Validation
- **React Hook Form** - Performant forms with minimal re-renders
- **Zod** - TypeScript-first schema validation

### Rich Text Editing
- **TipTap** - Headless rich text editor
- **React Quill** - Alternative WYSIWYG editor

### Data Visualization
- **Recharts** - Composable charting library built on React components

### HTTP & API
- **Axios** - Promise-based HTTP client with interceptors

### Internationalization
- **i18next** - Internationalization framework
- **react-i18next** - React integration for i18next

### Development Tools
- **Turborepo** - High-performance build system for monorepos
- **ESLint** - Pluggable JavaScript linter
- **Prettier** - Opinionated code formatter

## 📁 Project Structure

```
turborepo_boilerplate/
├── apps/                          # Applications
│   └── sample/                    # Sample application
├── packages/                      # Shared packages
│   ├── ui/                        # Shared UI components
│   │   ├── src/
│   │   │   ├── components/        # Reusable components
│   │   │   ├── hooks/             # Custom React hooks
│   │   │   └── utils/             # Utility functions
│   │   └── package.json
│   ├── eslint/                    # ESLint configuration
│   ├── prettier/                  # Prettier configuration
│   ├── tailwind/                  # Tailwind CSS configuration
│   └── typescript/                # TypeScript configuration
├── turbo.json                     # Turborepo configuration
├── package.json                   # Root package.json
├── pnpm-workspace.yaml           # PNPM workspace configuration
└── README.md                      # This file
```

## 🌟 Features

- **⚡ Fast Development** - Hot reload with Vite and optimized builds with Turborepo
- **🎨 Design System** - Consistent UI with shared components and design tokens
- **📱 Responsive** - Mobile-first design with Tailwind CSS
- **♿ Accessible** - Built with accessibility in mind using Radix UI primitives
- **🔧 Type Safe** - Full TypeScript support across all packages
- **🎯 Modern Tooling** - Latest versions of React, TypeScript, and build tools
- **🔄 Code Sharing** - Efficient code reuse across applications
- **📊 Performance** - Optimized builds and lazy loading

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions, please:

1. Check the [documentation](#)
2. Search existing [issues](../../issues)
3. Create a new [issue](../../issues/new) if needed

---

Built with ❤️ using modern web technologies
