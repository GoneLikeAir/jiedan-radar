# 接单雷达

给 Alex 的内部 briefing（简体中文）。调研日期 **2026-09-02**（Asia/Shanghai）。

- 线上：https://gonelikeair.github.io/jiedan-radar/
- 仓库：https://github.com/GoneLikeAir/jiedan-radar

GitHub App / Actions 无法代开 Pages（create site 返回 403）。仓库所有者打开一次即可：

**Settings → Pages → Build and deployment → Source = Deploy from a branch → Branch `main` / folder `/`（root）→ Save。**

也可以 Source = GitHub Actions（已有 `.github/workflows/pages.yml`）。`.nojekyll` 已在仓库根目录。
- 这是工单雷达板，不是营销站，也不是伪实时仪表盘。
- 数字只收录能回溯 URL 的来源。how-to / 编辑综述 / 非正式口径已在页上标注。

```bash
pnpm test
pnpm build
```
