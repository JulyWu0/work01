package com.hehai.ssm.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * 封装json对象，所有返回结果都使用它
 *
 * @author Stable
 */
@Getter
@Setter
@ToString
public class Result<T> {
    /**
     * 是否成功标志
     */
    private Boolean success;
    /**
     * 成功时返回的数据
     */
    private T data;
    /**
     * 错误信息
     */
    private String error;

    public Result() {
    }

    /**
     * 成功时的构造器
     *
     * @param success 是否成功
     * @param data    返回的数据
     */
    public Result(Boolean success, T data) {
        this.success = success;
        this.data = data;
    }

    /**
     * 错误时的构造器
     *
     * @param success 是否成功
     * @param error   错误信息
     */
    public Result(Boolean success, String error) {
        this.success = success;
        this.error = error;
    }

}
