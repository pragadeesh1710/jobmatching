# Web Technology Lab Viva Voce – Top 15 Questions & Answers
### Project: RoleMatch – Student Role Matching System

---

### Q1. What is the role of Java Servlets in this project?
**Answer:**
A Java Servlet is a server-side Java component that handles client HTTP requests and generates dynamic responses.
In RoleMatch:
- `LoginServlet`: Authenticates credentials against MySQL and initializes `HttpSession`.
- `RegisterServlet`: Validates student profile data and inserts records via JDBC.
- `MatchServlet`: Executes the role matching algorithm and returns ranked roles in JSON via AJAX.
- `XPathServlet`: Parses `roles.xml` and evaluates XPath expressions.
- `LogoutServlet`: Invalidates session via `session.invalidate()`.

---

### Q2. Explain the Servlet Lifecycle and its methods.
**Answer:**
1. **Loading & Instantiation**: Servlet class is loaded into memory by the Servlet Container (Apache Tomcat).
2. **`init(ServletConfig config)`**: Called once when the servlet is first instantiated. Initializes DAO resources.
3. **`service(HttpServletRequest, HttpServletResponse)`**: Invoked for every incoming request; dispatches to `doGet()` or `doPost()`.
4. **`destroy()`**: Called once when the container unloads the servlet, allowing clean up of database connections.

---

### Q3. What is the difference between `doGet()` and `doPost()`?
**Answer:**
| Feature | `doGet()` | `doPost()` |
| :--- | :--- | :--- |
| **Data Transmission** | Appends parameters to the URL query string (`?key=value`). | Transmits parameters inside the HTTP request body. |
| **Security** | Sensitive data (passwords) visible in browser history and server logs. | Data is hidden inside request body; safe for credentials. |
| **Payload Size** | Limited by URL length restrictions (~2048 characters). | Virtually unlimited payload size. |
| **Usage in RoleMatch** | Used for fetching roles (`RoleServlet`), skills (`SkillServlet`), and XPath queries. | Used for login credentials (`LoginServlet`) and registration (`RegisterServlet`). |

---

### Q4. How does HTTP Session management work in your project?
**Answer:**
HTTP is a stateless protocol. To maintain user login state:
1. `LoginServlet` invokes `HttpSession session = request.getSession(true);` upon valid authentication.
2. The server generates a unique session identifier and sends it to the browser as a cookie named `JSESSIONID`.
3. Student details are stored in server memory using `session.setAttribute("userId", user.getId())`.
4. Subsequent requests pass `JSESSIONID`, allowing the servlet to access student attributes using `session.getAttribute("userId")`.
5. On logout, `LogoutServlet` calls `session.invalidate()` to purge session data.

---

### Q5. How are Cookies implemented and what is their purpose?
**Answer:**
Cookies are small key-value strings stored on the client's browser.
In RoleMatch:
1. **`remember_user`**: When the student checks "Remember Me", `LoginServlet` creates `new Cookie("remember_user", email)`, sets `setMaxAge(7*24*60*60)` (7 days), and sends it via `response.addCookie()`.
2. **`preferred_category`**: Stores the student's chosen career track (e.g. `Backend`) so that returning students see tailored suggestions.
3. Retrieved in Servlets using `request.getCookies()` and in JavaScript using `document.cookie`.

---

### Q6. Difference between `HttpSession` and `Cookie`.
**Answer:**
- **Storage Location**: `HttpSession` resides on the server; `Cookie` resides on the client browser.
- **Security**: `HttpSession` is secure (cannot be modified by client); `Cookie` can be inspected or edited in browser DevTools.
- **Capacity**: Sessions can store any Java Object; Cookies are restricted to text strings $\le 4\text{KB}$.

---

### Q7. What is AJAX and how did you use it?
**Answer:**
**AJAX (Asynchronous JavaScript and XML)** allows a webpage to exchange data with a server behind the scenes without reloading the entire page.
In RoleMatch:
- When a student checks or removes a skill, JavaScript invokes `XMLHttpRequest.open('POST', '/MatchServlet')`.
- The servlet computes matching percentages and returns JSON.
- JavaScript's `onreadystatechange` captures the HTTP 200 response and updates the matching cards and progress bars dynamically.

---

### Q8. Explain the `readyState` properties of `XMLHttpRequest`.
**Answer:**
- `0: UNSENT` – Object created; `open()` not called yet.
- `1: OPENED` – `open()` called; headers can now be set.
- `2: HEADERS_RECEIVED` – `send()` called; status and response headers available.
- `3: LOADING` – Response body is actively streaming.
- `4: DONE` – Asynchronous operation completed (`xhr.status === 200`).

---

### Q9. Why use `PreparedStatement` instead of `Statement` in JDBC?
**Answer:**
1. **SQL Injection Prevention**: `PreparedStatement` uses parameter placeholders (`?`) that are strongly typed and escaped, neutralizing malicious SQL input.
2. **Pre-compilation & Performance**: The database compiles the query structure once and caches the execution plan, speeding up repetitive queries.

---

### Q10. What is XPath and how does `XPathServlet` query `roles.xml`?
**Answer:**
XPath (XML Path Language) is a W3C standard syntax for navigating and selecting nodes from an XML document.
In RoleMatch:
- Category query: `//role[category='Backend']/name`
- Skill query: `//role[skills/skill='Java']/name`
- Implemented using:
  ```java
  XPathFactory factory = XPathFactory.newInstance();
  XPath xpath = factory.newXPath();
  XPathExpression expr = xpath.compile(query);
  NodeList nodes = (NodeList) expr.evaluate(xmlDoc, XPathConstants.NODESET);
  ```

---

### Q11. Explain the Role Matching Algorithm formula.
**Answer:**
$$\text{Match Percentage} = \left( \frac{\text{Number of Matched Skills}}{\text{Total Required Skills for Role}} \right) \times 100$$
Example:
- Role: **Java Developer**
- Required: `Java`, `JDBC`, `Servlet`, `MySQL` (4 skills)
- Student Skills: `Java`, `HTML`, `CSS`, `MySQL`, `JavaScript`
- Intersection: `Java`, `MySQL` (2 matched)
- Result: $(2 / 4) \times 100 = 50\%$ Match.
- Roles are sorted in descending order of match percentage.

---

### Q12. What is `web.xml` (Deployment Descriptor)?
**Answer:**
`web.xml` is an XML configuration file located in the `WEB-INF/` directory of a Java web application. It specifies:
- Servlet declarations (`<servlet>`) and URL mappings (`<servlet-mapping>`).
- Session timeout settings (`<session-timeout>30</session-timeout>`).
- Default welcome pages (`<welcome-file>index.html</welcome-file>`).

---

### Q13. Compare Client-Side vs Server-Side Validation.
**Answer:**
- **Client-Side (JavaScript in `auth.js`)**: Immediate user feedback (checks email format, password $\ge 6$ chars, 10-digit phone number) before sending the request. Saves network bandwidth.
- **Server-Side (`RegisterServlet.java`)**: Essential security layer. Protects against users bypassing client JS or sending raw HTTP requests via cURL or Postman.

---

### Q14. Explain the MySQL database schema in `role_matcher`.
**Answer:**
1. `users`: Stores student ID, name, email, password, phone, college, department, year, preferred role.
2. `skills`: Master table of technical skills (Java, Python, React, etc.).
3. `user_skills`: Many-to-Many junction linking `user_id` to `skill_id`.
4. `roles`: Industry job roles (Java Developer, Web Developer, etc.).
5. `role_skills`: Many-to-Many junction defining required `skill_id`s for each `role_id`.

---

### Q15. Trace the end-to-end request flow for Role Matching.
**Answer:**
1. Student clicks a skill checkbox on `dashboard.html`.
2. JavaScript event handler collects active skills array and triggers `AjaxClient.post('/MatchServlet', { skills: 'Java,MySQL' })`.
3. `MatchServlet.doPost()` receives parameter, parses skill tokens.
4. Servlet invokes `RoleDAO.getAllRoles()`, querying MySQL via JDBC `PreparedStatement`.
5. Java matching algorithm computes intersection, separates matched and missing skills, calculates match %, and sorts list descending.
6. Servlet writes JSON response to `response.getWriter()`.
7. Browser receives HTTP 200 with JSON payload and updates DOM cards and percentage progress bars without page reload.
