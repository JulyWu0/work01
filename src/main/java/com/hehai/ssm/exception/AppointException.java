package com.hehai.ssm.exception;

/**
 * 预约未知异常
 *
 * @author Stable
 */
public class AppointException extends RuntimeException {
    private static final long serialVersionUID = -2276576054711879528L;

    public AppointException(String message) {
        super(message);
    }

    public AppointException(String message, Throwable cause) {
        super(message, cause);
    }

}
