# RoleMatch – Student Role Matching System
### Web Technology Laboratory Project

---

## 1. Project Overview & Objective

**RoleMatch** is a full-stack web application designed for a college **Web Technology Laboratory** project. The system allows college students to create their profile, input their acquired technical skills, and discover appropriate industry job roles ranked by a dynamic matching percentage.

The project strictly demonstrates the core concepts taught in the Web Technology curriculum:
* **HTML5**: Semantic webpage structure and forms
* **CSS3**: Responsive, card-based interface with progress bars
* **JavaScript**: Client-side form validation and DOM manipulation
* **Java Servlets**: Backend request processing and MVC controllers
* **HTTP Session**: Server-side user login and session tracking
* **HTTP Cookies**: Persistent client-side preference tracking ("Remember Me" & "Preferred Role Category")
* **AJAX**: Asynchronous client-server communication using native `XMLHttpRequest` without page reload
* **XML + XPath**: Structured data modeling in `roles.xml` and W3C XPath query evaluation
* **MySQL**: Relational database storage for users, skills, and roles
* **JDBC**: Secure database access via `PreparedStatement` and connection pooling

---

## 2. Project Folder Structure

This repository follows the standard **Java Enterprise Edition (Java EE) Dynamic Web Project** layout compatible with **Eclipse IDE**, **Apache Tomcat 9/10**, and **NetBeans**:

```
RoleMatch/
├── src/
│   └── main/
│       └── java/
│           └── com/
│               └── rolematch/
│                   ├── controller/         # Java Servlets (Controllers)
│                   │   ├── LoginServlet.java       # Validates login, creates HttpSession, sets Cookies
│                   │   ├── RegisterServlet.java    # Handles student registration & DB insert
│                   │   ├── LogoutServlet.java      # Invalidates session & redirects
│                   │   ├── ProfileServlet.java     # Retrieves & updates student profile
│                   │   ├── RoleServlet.java        # Lists predefined roles from MySQL
│                   │   ├── MatchServlet.java       # AJAX Role Matching Algorithm backend
│                   │   ├── SkillServlet.java       # Returns skills master list for UI
│                   │   └── XPathServlet.java       # XML parsing & XPath query evaluation
│                   ├── model/              # JavaBean / Data Models
│                   │   ├── User.java               # Student JavaBean
│                   │   ├── Role.java               # Job Role JavaBean
│                   │   └── Skill.java              # Technical Skill JavaBean
│                   ├── dao/                # Data Access Objects (JDBC + MySQL)
│                   │   ├── DBConnection.java       # Loads MySQL JDBC Driver & Connection factory
│                   │   ├── UserDAO.java            # User CRUD with PreparedStatements
│                   │   └── RoleDAO.java            # Role & Skill database queries
│                   └── util/               # Utility Classes
│                       └── XPathParser.java        # DocumentBuilderFactory & XPathFactory evaluator
├── webapp/                                 # Web Application Root (Tomcat WebContent)
│   ├── index.html                          # Landing Home Page
│   ├── login.html                          # Student Login Page (with Cookies demo)
│   ├── register.html                       # Student Registration Page (with JS validation)
│   ├── dashboard.html                      # Student Dashboard (Profile, Match Engine, XML/XPath)
│   ├── css/
│   │   └── style.css                       # Responsive CSS3 Stylesheet
│   ├── js/
│   │   ├── ajax.js                         # Native XMLHttpRequest helper with readyState tracking
│   │   ├── auth.js                         # Validation routines & cookie management
│   │   ├── dashboard.js                    # Dynamic matching engine & XPath UI logic
│   │   └── main.js                         # Global navigation script
│   ├── data/
│   │   └── roles.xml                       # XML database of roles and skill sets
│   └── WEB-INF/
│       ├── web.xml                         # Deployment Descriptor (Servlet & Session mappings)
│       └── lib/
│           └── mysql-connector-j-8.3.0.jar # MySQL JDBC Driver
├── database/
│   └── role_matcher.sql                    # Complete MySQL schema & seed data
├── docs/
│   └── VIVA_QUESTIONS.md                   # Top 15 Lab Viva Voce Questions & Answers
└── README.md                               # Project documentation & setup manual
```

---

## 3. Web Technology Concepts & Code Mapping

| Lab Concept | Key Files Where Implemented | Explanation / Implementation Detail |
| :--- | :--- | :--- |
| **1. HTML5** | `index.html`, `login.html`, `register.html`, `dashboard.html` | Clean semantic markup with accessible form controls, tables, cards, and navigation. |
| **2. CSS3** | `public/css/style.css` | Custom responsive CSS grid, flexbox, progress bar fills, card layouts, and modal drawers. |
| **3. JavaScript** | `public/js/auth.js` | Client-side form validation (email regex, 10-digit phone number, password $\ge 6$ chars, required field checks). |
| **4. Java Servlets** | `src/main/java/.../controller/*.java` | Extends `HttpServlet`, overrides `doGet()` and `doPost()`, parses request parameters, outputs JSON/HTML. |
| **5. HTTP Session** | `LoginServlet.java`, `ProfileServlet.java`, `LogoutServlet.java` | Session creation `request.getSession(true)`, session attributes (`session.setAttribute()`), session timeout in `web.xml`, and `session.invalidate()`. |
| **6. Cookies** | `LoginServlet.java`, `auth.js` | `new Cookie("remember_user", email)` and `preferred_category` with expiration `setMaxAge()`, read in JS via `document.cookie`. |
| **7. AJAX** | `public/js/ajax.js`, `MatchServlet.java` | Native `XMLHttpRequest` with full `readyState` (0 to 4) tracking; asynchronously re-computes role matches upon skill changes without reloading page. |
| **8. XML + XPath** | `webapp/data/roles.xml`, `XPathParser.java`, `XPathServlet.java` | Standard DOM XML document parsing and XPath queries (`//role[category='...']`, `//role[skills/skill='...']`) using `XPathFactory`. |
| **9. MySQL** | `database/role_matcher.sql` | 5 relational tables (`users`, `skills`, `user_skills`, `roles`, `role_skills`) with foreign key constraints. |
| **10. JDBC** | `DBConnection.java`, `UserDAO.java`, `RoleDAO.java` | Loads `com.mysql.cj.jdbc.Driver`, creates `Connection`, and executes parameterized queries using `PreparedStatement`. |

---

## 4. Role Matching Algorithm Explanation

The system uses a transparent, explainable skill intersection algorithm:

$$\text{Match Percentage} = \left( \frac{\text{Number of Matched Skills}}{\text{Total Required Skills for Role}} \right) \times 100$$

### Walkthrough Example:
- **Student Skills**: `Java`, `HTML`, `CSS`, `MySQL`, `JavaScript`
- **Role**: **Java Developer**
- **Required Skills**: `Java`, `JDBC`, `Servlet`, `MySQL`, `Git` (5 total)
- **Matched Skills**: `Java`, `MySQL` (2 matched)
- **Missing Skills**: `JDBC`, `Servlet`, `Git` (3 missing)
- **Calculation**: $(2 / 5) \times 100 = 40.0\%$
- **Result displayed on card**:
  - Role: **Java Developer – 40% Match**
  - Matched tags: `✓ Java`, `✓ MySQL` (highlighted green)
  - Missing tags: `+ JDBC`, `+ Servlet`, `+ Git` (highlighted orange)
  - Roles are sorted in descending order of match percentage.

---

## 5. Setup Instructions: Running Locally with Eclipse & Tomcat

### Prerequisites
1. **Java Development Kit (JDK 8, 11, 17, or 21)** installed and configured in `JAVA_HOME`.
2. **Apache Tomcat 9.0 or 10.1** web container.
3. **MySQL Server 8.0+** running on port 3306.
4. **Eclipse IDE for Enterprise Java and Web Developers**.

---

### Step 1: Setup MySQL Database
1. Open **MySQL Workbench** or your terminal:
   ```bash
   mysql -u root -p
   ```
2. Run the provided database script:
   ```sql
   source /path/to/RoleMatch/database/role_matcher.sql;
   ```
   Or open `database/role_matcher.sql` in MySQL Workbench and click the **Execute (Lightning)** icon.
3. Confirm tables are created:
   ```sql
   USE role_matcher;
   SHOW TABLES;
   SELECT * FROM roles;
   ```

---

### Step 2: Configure Database Credentials
Open `src/main/java/com/rolematch/dao/DBConnection.java` and adjust your MySQL password:
```java
private static final String JDBC_URL = "jdbc:mysql://localhost:3306/role_matcher?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
private static final String JDBC_USER = "root";
private static final String JDBC_PASSWORD = "your_mysql_password"; // Update this
```

---

### Step 3: Import into Eclipse IDE
1. Open Eclipse and choose your workspace.
2. Go to **File -> Import... -> General -> Projects from Folder or Directory** (or **Existing Projects into Workspace**).
3. Select the `RoleMatch` project root folder.
4. Right-click project in Eclipse -> **Properties -> Project Facets**:
   - Check **Dynamic Web Module** (version 4.0 or 3.1)
   - Check **Java** (version 1.8 or higher)
5. Under **Java Build Path -> Libraries -> Add Library**:
   - Select **Server Runtime -> Apache Tomcat v9.0 / v10.0**
   - Click Finish.

---

### Step 4: Add MySQL JDBC Driver JAR
1. Download `mysql-connector-j-8.3.0.jar` from [dev.mysql.com](https://dev.mysql.com/downloads/connector/j/).
2. Copy the `.jar` file into `webapp/WEB-INF/lib/`.
3. Right click the JAR -> **Build Path -> Add to Build Path**.

---

### Step 5: Deploy & Run
1. Right click on `RoleMatch` project -> **Run As -> Run on Server**.
2. Select your configured **Apache Tomcat** server and click **Finish**.
3. Open your browser and navigate to:
   ```
   http://localhost:8080/RoleMatch/
   ```
4. You will see the landing page!

---

## 6. Sample Credentials for Lab Demonstration

The following pre-registered students are seeded into MySQL for immediate testing:

| Student Name | Email Address | Password | Department | Primary Focus |
| :--- | :--- | :--- | :--- | :--- |
| **Rahul Sharma** | `rahul.sharma@college.edu` | `pass123` | Computer Science | Java Developer |
| **Priya Patel** | `priya.patel@college.edu` | `pass123` | Information Tech | Full Stack Developer |
| **Amit Verma** | `amit.verma@college.edu` | `pass123` | Computer Science | Data Analyst |

*(You can also use the **Student Registration** page to create any number of custom student accounts with custom skills).*

---

## 7. Architecture & Request-Response Flow

```
[ Client Browser ]
        │
   (1)  │ User action (e.g. checkbox click, login submit)
        ▼
[ JavaScript (ajax.js / auth.js) ]
        │ Client-side validation (regex, length checks)
   (2)  │ Asynchronous XMLHttpRequest (AJAX)
        ▼
[ Apache Tomcat / Web Server ]
        │ URL Mapping via web.xml or @WebServlet
        ▼
[ Java Servlet (Controller) ]
  ├── LoginServlet / RegisterServlet / MatchServlet / XPathServlet
        │
   (3)  │ Session check (request.getSession) & Cookie reading (request.getCookies)
        │ Invokes Business Logic / Matching Formula
        ▼
[ DAO Layer (UserDAO / RoleDAO) ]
        │ JDBC PreparedStatement
   (4)  ▼
[ MySQL Database (role_matcher) ] ────▶ [ XML Repository (roles.xml) ]
  (users, skills, roles, mappings)       (XPathParser via XPathFactory)
        │
   (5)  │ ResultSet returned
        ▼
[ Java Servlet ]
        │ Serializes results into JSON
   (6)  │ Sets Cookies (response.addCookie) & Session Attributes
        ▼
[ Client Browser (dashboard.js) ]
   (7)  │ XMLHttpRequest onreadystatechange (status === 200)
        ▼
[ DOM Update ] Dynamic match percentage bar & skill cards update without reload!
```
