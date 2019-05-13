package com.hehai.ssm.entity;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * @author Stable
 */
@Configuration
public class CommonProperties {

    @Value("#{host.serviceHost}")
    private String serviceHost;

    public String getServiceHost() {
        return serviceHost;
    }

    public void setServiceHost(String serviceHost) {
        this.serviceHost = serviceHost;
    }
}
