package com.hehai.ssm.dto;

import com.hehai.ssm.entity.Appointment;
import com.hehai.ssm.enums.AppointStateEnum;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * 封装预约执行后结果
 *
 * @author Stable
 */
@Getter
@Setter
@ToString
public class AppointExecution {

    /**
     * 图书ID
     */
    private Long bookId;

    /**
     * 预约结果状态
     */
    private Integer state;

    /**
     * 状态标识
     */
    private String stateInfo;

    /**
     * 预约成功对象
     */
    private Appointment appointment;

    public AppointExecution() {
    }

    /**
     * 预约失败的构造器
     *
     * @param bookId    图书ID
     * @param stateEnum 预约结果枚举
     */
    public AppointExecution(Long bookId, AppointStateEnum stateEnum) {
        this.bookId = bookId;
        this.state = stateEnum.getState();
        this.stateInfo = stateEnum.getStateInfo();
    }

    /**
     * 预约成功的构造器
     *
     * @param bookId      图书ID
     * @param stateEnum   预约结果枚举
     * @param appointment 预约成功对象
     */
    public AppointExecution(Long bookId, AppointStateEnum stateEnum, Appointment appointment) {
        this.bookId = bookId;
        this.state = stateEnum.getState();
        this.stateInfo = stateEnum.getStateInfo();
        this.appointment = appointment;
    }
}
