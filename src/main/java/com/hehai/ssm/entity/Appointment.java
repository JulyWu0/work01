package com.hehai.ssm.entity;

import lombok.Data;

import java.util.Date;

/**
 * 预约实体
 *
 * @author Stable
 */
@Data
public class Appointment {
    /**
     * 图书ID
     */
    private Long bookId;
    /**
     * 学号
     */
    private Long studentId;
    /**
     * 预约时间
     */
    private Date appointTime;

    /**
     * 多对一的复合属性
     * 图书实体
     */
    private Book book;

}
