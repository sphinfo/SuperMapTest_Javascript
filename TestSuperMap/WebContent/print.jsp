<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
    

<%
	String imgUrl =request.getParameter("imgUrl")!=null?request.getParameter("imgUrl"):"";
	String pageSize =request.getParameter("pageSize")!=null?request.getParameter("pageSize"):"";
	int width = 297  ;
	int height = 210 ;
	
	if(pageSize.equals("A3")){
		width =  420;
		height = 297;
	} else if(pageSize.equals("A0")){
		width =  1189;
		height = 841;
	}
%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>
<style type="text/css">
body {
	width: 100%;
	height: 100%;
	margin: 0;
	padding: 0;
	background-color: #FAFAFA;
	font: 12pt "Tahoma";
}


.page {
	width: <%= width %>mm;
<%-- 	min-height: <%= height %>mm; --%>
	margin: 0;
	padding: 0;
	background: white;
}

.subpage {
	padding: 0;
	height: <%= height %>mm;
}

	
@page {
	size: <%= pageSize%>;
	margin: 0;
	
}

@media print {
	html, body {
		width: <%= width %>mm;
		height: <%= height %>mm;
		padding: 0;
		margin: 0;
	}
	.page {
		padding: 0;
		margin: auto;
		height: <%= height %>mm;
	}
	.subpage {
		padding: 0;
	}
	.pritn_hidden {
		display: none;
	}
	img {
		border: 0;
	}
	
}
</style>
<script type="text/javascript" src="js/jquery-1.12.3.js"></script>
<script type="text/javascript">
	$(document).ready(function(){
		alert("<%= pageSize%>");
		$("#btnEditTrash").on('click',function(){
			window.print();
		});
	});

</script>
</head>
<body>
<input type="hidden" id="imagePath">
<div class="page">
	<div class="subpage">
		<img id="printImg" src="<%= imgUrl %>" height="96%"></img>
	</div>
	
	
	<div style="position:fixed;left: 20px;top:50px;" class="pritn_hidden">
		<button id="btnEditTrash" class="btn btn-info btn-xs">출력</button>
	</div> 
</div>
</body>
</html>