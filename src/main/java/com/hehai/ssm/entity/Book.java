package com.hehai.ssm.entity;

import lombok.Data;

/**
 * 图书实体
 *
 * @author Stable
 */
@Data
public class Book {
    /**
     * 图书ID
     */
    private Long bookId;
    /**
     * 图书名称
     */
    private String name;
    /**
     * 馆藏数量
     */
    private Integer number;

}
