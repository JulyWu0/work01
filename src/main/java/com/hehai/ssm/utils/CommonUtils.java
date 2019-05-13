package com.hehai.ssm.utils;

import com.alibaba.fastjson.JSONObject;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

import javax.servlet.http.HttpServletRequest;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

/**
 * post请求工具类
 *
 * @author Stable
 */
public class CommonUtils {
    public static JSONObject doPostRequest(String targetUrl, String requestBody) {
        JSONObject result = null;
        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpPost httpPost = new HttpPost(targetUrl);

        //指定编码可以不抛出异常
        StringEntity entityParam = new StringEntity(requestBody,StandardCharsets.UTF_8);
        entityParam.setContentType("application/json");
        entityParam.setContentEncoding("utf-8");

        httpPost.setEntity(entityParam);

        CloseableHttpResponse response = null;
        try {
            response = httpClient.execute(httpPost);
            HttpEntity entity = response.getEntity();

            result = JSONObject.parseObject(EntityUtils.toString(entity));

            EntityUtils.consume(entity);
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (response != null) {
                try {
                    response.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            try {
                httpClient.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        return result;
    }

    /**
     * 从request对象获取输入的json对象
     *
     * @param request
     * @return
     */
    public static JSONObject getJsonObjFromRequest(HttpServletRequest request) {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader in = new BufferedReader(new InputStreamReader(request.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = in.readLine()) != null) {
                sb.append(line);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        return JSONObject.parseObject(sb.toString());
    }
}
