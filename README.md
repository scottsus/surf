<h1 align='center'>🏄‍♂️ Surf</h1>

Equip your browser with AI superpowers.

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/{extension-id}?logo=google-chrome)](https://chrome.google.com/webstore/detail/{extension-id})
[![GitHub Repo](https://img.shields.io/badge/scottsus-surf-blue?&logo=github)](https://github.com/scottsus/surf)
![License](https://img.shields.io/github/license/scottsus/flamethrower.svg)
[![Twitter](https://img.shields.io/twitter/follow/susantoscott.svg)](https://x.com/susantoscott)
[![Twitter](https://img.shields.io/twitter/follow/chrispramana.svg)](https://x.com/chrispramana)

## What is this?

A side project of [@susantoscott](https://x.com/susantoscott) and [@chrispramana](https://x.com/chrispramana) to develop an open source version of [OpenAI's Operator](https://operator.chatgpt.com/), but as a browser extension.

Why browser extension? Since we don't have the resources that OpenAI has, we wanted to make this:

- easily downloadable by anyone with a repetitive workload
- easily extensible for any developer with a Node runtime

## Demo

https://github.com/user-attachments/assets/1cb17060-bf1f-4c55-a0ea-862ae6e22456

## Developer Quick Start

### Clone this repository

```
git clone https://github.com/scottsus/surf.git
```

This is a monorepo with 2 primary sections:

1. `apps/majordomo`: frontend browser extension
2. `apps/web`: server for LLM calls

### `apps/majordomo`

Enable hot reload

```
yarn dev
```

Go to `{arc,chrome}://extensions` -> Developer Mode -> Load Unpacked -> `apps/majordomo/dist/`

### `apps/web`

Spin up server for LLM calls

```
yarn dev
```

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

## 🛫 Project Roadmap

- [ ] 🧠 Proactive browsing
- [ ] 🔭 Telemetry and the ability to opt in/out
- [ ] 🔑 Custom API keys

## Contributing

Coming soon.
