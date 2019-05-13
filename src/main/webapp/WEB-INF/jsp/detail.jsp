<%@ page language="java" contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8" %>
<%@ include file="common/tag.jsp" %>
<!DOCTYPE>
<!-- HTML5才支持audio标签 -->
<html>
<head>
    <%@ include file="common/head.jsp" %>
    <title>书籍详情</title>
    <script>
        function appoint() {
            var bookId = ${book.bookId};
            $.ajax({
                url: "/SSM_MAVEN_IDEA/book/" + bookId + "/appoint",
                data: {"studentId": 1000},
                type: "POST",
                dataType: "json",
                success: function (result) {
                    if (result.success) {
                        alert(result.data.stateInfo);
                    }
                },
                error: function () {
                    alert("INTERNAL_ERROR");
                }
            });
        }
    </script>
</head>
<body>
${book.bookId }&nbsp;&nbsp;${book.name }&nbsp;&nbsp;${book.number }
<br/>
<a href="#" onclick="appoint()">预约</a>
</body>
</html>