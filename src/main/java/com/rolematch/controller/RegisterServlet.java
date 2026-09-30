package com.rolematch.controller;

import com.rolematch.dao.UserDAO;
import com.rolematch.model.User;
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

/**
 * Web Technology Lab Concepts Demonstrated:
 * 1. Java Servlets: doPost() handling multipart/form data.
 * 2. JDBC & PreparedStatement: Inserting new user record and user_skills relationships.
 * 3. Server-side validation: Secondary guard alongside client-side JavaScript.
 * 4. AJAX Response: Asynchronous JSON feedback to client without full page refresh.
 */
@WebServlet("/RegisterServlet")
public class RegisterServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private UserDAO userDAO;

    @Override
    public void init() {
        this.userDAO = new UserDAO();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();

        // 1. Read student registration parameters
        String name = request.getParameter("name");
        String email = request.getParameter("email");
        String password = request.getParameter("password");
        String phone = request.getParameter("phone");
        String college = request.getParameter("college");
        String department = request.getParameter("department");
        String yearStr = request.getParameter("year");
        String preferredRole = request.getParameter("preferredRole");
        String skillsParam = request.getParameter("skills");

        // 2. Server-side validation
        if (name == null || name.trim().isEmpty() ||
            email == null || !email.contains("@") ||
            password == null || password.length() < 6 ||
            phone == null || phone.trim().length() < 10) {

            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"success\":false,\"message\":\"Validation failed. Please verify all required fields.\"}");
            out.flush();
            return;
        }

        int year = 1;
        try {
            if (yearStr != null) year = Integer.parseInt(yearStr.trim());
        } catch (NumberFormatException e) {
            year = 1;
        }

        // Parse skills list (comma separated or multiple parameters)
        List<String> skillList = new ArrayList<>();
        if (skillsParam != null && !skillsParam.trim().isEmpty()) {
            String[] split = skillsParam.split(",");
            for (String s : split) {
                if (!s.trim().isEmpty()) skillList.add(s.trim());
            }
        } else {
            String[] skillsArray = request.getParameterValues("skills[]");
            if (skillsArray != null) {
                skillList.addAll(Arrays.asList(skillsArray));
            }
        }

        // 3. Construct User model
        User newUser = new User(0, name.trim(), email.trim(), password, phone.trim(),
                                college != null ? college.trim() : "Engineering College",
                                department != null ? department.trim() : "Computer Science",
                                year, preferredRole != null ? preferredRole.trim() : "Java Developer");
        newUser.setSkills(skillList);

        // 4. Save to MySQL via JDBC DAO
        boolean registered = userDAO.registerUser(newUser, skillList);

        if (registered) {
            out.print("{\"success\":true,\"message\":\"Student registration successful! You can now log in with your credentials.\"}");
        } else {
            response.setStatus(HttpServletResponse.SC_CONFLICT);
            out.print("{\"success\":false,\"message\":\"Registration failed. Email might already be registered in the system.\"}");
        }
        out.flush();
    }
}
