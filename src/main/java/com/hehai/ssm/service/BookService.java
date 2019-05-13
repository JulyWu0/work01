package com.hehai.ssm.service;

import java.util.List;

import com.hehai.ssm.dto.AppointExecution;
import com.hehai.ssm.entity.Book;

/**
 * 业务接口：站在"使用者"角度设计接口
 * 三个方面：方法定义粒度，参数，返回类型（return 类型/异常）
 *
 * @author Stable
 */
public interface BookService {

    /**
     * 查询一本图书
     *
     * @param bookId 图书ID
     * @return 图书对象
     */
    Book getById(Long bookId);

    /**
     * 查询所有图书
     *
     * @return 所有图书的列表
     */
    List<Book> getList();

    /**
     * 预约图书
     *
     * @param bookId    图书ID
     * @param studentId 学号
     * @return 预约执行结果
     */
    AppointExecution appoint(Long bookId, Long studentId);

}
