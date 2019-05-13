package com.hehai.ssm.web;

import com.alibaba.fastjson.JSONObject;
import com.hehai.ssm.entity.CommonProperties;
import com.hehai.ssm.utils.CommonUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;

/**
 * 转发到真正服务的controller
 *
 * @author Stable
 */
@Controller
@RequestMapping("/block")
public class DispatcherController {

    @Autowired
    private CommonProperties commonProperties;

    /**
     * 院区、检查类型的url
     */
    private static final String initdata = "/ris/regm/initdata";
    /**
     * 时段和诊室的url
     */
    private static final String dicdata = "/ris/regm/dicdata";
    /**
     * 室号池概览的url
     */
    private static final String teamoutline = "/ris/regm/teamoutline";
    /**
     * 查询申请单信息的url
     */
    private static final String reqinfo = "/ris/regm/reqinfo";
    /**
     * 占号执行锁号
     */
    private static final String holdnum = "/ris/regm/holdnum";
    /**
     * 加减号
     */
    private static final String incdecnum = "/ris/regm/incdecnum";
    /**
     * 通知服务端小票打印了
     */
    private static final String signprtregnote = "/ris/regm/signprtregnote";
    /**
     * 弃号
     */
    private static final String giveupnum = "/ris/regm/giveupnum";
    /**
     * 查询诊室号池详情的接口
     */
    private static final String teaminfo = "/ris/regm/teaminfo";
    /**
     * 签到接口
     * 使用自助机的签到接口
     */
    private static final String signin = "/sh/signin";

    /**
     * 通过npguid查询申请单信息
     */
    private static final String reqinfobynpguid = "/sh/reqinfobynpguid";

    /**
     * 设置类型 ，急诊还是平诊
     */
    private static final String setregtype = "/ris/regm/setregtype";
    /**
     * 获取服务器当前时间
     */
    private static final String currentTime = "/currentTime";

    @RequestMapping(value = "/ris/regm/initdata")
    @ResponseBody
    public JSONObject toInitdata(HttpServletRequest request) {
        JSONObject jsonData = CommonUtils.getJsonObjFromRequest(request);

        return CommonUtils.doPostRequest(commonProperties.getServiceHost() + initdata, jsonData.toJSONString());
    }

    @RequestMapping(value = "/ris/regm/dicdata")
    @ResponseBody
    public JSONObject toDicdata(HttpServletRequest request) {
        JSONObject jsonData = CommonUtils.getJsonObjFromRequest(request);

        return CommonUtils.doPostRequest(commonProperties.getServiceHost() + dicdata, jsonData.toJSONString());
    }


    @RequestMapping(value = "/ris/regm/teamoutline")
    @ResponseBody
    public JSONObject toTeamoutline(HttpServletRequest request) {
        JSONObject jsonData = CommonUtils.getJsonObjFromRequest(request);

        return CommonUtils.doPostRequest(commonProperties.getServiceHost() + teamoutline, jsonData.toJSONString());
    }


    @RequestMapping(value = "/ris/regm/reqinfo")
    @ResponseBody
    public JSONObject toReqinfo(HttpServletRequest request) {
        JSONObject jsonData = CommonUtils.getJsonObjFromRequest(request);

        return CommonUtils.doPostRequest(commonProperties.getServiceHost() + reqinfo, jsonData.toJSONString());
    }

    @RequestMapping(value = "/ris/regm/holdnum")
    @ResponseBody
    public JSONObject toHoldnum(HttpServletRequest request) {
        JSONObject jsonData = CommonUtils.getJsonObjFromRequest(request);

        return CommonUtils.doPostRequest(commonProperties.getServiceHost() + holdnum, jsonData.toJSONString());
    }

    @RequestMapping(value = "/ris/regm/incdecnum")
    @ResponseBody
    public JSONObject toIncdecnum(HttpServletRequest request) {
        JSONObject jsonData = CommonUtils.getJsonObjFromRequest(request);

        return CommonUtils.doPostRequest(commonProperties.getServiceHost() + incdecnum, jsonData.toJSONString());
    }

    @RequestMapping(value = "/ris/regm/signprtregnote")
    @ResponseBody
    public JSONObject toSignprtregnote(HttpServletRequest request) {
        JSONObject jsonData = CommonUtils.getJsonObjFromRequest(request);

        return CommonUtils.doPostRequest(commonProperties.getServiceHost() + signprtregnote, jsonData.toJSONString());
    }

    @RequestMapping(value = "/ris/regm/giveupnum")
    @ResponseBody
    public JSONObject toGiveupnum(HttpServletRequest request) {
        JSONObject jsonData = CommonUtils.getJsonObjFromRequest(request);

        return CommonUtils.doPostRequest(commonProperties.getServiceHost() + giveupnum, jsonData.toJSONString());
    }

    @RequestMapping(value = "/ris/regm/teaminfo")
    @ResponseBody
    public JSONObject toTeaminfo(HttpServletRequest request) {
        JSONObject jsonData = CommonUtils.getJsonObjFromRequest(request);

        return CommonUtils.doPostRequest(commonProperties.getServiceHost() + teaminfo, jsonData.toJSONString());
    }

    @RequestMapping(value = "/sh/signin")
    @ResponseBody
    public JSONObject toSignin(HttpServletRequest request) {
        JSONObject jsonData = CommonUtils.getJsonObjFromRequest(request);

        return CommonUtils.doPostRequest(commonProperties.getServiceHost() + signin, jsonData.toJSONString());
    }

    @RequestMapping(value = "/sh/reqinfobynpguid")
    @ResponseBody
    public JSONObject toReqinfobynpguid(HttpServletRequest request) {
        JSONObject jsonData = CommonUtils.getJsonObjFromRequest(request);

        return CommonUtils.doPostRequest(commonProperties.getServiceHost() + reqinfobynpguid, jsonData.toJSONString());
    }

    @RequestMapping(value = "/ris/regm/setregtype")
    @ResponseBody
    public JSONObject toSetregtype(HttpServletRequest request) {
        JSONObject jsonData = CommonUtils.getJsonObjFromRequest(request);

        return CommonUtils.doPostRequest(commonProperties.getServiceHost() + setregtype, jsonData.toJSONString());
    }

    @RequestMapping(value = "/currentTime")
    @ResponseBody
    public JSONObject toCurrentTime(HttpServletRequest request) {
        JSONObject jsonData = CommonUtils.getJsonObjFromRequest(request);

        return CommonUtils.doPostRequest(commonProperties.getServiceHost() + currentTime, jsonData.toJSONString());
    }

}
