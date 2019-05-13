//申请单信息变量存储
var reqinfo = {};
//检查项目字典变量存储
//20190123：不缓存检查项目
/*var eitemDic = {};*/
//检查类型初始化数据变量存储
var examTypeDic = {};
//供补打条码使用的reqinfo数据变量存储
var reqinfoForPrintBarcode = {};
//方便加号操作弹出层初始化诊室下拉选择框的数据变量存储
var teamDic = {};
//方便查看号池弹出层初始化时段单选按钮
var scheDic = {};
//供弃号的reqinfo数据变量存储
var reqinfoForGiveUpNum = {};
//供修改预约的reqinfo数据变量存储
var reqinfoForModifyReg = {};
//供签到的reqinfo数据变量存储
var reqinfoForSignin = {};
//供设置预约类型的reqinfo数据变量存储
var reqinfoForSetregtype = {};
//是否进入了修改模式的标志
var isInModifyRegMode = false;
$(function () {
    /*初始化*/
    //就诊卡号输入框获得焦点
    $("#cardNumInput").focus();
    //初始化layui的日期插件.预约日期
    layui.use('laydate', function () {
        var laydate = layui.laydate;
        var now = new Date();
        var defaultDateValue = now.getFullYear() + '-' + lay.digit(now.getMonth() + 1) + '-' + lay.digit(now.getDate());
        //设置默认日期值到隐藏域输入框
        $("#scheduleDateInput").val(defaultDateValue);

        laydate.render({
            elem: '#scheduleDatePicker',
            position: 'static',
            btns: ['now'],//默认三个都显示 clear、now、confirm
            value: defaultDateValue,
            min: defaultDateValue,
            //选择完毕后的回调
            done: function (value, date, endDate) {
                // console.log(value); //得到日期生成的值，如：2017-08-18
                // console.log(date); //得到日期时间对象：{year: 2017, month: 8, date: 18, hours: 0, minutes: 0, seconds: 0}
                // console.log(endDate); //得结束的日期时间对象，开启范围选择（range: true）才会返回。对象成员同上。
                //更新星期几的显示-20190117:使用了固定的日期控件，就不用去显示星期了
                // updateWeekShow(date);
                //更新隐藏域的数据--注意date的月份从1开始
                $("#scheduleDateInput").val(date.year + '-' + lay.digit(date.month) + '-' + lay.digit(date.date));
                //更新预约信息的显示
                updateReceptionSummary();
                //更新诊室开启情况
                updateAvailableTeam();
            }
        });
    });
    //更新星期几的显示-20190117:使用了固定的日期控件，就不用去显示星期了
    // updateWeekShow(null);
    //初始化渲染所有表单组件
    layui.use('form', function () {
        var form = layui.form;

        form.render();
    });

    //进度条依赖 element 模块，否则无法进行正常渲染和功能性操作
    layui.use('element', function () {
        var element = layui.element;
    });

    //清空就诊卡号输入框内容
    $("#clearCardNumInput").on('click', function () {
        //清空输入框
        $("#cardNumInput").val('');
        //退出修改预约模式
        exitModifyRegMode();
        //清空检查项目区域的显示
        $("#examItemContent").html('');
        //清空注意事项区域的显示
        $("#precautions").html('');
        //禁用时段选择--20190116：时段一直都可以选择
        // disableScheduleRadio();
        //禁用诊室选择
        disableTeamCheckbox();
        //清空已选择的summary
        updateReceptionSummary();
        updatePatInfoSummary();
        updateRegAbleEitemSummary(-1);
        updateCheckedEitemSummary(-1);

        //卡号输入框获得焦点
        $("#cardNumInput").focus();
    });

    /**
     * 使用 jQuery Hotkeys
     * 绑定快捷键 F2 ，快速清空输入框
     * 由于光标处于输入框的时候，快捷键不起作用，所以给输入框也绑定键盘按键事件
     */
    //重新刷卡快捷键
    $(document).bind('keydown.f2', function () {
        $("#clearCardNumInput").click();
    });
    $("input[type='text']").bind('keydown.f2', function () {
        $("#clearCardNumInput").click();
    });
    //预约快捷键
    $(document).bind('keydown.f7', function () {
        $("#operate_reg_btn").click();
    });
    $("input[type='text']").bind('keydown.f7', function () {
        $("#operate_reg_btn").click();
    });
    //扫码签到快捷键
    $(document).bind('keydown.f8', function () {
        $("#signinByBarcode").click();
    });
    $("input[type='text']").bind('keydown.f8', function () {
        $("#signinByBarcode").click();
    });
    //继续扫码签到快捷键--放到弹出层函数中，生成元素之后再绑定
    /*$(document).bind('keydown.f9', function () {
        //继续签到，清空输入框，输入框获取焦点，清空签到结果
        $("#signin_by_barcode_input").val('');
        $("#signinResultSummary").html('');
        $("#signin_by_barcode_input").focus();
    });
    $("input[type='text']").bind('keydown.f9', function () {
        //继续签到，清空输入框，输入框获取焦点，清空签到结果
        $("#signin_by_barcode_input").val('');
        $("#signinResultSummary").html('');
        $("#signin_by_barcode_input").focus();
    });*/

    /*执行操作*/

    //传入就诊卡号，预约的第一步
    //通过就诊卡号查询申请单信息：reqinfo
    //20190114：回车启动查询
    // $("#cardNumInput").on('input', function () {
    $("#cardNumInput").bind('keydown.return', function () {
        queryByCardNum();
    });
    //按钮点击查询
    /*$("#queryByCardNumInput").on('click', function () {
        queryByCardNum();
    });*/

    //给所有弹出层的退出按钮绑定Esc快捷键，其实就是按Esc的时候执行代码 layer.closeAll();
    //退出快捷键--注意扫码签到弹出层，弹出之后焦点在输入框，这里绑定的事件就会失效
    $(document).bind('keydown.esc', function () {
        layer.closeAll();
    });
    $("input[type='text']").bind('keydown.esc', function () {
        layer.closeAll();
    });

//layui的checkbook事件绑定
//勾选了检查项目之后，更新可预约诊室
//注意！使用了layui后，原先对checkbox设置的点击事件是没有效果的
//点击检查项目的checkbox，禁用不是同一个申请单的的检查项目，根据项目、日期、时段更新诊室的情况
    //20190404：绑定事件，点击多选框等于点击旁边的 选择/取消按钮。不能单个选择项目
    layui.form.on('checkbox(examItem)', function (data) {
        //渲染
        layui.form.render('checkbox', 'examItemFatherDiv');
        //需要不在修改预约的模式下才进这段逻辑
        if (isInModifyRegMode === false) {
            //一个申请单的项目不能单个选择。为了屏蔽多选框本身的点击功能，将选择框的状态设置为相反，真正的选择/取消由按钮去实现
            if (data.elem.checked) {
                $(data.elem).prop('checked', false);
                $(data.othis).removeClass("layui-form-checked");
            } else {
                $(data.elem).prop('checked', true);
                $(data.othis).addClass("layui-form-checked");
            }
            //这个按钮click里面自带 updateAvailableTeam() 方法
            $(data.elem).parents(".oneReq").find('.selectUnselectBtns').click();
        } else {
            //如果被选中，则查询可预约的诊室和时段
            //根据项目、日期、时段 更新能够被预约的诊室
            updateAvailableTeam();
        }
    });

//诊室选中一个后，取消选中其他所有，并在上方给出提示信息，如：
//已选择：2019-01-12 上午 三诊室
    /**
     * 由于checkbox默认有点击事件,而且默认点击事件会比这个监听更早地触发，这个监听要做的就是将其它的没被点击的checkbox置为未选中
     * 这样处理，不知为何，变成了单选按钮，不可取消了。。。
     */
    layui.form.on('checkbox(examTeam)', function (data) {
        //20190117:当前背景色如果是黄色，切换为绿色，如果是绿色，切换为黄色。已选择的诊室背景显示为绿色
        var checkedTeamSpanEle = $(data.elem).parents('.layui-input-block').find('.layui-form-checkbox').find('span')[0];
        if ($(checkedTeamSpanEle).getBackgroundColor().toUpperCase() === '#FFCC66') {
            //如果为黄色，转为绿色
            $(checkedTeamSpanEle).css('background-color', '#88C057');
        } else if ($(checkedTeamSpanEle).getBackgroundColor().toUpperCase() === '#88C057') {
            //如果为绿色，转为黄色
            $(checkedTeamSpanEle).css('background-color', '#FFCC66');
        }

        //先将所有能够预约的诊室背景色置为黄色--比较复杂的一段jQuery选择器
        $("#teamContent").find('.layui-form-item').find('.layui-form-checkbox').not('.layui-disabled').not($(data.elem).parents('.layui-input-block').find('.layui-form-checkbox')).find('span').css('background-color', '#FFCC66');

        $("#teamContent").find('input[type=checkbox]').not(data.elem).prop("checked", false);
        $("#teamContent").find('.layui-form-checkbox').not(data.othis).removeClass("layui-form-checked");

        //选中当前。值和样式
        /*if (data.elem.checked) {
            $(data.elem).prop('checked', false);
            $(data.othis).removeClass("layui-form-checked");
        } else {
            $(data.elem).prop('checked', true);
            $(data.othis).addClass("layui-form-checked");
        }*/
        //选中的诊室id
        // console.log($("#teamContent .layui-form-checked").parents('.layui-form-item').prop('id'));
        // //选中的诊室名称
        // console.log($("#teamContent .layui-form-checked").prev().prev().prev().html());
        // console.log($("#teamContent .layui-form-checked").parents('.layui-form-item').prop('title'));
        //显示已经选择的信息     已选择：2019-01-12 上午 三诊室
        updateReceptionSummary();
    });


    /**
     * 切换时段的时候，也要更新诊室开启情况
     * ！！！注意事件绑定的filter是input元素的属性lay-filter的值
     * 而渲染是input所在父元素的lay-filter的值
     */
    layui.form.on('radio(scheduleNameRadio)', function () {
        //更新日期时段summary
        updateReceptionSummary();
        //还是与服务端交互一次
        updateAvailableTeam();
    });

    /**
     * 给精准预约的号码多选框绑定事件，使其功能表现为单选框
     * 注意绑定checkbox的lay-filter是在checkbox上的
     */
    layui.form.on('checkbox(specifyNum)', function (data) {
        //取消选中其它，本身点击的这个可以让其自身的点击事件起作用
        $("#specifyNumForm").find('input[type=checkbox]').not(data.elem).prop("checked", false);
        $("#specifyNumForm").find('.layui-form-checkbox').not(data.othis).removeClass("layui-form-checked");
        //更新已选择summary
        var checkedSpecify = $("#specifyNumForm input:checked");//注意返回的是数组！！！
        if (!checkedSpecify || checkedSpecify.length <= 0) {
            //没有选择
            $("#checkedSpecifyNumSummary").html('已选择：');
        } else {
            //已经选择
            var checkedSpecifyNum = checkedSpecify.val();
            $("#checkedSpecifyNumSummary").html('已选择：' + checkedSpecifyNum + '号');
        }
    });

    /**
     * 给修改急诊的多选框绑定事件，点击多选框等于点击旁边的 选择/取消按钮
     */
    layui.form.on('checkbox(examItemForSetregtype)', function (data) {
        //为了屏蔽多选框本身的点击功能，将选择框的状态设置为相反，真正的选择/取消由按钮去实现
        if (data.elem.checked) {
            $(data.elem).prop('checked', false);
            $(data.othis).removeClass("layui-form-checked");
        } else {
            $(data.elem).prop('checked', true);
            $(data.othis).addClass("layui-form-checked");
        }
        $(data.elem).parents(".oneReq").find('.selectUnselectBtns').click();
    });

    /**
     * 如果是切换了日期，则需要重新请求reg接口
     */
//在日期控件的回调函数中完成。

    /**
     * 修改院区和检查类型按钮
     */
    $("#changeHospEtype").on('click', function () {
        //设置院区、检查类型
        //20190122：为防止不经意间修改，屏蔽这个修改功能。如果要改，手动将localStorage的hospid删除，刷新页面进行修改
        /*setHospEtype();*/
        layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>请联系管理员!');

        //清空输入框，模拟点击
        // $("#clearCardNumInput").click();
        //20190114：模拟点击的方法中有输入框获取焦点的代码，但是实际中可能由于时间的原因，输入框获取不了焦点
        //！！！注意，不应该在这里获取焦点，而应该是在弹出的层中点确定才执行模拟点击。
    });

    /**
     * 点击切换诊室列表的 li 标签时更新诊室概览
     */
    $("#teamTitle").on('click', 'li', function () {
        //更新诊室概览
        updateAvailableTeam();
    });


    /**
     * 几个按钮的事件绑定
     *
     * 执行精准预约:
     *  1.弹出层选择精确的号
     *  2.选中之后执行预约
     * 精准预约代码：1
     *
     * 20190222：在这里就要进行选择了几个单子的检查项目的判断工作，目前暂时限制精准预约的操作只能选择一个单子的项目。
     */
    $("#specify_operate_reg_btn").on('click', function () {
        //拼凑诊室号池详情的内容
        //依次判断 项目、预约时间、预约时段、预约诊室是否选择
        if (!$("#cardNumInput").val()) {
            //卡号未输入
            layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>请刷卡或输入就诊卡号！');
            //输入框获得焦点
            $("#cardNumInput").val('');
            $("#cardNumInput").focus();
            return;
        }
        //20190222：判断是否选择检查项目之后继续判断选择了几个单子的项目
        if (!$("#examItemContent input:checked").val()) {
            //项目未选择
            layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>请选择检查项目！');
            return;
        }
        if (!$("#scheduleDateInput").val()) {
            //预约日期未选择
            layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>请选择预约日期！');
            return;
        } else if (!$("#scheduleName input:checked").val()) {
            //预约时段未选择
            layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>请选择预约时段！');
            return;
        } else if (!$("#team_area input:checked").val()) {
            //预约诊室未选择
            layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>请选择预约诊室！');
            return;
        }
        //都已经选择了
        var checkedScheduleDate = $("#scheduleDateInput").val();
        var checkedScheduleGUID = $("#scheduleName input:checked").val();
        var checkedScheduleName = $("#scheduleName input:checked").prop('title');
        var checkedScheduleTeamGUID = $("#team_area input:checked").parents('.layui-form-item').prop('id');
        var checkedScheduleTeamName = $("#team_area input:checked").parents('.layui-form-item').find('.team-name').html();
        //访问诊室详情接口
        $.ajax({
            url: param.teaminfo,
            contentType: 'application/json; charset=UTF-8',//设置头格式
            data: JSON.stringify({
                "teamguid": checkedScheduleTeamGUID,
                "schedate": checkedScheduleDate,
                "scheguid": checkedScheduleGUID,
                "hospid": localStorage.getItem(param.hospid_key),
                "examtype": localStorage.getItem(param.etypecode_key)
            }),
            type: "POST",
            dataType: "json",
            success: function (result) {
                if (result.returncode === 0) {
                    //成功返回
                    var teaminfo = result;
                    //首先判断是否关闭
                    var teamisoff = teaminfo.teamisoff;
                    if (teamisoff === true) {
                        //如果关闭了，函数结束，弹出提醒
                        $("#specifyNumForm").html('');
                        layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>该诊室已经关闭！');
                        return;
                    }
                    //使用一个数组来标志当前号是否可用
                    var totalnum = teaminfo.teampresetnum + teaminfo.teamincdecnum;
                    var reservenum = teaminfo.teamreservednum;
                    var teamusednumlist = teaminfo.teamusednumlist;
                    //初始化一个数组来记录指定位置的号是否可用。true和false
                    var teamnumStateArr = [];
                    //默认都可用
                    for (var teamnumIdx = 0; teamnumIdx < totalnum; teamnumIdx++) {
                        teamnumStateArr[teamnumIdx] = true;
                    }
                    //循环使用过的号，标记为不可用的号
                    for (var teamusednumlistIdx = 0; teamusednumlistIdx < teamusednumlist.length; teamusednumlistIdx++) {
                        var oneUsednum = teamusednumlist[teamusednumlistIdx];
                        //循环起始点，标记不可用
                        for (var usednum = oneUsednum.numstart; usednum <= oneUsednum.numend; usednum++) {
                            teamnumStateArr[usednum - 1] = false;
                        }
                    }
                    //已经是标记了可用和不可用状态的诊室号池详情数组
                    //根据数组和预留号生成显示号池情况的html代码
                    var teamnumStateContent = '' +
                        '<span class="summary">' + checkedScheduleDate + ' ' + checkedScheduleName + ' ' + checkedScheduleTeamName + ' </span>' + '<span class="summary" id="specifyTotalNumSummary">总计：' + totalnum + '个号，其中基础' + teaminfo.teampresetnum + '个号，' + (teaminfo.teamincdecnum >= 0 ? '加' : '减') + Math.abs(teaminfo.teamincdecnum) + '个号。目前有' + teaminfo.teamwaitnum + '个号等待就诊</span><span class="summary" id="checkedSpecifyNumSummary">已选择：</span>' +
                        '<form class="layui-form" lay-filter="specifyNumForm" id="specifyNumForm" action="">' +
                        '  <div class="layui-form-item" pane="">' +
                        '    <div class="layui-input-block">';

                    for (var teamnumStateIdx = 0; teamnumStateIdx < teamnumStateArr.length; teamnumStateIdx++) {
                        if (teamnumStateArr[teamnumStateIdx] === true) {
                            //号 有效
                            teamnumStateContent += '<input type="checkbox" name="specifyNum" lay-filter="specifyNum" lay-skin="primary" value="' + (teamnumStateIdx + 1) + '">';
                        } else if (teamnumStateArr[teamnumStateIdx] === false) {
                            //号 无效
                            teamnumStateContent += '<input type="checkbox" name="specifyNum" lay-filter="specifyNum" lay-skin="primary" value="' + (teamnumStateIdx + 1) + '" disabled>';
                        }
                        //十个一行
                        if (teamnumStateIdx % param.teaminfoNumCols === param.teaminfoNumCols - 1) {
                            teamnumStateContent += '<br/>';
                        }
                    }

                    teamnumStateContent += '' +
                        '    </div>' +
                        '  </div>' +
                        '</form>';
                    //给多选框绑定事件，变成单选框

                    //弹出层，显示诊室详情
                    layer.open({
                        type: 1
                        , title: '选择需要精准预约的号码（圆形为预留号码）'
                        , area: ['60%', '70%']
                        , offset: 'auto' //具体配置参考：offset参数项
                        , content: teamnumStateContent
                        , btn: ['取消(Esc)', '确认精准预约']
                        , btnAlign: 'c' //按钮居中
                        , yes: function () {
                            layer.closeAll();
                        }
                        , btn2: function () {
                            //选择号码之后，指定号码预约
                            var checkedSpecifyNum = $("#specifyNumForm input:checked");
                            //返回的是数组
                            if (!checkedSpecifyNum || checkedSpecifyNum.length <= 0) {
                                layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>请选择所要预约的号码！');
                                return false;
                            }
                            //如果已经选中了，那些调用预约方法，在reginfo节点中加入numstart即可精准预约。
                            preOperateHoldnum(1);
                        }
                    });
                    //渲染表单
                    layui.form.render('checkbox', 'specifyNumForm');
                    //设置样式
                    //所有多选框的图标内容为号数
                    $("#specifyNumForm .layui-form-checkbox").each(function (i, n) {
                        $(n).find('i').prop('class', 'layui-icon');
                        $(n).find('i').css('color', '#d2d2d2');
                        $(n).find('i').html(i + 1);
                    });
                    if (reservenum > 0) {
                        //预留号突出显示--索引.。预留号为圆形(大圆角)。
                        $("#specifyNumForm .layui-form-checkbox i:eq(0)").css('border-radius', '20px');
                        $("#specifyNumForm .layui-form-checkbox i:lt(" + reservenum + "):gt(0)").css('border-radius', '20px');
                    }
                    //不可用的号设置图标为 layui-icon layui-icon-username ，背景色为 不可用 #ED7161
                    $("#specifyNumForm .layui-checkbox-disbaled i").prop('class', 'layui-icon layui-icon-username');
                    $("#specifyNumForm .layui-checkbox-disbaled i").html('');//否则是图标加号数
                    $("#specifyNumForm .layui-checkbox-disbaled i").css('background-color', '#ED7161');
                }
            },
            error: function () {
                layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>服务器忙！请稍后再试。</i>');
            }
        });
    });

    /**
     * 几个按钮的事件绑定
     *
     * 强制刷新，不从缓存加载
     */
    $("#forceRefreshBtn").on('click', function () {
            var href = window.location.href;
            if (href.indexOf("?") != -1) {
                href = href.split("?")[0];
            }
            window.location.href = href + "?v=" + new Date().getTime();
        }
    );

    /**
     * 几个按钮的事件绑定
     *
     * 查看更新日志
     */
    $("#showChangeLogBtn").on('click', function () {
            forcePopChangeLog();
        }
    );

    /**
     * 几个按钮的事件绑定
     *
     * 执行预约
     * 常规预约代码：0
     */
    $("#operate_reg_btn").on('click', function () {
            //调用执行预约函数
            preOperateHoldnum(0);
        }
    );

    /**
     * 准备参数，准备进行锁号
     * 独立出来，方便常规预约和精准预约调用，因为精准预约相对于常规预约就是多了个节点而已
     * 20190222：如果选中了多个单子的项目，那么精准预约和精准修改需要一个一个地按顺序进行预约，因为第二个单子的
     *          指定号数numstart依赖于第一个单子预约返回信息的numend。
     * @param regTypeCode 预约类型代码，0代表常规预约，1代表精准预约
     */
    function preOperateHoldnum(regTypeCode) {
        //依次判断 项目、预约时间、预约时段、预约诊室是否选择
        if (!$("#cardNumInput").val()) {
            //卡号未输入
            layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>请刷卡或输入就诊卡号！');
            //输入框获得焦点
            $("#cardNumInput").val('');
            $("#cardNumInput").focus();
            return;
        } else if (!$("#examItemContent input:checked").val()) {
            //项目未选择
            layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>请选择检查项目！');
            return;
        } else if (!$("#scheduleDateInput").val()) {
            //预约日期未选择
            layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>请选择预约日期！');
            return;
        } else if (!$("#scheduleName input:checked").val()) {
            //预约时段未选择
            layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>请选择预约时段！');
            return;
        } else if (!$("#team_area input:checked").val()) {
            //预约诊室未选择
            layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>请选择预约诊室！');
            return;
        }
        //都已经选择了
        var checkedScheduleDate = $("#scheduleDateInput").val();
        var checkedScheduleGUID = $("#scheduleName input:checked").val();
        var checkedScheduleName = $("#scheduleName input:checked").prop('title');
        var checkedScheduleTeamGUID = $("#team_area input:checked").parents('.layui-form-item').prop('id');
        var checkedScheduleTeamName = $("#team_area input:checked").parents('.layui-form-item').find('.team-name').html();

        //锁号所需要的参数
        var holdnumParam = {};

        if (isInModifyRegMode === false) {
            //没有在修改预约模式，那么正常预约
            //根据选中的项目的索引，得到eitemlist
            //获取所有被选中的检查项目，[[0,1],[1]] ,那么有多少个申请单就应该初始化多少个里层数组
            //外层数组的下标代表申请单的下标，里层数组的下标表示检查项目的下标
            var examItemsIdxArr = [];
            for (var reqIndex = 0; reqIndex < reqinfo.reqlist.length; reqIndex++) {
                examItemsIdxArr[reqIndex] = [];
            }
            $('#examItemContent input:checkbox').each(function () {
                if ($(this).prop('checked') === true) {
                    var checkedValue = $(this).val();
                    //检查项目的checkbox的value命名规则是：申请单下标-检查项目下标
                    var split = checkedValue.split("-");
                    examItemsIdxArr[split[0]].push(parseInt(split[1]));
                }
            });
            //在reqinfo的基础上改造改造即可锁号，加入reginfo节点
            holdnumParam.reqlist = [];
            //循环外层数组，拼凑参数
            //20190401：循环外定义非首次的下一次精准预约需要指定的起始号
            var nextSpecifyNumStart = 0;
            for (var reqIdx = 0, validReqIdx = 0; reqIdx < examItemsIdxArr.length; reqIdx++) {
                if (examItemsIdxArr[reqIdx].length <= 0) {
                    continue;
                }
                //拼凑一个申请单
                var req = reqinfo.reqlist[reqIdx];
                //深拷贝一个申请单json对象，不影响原来的reqinfo
                var reqForHoldnum = JSON.parse(JSON.stringify(req));
                //这个单子下面的检查项目eitemlist可能没有全选，所以要只拼凑选择了的检查项目
                //这里也要进行深拷贝
                var eitemlistForHoldnum = JSON.parse(JSON.stringify(reqForHoldnum.eitemlist));
                //置空检查项目
                reqForHoldnum.eitemlist = [];

                //20190401：当前单子选择的项目所占的总号数
                var checkedNumCountForCurrentReq = 0;
                for (var j = 0; j < examItemsIdxArr[reqIdx].length; j++) {
                    reqForHoldnum.eitemlist.push(eitemlistForHoldnum[examItemsIdxArr[reqIdx][j]]);
                    //选择的项目计数
                    checkedNumCountForCurrentReq += eitemlistForHoldnum[examItemsIdxArr[reqIdx][j]].eitemnumcount;
                }

                //构造reginfo节点
                var reginfo = {};
                reginfo.npdate = checkedScheduleDate;
                reginfo.scheguid = checkedScheduleGUID;
                reginfo.schename = checkedScheduleName;
                reginfo.teamguid = checkedScheduleTeamGUID;
                reginfo.teamname = checkedScheduleTeamName;
                //20190214:如果是精准预约，那么添加numstart节点
                if (regTypeCode === 1) {
                    //20190404：这里有bug，如果第一个内层数组为空，也就是第一个单子不选，那么进不了这个逻辑，所以需要另外定义一个变量
                    if (validReqIdx === 0) {
                        var specifyCheckedNumStart = parseInt($("#specifyNumForm input:checked").val());
                        //如果是第一次循环
                        reginfo.numstart = specifyCheckedNumStart;
                        //将选择的号赋值给下一次的变量
                        nextSpecifyNumStart = specifyCheckedNumStart;
                    } else {
                        //不是第一次循环，指定的号码的起始就不是选择的号码了
                        reginfo.numstart = nextSpecifyNumStart;
                    }
                    //无论如何，更新最新的精准预约项目起始号
                    nextSpecifyNumStart += checkedNumCountForCurrentReq;
                }

                //将reginfo节点添加到req
                reqForHoldnum.reginfo = reginfo;

                //将req设置到holdnumParam
                holdnumParam.reqlist.push(reqForHoldnum);
                //新定义的变量自增
                validReqIdx++;
            }
        } else {
            //由于是通过npguid去取消预约，那么就是一个条码一个条码地退，所以修改预约模式下，不能单个项目单个项目地改。
            //在修改预约模式下，那么首先取消预约再执行预约
            //弃号选中的检查
            var checkedModifyReg = $("#examItemContent input:checked");
            //取消预约选中的单子
            checkedModifyReg.each(function (i, n) {
                var reqIndexInReqinfoForModifyReg = $(n).val();
                //拼凑参数
                var req = reqinfoForModifyReg.reqlist[reqIndexInReqinfoForModifyReg];
                //打印条码成功的提示信息
                $.ajax({
                    async: false,
                    url: param.giveupnum,
                    contentType: 'application/json; charset=UTF-8',//设置头格式
                    data: JSON.stringify({
                        "npguid": req.npguid,
                        "examtype": localStorage.getItem(param.etypecode_key)
                    }),//将json对象转换成字符串
                    type: "POST",
                    dataType: "json",
                    success: function (result) {
                        //do something
                    },
                    error: function () {
                        layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>服务器忙！请稍后再试。</i>');
                    }
                });
            });
            //取消预约完成
            //拼凑锁号所需要的参数
            //在reqinfo的基础上改造改造即可锁号，加入reginfo节点
            holdnumParam.reqlist = [];
            //20190401：循环外定义非首次的下一次精准预约需要指定的起始号
            var nextSpecifyNumStart = 0;
            checkedModifyReg.each(function (i, n) {
                var reqIndexInReqinfoForModifyReg = $(n).val();
                //拼凑参数
                var req = reqinfoForModifyReg.reqlist[reqIndexInReqinfoForModifyReg];
                //深拷贝一个申请单json对象，不影响原来的reqinfo
                var reqForHoldnum = JSON.parse(JSON.stringify(req));

                //20190401：当前单子选择的项目所占的总号数
                var checkedNumCountForCurrentReq = 0;
                for (var j = 0; j < req.eitemlist.length; j++) {
                    checkedNumCountForCurrentReq += req.eitemlist[j].eitemnumcount;
                }

                //差一个reginfo节点
                //构造reginfo节点
                var reginfo = {};
                reginfo.npdate = checkedScheduleDate;
                reginfo.scheguid = checkedScheduleGUID;
                reginfo.schename = checkedScheduleName;
                reginfo.teamguid = checkedScheduleTeamGUID;
                reginfo.teamname = checkedScheduleTeamName;
                //20190214:(精准修改也要加入这个节点)如果是精准预约，那么添加numstart节点
                if (regTypeCode === 1) {
                    if (i === 0) {
                        var specifyCheckedNumStart = parseInt($("#specifyNumForm input:checked").val());
                        //如果是第一次循环
                        reginfo.numstart = specifyCheckedNumStart;
                        //将选择的号赋值给下一次的变量
                        nextSpecifyNumStart = specifyCheckedNumStart;
                    } else {
                        //不是第一次循环，指定的号码的起始就不是选择的号码了
                        reginfo.numstart = nextSpecifyNumStart;
                    }
                    //无论如何，更新最新的精准预约项目起始号
                    nextSpecifyNumStart += checkedNumCountForCurrentReq;
                }

                //将reginfo节点添加到req
                reqForHoldnum.reginfo = reginfo;

                //将req设置到holdnumParam
                holdnumParam.reqlist.push(reqForHoldnum);
            });

        }
        //锁号占号参数拼凑完毕，执行锁号操作
        // console.log(JSON.stringify(holdnumParam));
        //执行锁号操作
        operateHoldnum(holdnumParam);
    }

    /**
     * 执行锁号
     * 根据传入的锁号参数，执行锁号操作
     */
    function operateHoldnum(holdnumParam) {
        $.ajax({
            url: param.holdnum,
            contentType: 'application/json; charset=UTF-8',//设置头格式
            data: JSON.stringify(holdnumParam),//将json对象转换成字符串
            type: "POST",
            dataType: "json",
            success: function (result) {
                //201902123:一个“bug”，如果没有允许弹窗，那么打印之后的更新界面函数不会执行，导致可以重复预约
                //无论如何返回信息，都更新界面显示，再次调用查询接口
                queryByCardNum();
                if (result && result.returncode === 0) {
                    //从返回信息中提取必要的信息，打印条码
                    if (isInModifyRegMode === false) {
                        layer.msg('<i class="layui-icon layui-icon-ok pop-icon-success layui-circle"></i>预约成功！');
                    } else {
                        layer.msg('<i class="layui-icon layui-icon-ok pop-icon-success layui-circle"></i>修改预约成功！');
                    }
                    //传入执行锁号的结果，打印条码
                    printBarcodeByHoldnumResponse(result);
                } else {
                    if (isInModifyRegMode === false) {
                        layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>预约失败！' + (result == null ? '' : '信息：' + result.returnmsg));
                    } else {
                        layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>修改预约失败！' + (result == null ? '' : '信息：' + result.returnmsg));
                    }
                }
            },
            error: function () {
                layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>服务异常，请稍后再试！');
            }
        });
    }

    /**
     * 打印小票
     * 解析锁号操作的返回结果，进行打印小票
     * 20190221：已经预约了一个，再预约，之前预约的也会返回，但是有个特点：eiteamlist 数组为空
     * @param result
     */
    function printBarcodeByHoldnumResponse(result) {
        //打印条码
        var reqlist = result.reqlist;
        //201903034:二楼一次预约打印一张小票
        //所有的都以第一次循环的信息为准
        var patNameForOneBarcode = '';
        var patSexForOneBarcode = '';
        var patAgeStrForOneBarcode = '';
        var sendDeptForOneBarcode = '';
        var eitemStrForOneBarcode = '';
        var npdateForOneBarcode = '';
        var regedDescForOneBarcode = '';
        var recommendTimeForOneBarcode = '';
        var npguidsForOneBarcode = '';//用分号隔开
        var considerationsForOneBarcode = '';//注意事项，前方带换行符
        var considerationsForOneBarcodeArr = [];//方便注意事项去重
        for (var reqI = 0; reqI < reqlist.length; reqI++) {
            var req = reqlist[reqI];

            if (req.eitemlist.length <= 0) {
                continue;
            }
            //20190221：解决上的问题
            //*****基本信息*****
            var patname = req.patname;
            if (patNameForOneBarcode === '') {
                patNameForOneBarcode = patname;
            }
            //姓名
            var patsex = req.patsex;
            if (patSexForOneBarcode === '') {
                patSexForOneBarcode = patsex;
            }
            //性别
            var patage = req.patage;
            var patageunit = req.patageunit;
            if (patAgeStrForOneBarcode === '') {
                patAgeStrForOneBarcode = patage + patageunit;
            }
            //年龄
            var senddept = req.senddept;
            if (sendDeptForOneBarcode === '') {
                sendDeptForOneBarcode = senddept;
            }
            //注意事项
            var considerations = '';
            var considerationsArr = [];//方便注意事项去重
            //检查项目
            var eitemStr = "";
            for (var eitemI = 0; eitemI < req.eitemlist.length; eitemI++) {
                if (eitemI === req.eitemlist.length - 1) {
                    eitemStr += req.eitemlist[eitemI].eitemname;
                } else {
                    eitemStr += req.eitemlist[eitemI].eitemname + "；";
                }
                //20190410：当前单子项目的注意事项的获取以及去重
                var eitemdesc = req.eitemlist[eitemI].eitemdesc;
                if (eitemdesc && eitemdesc.trim() !== '' && considerationsArr.indexOf(eitemdesc) === -1) {
                    //新的，添加到数组，加到注意事项拼接
                    considerationsArr.push(eitemdesc);
                    //判断是不是第一条注意事项
                    if (considerations === '') {
                        considerations += '<br/>◉ ' + eitemdesc + "、";
                    } else {
                        considerations += eitemdesc + "、";
                    }
                }
                //20190410：所有单子项目的注意事项的获取以及去重
                if (eitemdesc && eitemdesc.trim() !== '' && considerationsForOneBarcodeArr.indexOf(eitemdesc) === -1) {
                    //新的，添加到数组，加到注意事项拼接
                    considerationsForOneBarcodeArr.push(eitemdesc);
                    if (considerationsForOneBarcode === '') {
                        considerationsForOneBarcode += '<br/>◉ ' + eitemdesc + "、";
                    } else {
                        considerationsForOneBarcode += eitemdesc + "、";
                    }
                }
            }
            //20190218：心超项目名称太长了，使用冒号分割，冒号之后的舍弃
            var idxOfName = eitemStr.indexOf("：");
            if (idxOfName === -1) {
                idxOfName = eitemStr.indexOf(":");
            }
            if (idxOfName !== -1) {
                eitemStr = eitemStr.substring(0, idxOfName);
            }
            //20190304：一个小票的逻辑
            if (reqI === reqlist.length - 1) {
                eitemStrForOneBarcode += eitemStr;
            } else {
                eitemStrForOneBarcode += eitemStr + '；';
            }
            //*****预约信息*****
            var returnReginfo = req.reginfo;
            //检查日期
            var npdate = returnReginfo.npdate;
            if (npdateForOneBarcode === '') {
                npdateForOneBarcode = npdate;
            }
            //检查地点
            var regedAddr = returnReginfo.teamtips;
            //已预约
            //20190301：腹部超声小票改为不打印预约号，只有时段
            var regedDesc = '';
            if (localStorage.getItem(param.etypecode_key) === 'US') {
                regedDesc = returnReginfo.teamname + " " + returnReginfo.schename;
            } else if (localStorage.getItem(param.etypecode_key) === 'CS') {
                regedDesc = returnReginfo.teamname + " " + returnReginfo.schename + " " + (returnReginfo.numstart == null ? '' : '<span style="font-weight: bold">' + returnReginfo.numstart + '</span> 号');
            }
            if (regedDescForOneBarcode === '') {
                regedDescForOneBarcode = regedDesc;
            }
            //20190223：推荐就诊时间
            var recommendTimeForCS = '';
            var recommendTimeForUS = '';
            var numstart = returnReginfo.numstart;
            var schename = returnReginfo.schename;
            if (localStorage.getItem(param.etypecode_key) === 'CS') {
                //四楼
                if (schename === '上午') {
                    if (numstart <= 6) {
                        recommendTimeForCS = '7:50 - 8:40';
                    } else if (numstart <= 12) {
                        recommendTimeForCS = '8:40 - 9:40';
                    } else if (numstart <= 18) {
                        recommendTimeForCS = '9:40 - 10:40';
                    } else {
                        recommendTimeForCS = '10:40 - 11:40';
                    }
                } else if (schename === '中午') {
                    recommendTimeForCS = '11:30 - 13:30';
                } else if (schename === '下午') {
                    if (numstart <= 6) {
                        recommendTimeForCS = '13:50 - 14:40';
                    } else if (numstart <= 12) {
                        recommendTimeForCS = '14:30 - 15:20';
                    } else if (numstart <= 18) {
                        recommendTimeForCS = '15:10 - 16:10';
                    } else {
                        recommendTimeForCS = '16:10 - 17:10';
                    }
                } else if (schename === '晚上') {
                    recommendTimeForCS = '17:00 - 19:00';
                }
            } else if (localStorage.getItem(param.etypecode_key) === 'US') {
                //二楼
                if (schename === '上午') {
                    if (numstart <= 25) {
                        recommendTimeForUS = '7:30 - 8:40';
                    } else if (numstart <= 35) {
                        recommendTimeForUS = '8:20 - 9:00';
                    } else if (numstart <= 45) {
                        recommendTimeForUS = '8:50 - 9:30';
                    } else if (numstart <= 65) {
                        recommendTimeForUS = '9:20 - 10:00';
                    } else if (numstart <= 80) {
                        recommendTimeForUS = '9:50 - 10:30';
                    } else if (numstart <= 90) {
                        recommendTimeForUS = '10:20 - 11:00';
                    } else {
                        recommendTimeForUS = '10:50 - 11:30';
                    }
                } else if (schename === '中午') {
                    if (numstart <= 15) {
                        recommendTimeForUS = '11:40 - 12:40';
                    } else {
                        recommendTimeForUS = '12:40 - 13:40';
                    }
                } else if (schename === '下午') {
                    if (numstart <= 20) {
                        recommendTimeForUS = '13:40 - 14:30';
                    } else if (numstart <= 30) {
                        recommendTimeForUS = '14:20 - 15:00';
                    } else if (numstart <= 40) {
                        recommendTimeForUS = '14:50 - 15:30';
                    } else if (numstart <= 50) {
                        recommendTimeForUS = '15:20 - 16:00';
                    } else if (numstart <= 60) {
                        recommendTimeForUS = '15:50 - 16:30';
                    } else {
                        recommendTimeForUS = '16:20 - 17:00';
                    }
                }
            }
            if (recommendTimeForOneBarcode === '') {
                if (localStorage.getItem(param.etypecode_key) === 'US') {
                    recommendTimeForOneBarcode = recommendTimeForUS;
                }
            }
            //当前队列等待人数
            var waitfornumcount = returnReginfo.waitfornumcount;
            //打印时间
            var now = new Date();
            var printdatetime = getFormattedDatetimeStr(now);
            //二维码内容
            var npguid = returnReginfo.npguid;
            //20190304：一个小票的逻辑
            if (reqI === reqlist.length - 1) {
                npguidsForOneBarcode += npguid;
            } else {
                npguidsForOneBarcode += npguid + ';';
            }
            //***********************信息准备完毕，打印************************
            //20190304：四楼的打印逻辑
            if (localStorage.getItem(param.etypecode_key) === 'CS') {
                //注意事项将最后一个顿号改成分号
                if (considerations.charAt(considerations.length - 1) === '、') {
                    considerations = considerations.substr(0, considerations.length - 1) + "；";
                }

                //清空原有打印区域内容
                $("#printAreaFatherDiv").html('');
                //生成html代码
                var printAreaHtmlContent = '' +
                    '    <div style="font-family:SimHei;">' +
                    '        <div style="text-align: center;font-size:14pt">' + localStorage.getItem(param.barcode_title_key) + '</div>' +
                    '        <div>' +
                    '            <div  style="display:block;">' +
                    '                <div style="display: none" id="barcode_qrcode">' +
                    '                    ' +
                    '                </div>' +
                    '                <div style="width: 30%;float: right;">' +
                    '                    <img id="barcode_qrcode_img"/>' +
                    '                </div>' +
                    '            </div>' +
                    '            <div style="display:block;font-size: 11pt;margin-top: 5pt">' +
                    '                <div>' +
                    '                    <span>基本信息：' + patname + ' ' + patsex + ' ' + patage + patageunit + '</span>' +
                    '                    <br/>' +
                    '                    <span>检查项目：' + eitemStr + '</span>' +
                    '                    <br/>' +
                    '                    <span>检查日期：<span style="font-weight:bold;font-size: 11pt;">' + npdate + '</span></span>' +
                    '                    <br/>' +
                    '                    <span>检查地点：' + regedAddr + '</span>' +
                    '                    <br/>' +
                    '                    <span>检查诊室：<span style="font-weight:bold;font-size: 11pt;">' + regedDesc + '</span></span>';
                if (localStorage.getItem(param.etypecode_key) === 'CS') {
                    printAreaHtmlContent += '                    <br/>' +
                        '                    <span>签到时间：<span style="border: 1px solid black;padding:0 2px 2px 2px">' + recommendTimeForCS + ' 按时签到,过时需重约</span></span>';
                } else if (localStorage.getItem(param.etypecode_key) === 'US') {
                    printAreaHtmlContent += '                    <br/>' +
                        '                    <span>签到时间：<span style="border: 1px solid black;padding:0 2px 2px 2px">' + recommendTimeForUS + ' 按时签到,过时需重约</span></span>';
                }
                /*if (returnReginfo.signin === true) {
                    printAreaHtmlContent += '                    <br/>' +
                        '                    <span>等待人数：' + waitfornumcount + ' 人</span>';
                }*/
                printAreaHtmlContent += '<br/>' +
                    '                    <br/>' +
                    '                    <span style="font-size: 10pt;">注意事项：</span>' +
                    '<div style="font-size: 6pt;">' + localStorage.getItem(param.considerations_key) + considerations + '</div>' +
                    '                </div>' +
                    '            </div>' +
                    '        </div>' +
                    '    </div>';
                //将内容设置到相应区域
                $("#printAreaFatherDiv").html(printAreaHtmlContent);
                //生成条码到 printArea
                $('#barcode_qrcode').qrcode({
                    width: 80,
                    height: 80,
                    text: npguid
                });
                //将canvas转为图片，否则打印空白
                var canvas = $("#barcode_qrcode canvas")[0];
                var qrcodeImg = canvas.toDataURL("image/png");
                $("#barcode_qrcode_img").prop('src', qrcodeImg);
                //调用打印api
                var printHtmlContent = $("#printAreaFatherDiv").html();
                printWebpage(printHtmlContent);
                //20190123:打印后通知服务端打印了小票
                notifyServerBarcodePrinted(npguid);
            }
        }
        //20190304：二楼的打印逻辑
        if (localStorage.getItem(param.etypecode_key) === 'US') {
            //注意事项将最后一个顿号改成分号
            if (considerationsForOneBarcode.charAt(considerationsForOneBarcode.length - 1) === '、') {
                considerationsForOneBarcode = considerationsForOneBarcode.substr(0, considerationsForOneBarcode.length - 1) + "；";
            }

            //清空原有打印区域内容
            $("#printAreaFatherDiv").html('');
            //生成html代码
            var printAreaHtmlContentForOneBarcode = '' +
                '    <div style="font-family:SimHei;">' +
                '        <div style="text-align: center;font-size:14pt">' + localStorage.getItem(param.barcode_title_key) + '</div>' +
                '        <div>' +
                '            <div  style="display:block;">' +
                '                <div style="display: none" id="barcode_qrcode">' +
                '                    ' +
                '                </div>' +
                '                <div style="width: 30%;float: right;">' +
                '                    <img id="barcode_qrcode_img"/>' +
                '                </div>' +
                '            </div>' +
                '            <div style="display:block;font-size: 11pt;margin-top: 5pt">' +
                '                <div>' +
                '                    <span>基本信息：' + patNameForOneBarcode + ' ' + patSexForOneBarcode + ' ' + patAgeStrForOneBarcode + '</span>' +
                '                    <br/>' +
                '                    <span>检查项目：' + eitemStrForOneBarcode + '</span>' +
                '                    <br/>' +
                '                    <span>检查日期：<span style="font-weight:bold;font-size: 11pt;">' + npdateForOneBarcode + '</span></span>' +
                '                    <br/>' +
                '                    <span>检查地点：' + regedAddr + '</span>' +
                '                    <br/>' +
                '                    <span>检查诊室：<span style="font-weight:bold;font-size: 11pt;">' + regedDescForOneBarcode + '</span></span>' +
                '                    <br/>' +
                '                    <span>签到时间：<span style="border: 1px solid black;padding:0 2px 2px 2px">' + recommendTimeForOneBarcode + ' 按时签到,过时需重约</span></span>' +
                '                   <br/>' +
                '                    <br/>' +
                '                    <span style="font-size: 10pt;">注意事项：</span>' +
                '                  <div style="font-size: 6pt;">' + localStorage.getItem(param.considerations_key) + considerationsForOneBarcode + '</div>' +
                '                </div>' +
                '            </div>' +
                '        </div>' +
                '    </div>';
            //将内容设置到相应区域
            $("#printAreaFatherDiv").html(printAreaHtmlContentForOneBarcode);
            //生成条码到 printArea
            $('#barcode_qrcode').qrcode({
                width: 80,
                height: 80,
                text: npguidsForOneBarcode.substr(0, 36)
            });
            //将canvas转为图片，否则打印空白
            var canvas = $("#barcode_qrcode canvas")[0];
            var qrcodeImg = canvas.toDataURL("image/png");
            $("#barcode_qrcode_img").prop('src', qrcodeImg);
            //调用打印api
            var printHtmlContentForOneBarcode = $("#printAreaFatherDiv").html();
            printWebpage(printHtmlContentForOneBarcode);
            //20190123:打印后通知服务端打印了小票
            notifyServerBarcodePrinted(npguidsForOneBarcode);
        }
    }

    /**
     * 几个按钮的事件绑定
     *
     * 修改预约
     * 并没有现成的修改预约的逻辑，实现逻辑为 先放弃预约，再重新预约
     */
    $("#operate_modify_reg_btn").on('click', function () {
        if (isInModifyRegMode === false) {
            //没有进入预约模式，那么点击进入
            //按照取消预约的单子排列重新显示检查项目区域
            //置空修改预约所用reqinfo全局变量--使用同一个全局变量
            reqinfoForModifyReg = {};
            //获取卡号
            var cardNum = $("#cardNumInput").val();
            if (cardNum && '' !== cardNum.trim()) {
                cardNum = cardNum.trim();
                //执行Ajax请求，获取申请单信息
                $.ajax({
                        async: false,
                        url: param.reqinfo,
                        contentType: 'application/json; charset=UTF-8',//设置头格式
                        data: JSON.stringify({"card": cardNum, "hospid": localStorage.getItem(param.hospid_key)}),//将json对象转换成字符串
                        type: "POST",
                        dataType: "json",
                        success: function (result) {
                            if (result && result.returncode === 0) {
                                //存储到修改预约全局变量
                                reqinfoForModifyReg = result;
                                //解析结果：属于当前检查类型、且有reginfo节点的、号池状态为N或Q的申请单可以弃号
                                var currentExamType = localStorage.getItem(param.etypecode_key);
                                var reqlist = result.reqlist;
                                var modifyAbleCount = 0;
                                var modifyAbleContent = '';

                                //这里是以reqlist中一个节点为单位的
                                for (var reqIdxForModifyReg = 0; reqIdxForModifyReg < reqlist.length; reqIdxForModifyReg++) {
                                    var req = reqlist[reqIdxForModifyReg];
                                    //20190308：新增了是否缴费的标识--要首先判断是否已经缴费
                                    var paid = req.paid;
                                    if (req.examtype === currentExamType && req.reginfo && (req.reginfo.npstatus === 'N' || req.reginfo.npstatus === 'Q')) {
                                        //每个单子显示 门诊/住院 ，普通/急诊
                                        //20190222：添加 0-门诊/1-住院，预约类型 0-普通/1-急诊
                                        var pattypecode = req.pattypecode;
                                        var pattype = '';
                                        if (pattypecode === '0') {
                                            pattype = '门诊';
                                        } else if (pattypecode === '1') {
                                            pattype = '住院';
                                        }
                                        var regtypecode = req.regtypecode;
                                        var regtype = '';
                                        if (regtypecode === '0') {
                                            regtype = '普通';
                                        } else if (regtypecode === '1') {
                                            regtype = '<span class="little-tips">急诊</span>';
                                        }

                                        //可修改预约
                                        //结构跟主界面展示检查项目类似，checkbox的值为申请单对象在reqinfo中的索引
                                        //获取申请单中的检查项目名称显示
                                        var eitemname = "";
                                        //20190401：占用号数
                                        var eitemnumcount = 0;
                                        for (var eitemIdxForModifyReg = 0; eitemIdxForModifyReg < req.eitemlist.length; eitemIdxForModifyReg++) {
                                            if (eitemIdxForModifyReg === req.eitemlist.length - 1) {
                                                eitemname += req.eitemlist[eitemIdxForModifyReg].eitemname;
                                            } else {
                                                eitemname += req.eitemlist[eitemIdxForModifyReg].eitemname + "；";
                                            }
                                            //占用号数
                                            eitemnumcount += req.eitemlist[eitemIdxForModifyReg].eitemnumcount;
                                        }

                                        //20190308：判断是否缴费了
                                        if (paid && paid === true) {
                                            modifyAbleContent += "<div class='oneReq'>" +
                                                //加一个开单时间
                                                "<div class='reqdatetime'>" + pattype + " " + regtype + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "开单时间：" + req.reqdatetime + "</div>";

                                            modifyAbleContent += '<div class="layui-input-block">' +
                                                '<input type="checkbox" name="reqForModifyReg" lay-filter="examItem" lay-skin="primary" value=' + reqIdxForModifyReg + ' data-eitemnumcount=' + eitemnumcount + ' title="' + eitemname + '">';
                                        } else {
                                            //未缴费
                                            modifyAbleContent += "<div class='oneReq'>" +
                                                //加一个开单时间
                                                "<div class='reqdatetime'><span class='not-paid'><i class='layui-icon layui-icon-close pop-icon-error layui-circle icon-close-not-paid'></i>未缴费&nbsp;&nbsp;</span>" + pattype + " " + regtype + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "开单时间：" + req.reqdatetime + "</div>";

                                            modifyAbleContent += '<div class="layui-input-block">' +
                                                '<input disabled type="checkbox" name="reqForModifyReg" lay-filter="examItem" lay-skin="primary" value=' + reqIdxForModifyReg + ' data-eitemnumcount=' + eitemnumcount + ' title="' + eitemname + '">';
                                        }

                                        if (req.reginfo.npstatus === 'N') {
                                            if (localStorage.getItem(param.etypecode_key) === 'CS') {
                                                modifyAbleContent += '<i class="layui-icon layui-icon-ok eitem-tips">已预约：' + req.reginfo.teamname + ' ' + req.reginfo.npdate + ' ' + req.reginfo.schename + ' ' + (req.reginfo.numstart == null ? '' : req.reginfo.numstart + '号') + '</i>';
                                            } else if (localStorage.getItem(param.etypecode_key) === 'US') {
                                                modifyAbleContent += '<i class="layui-icon layui-icon-ok eitem-tips">已预约：' + req.reginfo.teamname + ' ' + req.reginfo.npdate + ' ' + req.reginfo.schename + '</i>';
                                            }
                                        } else if (req.reginfo.npstatus === 'Q') {
                                            if (localStorage.getItem(param.etypecode_key) === 'CS') {
                                                modifyAbleContent += '<i class="layui-icon layui-icon-flag eitem-tips">已签到：' + req.reginfo.teamname + ' ' + req.reginfo.npdate + ' ' + req.reginfo.schename + ' ' + req.reginfo.numstart + ' 号</i>';
                                            } else if (localStorage.getItem(param.etypecode_key) === 'US') {
                                                modifyAbleContent += '<i class="layui-icon layui-icon-flag eitem-tips">已签到：' + req.reginfo.teamname + ' ' + req.reginfo.npdate + ' ' + req.reginfo.schename + ' ' + req.reginfo.signinnum + '号</i>';
                                            }
                                        }

                                        modifyAbleContent += '</div>';

                                        modifyAbleCount++;

                                        modifyAbleContent += '</div>';
                                    }
                                }
                                //数据准备完毕，显示到检查项目区域
                                if (modifyAbleCount === 0) {
                                    //没有可供修改预约的项目
                                    $("#examItemContent").html('<span class="tips-in-modify-reg-mode">没有可供修改预约的检查！</span>');
                                } else {
                                    $("#examItemContent").html(modifyAbleContent);
                                }
                                //20190404：默认选中所有。先选中，再渲染
                                $("#examItemContent input[name='reqForModifyReg']").not('input[disabled]').prop('checked', true);
                                layui.form.render('checkbox', 'examItemFatherDiv');
                                //模拟检查项目被选中的点击事件
                                updateAvailableTeam();
                                //进入修改预约模式
                                enterModifyRegMode();
                            } else {
                                layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>当前卡号没有可修改预约的检查！');
                            }
                        },
                        error: function () {
                            layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>服务器忙！请稍后再试。</i>');
                        }
                    }
                );
            } else {
                layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>请刷卡或输入就诊卡号！');
                //输入框获得焦点
                $("#cardNumInput").val('');
                $("#cardNumInput").focus();
            }
        } else {
            // exitModifyRegMode();
            //模拟输入框/查询按钮点击事件，自带退出修改预约模式的功能
            // $("#queryByCardNumInput").click();
            queryByCardNum();
        }
    });

    /**
     * 几个按钮的事件绑定
     *
     * 加号
     */
    $("#operate_add_num_btn").on('click', function () {
        //从主界面和全局变量teamDic中拼凑数据
        if (teamDic && teamDic.length > 0) {
            var teamListContent = '';
            //准备弹出层显示的内容
            teamListContent += '' +
                '<from class="layui-form" lay-filter="add_num_form">' +
                '  <div class="layui-form-item layer-form-position">' +
                '    <div class="layui-inline">' +
                '      <label class="layui-form-label">选择诊室</label>' +
                '      <div class="layui-input-inline">' +
                '       <select name="modules" id="addNumSelect" lay-filter="add_num_select" lay-verify="required" lay-search="">';

            for (var teamDicIdx = 0; teamDicIdx < teamDic.length; teamDicIdx++) {
                var team = teamDic[teamDicIdx];
                teamListContent += '<option value="' + team.teamguid + '">' + team.teamname + '</option>';
            }

            teamListContent += '' +
                '       </select>' +
                '      </div>' +
                '    </div>' +
                '    <div class="layui-inline" id="incOrDecBlock">' +
                '      <label class="layui-form-label">加减号操作</label>' +
                '      <div class="layui-input-inline">' +
                '       <select name="modules" id="incOrDec" lay-verify="required" lay-search="">' +
                '           <option value="">+加号</option>' +
                '           <option value="-">-减号</option>' +
                '       </select>' +
                '      </div>' +
                '    </div>' +
                '    <div class="layui-inline" id="incOrDecNumBlock">' +
                '      <label class="layui-form-label">加减号数量</label>' +
                '      <div class="layui-input-inline">' +
                '       <i class="layui-icon layui-icon-down layui-btn layui-btn-sm" onclick="toDecNumCount()"></i>' +
                '       <input type="text" id="addNumCountInput" name="addNumCount" value="0" readonly lay-verify="required" autocomplete="off" class="layui-input shorter-input">' +
                '       <i class="layui-icon layui-icon-up layui-btn layui-btn-sm" onclick="toIncNumCount()"></i>' +
                '      </div>' +
                '    </div>' +
                '  </div>' +
                '  <div class="layui-form-item layer-form-position add-num-summary">' +
                '   <span id="addNumSummary"></span>' +
                '  </div>' +
                '</form>';
            //弹出显示
            layer.open({
                type: 1
                , title: '选择需要加号的诊室'
                , area: ['80%', '65%']
                , offset: 'auto' //具体配置参考：offset参数项
                , content: teamListContent
                , btn: ['取消(Esc)', '确认加减号']
                , btnAlign: 'c' //按钮居中
                , yes: function () {
                    layer.closeAll();
                }
                , btn2: function () {
                    var absNumcount = $("#addNumCountInput").val();
                    if (absNumcount <= 0) {
                        layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>请输入有效的加减号数量！');
                        return false;
                    }
                    var incOrDec = $("#incOrDec option:selected").val();
                    //准备参数，准备加减号
                    var schedate = $("#scheduleDateInput").val();
                    var scheguid = $("#scheduleName input[name='scheduleName']:checked").val();
                    var teamguid = $("#addNumSelect option:selected").val();
                    var numcount = parseInt(incOrDec + absNumcount);
                    var userid = localStorage.getItem(param.etypecode_key) + "ReceptionUserID";
                    var usercode = localStorage.getItem(param.etypecode_key) + 'ReceptionUserCode';
                    var username = localStorage.getItem(param.etypecode_key) + 'ReceptionUserName';
                    var hospid = localStorage.getItem(param.hospid_key);
                    var examtype = localStorage.getItem(param.etypecode_key);

                    //拼凑参数，准备访问加减号接口
                    var incDecNumParam = {
                        "code": "incdecnum",
                        "desc": "加号",
                        "schedate": schedate,
                        "scheguid": scheguid,
                        "teamguid": teamguid,
                        "numcount": numcount,
                        "userid": userid,
                        "usercode": usercode,
                        "username": username,
                        "hospid": hospid,
                        "examtype": examtype
                    };

                    //参数准备完毕，访问接口，进行加减号操作
                    $.ajax({
                        async: false,
                        url: param.incdecnum,
                        contentType: 'application/json; charset=UTF-8',//设置头格式
                        data: JSON.stringify(incDecNumParam),//将json对象转换成字符串
                        type: "POST",
                        dataType: "json",
                        success: function (result) {
                            if (result && result.returncode === 0) {
                                //加减号成功

                                layer.msg('<i class="layui-icon layui-icon-ok pop-icon-success layui-circle"></i>加减号操作成功！');
                                //更新可用的诊室情况
                                updateAvailableTeam();
                            } else {
                                layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>加减号失败！' + (result == null ? '' : '信息：' + result.returnmsg));
                            }
                        },
                        error: function () {
                            layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>服务器忙！请稍后再试。');
                        }
                    });
                }
            });
            //根据加减号弹出层的选择诊室和主界面的预约日期、时段更新加减号summary
            updateAddNumSummary($("#addNumSelect option:selected").val());
            //渲染表单
            layui.form.render('select', 'add_num_form');
            //给诊室的下拉选择框绑定事件
            layui.form.on('select(add_num_select)', function (data) {
                //20190403:访问接口判断所选诊室是否已经关闭
                var checkedScheduleDate = $("#scheduleDateInput").val();
                var checkedScheduleGUID = $("#scheduleName input:checked").val();
                var checkedScheduleTeamGUID = $("#addNumSelect option:selected").val();
                //访问诊室详情接口
                $.ajax({
                    url: param.teaminfo,
                    contentType: 'application/json; charset=UTF-8',//设置头格式
                    data: JSON.stringify({
                        "teamguid": checkedScheduleTeamGUID,
                        "schedate": checkedScheduleDate,
                        "scheguid": checkedScheduleGUID,
                        "hospid": localStorage.getItem(param.hospid_key),
                        "examtype": localStorage.getItem(param.etypecode_key)
                    }),
                    type: "POST",
                    dataType: "json",
                    success: function (result) {
                        if (result.returncode === 0) {
                            //成功返回
                            var teaminfo = result;
                            //首先判断是否关闭
                            var teamisoff = teaminfo.teamisoff;
                            if (teamisoff === true) {
                                //如果关闭了，函数结束，弹出提醒
                                $("#numPoolDetailArea").html('');
                                layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>该诊室已经关闭！');
                                //屏蔽加减号选择，将加减号数量设置为0，summary显示为诊室已经关闭
                                $("#incOrDecBlock").addClass('none-display');
                                $("#incOrDecNumBlock").addClass('none-display');
                                $("#addNumCountInput").val('0');
                                $("#addNumSummary").html('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>该诊室已经关闭！');
                            } else {
                                //诊室可用
                                //放开加减号选择，将加减号数量设置为0
                                $("#incOrDecBlock").removeClass('none-display');
                                $("#incOrDecNumBlock").removeClass('none-display');
                            }
                        } else {
                            layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>返回数据错误！' + (result == null ? '' : '：' + result.returnmsg));
                        }
                    },
                    error: function () {
                        layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>服务器忙！请稍后再试。</i>');
                    }
                });
                //更新加减号的summary显示
                updateAddNumSummary(data.value);
            });
        } else {
            layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>没有诊室可以加号！');
        }

    });


    /**
     * 几个按钮的事件绑定
     *
     * 补打条码
     * 获取卡号输入框的值，查询reqinfo接口，从结果获取可打印的列表，让选择。
     *
     */
    $("#operate_print_barcode_btn").on('click', function () {
        //置空打条码全局变量
        reqinfoForPrintBarcode = {};
        //获取卡号
        var cardNum = $("#cardNumInput").val();
        if (cardNum && '' !== cardNum.trim()) {
            cardNum = cardNum.trim();
            //执行Ajax请求，获取申请单信息
            $.ajax({
                async: false,
                url: param.reqinfo,
                contentType: 'application/json; charset=UTF-8',//设置头格式
                data: JSON.stringify({"card": cardNum, "hospid": localStorage.getItem(param.hospid_key)}),//将json对象转换成字符串
                type: "POST",
                dataType: "json",
                success: function (result) {
                    if (result && result.returncode === 0) {
                        //存储到补打条码全局变量
                        reqinfoForPrintBarcode = result;
                        //解析结果：属于当前检查类型、且有reginfo节点的申请单可以打印条码
                        var currentExamType = localStorage.getItem(param.etypecode_key);
                        var reqlist = result.reqlist;
                        var printableBarcodeContent = '<fieldset class="layui-elem-field"><legend>以下为可供打印的条码</legend>' +
                            "<button type='button' class='layui-btn layui-btn-radius layui-btn-primary layui-btn-sm selectUnselectBtnsForBarcode' id='selectUnselectBtnsForBarcode' onclick='selectUnselectAllEitemForBarcode()'>全选/取消全选</button>" +
                            '<form class="layui-form" lay-filter="print_barcode_form" id="print_barcode_form">';
                        //可补打条码的计数，方便在没有可供打印条码的时候隐藏全选按钮
                        var printableBarcodeCount = 0;
                        for (var reqIdxForPrint = 0; reqIdxForPrint < reqlist.length; reqIdxForPrint++) {
                            var req = reqlist[reqIdxForPrint];
                            //20190308：是否缴费的判断
                            var paid = req.paid;
                            if (req.examtype === currentExamType && req.reginfo) {
                                //每个单子显示 门诊/住院 ，普通/急诊
                                //20190222：添加 0-门诊/1-住院，预约类型 0-普通/1-急诊
                                var pattypecode = req.pattypecode;
                                var pattype = '';
                                if (pattypecode === '0') {
                                    pattype = '门诊';
                                } else if (pattypecode === '1') {
                                    pattype = '住院';
                                }
                                var regtypecode = req.regtypecode;
                                var regtype = '';
                                if (regtypecode === '0') {
                                    regtype = '普通';
                                } else if (regtypecode === '1') {
                                    regtype = '<span class="little-tips">急诊</span>';
                                }

                                //可打印
                                //弹出层，列出可打印条码的申请单列表，选择然后打印。
                                //结构跟主界面展示检查项目类似，checkbox的值为申请单在reqinfo中的索引
                                //获取申请单中的检查项目
                                var eitemname = "";
                                for (var eitemIdxForPrint = 0; eitemIdxForPrint < req.eitemlist.length; eitemIdxForPrint++) {
                                    if (eitemIdxForPrint === req.eitemlist.length - 1) {
                                        eitemname += req.eitemlist[eitemIdxForPrint].eitemname;
                                    } else {
                                        eitemname += req.eitemlist[eitemIdxForPrint].eitemname + "；";
                                    }
                                }

                                //20190308：是否缴费
                                if (paid && paid === true) {
                                    printableBarcodeContent += "<div class='oneReq'>" +
                                        //加一个开单时间
                                        "<div class='reqdatetime'>" + pattype + " " + regtype + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "开单时间：" + req.reqdatetime + "</div>";

                                    printableBarcodeContent += '<div class="layui-input-block">' +
                                        '<input type="checkbox" name="reqForPrintBarcode" lay-filter="reqForPrintBarcode" lay-skin="primary" value=' + reqIdxForPrint + ' title="' + eitemname + '">';
                                } else {
                                    printableBarcodeContent += "<div class='oneReq'>" +
                                        //加一个开单时间
                                        "<div class='reqdatetime'><span class='not-paid'><i class='layui-icon layui-icon-close pop-icon-error layui-circle icon-close-not-paid'></i>未缴费&nbsp;&nbsp;</span>" + pattype + " " + regtype + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "开单时间：" + req.reqdatetime + "</div>";

                                    printableBarcodeContent += '<div class="layui-input-block">' +
                                        '<input disabled type="checkbox" name="reqForPrintBarcode" lay-filter="reqForPrintBarcode" lay-skin="primary" value=' + reqIdxForPrint + ' title="' + eitemname + '">';
                                }

                                if (req.reginfo.npstatus === 'N') {
                                    if (localStorage.getItem(param.etypecode_key) === 'CS') {
                                        printableBarcodeContent += '<i class="layui-icon layui-icon-ok eitem-tips">已预约：' + req.reginfo.teamname + ' ' + req.reginfo.npdate + ' ' + req.reginfo.schename + ' ' + (req.reginfo.numstart == null ? '' : req.reginfo.numstart + '号') + '</i>';
                                    } else if (localStorage.getItem(param.etypecode_key) === 'US') {
                                        printableBarcodeContent += '<i class="layui-icon layui-icon-ok eitem-tips">已预约：' + req.reginfo.teamname + ' ' + req.reginfo.npdate + ' ' + req.reginfo.schename + '</i>';
                                    }
                                } else if (req.reginfo.npstatus === 'Q') {
                                    if (localStorage.getItem(param.etypecode_key) === 'CS') {
                                        printableBarcodeContent += '<i class="layui-icon layui-icon-flag eitem-tips">已签到：' + req.reginfo.teamname + ' ' + req.reginfo.npdate + ' ' + req.reginfo.schename + ' ' + req.reginfo.numstart + ' 号</i>';
                                    } else if (localStorage.getItem(param.etypecode_key) === 'US') {
                                        printableBarcodeContent += '<i class="layui-icon layui-icon-flag eitem-tips">已签到：' + req.reginfo.teamname + ' ' + req.reginfo.npdate + ' ' + req.reginfo.schename + ' ' + req.reginfo.signinnum + '号</i>';
                                    }
                                }
                                printableBarcodeContent += '</div>';

                                printableBarcodeCount++;

                                printableBarcodeContent += '</div>';
                            }
                        }
                        printableBarcodeContent += "</form>";
                        printableBarcodeContent += "</fieldset>";
                        //数据准备完毕，弹出层弹出
                        layer.open({
                            type: 1
                            , title: '勾选需要打印的条码'
                            , area: ['80%', '65%']
                            , offset: 'auto' //具体配置参考：offset参数项
                            , content: printableBarcodeContent
                            , btn: ['取消(Esc)', '确认打印']
                            , btnAlign: 'c' //按钮居中
                            , yes: function () {
                                layer.closeAll();
                            }
                            , btn2: function () {
                                //打印选中的条码
                                var checkedBarcode = $("#print_barcode_form input:checked");
                                if (checkedBarcode.length <= 0) {
                                    layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>请选择要打印的条码！');
                                    return false;
                                }
                                //打印选中的条码
                                //201903034:二楼一次预约打印一张小票
                                //所有的都以第一次循环的信息为准
                                var patNameForOneBarcode = '';
                                var patSexForOneBarcode = '';
                                var patAgeStrForOneBarcode = '';
                                var sendDeptForOneBarcode = '';
                                var eitemStrForOneBarcode = '';
                                var npdateForOneBarcode = '';
                                var regedAddrForOneBarcode = '';
                                var regedDescForOneBarcode = '';
                                var recommendTimeForOneBarcode = '';
                                var npguidsForOneBarcode = '';//用分号隔开
                                var considerationsForOneBarcode = '';//注意事项，前方带换行符
                                var considerationsForOneBarcodeArr = [];//方便注意事项去重
                                checkedBarcode.each(function (i, n) {
                                    var reqIndexInReqinfoForPrintBarcode = $(n).val();
                                    //拼凑参数，打印条码
                                    var req = reqinfoForPrintBarcode.reqlist[reqIndexInReqinfoForPrintBarcode];
                                    //*****基本信息*****
                                    //姓名
                                    var patname = req.patname;
                                    if (patNameForOneBarcode === '') {
                                        patNameForOneBarcode = patname;
                                    }
                                    //性别
                                    var patsex = req.patsex;
                                    if (patSexForOneBarcode === '') {
                                        patSexForOneBarcode = patsex;
                                    }
                                    //年龄
                                    var patage = req.patage;
                                    var patageunit = req.patageunit;
                                    if (patAgeStrForOneBarcode === '') {
                                        patAgeStrForOneBarcode = patage + patageunit;
                                    }
                                    //申请科室
                                    var senddept = req.senddept;
                                    if (sendDeptForOneBarcode === '') {
                                        sendDeptForOneBarcode = senddept;
                                    }
                                    //注意事项
                                    var considerations = '';
                                    var considerationsArr = [];//方便注意事项去重
                                    //检查项目
                                    var eitemStr = "";
                                    for (var eitemI = 0; eitemI < req.eitemlist.length; eitemI++) {
                                        if (eitemI === req.eitemlist.length - 1) {
                                            eitemStr += req.eitemlist[eitemI].eitemname;
                                        } else {
                                            eitemStr += req.eitemlist[eitemI].eitemname + "；";
                                        }
                                        //20190410：当前单子项目的注意事项的获取以及去重
                                        var eitemdesc = req.eitemlist[eitemI].eitemdesc;
                                        if (eitemdesc && eitemdesc.trim() !== '' && considerationsArr.indexOf(eitemdesc) === -1) {
                                            //新的，添加到数组，加到注意事项拼接
                                            considerationsArr.push(eitemdesc);
                                            //判断是不是第一条注意事项
                                            if (considerations === '') {
                                                considerations += '<br/>◉ ' + eitemdesc + "、";
                                            } else {
                                                considerations += eitemdesc + "、";
                                            }

                                        }
                                        //20190410：所有单子项目的注意事项的获取以及去重
                                        if (eitemdesc && eitemdesc.trim() !== '' && considerationsForOneBarcodeArr.indexOf(eitemdesc) === -1) {
                                            //新的，添加到数组，加到注意事项拼接
                                            considerationsForOneBarcodeArr.push(eitemdesc);
                                            if (considerationsForOneBarcode === '') {
                                                considerationsForOneBarcode += '<br/>◉ ' + eitemdesc + "、";
                                            } else {
                                                considerationsForOneBarcode += eitemdesc + "、";
                                            }
                                        }
                                    }
                                    //20190218：心超项目名称太长了，使用冒号分割，冒号之后的舍弃
                                    var idxOfName = eitemStr.indexOf("：");
                                    if (idxOfName === -1) {
                                        idxOfName = eitemStr.indexOf(":");
                                    }
                                    if (idxOfName !== -1) {
                                        eitemStr = eitemStr.substring(0, idxOfName);
                                    }
                                    //20190304：一个小票的逻辑
                                    if (i === checkedBarcode.length - 1) {
                                        eitemStrForOneBarcode += eitemStr;
                                    } else {
                                        eitemStrForOneBarcode += eitemStr + '；';
                                    }
                                    //*****预约信息*****
                                    var returnReginfo = req.reginfo;
                                    //检查日期
                                    var npdate = returnReginfo.npdate;
                                    if (npdateForOneBarcode === '') {
                                        npdateForOneBarcode = npdate;
                                    }
                                    //检查地点
                                    var regedAddr = returnReginfo.teamtips;
                                    if (regedAddrForOneBarcode === '') {
                                        regedAddrForOneBarcode = regedAddr;
                                    }
                                    //已预约
                                    //20190301：腹部超声小票改为不打印预约号，只有时段
                                    var regedDesc = '';
                                    if (localStorage.getItem(param.etypecode_key) === 'US') {
                                        regedDesc = returnReginfo.teamname + " " + returnReginfo.schename;
                                    } else if (localStorage.getItem(param.etypecode_key) === 'CS') {
                                        regedDesc = returnReginfo.teamname + " " + returnReginfo.schename + " " + (returnReginfo.numstart == null ? '' : '<span style="font-weight: bold">' + returnReginfo.numstart + '</span> 号');
                                    }
                                    if (regedDescForOneBarcode === '') {
                                        regedDescForOneBarcode = regedDesc;
                                    }
                                    //20190223：推荐就诊时间
                                    var recommendTimeForCS = '';
                                    var recommendTimeForUS = '';
                                    var numstart = returnReginfo.numstart;
                                    var schename = returnReginfo.schename;
                                    if (localStorage.getItem(param.etypecode_key) === 'CS') {
                                        if (schename === '上午') {
                                            if (numstart <= 6) {
                                                recommendTimeForCS = '7:50 - 8:40';
                                            } else if (numstart <= 12) {
                                                recommendTimeForCS = '8:40 - 9:40';
                                            } else if (numstart <= 18) {
                                                recommendTimeForCS = '9:40 - 10:40';
                                            } else {
                                                recommendTimeForCS = '10:40 - 11:40';
                                            }
                                        } else if (schename === '中午') {
                                            recommendTimeForCS = '11:30 - 13:30';
                                        } else if (schename === '下午') {
                                            if (numstart <= 6) {
                                                recommendTimeForCS = '13:50 - 14:40';
                                            } else if (numstart <= 12) {
                                                recommendTimeForCS = '14:30 - 15:20';
                                            } else if (numstart <= 18) {
                                                recommendTimeForCS = '15:10 - 16:10';
                                            } else {
                                                recommendTimeForCS = '16:10 - 17:10';
                                            }
                                        } else if (schename === '晚上') {
                                            recommendTimeForCS = '17:00 - 19:00';
                                        }
                                    } else if (localStorage.getItem(param.etypecode_key) === 'US') {
                                        //二楼
                                        if (schename === '上午') {
                                            if (numstart <= 25) {
                                                recommendTimeForUS = '7:30 - 8:40';
                                            } else if (numstart <= 35) {
                                                recommendTimeForUS = '8:20 - 9:00';
                                            } else if (numstart <= 45) {
                                                recommendTimeForUS = '8:50 - 9:30';
                                            } else if (numstart <= 65) {
                                                recommendTimeForUS = '9:20 - 10:00';
                                            } else if (numstart <= 80) {
                                                recommendTimeForUS = '9:50 - 10:30';
                                            } else if (numstart <= 90) {
                                                recommendTimeForUS = '10:20 - 11:00';
                                            } else {
                                                recommendTimeForUS = '10:50 - 11:30';
                                            }
                                        } else if (schename === '中午') {
                                            if (numstart <= 15) {
                                                recommendTimeForUS = '11:40 - 12:40';
                                            } else {
                                                recommendTimeForUS = '12:40 - 13:40';
                                            }
                                        } else if (schename === '下午') {
                                            if (numstart <= 20) {
                                                recommendTimeForUS = '13:40 - 14:30';
                                            } else if (numstart <= 30) {
                                                recommendTimeForUS = '14:20 - 15:00';
                                            } else if (numstart <= 40) {
                                                recommendTimeForUS = '14:50 - 15:30';
                                            } else if (numstart <= 50) {
                                                recommendTimeForUS = '15:20 - 16:00';
                                            } else if (numstart <= 60) {
                                                recommendTimeForUS = '15:50 - 16:30';
                                            } else {
                                                recommendTimeForUS = '16:20 - 17:00';
                                            }
                                        }
                                    }
                                    if (recommendTimeForOneBarcode === '') {
                                        if (localStorage.getItem(param.etypecode_key) === 'US') {
                                            recommendTimeForOneBarcode = recommendTimeForUS;
                                        }
                                    }
                                    //当前队列等待人数
                                    var waitfornumcount = returnReginfo.waitfornumcount;
                                    //打印时间
                                    var now = new Date();
                                    var printdatetime = getFormattedDatetimeStr(now);
                                    //二维码内容
                                    var npguid = returnReginfo.npguid;
                                    //20190304：只打印一个小票的逻辑
                                    if (i === checkedBarcode.length - 1) {
                                        npguidsForOneBarcode += npguid;
                                    } else {
                                        
                                        npguidsForOneBarcode += npguid + ';';
                                    }
                                    //***********************信息准备完毕，打印************************
                                    //20190304：四楼的打印逻辑
                                    if (localStorage.getItem(param.etypecode_key) === 'CS') {
                                        //注意事项将最后一个顿号改成分号
                                        if (considerations.charAt(considerations.length - 1) === '、') {
                                            considerations = considerations.substr(0, considerations.length - 1) + "；";
                                        }

                                        //清空原有打印区域内容
                                        $("#printAreaFatherDiv").html('');
                                        //生成html代码
                                        var printAreaHtmlContent = '' +
                                            '    <div style="font-family:SimHei;">' +
                                            '        <div style="text-align: center;font-size:14pt">' + localStorage.getItem(param.barcode_title_key) + '<span style="font-size: 11pt;border: 1px solid black;padding:0pt 1pt;border-radius: 20pt;float: right">补</span></div>' +
                                            '        <div>' +
                                            '            <div  style="display:block;">' +
                                            '                <div style="display: none" id="barcode_qrcode">' +
                                            '                    ' +
                                            '                </div>' +
                                            '                <div style="width: 30%;float: right;">' +
                                            '                    <img id="barcode_qrcode_img"/>' +
                                            '                </div>' +
                                            '            </div>' +
                                            '            <div style="display:block;font-size: 11pt;margin-top: 5pt">' +
                                            '                <div>' +
                                            '                    <span>基本信息：' + patname + ' ' + patsex + ' ' + patage + patageunit + '</span>' +
                                            '                    <br/>' +
                                            '                    <span>检查项目：' + eitemStr + '</span>' +
                                            '                    <br/>' +
                                            '                    <span>检查日期：<span style="font-weight:bold;font-size: 11pt;">' + npdate + '</span></span>' +
                                            '                    <br/>' +
                                            '                    <span>检查地点：' + regedAddr + '</span>' +
                                            '                    <br/>' +
                                            '                    <span>检查诊室：<span style="font-weight:bold;font-size: 11pt;">' + regedDesc + '</span></span>';
                                        if (localStorage.getItem(param.etypecode_key) === 'CS') {
                                            printAreaHtmlContent += '                    <br/>' +
                                                '                    <span>签到时间：<span style="border: 1px solid black;padding:0 2px 2px 2px">' + recommendTimeForCS + ' 按时签到,过时需重约</span></span>';
                                        } else if (localStorage.getItem(param.etypecode_key) === 'US') {
                                            printAreaHtmlContent += '                    <br/>' +
                                                '                    <span>签到时间：<span style="border: 1px solid black;padding:0 2px 2px 2px">' + recommendTimeForUS + ' 按时签到,过时需重约</span></span>';
                                        }
                                        /*if (returnReginfo.signin === true) {
                                            printAreaHtmlContent += '                    <br/>' +
                                                '                    <span>等待人数：' + waitfornumcount + ' 人</span>';
                                        }*/
                                        printAreaHtmlContent += '<br/>' +
                                            '                    <br/>' +
                                            '                    <span style="font-size: 10pt;">注意事项：</span>' +
                                            '<div style="font-size: 6pt;">' + localStorage.getItem(param.considerations_key) + considerations + '</div>' +
                                            '                </div>' +
                                            '            </div>' +
                                            '        </div>' +
                                            '    </div>';
                                        //将内容设置到相应区域
                                        $("#printAreaFatherDiv").html(printAreaHtmlContent);
                                        //生成条码到 printArea
                                        $('#barcode_qrcode').qrcode({
                                            width: 80,
                                            height: 80,
                                            text: npguid
                                        });
                                        //将canvas转为图片，否则打印空白
                                        var canvas = $("#barcode_qrcode canvas")[0];
                                        var qrcodeImg = canvas.toDataURL("image/png");
                                        $("#barcode_qrcode_img").prop('src', qrcodeImg);
                                        //调用打印api
                                        var printHtmlContent = $("#printAreaFatherDiv").html();

                                        printWebpage(printHtmlContent);
                                        //20190123:打印后通知服务端打印了小票
                                        notifyServerBarcodePrinted(npguid);
                                        //打印条码成功的提示信息
                                        layer.msg('<i class="layui-icon layui-icon-ok pop-icon-success layui-circle"></i>打印条码成功！');
                                    }
                                });
                                //20190304：二楼的打印逻辑
                                if (localStorage.getItem(param.etypecode_key) === 'US') {
                                    //注意事项将最后一个顿号改成分号
                                    if (considerationsForOneBarcode.charAt(considerationsForOneBarcode.length - 1) === '、') {
                                        considerationsForOneBarcode = considerationsForOneBarcode.substr(0, considerationsForOneBarcode.length - 1) + "；";
                                    }

                                    //清空原有打印区域内容
                                    $("#printAreaFatherDiv").html('');
                                    //生成html代码
                                    var printAreaHtmlContentForOneBarcode = '' +
                                        '    <div style="font-family:SimHei;">' +
                                        '        <div style="text-align: center;font-size:14pt">' + localStorage.getItem(param.barcode_title_key) + '<span style="font-size: 11pt;border: 1px solid black;padding:0pt 1pt;border-radius: 20pt;float: right">补</span></div>' +
                                        '        <div>' +
                                        '            <div  style="display:block;">' +
                                        '                <div style="display: none" id="barcode_qrcode">' +
                                        '                    ' +
                                        '                </div>' +
                                        '                <div style="width: 30%;float: right;">' +
                                        '                    <img id="barcode_qrcode_img"/>' +
                                        '                </div>' +
                                        '            </div>' +
                                        '            <div style="display:block;font-size: 11pt;margin-top: 5pt">' +
                                        '                <div>' +
                                        '                    <span>基本信息：' + patNameForOneBarcode + ' ' + patSexForOneBarcode + ' ' + patAgeStrForOneBarcode + '</span>' +
                                        '                    <br/>' +
                                        '                    <span>检查项目：' + eitemStrForOneBarcode + '</span>' +
                                        '                    <br/>' +
                                        '                    <span>检查日期：<span style="font-weight:bold;font-size: 11pt;">' + npdateForOneBarcode + '</span></span>' +
                                        '                    <br/>' +
                                        '                    <span>检查地点：' + regedAddrForOneBarcode + '</span>' +
                                        '                    <br/>' +
                                        '                    <span>检查诊室：<span style="font-weight:bold;font-size: 11pt;">' + regedDescForOneBarcode + '</span></span>' +
                                        '                    <br/>' +
                                        '                    <span>签到时间：<span style="border: 1px solid black;padding:0 2px 2px 2px">' + recommendTimeForOneBarcode + ' 按时签到,过时需重约</span></span>' +
                                        '                   <br/>' +
                                        '                    <br/>' +
                                        '                    <span style="font-size: 10pt;">注意事项：</span>' +
                                        '                  <div style="font-size: 6pt;">' + localStorage.getItem(param.considerations_key) + considerationsForOneBarcode + '</div>' +
                                        '                </div>' +
                                        '            </div>' +
                                        '        </div>' +
                                        '    </div>';
                                    //将内容设置到相应区域
                                    $("#printAreaFatherDiv").html(printAreaHtmlContentForOneBarcode);
                                    //生成条码到 printArea
                                    $('#barcode_qrcode').qrcode({
                                        width: 80,
                                        height: 80,
                                        text: npguidsForOneBarcode.substr(0, 36)
                                    });
                                    //将canvas转为图片，否则打印空白
                                    var canvas = $("#barcode_qrcode canvas")[0];
                                    var qrcodeImg = canvas.toDataURL("image/png");
                                    $("#barcode_qrcode_img").prop('src', qrcodeImg);
                                    //调用打印api
                                    var printHtmlContentForOneBarcode = $("#printAreaFatherDiv").html();
                                    printWebpage(printHtmlContentForOneBarcode);
                                    //20190123:打印后通知服务端打印了小票
                                    notifyServerBarcodePrinted(npguidsForOneBarcode);
                                    //打印条码成功的提示信息
                                    layer.msg('<i class="layui-icon layui-icon-ok pop-icon-success layui-circle"></i>打印条码成功！');
                                }
                            }
                        });
                        //20190404：默认选中所有
                        $("#print_barcode_form input[name='reqForPrintBarcode']").not('input[disabled]').prop('checked', true);
                        //渲染显示
                        layui.form.render('checkbox', 'print_barcode_form');
                        //如果没有可供补打的条码，则隐藏全选按钮
                        if (printableBarcodeCount <= 0) {
                            $("#selectUnselectBtnsForBarcode").css('display', 'none');
                        }
                    } else {
                        layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>当前卡号没有可供打印的条码！');
                    }
                },
                error: function () {
                    layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>服务器忙！请稍后再试。</i>');
                }
            });
        } else {
            layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>请刷卡或输入就诊卡号！');
            //输入框获得焦点
            $("#cardNumInput").val('');
            $("#cardNumInput").focus();
        }

    });

    /**
     * 几个按钮的事件绑定
     *
     * 打印报告
     * 20190116：应该是胖哥来写这个功能，批量打印
     */
    $("#operate_print_rpt_btn").on('click', function () {
        /*//开启新窗口
        var printWindow = window.open(window.location.href + "static/pdf/rpt.pdf?v=" + new Date().getTime());
        //打印--20190115：发现加载非同项目资源的时候存在崩溃问题，这里打印加一个延时
        setTimeout(function () {
            printWindow.print();
        }, 500);*/
        layer.msg('<i class="layui-icon layui-icon-ok pop-icon-success layui-circle"></i>胖哥写这个功能，敬请期待！');
    });

    /**
     * 几个按钮的事件绑定
     *
     * 编辑注意事项/编辑条码标题按钮
     */
    $("#edit_considerations_btn").on('click', function () {
        //开启弹出层
        var editConsiderationsContent = '' +
            '   <form class="layui-form" lay-filter="edit_considerations_form" action="">' +
            '        <div class="layui-form-item layui-form-text">' +
            '            <label class="layui-form-label">条码标题</label>' +
            '            <div class="layui-input-block">' +
            '                <input type="text" class="layui-input" id="barcode_title_input" value="' + localStorage.getItem(param.barcode_title_key) + '"/>' +
            '            </div>' +
            '        </div>' +
            '        <div class="layui-form-item layui-form-text">' +
            '            <label class="layui-form-label">注意事项</label>' +
            '            <div class="layui-input-block">' +
            '                <textarea rows="10" class="layui-textarea" id="considerations_textarea">' + localStorage.getItem(param.considerations_key) + '</textarea>' +
            '            </div>' +
            '        </div>' +
            '    </form>';

        layer.open({
            type: 1
            , title: '编辑条码（<i class="layui-icon layui-icon-tips my-icon-tips layui-circle"></i>注意换行符&lt;br&gt;）'
            , area: ['80%', '65%']
            , offset: 'auto' //具体配置参考：offset参数项
            , content: editConsiderationsContent
            , btn: ['取消(Esc)', '确认']
            , btnAlign: 'c' //按钮居中
            , yes: function () {
                layer.closeAll();
            }
            , btn2: function () {
                var barcodeTitle = $("#barcode_title_input").val();
                var considerationsStr = $("#considerations_textarea").val();//保留html标签。居然是value！！！
                //写进localStorage
                localStorage.setItem(param.barcode_title_key, barcodeTitle);
                localStorage.setItem(param.considerations_key, considerationsStr);
                //提示
                layer.msg('<i class="layui-icon layui-icon-ok pop-icon-success layui-circle"></i>保存成功');
            }
        });
        //退出按钮绑定快捷键
        $("input[type='text']").bind('keydown.esc', function () {
            layer.closeAll();
        });
        $("textarea").bind('keydown.esc', function () {
            layer.closeAll();
        });
    });

    /**
     * 几个按钮的事件绑定
     *
     * 弃号
     * 放弃预约
     * 取消预约
     * 获取卡号输入框的值，查询reqinfo接口，从结果获取可弃号的列表，让选择。
     * 20190304：添加全选按钮
     * 20190308:放弃预约的逻辑，按照功能来说，放弃预约即使是没缴费，应该提示，但还是要让操作
     */
    $("#operate_giveup_num_btn").on('click', function () {
        //置空弃号所用reqinfo全局变量
        reqinfoForGiveUpNum = {};
        //获取卡号
        var cardNum = $("#cardNumInput").val();
        if (cardNum && '' !== cardNum.trim()) {
            cardNum = cardNum.trim();
            //执行Ajax请求，获取申请单信息
            $.ajax({
                async: false,
                url: param.reqinfo,
                contentType: 'application/json; charset=UTF-8',//设置头格式
                data: JSON.stringify({"card": cardNum, "hospid": localStorage.getItem(param.hospid_key)}),//将json对象转换成字符串
                type: "POST",
                dataType: "json",
                success: function (result) {
                    if (result && result.returncode === 0) {
                        //存储到弃号全局变量
                        reqinfoForGiveUpNum = result;
                        //解析结果：属于当前检查类型、且有reginfo节点的、号池状态为N或Q的申请单可以弃号
                        var currentExamType = localStorage.getItem(param.etypecode_key);
                        var reqlist = result.reqlist;
                        var giveUpNumAbleContent = '<fieldset class="layui-elem-field"><legend>以下为可取消预约的检查</legend>' +
                            "<button type='button' class='layui-btn layui-btn-radius layui-btn-primary layui-btn-sm selectUnselectBtnsForBarcode' id='selectUnselectBtnsForGiveup' onclick='selectUnselectAllEitemForGiveup()'>全选/取消全选</button>" +
                            '<form class="layui-form" lay-filter="giveup_num_form" id="giveup_num_form">';
                        for (var reqIdxForGiveupnum = 0; reqIdxForGiveupnum < reqlist.length; reqIdxForGiveupnum++) {
                            var req = reqlist[reqIdxForGiveupnum];
                            //20190308：是否缴费
                            var paid = req.paid;
                            if (req.examtype === currentExamType && req.reginfo && (req.reginfo.npstatus === 'N' || req.reginfo.npstatus === 'Q')) {
                                //每个单子显示 门诊/住院 ，普通/急诊
                                //20190222：添加 0-门诊/1-住院，预约类型 0-普通/1-急诊
                                var pattypecode = req.pattypecode;
                                var pattype = '';
                                if (pattypecode === '0') {
                                    pattype = '门诊';
                                } else if (pattypecode === '1') {
                                    pattype = '住院';
                                }
                                var regtypecode = req.regtypecode;
                                var regtype = '';
                                if (regtypecode === '0') {
                                    regtype = '普通';
                                } else if (regtypecode === '1') {
                                    regtype = '<span class="little-tips">急诊</span>';
                                }

                                //可弃号
                                //弹出层，列出可弃号的申请单列表，选择然后弃号
                                //结构跟主界面展示检查项目类似，checkbox的值为申请单在reqinfo中的索引
                                //获取申请单中的检查项目
                                var eitemname = "";
                                for (var eitemIdxForPrint = 0; eitemIdxForPrint < req.eitemlist.length; eitemIdxForPrint++) {
                                    if (eitemIdxForPrint === req.eitemlist.length - 1) {
                                        eitemname += req.eitemlist[eitemIdxForPrint].eitemname;
                                    } else {
                                        eitemname += req.eitemlist[eitemIdxForPrint].eitemname + "；";
                                    }
                                }

                                //20190308：是否缴费的判断
                                if (paid && paid === true) {
                                    giveUpNumAbleContent += "<div class='oneReq'>" +
                                        //加一个开单时间
                                        "<div class='reqdatetime'>" + pattype + " " + regtype + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "开单时间：" + req.reqdatetime + "</div>";

                                    giveUpNumAbleContent += '<div class="layui-input-block">' +
                                        '<input type="checkbox" name="reqForGiveupnum" lay-filter="reqForGiveupnum" lay-skin="primary" value=' + reqIdxForGiveupnum + ' title="' + eitemname + '">';
                                } else {
                                    //未缴费，提示出来，但是input框可以选中操作
                                    giveUpNumAbleContent += "<div class='oneReq'>" +
                                        //加一个开单时间
                                        "<div class='reqdatetime'><span class='not-paid'><i class='layui-icon layui-icon-close pop-icon-error layui-circle icon-close-not-paid'></i>未缴费&nbsp;&nbsp;</span>" + pattype + " " + regtype + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "开单时间：" + req.reqdatetime + "</div>";

                                    giveUpNumAbleContent += '<div class="layui-input-block">' +
                                        '<input type="checkbox" name="reqForGiveupnum" lay-filter="reqForGiveupnum" lay-skin="primary" value=' + reqIdxForGiveupnum + ' title="' + eitemname + '">';
                                }

                                if (req.reginfo.npstatus === 'N') {
                                    if (localStorage.getItem(param.etypecode_key) === 'CS') {
                                        giveUpNumAbleContent += '<i class="layui-icon layui-icon-ok eitem-tips">已预约：' + req.reginfo.teamname + ' ' + req.reginfo.npdate + ' ' + req.reginfo.schename + ' ' + (req.reginfo.numstart == null ? '' : req.reginfo.numstart + '号') + '</i>';
                                    } else if (localStorage.getItem(param.etypecode_key) === 'US') {
                                        giveUpNumAbleContent += '<i class="layui-icon layui-icon-ok eitem-tips">已预约：' + req.reginfo.teamname + ' ' + req.reginfo.npdate + ' ' + req.reginfo.schename + '</i>';
                                    }
                                } else if (req.reginfo.npstatus === 'Q') {
                                    if (localStorage.getItem(param.etypecode_key) === 'CS') {
                                        giveUpNumAbleContent += '<i class="layui-icon layui-icon-flag eitem-tips">已签到：' + req.reginfo.teamname + ' ' + req.reginfo.npdate + ' ' + req.reginfo.schename + ' ' + req.reginfo.numstart + ' 号</i>';
                                    } else if (localStorage.getItem(param.etypecode_key) === 'US') {
                                        giveUpNumAbleContent += '<i class="layui-icon layui-icon-flag eitem-tips">已签到：' + req.reginfo.teamname + ' ' + req.reginfo.npdate + ' ' + req.reginfo.schename + ' ' + req.reginfo.signinnum + '号</i>';
                                    }
                                }

                                giveUpNumAbleContent += '</div>';

                                giveUpNumAbleContent += '</div>';
                            }
                        }
                        giveUpNumAbleContent += "</form>";
                        giveUpNumAbleContent += "</fieldset>";
                        //数据准备完毕，弹出层弹出
                        layer.open({
                            type: 1
                            , title: '勾选需要取消预约的检查'
                            , area: ['80%', '65%']
                            , offset: 'auto' //具体配置参考：offset参数项
                            , content: giveUpNumAbleContent
                            , btn: ['退出(Esc)', '确认取消预约']
                            , btnAlign: 'c' //按钮居中
                            , yes: function () {
                                layer.closeAll();
                            }
                            , btn2: function () {
                                //弃号选中的检查
                                var checkedGiveupnum = $("#giveup_num_form input:checked");
                                if (checkedGiveupnum.length <= 0) {
                                    layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>请选择要取消预约的检查！');
                                    return false;
                                }
                                //取消预约选中的单子
                                checkedGiveupnum.each(function (i, n) {
                                    var reqIndexInReqinfoForGiveupnum = $(n).val();
                                    //拼凑参数
                                    var req = reqinfoForGiveUpNum.reqlist[reqIndexInReqinfoForGiveupnum];
                                    //打印条码成功的提示信息
                                    $.ajax({
                                        async: false,
                                        url: param.giveupnum,
                                        contentType: 'application/json; charset=UTF-8',//设置头格式
                                        data: JSON.stringify({
                                            "npguid": req.npguid,
                                            "examtype": localStorage.getItem(param.etypecode_key)
                                        }),//将json对象转换成字符串
                                        type: "POST",
                                        dataType: "json",
                                        success: function (result) {
                                            //弃号成功
                                            if (result && result.returncode === 0) {
                                                layer.msg('<i class="layui-icon layui-icon-ok pop-icon-success layui-circle"></i>取消预约成功！');
                                            } else {
                                                layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>取消预约失败！' + (result == null ? '' : '信息：' + result.returnmsg));
                                            }
                                        },
                                        error: function () {
                                            layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>服务器忙！请稍后再试。</i>');
                                        }
                                    });
                                });
                                //循环完了再更新界面显示，再次调用查询接口
                                queryByCardNum();
                            }
                        });
                        //20190404：默认选中所有
                        $("#giveup_num_form input[name='reqForGiveupnum']").not('input[disabled]').prop('checked', true);
                        //渲染显示
                        layui.form.render('checkbox', 'giveup_num_form');
                    } else {
                        layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>当前卡号没有可取消预约的检查！');
                    }
                },
                error: function () {
                    layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>服务器忙！请稍后再试。</i>');
                }
            });
        } else {
            layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>请刷卡或输入就诊卡号！');
            //输入框获得焦点
            $("#cardNumInput").val('');
            $("#cardNumInput").focus();
        }

    });

    /**
     * 几个按钮的事件绑定
     *
     * 修改急诊
     */
    $("#setRegType").on('click', function () {
        //置空修改急诊全局变量申请单信息
        reqinfoForSetregtype = {};
        //获取卡号
        var cardNum = $("#cardNumInput").val();
        if (cardNum && '' !== cardNum.trim()) {
            cardNum = cardNum.trim();
            //执行Ajax请求，获取申请单信息
            $.ajax({
                async: false,
                url: param.reqinfo,
                contentType: 'application/json; charset=UTF-8',//设置头格式
                data: JSON.stringify({"card": cardNum, "hospid": localStorage.getItem(param.hospid_key)}),//将json对象转换成字符串
                type: "POST",
                dataType: "json",
                success: function (result) {
                    if (result && result.returncode === 0) {
                        setRegTypeByReqinfoReturnMsg(result);
                    } else {
                        layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>当前卡号没有可修改急诊的检查！');
                    }
                },
                error: function () {
                    layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>服务器忙！请稍后再试。</i>');
                }
            });
        } else {
            layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>请刷卡或输入就诊卡号！');
            //输入框获得焦点
            $("#cardNumInput").val('');
            $("#cardNumInput").focus();
        }
    });


    /**
     * 几个按钮的事件绑定
     *
     * 使用条码签到
     * 扫码不太可能去手动输入 npguid
     * 20190304：签到npguid可能有多个，用分号隔开；加入扫申请单签到。
     */
    $("#signinByBarcode").on('click', function () {
        //准备弹出层内容
        var signinByBarcodeContent = '' +
            '   <form class="layui-form pop-form" lay-filter="signin_by_barcode_form" action="" onsubmit="return false">' +
            '        <div class="layui-form-item layui-form-text">' +
            '            <label class="layui-form-label">扫码签到：</label>' +
            '            <div class="layui-input-block">' +
            '                <input type="text" class="layui-input pop-input" id="signin_by_barcode_input" autocomplete="off"/>' +
            '            </div>' +
            '        </div>' +
            '    </form>' +
            '        <div class="layui-form-item layui-form-text">' +
            '            <label class="layui-form-label">签到结果：</label>' +
            '            <div id="signinResultSummary"></div>' +
            '        </div>';
        //弹出层，扫码签到
        layer.open({
            type: 1
            , title: '扫描申请单或小票二维码签到'
            , area: ['80%', '65%']
            , offset: 'auto' //具体配置参考：offset参数项
            , content: signinByBarcodeContent
            , btn: ['退出(Esc)', '继续扫码签到(F9)']
            , btnAlign: 'c' //按钮居中
            , yes: function () {
                layer.closeAll();
            }
            , btn2: function () {
                //继续签到，清空输入框，输入框获取焦点，清空签到结果
                $("#signin_by_barcode_input").val('');
                $("#signinResultSummary").html('');
                $("#signin_by_barcode_input").focus();

                return false;
            }
        });
        //输入框获取焦点
        $("#signin_by_barcode_input").focus();
        //给扫码的输入框绑定回车事件进行签到
        $("#signin_by_barcode_input").bind('keydown.return', function () {
            //获取npguid，进行签到
            var signinInputVal = $("#signin_by_barcode_input").val();
            if (!signinInputVal || signinInputVal.trim() === '') {
                layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>请扫码');
                $("#signin_by_barcode_input").val('');
                $("#signinResultSummary").html('');
                $("#signin_by_barcode_input").focus();

                return;
            }
            signinInputVal = signinInputVal.trim();
            //首先判断是 npguid 还是 申请单号
            var guidRegex = new RegExp(/^[0-9a-zA-Z]{8}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{12}$/);
            if (guidRegex.test(signinInputVal.substr(0, 36)) === true) {
                //扫码的结果是npguid--20190314：已经是纯粹的npguid了，单个
                if (localStorage.getItem(param.etypecode_key) === 'CS') {
                    //四楼
                    signinByNpguids(signinInputVal);
                } else if (localStorage.getItem(param.etypecode_key) === 'US') {
                    //二楼
                    $.ajax({
                        async: false,
                        url: param.reqinfobynpguid,
                        contentType: 'application/json; charset=UTF-8',//设置头格式
                        data: JSON.stringify({
                            "npguid": signinInputVal.substr(0, 36),
                            "hospid": localStorage.getItem(param.hospid_key)
                        }),//将json对象转换成字符串
                        type: "POST",
                        dataType: "json",
                        success: function (result) {
                            if (result && result.returncode === 0) {
                                signinByReqinfoReturnMsg(result);
                            } else {
                                layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>当前卡号没有可签到的检查！');
                            }
                        },
                        error: function () {
                            layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>服务器忙！请稍后再试。</i>');
                        }
                    });
                }
            } else {
                //是申请单号或者卡号，那么查询reqinfo接口，列出可签到的列表
                //置空签到所用reqinfo全局变量
                reqinfoForSignin = {};
                //获取卡号
                //执行Ajax请求，获取申请单信息
                $.ajax({
                    async: false,
                    url: param.reqinfo,
                    contentType: 'application/json; charset=UTF-8',//设置头格式
                    data: JSON.stringify({"card": signinInputVal, "hospid": localStorage.getItem(param.hospid_key)}),//将json对象转换成字符串
                    type: "POST",
                    dataType: "json",
                    success: function (result) {
                        if (result && result.returncode === 0) {
                            signinByReqinfoReturnMsg(result);
                        } else {
                            layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>当前卡号没有可签到的检查！');
                        }
                    },
                    error: function () {
                        layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>服务器忙！请稍后再试。</i>');
                    }
                });
            }

        });
        //继续扫码签到快捷键绑定
        $(document).bind('keydown.f9', function () {
            //继续签到，清空输入框，输入框获取焦点，清空签到结果
            $("#signin_by_barcode_input").val('');
            $("#signinResultSummary").html('');
            $("#signin_by_barcode_input").focus();
        });
        $("input[type='text']").bind('keydown.f9', function () {
            //继续签到，清空输入框，输入框获取焦点，清空签到结果
            $("#signin_by_barcode_input").val('');
            $("#signinResultSummary").html('');
            $("#signin_by_barcode_input").focus();
        });
        //退出按钮绑定快捷键
        $("input[type='text']").bind('keydown.esc', function () {
            layer.closeAll();
        });
    });

    /**
     * 几个按钮的事件绑定
     *
     * 查看号池
     * 20190403：优化显示
     * @deprecated
     */
    $("#showNumPoolDetail_deprecated").on('click', function () {
        //从主界面和全局变量teamDic中拼凑数据
        if (teamDic && teamDic.length > 0) {
            var teamListContent = '';
            //准备弹出层显示的内容
            teamListContent += '' +
                '<from class="layui-form" lay-filter="show_num_pool_detail_form" id="show_num_pool_detail_form">' +
                '  <div class="layui-form-item layer-form-position-center">' +
                '    <div class="layui-inline">' +
                '      <label class="layui-form-label">选择诊室</label>' +
                '      <div class="layui-input-inline">' +
                '       <select name="modules" id="showNumPoolDetailSelect" lay-filter="show_num_pool_detail_select" lay-verify="required" lay-search="">';

            for (var teamDicIdx = 0; teamDicIdx < teamDic.length; teamDicIdx++) {
                var team = teamDic[teamDicIdx];
                teamListContent += '<option value="' + team.teamguid + '">' + team.teamname + '</option>';
            }

            teamListContent += '' +
                '       </select>' +
                '      </div>' +
                '    </div>' +
                '  </div>' +
                '  <div class="layui-form-item layer-form-position num-pool-summary" id="numPoolDetailArea">' +
                '  </div>' +
                '</form>';
            //弹出显示
            layer.open({
                type: 1
                , title: '选择诊室以查看号池详情（圆形为预留号码）'
                , area: ['60%', '70%']
                , offset: 'auto' //具体配置参考：offset参数项
                , content: teamListContent
                , btn: ['退出(Esc)']
                , btnAlign: 'c' //按钮居中
                , yes: function () {
                    layer.closeAll();
                }
            });
            //渲染表单
            layui.form.render('select', 'show_num_pool_detail_form');
            //手动执行一次
            //都已经选择了
            var checkedScheduleDate = $("#scheduleDateInput").val();
            var checkedScheduleGUID = $("#scheduleName input:checked").val();
            var checkedScheduleName = $("#scheduleName input:checked").prop('title');
            var checkedScheduleTeamGUID = $("#showNumPoolDetailSelect option:selected").val();
            var checkedScheduleTeamName = $("#showNumPoolDetailSelect option:selected").html();

            showNumPoolDetail(checkedScheduleDate, checkedScheduleGUID, checkedScheduleName, checkedScheduleTeamGUID, checkedScheduleTeamName);
            //给诊室的下拉选择框绑定事件
            layui.form.on('select(show_num_pool_detail_select)', function (data) {
                //显示号池详情
                //都已经选择了
                var checkedScheduleDate = $("#scheduleDateInput").val();
                var checkedScheduleGUID = $("#scheduleName input:checked").val();
                var checkedScheduleName = $("#scheduleName input:checked").prop('title');
                var checkedScheduleTeamGUID = $("#showNumPoolDetailSelect option:selected").val();
                var checkedScheduleTeamName = $("#showNumPoolDetailSelect option:selected").html();

                showNumPoolDetail(checkedScheduleDate, checkedScheduleGUID, checkedScheduleName, checkedScheduleTeamGUID, checkedScheduleTeamName);
            });
        } else {
            layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>没有诊室开放！');
        }

    });

    /**
     * 几个按钮的时间绑定
     * 查看号池--新版
     */
    $("#showNumPoolDetail").on('click', function () {
        if (teamDic && teamDic.length > 0) {
            var teamListContent = '';
            //准备弹出层显示的内容
            teamListContent += '' +
                '<from class="layui-form" lay-filter="show_num_pool_detail_form" id="show_num_pool_detail_form">' +
                '  <div class="layui-form-item layer-form-position-center">' +
                '    <div class="layui-inline">' +
                '              <label class="layui-form-label">日期：</label>' +
                '              <div class="layui-input-inline">' +
                '                <input type="text" class="layui-input" id="scheduleDateForNumPoolDetail" placeholder="yyyy-MM-dd">' +
                '              </div>' +
                '    </div>' +
                '    <div class="layui-inline">' +
                '              <label class="layui-form-label">时段：</label>' +
                '              <div class="layui-input-inline" id="scheduleNameForNumPoolDetail">' +
                '              </div>' +
                '    </div>' +
                '  </div>' +
                '  <div class="layui-form-item layer-form-position num-pool-summary" id="numPoolDetailAreaForNumPoolDetail">' +
                '  </div>' +
                '</form>';
            //弹出显示
            layer.open({
                type: 1
                , title: '点击诊室查看号池详情'
                , area: ['100%', '100%']
                , offset: 'auto' //具体配置参考：offset参数项
                , content: teamListContent
                , btn: ['退出(Esc)']
                , btnAlign: 'c' //按钮居中
                , yes: function () {
                    layer.closeAll();
                }
            });
            //渲染日期组件
            var laydate = layui.laydate;
            var now = new Date();
            var defaultDateValue = now.getFullYear() + '-' + lay.digit(now.getMonth() + 1) + '-' + lay.digit(now.getDate());

            laydate.render({
                elem: '#scheduleDateForNumPoolDetail',
                btns: ['now'],//默认三个都显示 clear、now、confirm
                value: defaultDateValue,
                min: defaultDateValue,
                //选择完毕后的回调
                done: function (value, date, endDate) {
                    //显示所有诊室号池概览
                    showNumPoolOutline();
                }
            });

            //初始化时段单选按钮
            var scheduleContent = "";
            for (var scheIndex = 0; scheIndex < scheDic.length; scheIndex++) {
                //默认选中第一个
                if (scheIndex === 0) {
                    scheduleContent += '<input type="radio" class="layui-form" lay-filter="scheduleNameRadioForNumPoolDetail" name="scheduleNameForNumPoolDetail" value="' + scheDic[scheIndex].scheguid + '" title="' + scheDic[scheIndex].schename + '" checked/>';
                } else {
                    scheduleContent += '<input type="radio" class="layui-form" lay-filter="scheduleNameRadioForNumPoolDetail" name="scheduleNameForNumPoolDetail" value="' + scheDic[scheIndex].scheguid + '" title="' + scheDic[scheIndex].schename + '"/>';
                }
            }
            $("#scheduleNameForNumPoolDetail").html(scheduleContent);

            //渲染表单
            layui.form.render('radio', 'show_num_pool_detail_form');
            //手动执行一次显示诊室号池概览
            showNumPoolOutline();
            //给时段单选按钮绑定事件
            layui.form.on('radio(scheduleNameRadioForNumPoolDetail)', function (data) {
                //显示所有诊室号池概览
                showNumPoolOutline();
            });
        } else {
            layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>没有诊室开放！');
        }

    });


    /**
     * 几个按钮的事件绑定
     *
     * 门诊退费
     */
    $("#setClinicPatRefund").on('click', function () {
        //准备弹出层内容
        var setClinicPatRefundContent = '' +
            '   <form class="layui-form pop-form" lay-filter="set_clinic_pat_refund_form" action="" onsubmit="return false">' +
            '        <div class="layui-form-item layui-form-text">' +
            '            <label class="layui-form-label">注意事项：</label>' +
            '            <div class="layui-input-block">' +
            '                1. 此功能仅适用于门诊单子；<br/>' +
            '                2. 此功能仅适用于对应检查已经完成的情况，如果检查未完成，该单子本身就是可退费的，不必进行此操作；' +
            '            </div>' +
            '        </div>' +
            '        <div class="layui-form-item layui-form-text">' +
            '            <label class="layui-form-label">扫码查询：</label>' +
            '            <div class="layui-input-block">' +
            '                <input type="text" class="layui-input pop-input" id="set_clinic_pat_refund_input" autocomplete="off"/>' +
            '            </div>' +
            '        </div>' +
            '    </form>' +
            '        <div class="layui-form-item layui-form-text">' +
            '            <label class="layui-form-label">查询结果：</label>' +
            '            <div id="setClinicPatRefundSummary"></div>' +
            '        </div>';
        //弹出层，扫码查询出当前申请单的内容
        layer.open({
            type: 1
            , title: '扫描申请单二维码查询可退费的门诊项目'
            , area: ['65%', '65%']
            , offset: 'auto' //具体配置参考：offset参数项
            , content: setClinicPatRefundContent
            , btn: ['退出(Esc)', '下一步']
            , btnAlign: 'c' //按钮居中
            , yes: function () {
                layer.closeAll();
            }
            , btn2: function () {
                //传递数据到页面iframe
                var checkedItemToRefund = $("#set_clinic_pat_refund_able_form .oneReq input[name='reqForsetClinicPatRefundAble']:checked");
                //如果没有扫码或者没有选择单子
                if (!checkedItemToRefund || checkedItemToRefund.length <= 0) {
                    layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>请扫码查询并选择可退费的门诊申请单！');

                    return false;
                }

                var signature = $(checkedItemToRefund).attr('da' + 'ta' + '-' + 'si' + 'g' + 'na' + 'tu' + 're');
                var hisCodeToRefund = $(checkedItemToRefund).val();

                var baseRefundUrl = '';
                if (localStorage.getItem(param.etypecode_key) === 'US') {
                    baseRefundUrl = param.setClinicPatRefundAbleBaseUrlForUS;
                } else if (localStorage.getItem(param.etypecode_key) === 'CS') {
                    baseRefundUrl = param.setClinicPatRefundAbleBaseUrlForCS;
                }

                var iframeIndex = layer.open({
                    type: 2
                    ,
                    title: '确认修改门诊费用状态'
                    ,
                    area: ['65%', '65%']
                    ,
                    offset: 'auto' //具体配置参考：offset参数项
                    ,
                    content: baseRefundUrl + "?appId=" + hisCodeToRefund + "&feeType=2&signature=" + signature + "&v=" + new Date().getTime()
                    ,
                    btn: ['返回']
                    ,
                    yes: function () {
                        layer.close(iframeIndex);
                    }
                    ,
                    success: function (layerwrap) {
                        //设置 返回 按钮的位置，默认跑到了下方右边
                        layerwrap.find('.layui-layer-btn').css('text-align', 'center');
                    }
                });

                return false;
            }
        });
        //输入框获取焦点
        $("#set_clinic_pat_refund_input").focus();
        //给扫码的输入框绑定回车事件进行签到
        $("#set_clinic_pat_refund_input").bind('keydown.return', function () {
            //获取申请单号，进行查询
            var hisCodeVal = $("#set_clinic_pat_refund_input").val();
            if (!hisCodeVal || hisCodeVal.trim() === '') {
                layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>请扫码');
                $("#set_clinic_pat_refund_input").val('');
                $("#setClinicPatRefundSummary").html('');
                $("#set_clinic_pat_refund_input").focus();

                return;
            }
            hisCodeVal = hisCodeVal.trim();
            //是申请单号或者卡号，那么查询reqinfo接口，列出可签到的列表
            //执行Ajax请求，获取申请单信息
            $.ajax({
                async: false,
                url: param.reqinfo,
                contentType: 'application/json; charset=UTF-8',//设置头格式
                data: JSON.stringify({"card": hisCodeVal, "hospid": localStorage.getItem(param.hospid_key)}),//将json对象转换成字符串
                type: "POST",
                dataType: "json",
                success: function (result) {
                    if (result && result.returncode === 0) {
                        setClinicPatRefundByReqinfoReturnMsg(hisCodeVal, result);
                    } else {
                        layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>当前卡号没有可退费的检查！');
                    }
                },
                error: function () {
                    layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>服务器忙！请稍后再试。</i>');
                }
            });

        });
        //退出按钮绑定快捷键
        $("input[type='text']").bind('keydown.esc', function () {
            layer.closeAll();
        });
    });
    /**
     * 几个按钮的事件绑定
     *
     * 配置管理
     */
    $("#toBackendManagePage").on('click', function () {
        window.open(param.backendManagePage);
    });

//*********在这里再进行页面的数据初始化工作，因为初始化需要用到日期组件的值，所以等日期组件表单渲染完毕再进行页面数据的初始化********
    /*初始数据：院区、检查类型*/
    initPage();
})
;

//#####页面初始化结束#####

/**
 * 显示号池详情的函数
 */
function showNumPoolDetail(checkedScheduleDate, checkedScheduleGUID, checkedScheduleName, checkedScheduleTeamGUID, checkedScheduleTeamName) {
    //访问诊室详情接口
    $.ajax({
        url: param.teaminfo,
        contentType: 'application/json; charset=UTF-8',//设置头格式
        data: JSON.stringify({
            "teamguid": checkedScheduleTeamGUID,
            "schedate": checkedScheduleDate,
            "scheguid": checkedScheduleGUID,
            "hospid": localStorage.getItem(param.hospid_key),
            "examtype": localStorage.getItem(param.etypecode_key)
        }),
        type: "POST",
        dataType: "json",
        success: function (result) {
            if (result.returncode === 0) {
                //成功返回
                var teaminfo = result;
                //首先判断是否关闭
                var teamisoff = teaminfo.teamisoff;
                if (teamisoff === true) {
                    //如果关闭了，函数结束，弹出提醒
                    $("#numPoolDetailArea").html('');
                    layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>该诊室已经关闭！');
                    return;
                }
                //使用一个数组来标志当前号是否可用
                var totalnum = teaminfo.teampresetnum + teaminfo.teamincdecnum;
                var teamusednum = teaminfo.teamusednum;
                var reservenum = teaminfo.teamreservednum;
                var teamusednumlist = teaminfo.teamusednumlist;
                //初始化一个数组来记录指定位置的号是否可用。true和false
                var teamnumStateArr = [];
                //默认都可用
                for (var teamnumIdx = 0; teamnumIdx < totalnum; teamnumIdx++) {
                    teamnumStateArr[teamnumIdx] = true;
                }
                //循环使用过的号，标记为不可用的号
                for (var teamusednumlistIdx = 0; teamusednumlistIdx < teamusednumlist.length; teamusednumlistIdx++) {
                    var oneUsednum = teamusednumlist[teamusednumlistIdx];
                    //循环起始点，标记不可用
                    for (var usednum = oneUsednum.numstart; usednum <= oneUsednum.numend; usednum++) {
                        teamnumStateArr[usednum - 1] = false;
                    }
                }
                //已经是标记了可用和不可用状态的诊室号池详情数组
                //根据数组和预留号生成显示号池情况的html代码
                var teamnumStateContent = '' +
                    '<span class="summary">' + checkedScheduleDate + ' ' + checkedScheduleName + ' ' + checkedScheduleTeamName + ' </span>' + '<span class="summary" id="">总计：' + totalnum + '个号，其中基础' + teaminfo.teampresetnum + '个号，' + (teaminfo.teamincdecnum >= 0 ? '加' : '减') + Math.abs(teaminfo.teamincdecnum) + '个号，已使用' + teamusednum + '个号，剩余' + (totalnum - teamusednum) + '个号</span>' +
                    '  <div class="layui-form-item" pane="">' +
                    '    <div class="layui-input-block">';

                for (var teamnumStateIdx = 0; teamnumStateIdx < teamnumStateArr.length; teamnumStateIdx++) {
                    if (teamnumStateArr[teamnumStateIdx] === true) {
                        //号 有效
                        teamnumStateContent += '<input type="checkbox" name="numPoolDetail" lay-filter="numPoolDetail" lay-skin="primary" value="' + (teamnumStateIdx + 1) + '">';
                    } else if (teamnumStateArr[teamnumStateIdx] === false) {
                        //号 无效
                        teamnumStateContent += '<input type="checkbox" name="numPoolDetail" lay-filter="numPoolDetail" lay-skin="primary" value="' + (teamnumStateIdx + 1) + '" disabled>';
                    }
                    //十个一行
                    if (teamnumStateIdx % param.teaminfoNumCols === param.teaminfoNumCols - 1) {
                        teamnumStateContent += '<br/>';
                    }
                }

                teamnumStateContent += '' +
                    '    </div>' +
                    '  </div>';

                //设置显示
                $("#numPoolDetailArea").html(teamnumStateContent);
                //渲染表单--_2
                layui.form.render('checkbox', 'show_num_pool_detail_form_2');
                //设置样式
                //所有多选框的图标内容为号数--_2
                $("#show_num_pool_detail_form_2 .layui-form-checkbox").each(function (i, n) {
                    $(n).find('i').prop('class', 'layui-icon');
                    $(n).find('i').css('color', '#d2d2d2');
                    $(n).find('i').html(i + 1);
                });
                if (reservenum > 0) {
                    //预留号突出显示--索引.。预留号为圆形(大圆角)。
                    $("#show_num_pool_detail_form_2 .layui-form-checkbox i:eq(0)").css('border-radius', '20px');
                    $("#show_num_pool_detail_form_2 .layui-form-checkbox i:lt(" + reservenum + "):gt(0)").css('border-radius', '20px');
                }
                //不可用的号设置图标为 layui-icon layui-icon-username ，背景色为 不可用 #ED7161
                $("#show_num_pool_detail_form_2 .layui-checkbox-disbaled i").prop('class', 'layui-icon layui-icon-username');
                $("#show_num_pool_detail_form_2 .layui-checkbox-disbaled i").html('');//否则是图标加号数
                $("#show_num_pool_detail_form_2 .layui-checkbox-disbaled i").css('background-color', '#ED7161');
            } else {
                layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>返回数据错误！' + (result == null ? '' : '：' + result.returnmsg));
            }
        },
        error: function () {
            layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>服务器忙！请稍后再试。-teaminfo</i>');
        }
    });
}

/**
 * 显示号池所有诊室详情的函数
 * 新版查看号池
 * //哈哈哈哈哈哈哈
 */
function showNumPoolOutline() {
    //都已经选择了
    var checkedScheduleDate = $("#scheduleDateForNumPoolDetail").val();
    var checkedScheduleGUID = $("#scheduleNameForNumPoolDetail input:checked").val();
    //访问诊室概览接口，将所有诊室的大致情况显示到界面上
    $.ajax({
        url: param.teamoutline,
        contentType: 'application/json; charset=UTF-8',//设置头格式
        data: JSON.stringify({
            "hospid": localStorage.getItem(param.hospid_key),
            "scheguid": checkedScheduleGUID,
            "schedate": checkedScheduleDate,
            "examtype": localStorage.getItem(param.etypecode_key)
        }),//将json对象转换成字符串
        type: "POST",
        dataType: "json",
        success: function (result) {
            var teamoutlineContent = '';
            if (result.returncode === 0) {
                //获取号池情况，生成对应的div--一排6个，一直往下排列
                for (var teamIndex = 0; teamIndex < result.teamlist.length; teamIndex++) {
                    var teamname = result.teamlist[teamIndex].teamname;
                    var teamguid = result.teamlist[teamIndex].teamguid;
                    var teamisoff = result.teamlist[teamIndex].teamisoff;
                    //首先判断诊室是否已经关闭
                    if (teamisoff === true) {
                        //获取百分比和背景色
                        var percentAndBgColorArr = getPercentAndBgColorArrayForProgress(0, 0);

                        teamoutlineContent += '<div id="' + teamguid + '" class="teamoutline-div teamisoff layui-col-xs2 layui-col-sm2 layui-col-md2 layui-col-lg2 my-div-disabled" disabled="disabled">' +
                            '<div class="layui-progress layui-progress-big" lay-showPercent="yes">' +
                            '  <div class="layui-progress-bar ' + percentAndBgColorArr[1] + '" lay-percent="' + percentAndBgColorArr[0] + '"></div>' +
                            '</div>' +
                            '<div class="team-name-div">' + teamname + '</div>' +
                            '<div class="team-outline-div">' +
                            '   <div class="team-outline-div-1">' +
                            '       <div class="invisible team-span-label"><span class="static-width-span">总号数：</span></div>' +
                            '       <div class="invisible team-span-label"><span class="static-width-span">基础号：</span></div>' +
                            '       <div class="invisible team-span-label"><span class="static-width-span">加减号：</span></div>' +
                            '       <div class="invisible team-span-label"><span class="static-width-span">剩余号：</span></div>' +
                            '   </div>' +
                            '   <div class="font-size-18">诊室关闭！</div>' +
                            '   <div class="team-outline-div-2">' +
                            '       <div class="invisible team-span-label"><span class="static-width-span">普通号：</span></div>' +
                            '       <div class="invisible team-span-label"><span class="static-width-span">普通号剩余：</span></div>' +
                            '       <div class="invisible team-span-label"><span class="static-width-span">预留号：</span></div>' +
                            '       <div class="invisible team-span-label"><span class="static-width-span">预留号剩余：</span></div>' +
                            '   </div>' +
                            '</div>' +
                            '</div>';
                    } else {
                        //基础号
                        var teampresetnum = result.teamlist[teamIndex].teampresetnum;
                        //加减号
                        var teamincdecnum = result.teamlist[teamIndex].teamincdecnum;
                        //总号数
                        var teamtotalnum = teampresetnum + teamincdecnum;
                        //已经使用号
                        var teamusednum = result.teamlist[teamIndex].teamusednum;
                        //teamusednum可能为null
                        teamusednum = teamusednum == null ? 0 : teamusednum;
                        //剩余号
                        var teamremainnum = result.teamlist[teamIndex].teamremainnum;

                        //预留号
                        var teamreservednum = teamtotalnum <= 0 ? 0 : result.teamlist[teamIndex].teamreservednum;
                        //预留号剩余
                        var teamreservedremainnum = (teamtotalnum <= 0 || result.teamlist[teamIndex].teamreservedremainnum == null) ? '' : result.teamlist[teamIndex].teamreservedremainnum;
                        //普通号
                        var teamnormalnum = teamtotalnum <= 0 ? 0 : teamtotalnum - teamreservednum;
                        //普通号剩余
                        console.log(result.teamlist[teamIndex].teamnormalremainnum);
                        var teamnormalremainnum = (teamtotalnum <= 0 || result.teamlist[teamIndex].teamnormalremainnum == null) ? '' : result.teamlist[teamIndex].teamnormalremainnum;

                        //获取百分比和背景色
                        var percentAndBgColorArr = getPercentAndBgColorArrayForProgress(teamtotalnum, teamusednum);

                        teamoutlineContent += '<div id="' + teamguid + '" class="teamoutline-div layui-col-xs2 layui-col-sm2 layui-col-md2 layui-col-lg2 my-div-enabled">' +
                            '<div class="layui-progress layui-progress-big" lay-showPercent="yes">' +
                            '  <div class="layui-progress-bar ' + percentAndBgColorArr[1] + '" lay-percent="' + percentAndBgColorArr[0] + '"></div>' +
                            '</div>' +
                            '<div class="team-name-div">' + teamname + '</div>' +
                            '<div class="team-outline-div">' +
                            '   <div class="team-outline-div-1">' +
                            '       <div class="team-span-label"><span class="static-width-span">总号数：</span>' + teamtotalnum + '</div>' +
                            '       <div class="team-span-label"><span class="static-width-span">基础号：</span>' + teampresetnum + '</div>' +
                            '       <div class="team-span-label"><span class="static-width-span">加减号：</span>' + teamincdecnum + '</div>' +
                            '       <div class="team-span-label"><span class="static-width-span">剩余号：</span>' + teamremainnum + '</div>' +
                            '   </div>' +
                            '   <div class="invisible font-size-18">你看到我了！</div>' +
                            '   <div class="team-outline-div-2">' +
                            '       <div class="team-span-label"><span class="static-width-span">普通号：</span>' + teamnormalnum + '</div>' +
                            '       <div class="team-span-label"><span class="static-width-span">普通号剩余：</span>' + teamnormalremainnum + '</div>' +
                            '       <div class="team-span-label"><span class="static-width-span">预留号：</span>' + teamreservednum + '</div>' +
                            '       <div class="team-span-label"><span class="static-width-span">预留号剩余：</span>' + teamreservedremainnum + '</div>' +
                            '   </div>' +
                            '</div>' +
                            '</div>';
                    }
                }
            } else {
                //返回信息有误
                teamoutlineContent += '返回信息错误：' + result.returnmsg;
            }
            //拼凑完成，设置到显示区域
            $("#numPoolDetailAreaForNumPoolDetail").html(teamoutlineContent);
            //渲染进度条
            layui.element.render('progress');
            //给div绑定事件调用 showNumPoolDetail();--同时有两种class属性 teamoutline-div 和 my-div-enabled
            $("#numPoolDetailAreaForNumPoolDetail .teamoutline-div.my-div-enabled").on('click', function () {
                //再弹出一个弹出层，展示号池详情，但是关闭的时候只关闭弹出来的这个弹出层，100%的这个弹出层不要关闭了
                //从主界面和全局变量teamDic中拼凑数据
                if (teamDic && teamDic.length > 0) {
                    var teamListContent = '';
                    //准备弹出层显示的内容
                    teamListContent += '' +
                        '<from class="layui-form" lay-filter="show_num_pool_detail_form_2" id="show_num_pool_detail_form_2">' +
                        '  <div class="layui-form-item layer-form-position num-pool-summary" id="numPoolDetailArea">' +
                        '  </div>' +
                        '</form>';
                    //都已经选择了
                    var checkedScheduleDate = $("#scheduleDateForNumPoolDetail").val();
                    var checkedScheduleGUID = $("#scheduleNameForNumPoolDetail input:checked").val();
                    var checkedScheduleName = $("#scheduleNameForNumPoolDetail input:checked").prop('title');
                    var checkedScheduleTeamGUID = $(this).prop('id');
                    var checkedScheduleTeamName = $(this).find('.team-name-div').html();
                    //弹出显示
                    var indexOfNumPoolDetail = layer.open({
                        type: 1
                        ,
                        title: checkedScheduleDate + ' ' + checkedScheduleName + ' ' + checkedScheduleTeamName + ' 号池详情（圆形为预留号码）'
                        ,
                        area: ['60%', '70%']
                        ,
                        shadeClose: true
                        ,
                        offset: 'auto' //具体配置参考：offset参数项
                        ,
                        content: teamListContent
                        ,
                        btn: ['退出(Esc)']
                        ,
                        btnAlign: 'c' //按钮居中
                        ,
                        yes: function () {
                            layer.close(indexOfNumPoolDetail);
                        }
                    });

                    showNumPoolDetail(checkedScheduleDate, checkedScheduleGUID, checkedScheduleName, checkedScheduleTeamGUID, checkedScheduleTeamName);
                } else {
                    layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>没有诊室开放！');
                }

            });
        },
        error: function () {
            layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>服务器忙！请稍后再试。</i>');
        }
    });
}

/**
 * 通过总号数和已经使用号数计算出已经使用的百分比以及该使用的背景色
 *
 * //0%-20%
 <div class="layui-progress layui-progress-big" lay-showPercent="yes">
 <div class="layui-progress-bar layui-bg-blue" lay-percent="50%"></div>
 </div>
 //20%-40%
 <div class="layui-progress layui-progress-big" lay-showPercent="yes">
 <div class="layui-progress-bar layui-bg-green" lay-percent="50%"></div>
 </div>
 //40%-60%
 <div class="layui-progress layui-progress-big" lay-showPercent="yes">
 <div class="layui-progress-bar layui-bg-orange" lay-percent="50%"></div>
 </div>
 //60%-80%
 <div class="layui-progress layui-progress-big" lay-showPercent="yes">
 <div class="layui-progress-bar layui-bg-red" lay-percent="50%"></div>
 </div>
 //80%-100%
 <div class="layui-progress layui-progress-big" lay-showPercent="yes">
 <div class="layui-progress-bar layui-bg-cyan" lay-percent="50%"></div>
 </div>
 //100%
 <div class="layui-progress layui-progress-big" lay-showPercent="yes">
 <div class="layui-progress-bar layui-bg-black" lay-percent="50%"></div>
 </div>
 *
 * @param teamtotalnum
 * @param teamusednum
 */
function getPercentAndBgColorArrayForProgress(teamtotalnum, teamusednum) {
    var percentAndBgColorArray = [];

    teamtotalnum = parseFloat(teamtotalnum);
    teamusednum = parseFloat(teamusednum);

    percentAndBgColorArray[0] = teamtotalnum <= 0 ? "100%" : Math.round(teamusednum / teamtotalnum * 100) + "%";
    //背景色的class名称
    var number = teamtotalnum <= 0 ? 1.0 : teamusednum / teamtotalnum;
    if (number < 0.2) {
        percentAndBgColorArray[1] = 'layui-bg-blue';
    } else if (number < 0.4) {
        percentAndBgColorArray[1] = 'layui-bg-green';
    } else if (number < 0.6) {
        percentAndBgColorArray[1] = 'layui-bg-orange';
    } else if (number < 0.8) {
        percentAndBgColorArray[1] = 'layui-bg-red';
    } else if (number < 1.0) {
        percentAndBgColorArray[1] = 'layui-bg-cyan';
    } else {
        percentAndBgColorArray[1] = 'layui-bg-black';
    }

    return percentAndBgColorArray;
}


/**
 * 更新可用的诊室
 * 以及剩余号、加号情况
 * 如果勾选了项目，还要显示能否预约
 * 20190111: 已经查询了每个诊室剩余号，那么收集勾选项目在reqinfo的索引，计算总共需要占用的号数，更新可用的诊室显示。根据总的号数来判断是否开启诊室
 */
function updateAvailableTeam() {
    //点击取消的时候，也要更新诊室能否选择!!--其实就是先禁用所有
    openTeam(0);
    //如果没有选择项目，禁用时段选择。-20190116：时段一直都可以选择
    // disableScheduleRadio();
    //更新剩余号、加号
    updateLeftNum();
    //总的选择的检查项目个数
    var checkedEitemCount = -1;

    if (reqinfo && reqinfo.returncode === 0 && reqinfo.reqlist.length > 0) {
        //所选的项目的占用号数量
        //20190123：现在不缓存检查项目，不计算选择的检查项目占用号数，为了不大改原来的逻辑，这里将占用号数写死为1。
        var allNeedNumCount = 1;

        //获取所有被选中的检查项目，[[0,1],[1]] ,那么有多少个申请单就应该初始化多少个里层数组
        //外层数组的下标代表申请单的下标，里层数组的下标表示检查项目的下标
        var examItemsArr = [];
        for (var reqIndex = 0; reqIndex < reqinfo.reqlist.length; reqIndex++) {
            examItemsArr[reqIndex] = [];
        }
        $('#examItemContent input:checkbox').each(function () {
            if ($(this).prop('checked') === true) {
                var checkedValue = $(this).val();
                //检查项目的checkbox的value命名规则是：申请单下标-检查项目下标
                var split = checkedValue.split("-");
                examItemsArr[split[0]].push(parseInt(split[1]));
            }
        });
        //循环外层数组，计算总的选择的检查项目计数
        checkedEitemCount = 0;
        for (var reqIdx = 0; reqIdx < examItemsArr.length; reqIdx++) {
            checkedEitemCount += examItemsArr[reqIdx].length;
            /*
            if (examItemsArr[reqIdx].length <= 0) {
                continue;
            }
            //一次循环既是一个申请单
            var req = reqinfo.reqlist[reqIdx];

            for (var j = 0; j < examItemsArr[reqIdx].length; j++) {
                checkedEitemCount++;
                /!*var oneEitem = req.eitemlist[examItemsArr[reqIdx][j]];
                // 计算占用号数。通过项目guid来识别，申请单中的 eitem.eitemkey = dicdata.eitemguid。注意guid有特殊符号，使用[]来进行取值
                allNeedNumCount += eitemDic[oneEitem.eitemkey].eitemnumcount;*!/
            }
            */
        }
        //全部需要的号数计算完毕
        //显示总的占用号数。已选择：3个检查项目，总计占号8个
        /*if (checkedEitemCount > 0) {
            checkedEitemSummary += checkedEitemCount + " 个检查项目";
        }*/
        //如果没有选择检查项目
        if (checkedEitemCount === 0) {
            allNeedNumCount = 0;
        }
        //开放诊室
        openTeam(allNeedNumCount);
        //全部放开时段选择--20190116：时段不会被禁用了，那么也就不存在放开时段选择
        // enableScheduleRadio();
        //更新receptionSummary
        updateReceptionSummary();
    }
    //更新选择项目的summary显示
    updateCheckedEitemSummary(checkedEitemCount);
}

/**
 * 开启诊室
 * 根据诊室剩余号是否能够满足预约来计算
 */
function openTeam(allNeedNumCount) {
    //首先禁用所有诊室的选项
    disableTeamCheckbox();
    //根据所需和所剩号数开启诊室
    enableTeamCheckboxByNumCount(allNeedNumCount);
}


/**
 * 全选/取消全选所有检查项目
 */
function selectUnselectAllEitem(ele) {
    //先选择全部，再排除被disabled了的
    var oneReqEitem = $(ele).parents('.oneReq').find('input').not('input[disabled]');
    var checkedEitems = $(ele).parents('.oneReq').find('input:checked');
    //如果已经有选择的了，而且没有全部选择，则全选!!!牛逼的逻辑
    if (checkedEitems.length < oneReqEitem.length) {
        //全选
        oneReqEitem.prop('checked', true);
    } else {
        //取消全选
        oneReqEitem.prop('checked', false);
    }
    //局部渲染
    layui.form.render('checkbox', 'examItemFatherDiv');
    //要跟手动点击一样，调用函数
    updateAvailableTeam();
}


/**
 * 全选/取消全选所有检查项目
 * 在修改急诊的时候使用
 */
function selectUnselectAllEitemForOneReqInSetregtypeForm(ele) {
    //先选择全部，再排除被disabled了的
    var oneReqEitem = $(ele).parents('.oneReq').find('input').not('input[disabled]');
    var checkedEitems = $(ele).parents('.oneReq').find('input:checked');
    //如果已经有选择的了，而且没有全部选择，则全选!!!牛逼的逻辑
    if (checkedEitems.length < oneReqEitem.length) {
        //全选
        oneReqEitem.prop('checked', true);
    } else {
        //取消全选
        oneReqEitem.prop('checked', false);
    }
    //局部渲染
    layui.form.render('checkbox', 'set_reg_type_reqinfo_form');
}

/**
 * 全选/取消全选所有可以取消的检查项目
 * 所有，而不区分申请单
 */
function selectUnselectAllEitemForGiveup() {
    //先选择全部，再排除被disabled了的
    var oneReqEitem = $('#giveup_num_form').find('input').not('input[disabled]');
    var checkedEitems = $('#giveup_num_form').find('input:checked');
    //如果已经有选择的了，而且没有全部选择，则全选!!!牛逼的逻辑
    if (checkedEitems.length < oneReqEitem.length) {
        //全选
        oneReqEitem.prop('checked', true);
    } else {
        //取消全选
        oneReqEitem.prop('checked', false);
    }
    //局部渲染
    layui.form.render('checkbox', 'giveup_num_form');
}

/**
 * 全选/取消全选所有可以修改急诊的检查项目
 * 所有，而不区分申请单
 */
function selectUnselectAllEitemSetregtype() {
    //先选择全部，再排除被disabled了的
    var oneReqEitem = $('#setRegTypeReqinfoForm').find('input[type="checkbox"]').not('input[disabled]');
    var checkedEitems = $('#setRegTypeReqinfoForm').find('input[type="checkbox"]:checked');
    //如果已经有选择的了，而且没有全部选择，则全选!!!牛逼的逻辑
    if (checkedEitems.length < oneReqEitem.length) {
        //全选
        oneReqEitem.prop('checked', true);
    } else {
        //取消全选
        oneReqEitem.prop('checked', false);
    }
    //局部渲染
    layui.form.render('checkbox', 'set_reg_type_reqinfo_form');
}

/**
 * 全选/取消全选所有可以补打条码的检查项目
 * 所有，而不区分申请单
 */
function selectUnselectAllEitemForBarcode() {
    //先选择全部，再排除被disabled了的
    var oneReqEitem = $('#print_barcode_form').find('input').not('input[disabled]');
    var checkedEitems = $('#print_barcode_form').find('input:checked');
    //如果已经有选择的了，而且没有全部选择，则全选!!!牛逼的逻辑
    if (checkedEitems.length < oneReqEitem.length) {
        //全选
        oneReqEitem.prop('checked', true);
    } else {
        //取消全选
        oneReqEitem.prop('checked', false);
    }
    //局部渲染
    layui.form.render('checkbox', 'print_barcode_form');
}

/**
 * 全选/取消全选所有可以签到的检查项目
 * 所有，而不区分申请单
 */
function selectUnselectAllEitemForSignin() {
    //先选择全部，再排除被disabled了的
    var oneReqEitem = $('#signin_form').find('input').not('input[disabled]');
    var checkedEitems = $('#signin_form').find('input:checked');
    //如果已经有选择的了，而且没有全部选择，则全选!!!牛逼的逻辑
    if (checkedEitems.length < oneReqEitem.length) {
        //全选
        oneReqEitem.prop('checked', true);
    } else {
        //取消全选
        oneReqEitem.prop('checked', false);
    }
    //局部渲染
    layui.form.render('checkbox', 'signin_form');
}


/**
 * 通过npguid的字符串进行签到
 * @param npguids npguid字符串
 */
function signinByNpguids(npguidsStr) {
    //首先清空显示区域
    $("#signinResultSummary").html('');

    var npguids = npguidsStr.split(";");
    for (var npguidIdx = 0; npguidIdx < npguids.length; npguidIdx++) {
        var npguid = npguids[npguidIdx];
        //拼凑签到参数
        var signinParam = {
            "npguid": npguid,
            "usercode": localStorage.getItem(param.etypecode_key) + "ReceptionUserCode",
            "examtype": localStorage.getItem(param.etypecode_key)
        };
        //访问接口，进行签到
        $.ajax({
            url: param.signin,
            contentType: 'application/json; charset=UTF-8',//设置头格式
            data: JSON.stringify(signinParam),//将json对象转换成字符串
            type: "POST",
            dataType: "json",
            success: function (result) {
                var signinSucceedContent = '';
                if (result && result.returncode === 0) {
                    //成功签到
                    if (localStorage.getItem(param.etypecode_key) === 'CS') {
                        signinSucceedContent = '<i class="layui-icon layui-icon-ok pop-icon-success layui-circle"></i>签到成功！<span class="summary">' + result.npdate + ' ' + result.teamname + ' ' + result.schename + ' ' + result.numstart + ' 号</span>'
                    } else if (localStorage.getItem(param.etypecode_key) === 'US') {
                        signinSucceedContent = '<i class="layui-icon layui-icon-ok pop-icon-success layui-circle"></i>签到成功！<span class="summary">' + result.npdate + ' ' + result.teamname + ' ' + result.schename + ' ' + result.numsignin + ' 号</span>'
                    }
                } else {
                    //签到失败
                    signinSucceedContent = '<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>' + result.returnmsg;
                }
                //将签到信息显示到区域
                //20190304：配合多个项目签到的逻辑，进行显示调整
                if (npguidIdx === 0) {
                    $("#signinResultSummary").html(signinSucceedContent);
                } else {
                    $("#signinResultSummary").html($("#signinResultSummary").html() + '<br/><br/>' + signinSucceedContent);
                }
            },
            error: function () {
                layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>服务器忙！请稍后再试。</i>');
            }
        });
    }
}

/**
 * 选择检查项目进行签到
 */
function signinCheckedEitems() {
    var checkedSignin = $("#signin_form input:checked");
    if (checkedSignin.length <= 0) {
        layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>请选择要签到的检查！');
        return;
    }
    //签到选中的单子
    var npguids = '';
    checkedSignin.each(function (i, n) {
        //拼凑npguids，调用统一的方法进行签到
        var checkedIndexOfReqinfoForSignin = $(n).val();
        if (i === checkedSignin.length - 1) {
            npguids += reqinfoForSignin.reqlist[checkedIndexOfReqinfoForSignin].reginfo.npguid;
        } else {
            npguids += reqinfoForSignin.reqlist[checkedIndexOfReqinfoForSignin].reginfo.npguid + ';';
        }
    });
    signinByNpguids(npguids);
}


/**
 * 请求服务端，设置院区和检查类型
 * 存储检查类型字典数据
 */
function setHospEtype() {
    $.ajax({
        async: false,
        url: param.initdata,
        contentType: 'application/json; charset=UTF-8',//设置头格式
        data: JSON.stringify({}),//将json对象转换成字符串
        type: "POST",
        dataType: "json",
        success: function (result) {
            //数据填充
            var hospSelectContent = "";
            var etypeSelectContent = "";
            for (var hospIndex = 0; hospIndex < result.hosplist.length; hospIndex++) {
                //回显选中
                if (result.hosplist[hospIndex].hospid === localStorage.getItem(param.hospid_key)) {
                    hospSelectContent += '<option value="' + result.hosplist[hospIndex].hospid + '" selected>' + result.hosplist[hospIndex].hospname + '</option>';
                } else {
                    hospSelectContent += '<option value="' + result.hosplist[hospIndex].hospid + '">' + result.hosplist[hospIndex].hospname + '</option>';
                }
            }
            for (var etypeIndex = 0; etypeIndex < result.etypelist.length; etypeIndex++) {
                //回显选中
                if (result.etypelist[etypeIndex].etypecode === localStorage.getItem(param.etypecode_key)) {
                    etypeSelectContent += '<option value="' + result.etypelist[etypeIndex].etypecode + '" selected>' + result.etypelist[etypeIndex].etypedesc + '</option>';
                } else {
                    etypeSelectContent += '<option value="' + result.etypelist[etypeIndex].etypecode + '">' + result.etypelist[etypeIndex].etypedesc + '</option>';
                }
            }

            layer.open({
                type: 1
                , title: '院区和检查类型选择'
                , area: ['80%', '65%']
                , offset: 'auto' //具体配置参考：offset参数项
                , content: '<form class="layui-form" lay-filter="hospEtypeForm">' +
                    '    <div class="layui-form-item">' +
                    '        <div class="layui-inline">' +
                    '            <label class="layui-form-label">院区</label>' +
                    '            <div class="layui-input-inline">' +
                    '                <select name="modules" lay-verify="required" lay-search="" id="hospSelect">' +
                    hospSelectContent +
                    '                </select>' +
                    '            </div>' +
                    '            <label class="layui-form-label">检查类型</label>' +
                    '            <div class="layui-input-inline">' +
                    '                <select name="modules" lay-verify="required" lay-search="" id="etypeSelect">' +
                    etypeSelectContent +
                    '                </select>' +
                    '            </div>' +
                    '        </div>' +
                    '    </div>' +
                    '</form>' +
                    '<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>'//chrome第一次进入弹出层的时候，按钮错位
                , btn: ['取消(Esc)', '确认']
                , btnAlign: 'c' //按钮居中
                // , shade: 0.3 //还是要显示遮罩，否则弹出了还是可以操作下面的按钮
                , yes: function () {
                    layer.closeAll();
                }
                , btn2: function () {
                    //将选中的院区和检查类型写入localStorage
                    var $hospSelect = $("#hospSelect option:selected");
                    var $etypeSelect = $("#etypeSelect option:selected");

                    localStorage.setItem(param.hospid_key, $hospSelect.val());
                    localStorage.setItem(param.hospname_key, $hospSelect.html());
                    localStorage.setItem(param.etypecode_key, $etypeSelect.val());
                    localStorage.setItem(param.etypedesc_key, $etypeSelect.html());
                    //!!!应该是在这里 模拟清空输入框点击事件
                    $("#clearCardNumInput").click();
                    //20190116：由于逻辑调整，清空输入框按钮点击事件中不再进行页面的初始化工作，所有修改院区之后，手动进行页面初始化工作
                    initPage();
                }
            });
            //局部渲染
            layui.form.render('select', 'hospEtypeForm');
            //如果这个时候localStorage中没有hospid，那么说明是第一次进入，则弹窗，方便设置允许弹窗
            if (!localStorage.getItem(param.hospid_key)) {
                //开启新窗口
                var popWindow = window.open();
                //弹出操作提示
                layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>右上角设置允许弹出式窗口');
                //关闭
                if (popWindow) {
                    popWindow.setTimeout(function () {
                        popWindow.close();
                    }, 100);
                }
            }
        },
        error: function () {
            layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>初始化服务异常，请稍后刷新页面再试！');
        }
    });
}

/**
 * 美化诊室剩余号、加号的checkbox显示
 */
function satisfyTeamCheckbox() {
    //美化诊室剩余号、加号显示
    $(".layui-tab-item input:checkbox + div").addClass("larger-checkbox");
}

/**
 * 禁用时段显示
 */
function disableScheduleRadio() {
    //禁用所有时段的选项
    $("#scheduleName input:radio").prop("disabled", "disabled");
    $("#scheduleName input:radio + div").addClass("layui-disabled");
}

/**
 * 启用时段可以选择
 */
function enableScheduleRadio() {
    //启用时段选择单选框
    $("#scheduleName input:radio").prop("disabled", false);
    $("#scheduleName input:radio + div").removeClass("layui-disabled");
}

/**
 * 禁用诊室选择
 */
function disableTeamCheckbox() {
    //禁用诊室选择的checkbox
    $("#team_area .layui-tab-content .layui-tab-item .layui-form-item input:checkbox").prop("disabled", "disabled");
    $("#team_area .layui-tab-content .layui-tab-item .layui-form-item input:checkbox").prop("checked", false);
    $("#team_area .layui-tab-content .layui-tab-item .layui-form-item .layui-form-checkbox").addClass("layui-disabled");
    $("#team_area .layui-tab-content .layui-tab-item .layui-form-item .layui-form-checkbox").removeClass("layui-form-checked");
    //20190117:不可预约的背景显示为红色
    $("#team_area .layui-tab-content .layui-tab-item .layui-form-item .layui-form-checkbox span").css("background-color", '#ED7161');

    //不可预约的图标
    $("#team_area .layui-tab-content .layui-tab-item .layui-form-item .regableIcon").html('<i class="layui-icon layui-icon-close-fill icon-style-no">不可预约</i>');
}

/**
 * 开启诊室根据剩余号和需要的号数
 */
function enableTeamCheckboxByNumCount(allNeedNumCount) {
    //清空tab上的显示
    $("#teamTitle li span[class='teamOverview']").html('');
    //启用诊室
    //openTeam中已经默认已经关闭所有了。
    if (allNeedNumCount > 0) {//如果没选项目，则不开启诊室
        $("#team_area .layui-tab-content .layui-tab-item .layui-form-item input:checkbox").each(function (i, ele) {
            var leftAdd = $(ele).val();
            var left = leftAdd.split('-')[0];
            var add = leftAdd.split('-')[1];
            //获取到了剩余号
            if (allNeedNumCount <= left) {
                //开启诊室
                $(ele).prop('disabled', false);
                $(ele).parents('.layui-input-block').find('.layui-form-checkbox').removeClass("layui-disabled");
                //20190117:可选择但是未选择的诊室背景显示为黄色
                $(ele).parents('.layui-input-block').find('.layui-form-checkbox').find('span').css('background-color', '#FFCC66');
                //图标提示
                $(ele).parents('.layui-input-block').parents('.layui-form-item').find('.regableIcon').html('<i class="layui-icon layui-icon-ok-circle icon-style-ok">可预约</i>');
                //更新tab上的图标
                var tabContentIndex = $(ele).parents('.layui-tab-item').index();
                $("#teamTitle li").eq(tabContentIndex).find(".teamOverview").html('<i class="layui-icon layui-icon-ok-circle icon-style-ok"></i>');

            } else {
                //关闭诊室。默认已经关闭所有了。

            }
        });
    }
}

/**
 * 更新选择信息的提示
 * 已选择：2019-01-26 上午 三诊室
 * 20190118:即使没有选择诊室，切换日期和时段的时候也显示已选择，更加踏实
 * 20190124:分别更新日期、诊室
 */
function updateReceptionSummary() {
    /*var summaryContent = "";*/
    var checkedTeamId = $("#teamContent .layui-form-checked").parents('.layui-form-item').prop('id');
    var checkedDate = $("#scheduleDateInput").val();
    /*var checkedScheduleName = $("#scheduleName input:checked").prop('title');*/
    if (checkedTeamId != null) {
        //诊室已经选择，那么更新日期、诊室（时段的话直接显示）
        var checkedTeamName = $("#teamContent .layui-form-checked").parents('.layui-form-item').prop('title');
        $("#preReceptionSummary_date").html(checkedDate);
        $("#preReceptionSummary_team").html(checkedTeamName);
    } else {
        //没有选择诊室，那么清空诊室、更新日期
        $("#preReceptionSummary_date").html(checkedDate);
        $("#preReceptionSummary_team").html('');
    }
}

/**
 * 格式化日期时间字符串
 * 输入日期对象，返回格式化字符串
 */
function getFormattedDatetimeStr(dateObj) {
    var year = dateObj.getFullYear();
    var month = dateObj.getMonth() + 1 < 10 ? '0' + (dateObj.getMonth() + 1) : dateObj.getMonth() + 1;
    var day = dateObj.getDate() < 10 ? '0' + dateObj.getDate() : dateObj.getDate();
    var hour = dateObj.getHours() < 10 ? '0' + dateObj.getHours() : dateObj.getHours();
    var minutes = dateObj.getMinutes() < 10 ? '0' + dateObj.getMinutes() : dateObj.getMinutes();
    var second = dateObj.getSeconds() < 10 ? '0' + dateObj.getSeconds() : dateObj.getSeconds();

    return year + "-" + month + "-" + day + " " + hour + ":" + minutes + ":" + second;
}

/**
 * 获取检查类型的字典数据
 * 改变结构，存储在全局变量
 */
function getExamTypeDic() {
    $.ajax({
        url: param.initdata,
        contentType: 'application/json; charset=UTF-8',//设置头格式
        data: JSON.stringify({}),//将json对象转换成字符串
        type: "POST",
        dataType: "json",
        success: function (result) {
            if (result) {
                var etypelist = result.etypelist;
                for (var etypeIdx = 0; etypeIdx < etypelist.length; etypeIdx++) {
                    var etypecode = etypelist[etypeIdx].etypecode;
                    //填充数据
                    examTypeDic[etypecode] = etypelist[etypeIdx];
                }
            }
        },
        error: function () {
            layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>服务器忙！请稍后再试。</i>');
        }
    });
}

/**
 * 更新星期几的显示
 * 20190117:使用了固定的日期控件，就不用去显示星期了
 */
function updateWeekShow(dateJOSNObj) {
    var date = new Date();
    if (dateJOSNObj) {
        date = new Date(dateJOSNObj.year, dateJOSNObj.month - 1, dateJOSNObj.date);
    }
    var dayOfWeekArr = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    //第几天，开始是0
    var dayIndex = date.getDay();
    //显示
    $("#weekShowArea").html(dayOfWeekArr[dayIndex]);
}


/**
 * 加减号弹出层按钮的方法
 */
//减号按钮
function toDecNumCount() {
    var numCount = $("#addNumCountInput").val();
    if (numCount <= 0) {
        numCount = 0;
    } else {
        numCount--;
    }
    $("#addNumCountInput").val(numCount);
}

//加号按钮
function toIncNumCount() {
    var numCount = $("#addNumCountInput").val();
    if (numCount <= 0) {
        numCount = 1;
    } else {
        numCount++;
    }
    $("#addNumCountInput").val(numCount);
}


/**
 * 更新加减号的summary
 */
function updateAddNumSummary(teamguid) {
    var addNumSummary = "";

    var scheduleDate = $("#scheduleDateInput").val();
    var scheduleName = $("#scheduleName input[name='scheduleName']:checked").prop('title');
    //根据teamguid查询到诊室的号池信息
    var teamName = $("#" + teamguid + " .team-name").html();
    var teamNumStatusArr = $("#" + teamguid + " input[name='teamSchedule']").prop('title').split('-');

    addNumSummary += scheduleDate + ' ' + scheduleName + ' <span class="text-highlight">' + teamName + '</span>，总号数：' + teamNumStatusArr[0] + '，已使用：' + teamNumStatusArr[1] + '，剩余号：' + (teamNumStatusArr[0] - teamNumStatusArr[1]);//加号
    //设置显示到对应区域
    $("#addNumSummary").html(addNumSummary);
}


/**
 * jQuery函数拿背景颜色十六进制值的方法
 */
$.fn.getBackgroundColor = function () {
    var rgb = $(this).css('background-color');
    if (rgb >= 0) {
        //如果是一个hex值则直接返回
        return rgb;
    } else {
        rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

        function hex(x) {
            return ("0" + parseInt(x).toString(16)).slice(-2);
        }

        rgb = "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }
    return rgb;
};


/**
 * 将根据输入的卡号查询申请单信息并设置显示的代码独立为一个方法
 */
function queryByCardNum() {
    //置空申请单信息
    reqinfo = {};
    //退出预约模式
    exitModifyRegMode();
    //首先清空检查项目区域的显示
    $("#examItemContent").html('');

    var cardNum = $("#cardNumInput").val();
    if (cardNum && '' !== cardNum.trim()) {
        cardNum = cardNum.trim();
        //执行Ajax请求，获取申请单信息
        //20190114: 改成同步的，防止多个输入事件同时执行，并发导致逻辑问题。
        $.ajax({
            async: false,
            url: param.reqinfo,
            contentType: 'application/json; charset=UTF-8',//设置头格式
            data: JSON.stringify({"card": cardNum, "hospid": localStorage.getItem(param.hospid_key)}),//将json对象转换成字符串
            type: "POST",
            dataType: "json",
            success: function (result) {
                if (result && result.returncode === 0) {
                    //将申请单信息赋给变量
                    reqinfo = result;
                    //成功返回了申请单信息，循环申请单信息，将检查项目填充到下方区域
                    var reqlist = result.reqlist;

                    //20190123:如果没有申请单信息，给出提示，方法结束
                    if (reqlist.length <= 0) {
                        layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>无此申请单信息！</i>');
                        //更新各种summary
                        updateReceptionSummary();
                        updatePatInfoSummary();
                        updateRegAbleEitemSummary(-1);
                        updateCheckedEitemSummary(-1);

                        return;
                    }

                    //先根据 hiscode 和 hissubcode 计算总共有 几个申请单 ，即需要几个class为oneReq的div。div的id命名为 hiscode-hissubcode
                    for (var reqIndexForDiv = 0; reqIndexForDiv < reqlist.length; reqIndexForDiv++) {
                        //20190308：判断是否缴费
                        var paid = reqlist[reqIndexForDiv].paid;
                        //每个单子显示 门诊/住院 ，普通/急诊
                        //20190222：添加 0-门诊/1-住院，预约类型 0-普通/1-急诊
                        var pattypecode = reqlist[reqIndexForDiv].pattypecode;
                        var pattype = '';
                        if (pattypecode === '0') {
                            pattype = '门诊';
                        } else if (pattypecode === '1') {
                            pattype = '住院';
                        }
                        var regtypecode = reqlist[reqIndexForDiv].regtypecode;
                        var regtype = '';
                        if (regtypecode === '0') {
                            regtype = '普通';
                        } else if (regtypecode === '1') {
                            regtype = '<span class="little-tips">急诊</span>';
                        }

                        var oneReqId = reqlist[reqIndexForDiv].hiscode + "-" + reqlist[reqIndexForDiv].hissubcode;
                        var examtype = reqlist[reqIndexForDiv].examtype;
                        //先把这几个空div设置到页面，方便下面填充
                        //赋值到显示区域
                        //先判断 $("#examItemContent").html() 下有没有这个id的div
                        //20190401：而且是当前检查类型。
                        if ($("#" + oneReqId).length <= 0 && examtype === localStorage.getItem(param.etypecode_key)) {
                            var examItemContent = "<div class='oneReq' id='" + oneReqId + "'>";
                            //加一个开单时间
                            if (paid && paid === true) {
                                examItemContent += "<div class='reqdatetime'>" + pattype + " " + regtype + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "开单时间：" + reqlist[reqIndexForDiv].reqdatetime + "</div>";
                            } else {
                                examItemContent += "<div class='reqdatetime'><span class='not-paid'><i class='layui-icon layui-icon-close pop-icon-error layui-circle icon-close-not-paid'></i>未缴费&nbsp;&nbsp;</span>" + pattype + " " + regtype + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "开单时间：" + reqlist[reqIndexForDiv].reqdatetime + "</div>";
                            }

                            //加一个全选按钮、取消全选按钮.！！！注意，button不加type的话再chrome会被自动识别为type='submit'，回车就自动提交了。
                            examItemContent += "<button type='button' class='layui-btn layui-btn-radius layui-btn-primary layui-btn-sm selectUnselectBtns' onclick='selectUnselectAllEitem(this)'>全选/取消全选</button>" +
                                "</div>";
                            //如果没有这个单子的div
                            $("#examItemContent").append(examItemContent);
                        }
                    }
                    //20190124：当前检查类型总计可预约项目的计数
                    var regAbleEitemCount = 0;
                    //循环申请单
                    for (var reqIndex = 0; reqIndex < reqlist.length; reqIndex++) {
                        //20190308：判断是否缴费
                        var paidForOneInput = reqlist[reqIndex].paid;

                        var eitemlist = reqlist[reqIndex].eitemlist;
                        var oneReqDivId = reqlist[reqIndex].hiscode + "-" + reqlist[reqIndex].hissubcode;

                        var oneReqContent = "";
                        //循环一个申请单中的检查项目
                        for (var eitemIndex = 0; eitemIndex < eitemlist.length; eitemIndex++) {
                            var eitem = eitemlist[eitemIndex];
                            //检查项目的checkbox的value命名规则是：申请单下标-检查项目下标
                            var eitemid = reqIndex + "-" + eitemIndex;
                            var eitemname = eitem.eitemname;
                            var eitemnumcount = eitem.eitemnumcount;
                            //20190222：bug，如果名称中含有空格，那么第一个空格之后的内容不会显示了，查看节点 title的值变为了
                            //20190114：不能预约-disabled，先判断是否是当前检查类型的项目、再判断是不是已经预约了。
                            if (reqlist[reqIndex].examtype === localStorage.getItem(param.etypecode_key)) {
                                //是当前类型的检查项目
                                //判断是否能预约
                                if (reqlist[reqIndex].reginfo) {
                                    //20190308：判断是否缴费
                                    if (paidForOneInput && paidForOneInput === true) {
                                        oneReqContent += '<div class="layui-input-block">' +
                                            '<input disabled type="checkbox" name="examItem" class="reged" lay-filter="examItem" lay-skin="primary" value=' + eitemid + ' data-eitemnumcount=' + eitemnumcount + ' title="' + eitemname + '">';
                                    } else {
                                        oneReqContent += '<div class="layui-input-block">' +
                                            '<input disabled type="checkbox" name="examItem" class="reged" lay-filter="examItem" lay-skin="primary" value=' + eitemid + ' data-eitemnumcount=' + eitemnumcount + ' title="' + eitemname + '">';
                                    }
                                    //已经预约，将预约详情展示到界面
                                    var npstatus2 = reqlist[reqIndex].reginfo.npstatus;
                                    var npstatusdesc2 = reqlist[reqIndex].reginfo.npstatusdesc;
                                    //如果是已经预约的状态，即npstatus = N ，那么给出已预约详情
                                    if (npstatus2 === 'N') {
                                        if (localStorage.getItem(param.etypecode_key) === 'CS') {
                                            oneReqContent += '<i class="layui-icon layui-icon-ok eitem-tips">已预约：' + reqlist[reqIndex].reginfo.teamname + ' ' + reqlist[reqIndex].reginfo.npdate + ' ' + reqlist[reqIndex].reginfo.schename + ' ' + (reqlist[reqIndex].reginfo.numstart == null ? '' : reqlist[reqIndex].reginfo.numstart + '号') + '</i>';
                                        } else if (localStorage.getItem(param.etypecode_key) === 'US') {
                                            oneReqContent += '<i class="layui-icon layui-icon-ok eitem-tips">已预约：' + reqlist[reqIndex].reginfo.teamname + ' ' + reqlist[reqIndex].reginfo.npdate + ' ' + reqlist[reqIndex].reginfo.schename + '</i>';
                                        }
                                    } else if (npstatus2 === 'Q') {
                                        if (localStorage.getItem(param.etypecode_key) === 'CS') {
                                            oneReqContent += '<i class="layui-icon layui-icon-flag eitem-tips">已签到：' + reqlist[reqIndex].reginfo.teamname + ' ' + reqlist[reqIndex].reginfo.npdate + ' ' + reqlist[reqIndex].reginfo.schename + ' ' + reqlist[reqIndex].reginfo.numstart + ' 号</i>';
                                        } else if (localStorage.getItem(param.etypecode_key) === 'US') {
                                            oneReqContent += '<i class="layui-icon layui-icon-flag eitem-tips">已签到：' + reqlist[reqIndex].reginfo.teamname + ' ' + reqlist[reqIndex].reginfo.npdate + ' ' + reqlist[reqIndex].reginfo.schename + ' ' + reqlist[reqIndex].reginfo.signinnum + ' 号</i>';
                                        }
                                    } else {
                                        oneReqContent += '<i class="layui-icon layui-icon-ok eitem-tips">' + npstatusdesc2 + '</i>';
                                    }

                                    oneReqContent += '</div>';
                                    //如果要补打条码，则根据 申请单索引 来查找预约信息。
                                } else {
                                    //未预约，即是可预约
                                    //20190308：判断是否已经缴费
                                    if (paidForOneInput && paidForOneInput === true) {
                                        oneReqContent += '<div class="layui-input-block">' +
                                            '<input type="checkbox" name="examItem" lay-filter="examItem" lay-skin="primary" value=' + eitemid + ' data-eitemnumcount=' + eitemnumcount + ' title="' + eitemname + '">' +
                                            '</div>';
                                    } else {
                                        oneReqContent += '<div class="layui-input-block">' +
                                            '<input disabled type="checkbox" name="examItem" lay-filter="examItem" lay-skin="primary" value=' + eitemid + ' data-eitemnumcount=' + eitemnumcount + ' title="' + eitemname + '">' +
                                            '</div>';
                                    }
                                    //20190124:在这里进行可预约项目的计数工作。
                                    regAbleEitemCount++;
                                }
                            }
                        }
                        //将一个req设置到应该的位置
                        $("#" + oneReqDivId).append(oneReqContent);
                    }
                    //更新病人基本信息的显示
                    var firstReq = reqlist[0];

                    var patInfo = firstReq.patname + ' ' + firstReq.patsex + ' ' + firstReq.patage + firstReq.patageunit;
                    updatePatInfoSummary(patInfo);
                    //更新总计项目计数的显示
                    updateRegAbleEitemSummary(regAbleEitemCount);
                    //20190115：检查项目已经显示完毕，如果全部的有效检查项目只有一个，那么默认选中
                    var availableEitem = $("#examItemContent input[name='examItem']").not('input[disabled]');
                    if (availableEitem.length === 1) {
                        //只有一个有效项目，默认选中
                        $("#examItemContent input[name='examItem']").not('input[disabled]').prop('checked', true);
                    }
                    //模拟检查项目被选中的点击事件--无论是否选中都模拟一下点击。方便预约成功和取消预约之后更新界面
                    updateAvailableTeam();

                    //注意！layui需要对动态添加的表单进行再渲染才会显示！
                    //利用lay-filter只渲染更新的部分。lay-filter的值是lay-form所在元素得lay-filter的值
                    //将值放在父元素上可以实现局部更新
                    layui.form.render('checkbox', 'examItemFatherDiv');
                } else {
                    layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>没有申请单信息' + (result == null ? '' : '：' + result.returnmsg));
                }
            },
            error: function () {
                layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>服务器忙！请稍后再试。</i>');
            }
        });
    } else {
        //没有有效的就诊卡号输入
        layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>请刷卡或输入就诊卡号！</i>');
        //输入框获得焦点
        $("#cardNumInput").val('');
        $("#cardNumInput").focus();
    }
}


/**
 * 更新注意事项的显示
 * 20190125:为使页面更简介，不显示注意事项，但是仍然可以编辑
 */
function updateConsiderations() {
    var considerations = localStorage.getItem(param.considerations_key);
    if (considerations) {
        $("#considerations").html(considerations);
    } else {
        //默认--之所以加\n是方便编辑预览的时候显示好看
        $("#considerations").html('◉ 请按照小票规定时间在自助机处签到，过时需要重新预约；');
    }
}


/**
 * 更新病人基本信息的summary
 */
function updatePatInfoSummary(patInfo) {
    if (patInfo) {
        $("#patInfoSummary").html(patInfo);
    } else {
        $("#patInfoSummary").html('');
    }
}

/**
 * 更新总计检查项目、已选择检查项目的计数
 * -1作为清空显示的标志
 */
function updateRegAbleEitemSummary(regAbleEitemCount) {
    if (regAbleEitemCount === -1) {
        $("#regAbleEitemSummary").html('总计：');
    } else {
        $("#regAbleEitemSummary").html('总计：' + regAbleEitemCount + " 个可预约的 " + localStorage.getItem(param.etypedesc_key) + " 检查项目");
    }
}

/**
 * 更新已经选择检查项目
 * -1作为清空显示的标志
 */
function updateCheckedEitemSummary(checkedEitemCount) {
    if (checkedEitemCount === -1) {
        $("#checkedEitemSummary").html('已选择：');
    } else {
        $("#checkedEitemSummary").html('已选择：' + checkedEitemCount + " 个检查项目");
    }
}

/**
 * 进入修改预约模式
 * 参照谷歌隐私模式
 * 改变检查项目区域的底色、禁用掉
 */
function enterModifyRegMode() {
    //修改背景色，表示处于修改预约模式
    $(".exam_item").addClass('modify-reg-mode');
    $("#modifyRegModeTag").show();
    //修改是否是修改模式的标志
    isInModifyRegMode = true;
    //将预约按钮修改为修改、修改预约修改为退出,并改变背景色。精准预约为精准修改
    $("#operate_reg_btn").html('<i class="layui-icon layui-icon-log"></i>确认修改(F7)');
    $("#specify_operate_reg_btn").html('<i class="layui-icon layui-icon-date"></i>精准修改');
    $("#operate_modify_reg_btn").html('<i class="layui-icon layui-icon-edit"></i>退出修改');
    $("#operate_reg_btn").addClass('modify-reg-mode');
    $("#specify_operate_reg_btn").addClass('modify-reg-mode');
    $("#operate_modify_reg_btn").addClass('modify-reg-mode');
    //隐藏检查项目旁边的summary
    $("#regAbleEitemSummary").hide();
    $("#checkedEitemSummary").hide();
}

/**
 * 退出修改预约模式
 * 和进入时候相反
 */
function exitModifyRegMode() {
    //修改背景色，表示处于修改预约模式
    $(".exam_item").removeClass('modify-reg-mode');
    $("#modifyRegModeTag").hide();
    //修改是否是修改模式的标志
    isInModifyRegMode = false;
    //将预约按钮修改为修改、修改预约修改为退出--还原
    $("#operate_reg_btn").html('<i class="layui-icon layui-icon-log"></i>预约(F7)');
    $("#specify_operate_reg_btn").html('<i class="layui-icon layui-icon-date"></i>精准预约');
    $("#operate_modify_reg_btn").html('<i class="layui-icon layui-icon-edit"></i>修改预约');
    $("#operate_reg_btn").removeClass('modify-reg-mode');
    $("#specify_operate_reg_btn").removeClass('modify-reg-mode');
    $("#operate_modify_reg_btn").removeClass('modify-reg-mode');
    //显示检查项目旁边的summary
    $("#regAbleEitemSummary").show();
    $("#checkedEitemSummary").show();
}

/**
 * 通过reqinfo返回信息签到
 * 20190402：构造可签到信息时判断时间到没到签到时间
 *
 */
function signinByReqinfoReturnMsg(result) {
    //获取服务器当前时间
    var datetimeArr = getCurrentTime();
    //存储到签到全局变量
    reqinfoForSignin = result;
    //解析结果：属于当前检查类型、且有reginfo节点的、号池状态为N或Q的申请单可以弃号
    var currentExamType = localStorage.getItem(param.etypecode_key);
    var reqlist = result.reqlist;
    var signinAbleContent = '<fieldset class="layui-elem-field fieldset-sm"><legend>以下是未签到的检查</legend>' +
        "<button type='button' class='layui-btn layui-btn-radius layui-btn-primary layui-btn-sm selectUnselectBtnsForBarcode' id='selectUnselectBtnsForSignin' onclick='selectUnselectAllEitemForSignin()'>全选/取消全选</button>" +
        "<button type='button' class='layui-btn layui-btn-radius layui-btn-default layui-btn-sm' id='signinCheckedEitems' onclick='signinCheckedEitems()'>确认签到</button>" +
        '<form class="layui-form" lay-filter="signin_form" id="signin_form">';
    for (var reqIdxForSignin = 0; reqIdxForSignin < reqlist.length; reqIdxForSignin++) {
        var req = reqlist[reqIdxForSignin];
        //20190308：判断是否缴费
        var paid = req.paid;
        //========================================================================
        //20190314：由于通过npguid查询的reinfo没有paid节点，所以没有就当已缴费吧
        paid = paid ? paid : true;
        //========================================================================
        //只有处于 N 状态的才能进行签到，Q的已经签到，直接不展示
        if (req.examtype === currentExamType && req.reginfo && req.reginfo.npstatus === 'N') {
            //每个单子显示 门诊/住院 ，普通/急诊
            //20190222：添加 0-门诊/1-住院，预约类型 0-普通/1-急诊
            var pattypecode = req.pattypecode;
            var pattype = '';
            if (pattypecode === '0') {
                pattype = '门诊';
            } else if (pattypecode === '1') {
                pattype = '住院';
            }
            var regtypecode = req.regtypecode;
            var regtype = '';
            if (regtypecode === '0') {
                regtype = '普通';
            } else if (regtypecode === '1') {
                regtype = '<span class="little-tips">急诊</span>';
            }

            //可签到
            //弹出层，列出可签到的申请单列表，选择然后弃号
            //结构跟主界面展示检查项目类似，checkbox的值为申请单在reqinfo中的索引
            //获取申请单中的检查项目
            var eitemname = "";
            for (var eitemIdxForSignin = 0; eitemIdxForSignin < req.eitemlist.length; eitemIdxForSignin++) {
                if (eitemIdxForSignin === req.eitemlist.length - 1) {
                    eitemname += req.eitemlist[eitemIdxForSignin].eitemname;
                } else {
                    eitemname += req.eitemlist[eitemIdxForSignin].eitemname + "；";
                }
            }

            //20190308:判断是否缴费
            if (paid && paid === true) {
                //继续判断签到时间是否到了--签到开始时间提前30分钟--注意60进制的影响！！！不是减去30
                if (req.reginfo.npdate === datetimeArr[0] && req.reginfo.schebegintime - 70 <= datetimeArr[1] && req.reginfo.scheendtime >= datetimeArr[1]) {
                    //在可签到范围内
                    signinAbleContent += "<div class='oneReq'>" +
                        //加一个开单时间
                        "<div class='reqdatetime'>" + pattype + " " + regtype + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "开单时间：" + req.reqdatetime + "</div>";

                    signinAbleContent += '<div class="layui-input-block">' +
                        '<input type="checkbox" checked name="reqForSignin" lay-filter="reqForSignin" lay-skin="primary" value=' + reqIdxForSignin + ' title="' + eitemname + '">';
                } else {
                    //不在可签到范围内
                    signinAbleContent += "<div class='oneReq'>" +
                        //加一个开单时间
                        "<div class='reqdatetime'><span class='not-paid'><i class='layui-icon layui-icon-close pop-icon-error layui-circle icon-close-not-paid'></i>未到签到时间&nbsp;&nbsp;</span>" + pattype + " " + regtype + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "开单时间：" + req.reqdatetime + "</div>";

                    signinAbleContent += '<div class="layui-input-block">' +
                        '<input disabled type="checkbox" name="reqForSignin" lay-filter="reqForSignin" lay-skin="primary" value=' + reqIdxForSignin + ' title="' + eitemname + '">';
                }
            } else {
                //未缴费直接就是disabled了，不再进行是否在范围之内的判断了。
                signinAbleContent += "<div class='oneReq'>" +
                    //加一个开单时间
                    "<div class='reqdatetime'><span class='not-paid'><i class='layui-icon layui-icon-close pop-icon-error layui-circle icon-close-not-paid'></i>未缴费&nbsp;&nbsp;</span>" + pattype + " " + regtype + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "开单时间：" + req.reqdatetime + "</div>";

                signinAbleContent += '<div class="layui-input-block">' +
                    '<input disabled type="checkbox" name="reqForSignin" lay-filter="reqForSignin" lay-skin="primary" value=' + reqIdxForSignin + ' title="' + eitemname + '">';
            }

            if (localStorage.getItem(param.etypecode_key) === 'CS') {
                signinAbleContent += '<i class="layui-icon layui-icon-ok eitem-tips">已预约：' + req.reginfo.teamname + ' ' + req.reginfo.npdate + ' ' + req.reginfo.schename + ' ' + (req.reginfo.numstart == null ? '' : req.reginfo.numstart + '号') + '</i>';
            } else if (localStorage.getItem(param.etypecode_key) === 'US') {
                signinAbleContent += '<i class="layui-icon layui-icon-ok eitem-tips">已预约：' + req.reginfo.teamname + ' ' + req.reginfo.npdate + ' ' + req.reginfo.schename + '</i>';
            }

            signinAbleContent += '</div>';

            signinAbleContent += '</div>';
        }
    }
    signinAbleContent += "</form>";
    signinAbleContent += "</fieldset>";
    //数据准备完毕，显示可签到的选择框
    $("#signinResultSummary").html(signinAbleContent);
    //渲染显示
    layui.form.render('checkbox', 'signin_form');
    //如果下面实际上没有内容，给出提示
    var lengthOfItemSignable = $("#signin_form .layui-form-checkbox").length;
    if (lengthOfItemSignable <= 0) {
        $("#signinResultSummary").html('<span class="no-signinable-summary"><i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>没有可供签到的检查！若要查看已签到信息，请在首页扫码查询</span>');
    }
}

/**
 * 通过reqinfo返回信息列出该申请单号的检查，并进行退费准备
 * 虽然现在不能一个单子分开预约，但是还是需要判断拼接项目名称，因为存在一个单子两个项目返回的reqlist中是分开的。
 */
function setClinicPatRefundByReqinfoReturnMsg(hisCodeVal, result) {
    //解析结果：属于当前检查类型、申请单号相等的一整条检查可以退费
    var currentExamType = localStorage.getItem(param.etypecode_key);
    var reqlist = result.reqlist;
    var setClinicPatRefundAbleContent = '<fieldset class="layui-elem-field fieldset-sm"><legend>以下是该申请单号的检查项目</legend>' +
        '<form class="layui-form" lay-filter="set_clinic_pat_refund_able_form" id="set_clinic_pat_refund_able_form">';
    //这些需要的参数全部放到循环外面
    var lay_filter = "d" + 'a' + "t" + 'a' + '-' + "s" + 'i' + "g" + "n" + 'a' + 't' + "u" + 'r' + 'e';
    //处于任意状态都可以进行操作退费，只是把状态展示出来
    for (var reqIdxForSetClinicPatRefundAble = 0; reqIdxForSetClinicPatRefundAble < reqlist.length; reqIdxForSetClinicPatRefundAble++) {
        var req = reqlist[reqIdxForSetClinicPatRefundAble];
        //20190415：现在已经不可能一个单子分开预约了，除非取消的时候忘了取消，这里的拼接只是为了展示提示，实际上退费还是靠的那个申请单号
        //每个单子显示 门诊/住院 -- 住院的不让退费
        if (req.examtype === currentExamType && req.hiscode === hisCodeVal) {
            //20190222：添加 0-门诊/1-住院，预约类型 0-普通/1-急诊
            var pattypecode = req.pattypecode;
            var pattype = '';
            var patoutpatno = '';
            if (pattypecode === '0') {
                pattype = '门诊';
                patoutpatno = req.patoutpatno;
            } else if (pattypecode === '1') {
                pattype = '住院';

            }
            var lay_filters = hex_md5(patoutpatno);

            //checkbox的值为申请单号
            //判断是否门诊病人
            if (pattypecode === '0') {
                //门诊的，可以执行退费操作
                setClinicPatRefundAbleContent += "<div class='oneReq'>" +
                    //加一个开单时间
                    "<div class='reqdatetime'>" + pattype + " " + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "开单时间：" + req.reqdatetime + "</div>" +
                    '<div class="layui-input-block">' +
                    '<input ' + lay_filter + '="' + lay_filters + '" type="checkbox" checked name="reqForsetClinicPatRefundAble" lay-filter="reqForsetClinicPatRefundAble" lay-skin="primary" value=' + req.hiscode + ' title="">';
            } else {
                //不是门诊的，不能进行退费操作要给出提示
                setClinicPatRefundAbleContent += "<div class='oneReq'>" +
                    //加一个开单时间
                    "<div class='reqdatetime'><span class='not-paid'><i class='layui-icon layui-icon-close pop-icon-error layui-circle icon-close-not-paid'></i>非门诊申请单&nbsp;&nbsp;</span>" + pattype + " " + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "开单时间：" + req.reqdatetime + "</div>" +
                    '<div class="layui-input-block">' +
                    '<input disabled ' + lay_filter + '="' + lay_filters + '"  type="checkbox" name="reqForsetClinicPatRefundAble" lay-filter="reqForsetClinicPatRefundAble" lay-skin="primary" value=' + req.hiscode + ' title="">';
            }

            if (req.reginfo) {
                if (localStorage.getItem(param.etypecode_key) === 'CS') {
                    setClinicPatRefundAbleContent += '<i class="layui-icon layui-icon-ok eitem-tips">' + req.reginfo.npstatusdesc + '：' + req.reginfo.teamname + ' ' + req.reginfo.npdate + ' ' + req.reginfo.schename + ' ' + (req.reginfo.numstart == null ? '' : req.reginfo.numstart + '号') + '</i>';
                } else if (localStorage.getItem(param.etypecode_key) === 'US') {
                    setClinicPatRefundAbleContent += '<i class="layui-icon layui-icon-ok eitem-tips">' + req.reginfo.npstatusdesc + '：' + req.reginfo.teamname + ' ' + req.reginfo.npdate + ' ' + req.reginfo.schename + ' ' + (req.reginfo.signin === true ? req.reginfo.signinnum + '号' : '') + '</i>';
                }
            }

            setClinicPatRefundAbleContent += '</div>' +
                '</div>';
            //直接break掉，循环外再循环设置项目名称
            break;
        }
    }
    setClinicPatRefundAbleContent += "</form>" +
        "</fieldset>";
    //数据准备完毕，显示可退费的选择框
    $("#setClinicPatRefundSummary").html(setClinicPatRefundAbleContent);
    //20190415：再次循环，获取该单号的检查项目名称，设置到title
    var eitemname = '';
    for (var reqIdxForEitemname = 0; reqIdxForEitemname < reqlist.length; reqIdxForEitemname++) {
        var reqForEitemname = reqlist[reqIdxForEitemname];
        if (reqForEitemname.examtype === currentExamType && reqForEitemname.hiscode === hisCodeVal) {
            for (var eitemIdxForEitemname = 0; eitemIdxForEitemname < reqForEitemname.eitemlist.length; eitemIdxForEitemname++) {
                eitemname += reqForEitemname.eitemlist[eitemIdxForEitemname].eitemname + "；";
            }
        }
    }
    //去掉最后一个分号
    if (eitemname.charAt(eitemname.length - 1) === '；') {
        eitemname = eitemname.substr(0, eitemname.length - 1)
    }

    $("#set_clinic_pat_refund_able_form .oneReq:eq(0) input[type='checkbox']").prop('title', eitemname);

    //渲染显示
    layui.form.render('checkbox', 'set_clinic_pat_refund_able_form');
    //如果下面实际上没有内容，给出提示
    var lengthOfItemRefundAble = $("#set_clinic_pat_refund_able_form .layui-form-checkbox").length;
    if (lengthOfItemRefundAble <= 0) {
        $("#setClinicPatRefundSummary").html('<span class="no-signinable-summary"><i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>没有可供退费的门诊申请单记录！</span>');
    }
}

/**
 * 通过reqinfo返回信息进行可修改急诊表单的内容填充
 * 负责弹出可修改急诊的条目，类似取消预约的逻辑
 */
function setRegTypeByReqinfoReturnMsg(result) {
    if (result && result.returncode === 0) {
        //将申请单信息赋给变量
        reqinfoForSetregtype = result;
        //成功返回了申请单信息，循环申请单信息，将检查项目填充到下方区域
        var reqlist = result.reqlist;

        //20190123:如果没有申请单信息，给出提示，方法结束
        if (reqlist.length <= 0) {
            layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>无此申请单信息！</i>');

            return;
        }
        //20190315：由于机制问题，必须先把弹出层弹出来
        //准备弹出层内容
        var setRegTypeContent = '' +
            '<fieldset class="layui-elem-field"><legend>以下为可修改急诊的检查</legend>' +
            "<button type='button' class='layui-btn layui-btn-radius layui-btn-primary layui-btn-sm selectUnselectBtnsForBarcode' id='selectUnselectBtnsForSetregtype' onclick='selectUnselectAllEitemSetregtype()'>全选/取消全选</button>" +
            '   <form class="layui-form pop-form" lay-filter="set_reg_type_reqinfo_form" action="" id="setRegTypeReqinfoForm" onsubmit="return false">' +
            '       <div class="set-reg-type-radio">' +
            '           将所选的申请单全部修改为：' +
            '           <input type="radio" class="layui-form" lay-filter="regTypeRadio" name="regType" value="1" title="急诊" checked/>' +
            '           <input type="radio" class="layui-form" lay-filter="regTypeRadio" name="regType" value="0" title="普通"/>' +
            '       </div>' +
            '    </form>' +
            '</fieldset>';
        //弹出内容
        layer.open({
            type: 1
            , title: '扫描申请单或小票二维码修改急诊'
            , area: ['80%', '80%']
            , offset: 'auto' //具体配置参考：offset参数项
            , content: setRegTypeContent
            , btn: ['退出(Esc)', '确认修改急诊']
            , btnAlign: 'c' //按钮居中
            , yes: function () {
                layer.closeAll();
            }
            , btn2: function () {
                var checkedSetRegTypeReq = $("#setRegTypeReqinfoForm input[type='checkbox']:checked");
                if (checkedSetRegTypeReq && checkedSetRegTypeReq.length <= 0) {
                    layer.msg('<i class="layui-icon layui-icon-tips pop-icon-tips layui-circle"></i>请选择要修改急诊的申请单！');
                    return false;
                }
                //获取要修改的预约类型代码 0-普通，1-急诊、以及选择的申请单 的 hiscode，hissubcode(从全局变量中获取)
                var regTypeCode = $("#setRegTypeReqinfoForm .set-reg-type-radio input[name='regType']:checked").val();
                //hiscode、hissubcode
                var examItemsIdxArr = [];
                for (var reqIndex = 0; reqIndex < reqinfoForSetregtype.reqlist.length; reqIndex++) {
                    examItemsIdxArr[reqIndex] = [];
                }
                checkedSetRegTypeReq.each(function (i, n) {
                    var checkedSetRegTypeIndex = $(n).val();
                    //检查项目的checkbox的value命名规则是：申请单下标-检查项目下标
                    var split = checkedSetRegTypeIndex.split("-");
                    examItemsIdxArr[split[0]].push(parseInt(split[1]));
                });
                //循环数组，提取hiscode、hissubcode，执行修改急诊
                var hospid = localStorage.getItem(param.hospid_key);
                var etypecode = localStorage.getItem(param.etypecode_key);
                for (var reqIdx = 0; reqIdx < examItemsIdxArr.length; reqIdx++) {
                    if (examItemsIdxArr[reqIdx].length <= 0) {
                        continue;
                    }
                    var hiscode = reqinfoForSetregtype.reqlist[reqIdx].hiscode;
                    var hissubcode = reqinfoForSetregtype.reqlist[reqIdx].hissubcode;
                    //执行修改急诊api的操作
                    $.ajax({
                        url: param.setregtype,
                        contentType: 'application/json; charset=UTF-8',//设置头格式
                        data: JSON.stringify({
                            "hiscode": hiscode,
                            "hissubcode": hissubcode,
                            "isemergent": regTypeCode,//设置为急诊 1 = 急诊，0 = 平诊
                            "examtype": etypecode,
                            "hospid": hospid
                        }),
                        type: "POST",
                        dataType: "json",
                        success: function (result) {
                            if (result && result.returncode === 0) {
                                layer.msg('<i class="layui-icon layui-icon-ok pop-icon-success layui-circle"></i>修改急诊成功！');
                            } else {
                                layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>修改急诊失败！' + (result == null ? '' : '信息：' + result.returnmsg));
                            }
                        },
                        error: function () {
                            layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>服务器忙！请稍后再试。</i>');
                        }
                    });

                }
                //更新查询界面显示
                queryByCardNum();
            }
        });

        //先根据 hiscode 和 hissubcode 计算总共有 几个申请单 ，即需要几个class为oneReq的div。div的id命名为 hiscode-hissubcode
        for (var reqIndexForDiv = 0; reqIndexForDiv < reqlist.length; reqIndexForDiv++) {
            //20190308：判断是否缴费
            var paid = reqlist[reqIndexForDiv].paid;
            //每个单子显示 门诊/住院 ，普通/急诊
            //20190222：添加 0-门诊/1-住院，预约类型 0-普通/1-急诊
            var pattypecode = reqlist[reqIndexForDiv].pattypecode;
            var pattype = '';
            if (pattypecode === '0') {
                pattype = '门诊';
            } else if (pattypecode === '1') {
                pattype = '住院';
            }
            var regtypecode = reqlist[reqIndexForDiv].regtypecode;
            var regtype = '';
            if (regtypecode === '0') {
                regtype = '普通';
            } else if (regtypecode === '1') {
                regtype = '<span class="little-tips">急诊</span>';
            }

            var oneReqId = reqlist[reqIndexForDiv].hiscode + "-" + reqlist[reqIndexForDiv].hissubcode + "-setregtype";
            //先把这几个空div设置到页面，方便下面填充
            //赋值到显示区域
            //先判断 $("#examItemContent").html() 下有没有这个id的div
            //20190315：而且是当前检查类型的单子
            if ($("#" + oneReqId).length <= 0 && reqlist[reqIndexForDiv].examtype === localStorage.getItem(param.etypecode_key)) {
                var examItemContent = "<div class='oneReq' id='" + oneReqId + "'>";
                //加一个开单时间
                if (paid && paid === true) {
                    examItemContent += "<div class='reqdatetime'>" + pattype + " " + regtype + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "开单时间：" + reqlist[reqIndexForDiv].reqdatetime + "</div>";
                } else {
                    examItemContent += "<div class='reqdatetime'><span class='not-paid'><i class='layui-icon layui-icon-close pop-icon-error layui-circle icon-close-not-paid'></i>未缴费&nbsp;&nbsp;</span>" + pattype + " " + regtype + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "开单时间：" + reqlist[reqIndexForDiv].reqdatetime + "</div>";
                }

                //加一个全选按钮、取消全选按钮.！！！注意，button不加type的话再chrome会被自动识别为type='submit'，回车就自动提交了。
                examItemContent += "<button type='button' class='layui-btn layui-btn-radius layui-btn-primary layui-btn-sm selectUnselectBtns' onclick='selectUnselectAllEitemForOneReqInSetregtypeForm(this)'>选择/取消</button>" +
                    "</div>";
                //如果没有这个单子的div
                $("#setRegTypeReqinfoForm").append(examItemContent);
            }
        }
        //循环申请单
        for (var reqIndex = 0; reqIndex < reqlist.length; reqIndex++) {
            //20190308：判断是否缴费
            var paidForOneInput = reqlist[reqIndex].paid;

            var eitemlist = reqlist[reqIndex].eitemlist;
            var oneReqDivId = reqlist[reqIndex].hiscode + "-" + reqlist[reqIndex].hissubcode + "-setregtype";

            var oneReqContent = "";
            //循环一个申请单中的检查项目
            for (var eitemIndex = 0; eitemIndex < eitemlist.length; eitemIndex++) {
                var eitem = eitemlist[eitemIndex];
                //检查项目的checkbox的value命名规则是：申请单下标-检查项目下标
                var eitemid = reqIndex + "-" + eitemIndex;
                var eitemname = eitem.eitemname;
                //20190222：bug，如果名称中含有空格，那么第一个空格之后的内容不会显示了，查看节点 title的值变为了
                //20190114：不能预约-disabled，先判断是否是当前检查类型的项目、再判断是不是已经预约了。
                if (reqlist[reqIndex].examtype === localStorage.getItem(param.etypecode_key)) {
                    //是当前类型的检查项目
                    //判断是否能修改急诊
                    if (reqlist[reqIndex].reginfo) {
                        //20190308：判断是否缴费
                        if (paidForOneInput && paidForOneInput === true) {
                            //已经缴费，虽然已经预约，还是可以修改急诊
                            oneReqContent += '<div class="layui-input-block">' +
                                '<input type="checkbox" name="examItemForSetregtype" class="reged" lay-filter="examItemForSetregtype" lay-skin="primary" value=' + eitemid + ' title="' + eitemname + '">';
                        } else {
                            //未缴费，不能修改急诊
                            oneReqContent += '<div class="layui-input-block">' +
                                '<input disabled type="checkbox" name="examItemForSetregtype" class="reged" lay-filter="examItemForSetregtype" lay-skin="primary" value=' + eitemid + ' title="' + eitemname + '">';
                        }
                        //已经预约，将预约详情展示到界面
                        var npstatus2 = reqlist[reqIndex].reginfo.npstatus;
                        var npstatusdesc2 = reqlist[reqIndex].reginfo.npstatusdesc;
                        //如果是已经预约的状态，即npstatus = N ，那么给出已预约详情
                        if (npstatus2 === 'N') {
                            if (localStorage.getItem(param.etypecode_key) === 'CS') {
                                oneReqContent += '<i class="layui-icon layui-icon-ok eitem-tips">已预约：' + reqlist[reqIndex].reginfo.teamname + ' ' + reqlist[reqIndex].reginfo.npdate + ' ' + reqlist[reqIndex].reginfo.schename + ' ' + (reqlist[reqIndex].reginfo.numstart == null ? '' : reqlist[reqIndex].reginfo.numstart + '号') + '</i>';
                            } else if (localStorage.getItem(param.etypecode_key) === 'US') {
                                oneReqContent += '<i class="layui-icon layui-icon-ok eitem-tips">已预约：' + reqlist[reqIndex].reginfo.teamname + ' ' + reqlist[reqIndex].reginfo.npdate + ' ' + reqlist[reqIndex].reginfo.schename + '</i>';
                            }
                        } else if (npstatus2 === 'Q') {
                            if (localStorage.getItem(param.etypecode_key) === 'CS') {
                                oneReqContent += '<i class="layui-icon layui-icon-flag eitem-tips">已签到：' + reqlist[reqIndex].reginfo.teamname + ' ' + reqlist[reqIndex].reginfo.npdate + ' ' + reqlist[reqIndex].reginfo.schename + ' ' + reqlist[reqIndex].reginfo.numstart + ' 号</i>';
                            } else if (localStorage.getItem(param.etypecode_key) === 'US') {
                                oneReqContent += '<i class="layui-icon layui-icon-flag eitem-tips">已签到：' + reqlist[reqIndex].reginfo.teamname + ' ' + reqlist[reqIndex].reginfo.npdate + ' ' + reqlist[reqIndex].reginfo.schename + ' ' + reqlist[reqIndex].reginfo.signinnum + ' 号</i>';
                            }
                        } else {
                            oneReqContent += '<i class="layui-icon layui-icon-ok eitem-tips">' + npstatusdesc2 + '</i>';
                        }

                        oneReqContent += '</div>';
                        //如果要补打条码，则根据 申请单索引 来查找预约信息。
                    } else {
                        //未预约，即是可预约
                        //20190308：判断是否已经缴费
                        if (paidForOneInput && paidForOneInput === true) {
                            oneReqContent += '<div class="layui-input-block">' +
                                '<input type="checkbox" name="examItemForSetregtype" lay-filter="examItemForSetregtype" lay-skin="primary" value=' + eitemid + ' title="' + eitemname + '">' +
                                '</div>';
                        } else {
                            //未缴费，不能修改急诊
                            oneReqContent += '<div class="layui-input-block">' +
                                '<input disabled type="checkbox" name="examItemForSetregtype" lay-filter="examItemForSetregtype" lay-skin="primary" value=' + eitemid + ' title="' + eitemname + '">' +
                                '</div>';
                        }
                    }
                }
            }
            //将一个req设置到应该的位置
            $("#" + oneReqDivId).append(oneReqContent);
        }
        //20190115：检查项目已经显示完毕，如果全部的有效检查项目只有一个，那么默认选中
        var availableEitem = $("#setRegTypeReqinfoForm input[name='examItemForSetregtype']").not('input[disabled]');
        if (availableEitem.length === 1) {
            //只有一个有效项目，默认选中
            $("#setRegTypeReqinfoForm input[name='examItemForSetregtype']").not('input[disabled]').prop('checked', true);
        }

        //注意！layui需要对动态添加的表单进行再渲染才会显示！
        //利用lay-filter只渲染更新的部分。lay-filter的值是lay-form所在元素得lay-filter的值
        //将值放在父元素上可以实现局部更新
        layui.form.render('checkbox', 'set_reg_type_reqinfo_form');
        layui.form.render('radio', 'set_reg_type_reqinfo_form');
        //20190315：将急诊的选项设置为红色
        $("#setRegTypeReqinfoForm .set-reg-type-radio .layui-form-radio:eq(0) div").addClass('reg-type-emergency');
    } else {
        layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>没有申请单信息' + (result == null ? '' : '：' + result.returnmsg));
    }
}


/**
 * 一切的第一步，页面初始化。
 *
 * 初始化/设置院区、检查类型的设置与显示
 * 将院区、检查类型存储在localStorage
 * hospid:H0001
 * hospname:本部
 *
 * etypecode:FB
 * etypedesc:超声检查
 * f2查询下一个申请单并不进行初始化，这里初始化主要是检查项目字典、检查类型字典、设置院区检查类型、时段设置、诊室设置
 * 初始化不进行申请单查询的时候，应该也能选择日期、时段查看剩余号的情况，只是不能进行预约
 *
 */
function initPage() {
    //置空全局变量。这里并不置空reqinfo
    /*eitemDic = {};*/
    examTypeDic = {};
    teamDic = {};
    //先从localStorage获取这些信息，如果已经有，则显示，如果没有，则请求服务端，要求设置。
    var hospid = localStorage.getItem(param.hospid_key);
    var hospname = localStorage.getItem(param.hospname_key);
    var etypecode = localStorage.getItem(param.etypecode_key);
    var etypedesc = localStorage.getItem(param.etypedesc_key);
    if (!hospid || !etypecode) {
        //请求服务端，要求进行选择
        setHospEtype();
        //结束函数
        //可以不结束函数，将下面的ExamTypeDic获取到，这样即使不设置院区检查类型。。。。
    } else {
        //显示
        $("#showHosp").html(hospname);
        $("#showEtype").html(etypedesc);
    }
    //如果localStorage没有条码标题，那么将默认的写进去
    if (!localStorage.getItem(param.barcode_title_key)) {
        var defaultBarcodeTitle = '四川省人民医院超声科';
        localStorage.setItem(param.barcode_title_key, defaultBarcodeTitle);
    }
    //如果localStorage没有注意事项，那么将默认的写进去
    if (!localStorage.getItem(param.considerations_key)) {
        var defaultConsiderations = '' +
            '◉ 请按照小票规定时间在自助机处签到，过时需要重新预约；';
        localStorage.setItem(param.considerations_key, defaultConsiderations);
    }
    //获取检查类型数据，改变结构存储在全局变量，方便通过检查类型编码获取检查类型的名字
    //所以进入页面、确认修改院区检查类型会访问一次inidata接口，获取检查类型字典，因为这个字典并不被包含在dicdata中。
    getExamTypeDic();
    //诊室和时段的初始化，设置到页面对应位置
    //检查项目以及占用号数只能存储到变量了。
    if (hospid) {
        //已经存储了相关设置信息
        $.ajax({
            async: false,
            url: param.dicdata,
            contentType: 'application/json; charset=UTF-8',//设置头格式
            data: JSON.stringify({
                "hospid": localStorage.getItem(param.hospid_key),
                "examtype": localStorage.getItem(param.etypecode_key)
            }),//将json对象转换成字符串
            type: "POST",
            dataType: "json",
            success: function (result) {
                if (result && result.returncode === 0) {
                    //20190116：将诊室数据保存成全局变量，方便加号操作弹出层初始化诊室下拉选择框
                    teamDic = result.teamlist;
                    //20190403：将时段数据保存成全局变量，方便查看号池弹出层初始化时段单选按钮
                    scheDic = result.schelist;
                    //检查项目的字典,以变量形式存储，改造形式，方便通过guid查询
                    //20190123：不缓存检查项目
                    /*var eitemlist = result.eitemlist;
                    for (var eitemIndex = 0; eitemIndex < eitemlist.length; eitemIndex++) {
                        var eitem = eitemlist[eitemIndex];
                        eitemDic[eitem.eitemguid] = eitem;
                    }*/
                    //时段的设置
                    var scheduleContent = "";
                    for (var scheIndex = 0; scheIndex < result.schelist.length; scheIndex++) {
                        //默认选中第一个
                        if (scheIndex === 0) {
                            scheduleContent += '<input type="radio" class="layui-form" lay-filter="scheduleNameRadio" name="scheduleName" value="' + result.schelist[scheIndex].scheguid + '" title="' + result.schelist[scheIndex].schename + '" checked/>';
                        } else {
                            scheduleContent += '<input type="radio" class="layui-form" lay-filter="scheduleNameRadio" name="scheduleName" value="' + result.schelist[scheIndex].scheguid + '" title="' + result.schelist[scheIndex].schename + '"/>';
                        }
                    }
                    $("#scheduleName").html(scheduleContent);
                    layui.form.render('radio', 'scheduleName');
                    //诊室的设置
                    var teamTitleContent = "";
                    var teamContent = "";
                    var teamlist = result.teamlist;
                    var tabCount = Math.ceil(teamlist.length / param.teamTabSize);
                    //20190401：四楼需要5个Tab。
                    if (tabCount < 5) {
                        tabCount = 5;
                    }
                    //诊室下标计数
                    var teamIndex = 0;
                    //几个tab
                    for (var tabIndex = 0; tabIndex < tabCount; tabIndex++) {
                        var teamIndexStart = tabIndex * param.teamTabSize;
                        var teamIndexEnd = teamIndexStart + param.teamTabSize;
                        if (tabIndex === tabCount - 1) {
                            teamIndexEnd = teamlist.length;
                        }
                        //标题
                        //20190401：修改四楼诊室Tab名称显示
                        if ("CS" === localStorage.getItem(param.etypecode_key)) {
                            if (tabIndex === 2) {
                                //9-10诊室
                                teamTitleContent += '<li>9-10诊室<span class="teamOverview"></span></li>';
                            } else if (tabIndex === 3) {
                                //体检
                                teamTitleContent += '<li>体检中心<span class="teamOverview"></span></li>';
                            } else if (tabIndex === 4) {
                                //心内外科
                                teamTitleContent += '<li>心内外科<span class="teamOverview"></span></li>';
                            } else {
                                teamTitleContent += '<li>' + (teamIndexStart + 1) + '-' + teamIndexEnd + '诊室<span class="teamOverview"></span></li>';
                            }
                        } else {
                            teamTitleContent += '<li>' + (teamIndexStart + 1) + '-' + teamIndexEnd + '诊室<span class="teamOverview"></span></li>';
                        }
                        //诊室内容
                        teamContent += '<div class="layui-tab-item">' +
                            '                                <table class="layui-table">' +
                            '                                    <tbody>';
                        var rowCount = Math.ceil(param.teamTabSize / param.teamTabCols);
                        //几行
                        for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
                            var rowIndexStart = rowIndex * param.teamTabCols;
                            var rowIndexEnd = rowIndexStart + param.teamTabCols;
                            //最后一个Tab的最后一行，可能填充不满的情况
                            if (rowIndex === rowCount - 1) {
                                rowIndexEnd = param.teamTabSize;
                            }
                            //拼凑每个标签页显示的诊室的内容
                            teamContent += '<tr>';
                            //第几个
                            for (var m = rowIndexStart; m < rowIndexEnd; m++) {
                                //可能循环到后面，填充不满，如果不判断那么会报错。所以继续填充，但是不显示
                                if ("CS" === localStorage.getItem(param.etypecode_key)) {
                                    if ((tabIndex === 2 && (m === 2 || m === 3)) || (tabIndex === 3 && (m === 3)) || (tabIndex === 4 && (m === 2 || m === 3))) {
                                        teamContent += '                             <td>' +
                                            '                                            <div class="layui-form-item small-item invisible"                                                 id="">' +
                                            '                                                <div class="layui-input-block team-left">' +
                                            '                                                    <input type="checkbox" name="teamSchedule" value="0" title="剩余号：<br/>加号：">' +
                                            '                                                </div>' +
                                            '                                                <div class="regableIcon">' +
                                            '                                                </div>' +
                                            '                                            </div>' +
                                            '                                        </td>';
                                    } else if (!teamlist[teamIndex]) {
                                        teamContent += '                             <td>' +
                                            '                                            <div class="layui-form-item small-item invisible"                                                 id="">' +
                                            '                                                <div class="layui-input-block team-left">' +
                                            '                                                    <input type="checkbox" name="teamSchedule" value="0" title="剩余号：<br/>加号：">' +
                                            '                                                </div>' +
                                            '                                                <div class="regableIcon">' +
                                            '                                                </div>' +
                                            '                                            </div>' +
                                            '                                        </td>';
                                        //诊室下标计数
                                        teamIndex++;
                                    } else {
                                        teamContent += '                             <td>' +
                                            '                                            <div class="layui-form-item small-item"' +
                                            '                                                 id="' + teamlist[teamIndex].teamguid + '" title="' + teamlist[teamIndex].teamname + '">' +
                                            '                                                <div class="layui-input-block team-left">' +
                                            '                                                    <span class="team-name">' + teamlist[teamIndex].teamname + '</span><br/>' +
                                            '                                                    <input type="checkbox" lay-filter="examTeam" name="teamSchedule" title="剩余号：<br/>加号：">' +
                                            '                                                </div>' +
                                            '                                                <div class="regableIcon">' +
                                            '                                                </div>' +
                                            '                                            </div>' +
                                            '                                        </td>';
                                        //诊室下标计数
                                        teamIndex++;
                                    }
                                } else if ("US" === localStorage.getItem(param.etypecode_key)) {
                                    if (!teamlist[teamIndex]) {
                                        teamContent += '                             <td>' +
                                            '                                            <div class="layui-form-item small-item invisible"                                                 id="">' +
                                            '                                                <div class="layui-input-block team-left">' +
                                            '                                                    <input type="checkbox" name="teamSchedule" value="0" title="剩余号：<br/>加号：">' +
                                            '                                                </div>' +
                                            '                                                <div class="regableIcon">' +
                                            '                                                </div>' +
                                            '                                            </div>' +
                                            '                                        </td>';
                                        //诊室下标计数
                                        teamIndex++;
                                    } else {
                                        teamContent += '                             <td>' +
                                            '                                            <div class="layui-form-item small-item"' +
                                            '                                                 id="' + teamlist[teamIndex].teamguid + '" title="' + teamlist[teamIndex].teamname + '">' +
                                            '                                                <div class="layui-input-block team-left">' +
                                            '                                                    <span class="team-name">' + teamlist[teamIndex].teamname + '</span><br/>' +
                                            '                                                    <input type="checkbox" lay-filter="examTeam" name="teamSchedule" title="剩余号：<br/>加号：">' +
                                            '                                                </div>' +
                                            '                                                <div class="regableIcon">' +
                                            '                                                </div>' +
                                            '                                            </div>' +
                                            '                                        </td>';
                                        //诊室下标计数
                                        teamIndex++;
                                    }
                                }
                            }
                            teamContent += "</tr>";
                        }
                        //
                        teamContent += '                                    </tbody>' +
                            '                                </table>' +
                            '                            </div>';
                    }
                    //拼完了
                    $("#teamTitle").html(teamTitleContent);
                    $("#teamContent").html(teamContent);
                    //默认选中第一个tab
                    $("#teamTitle li:first").addClass("layui-this");
                    $("#teamContent .layui-tab-item:first").addClass("layui-show");
                    //局部渲染更新
                    layui.form.render('checkbox', 'teamContentFilter');

                    //禁用所有时段的选项--20190116：可以切换日期时段查看剩余号数目
                    // disableScheduleRadio();
                    //美化剩余号、加号
                    satisfyTeamCheckbox();
                    //禁用所有诊室的选择选项
                    disableTeamCheckbox();
                    if (localStorage.getItem(param.etypecode_key) === 'CS') {
                        //20190225：心超临时处理，每个诊室添加可预约的项目-tmp-TODO 野路子
                        $("#teamContent td:eq(0)").find(".team-name").html($("#teamContent td:eq(0)").find(".team-name").html() + '<br/>(全部)');
                        $("#teamContent td:eq(1)").find(".team-name").html($("#teamContent td:eq(1)").find(".team-name").html() + '<br/>(血管)');
                        $("#teamContent td:eq(2)").find(".team-name").html($("#teamContent td:eq(2)").find(".team-name").html() + '<br/>(心脏、血管)空腹及腹部血管除外');
                        $("#teamContent td:eq(3)").find(".team-name").html($("#teamContent td:eq(3)").find(".team-name").html() + '<br/>(全部)可约食道(急诊)');
                        $("#teamContent td:eq(4)").find(".team-name").html($("#teamContent td:eq(4)").find(".team-name").html() + '<br/>(全部)可约食道');
                        $("#teamContent td:eq(5)").find(".team-name").html($("#teamContent td:eq(5)").find(".team-name").html() + '<br/>(全部)可约食道(金卡预留)');
                        $("#teamContent td:eq(6)").find(".team-name").html($("#teamContent td:eq(6)").find(".team-name").html() + '<br/>(全部)可约食道');
                        $("#teamContent td:eq(7)").find(".team-name").html($("#teamContent td:eq(7)").find(".team-name").html() + '<br/>(心脏)');
                        $("#teamContent td:eq(8)").find(".team-name").html($("#teamContent td:eq(8)").find(".team-name").html() + '<br/>(成人心脏)');
                        $("#teamContent td:eq(9)").find(".team-name").html($("#teamContent td:eq(9)").find(".team-name").html() + '<br/>(平板)');
                        //20190401：特殊处理 12、13、14
                        $("#teamContent td:eq(12)").find(".team-name").html($("#teamContent td:eq(12)").find(".team-name").html() + '<br/>');
                        $("#teamContent td:eq(13)").find(".team-name").html($("#teamContent td:eq(13)").find(".team-name").html() + '<br/>');
                        $("#teamContent td:eq(14)").find(".team-name").html($("#teamContent td:eq(14)").find(".team-name").html() + '<br/>');
                        //20190401：特殊处理 16、17
                        $("#teamContent td:eq(16)").find(".team-name").html($("#teamContent td:eq(16)").find(".team-name").html() + '<br/>');
                        $("#teamContent td:eq(17)").find(".team-name").html($("#teamContent td:eq(17)").find(".team-name").html() + '<br/>');
                    }
                }
            },
            error: function () {
                layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>服务器忙！请稍后再试。</i>');
            }
        });
        //渲染完毕，更新日期时段summary
        updateReceptionSummary();
        //已经有了设置(所以上面的ajax请求需要同步)，更新剩余号情况
        //第一次进入页面可以根据默认日期、时段更新一次剩余号的显示
        updateLeftNum();
        //20190401：弹出更新提示框
        popChangeLog();
    }
}

/**
 * 更新剩余号和加号情况
 * 20190111：初始化方法中的Ajax请求改程同步之后，scheguid可以取到了，
 * 但是schedate依然会为空，要进行判断控制
 * 20190123:如果诊室已经关闭。那么将总号码和已经使用号码设置为0。
 */
function updateLeftNum() {
    //准备参数 {"hospid":"H0001" ,"scheguid":"436bd80e-c37a-4ad7-b509-50f9818373c3","schedate":"2019-01-23","examtype":"FB"}
    var hospid = localStorage.getItem(param.hospid_key);
    var examtype = localStorage.getItem(param.etypecode_key);
    var scheguid = $("#scheduleName input:checked").val();
    //laydate居然会自动将日期的值填充为 yyyy-MM-dd格式，无论什么输入
    var schedate = $("#scheduleDateInput").val();
    //laydate渲染填充 需要时间，初始化的时候要判断不能为空
    if (!schedate) {
        setTimeout(function () {
            updateLeftNum();
        }, 100);
        return;
    }
    //请求诊室概况
    $.ajax({
        async: false,
        url: param.teamoutline,
        contentType: 'application/json; charset=UTF-8',//设置头格式
        data: JSON.stringify({"hospid": hospid, "scheguid": scheguid, "schedate": schedate, "examtype": examtype}),//将json对象转换成字符串
        type: "POST",
        dataType: "json",
        success: function (result) {
            if (result.returncode === 0) {
                //获取剩余号，设置到相应的位置
                for (var teamIndex = 0; teamIndex < result.teamlist.length; teamIndex++) {
                    var teamguid = result.teamlist[teamIndex].teamguid;
                    var teamisoff = result.teamlist[teamIndex].teamisoff;
                    //20190403:首先判断诊室是否已经关闭
                    if (teamisoff === true) {
                        $("#" + teamguid + " .layui-form-checkbox span").html("<span class='team-is-off'>诊室已关闭</span>");
                        ////20190403:为了配合原有逻辑，将总号和已使用号设置为0
                        $("#" + teamguid + " input[name='teamSchedule']").val((0 - 0) + "-" + '');//加号情况
                        //由于加减号弹出层可能需要更详细的信息，所以在input的title中设置更详细的号池情况
                        //总号-已使用号-加号
                        $("#" + teamguid + " input[name='teamSchedule']").prop('title', 0 + '-' + 0 + "-" + '');//加号情况
                    } else {
                        //20190214:实际上总的号数是 teampresetnum + teamincdecnum
                        var teamtotalnum = result.teamlist[teamIndex].teampresetnum + result.teamlist[teamIndex].teamincdecnum;
                        var teamusednum = result.teamlist[teamIndex].teamusednum;
                        //201901123:teamusednum可能为null
                        teamusednum = teamusednum == null ? 0 : teamusednum;
                        //更新剩余号
                        $("#" + teamguid + " .layui-form-checkbox span").html("<div class='team-span-label'>剩余号：</div><br/><div class='team-span-content'>" + (teamtotalnum - teamusednum) + "</div><br/><div class='team-span-label'>基础号：" + result.teamlist[teamIndex].teampresetnum + "</div><br/><div class='team-span-label'>加减号：" + result.teamlist[teamIndex].teamincdecnum + "</div>");
                        $("#" + teamguid + " input[name='teamSchedule']").val((teamtotalnum - teamusednum) + "-" + '');//加号情况
                        //由于加减号弹出层可能需要更详细的信息，所以在input的title中设置更详细的号池情况
                        //总号-已使用号-加号
                        $("#" + teamguid + " input[name='teamSchedule']").prop('title', teamtotalnum + '-' + teamusednum + "-" + '');//加号情况
                    }
                }
            }
        },
        error: function () {
            layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>服务器忙！请稍后再试。</i>');
        }
    });
}


/**
 * 打印方法
 * @param printHtmlContent 需要打印的html内容，会被写到新页面的<body>里面
 */
function printWebpage(printHtmlContent) {
    //开启新窗口
    var printWindow = window.open();
    //写入要打印的内容
    printWindow.document.body.innerHTML = printHtmlContent;
    //打印
    //20190121发现存在没有生成二维码的情况，实际上已经生成了，可能是网页还没有显示出来就调用了打印。延迟调起打印机
    printWindow.setTimeout(function () {
        printWindow.print();
        //打印或者取消之后关闭页面
        /*printWindow.onafterprint = function () {
            printWindow.close();
        }*/
        //下面的兼容性更好
        printWindow.setTimeout(function () {
            printWindow.close();
        }, 100);
    }, 100);
}

/**
 * 通知服务端小票打印了
 * 可能传入多个npguid，以分号隔开
 * @param npguids 可传入多个npguid，逗号隔开
 */
function notifyServerBarcodePrinted(npguids) {
    if (npguids) {
        var npguidArr = npguids.split(';');
        for (var npguidIdx = 0; npguidIdx < npguidArr.length; npguidIdx++) {
            var npguid = npguidArr[npguidIdx];
            $.ajax({
                url: param.signprtregnote,
                contentType: 'application/json; charset=UTF-8',//设置头格式
                data: JSON.stringify({"npguid": npguid, "examtype": localStorage.getItem(param.etypecode_key)}),//将json对象转换成字符串
                type: "POST",
                dataType: "json",
                success: function (result) {
                    //通知服务端打印小票成功
                    if (!result || result.returncode !== 0) {
                        layer.msg('通知服务端小票已打印失败！');
                    }
                },
                error: function () {
                    layer.msg('<i class="layui-icon layui-icon-close pop-icon-error layui-circle"></i>服务器忙！请稍后再试。</i>');
                }
            });
        }
    }
}

/**
 * 弹出更新日志
 */
function popChangeLog() {
    var localVersion = localStorage.getItem(param.version_key);
    if (!localVersion || parseInt(localVersion) < param.serverVersion) {
        //弹出提示框
        layer.open({
            type: 1
            , title: '更新日志'
            , area: ['60%', '70%']
            , offset: 'auto' //具体配置参考：offset参数项
            , content: '<div class="changelog-content">' + param.versionChangeLog + '</div>'
            , btn: ['确定(Esc)']
            , btnAlign: 'c' //按钮居中
            , yes: function () {
                layer.closeAll();
            }
        });
        //更新本地版本号
        localStorage.setItem(param.version_key, param.serverVersion);
    }
}

/**
 * 强制弹出更新日志
 * 主动查看更新日志
 */
function forcePopChangeLog() {
    //弹出提示框
    layer.open({
        type: 1
        , title: '更新日志'
        , area: ['60%', '70%']
        , offset: 'auto' //具体配置参考：offset参数项
        , content: '<div class="changelog-content">' + param.versionChangeLog + '</div>'
        , btn: ['确定(Esc)']
        , btnAlign: 'c' //按钮居中
        , yes: function () {
            layer.closeAll();
        }
    });
}

/**
 * 获取当前时间
 * 返回值为一个数组，第一个值为日期字符串，格式为 yyyy-MM-dd;第二个值为时间的整数值，比如 1011
 */
function getCurrentTime() {
    var datetimeArr = [];
    $.ajax({
        async: false,
        url: param.currentTime,
        contentType: 'application/json; charset=UTF-8',//设置头格式
        data: JSON.stringify({}),
        type: "POST",
        dataType: "json",
        success: function (result) {
            var currentTime = result.currentTime;
            if (currentTime) {
                var dateObj = new Date(currentTime);
                var year = dateObj.getFullYear();
                var month = dateObj.getMonth() + 1 < 10 ? '0' + (dateObj.getMonth() + 1) : dateObj.getMonth() + 1;
                var day = dateObj.getDate() < 10 ? '0' + dateObj.getDate() : dateObj.getDate();
                var hour = dateObj.getHours();
                var minutes = dateObj.getMinutes();

                datetimeArr[0] = year + "-" + month + "-" + day;
                datetimeArr[1] = parseInt(hour) * 100 + parseInt(minutes);
            }
        }
    });
    return datetimeArr;
}