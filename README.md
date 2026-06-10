# 商城前端

买家购物、注册登录、账户中心、入驻申请等公开商城功能。

## 开发

```bash
cd mall
npm install
npm run dev
```

## 环境变量

见 `.env.example`：

- `VITE_API_URL` — 后端 API
- `VITE_MERCHANT_CONSOLE_URL` — 店铺后台地址（入驻页卖家登录链接）

## 构建

```bash
npm run build
```

产物在 `dist/`，部署至主商城域名。
