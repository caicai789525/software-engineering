
SET NAMES utf8mb4;

INSERT INTO `admins` (`username`, `password`, `role`, `create_time`) VALUES
('admin', '$2a$10$W8Fd8z1Csxv/OpM6gVFBkeoRVFxJSQ0V5Oq8ap049w8Z6iCM.nQJC', 'ROLE_ADMIN', NOW());

INSERT INTO `system_configs` (`config_key`, `config_value`, `description`) VALUES
('max_borrow_count', '5', '最大借阅数量'),
('borrow_days', '30', '借阅天数'),
('overdue_fee_per_day', '0.1', '每日逾期费用');
