package com.hehai.ssm.exception;

/**
 * 库存不足的异常
 *
 * @author Stable
 */
public class NoNumberException extends RuntimeException {
    private static final long serialVersionUID = -3423656814576783085L;

    public NoNumberException(String message) {
        super(message);
    }

    public NoNumberException(String message, Throwable cause) {
        super(message, cause);
    }

}
