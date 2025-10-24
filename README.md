<h1 align='center'>🏄‍♂️ Surf</h1>

<p align='center'>
  <strong>Equip your browser with AI superpowers</strong>
</p>

<p align='center'>
  <a href="https://chrome.google.com/webstore/detail/{extension-id}">
    <img src="https://img.shields.io/chrome-web-store/v/{extension-id}?logo=google-chrome" alt="Chrome Web Store">
  </a>
  <a href="https://github.com/scottsus/surf">
    <img src="https://img.shields.io/badge/scottsus-surf-blue?&logo=github" alt="GitHub Repo">
  </a>
  <img src="https://img.shields.io/github/license/scottsus/surf.svg" alt="License">
  <a href="https://x.com/susantoscott">
    <img src="https://img.shields.io/twitter/follow/susantoscott.svg" alt="Twitter">
  </a>
  <a href="https://x.com/chrispramana">
    <img src="https://img.shields.io/twitter/follow/chrispramana.svg" alt="Twitter">
  </a>
</p>

## What is Surf?

Surf is an open-source browser extension that brings AI-powered automation to your browser. Inspired by [OpenAI's Operator](https://operator.chatgpt.com/), Surf lets you control your browser using natural language commands.

**Why a browser extension?**

We wanted to make AI-powered browsing:
- **Accessible** - Easy to install and use for anyone
- **Extensible** - Open source and hackable for developers
- **Privacy-focused** - Runs locally in your browser
- **Free** - No subscription required

## Demo

https://github.com/user-attachments/assets/1cb17060-bf1f-4c55-a0ea-862ae6e22456

## Quick Start

### For Users

1. **Download the extension** (coming soon to Chrome Web Store)
2. **Get your API keys** (Anthropic, OpenAI, or Google)
3. **Press `CMD + SHIFT + K`** to open the command bar
4. **Tell Surf what to do** in natural language

### For Developers

**Prerequisites:**
- Node.js 18+ and Yarn 1.22+
- Chrome or Arc browser
- API keys (Anthropic, OpenAI, or Google)

**Setup:**

```bash
# Clone the repository
git clone https://github.com/scottsus/surf.git
cd surf

# Install dependencies
yarn install

# Set up environment variables
# See docs/DEVELOPMENT.md for details
cp apps/web/.env.example apps/web/.env.local
cp apps/majordomo/.env.example apps/majordomo/.env

# Start the backend server
cd apps/web
yarn dev

# In another terminal, start the extension
cd apps/majordomo
yarn dev

# Load the extension in Chrome
# 1. Go to chrome://extensions
# 2. Enable Developer Mode
# 3. Click "Load Unpacked"
# 4. Select apps/majordomo/dist/
```

**Learn more:**
- [Architecture Guide](docs/ARCHITECTURE.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [API Documentation](docs/API.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## Features

### 🌐 Surf the web

Press `CMD + SHIFT + K` to open up the prompt, then let Surf do its thing.

<img src='https://github.com/user-attachments/assets/ed9da3c2-1369-4f88-96af-2caea8e460c9' alt='Quick Start' width='600px'/>

### ⌨️ Text completion

Press `CMD + SHIFT + ;` for a generic autocomplete.

<img src='https://github.com/user-attachments/assets/7e46930f-eb61-400e-879a-48658b2625b0' alt='Quick Start' width='600px'/>

### 🔍 Monitor Surf

Let Surf do it's thing in the background, freeing your time to do something else.

<img src='https://github.com/user-attachments/assets/36f931aa-731c-4c2a-83d5-201e844cc70c' alt='Quick Start' width='600px'/>

## Project Structure

Surf is built as a Turborepo monorepo:

```
surf/
├── apps/
│   ├── majordomo/          # Browser extension (Chrome/Arc)
│   ├── web/                # Next.js backend for LLM calls
│   └── fastapi/            # FastAPI backend (experimental)
├── packages/
│   ├── ai-schemas/         # Zod schemas for AI responses
│   ├── database/           # Prisma database client
│   ├── types/              # Shared TypeScript types
│   └── ui/                 # Shared React components
└── docs/                   # Documentation
```

## How It Works

1. **You give a command** - Press `CMD + SHIFT + K` and describe what you want to do
2. **AI analyzes the page** - Surf minifies the DOM and sends it to an LLM
3. **Actions are generated** - The AI decides what actions to take (click, type, navigate, etc.)
4. **Surf executes** - Actions are performed automatically in your browser
5. **Results are evaluated** - The AI checks if actions were successful
6. **Repeat until done** - The loop continues until your task is complete

## Roadmap

- [ ] 🧠 Proactive browsing suggestions
- [ ] 🔭 Telemetry with opt-in/opt-out
- [ ] 🔑 Custom API key management in extension
- [ ] 🌐 Multi-language support
- [ ] 📱 Mobile browser support
- [ ] 🔌 Plugin system for custom actions
- [ ] 🎨 Customizable UI themes

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

**Ways to contribute:**
- Report bugs and request features via [GitHub Issues](https://github.com/scottsus/surf/issues)
- Submit pull requests for bug fixes or new features
- Improve documentation
- Share your experience and help others

## Community

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Questions and general discussion
- **Twitter** - Follow [@susantoscott](https://x.com/susantoscott) and [@chrispramana](https://x.com/chrispramana) for updates

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

Created by [@susantoscott](https://x.com/susantoscott) and [@chrispramana](https://x.com/chrispramana).

Inspired by [OpenAI's Operator](https://operator.chatgpt.com/).

Built with:
- [React](https://react.dev/)
- [Next.js](https://nextjs.org/)
- [Anthropic Claude](https://www.anthropic.com/)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [Turborepo](https://turbo.build/repo)
