package com.sph;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URLEncoder;
import java.util.Date;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class Capture extends HttpServlet {

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		// TODO Auto-generated method stub

		resp.setContentType("text/plan; charset=utf-8");
		FileWriter fw = null;
		Runtime run = Runtime.getRuntime();
		Process p = null;
		BufferedReader br = null;
		Date date = new Date();
		String htmlNm = String.valueOf(date.getTime());
		String htmlFileNm = "D:/capture/" + htmlNm + ".html";
		String imageFileNm = "D:/capture/" + htmlNm + ".png";
		
		try {
			String body = req.getParameter("html") == null ? "" : req
					.getParameter("html");
			String width = req.getParameter("width") == null ? "" : req
					.getParameter("width");
			String height = req.getParameter("height") == null ? "" : req
					.getParameter("height");

			StringBuffer html = new StringBuffer();
			html.append("<html>\n");
			html.append("<head><meta charset=\"EUC-KR\"/></head>\n");
			html.append("<body>\n");
			html.append(body);
			// html.append("<div style='width:100%;height:100%;background-color:#FEF112;'/>\n");
			html.append("\n</body>\n");
			html.append("</html>");

			fw = new FileWriter(htmlFileNm);
			fw.write(html.toString());
			fw.flush();
			fw.close();
			String pWidth = "--width " + width;
			String pHeight = "--height " + height;
			String cmdarray = "wkhtmltoimage" + " " + pWidth + " " + pHeight
					+ " " + htmlFileNm + " " + imageFileNm;
			System.out.println("wkhtmltoimage" + " " + pWidth + " " + pHeight
					+ " " + htmlFileNm + " " + imageFileNm);
			p = run.exec(cmdarray);

			br = new BufferedReader(new InputStreamReader(p.getInputStream()));
			String line = null;
			while ((line = br.readLine()) != null) {
				System.out.println(line);
			}
			// 프로세스의 수행이 끝날때까지 대기
			p.waitFor();
			br.close();
			ServletContext ctx = getServletContext();
			
			download(req,resp,ctx,imageFileNm);
		} catch (Exception ex) {
			ex.printStackTrace();
		} finally {
			if (fw != null) {
				fw.close();
			}

			if (br != null) {
				br.close();
			}

			if (p != null) {
				p.destroy();
			}
			File htmlFile = new File(htmlFileNm);
			File imgFile = new File(imageFileNm);
			if(htmlFile.exists()){
				htmlFile.delete();
			}
			if(imgFile.exists()){
				imgFile.delete();
			}
		}

		// Dimension dimension = new Dimension(Integer.parseInt(width),
		// Integer.parseInt(height));
		// HtmlImageGenerator imageGenerator = new HtmlImageGenerator();
		// imageGenerator.setSize(dimension);
		// File file = new File("D:/capture/new1.html");
		// System.out.println(html.toString());
		// //imageGenerator.loadHtml(html.toString());
		// imageGenerator.loadUrl(file.toURI().toString());
		// imageGenerator.saveAsImage("D:/capture/test.png");
		// PrintWriter out = resp.getWriter();
		// out.println("{\"name=\":\"test2.png\"}");
	}

	/**
	 * 해당 입력 스트림으로부터 오는 데이터를 다운로드 한다.
	 * 
	 * @param request
	 * @param response
	 * @param ctx 
	 * @param filePath  파일 이름
	 * @throws ServletException
	 * @throws IOException
	 */
	public static void download(HttpServletRequest request,
			HttpServletResponse response, 
			ServletContext ctx ,
			String filePath) throws ServletException,
			IOException {
		
		File file = new File(filePath);
		
		if(!file.exists()){
			throw new ServletException("File doesn't exists on server.");
		}
		InputStream fis = new FileInputStream(file);
		
		String mimetype = ctx.getMimeType(file.getAbsolutePath());

		if (mimetype == null || mimetype.length() == 0) {
			mimetype = "application/octet-stream;";
		}
		response.setContentLength((int) file.length());
		response.setContentType(mimetype + "; charset=" + "UTF-8");
		

		// 아래 부분에서 euc-kr 을 utf-8 로 바꾸거나 URLEncoding을 안하거나 등의 테스트를
		// 해서 한글이 정상적으로 다운로드 되는 것으로 지정한다.
		String userAgent = request.getHeader("User-Agent");

		// attachment; 가 붙으면 IE의 경우 무조건 다운로드창이 뜬다. 상황에 따라 써야한다.
		boolean ie = (userAgent.indexOf("MSIE") > -1) || (userAgent.indexOf("Trident") > -1);
		String fileName = "";
		if (ie) {
		        fileName = URLEncoder.encode(file.getName(), "UTF-8").replaceAll("\\+", "%20");
		} else {
		        fileName = new String(file.getName().getBytes("UTF-8"), "iso-8859-1");
		}
		response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"");

		ServletOutputStream os = null;

		try {
			os       = response.getOutputStream();
			byte[] bufferData = new byte[1024];
			int read=0;
			while((read = fis.read(bufferData))!= -1){
				os.write(bufferData, 0, read);
			}
			os.flush();
			os.close();
			fis.close();
			System.out.println("File downloaded at client successfully");
		} catch (IOException ex) {
			
		} finally {
			try {
				os.close();
			} catch (Exception ex1) {
			}

			try {
				fis.close();
			} catch (Exception ex2) {

			}
		} // end of try/catch
	}
}
