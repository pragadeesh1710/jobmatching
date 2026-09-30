package com.rolematch.controller;

import com.rolematch.dao.RoleDAO;
import com.rolematch.model.Skill;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Web Technology Lab Concept: Java Servlets + AJAX
 * SkillServlet supplies the master list of all available technical skills from MySQL.
 */
@WebServlet("/SkillServlet")
public class SkillServlet extends HttpServlet {
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

        List<Skill> skills = roleDAO.getAllSkills();

        StringBuilder sb = new StringBuilder();
        sb.append("{\"success\":true,\"skills\":[");
        for (int i = 0; i < skills.size(); i++) {
            Skill s = skills.get(i);
            sb.append("{\"id\":").append(s.getSkillId())
              .append(",\"name\":\"").append(escapeJson(s.getSkillName())).append("\"}");
            if (i < skills.size() - 1) sb.append(",");
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
