# 跑步数据分析报告（myRst）

基于 React + TypeScript + Vite + Chart.js 构建的个人跑步数据可视化看板，用于展示从 Apple Health 导出并经 Neon PostgreSQL 处理后的跑步训练记录。

## 技术栈

- React 19 + TypeScript
- Vite 8（构建/开发服务器）
- Chart.js + react-chartjs-2（折线图、环形图、堆叠柱状图）
- ESLint（typescript-eslint）

## 功能概览

- **年份筛选**：按年份查看跑步数据，或查看全部历史数据
- **汇总卡片**：跑步总次数、时间跨度、周末占比、累计距离、累计消耗、平均配速、跑后测体重比例
- **图表分析**
  - 心率区间平均占比（环形图）
  - 配速变化趋势（折线图）
  - 消耗变化趋势（折线图）
  - 心率区间分布堆叠图（柱状图）
- **数据解读**：基于汇总数据自动生成的文字分析与训练建议
- **明细数据表**：可排序的逐次跑步记录表格

## 项目结构

```
src/
├── components/
│   ├── Header.tsx              页面标题与生成时间
│   ├── YearFilter.tsx          年份筛选下拉框
│   ├── SummaryCards.tsx        汇总数据卡片
│   ├── ZoneDoughnut.tsx        心率区间环形图
│   ├── PaceLineChart.tsx       配速趋势折线图
│   ├── ConsumptionLineChart.tsx 消耗趋势折线图
│   ├── ZoneStackChart.tsx      心率区间堆叠柱状图
│   ├── Analysis.tsx            数据解读文案
│   ├── DataTable.tsx           明细数据表
│   └── Footer.tsx               页脚
├── data/runs.json               跑步记录数据（JSON）
├── constants.ts                 心率区间名称/颜色等常量
├── types.ts                     数据类型定义
├── utils.ts                     汇总数据计算逻辑
├── App.tsx                       页面主入口
└── main.tsx                      应用挂载入口
```

## 数据来源

数据由 `running_analysis.py`（外部脚本，不在本仓库内）从 Apple Health 导出的 XML 数据处理后写入 Neon PostgreSQL（`health_workouts` 表），再导出为 `src/data/runs.json` 供前端展示。每条记录包含日期、时长、距离、消耗、配速、心率及心率区间占比、体重测量等字段，详见 `src/types.ts`。

## 开发环境要求

- Node.js **20.19+ 或 22.12+**（Vite 8 要求；低版本会报 `CustomEvent is not defined` 错误）

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查 + 生产构建
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

## 更新数据

将最新的 `runs.json` 替换 `src/data/runs.json`，并在 `src/App.tsx` 中更新 `GENERATED_AT` 常量为新的生成时间，即可在页面上看到最新数据。
