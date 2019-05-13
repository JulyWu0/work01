package com.hehai.ssm.dao;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.hehai.ssm.entity.Book;

/**
 * 图书DAO接口定义
 *
 * @author Stable
 */
public interface BookDao {
    /**
     * 通过ID查询单本图书
     *
     * @param id 图书ID
     * @return 所查询的图书对象
     */
    Book queryById(Long id);

    /**
     * 查询所有图书
     *
     * @param offset 查询起始位置
     * @param limit  查询条数
     * @return 所有图书对象的List集合
     */
    List<Book> queryAll(@Param("offset") Integer offset, @Param("limit") Integer limit);

    /**
     * 减少馆藏数量
     *
     * @param bookId 图书ID
     * @return 如果影响行数等于>1，表示更新的记录行数
     */
    Integer reduceNumber(Long bookId);

}
