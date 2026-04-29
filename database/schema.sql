
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `books` (
  `isbn` VARCHAR(20) NOT NULL COMMENT 'ISBN',
  `title` VARCHAR(200) NOT NULL COMMENT '书名',
  `author` VARCHAR(100) NOT NULL COMMENT '作者',
  `publisher` VARCHAR(100) DEFAULT NULL COMMENT '出版社',
  `category` VARCHAR(50) DEFAULT NULL COMMENT '分类',
  `location` VARCHAR(50) DEFAULT NULL COMMENT '位置',
  `status` ENUM('在馆', '借出', '修复', '遗失') NOT NULL DEFAULT '在馆' COMMENT '状态',
  `entry_date` DATE NOT NULL COMMENT '入库日期',
  PRIMARY KEY (`isbn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='图书表';

CREATE TABLE IF NOT EXISTS `readers` (
  `reader_id` VARCHAR(20) NOT NULL COMMENT '读者ID',
  `name` VARCHAR(50) NOT NULL COMMENT '姓名',
  `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `reg_date` DATE NOT NULL COMMENT '注册日期',
  `status` ENUM('正常', '注销') NOT NULL DEFAULT '正常' COMMENT '状态',
  PRIMARY KEY (`reader_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='读者表';

CREATE TABLE IF NOT EXISTS `borrow_records` (
  `borrow_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '借阅ID',
  `reader_id` VARCHAR(20) NOT NULL COMMENT '读者ID',
  `isbn` VARCHAR(20) NOT NULL COMMENT 'ISBN',
  `borrow_date` DATE NOT NULL COMMENT '借阅日期',
  `due_date` DATE NOT NULL COMMENT '应还日期',
  `return_date` DATE DEFAULT NULL COMMENT '归还日期',
  `fine` DECIMAL(5, 2) NOT NULL DEFAULT 0.00 COMMENT '罚金',
  PRIMARY KEY (`borrow_id`),
  KEY `idx_reader_id` (`reader_id`),
  KEY `idx_isbn` (`isbn`),
  CONSTRAINT `fk_borrow_reader` FOREIGN KEY (`reader_id`) REFERENCES `readers` (`reader_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_borrow_book` FOREIGN KEY (`isbn`) REFERENCES `books` (`isbn`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='借阅记录表';

CREATE TABLE IF NOT EXISTS `admins` (
  `admin_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码(BCrypt)',
  `role` ENUM('ROLE_READER', 'ROLE_LIBRARIAN', 'ROLE_ADMIN') NOT NULL DEFAULT 'ROLE_LIBRARIAN' COMMENT '角色',
  `last_login_ip` VARCHAR(50) DEFAULT NULL COMMENT '最后登录IP',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='管理员表';

CREATE TABLE IF NOT EXISTS `operation_logs` (
  `log_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `operator` VARCHAR(50) NOT NULL COMMENT '操作者',
  `operation_type` VARCHAR(50) NOT NULL COMMENT '操作类型',
  `target_object` VARCHAR(100) DEFAULT NULL COMMENT '操作对象',
  `request_params` TEXT COMMENT '请求参数',
  `ip_address` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
  `operation_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='操作日志表';

CREATE TABLE IF NOT EXISTS `system_configs` (
  `config_key` VARCHAR(50) NOT NULL COMMENT '配置键',
  `config_value` VARCHAR(255) NOT NULL COMMENT '配置值',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '描述',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='系统配置表';

SET FOREIGN_KEY_CHECKS = 1;
