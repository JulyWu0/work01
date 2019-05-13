package com.hehai.ssm.enums;

/**
 * 使用枚举表述常量数据字典
 *
 * @author Stable
 */

public enum AppointStateEnum {
    /**
     * 1 代表预约成功
     */
    SUCCESS(1, "预约成功"),
    /**
     * 0 代表库存不足
     */
    NO_NUMBER(0, "库存不足"),
    /**
     * -1 代表重复预约
     */
    REPEAT_APPOINT(-1, "重复预约"),
    /**
     * -2 代表系统异常
     */
    INNER_ERROR(-2, "系统异常");
    /**
     * 预约状态
     */
    private Integer state;
    /**
     * 预约状态详情
     */
    private String stateInfo;

    private AppointStateEnum(int state, String stateInfo) {
        this.state = state;
        this.stateInfo = stateInfo;
    }

    public Integer getState() {
        return state;
    }

    public String getStateInfo() {
        return stateInfo;
    }

    public static AppointStateEnum stateOf(int index) {
        for (AppointStateEnum state : values()) {
            if (state.getState() == index) {
                return state;
            }
        }
        return null;
    }

}
