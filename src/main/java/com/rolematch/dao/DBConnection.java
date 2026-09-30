package com.rolematch.dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Web Technology Lab Concept: JDBC (Java Database Connectivity)
 * DBConnection provides a centralized, reusable database connection manager.
 * Connects to MySQL using JDBC Driver: com.mysql.cj.jdbc.Driver
 */
public class DBConnection {
    // Database URL, Username, and Password
    // Adjust according to your local MySQL configuration
    private static final String JDBC_URL = "jdbc:mysql://localhost:3306/role_matcher?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
    private static final String JDBC_USER = "root";
    private static final String JDBC_PASSWORD = "password";

    static {
        try {
            // STEP 1: Load and register the MySQL JDBC Driver
            Class.forName("com.mysql.cj.jdbc.Driver");
            System.out.println("[JDBC] MySQL Driver loaded successfully.");
        } catch (ClassNotFoundException e) {
            System.err.println("[JDBC ERROR] MySQL Driver not found in classpath: " + e.getMessage());
        }
    }

    /**
     * STEP 2: Establish and return a live Connection object to MySQL
     * @return Connection to role_matcher database
     * @throws SQLException if connection fails
     */
    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(JDBC_URL, JDBC_USER, JDBC_PASSWORD);
    }

    /**
     * Utility method to close connection safely
     */
    public static void closeConnection(Connection conn) {
        if (conn != null) {
            try {
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}
