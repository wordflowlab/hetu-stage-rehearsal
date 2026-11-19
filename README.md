# 舞台排演

> 把固定剧本、部门提示、调用依赖和真实手记组织成可回读的排演提示本。

## 简介

河图洛书的独立创作插件，由外部Codex通过河图CLI／MCP读取包内Skill并操作。宿主剧本保存正式文本，导演布景台负责空间与机位，本包负责现场提示本和排演复盘。不控制灯光、音响或舞台机械，不承担现场安全调度和对外演出发布。

## 角色分流

- 作者使用 → [插件中心](https://hetu.limeai.run/plugins/stage-rehearsal/)
- Agent与功能Review → [功能清单](CAPABILITIES.md)
- 开发与维护 → [完整设计文档](docs/README.md)

## 快速上手

开发需要Node.js 25，安装与验收基线为河图0.12.6。

```bash
npm ci
npm run build
npm run check
npm run test:unit
npm run package
```

## 边界

专业成果沿固定来源与修订接续，正文采纳、定稿、费用和外发独立决定。发行及实际验收范围见[实施记录](docs/08-实施计划与验收记录.md)。
