import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';
// @ts-ignore
import { DOMParser } from '@xmldom/xmldom';
// @ts-ignore
import xpath from 'xpath';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// =============================================================================
// Simulated MySQL Database (Conforms to database/role_matcher.sql)
// =============================================================================
interface UserRecord {
  userId: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  college: string;
  department: string;
  year: number;
  preferredRole: string;
  skills: string[];
}

interface RoleRecord {
  roleId: number;
  roleName: string;
  description: string;
  category: string;
  minExperience: string;
  requiredSkills: string[];
}

const masterSkills = [
  { id: 1, name: 'Java' },
  { id: 2, name: 'HTML' },
  { id: 3, name: 'CSS' },
  { id: 4, name: 'JavaScript' },
  { id: 5, name: 'MySQL' },
  { id: 6, name: 'JDBC' },
  { id: 7, name: 'Servlet' },
  { id: 8, name: 'Python' },
  { id: 9, name: 'React' },
  { id: 10, name: 'Node.js' },
  { id: 11, name: 'Spring Boot' },
  { id: 12, name: 'Git' },
  { id: 13, name: 'Docker' },
  { id: 14, name: 'AWS' },
  { id: 15, name: 'Pandas' },
  { id: 16, name: 'NumPy' },
  { id: 17, name: 'Selenium' },
  { id: 18, name: 'JUnit' },
  { id: 19, name: 'PostgreSQL' },
  { id: 20, name: 'Linux' },
  { id: 21, name: 'REST API' },
  { id: 22, name: 'MongoDB' }
];

const predefinedRoles: RoleRecord[] = [
  {
    roleId: 1,
    roleName: 'Java Developer',
    description: 'Develop robust enterprise backend applications and microservices using Core Java, JDBC, Servlets, and MySQL.',
    category: 'Backend',
    minExperience: '0-1 years',
    requiredSkills: ['Java', 'JDBC', 'Servlet', 'MySQL', 'Git']
  },
  {
    roleId: 2,
    roleName: 'Web Developer',
    description: 'Build interactive and responsive user-facing websites using HTML5, CSS3, modern JavaScript, and MySQL databases.',
    category: 'Full Stack',
    minExperience: '0-1 years',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'MySQL', 'Git']
  },
  {
    roleId: 3,
    roleName: 'Frontend Developer',
    description: 'Design and implement fluid, accessible, and performant web interfaces utilizing HTML, CSS, JavaScript, and React.',
    category: 'Frontend',
    minExperience: '0-1 years',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git']
  },
  {
    roleId: 4,
    roleName: 'Backend Developer',
    description: 'Design scalable server-side architectures, RESTful APIs, and secure database integrations using Java, Node.js, and SQL.',
    category: 'Backend',
    minExperience: '1-2 years',
    requiredSkills: ['Java', 'MySQL', 'REST API', 'Linux', 'Git']
  },
  {
    roleId: 5,
    roleName: 'Full Stack Developer',
    description: 'End-to-end development of dynamic web applications encompassing frontend UI, server servlets, APIs, and relational databases.',
    category: 'Full Stack',
    minExperience: '1-2 years',
    requiredSkills: ['Java', 'HTML', 'CSS', 'JavaScript', 'MySQL', 'REST API']
  },
  {
    roleId: 6,
    roleName: 'Python Developer',
    description: 'Create data processing pipelines, automation scripts, and web services using Python, REST APIs, and SQL databases.',
    category: 'Backend',
    minExperience: '0-1 years',
    requiredSkills: ['Python', 'MySQL', 'REST API', 'Git', 'Linux']
  },
  {
    roleId: 7,
    roleName: 'Data Analyst',
    description: 'Extract, clean, analyze, and visualize complex datasets using Python, Pandas, NumPy, and advanced SQL querying.',
    category: 'Data Science',
    minExperience: '0-1 years',
    requiredSkills: ['Python', 'MySQL', 'Pandas', 'NumPy']
  },
  {
    roleId: 8,
    roleName: 'Software Tester',
    description: 'Ensure software quality, reliability, and correctness through automated test suites, Selenium, and JUnit frameworks.',
    category: 'Quality Assurance',
    minExperience: '0-1 years',
    requiredSkills: ['Java', 'Selenium', 'JUnit', 'Git']
  },
  {
    roleId: 9,
    roleName: 'Database Developer',
    description: 'Architect relational database schemas, write complex SQL queries, and optimize stored procedures using MySQL and PostgreSQL.',
    category: 'Database',
    minExperience: '1-2 years',
    requiredSkills: ['MySQL', 'PostgreSQL', 'JDBC', 'Linux']
  },
  {
    roleId: 10,
    roleName: 'DevOps Engineer',
    description: 'Automate CI/CD deployment pipelines, manage containerized environments with Docker, Linux systems, and cloud infrastructure.',
    category: 'DevOps',
    minExperience: '1-2 years',
    requiredSkills: ['Linux', 'Docker', 'Git', 'AWS']
  }
];

// Seed initial users
const usersDatabase: Map<string, UserRecord> = new Map();

function seedInitialData() {
  usersDatabase.set('rahul.sharma@college.edu', {
    userId: 1,
    name: 'Rahul Sharma',
    email: 'rahul.sharma@college.edu',
    password: 'pass123',
    phone: '9876543210',
    college: 'National Institute of Technology',
    department: 'Computer Science and Engineering',
    year: 3,
    preferredRole: 'Java Developer',
    skills: ['Java', 'HTML', 'CSS', 'MySQL', 'JavaScript']
  });

  usersDatabase.set('priya.patel@college.edu', {
    userId: 2,
    name: 'Priya Patel',
    email: 'priya.patel@college.edu',
    password: 'pass123',
    phone: '9876543211',
    college: 'College of Engineering & Technology',
    department: 'Information Technology',
    year: 4,
    preferredRole: 'Full Stack Developer',
    skills: ['Java', 'HTML', 'CSS', 'JavaScript', 'MySQL', 'REST API', 'Git']
  });

  usersDatabase.set('amit.verma@college.edu', {
    userId: 3,
    name: 'Amit Verma',
    email: 'amit.verma@college.edu',
    password: 'pass123',
    phone: '9876543212',
    college: 'State Engineering College',
    department: 'Computer Science and Engineering',
    year: 2,
    preferredRole: 'Data Analyst',
    skills: ['Python', 'MySQL', 'Pandas']
  });
}
seedInitialData();

// Simulated In-Memory Server Sessions (matching HttpSession)
const serverSessions: Map<string, { userId: number; email: string; createdAt: number }> = new Map();

// =============================================================================
// JAVA SERVLET ENDPOINTS (1:1 MAPPING TO web.xml)
// =============================================================================

/**
 * 1. LoginServlet
 * URL: /LoginServlet (POST)
 * Replicates: com.rolematch.controller.LoginServlet
 */
app.post('/LoginServlet', (req: Request, res: Response) => {
  const { email, password, remember } = req.body;
  console.log(`[Servlet POST /LoginServlet] Authenticating email: ${email}`);

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const user = usersDatabase.get(email.toLowerCase().trim());
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  // Create HTTP Session
  const sessionId = 'RM_SESS_' + Math.random().toString(36).substring(2, 10).toUpperCase();
  serverSessions.set(sessionId, {
    userId: user.userId,
    email: user.email,
    createdAt: Date.now()
  });

  // Set JSESSIONID Cookie
  res.cookie('JSESSIONID', sessionId, { httpOnly: true, maxAge: 30 * 60 * 1000 });

  // Set "Remember Me" Cookie if requested
  if (remember === 'true' || remember === 'on' || remember === true) {
    res.cookie('remember_user', user.email, { maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
  } else {
    res.clearCookie('remember_user', { path: '/' });
  }

  // Set "Preferred Category" Cookie
  const safeCategory = user.preferredRole.replace(/\s+/g, '_');
  res.cookie('preferred_category', safeCategory, { maxAge: 30 * 24 * 60 * 60 * 1000, path: '/' });

  return res.json({
    success: true,
    message: 'Login successful!',
    user: {
      id: user.userId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      college: user.college,
      department: user.department,
      year: user.year,
      preferredRole: user.preferredRole,
      skills: user.skills,
      sessionId: sessionId
    }
  });
});

/**
 * 2. RegisterServlet
 * URL: /RegisterServlet (POST)
 * Replicates: com.rolematch.controller.RegisterServlet
 */
app.post('/RegisterServlet', (req: Request, res: Response) => {
  const { name, email, password, phone, college, department, year, preferredRole, skills } = req.body;
  console.log(`[Servlet POST /RegisterServlet] Registering student: ${name} (${email})`);

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  if (usersDatabase.has(cleanEmail)) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
  }

  let skillList: string[] = [];
  if (typeof skills === 'string') {
    skillList = skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
  } else if (Array.isArray(skills)) {
    skillList = skills;
  }

  const newId = usersDatabase.size + 1;
  const newRecord: UserRecord = {
    userId: newId,
    name: name.trim(),
    email: cleanEmail,
    password: password,
    phone: phone.trim(),
    college: college ? college.trim() : 'Engineering College',
    department: department ? department.trim() : 'Computer Science',
    year: parseInt(year) || 1,
    preferredRole: preferredRole ? preferredRole.trim() : 'Java Developer',
    skills: skillList
  };

  usersDatabase.set(cleanEmail, newRecord);

  return res.json({
    success: true,
    message: 'Student registration successful! You can now log in.'
  });
});

/**
 * 3. LogoutServlet
 * URL: /LogoutServlet (GET/POST)
 * Replicates: com.rolematch.controller.LogoutServlet
 */
const handleLogout = (req: Request, res: Response) => {
  const sessionId = req.cookies['JSESSIONID'];
  if (sessionId) {
    serverSessions.delete(sessionId);
    res.clearCookie('JSESSIONID', { path: '/' });
    console.log(`[Servlet /LogoutServlet] Invalided session ${sessionId}`);
  }

  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.json({ success: true, message: 'Logged out successfully.' });
  }
  return res.redirect('/login.html?logout=true');
};
app.get('/LogoutServlet', handleLogout);
app.post('/LogoutServlet', handleLogout);

/**
 * 4. ProfileServlet
 * URL: /ProfileServlet (GET/POST)
 * Replicates: com.rolematch.controller.ProfileServlet
 */
app.get('/ProfileServlet', (req: Request, res: Response) => {
  const sessionId = req.cookies['JSESSIONID'];
  let email = 'rahul.sharma@college.edu'; // default demo fallback

  if (sessionId && serverSessions.has(sessionId)) {
    const sess = serverSessions.get(sessionId)!;
    email = sess.email;
  }

  const user = usersDatabase.get(email);
  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found or session expired.' });
  }

  return res.json({
    success: true,
    user: {
      id: user.userId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      college: user.college,
      department: user.department,
      year: user.year,
      preferredRole: user.preferredRole,
      skills: user.skills,
      sessionId: sessionId || 'RM_SESS_DEFAULT'
    }
  });
});

app.post('/ProfileServlet', (req: Request, res: Response) => {
  const sessionId = req.cookies['JSESSIONID'];
  let email = 'rahul.sharma@college.edu';

  if (sessionId && serverSessions.has(sessionId)) {
    const sess = serverSessions.get(sessionId)!;
    email = sess.email;
  }

  const user = usersDatabase.get(email);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Session expired.' });
  }

  const { skills } = req.body;
  if (typeof skills === 'string') {
    user.skills = skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
  } else if (Array.isArray(skills)) {
    user.skills = skills;
  }

  console.log(`[Servlet POST /ProfileServlet] Updated skills for ${user.email}:`, user.skills);
  return res.json({
    success: true,
    message: 'Skills updated successfully in database.',
    skills: user.skills
  });
});

/**
 * 5. RoleServlet
 * URL: /RoleServlet (GET)
 * Replicates: com.rolematch.controller.RoleServlet
 */
app.get('/RoleServlet', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    roles: predefinedRoles
  });
});

/**
 * 6. SkillServlet
 * URL: /SkillServlet (GET)
 * Replicates: com.rolematch.controller.SkillServlet
 */
app.get('/SkillServlet', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    skills: masterSkills
  });
});

/**
 * 7. MatchServlet (AJAX Role Matching Engine)
 * URL: /MatchServlet (POST/GET)
 * Replicates: com.rolematch.controller.MatchServlet
 * Formula: Match % = (matched_skills / total_required_skills) * 100
 */
const handleMatch = (req: Request, res: Response) => {
  const skillsInput = req.body.skills || req.query.skills || '';
  let studentSkills: string[] = [];

  if (typeof skillsInput === 'string' && skillsInput.trim().length > 0) {
    studentSkills = skillsInput.split(',').map(s => s.trim().toLowerCase());
  } else if (Array.isArray(skillsInput)) {
    studentSkills = skillsInput.map(s => String(s).trim().toLowerCase());
  }

  const studentSkillSet = new Set(studentSkills);
  console.log(`[Servlet /MatchServlet] Matching ${studentSkillSet.size} skills against ${predefinedRoles.length} roles.`);

  const rankedRoles = predefinedRoles.map(role => {
    const matched: string[] = [];
    const missing: string[] = [];

    role.requiredSkills.forEach(skill => {
      if (studentSkillSet.has(skill.toLowerCase())) {
        matched.push(skill);
      } else {
        missing.push(skill);
      }
    });

    const matchPercentage = role.requiredSkills.length > 0
      ? Math.round(((matched.length / role.requiredSkills.length) * 100) * 10) / 10
      : 0;

    return {
      roleId: role.roleId,
      roleName: role.roleName,
      category: role.category,
      minExperience: role.minExperience,
      description: role.description,
      matchPercentage: matchPercentage,
      matchedSkills: matched,
      missingSkills: missing,
      requiredSkills: role.requiredSkills
    };
  });

  // Sort descending by match percentage
  rankedRoles.sort((a, b) => b.matchPercentage - a.matchPercentage);

  return res.json({
    success: true,
    totalRoles: rankedRoles.length,
    studentSkills: Array.from(studentSkillSet),
    roles: rankedRoles
  });
};
app.post('/MatchServlet', handleMatch);
app.get('/MatchServlet', handleMatch);

/**
 * 8. XPathServlet (XML + XPath Engine)
 * URL: /XPathServlet (GET/POST)
 * Replicates: com.rolematch.controller.XPathServlet
 */
const handleXPath = (req: Request, res: Response) => {
  try {
    const category = (req.query.category || req.body.category || '') as string;
    const skill = (req.query.skill || req.body.skill || '') as string;
    const customXPath = (req.query.xpath || req.body.xpath || '') as string;

    let xpathQuery = '//role';
    if (customXPath.trim()) {
      xpathQuery = customXPath.trim();
    } else if (category.trim()) {
      xpathQuery = `//role[category='${category.trim()}']`;
    } else if (skill.trim()) {
      xpathQuery = `//role[skills/skill='${skill.trim()}']`;
    }

    const xmlPath = path.join(__dirname, 'webapp', 'data', 'roles.xml');
    if (!fs.existsSync(xmlPath)) {
      return res.status(404).json({ success: false, message: 'roles.xml not found.' });
    }

    const xmlContent = fs.readFileSync(xmlPath, 'utf8');
    const doc = new DOMParser().parseFromString(xmlContent, 'application/xml');
    const nodes = (xpath.select as any)(xpathQuery, doc as any) as any[];

    const matchedRoles: any[] = [];
    nodes.forEach(node => {
      if (node.nodeType === 1 && node.nodeName === 'role') {
        const getVal = (tag: string) => {
          const el = node.getElementsByTagName(tag)[0];
          return el && el.textContent ? el.textContent.trim() : '';
        };

        const skillEls = node.getElementsByTagName('skill');
        const roleSkills: string[] = [];
        for (let i = 0; i < skillEls.length; i++) {
          roleSkills.push(skillEls[i].textContent?.trim() || '');
        }

        matchedRoles.push({
          name: getVal('name'),
          category: getVal('category'),
          experience: getVal('experience'),
          description: getVal('description'),
          skills: roleSkills
        });
      }
    });

    console.log(`[Servlet /XPathServlet] Evaluated "${xpathQuery}" -> ${matchedRoles.length} matches`);
    return res.json({
      success: true,
      query: xpathQuery,
      matchCount: matchedRoles.length,
      roles: matchedRoles
    });
  } catch (err: any) {
    console.error('[XPathServlet Error]', err);
    return res.status(500).json({ success: false, message: err.message || 'XPath execution failed' });
  }
};
app.get('/XPathServlet', handleXPath);
app.post('/XPathServlet', handleXPath);

/**
 * 9. Source Code API (for Lab Code & Viva Companion)
 */
app.get('/api/source-code', (req: Request, res: Response) => {
  const fileName = (req.query.file as string) || 'LoginServlet.java';
  const fileMap: Record<string, string> = {
    'LoginServlet.java': path.join(__dirname, 'src/main/java/com/rolematch/controller/LoginServlet.java'),
    'MatchServlet.java': path.join(__dirname, 'src/main/java/com/rolematch/controller/MatchServlet.java'),
    'XPathServlet.java': path.join(__dirname, 'src/main/java/com/rolematch/controller/XPathServlet.java'),
    'RegisterServlet.java': path.join(__dirname, 'src/main/java/com/rolematch/controller/RegisterServlet.java'),
    'UserDAO.java': path.join(__dirname, 'src/main/java/com/rolematch/dao/UserDAO.java'),
    'DBConnection.java': path.join(__dirname, 'src/main/java/com/rolematch/dao/DBConnection.java'),
    'roles.xml': path.join(__dirname, 'webapp/data/roles.xml'),
    'web.xml': path.join(__dirname, 'webapp/WEB-INF/web.xml'),
    'role_matcher.sql': path.join(__dirname, 'database/role_matcher.sql'),
    'VIVA_QUESTIONS.md': path.join(__dirname, 'docs/VIVA_QUESTIONS.md')
  };

  const targetPath = fileMap[fileName];
  if (targetPath && fs.existsSync(targetPath)) {
    const content = fs.readFileSync(targetPath, 'utf8');
    return res.json({ success: true, file: fileName, code: content });
  }
  return res.status(404).json({ success: false, message: 'File not found' });
});

/**
 * 10. Complete Project ZIP Downloader
 * Bundles the entire Java EE Dynamic Web Project into a .zip file
 */
app.get('/api/download-project', async (_req: Request, res: Response) => {
  try {
    const zip = new JSZip();

    // Helper to add files recursively
    function addDirToZip(baseDir: string, zipFolder: JSZip) {
      if (!fs.existsSync(baseDir)) return;
      const files = fs.readdirSync(baseDir);
      for (const file of files) {
        const fullPath = path.join(baseDir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          addDirToZip(fullPath, zipFolder.folder(file)!);
        } else {
          zipFolder.file(file, fs.readFileSync(fullPath));
        }
      }
    }

    addDirToZip(path.join(__dirname, 'src/main/java'), zip.folder('src/main/java')!);
    addDirToZip(path.join(__dirname, 'webapp'), zip.folder('webapp')!);
    addDirToZip(path.join(__dirname, 'database'), zip.folder('database')!);
    addDirToZip(path.join(__dirname, 'docs'), zip.folder('docs')!);
    
    // Add README and HTML files
    if (fs.existsSync(path.join(__dirname, 'README.md'))) {
      zip.file('README.md', fs.readFileSync(path.join(__dirname, 'README.md')));
    }
    if (fs.existsSync(path.join(__dirname, 'index.html'))) {
      zip.file('webapp/index.html', fs.readFileSync(path.join(__dirname, 'index.html')));
    }
    if (fs.existsSync(path.join(__dirname, 'login.html'))) {
      zip.file('webapp/login.html', fs.readFileSync(path.join(__dirname, 'login.html')));
    }
    if (fs.existsSync(path.join(__dirname, 'register.html'))) {
      zip.file('webapp/register.html', fs.readFileSync(path.join(__dirname, 'register.html')));
    }
    if (fs.existsSync(path.join(__dirname, 'dashboard.html'))) {
      zip.file('webapp/dashboard.html', fs.readFileSync(path.join(__dirname, 'dashboard.html')));
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="RoleMatch_WebTech_Project.zip"');
    return res.send(zipBuffer);
  } catch (e: any) {
    console.error('[ZIP Error]', e);
    return res.status(500).send('Failed to generate project zip.');
  }
});

// =============================================================================
// Static Asset & Vite Middleware Integration
// =============================================================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.use(express.static(path.join(__dirname, 'public')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`================================================================`);
    console.log(`[RoleMatch System] Web Technology Lab Server Running`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`Java Servlets mapped: /LoginServlet, /RegisterServlet, /MatchServlet, /XPathServlet, etc.`);
    console.log(`================================================================`);
  });
}

startServer();
