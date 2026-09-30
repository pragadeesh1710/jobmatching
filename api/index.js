const predefinedRoles = [
  { roleId: 1, roleName: "Java Developer", description: "Develop robust enterprise backend applications using Core Java, JDBC, Servlets, and MySQL.", category: "Backend", minExperience: "0-1 years", requiredSkills: ["Java", "JDBC", "Servlet", "MySQL", "Git"] },
  { roleId: 2, roleName: "Web Developer", description: "Build interactive websites using HTML5, CSS3, JavaScript, and MySQL.", category: "Full Stack", minExperience: "0-1 years", requiredSkills: ["HTML", "CSS", "JavaScript", "MySQL", "Git"] },
  { roleId: 3, roleName: "Frontend Developer", description: "Design fluid interfaces using HTML, CSS, JavaScript, and React.", category: "Frontend", minExperience: "0-1 years", requiredSkills: ["HTML", "CSS", "JavaScript", "React", "Git"] },
  { roleId: 4, roleName: "Backend Developer", description: "Design server-side architectures, REST APIs, and SQL databases.", category: "Backend", minExperience: "1-2 years", requiredSkills: ["Java", "MySQL", "REST API", "Linux", "Git"] },
  { roleId: 5, roleName: "Full Stack Developer", description: "End-to-end development of web applications with UI, APIs, and databases.", category: "Full Stack", minExperience: "1-2 years", requiredSkills: ["Java", "HTML", "CSS", "JavaScript", "MySQL", "REST API"] },
  { roleId: 6, roleName: "Python Developer", description: "Create automation scripts and web services using Python and SQL.", category: "Backend", minExperience: "0-1 years", requiredSkills: ["Python", "MySQL", "REST API", "Git", "Linux"] },
  { roleId: 7, roleName: "Data Analyst", description: "Analyze datasets using Python, Pandas, NumPy, and SQL.", category: "Data Science", minExperience: "0-1 years", requiredSkills: ["Python", "MySQL", "Pandas", "NumPy"] },
  { roleId: 8, roleName: "Software Tester", description: "Ensure software quality using Selenium and JUnit.", category: "Quality Assurance", minExperience: "0-1 years", requiredSkills: ["Java", "Selenium", "JUnit", "Git"] },
  { roleId: 9, roleName: "Database Developer", description: "Architect relational schemas and stored procedures in MySQL.", category: "Database", minExperience: "1-2 years", requiredSkills: ["MySQL", "PostgreSQL", "JDBC", "Linux"] },
  { roleId: 10, roleName: "DevOps Engineer", description: "CI/CD deployment pipelines with Docker and AWS.", category: "DevOps", minExperience: "1-2 years", requiredSkills: ["Linux", "Docker", "Git", "AWS"] }
];

const masterSkills = [
  { id: 1, name: 'Java' }, { id: 2, name: 'HTML' }, { id: 3, name: 'CSS' }, { id: 4, name: 'JavaScript' },
  { id: 5, name: 'MySQL' }, { id: 6, name: 'JDBC' }, { id: 7, name: 'Servlet' }, { id: 8, name: 'Python' },
  { id: 9, name: 'React' }, { id: 10, name: 'Node.js' }, { id: 11, name: 'Spring Boot' }, { id: 12, name: 'Git' },
  { id: 13, name: 'Docker' }, { id: 14, name: 'AWS' }, { id: 15, name: 'Pandas' }, { id: 16, name: 'NumPy' },
  { id: 17, name: 'Selenium' }, { id: 18, name: 'JUnit' }, { id: 19, name: 'PostgreSQL' }, { id: 20, name: 'Linux' },
  { id: 21, name: 'REST API' }, { id: 22, name: 'MongoDB' }
];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Accept');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const path = req.url.split('?')[0];

  if (path.includes('RegisterServlet')) {
    return res.status(200).json({ success: true, message: "Student registration successful!" });
  }

  if (path.includes('LoginServlet')) {
    const body = req.body || {};
    const email = (body.email || 'rahul.sharma@college.edu').trim().toLowerCase();
    return res.status(200).json({
      success: true,
      message: "Login successful!",
      user: {
        id: 1,
        name: email.split('@')[0],
        email: email,
        department: "Computer Science and Engineering",
        college: "National Institute of Technology",
        year: 3,
        preferredRole: "Full Stack Developer",
        skills: ["Java", "HTML", "CSS", "MySQL", "JavaScript"],
        sessionId: "RM_SESS_" + Math.random().toString(36).substring(2, 9).toUpperCase()
      }
    });
  }

  if (path.includes('MatchServlet')) {
    let skillsInput = (req.body && req.body.skills) || req.query.skills || '';
    let studentSkills = typeof skillsInput === 'string' && skillsInput ? skillsInput.split(',').map(s => s.trim().toLowerCase()) : [];
    const skillSet = new Set(studentSkills);

    const ranked = predefinedRoles.map(role => {
      const matched = [];
      const missing = [];
      role.requiredSkills.forEach(s => {
        if (skillSet.has(s.toLowerCase())) matched.push(s);
        else missing.push(s);
      });
      const pct = role.requiredSkills.length > 0 ? Math.round(((matched.length / role.requiredSkills.length) * 100) * 10) / 10 : 0;
      return { ...role, matchPercentage: pct, matchedSkills: matched, missingSkills: missing };
    });

    ranked.sort((a, b) => b.matchPercentage - a.matchPercentage);
    return res.status(200).json({ success: true, totalRoles: ranked.length, studentSkills: Array.from(skillSet), roles: ranked });
  }

  if (path.includes('RoleServlet')) return res.status(200).json({ success: true, roles: predefinedRoles });
  if (path.includes('SkillServlet')) return res.status(200).json({ success: true, skills: masterSkills });

  if (path.includes('ProfileServlet')) {
    return res.status(200).json({
      success: true,
      user: {
        id: 1,
        name: "Rahul Sharma",
        email: "rahul.sharma@college.edu",
        department: "Computer Science and Engineering",
        college: "National Institute of Technology",
        year: 3,
        preferredRole: "Java Developer",
        skills: ["Java", "HTML", "CSS", "MySQL", "JavaScript"],
        sessionId: "RM_SESS_ACTIVE"
      }
    });
  }

  if (path.includes('XPathServlet')) {
    return res.status(200).json({
      success: true,
      query: "//role[category='Backend']",
      matchCount: 3,
      roles: predefinedRoles.slice(0, 3).map(r => ({ name: r.roleName, category: r.category, experience: r.minExperience, description: r.description, skills: r.requiredSkills }))
    });
  }

  if (path.includes('LogoutServlet')) return res.status(200).json({ success: true, message: "Logged out." });

  return res.status(200).json({ success: true });
}
