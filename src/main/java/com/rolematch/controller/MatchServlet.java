package com.rolematch.controller;

import com.rolematch.dao.RoleDAO;
import com.rolematch.model.Role;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Web Technology Lab Concepts Demonstrated:
 * 1. Java Servlets: Core matching backend endpoint triggered via AJAX.
 * 2. Role Matching Algorithm:
 *      Match % = (matched_skills / total_required_skills) * 100
 * 3. Matched & Missing Skills Partitioning.
 * 4. Sorting Collection in descending order of match percentage.
 * 5. Asynchronous AJAX JSON serialization.
 */
@WebServlet("/MatchServlet")
public class MatchServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private RoleDAO roleDAO;

    @Override
    public void init() {
        this.roleDAO = new RoleDAO();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        calculateMatches(request, response);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        calculateMatches(request, response);
    }

    private void calculateMatches(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();

        // 1. Read student skills submitted via AJAX request
        String skillsParam = request.getParameter("skills");
        List<String> studentSkillList = new ArrayList<>();

        if (skillsParam != null && !skillsParam.trim().isEmpty()) {
            String[] split = skillsParam.split(",");
            for (String s : split) {
                if (!s.trim().isEmpty()) {
                    studentSkillList.add(s.trim().toLowerCase());
                }
            }
        } else {
            String[] skillsArray = request.getParameterValues("skills[]");
            if (skillsArray != null) {
                for (String s : skillsArray) {
                    if (!s.trim().isEmpty()) {
                        studentSkillList.add(s.trim().toLowerCase());
                    }
                }
            }
        }

        // Set of student skills in lowercase for fast, case-insensitive comparison
        Set<String> studentSkillSet = new HashSet<>(studentSkillList);

        // 2. Fetch all predefined industry roles from MySQL database via JDBC
        List<Role> allRoles = roleDAO.getAllRoles();

        // 3. Apply the Role Matching Algorithm
        for (Role role : allRoles) {
            List<String> requiredSkills = role.getRequiredSkills();
            List<String> matched = new ArrayList<>();
            List<String> missing = new ArrayList<>();

            if (requiredSkills != null && !requiredSkills.isEmpty()) {
                for (String reqSkill : requiredSkills) {
                    if (studentSkillSet.contains(reqSkill.trim().toLowerCase())) {
                        matched.add(reqSkill);
                    } else {
                        missing.add(reqSkill);
                    }
                }

                // FORMULA: Match % = (Number of Matched Skills / Total Required Skills) * 100
                double percentage = ((double) matched.size() / (double) requiredSkills.size()) * 100.0;
                role.setMatchPercentage(Math.round(percentage * 10.0) / 10.0); // 1 decimal place
            } else {
                role.setMatchPercentage(0.0);
            }

            role.setMatchedSkills(matched);
            role.setMissingSkills(missing);
        }

        // 4. Sort roles in descending order of matching percentage
        Collections.sort(allRoles, new Comparator<Role>() {
            @Override
            public int compare(Role r1, Role r2) {
                return Double.compare(r2.getMatchPercentage(), r1.getMatchPercentage());
            }
        });

        // 5. Serialize matching results into JSON array for AJAX client
        StringBuilder json = new StringBuilder();
        json.append("{\"success\":true,\"totalRoles\":").append(allRoles.size());
        json.append(",\"studentSkills\":[");
        for (int i = 0; i < studentSkillList.size(); i++) {
            json.append("\"").append(escapeJson(studentSkillList.get(i))).append("\"");
            if (i < studentSkillList.size() - 1) json.append(",");
        }
        json.append("],\"roles\":[");

        for (int i = 0; i < allRoles.size(); i++) {
            Role r = allRoles.get(i);
            json.append("{");
            json.append("\"roleId\":").append(r.getRoleId()).append(",");
            json.append("\"roleName\":\"").append(escapeJson(r.getRoleName())).append("\",");
            json.append("\"category\":\"").append(escapeJson(r.getCategory())).append("\",");
            json.append("\"minExperience\":\"").append(escapeJson(r.getMinExperience())).append("\",");
            json.append("\"description\":\"").append(escapeJson(r.getDescription())).append("\",");
            json.append("\"matchPercentage\":").append(r.getMatchPercentage()).append(",");

            // Matched skills array
            json.append("\"matchedSkills\":[");
            for (int m = 0; m < r.getMatchedSkills().size(); m++) {
                json.append("\"").append(escapeJson(r.getMatchedSkills().get(m))).append("\"");
                if (m < r.getMatchedSkills().size() - 1) json.append(",");
            }
            json.append("],");

            // Missing skills array
            json.append("\"missingSkills\":[");
            for (int k = 0; k < r.getMissingSkills().size(); k++) {
                json.append("\"").append(escapeJson(r.getMissingSkills().get(k))).append("\"");
                if (k < r.getMissingSkills().size() - 1) json.append(",");
            }
            json.append("],");

            // Total required skills array
            json.append("\"requiredSkills\":[");
            for (int s = 0; s < r.getRequiredSkills().size(); s++) {
                json.append("\"").append(escapeJson(r.getRequiredSkills().get(s))).append("\"");
                if (s < r.getRequiredSkills().size() - 1) json.append(",");
            }
            json.append("]");

            json.append("}");
            if (i < allRoles.size() - 1) json.append(",");
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
