package com.hehai.ssm.service.impl;

import java.util.List;

import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hehai.ssm.dao.AppointmentDao;
import com.hehai.ssm.dao.BookDao;
import com.hehai.ssm.dto.AppointExecution;
import com.hehai.ssm.entity.Appointment;
import com.hehai.ssm.entity.Book;
import com.hehai.ssm.enums.AppointStateEnum;
import com.hehai.ssm.exception.AppointException;
import com.hehai.ssm.exception.NoNumberException;
import com.hehai.ssm.exception.RepeatAppointException;
import com.hehai.ssm.service.BookService;

import ch.qos.logback.classic.Logger;

/**
 * @author Stable
 */
@Service
public class BookServiceImpl implements BookService {
    private Logger logger = (Logger) LoggerFactory.getLogger(this.getClass());

    /**
     * 注入Service依赖
     */
    @Autowired
    private BookDao bookDao;

    @Autowired
    private AppointmentDao appointmentDao;

    @Override
    public Book getById(Long bookId) {
        return bookDao.queryById(bookId);
    }

    @Override
    public List<Book> getList() {
        return bookDao.queryAll(0, 1000);
    }

    /**
     * 使用注解控制事务方法的优点：
     * 1.开发团队达成一致约定，明确标注事务方法的编程风格
     * 2.保证事务方法的执行时间尽可能短，不要穿插其他网络操作，RPC/HTTP请求或者剥离到事务方法外部
     * 3.不是所有的方法都需要事务，如只有一条修改操作、只读操作不需要事务控制
     * <p>
     * 由于从update开始就会持有行级锁，所以尽量持有行级锁的时间短，可以先insert再update
     */
    @Override
    @Transactional(rollbackFor = RuntimeException.class)
    public AppointExecution appoint(Long bookId, Long studentId) {
        try {
            // 执行预约操作
            int insert = appointmentDao.insertAppointment(bookId, studentId);
            if (insert <= 0) {
                // 重复预约
                throw new RepeatAppointException("repeat appoint");
            } else {
                // 预约成功
                // 减库存
                int update = bookDao.reduceNumber(bookId);
                if (update <= 0) {
                    // 库存不足
                    throw new NoNumberException("no number");
                } else {
                    //成功插入记录，并减了库存
                    Appointment appointment = appointmentDao.queryByKeyWithBook(bookId, studentId);
                    return new AppointExecution(bookId, AppointStateEnum.SUCCESS, appointment);
                }
            }
            // 要先于catch Exception异常前先catch住再抛出，不然自定义的异常也会被转换为AppointException，导致控制层无法具体识别是哪个异常
        } catch (NoNumberException | RepeatAppointException e) {
            throw e;
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            // 所有编译期异常转换为运行期异常，使spring执行回滚
            throw new AppointException("appoint inner error:" + e.getMessage());
        }
    }

}
