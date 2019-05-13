package com.hehai.ssm.web;

import ch.qos.logback.classic.Logger;
import com.alibaba.fastjson.JSONObject;
import com.hehai.ssm.dto.AppointExecution;
import com.hehai.ssm.dto.Result;
import com.hehai.ssm.entity.Book;
import com.hehai.ssm.enums.AppointStateEnum;
import com.hehai.ssm.exception.NoNumberException;
import com.hehai.ssm.exception.RepeatAppointException;
import com.hehai.ssm.service.BookService;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

/**
 * 图书相关Controller
 * url规范:/模块/资源/{id}/细分
 * 比如：/book/list
 *
 * @author Stable
 */
@Controller
@RequestMapping("/book")
public class BookController {

    private Logger logger = (Logger) LoggerFactory.getLogger(this.getClass());

    @Autowired
    private BookService bookService;

    @RequestMapping(value = "/list", method = RequestMethod.GET)
    public String list(Model model) {
        List<Book> list = bookService.getList();
        model.addAttribute("list", list);

        logger.info("list={}", list);

        return "list";
    }

    @RequestMapping(value = "/list_json", method = RequestMethod.GET, produces = {"application/json;charset=utf-8"})
    @ResponseBody
    public List<Book> listJson(Model model) {
        return bookService.getList();
    }

    @RequestMapping(value = "/book_json", method = RequestMethod.GET, produces = {"application/json;charset=utf-8"})
    @ResponseBody
    public List<JSONObject> bookJson() {
        List<JSONObject> list = new ArrayList<>();

        JSONObject jsonObject1 = new JSONObject();
        jsonObject1.put("bookId", 1011);
        jsonObject1.put("number", 9);
        jsonObject1.put("name", "机械原理");

        JSONObject jsonObject2 = new JSONObject();
        jsonObject2.put("bookId", 1012);
        jsonObject2.put("number", 9);
        jsonObject2.put("name", "机械原理");

        JSONObject jsonObject3 = new JSONObject();
        jsonObject3.put("bookId", 1013);
        jsonObject3.put("number", 9);
        jsonObject3.put("name", "机械原理");

        list.add(jsonObject1);
        list.add(jsonObject3);
        list.add(jsonObject2);


        return list;
    }

    @RequestMapping(value = "/{bookId}/detail", method = RequestMethod.GET)
    public String detail(@PathVariable("bookId") Long bookId, Model model) {
        if (bookId == null) {
            return "redirect:/book/list";
        }
        Book book = bookService.getById(bookId);
        if (book == null) {
            return "redirect:/book/list";
        }
        model.addAttribute("book", book);

        return "detail";
    }

    @RequestMapping(value = "/{bookId}/appoint", method = RequestMethod.POST, produces = {"application/json; charset=utf-8"})
    @ResponseBody
    public Result<AppointExecution> appoint(@PathVariable("bookId") Long bookId, @RequestParam("studentId") Long studentId) {
        if (studentId == null) {
            return new Result<>(false, "学号不能为空");
        }
        // AppointExecution execution = bookService.appoint(bookId, studentId);//错误写法，不能统一返回，要处理异常（失败）情况
        AppointExecution execution;
        try {
            execution = bookService.appoint(bookId, studentId);
        } catch (NoNumberException e) {
            execution = new AppointExecution(bookId, AppointStateEnum.NO_NUMBER);
        } catch (RepeatAppointException e) {
            execution = new AppointExecution(bookId, AppointStateEnum.REPEAT_APPOINT);
        } catch (Exception e) {
            execution = new AppointExecution(bookId, AppointStateEnum.INNER_ERROR);
        }
        return new Result<>(true, execution);
    }

}