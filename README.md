# InvestPilot MVP

一个面向中文用户的智能投资分析与决策辅助平台 MVP，当前聚焦于把“市场检测、风险评估、财经日历、个股分析、量化选股、文档提炼”做成可运行、可扩展、可继续真实化的产品底座。

## 当前定位

- 中文为主，强调专业、清晰、可解释。
- 不是喊单网站，而是投资参考与决策辅助工具。
- 前端优先展示结构化结论，后端逐步接入真实行情、财务、宏观与事件数据。
- 保留 mock 兜底，但默认优先走真实接口。

## 当前技术栈

- 前端：Next.js 15 / React 19 / Tailwind CSS 4 / ECharts
- 后端：FastAPI / AKShare / Pandas
- 架构：统一 service 层，优先请求 FastAPI；失败后按环境变量回退到 seeded 数据或 mock

## 当前页面

- `/` 首页
- `/market` 市场检测
- `/risk` 风险评估工作台
- `/stock/[symbol]` 个股详情
- `/calendar` 财经日历
- `/screener` 量化选股
- `/documents` 文档提炼
- `/watchlist` 自选股
- `/search` 情报搜索工作台

## 已接好的接口

### 后端真实接口

- `GET /v1/health`
- `GET /v1/market/overview`
- `GET /v1/stocks/{symbol}/analysis`
- `GET /v1/calendar/events`
- `GET /v1/search/intel`
- `POST /v1/documents/summarize`

### 后端 seeded 接口

这两条接口已经不是前端 mock，而是由 FastAPI 提供的可运行股票池与筛选逻辑；当前股票池仍为后端种子池，后续可以继续替换为更完整的实时股票宇宙。

- `GET /v1/stocks/universe`
- `GET /v1/screener/snapshot`

## 当前真实化状态

### 已经完全走 FastAPI 的模块

- 首页中的市场总览主结论
- 市场检测页的指数、热度、风险信号、全球市场卡片
- 风险评估工作台
- 个股详情页
- 财经日历
- 情报搜索中的个股新闻、个股公告、个股研报与市场级情报
- 文档提炼
- 自选股中的个股分析结果

### 当前为后端 seeded 的模块

- 自选股候选列表
- 量化选股基础股票池
- 量化选股筛选结果

补充说明：

- 首页个股搜索在输入关键词后，已经支持基于全市场股票目录做实时候选匹配，并支持拼音缩写。
- `stocks/universe` 默认列表已升级为混合池：种子股 + 目录精选候选；查询态支持全市场目录检索。
- `/search` 已支持真实个股新闻、个股公告、个股研报，以及无关键词时的市场级情报摘要。
- 搜索结果可以一键送入文档提炼页继续做摘要与结构化结论。

### 当前仍保留 mock 的模块

- 宏观卡片
- 部分资金流历史序列在实时源不可用时会自动回退为演示序列
- 联网搜索的通用全网聚合、来源评级与跨站去重尚未接入
- 默认量化选股池仍未扩展到真正的全市场实时评分
- 登录、持久化用户系统、跨端偏好记忆尚未接入

## 本地启动

### 1. 启动 FastAPI

```powershell
cd "C:\Users\33348\Documents\New project\invest-decision-mvp\backend"
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 2. 启动 Next.js

新开一个终端：

```powershell
cd "C:\Users\33348\Documents\New project\invest-decision-mvp"
$env:INVESTPILOT_FASTAPI_BASE_URL="http://127.0.0.1:8000"
$env:INVESTPILOT_DATA_SOURCE="auto"
$env:INVESTPILOT_REQUEST_TIMEOUT_MS="45000"
npm install
npm run dev -- --port 3102
```

访问：

- 前端：[http://127.0.0.1:3102](http://127.0.0.1:3102)
- 后端健康检查：[http://127.0.0.1:8000/v1/health](http://127.0.0.1:8000/v1/health)

### 3. 纯前端演示模式

如果只想演示前端：

```powershell
cd "C:\Users\33348\Documents\New project\invest-decision-mvp"
$env:INVESTPILOT_DATA_SOURCE="mock"
npm install
npm run dev
```

## 环境变量

前端示例见 [`.env.example`](./.env.example)。

- `INVESTPILOT_DATA_SOURCE`
  - `auto`：优先 FastAPI，失败回退
  - `fastapi`：强制真实接口
  - `mock`：强制使用 mock
- `INVESTPILOT_FASTAPI_BASE_URL`
  - 本地联调示例：`http://127.0.0.1:8000`
- `INVESTPILOT_REQUEST_TIMEOUT_MS`
  - 前端请求超时时间，建议开发环境至少 `45000`

后端示例见 [`backend/.env.example`](./backend/.env.example)。

- `INVESTPILOT_API_PREFIX`
- `INVESTPILOT_CORS_ORIGINS`
- `INVESTPILOT_MARKET_CACHE_TTL_SECONDS`
- `INVESTPILOT_STOCK_CACHE_TTL_SECONDS`
- `INVESTPILOT_SCREENER_CACHE_TTL_SECONDS`
- `INVESTPILOT_CALENDAR_CACHE_TTL_SECONDS`
- `INVESTPILOT_SEARCH_CACHE_TTL_SECONDS`
- `INVESTPILOT_DOCUMENT_CACHE_TTL_SECONDS`
- `INVESTPILOT_DEFAULT_WATCH_SYMBOLS`

## Netlify 部署

项目已包含 [netlify.toml](./netlify.toml)，前端可独立部署。

### 最小部署流程

```powershell
cd "C:\Users\33348\Documents\New project\invest-decision-mvp"
npx netlify login
npx netlify init
npx netlify deploy
npx netlify deploy --prod
```

如果站点已经在 Netlify 中创建过，也可以先执行：

```powershell
npx netlify link
```

### 必要环境变量

- 只部署前端演示版：
  - 可不配置 `INVESTPILOT_FASTAPI_BASE_URL`
  - 推荐 `INVESTPILOT_DATA_SOURCE=auto` 或 `mock`
- 部署前后端联动版本：
  - 必须配置 `INVESTPILOT_FASTAPI_BASE_URL=<你的 FastAPI 公网地址>`
  - 推荐 `INVESTPILOT_DATA_SOURCE=auto`

### 如果 CLI 提示未登录或未绑定站点

按顺序执行：

1. `npx netlify login`
2. `npx netlify status`
3. 如未 link：执行 `npx netlify init` 或 `npx netlify link`
4. 再执行 `npx netlify deploy`

## 目录结构

- `app/`：Next.js 页面与 API 路由
- `components/`：页面组件、图表、工作台模块
- `lib/services/`：统一 service 层，负责真实接口与 mock 切换
- `lib/mock-data.js`：本地兜底数据
- `lib/watchlist.js`：本地自选股状态
- `backend/app/`：FastAPI 主程序、路由与服务层
- `docs/backend-contract.md`：当前前后端接口约定

## 下一步最值得优先推进

1. 把 `stocks/universe` 从“混合池 + 查询态目录检索”继续扩展为真正的全市场实时股票池与基础快照。
2. 把情报搜索从当前个股级搜索升级为更完整的全网新闻、公告、研报聚合与去重。
3. 做真正的用户系统与云端自选股同步。
4. 将宏观卡片替换为稳定的真实宏观序列。
5. 把 FastAPI 独立部署，并将 Netlify 前端接到线上后端。
