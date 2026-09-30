package com.rolematch.controller;

import com.rolematch.dao.RoleDAO;
import com.rolematch.model.Role;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Web Technology Lab Concept: Java Servlets + MySQL + AJAX
 * RoleServlet provides the complete catalogue of predefined roles stored in MySQL.
 */
@WebServlet("/RoleServlet")
public class RoleServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private RoleDAO roleDAO;

    @Override
    public void init() {
        this.roleDAO = new RoleDAO();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();

        List<Role> roles = roleDAO.getAllRoles();

        StringBuilder sb = new StringBuilder();
        sb.append("{\"success\":true,\"roles\":[");
        for (int i = 0; i < roles.size(); i++) {
            Role r = roles.get(i);
            sb.append("{");
            sb.append("\"roleId\":").append(r.getRoleId()).append(",");
            sb.append("\"roleName\":\"").append(escapeJson(r.getRoleName())).append("\",");
            sb.append("\"category\":\"").append(escapeJson(r.getCategory())).append("\",");
            sb.append("\"minExperience\":\"").append(escapeJson(r.getMinExperience())).append("\",");
            sb.append("\"description\":\"").append(escapeJson(r.getDescription())).append("\",");
            sb.append("\"requiredSkills\":[");
            for (int j = 0; j < r.getRequiredSkills().size(); j++) {
                sb.append("\"").append(escapeJson(r.getRequiredSkills().get(j))).append("\"");
                if (j < r.getRequiredSkills().size() - 1) sb.append(",");
            }
            sb.append("]}");
            if (i < roles.size() - 1) sb.append(",");
        }
        sb.append("]}");

        out.print(sb.toString());
        out.flush();
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"");
    }
}
