# 我还活着 (I'm Still Alive)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个基于 Cloudflare Workers + KV 的极简、安全、端到端的生存确认系统。

## ✨ 核心特性

- **多用户体系**：支持使用者 (Sender) 与监护人 (Guardian) 角色。
- **双向绑定**：基于 UUID 的双向自愿绑定协议，确保隐私安全。
- **自定义备注**：监护人可为被监护人设置直观的备注名称。
- **存活状态监控**：实时检查对方最后一次“签到”时间，超时自动预警。
- **未来感 UI**：采用 Glassmorphism 设计语言，适配移动端 PWA。
- **零成本部署**：完全基于 Cloudflare 免费层服务。

## 🚀 快速开始

### 1. 后端部署 (Cloudflare)
- 创建两个 KV 命名空间：`ALIVE_USERS` 和 `ALIVE_BINDINGS`。
- 部署 `walkthrough.md` 中的 Worker 脚本。
- 在环境变量中配置 `INVITE_CODE`（可选）。

### 2. 前端配置
- 打开网页，点击右上角 ⚙️ 设置。
- 填入您的 Worker 域名（默认已预设）。
- 注册并选择您的角色，开始绑定与守护。

## 🛠️ 技术栈
- **前端**: Vanilla JS, CSS3, HTML5 (PWA)
- **后端**: Cloudflare Workers
- **存储**: Cloudflare KV
- **认证**: SHA-256 Hashing + JWT-like Session

---
*本项目旨在为独居者或特殊需求群体提供一种轻量级的互助确认机制。*
# alive
