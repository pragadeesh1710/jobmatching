package com.rolematch.controller;

import com.rolematch.model.Role;
import com.rolematch.util.XPathParser;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.util.List;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Web Technology Lab Concepts Demonstrated:
 * 1. Java Servlets: Receives search criteria via GET/POST query parameters.
 * 2. XML Processing: Accesses /webapp/data/roles.xml via ServletContext.
 * 3. XPath Query Execution:
 *      - By Category: //role[category='...']
 *      - By Skill: //role[skills/skill='...']
 *      - Custom XPath query: directly evaluated using XPathFactory
 * 4. AJAX Integration: Returns XML / JSON results to client asynchronously.
 */
@WebServlet("/XPathServlet")
public class XPathServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processXPathQuery(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processXPathQuery(request, response);
    }

    private void processXPathQuery(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();

        String category = request.getParameter("category");
        String skill = request.getParameter("skill");
        String customXPath = request.getParameter("xpath");

        // Construct XPath expression based on input parameters
        String xpathQuery;
        if (customXPath != null && !customXPath.trim().isEmpty()) {
            xpathQuery = customXPath.trim();
        } else if (category != null && !category.trim().isEmpty()) {
            xpathQuery = "//role[category='" + category.trim() + "']";
        } else if (skill != null && !skill.trim().isEmpty()) {
            xpathQuery = "//role[skills/skill='" + skill.trim() + "']";
        } else {
            xpathQuery = "//role"; // Default: fetch all roles in XML
        }

        // Locate roles.xml file in webapp directory
        ServletContext context = getServletContext();
        InputStream xmlStream = context.getResourceAsStream("/data/roles.xml");
        if (xmlStream == null) {
            // Fallback to WEB-INF or relative path
            File file = new File(context.getRealPath("/data/roles.xml"));
            if (file.exists()) {
                xmlStream = new FileInputStream(file);
            }
        }

        if (xmlStream == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            out.print("{\"success\":false,\"message\":\"roles.xml not found on server.\"}");
            out.flush();
            return;
        }

        // Execute XPath query using XPathParser utility
        List<Role> results = XPathParser.queryRoles(xmlStream, xpathQuery);
        xmlStream.close();

        // Build JSON response
        StringBuilder json = new StringBuilder();
        json.append("{\"success\":true,\"query\":\"").append(escapeJson(xpathQuery)).append("\",");
        json.append("\"matchCount\":").append(results.size()).append(",");
        json.append("\"roles\":[");

        for (int i = 0; i < results.size(); i++) {
            Role r = results.get(i);
            json.append("{");
            json.append("\"name\":\"").append(escapeJson(r.getRoleName())).append("\",");
            json.append("\"category\":\"").append(escapeJson(r.getCategory())).append("\",");
            json.append("\"experience\":\"").append(escapeJson(r.getMinExperience())).append("\",");
            json.append("\"description\":\"").append(escapeJson(r.getDescription())).append("\",");
            json.append("\"skills\":[");
            for (int j = 0; j < r.getRequiredSkills().size(); j++) {
                json.append("\"").append(escapeJson(r.getRequiredSkills().get(j))).append("\"");
                if (j < r.getRequiredSkills().size() - 1) json.append(",");
            }
            json.append("]}");
            if (i < results.size() - 1) json.append(",");
        }

        json.append("]}");
        out.print(json.toString());
        out.flush();
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"");
    }
}
