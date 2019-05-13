USE ssm;
-- 创建图书表
CREATE TABLE `book` (
`book_id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '图书ID',
`name` VARCHAR(100) NOT NULL COMMENT '图书名称',
`number` INT(11) NOT NULL COMMENT '馆藏数量',
PRIMARY KEY (`book_id`)
) ENGINE=INNODB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8 COMMENT='图书表';

-- 初始化图书数据
INSERT INTO `book` (`book_id`, `name`, `number`)
VALUES
    (1000, 'Java程序设计', 10),
    (1001, '数据结构', 10),
    (1002, '设计模式', 10),
    (1003, '编译原理', 10);

-- 创建预约图书表
CREATE TABLE `appointment` (
`book_id` BIGINT(20) NOT NULL COMMENT '图书ID',
`student_id` BIGINT(20) NOT NULL COMMENT '学号',
`appoint_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '预约时间' ,
PRIMARY KEY (`book_id`, `student_id`),
INDEX `idx_appoint_time` (`appoint_time`)
) ENGINE=INNODB DEFAULT CHARSET=utf8 COMMENT='预约图书表';