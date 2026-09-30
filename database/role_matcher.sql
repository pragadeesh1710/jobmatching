-- =====================================================================
-- RoleMatch: Student Role Matching System - Database Script
-- Technology: MySQL 8.0+ / MariaDB
-- Database Name: role_matcher
-- Course: Web Technology Lab
-- =====================================================================

-- 1. Create and select the database
DROP DATABASE IF EXISTS role_matcher;
CREATE DATABASE role_matcher CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE role_matcher;

-- 2. Create 'users' table
-- Stores student profile information, credentials, and college details
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    college VARCHAR(150) NOT NULL,
    department VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    preferred_role VARCHAR(100) DEFAULT 'Full Stack Developer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create 'skills' table
-- Master list of all technical skills available in the system
CREATE TABLE skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(50) NOT NULL UNIQUE
);

-- 4. Create 'user_skills' table
-- Many-to-many relationship linking students to their acquired skills
CREATE TABLE user_skills (
    user_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
);

-- 5. Create 'roles' table
-- Predefined industry roles with description and category
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    min_experience VARCHAR(50) DEFAULT '0-1 years'
);

-- 6. Create 'role_skills' table
-- Many-to-many relationship defining skills required for each job role
CREATE TABLE role_skills (
    role_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (role_id, skill_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
);

-- =====================================================================
-- SEED DATA INSERTION
-- =====================================================================

-- Insert Master Skills
INSERT INTO skills (skill_id, skill_name) VALUES
(1, 'Java'),
(2, 'HTML'),
(3, 'CSS'),
(4, 'JavaScript'),
(5, 'MySQL'),
(6, 'JDBC'),
(7, 'Servlet'),
(8, 'Python'),
(9, 'React'),
(10, 'Node.js'),
(11, 'Spring Boot'),
(12, 'Git'),
(13, 'Docker'),
(14, 'AWS'),
(15, 'Pandas'),
(16, 'NumPy'),
(17, 'Selenium'),
(18, 'JUnit'),
(19, 'PostgreSQL'),
(20, 'Linux'),
(21, 'REST API'),
(22, 'MongoDB');

-- Insert 10 Predefined Industry Roles
INSERT INTO roles (role_id, role_name, description, category, min_experience) VALUES
(1, 'Java Developer', 'Develop robust enterprise backend applications and microservices using Core Java, JDBC, Servlets, and MySQL.', 'Backend', '0-1 years'),
(2, 'Web Developer', 'Build interactive and responsive user-facing websites using HTML5, CSS3, modern JavaScript, and MySQL databases.', 'Full Stack', '0-1 years'),
(3, 'Frontend Developer', 'Design and implement fluid, accessible, and performant web interfaces utilizing HTML, CSS, JavaScript, and React.', 'Frontend', '0-1 years'),
(4, 'Backend Developer', 'Design scalable server-side architectures, RESTful APIs, and secure database integrations using Java, Node.js, and SQL.', 'Backend', '1-2 years'),
(5, 'Full Stack Developer', 'End-to-end development of dynamic web applications encompassing frontend UI, server servlets, APIs, and relational databases.', 'Full Stack', '1-2 years'),
(6, 'Python Developer', 'Create data processing pipelines, automation scripts, and web services using Python, REST APIs, and SQL databases.', 'Backend', '0-1 years'),
(7, 'Data Analyst', 'Extract, clean, analyze, and visualize complex datasets using Python, Pandas, NumPy, and advanced SQL querying.', 'Data Science', '0-1 years'),
(8, 'Software Tester', 'Ensure software quality, reliability, and correctness through automated test suites, Selenium, and JUnit frameworks.', 'Quality Assurance', '0-1 years'),
(9, 'Database Developer', 'Architect relational database schemas, write complex SQL queries, and optimize stored procedures using MySQL and PostgreSQL.', 'Database', '1-2 years'),
(10, 'DevOps Engineer', 'Automate CI/CD deployment pipelines, manage containerized environments with Docker, Linux systems, and cloud infrastructure.', 'DevOps', '1-2 years');

-- Map Required Skills to Each Role (role_skills)
-- 1. Java Developer: Java, JDBC, Servlet, MySQL, Git
INSERT INTO role_skills (role_id, skill_id) VALUES
(1, 1), (1, 5), (1, 6), (1, 7), (1, 12);

-- 2. Web Developer: HTML, CSS, JavaScript, MySQL, Git
INSERT INTO role_skills (role_id, skill_id) VALUES
(2, 2), (2, 3), (2, 4), (2, 5), (2, 12);

-- 3. Frontend Developer: HTML, CSS, JavaScript, React, Git
INSERT INTO role_skills (role_id, skill_id) VALUES
(3, 2), (3, 3), (3, 4), (3, 9), (3, 12);

-- 4. Backend Developer: Java, MySQL, REST API, Linux, Git
INSERT INTO role_skills (role_id, skill_id) VALUES
(4, 1), (4, 5), (4, 20), (4, 21), (4, 12);

-- 5. Full Stack Developer: Java, HTML, CSS, JavaScript, MySQL, REST API
INSERT INTO role_skills (role_id, skill_id) VALUES
(5, 1), (5, 2), (5, 3), (5, 4), (5, 5), (5, 21);

-- 6. Python Developer: Python, MySQL, REST API, Git, Linux
INSERT INTO role_skills (role_id, skill_id) VALUES
(6, 8), (6, 5), (6, 21), (6, 12), (6, 20);

-- 7. Data Analyst: Python, MySQL, Pandas, NumPy
INSERT INTO role_skills (role_id, skill_id) VALUES
(7, 8), (7, 5), (7, 15), (7, 16);

-- 8. Software Tester: Java, Selenium, JUnit, Git
INSERT INTO role_skills (role_id, skill_id) VALUES
(8, 1), (8, 17), (8, 18), (8, 12);

-- 9. Database Developer: MySQL, PostgreSQL, JDBC, Linux
INSERT INTO role_skills (role_id, skill_id) VALUES
(9, 5), (9, 19), (9, 6), (9, 20);

-- 10. DevOps Engineer: Linux, Docker, Git, AWS
INSERT INTO role_skills (role_id, skill_id) VALUES
(10, 20), (10, 13), (10, 12), (10, 14);

-- Sample Students for Testing & Demonstration
INSERT INTO users (user_id, name, email, password, phone, college, department, year, preferred_role) VALUES
(1, 'Rahul Sharma', 'rahul.sharma@college.edu', 'pass123', '9876543210', 'National Institute of Technology', 'Computer Science and Engineering', 3, 'Java Developer'),
(2, 'Priya Patel', 'priya.patel@college.edu', 'pass123', '9876543211', 'College of Engineering & Technology', 'Information Technology', 4, 'Full Stack Developer'),
(3, 'Amit Verma', 'amit.verma@college.edu', 'pass123', '9876543212', 'State Engineering College', 'Computer Science and Engineering', 2, 'Data Analyst');

-- Sample Student Skills
-- Rahul Sharma (Java Developer aspirant): Java, HTML, CSS, MySQL, JavaScript
INSERT INTO user_skills (user_id, skill_id) VALUES
(1, 1), -- Java
(1, 2), -- HTML
(1, 3), -- CSS
(1, 4), -- JavaScript
(1, 5); -- MySQL

-- Priya Patel (Full Stack aspirant): Java, HTML, CSS, JavaScript, MySQL, REST API, Git
INSERT INTO user_skills (user_id, skill_id) VALUES
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 21), (2, 12);

-- Amit Verma (Data Analyst aspirant): Python, MySQL, Pandas
INSERT INTO user_skills (user_id, skill_id) VALUES
(3, 8), (3, 5), (3, 15);
