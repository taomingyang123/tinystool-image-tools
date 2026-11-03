# Tiny Image — 部署结果与验收记录

## 2026-11-03 · 实际 Cloudflare Pages 部署（T04-19）

- 独立仓库已更名为 `taomingyang123/tinystool-image-tools`，本地 origin 已同步；Pages 同名，Git 集成 main 自动部署，构建命令 `yarn check`，输出 `.output/public`，Node 22.22.3 / Yarn 4.5.0。
- 修复 `public/_headers` 中 `*.wasm` 无效规则（曾导致 JS 被错误标为 application/wasm），改为 `/*.wasm` 并删除重叠缓存头；补回归断言。
- 修复 GitHub Actions 的 Yarn 1 缓存检查早于 Corepack 启用的问题；[CI #6](https://github.com/taomingyang123/tinystool-image-tools/actions/runs/41663844103) 全部步骤通过，包含真实 Chrome 检查。
- 当前功能代码发布提交 `e76f66d481182d915e9328be517ccb3f541ba951`（含响应头修复 a969604）；Pages 部署 ID `9483d57b-0984-44bd-9b8a-acaea81f9d4b`。
- Pages 地址：https://tinystool-image-tools.pages.dev/ 。已在实际线上站点运行真实 Chrome 20 项检查，JPEG/PNG/WebP、透明 JPEG 白底、原尺寸下载、ZIP、取消重试、语言切换、WASM MIME/CSP、首屏无 WASM 和无图片上传均通过。
- 已新增并核对 `image CNAME tinystool-image-tools.pages.dev`（已代理），Pages 控制台已显示自定义域“活动 / SSL 已启用”。但正式域名实际访问仍连接关闭：curl SSL_ERROR_SYSCALL、Chrome ERR_CONNECTION_CLOSED / 检查超时、外部抓取工具也失败。正式域名 HTTPS/端到端复验尚未通过，不能将控制台激活等同于访问验收。
- 证据：[本地门禁](verification/2026-11-03-check.txt)、[本地 Chrome](verification/2026-11-03-browser-check.json)、[线上 Chrome](verification/2026-11-03-production-browser-check.json)。macOS 本地服务测试完成全部检查后 Node 未退出，已定向清理；线上 Chrome 命令退出码 0，远端 Linux CI 也正常结束。
- 既有 T04-13～T04-16 功能问题、跨浏览器真机、授权来源与搜索引擎提交仍未完成；没有修改主站应用或根域记录。Wrangler 仍为旧 Workers 配置，被 Pages 忽略，实际构建参数以控制台为准。

## 2026-10-14 · 历史本地验收

日期：2026-10-14。域名目标：`https://image.tinystool.org`。版本标记：package.json 1.0.0。

当前结论是本地生产构建及 Chrome 代表流程通过。没有取得此次实际 Cloudflare 部署、DNS/HTTPS、GitHub 远端 CI 或跨浏览器真机验收证据，不标记“生产上线已完成”。此前的 100% 生产验收描述由本报告纠正；历史任务状态保持原记录。

| 层级 | 操作 | 当前结果 |
|---|---|---|
| 静态 | `yarn typecheck` | 通过，Node 22.17.0 / Yarn 4.5.0 |
| 运行时 | `yarn test:unit` | 12 文件，88 项通过；含真实 WASM 单元测试与模拟队列测试 |
| 运行时 | `yarn generate` / `yarn seo-check` | 20 条预渲染资源/路由，6 个业务页面 SEO 检查通过 |
| 本地系统 | `yarn test:e2e` | 真实本地 Chrome，生产 Worker/WASM、下载与队列代表流程通过 |
| 生产系统 | Cloudflare / 域名 / 远端 CI / 真机 | 待验证，见 T04-11 |
| 版权来源 | 安装包声明及素材溯源 | notices 已补齐；上游 WASM/素材来源仍待 T04-12 |

详细修复、证据与费用边界见 [功能审查报告](verification/2026-10-14-feature-audit.md)，浏览器证据见 [记录](verification/2026-10-14-browser-check.json)，发布验收见 [清单](RELEASE-QA-CHECKLIST.md)。

当前产物包括六个中文/英文/日文首页与隐私页、sitemap.xml、robots.txt、_redirects、_headers、favicon.svg、third-party-licenses.txt 及哈希 JS/CSS/WASM。开发 Spike 不进入发布包。首屏没有 WASM 请求；实际资源响应头仍需在 Cloudflare 上复核。
