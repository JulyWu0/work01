<%@ page language="java" contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8" %>
<%@ include file="common/tag.jsp" %>
<!DOCTYPE>
<html>
<head>
    <%@ include file="common/head.jsp" %>
    <title>列表</title>
</head>
<body>
<c:forEach items="${list }" var="book">
    ${book.bookId}&nbsp;&nbsp;${book.name }<br/>
</c:forEach>

<button class="btn btn-primary">按钮</button>
</body>
</html>