package com.hehai.ssm.exception;

/**
 * 重复预约的异常
 *
 * @author Stable
 */
public class RepeatAppointException extends RuntimeException {
    private static final long serialVersionUID = 4211045290662759328L;

    public RepeatAppointException(String message) {
        super(message);
    }

    public RepeatAppointException(String message, Throwable cause) {
        super(message, cause);
    }

}
