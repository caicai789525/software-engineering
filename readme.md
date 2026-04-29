
# 图书管理系统

基于 Go + Gin + GORM + MySQL 的图书管理系统后端API。

## 技术栈

- **Web框架**: Gin
- **ORM**: GORM
- **数据库**: MySQL 8.0+
- **配置管理**: Viper

## 项目结构

```
repo-czy/
├── cmd/
│   └── server/           # 主程序入口
│       └── main.go
├── config/               # 配置文件
│   ├── config.yaml
│   └── config.go
├── database/             # 数据库相关
│   ├── schema.sql        # 建表脚本
│   ├── init_data.sql     # 初始化数据
│   ├── rollback.sql      # 回滚脚本
│   └── database.go
├── internal/
│   ├── controller/       # 控制器层
│   ├── service/          # 业务逻辑层
│   ├── repository/       # 数据访问层
│   └── model/            # 数据模型
├── pkg/
│   ├── response/         # 统一响应
│   └── utils/            # 工具函数
├── docs/                 # 文档
├── go.mod
├── go.sum
└── README.md
```

## 快速开始

### 1. 数据库准备

创建数据库并执行脚本：

```sql
-- 创建数据库
CREATE DATABASE library_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 执行建表脚本
source database/schema.sql;

-- 执行初始化数据脚本
source database/init_data.sql;
```

### 2. 修改配置

编辑 `config/config.yaml`，修改数据库连接信息：

```yaml
database:
  host: localhost
  port: 3306
  user: root
  password: your_password
  dbname: library_db
```

### 3. 运行项目

```bash
go mod tidy
go run cmd/server/main.go
```

服务将在 `http://localhost:8080` 启动。

## 功能模块

### 1. 图书管理
- 新增、编辑、删除图书
- 分页查询图书
- 图书状态管理

### 2. 读者管理
- 读者注册（自动生成ID）
- 读者信息维护
- 读者状态管理

### 3. 借阅与归还
- 借书功能（事务保障）
- 还书功能（自动计算罚金）
- 借阅记录查询

### 4. 统计报表
- 借阅排行榜
- 分类统计
- 逾期记录统计
- 月度借阅统计

## API文档

详细的API文档请参考 [docs/API.md](./docs/API.md)
