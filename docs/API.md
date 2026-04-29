
# 图书管理系统 API 文档

## 统一响应格式

```json
{
  "code": 200,
  "msg": "success",
  "data": {}
}
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 通用错误 |
| 4001 | 读者状态异常 |
| 4002 | 图书不可借阅 |
| 4003 | 已达最大借阅数量 |
| 4004 | 图书不存在 |
| 4005 | 读者不存在 |
| 4006 | 借阅记录不存在 |
| 4007 | 存在未归还记录 |
| 4008 | ISBN重复 |
| 4009 | 参数错误 |
| 4010 | 重复借阅 |

---

## 图书管理 API

### 1. 分页查询图书
```
GET /api/books
```

**Query参数:**
- `keyword` (可选): 书名/作者/ISBN模糊搜索
- `category` (可选): 分类筛选
- `status` (可选): 状态筛选 (在馆/借出/修复/遗失)
- `page` (可选): 页码，默认1
- `size` (可选): 每页数量，默认10

**响应示例:**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "list": [
      {
        "isbn": "978-7-111-11111-1",
        "title": "Go语言圣经",
        "author": "Alan A.A.Donovan",
        "publisher": "人民邮电出版社",
        "category": "计算机",
        "location": "A区-01架",
        "status": "在馆",
        "entry_date": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "size": 10
  }
}
```

### 2. 查询单本图书
```
GET /api/books/:isbn
```

### 3. 新增图书
```
POST /api/books
```

**请求体:**
```json
{
  "isbn": "978-7-111-11111-1",
  "title": "Go语言圣经",
  "author": "Alan A.A.Donovan",
  "publisher": "人民邮电出版社",
  "category": "计算机",
  "location": "A区-01架",
  "entry_date": "2024-01-01T00:00:00Z"
}
```

### 4. 更新图书
```
PUT /api/books/:isbn
```

### 5. 删除图书
```
DELETE /api/books/:isbn
```

### 6. 修改图书状态
```
PATCH /api/books/:isbn/status
```

**请求体:**
```json
{
  "status": "在馆"
}
```

---

## 读者管理 API

### 1. 分页查询读者
```
GET /api/readers
```

**Query参数:**
- `keyword` (可选): 读者ID/姓名模糊搜索
- `status` (可选): 状态筛选 (正常/注销)
- `page` (可选): 页码，默认1
- `size` (可选): 每页数量，默认10

### 2. 查询单个读者
```
GET /api/readers/:reader_id
```

### 3. 新增读者
```
POST /api/readers
```

**请求体:**
```json
{
  "name": "张三",
  "phone": "13800138000",
  "email": "zhangsan@example.com"
}
```

**说明:** 读者ID自动生成，格式为 YYYYMMDD + 4位流水号

### 4. 更新读者
```
PUT /api/readers/:reader_id
```

### 5. 删除读者
```
DELETE /api/readers/:reader_id
```

### 6. 修改读者状态
```
PATCH /api/readers/:reader_id/status
```

**请求体:**
```json
{
  "status": "正常"
}
```

---

## 借阅与归还 API

### 1. 借书
```
POST /api/borrow
```

**请求体:**
```json
{
  "reader_id": "202401010001",
  "isbn": "978-7-111-11111-1"
}
```

**业务逻辑:**
- 校验读者状态是否正常
- 校验图书状态是否在馆
- 校验读者未还图书数是否超过限制
- 生成借阅记录
- 更新图书状态为"借出"
- 所有操作使用事务保证原子性

### 2. 还书
```
POST /api/borrow/return
```

**请求体:**
```json
{
  "isbn": "978-7-111-11111-1"
}
```

**业务逻辑:**
- 查找未归还的借阅记录
- 计算逾期费用 (超过应还日期)
- 更新归还日期和罚金
- 更新图书状态为"在馆"

### 3. 查询读者当前借阅列表
```
GET /api/borrow/reader/:reader_id
```

---

## 统计报表 API

### 1. 借阅排行榜
```
GET /api/statistics/borrow-rank
```

**Query参数:**
- `start_date` (可选): 开始日期 (YYYY-MM-DD)
- `end_date` (可选): 结束日期 (YYYY-MM-DD)
- `limit` (可选): 返回数量，默认10

### 2. 分类统计
```
GET /api/statistics/category
```

**Query参数:**
- `start_date` (可选): 开始日期 (YYYY-MM-DD)
- `end_date` (可选): 结束日期 (YYYY-MM-DD)

### 3. 逾期记录统计
```
GET /api/statistics/overdue
```

**Query参数:**
- `start_date` (可选): 开始日期 (YYYY-MM-DD)
- `end_date` (可选): 结束日期 (YYYY-MM-DD)

### 4. 月度借阅统计
```
GET /api/statistics/monthly
```

**Query参数:**
- `year` (可选): 年份，默认当前年
