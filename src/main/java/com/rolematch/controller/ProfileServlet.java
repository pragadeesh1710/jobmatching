package com.rolematch.controller;

import com.rolematch.dao.UserDAO;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * Web Technology Lab Concepts Demonstrated:
 * 1. Protected Resource Guard: Validates that an active HTTP Session exists.
 * 2. Session Attributes: Accesses student details stored in session.
 * 3. Database Update: Modifies student skill profile in MySQL via UserDAO.
 * 4. AJAX Communication: Delivers profile details as JSON without page reload.
 */
@WebServlet("/ProfileServlet")
public class ProfileServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private UserDAO userDAO;

    @Override
    public void init() {
        this.userDAO = new UserDAO();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();

        // 1. Session check: Ensure user is logged in
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.print("{\"success\":false,\"message\":\"Session expired or user not logged in. Please log in.\"}");
            out.flush();
            return;
        }

        int userId = (Integer) session.getAttribute("userId");
        String name = (String) session.getAttribute("userName");
        String email = (String) session.getAttribute("userEmail");
        String department = (String) session.getAttribute("userDepartment");
        String college = (String) session.getAttribute("userCollege");
        Integer year = (Integer) session.getAttribute("userYear");
        String preferredRole = (String) session.getAttribute("preferredRole");

        // Fresh skills from database
        List<String> skills = userDAO.getUserSkills(userId);
        session.setAttribute("userSkills", skills);

        StringBuilder sb = new StringBuilder();
        sb.append("{\"success\":true,\"user\":{");
        sb.append("\"id\":").append(userId).append(",");
        sb.append("\"name\":\"").append(escapeJson(name)).append("\",");
        sb.append("\"email\":\"").append(escapeJson(email)).append("\",");
        sb.append("\"department\":\"").append(escapeJson(department)).append("\",");
        sb.append("\"college\":\"").append(escapeJson(college)).append("\",");
        sb.append("\"year\":").append(year != null ? year : 1).append(",");
        sb.append("\"preferredRole\":\"").append(escapeJson(preferredRole)).append("\",");
        sb.append("\"skills\":[");
        for (int i = 0; i < skills.size(); i++) {
            sb.append("\"").append(escapeJson(skills.get(i))).append("\"");
            if (i < skills.size() - 1) sb.append(",");
        }
        sb.append("],");
        sb.append("\"sessionId\":\"").append(session.getId()).append("\"");
        sb.append("}}");

        out.print(sb.toString());
        out.flush();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.print("{\"success\":false,\"message\":\"Session expired. Please log in.\"}");
            out.flush();
            return;
        }

        int userId = (Integer) session.getAttribute("userId");
        String skillsParam = request.getParameter("skills");
        List<String> newSkills = new ArrayList<>();

        if (skillsParam != null && !skillsParam.trim().isEmpty()) {
            String[] parts = skillsParam.split(",");
            for (String p : parts) {
                if (!p.trim().isEmpty()) newSkills.add(p.trim());
            }
        }

        boolean updated = userDAO.updateUserSkills(userId, newSkills);
        if (updated) {
            session.setAttribute("userSkills", newSkills);
            out.print("{\"success\":true,\"message\":\"Skills updated successfully!\",\"skillsCount\":" + newSkills.size() + "}");
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"success\":false,\"message\":\"Failed to update skills in database.\"}");
        }
        out.flush();
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"");
    }
}
