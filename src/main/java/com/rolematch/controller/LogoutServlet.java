package com.rolematch.controller;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * Web Technology Lab Concept: HTTP Session Invalidation
 * Demonstrates:
 * 1. Retrieving current session without creating a new one: request.getSession(false).
 * 2. Invalidating the session: session.invalidate().
 * 3. Clearing user state and redirecting to the login page.
 */
@WebServlet("/LogoutServlet")
public class LogoutServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processLogout(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processLogout(request, response);
    }

    private void processLogout(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        // Retrieve current session if exists (do not create new session)
        HttpSession session = request.getSession(false);
        if (session != null) {
            // Invalidate session: frees server memory and clears all attributes
            session.invalidate();
            System.out.println("[SESSION] User logged out and session invalidated successfully.");
        }

        // Check if request is AJAX or standard browser navigation
        String acceptHeader = request.getHeader("Accept");
        if (acceptHeader != null && acceptHeader.contains("application/json")) {
            response.setContentType("application/json;charset=UTF-8");
            PrintWriter out = response.getWriter();
            out.print("{\"success\":true,\"message\":\"Logged out successfully.\"}");
            out.flush();
        } else {
            // Standard HTTP redirect back to login page
            response.sendRedirect("login.html?logout=true");
        }
    }
}
