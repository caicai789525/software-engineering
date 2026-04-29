# 图书管理系统 - 前端

基于 React 18 + TypeScript + Ant Design 构建的图书管理系统前端。

## 技术栈

- React 18
- TypeScript
- Vite
- Ant Design 5
- React Router 6
- Axios
- ECharts

## 功能模块

1. **登录与权限** - 支持读者、图书管理员、系统管理员三种角色
2. **图书查询** - 多条件搜索、分页展示
3. **借阅归还** - 借书、还书操作
4. **读者管理** - 读者信息CRUD
5. **统计报表** - 图表可视化展示借阅数据
6. **系统配置** - 借阅规则配置

## 快速开始

### 安装依赖

```bash
cd frontend
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

## 测试账号

- **reader / 123456** - 读者
- **librarian / 123456** - 图书管理员
- **admin / 123456** - 系统管理员

## 项目结构

```
frontend/
├── src/
│   ├── components/       # 公共组件
│   │   ├── Layout.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/         # React Context
│   │   └── AuthContext.tsx
│   ├── pages/            # 页面组件
│   │   ├── Login.tsx
│   │   ├── Books.tsx
│   │   ├── BorrowReturn.tsx
│   │   ├── Readers.tsx
│   │   ├── Statistics.tsx
│   │   └── SystemConfig.tsx
│   ├── services/         # API 服务
│   │   ├── api.ts
│   │   └── mock.ts
│   ├── types/            # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/            # 工具函数
│   │   └── request.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 后端集成

当前使用 Mock 数据进行开发。如需连接真实后端，请修改 `src/services/api.ts` 中的 API 调用，替换 Mock 数据调用。

后端 API 文档请参考：`../docs/API.md`
