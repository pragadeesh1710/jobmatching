package com.rolematch.dao;

import com.rolematch.model.Role;
import com.rolematch.model.Skill;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * Web Technology Lab Concept: MySQL + JDBC Database Operations
 * RoleDAO handles fetching roles, their skill requirements, and executing role matching queries.
 */
public class RoleDAO {

    /**
     * Retrieve all predefined job roles from the database along with their required skills.
     */
    public List<Role> getAllRoles() {
        List<Role> roles = new ArrayList<>();
        String sql = "SELECT * FROM roles ORDER BY role_id ASC";
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            rs = ps.executeQuery();

            while (rs.next()) {
                Role role = new Role();
                role.setRoleId(rs.getInt("role_id"));
                role.setRoleName(rs.getString("role_name"));
                role.setDescription(rs.getString("description"));
                role.setCategory(rs.getString("category"));
                role.setMinExperience(rs.getString("min_experience"));

                // Load required skills for this role
                role.setRequiredSkills(getRoleSkills(role.getRoleId()));
                roles.add(role);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            closeResources(rs, ps, conn);
        }
        return roles;
    }

    /**
     * Fetch required skill names for a particular role ID.
     */
    public List<String> getRoleSkills(int roleId) {
        List<String> skills = new ArrayList<>();
        String sql = "SELECT s.skill_name FROM skills s " +
                     "JOIN role_skills rs ON s.skill_id = rs.skill_id " +
                     "WHERE rs.role_id = ? ORDER BY s.skill_name ASC";
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, roleId);
            rs = ps.executeQuery();
            while (rs.next()) {
                skills.add(rs.getString("skill_name"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            closeResources(rs, ps, conn);
        }
        return skills;
    }

    /**
     * Retrieve the master list of all skills in the database.
     */
    public List<Skill> getAllSkills() {
        List<Skill> skills = new ArrayList<>();
        String sql = "SELECT * FROM skills ORDER BY skill_name ASC";
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            rs = ps.executeQuery();
            while (rs.next()) {
                skills.add(new Skill(rs.getInt("skill_id"), rs.getString("skill_name")));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            closeResources(rs, ps, conn);
        }
        return skills;
    }

    private void closeResources(ResultSet rs, PreparedStatement ps, Connection conn) {
        try {
            if (rs != null) rs.close();
            if (ps != null) ps.close();
            if (conn != null) conn.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
