package com.rolematch.controller;

import com.rolematch.dao.UserDAO;
import com.rolematch.model.User;
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * Web Technology Lab Concepts Demonstrated:
 * 1. Java Servlets: Extends HttpServlet, overrides doPost().
 * 2. HTTP Session: Creates session via request.getSession(), sets session attributes.
 * 3. Cookies: Reads and writes HTTP Cookies using new Cookie() and response.addCookie().
 * 4. JDBC & MySQL: Validates user credentials via UserDAO.
 * 5. AJAX Support: Returns JSON response for asynchronous frontend requests.
 */
@WebServlet("/LoginServlet")
public class LoginServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private UserDAO userDAO;

    @Override
    public void init() {
        this.userDAO = new UserDAO();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Set response encoding and content type
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();

        // 1. Retrieve form parameters sent from client
        String email = request.getParameter("email");
        String password = request.getParameter("password");
        String rememberMe = request.getParameter("remember");

        // 2. Validate credentials against MySQL database using JDBC DAO
        User user = userDAO.loginUser(email, password);

        if (user != null) {
            // =================================================================
            // CONCEPT: HTTP SESSION MANAGEMENT
            // =================================================================
            // request.getSession() creates a new session or returns current session
            HttpSession session = request.getSession(true);

            // Store student details in session attributes
            session.setAttribute("userId", user.getUserId());
            session.setAttribute("userName", user.getName());
            session.setAttribute("userEmail", user.getEmail());
            session.setAttribute("userDepartment", user.getDepartment());
            session.setAttribute("userCollege", user.getCollege());
            session.setAttribute("userYear", user.getYear());
            session.setAttribute("preferredRole", user.getPreferredRole());
            session.setAttribute("userSkills", user.getSkills());

            // Set session inactivity timeout to 30 minutes (1800 seconds)
            session.setMaxInactiveInterval(1800);

            // =================================================================
            // CONCEPT: HTTP COOKIES
            // =================================================================
            // 1. "Remember Me" Cookie: remembers the user's email if checkbox checked
            if ("true".equalsIgnoreCase(rememberMe) || "on".equalsIgnoreCase(rememberMe)) {
                Cookie rememberCookie = new Cookie("remember_user", user.getEmail());
                rememberCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days in seconds
                rememberCookie.setPath("/");
                response.addCookie(rememberCookie);
            } else {
                // Remove cookie if user unchecked "Remember Me"
                Cookie removeCookie = new Cookie("remember_user", "");
                removeCookie.setMaxAge(0); // 0 seconds = immediately expires
                removeCookie.setPath("/");
                response.addCookie(removeCookie);
            }

            // 2. "Preferred Category" Cookie: store preferred role/category for returning visits
            String category = user.getPreferredRole();
            Cookie categoryCookie = new Cookie("preferred_category", category.replace(" ", "_"));
            categoryCookie.setMaxAge(30 * 24 * 60 * 60); // 30 days
            categoryCookie.setPath("/");
            response.addCookie(categoryCookie);

            // Return success JSON for AJAX client
            out.print("{\"success\":true,\"message\":\"Login successful!\",\"user\":{\"id\":" +
                      user.getUserId() + ",\"name\":\"" + escapeJson(user.getName()) +
                      "\",\"email\":\"" + escapeJson(user.getEmail()) +
                      "\",\"department\":\"" + escapeJson(user.getDepartment()) +
                      "\",\"preferredRole\":\"" + escapeJson(user.getPreferredRole()) +
                      "\",\"sessionId\":\"" + session.getId() + "\"}}");

        } else {
            // Invalid credentials response
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.print("{\"success\":false,\"message\":\"Invalid email or password. Please try again.\"}");
        }
        out.flush();
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"");
    }
}
