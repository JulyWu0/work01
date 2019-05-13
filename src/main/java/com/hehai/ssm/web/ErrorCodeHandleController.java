package com.hehai.ssm.web;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * @author Stable
 */
@Controller
@RequestMapping("/error")
public class ErrorCodeHandleController {

    @RequestMapping("/400")
    public String handle1(Model model) {
        model.addAttribute("msg", "400");
        return "error";
    }

    @RequestMapping("/404")
    public String handle2(Model model) {
        model.addAttribute("msg", "404");
        return "error";
    }

    @RequestMapping("/500")
    public String handle3(Model model) {
        model.addAttribute("msg", "500");
        return "error";
    }

}
