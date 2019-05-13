package com.hehai.ssm.dao;

import org.apache.ibatis.annotations.Param;

import com.hehai.ssm.entity.Appointment;

/**
 * 预约图书DAO接口
 *
 * @author Stable
 */
public interface AppointmentDao {
    /**
     * 插入预约图书记录
     *
     * @param bookId    图书ID
     * @param studentId 学生ID
     * @return 插入的行数
     */
    Integer insertAppointment(@Param("bookId") Long bookId, @Param("studentId") Long studentId);

    /**
     * 通过主键查询预约图书记录，并且携带图书实体
     *
     * @param bookId    图书ID
     * @param studentId 学生ID
     * @return 预约对象
     */
    Appointment queryByKeyWithBook(@Param("bookId") Long bookId, @Param("studentId") Long studentId);

}
