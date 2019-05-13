var param = {
    hospid_key: "hospid",
    hospname_key: "hospname",
    etypecode_key: "etypecode",
    etypedesc_key: "etypedesc",
    barcode_title_key: "barcode_title",
    considerations_key: "barcode_considerations",
    version_key: "local_version",
    //每页显示的诊室的数目
    teamTabSize: 4,
    //每页诊室每行显示的数目
    teamTabCols: 4,
    //弹出层诊室号池详情每行显示的数目
    teaminfoNumCols: 10,
    //院区、检查类型的url
    initdata: "/ris/regm/initdata",
    //时段和诊室的url
    dicdata: "/ris/regm/dicdata",
    //诊室号池概览的url
    teamoutline: "/ris/regm/teamoutline",
    //查询申请单信息的url
    reqinfo: "/ris/regm/reqinfo",
    //占号执行锁号
    holdnum: "/ris/regm/holdnum",
    //加减号
    incdecnum: "/ris/regm/incdecnum",
    //通知服务端小票打印了
    signprtregnote: "/ris/regm/signprtregnote",
    //弃号
    giveupnum: "/ris/regm/giveupnum",
    //诊室号池详情
    teaminfo: "/ris/regm/teaminfo",
    //签到，借助自助机的接口
    //product↓--上线
    signin: "/sh/signin",
    //给二楼的扫一个npguid查出检查信息的接口
    reqinfobynpguid: "/sh/reqinfobynpguid",
    //前台设置急诊、平诊
    setregtype: "/ris/regm/setregtype",
    //获取服务器时间
    currentTime: "/currentTime",
    //20190415:二楼四楼门诊退费的基本url
    setClinicPatRefundAbleBaseUrlForUS: 'http://192.161.99.96:8082/sync/index.html',
    setClinicPatRefundAbleBaseUrlForCS: 'http://192.161.99.96:8084/sync/index.html',
    backendManagePage: 'http://192.161.99.30:5000/zs/kg',
    //更新日志提示功能
    serverVersion: 1556095890781,
    versionChangeLog: '' +
        '2019-04-25' +
        '<br/>' +
        '<br/>' +
        '<br/>' +
        '1.优化了查看号池的显示。' +
        '<br/>' +
        '<br/>' +
        '2.优化门诊单子提交报告之后退费接口的逻辑。' +
        '<br/>' +
        '<br/>' +
        '<br/>' +
        '----------------------------------------------------------------------------------------------' +
        '2019-04-16' +
        '<br/>' +
        '<br/>' +
        '<br/>' +
        '1.补打的小票添加了标识。' +
        '<br/>' +
        '<br/>' +
        '2.小票界面去掉申请科室，添加 检查地点 。' +
        '<br/>' +
        '<br/>' +
        '3.小票界面注意事项只保留一条固定的，其他的注意事项根据检查项目自动切换。' +
        '<br/>' +
        '<br/>' +
        '4.添加门诊单子提交报告之后退费的接口。' +
        '<br/>' +
        '<br/>' +
        '5.添加配置管理功能。' +
        '<br/>' +
        '<br/>' +
        '<br/>' +
        '----------------------------------------------------------------------------------------------' +
        '<br/>' +
        '<br/>' +
        '<br/>' +
        '2019-04-06' +
        '<br/>' +
        '<br/>' +
        '<br/>' +
        '1.诊室显示区域增加显示预设号。' +
        '<br/>' +
        '<br/>' +
        '<br/>' +
        '----------------------------------------------------------------------------------------------' +
        '<br/>' +
        '<br/>' +
        '<br/>' +
        '2019-04-04' +
        '<br/>' +
        '<br/>' +
        '<br/>' +
        '1.申请单查询结果不再显示其他检查类型的检查。' +
        '<br/>' +
        '<br/>' +
        '2.签到时间限制上午、中午、下午等大范围。' +
        '<br/>' +
        '<br/>' +
        '3.扫码签到可以使用快捷键F8，继续签到可以使用快捷键F9了，所有弹出层可以使用快捷键Esc退出了。' +
        '<br/>' +
        '<br/>' +
        '4.精准预约/精准修改可以一次性选择多个申请单了。' +
        '<br/>' +
        '<br/>' +
        '5.诊室显示加入了诊室是否关闭的判断。' +
        '<br/>' +
        '<br/>' +
        '6.同一个申请单的多个检查项目选择任意一个即可以全部选中该申请单所有项目。',
};