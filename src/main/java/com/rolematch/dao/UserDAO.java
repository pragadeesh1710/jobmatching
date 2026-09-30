package com.rolematch.dao;

import com.rolematch.model.User;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Web Technology Lab Concept: MySQL + JDBC PreparedStatement
 * UserDAO handles all CRUD database operations for students/users.
 * Uses PreparedStatement to prevent SQL Injection attacks.
 */
public class UserDAO {

    /**
     * Authenticate student credentials during Login.
     * Uses PreparedStatement with parameterized query.
     */
    public User loginUser(String email, String password) {
        String sql = "SELECT * FROM users WHERE email = ? AND password = ?";
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setString(1, email);
            ps.setString(2, password);

            rs = ps.executeQuery();
            if (rs.next()) {
                User user = new User();
                user.setUserId(rs.getInt("user_id"));
                user.setName(rs.getString("name"));
                user.setEmail(rs.getString("email"));
                user.setPhone(rs.getString("phone"));
                user.setCollege(rs.getString("college"));
                user.setDepartment(rs.getString("department"));
                user.setYear(rs.getInt("year"));
                user.setPreferredRole(rs.getString("preferred_role"));

                // Load user's registered skills
                user.setSkills(getUserSkills(user.getUserId()));
                return user;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            closeResources(rs, ps, conn);
        }
        return null;
    }

    /**
     * Register a new student into the users table and user_skills table.
     */
    public boolean registerUser(User user, List<String> skillNames) {
        String userSql = "INSERT INTO users (name, email, password, phone, college, department, year, preferred_role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false); // Transaction management

            ps = conn.prepareStatement(userSql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, user.getName());
            ps.setString(2, user.getEmail());
            ps.setString(3, user.getPassword());
            ps.setString(4, user.getPhone());
            ps.setString(5, user.getCollege());
            ps.setString(6, user.getDepartment());
            ps.setInt(7, user.getYear());
            ps.setString(8, user.getPreferredRole());

            int affectedRows = ps.executeUpdate();
            if (affectedRows == 0) {
                conn.rollback();
                return false;
            }

            rs = ps.getGeneratedKeys();
            int newUserId = 0;
            if (rs.next()) {
                newUserId = rs.getInt(1);
                user.setUserId(newUserId);
            }

            // Insert skills in user_skills mapping table
            if (skillNames != null && !skillNames.isEmpty() && newUserId > 0) {
                String skillMapSql = "INSERT INTO user_skills (user_id, skill_id) " +
                                     "SELECT ?, skill_id FROM skills WHERE skill_name = ?";
                PreparedStatement psSkill = conn.prepareStatement(skillMapSql);
                for (String skillName : skillNames) {
                    psSkill.setInt(1, newUserId);
                    psSkill.setString(2, skillName.trim());
                    psSkill.addBatch();
                }
                psSkill.executeBatch();
                psSkill.close();
            }

            conn.commit(); // Commit transaction
            return true;
        } catch (SQLException e) {
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ex) { ex.printStackTrace(); }
            }
            e.printStackTrace();
            return false;
        } finally {
            closeResources(rs, ps, conn);
        }
    }

    /**
     * Fetch list of skill names possessed by a student.
     */
    public List<String> getUserSkills(int userId) {
        List<String> skills = new ArrayList<>();
        String sql = "SELECT s.skill_name FROM skills s " +
                     "JOIN user_skills us ON s.skill_id = us.skill_id " +
                     "WHERE us.user_id = ? ORDER BY s.skill_name ASC";
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
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
     * Update skills for an existing student.
     */
    public boolean updateUserSkills(int userId, List<String> newSkills) {
        Connection conn = null;
        PreparedStatement psDelete = null;
        PreparedStatement psInsert = null;

        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            // Step 1: Remove existing skills
            String deleteSql = "DELETE FROM user_skills WHERE user_id = ?";
            psDelete = conn.prepareStatement(deleteSql);
            psDelete.setInt(1, userId);
            psDelete.executeUpdate();

            // Step 2: Insert newly selected skills
            if (newSkills != null && !newSkills.isEmpty()) {
                String insertSql = "INSERT INTO user_skills (user_id, skill_id) " +
                                   "SELECT ?, skill_id FROM skills WHERE skill_name = ?";
                psInsert = conn.prepareStatement(insertSql);
                for (String skill : newSkills) {
                    psInsert.setInt(1, userId);
                    psInsert.setString(2, skill.trim());
                    psInsert.addBatch();
                }
                psInsert.executeBatch();
            }

            conn.commit();
            return true;
        } catch (SQLException e) {
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ex) { ex.printStackTrace(); }
            }
            e.printStackTrace();
            return false;
        } finally {
            try {
                if (psDelete != null) psDelete.close();
                if (psInsert != null) psInsert.close();
                if (conn != null) conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * Helper to close JDBC resources
     */
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
