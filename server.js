import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = path.join(process.cwd(), 'db.json');

// Load environment variables from .env if present
const ENV_FILE = path.join(process.cwd(), '.env');
const env = {};
if (fs.existsSync(ENV_FILE)) {
  const content = fs.readFileSync(ENV_FILE, 'utf8');
  content.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      env[key] = val;
    }
  });
}
const GEMINI_API_KEY = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

let genAI = null;
if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_API_KEY_HERE') {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  } catch (err) {
    console.error("Failed to initialize GoogleGenerativeAI SDK:", err);
  }
}

// Helper to read DB
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify({ users: {}, friendRequests: [], loginHistory: [] }, null, 2));
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file:", err);
    return { users: {}, friendRequests: [], loginHistory: [] };
  }
}

// Helper to write DB
function writeDb(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}

// Startup DB seeding for Admin control
(function seedDb() {
  const db = readDb();
  let modified = false;

  if (!db.users) {
    db.users = {};
    modified = true;
  }
  if (!db.friendRequests) {
    db.friendRequests = [];
    modified = true;
  }
  if (!db.loginHistory) {
    db.loginHistory = [];
    modified = true;
  }
  if (!db.otps) {
    db.otps = {};
    modified = true;
  }

  const adminEmail = 'admin_ajith@gmail.com';
  if (!db.users[adminEmail]) {
    const salt = bcrypt.genSaltSync(10);
    db.users[adminEmail] = {
      email: adminEmail,
      name: 'Admin Ajith',
      phone: '9876543210',
      squadSize: '1',
      expeditionDays: '99',
      password: bcrypt.hashSync('1234', salt),
      role: 'admin',
      sessionToken: '',
      savedCircuits: '[]',
      circuitHistory: '[]',
      favorites: '[]'
    };
    modified = true;
    console.log("Seeded administrator account in db.json.");
  }

  if (modified) {
    writeDb(db);
  }
})();

// Backend route cache to prevent duplicate queries and rate limits
const routeCache = new Map();

// Proxy route for OSM Routing API to bypass CORS/rate-limit blocks on localhost
app.get('/api/route', async (req, res) => {
  const { coords } = req.query;
  if (!coords) {
    return res.status(400).json({ error: "Missing coordinates parameter" });
  }

  if (routeCache.has(coords)) {
    console.log(`Backend proxy: Cache HIT for coords: "${coords}"`);
    return res.json(routeCache.get(coords));
  }

  console.log(`Backend proxy: Cache MISS. Querying route for coords: "${coords}"`);

  // Try OpenStreetMap Germany Router
  try {
    const url = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${coords}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();
    if (response.ok) {
      routeCache.set(coords, data);
      return res.json(data);
    } else {
      console.warn("OSM Germany Router returned error status:", response.status, data);
    }
  } catch (err) {
    console.warn("Backend proxy: Primary router failed for coords:", coords, "Error:", err.message);
    if (err.cause) console.warn("Cause:", err.cause);
  }

  // Try Backup Router
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();
    if (response.ok) {
      routeCache.set(coords, data);
      return res.json(data);
    } else {
      console.warn("Backup OSRM Router returned error status:", response.status, data);
    }
  } catch (err) {
    console.warn("Backend proxy: Backup router failed for coords:", coords, "Error:", err.message);
    if (err.cause) console.warn("Cause:", err.cause);
  }

  return res.status(502).json({ error: "Failed to fetch route from routing engines" });
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10}$/;

// Helper to verify session and sharing permissions
function verifySession(db, email, requestorEmail, token) {
  if (!email || !requestorEmail || !token) {
    return { valid: false, status: 400, error: "Missing required session parameters (email, requestorEmail, token)" };
  }
  const normRequestor = requestorEmail.toLowerCase();
  const requestorUser = db.users[normRequestor];
  
  if (!requestorUser) {
    return { valid: false, status: 401, error: "Unauthorized: Requesting user not found" };
  }
  
  if (!requestorUser.sessionToken || requestorUser.sessionToken !== token) {
    return { valid: false, status: 401, error: "Unauthorized: Invalid session token" };
  }
  
  const normEmail = email.toLowerCase();
  if (normEmail === normRequestor) {
    return { valid: true, user: requestorUser };
  }
  
  // Checking friend request permissions
  const requests = db.friendRequests || [];
  const hasAccess = requests.some(req => 
    req.status === 'accepted' && 
    ((req.senderEmail === normRequestor && req.recipientEmail === normEmail) ||
     (req.senderEmail === normEmail && req.recipientEmail === normRequestor))
  );
  
  if (!hasAccess) {
    return { valid: false, status: 403, error: "Forbidden: You do not have access to this shared account" };
  }
  
  const targetUser = db.users[normEmail];
  if (!targetUser) {
    return { valid: false, status: 404, error: "Target user not found" };
  }
  
  return { valid: true, user: targetUser };
}

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const db = readDb();
  const normalizedEmail = email.toLowerCase();
  let user = db.users[normalizedEmail];

  // If user does not exist, reject they must register
  if (!user) {
    return res.status(404).json({ error: "Account not found. Please register to create a new explorer profile." });
  }

  // Check password
  const isPasswordValid = bcrypt.compareSync(password || '', user.password);
  if (!isPasswordValid) {
    // Log failed access attempt
    db.loginHistory.push({
      email: normalizedEmail,
      timestamp: new Date().toISOString(),
      action: 'Security Access Refused (Incorrect Credentials)',
      status: 'failure'
    });
    writeDb(db);
    return res.status(401).json({ error: "Incorrect password. If you forgot your password, click 'Forgot Key?' to reset it." });
  }

  // Generate new session token on successful login
  user.sessionToken = crypto.randomUUID();

  // Log successful login access event
  db.loginHistory.push({
    email: normalizedEmail,
    timestamp: new Date().toISOString(),
    action: user.role === 'admin' ? 'Administrative Access / Access Granted' : 'Security Check / Access Granted',
    status: 'success'
  });

  writeDb(db);

  const userCopy = { ...user };
  delete userCopy.password;

  return res.json({ 
    message: "Login successful", 
    sessionToken: user.sessionToken, 
    user: userCopy 
  });
});

app.post('/api/register', (req, res) => {
  const { email, phone, fullName, squadSize, expeditionDays, password } = req.body;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (!phone || !phoneRegex.test(phone)) {
    return res.status(400).json({ error: "Mobile number must be 10 digits" });
  }

  const db = readDb();
  const normalizedEmail = email.toLowerCase();

  if (db.users[normalizedEmail]) {
    return res.status(400).json({ error: "User already exists" });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password || 'password123', salt);
  const sessionToken = crypto.randomUUID();

  db.users[normalizedEmail] = {
    email: normalizedEmail,
    name: fullName,
    phone: phone,
    squadSize: squadSize || '4',
    expeditionDays: expeditionDays || '5',
    password: hashedPassword,
    role: 'user',
    sessionToken: sessionToken,
    savedCircuits: '[]',
    circuitHistory: '[]',
    favorites: '[]'
  };

  // Log successful account registration event
  db.loginHistory.push({
    email: normalizedEmail,
    timestamp: new Date().toISOString(),
    action: 'New Explorer Registered / Access Granted',
    status: 'success'
  });

  writeDb(db);
  
  const userCopy = { ...db.users[normalizedEmail] };
  delete userCopy.password;

  return res.json({ 
    message: "Registration successful", 
    sessionToken, 
    user: userCopy 
  });
});

app.get('/api/user-data', (req, res) => {
  const { email, requestorEmail, token } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Email parameter is required" });
  }

  const db = readDb();
  
  // Verify session
  const verification = verifySession(db, email, requestorEmail || email, token);
  if (!verification.valid) {
    return res.status(verification.status).json({ error: verification.error });
  }

  const userCopy = { ...verification.user };
  delete userCopy.password;
  return res.json(userCopy);
});

app.post('/api/user-data', (req, res) => {
  const { email, requestorEmail, token, name, phone, squadSize, expeditionDays, savedCircuits, circuitHistory, favorites } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const db = readDb();

  // Verify session
  const verification = verifySession(db, email, requestorEmail || email, token);
  if (!verification.valid) {
    return res.status(verification.status).json({ error: verification.error });
  }

  const normalizedEmail = email.toLowerCase();
  const existingUser = db.users[normalizedEmail] || {};

  db.users[normalizedEmail] = {
    email: normalizedEmail,
    name: name !== undefined ? name : (existingUser.name || ''),
    phone: phone !== undefined ? phone : (existingUser.phone || ''),
    squadSize: squadSize !== undefined ? squadSize : (existingUser.squadSize || ''),
    expeditionDays: expeditionDays !== undefined ? expeditionDays : (existingUser.expeditionDays || ''),
    password: existingUser.password || '',
    sessionToken: existingUser.sessionToken || '',
    savedCircuits: savedCircuits !== undefined ? savedCircuits : (existingUser.savedCircuits || '[]'),
    circuitHistory: circuitHistory !== undefined ? circuitHistory : (existingUser.circuitHistory || '[]'),
    favorites: favorites !== undefined ? favorites : (existingUser.favorites || '[]')
  };

  writeDb(db);
  return res.json({ success: true, message: "User data updated successfully" });
});

app.post('/api/friend-request', (req, res) => {
  const { senderEmail, recipientEmail, recipientPhone, token } = req.body;
  if (!senderEmail || !recipientEmail || !recipientPhone || !token) {
    return res.status(400).json({ error: "Sender email, recipient email, recipient phone, and token are required" });
  }

  const db = readDb();
  
  // Verify sender
  const normSender = senderEmail.toLowerCase();
  const senderUser = db.users[normSender];
  if (!senderUser || senderUser.sessionToken !== token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!db.friendRequests) {
    db.friendRequests = [];
  }

  // Create the request
  const request = {
    id: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    senderEmail: normSender,
    recipientEmail: recipientEmail.toLowerCase(),
    recipientPhone: recipientPhone.trim(),
    status: 'pending'
  };

  db.friendRequests.push(request);
  writeDb(db);

  return res.json({ success: true, message: "Share request sent successfully", request });
});

app.get('/api/friend-requests', (req, res) => {
  const { email, token } = req.query;
  if (!email || !token) {
    return res.status(400).json({ error: "Email and token parameters are required" });
  }

  const db = readDb();
  const normEmail = email.toLowerCase();
  const user = db.users[normEmail];
  if (!user || user.sessionToken !== token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const requests = db.friendRequests || [];

  // Filter requests matching recipient or sender
  const received = requests.filter(req => req.recipientEmail === normEmail);
  const sent = requests.filter(req => req.senderEmail === normEmail);

  return res.json({ received, sent });
});

app.post('/api/friend-request/accept', (req, res) => {
  const { requestId, recipientEmail, token } = req.body;
  if (!requestId || !recipientEmail || !token) {
    return res.status(400).json({ error: "Request ID, recipient email, and token are required" });
  }

  const db = readDb();
  const normRecipient = recipientEmail.toLowerCase();
  const recipientUser = db.users[normRecipient];
  if (!recipientUser || recipientUser.sessionToken !== token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const requests = db.friendRequests || [];
  const reqIndex = requests.findIndex(r => r.id === requestId);
  if (reqIndex === -1) {
    return res.status(404).json({ error: "Friend request not found" });
  }

  if (requests[reqIndex].recipientEmail !== normRecipient) {
    return res.status(403).json({ error: "Forbidden: This request is not for you" });
  }

  requests[reqIndex].status = 'accepted';
  writeDb(db);

  return res.json({ success: true, message: "Friend request accepted successfully" });
});

app.post('/api/friend-request/cancel', (req, res) => {
  const { requestId, email, token } = req.body;
  if (!requestId || !email || !token) {
    return res.status(400).json({ error: "Request ID, email, and token are required" });
  }

  const db = readDb();
  const normEmail = email.toLowerCase();
  const user = db.users[normEmail];
  if (!user || user.sessionToken !== token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const requests = db.friendRequests || [];
  const reqItem = requests.find(r => r.id === requestId);
  if (!reqItem) {
    return res.status(404).json({ error: "Friend request not found" });
  }

  if (reqItem.senderEmail !== normEmail && reqItem.recipientEmail !== normEmail) {
    return res.status(403).json({ error: "Forbidden: Not your request" });
  }

  const nextRequests = requests.filter(r => r.id !== requestId);
  db.friendRequests = nextRequests;
  writeDb(db);

  return res.json({ success: true, message: "Friend request cancelled successfully" });
});

// Admin validation helper
function verifyAdmin(db, email, token) {
  if (!email || !token) return false;
  const normEmail = email.toLowerCase();
  const user = db.users[normEmail];
  return (user && user.role === 'admin' && user.sessionToken === token);
}

// GET all database telemetry (Admin only)
app.get('/api/admin/data', (req, res) => {
  const { email, token } = req.query;
  const db = readDb();
  if (!verifyAdmin(db, email, token)) {
    return res.status(403).json({ error: "Access denied. Administrative authorization required." });
  }

  // Create a safe copy of users (omitting password hash)
  const safeUsers = {};
  Object.keys(db.users).forEach(key => {
    const userCopy = { ...db.users[key] };
    delete userCopy.password;
    safeUsers[key] = userCopy;
  });

  return res.json({
    users: safeUsers,
    friendRequests: db.friendRequests || [],
    loginHistory: db.loginHistory || []
  });
});

// POST edit user profile (Admin only)
app.post('/api/admin/update-user', (req, res) => {
  const { email, token, targetEmail, name, phone, squadSize, expeditionDays, password } = req.body;
  const db = readDb();
  if (!verifyAdmin(db, email, token)) {
    return res.status(403).json({ error: "Access denied. Administrative authorization required." });
  }

  if (!targetEmail) {
    return res.status(400).json({ error: "Target email parameter is required" });
  }

  const normTarget = targetEmail.toLowerCase();
  const targetUser = db.users[normTarget];
  if (!targetUser) {
    return res.status(404).json({ error: "Target user not found" });
  }

  // Update target user parameters
  if (name !== undefined) targetUser.name = name;
  if (phone !== undefined) targetUser.phone = phone;
  if (squadSize !== undefined) targetUser.squadSize = squadSize;
  if (expeditionDays !== undefined) targetUser.expeditionDays = expeditionDays;
  
  if (password) {
    const salt = bcrypt.genSaltSync(10);
    targetUser.password = bcrypt.hashSync(password, salt);
  }

  // Log update action in history
  const passwordStatusStr = password ? " (Password Reset Triggered)" : "";
  db.loginHistory.push({
    email: email.toLowerCase(),
    timestamp: new Date().toISOString(),
    action: `Admin: Updated details for user ${targetEmail}${passwordStatusStr}`,
    status: 'success'
  });

  writeDb(db);
  return res.json({ success: true, message: `User ${targetEmail} updated successfully by administrator.` });
});

// POST delete user profile (Admin only)
app.post('/api/admin/delete-user', (req, res) => {
  const { email, token, targetEmail } = req.body;
  const db = readDb();
  if (!verifyAdmin(db, email, token)) {
    return res.status(403).json({ error: "Access denied. Administrative authorization required." });
  }

  if (!targetEmail) {
    return res.status(400).json({ error: "Target email parameter is required" });
  }

  const normTarget = targetEmail.toLowerCase();
  if (!db.users[normTarget]) {
    return res.status(404).json({ error: "Target user not found" });
  }

  if (normTarget === email.toLowerCase()) {
    return res.status(400).json({ error: "You cannot delete your own administrative account." });
  }

  delete db.users[normTarget];
  
  // Clean up friend requests referencing deleted user
  if (db.friendRequests) {
    db.friendRequests = db.friendRequests.filter(r => 
      r.senderEmail !== normTarget && r.recipientEmail !== normTarget
    );
  }

  // Log deletion in history
  db.loginHistory.push({
    email: email.toLowerCase(),
    timestamp: new Date().toISOString(),
    action: `Admin: DELETED user account ${targetEmail}`,
    status: 'success'
  });

  writeDb(db);
  return res.json({ success: true, message: `User ${targetEmail} and their credentials deleted successfully.` });
});

// POST request OTP verification code (Forgot password)
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const db = readDb();
  const normalizedEmail = email.toLowerCase();
  const user = db.users[normalizedEmail];

  if (!user) {
    return res.status(404).json({ error: "No explorer found with this email address." });
  }

  // Generate random 6-digit verification OTP code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins expiry

  if (!db.otps) {
    db.otps = {};
  }
  db.otps[normalizedEmail] = { otp, expiresAt };

  // Log OTP generation to history
  db.loginHistory.push({
    email: normalizedEmail,
    timestamp: new Date().toISOString(),
    action: `Security Protocol: Dispatch OTP code [ ${otp} ] to user`,
    status: 'success'
  });

  writeDb(db);

  return res.json({ 
    message: "Security code dispatched. Check your console/admin logs for the verification code.",
    otp // returned in body for simulator testing in frontend
  });
});

// POST verify OTP and reset password
app.post('/api/auth/reset-password', (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: "Email, verification OTP, and new password are required." });
  }

  const db = readDb();
  const normalizedEmail = email.toLowerCase();
  const user = db.users[normalizedEmail];

  if (!user) {
    return res.status(404).json({ error: "No explorer found with this email address." });
  }

  const record = db.otps && db.otps[normalizedEmail];
  if (!record || record.otp !== otp || Date.now() > record.expiresAt) {
    return res.status(400).json({ error: "Invalid or expired verification OTP." });
  }

  // OTP is valid! Update password
  const salt = bcrypt.genSaltSync(10);
  user.password = bcrypt.hashSync(newPassword, salt);

  // Consume OTP
  delete db.otps[normalizedEmail];

  // Log successful reset
  db.loginHistory.push({
    email: normalizedEmail,
    timestamp: new Date().toISOString(),
    action: `Security Protocol: Password successfully recovered via OTP reset`,
    status: 'success'
  });

  writeDb(db);

  return res.json({ success: true, message: "Security Key updated successfully. You can now login." });
});

// Helper for coordinate distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return parseFloat((R * c).toFixed(2));
}

const SYSTEM_PROMPT = `
You are the "manglore.nav AI", a highly intelligent travel assistant for the Mangaluru and Udupi regions.
Your mission is to help users explore destinations, plan itineraries, find hotels, and learn about the local culture.

INTELLIGENCE GUIDELINES:
1. Typo & Phonetic Matching: If a user misspells a location (e.g., "taneru bhavi", "sultan btry", "manipal"), map it to the closest phonetic/logical match in the LOCATIONS list (e.g. "Tannirbhavi Beach", "Sultan Battery"). Do not hallucinate places.
2. Needs Analysis: If the user states an abstract need ("I want peace", "family friendly", "hungry"), intelligently select 2-3 locations from the list that match their needs AND ALWAYS use the SET_STOPS action to instantly map them on the user's screen. The provided LOCATIONS and HOTELS lists are ordered by distance from the user. ALWAYS prioritize the closest (top) options first unless they specify otherwise. If they ask for "all" places, list them all.
3. Emotional Intelligence: If the user expresses a mood or emotion (e.g., "I am sad", "feeling stressed", "energetic", "happy"), automatically build a therapeutic or matching circuit (2-3 locations). For example, if they are sad, create a soothing nature/coastal circuit to uplift them. If energetic, suggest an adventure or urban circuit. Always trigger the SET_STOPS action for this.
4. Conversational Tone: Be highly enthusiastic, authoritative, and helpful. Use a sci-fi/navigator persona ("Target acquired", "Plotting coordinates", "Sensors indicate").

ACTION PROTOCOL:
You can perform special system actions by including a JSON block at the end of your response.
CRITICAL: Location IDs must be integers (e.g. 19), NOT strings (e.g. "19").
Possible actions:
1. SET_STOPS: { "type": "SET_STOPS", "payload": [locationId1, locationId2, ...] }
2. SWITCH_TAB: { "type": "SWITCH_TAB", "payload": "explore" | "dining" | "stays" | "routes" | "favorites" }
3. ROUTE_TO: { "type": "ROUTE_TO", "payload": locationId } - Use this specifically when a user asks to navigate, get directions, or route to a single destination from their location.

SUGGESTIONS:
You should also include a list of 2-3 suggested follow-up questions in a "suggestions" field of your JSON block, which will be shown to the user as clickable option chips.
Example:
\`\`\`json
{ 
  "type": "SET_STOPS", 
  "payload": [1, 19],
  "suggestions": ["Tell me about Panambur Beach", "How do I get there?", "Find hotels nearby"] 
}
\`\`\`
Even if there is no main system action (like mapping stops or switching tabs), you can still output an action block just for suggestions, for example:
\`\`\`json
{
  "suggestions": ["What are the best seafood restaurants?", "Plan a temple route"]
}
\`\`\`
`;

function parseAIResponse(text) {
  let action = null;
  let cleanText = text;

  // Match any curly braces JSON block containing type or suggestions
  const jsonRegex = /({[\s\S]*?})/s;
  const match = text.match(jsonRegex);

  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (parsed && (parsed.type || parsed.suggestions)) {
        action = parsed;
        cleanText = text.replace(match[0], '').trim();
      }
    } catch (e) {
      try {
        const fixedJson = match[0].replace(/,\s*}/g, '}').replace(/,\s*\]/g, ']');
        const parsed = JSON.parse(fixedJson);
        if (parsed && (parsed.type || parsed.suggestions)) {
          action = parsed;
          cleanText = text.replace(match[0], '').trim();
        }
      } catch (e2) {
        console.warn("Could not parse AI JSON:", match[0]);
      }
    }
  }

  // Clean up any remaining markdown backticks if any are left
  cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '').trim();

  return { text: cleanText, action };
}

function simulateIntelligentResponse(query, locations, chatHistory = [], isError = false) {
  const q = query.toLowerCase();
  let response = { text: "", action: null };
  const offlineNote = isError ? "\n\n*(Neural link error)*" : "\n\n*(Running in Local Mode)*";

  // Check for region filter
  let regionFilter = null;
  if (q.includes('udupi')) {
    regionFilter = 'Udupi';
  } else if (q.includes('mangaluru') || q.includes('mangalore')) {
    regionFilter = 'Mangaluru';
  }

  // Helper to find locations in text with robust fuzzy matching
  const findLocationsInText = (text) => {
    const textLower = text.toLowerCase();
    const matched = new Set();

    const levenshtein = (a, b) => {
      if (a.length === 0) return b.length;
      if (b.length === 0) return a.length;
      let prevRow = Array(b.length + 1).fill(0).map((_, i) => i);
      for (let i = 0; i < a.length; i++) {
        const currRow = [i + 1];
        for (let j = 0; j < b.length; j++) {
          const indicator = a[i] === b[j] ? 0 : 1;
          currRow.push(Math.min(currRow[j] + 1, prevRow[j + 1] + 1, prevRow[j] + indicator));
        }
        prevRow = currRow;
      }
      return prevRow[b.length];
    };

    const textWords = textLower.split(/\W+/).filter(w => w.length >= 3);
    const bigrams = [];
    for (let i = 0; i < textWords.length - 1; i++) {
      bigrams.push(textWords[i] + textWords[i+1]);
    }
    const combinedWords = [...textWords, ...bigrams];

    for (const loc of locations) {
      const name = loc.name.toLowerCase();
      
      // If region filter is active, check region match
      if (regionFilter && loc.region !== regionFilter) continue;
      
      // 1. Exact substring match
      if (textLower.includes(name)) {
        matched.add(loc);
        continue;
      }
      
      // 2. Core name match (ignoring generic terms)
      const coreName = name.replace(/\b(beach|temple|park|lake|mall|chapel|church|hotel|restaurant|falls|caves|island|matha)\b/g, '').trim();
      if (coreName.length >= 4 && textLower.includes(coreName)) {
        matched.add(loc);
        continue;
      }
      
      // 3. Fuzzy word match with bigram support
      const significantWords = coreName.split(/\W+/).filter(w => 
        w.length >= 4 && !['city', 'centre', 'the', 'sri'].includes(w)
      );

      for (const sw of significantWords) {
        let found = false;
        for (const tw of combinedWords) {
          const dist = levenshtein(sw, tw);
          const maxDist = sw.length > 5 ? 2 : 1;
          if (dist <= maxDist || (sw.length >= 5 && tw.length >= 5 && (sw.startsWith(tw.substring(0, 4)) || tw.startsWith(sw.substring(0, 4))))) {
             found = true;
             break;
          }
        }
        if (found) {
          matched.add(loc);
          break;
        }
      }
    }
    return Array.from(matched);
  };

  // 1. Try to find location in current query
  let matchedLocations = findLocationsInText(q);

  // 2. If no location in current query, check chat history for context
  if (matchedLocations.length === 0) {
    for (let i = chatHistory.length - 1; i >= 0; i--) {
      if (chatHistory[i].role === 'user') {
        const histLocs = findLocationsInText(chatHistory[i].content);
        if (histLocs.length > 0) {
          matchedLocations = histLocs;
          break;
        }
      }
    }
  }

  // Filter locations by region if filter active and not already filtered
  let availableLocations = locations;
  if (regionFilter) {
    availableLocations = locations.filter(l => l.region === regionFilter);
  }

  if (matchedLocations.length > 0) {
    const loc = matchedLocations[0];
    const names = matchedLocations.map(l => l.name).join(' and ');
    const ids = matchedLocations.map(l => l.id);

    if (matchedLocations.length > 1 || q.includes('circuit')) {
      response.text = `Circuit sequence initiated. I've mapped a route for ${names}.`;
      response.action = { 
        type: 'SET_STOPS', 
        payload: ids,
        suggestions: [`Tell me about ${loc.name}`, "Suggest hotels near here", "How to get there?"]
      };
    } else if (q.includes('navigate') || q.includes('route') || q.includes('directions') || q.includes('take me') || q.includes('path') || q.includes('how to reach')) {
      response.text = `Routing sequence initiated. Calculating optimal path from your current location to ${loc.name}...`;
      response.action = { 
        type: 'ROUTE_TO', 
        payload: loc.id,
        suggestions: [`Tell me about ${loc.name}`, `Find hotels near ${loc.name}`, "Switch to dining tab"]
      };
    } else {
      response.text = `Target acquired: ${loc.name}. I've pulled up its coordinates from my local database and set it as your destination!`;
      response.action = { 
        type: 'SET_STOPS', 
        payload: [loc.id],
        suggestions: [`Navigate to ${loc.name}`, `What is special about ${loc.name}?`, `Find hotels near ${loc.name}`]
      };
    }
  } 
  // Handle conversational requests for paths without a specific location
  else if (q.includes('path') || q.includes('route') || q.includes('navigate')) {
    response.text = "I need a specific destination! For example, try saying: 'Navigate to Panambur Beach'.";
    response.action = {
      suggestions: ["Navigate to Panambur Beach", "Plan a temple route", "Show me Udupi beaches"]
    };
  }
  // 3. Handle categories and needs analysis
  else if (q.includes('beach') || q.includes('coast') || q.includes('ocean') || q.includes('sea') || q.includes('surf')) {
    const beachIds = availableLocations.filter(l => l.category === 'Coastal').slice(0, 2).map(l => l.id);
    const beachNames = availableLocations.filter(l => l.category === 'Coastal').slice(0, 2).map(l => l.name);
    response.text = `Coastal Expedition protocol active! I've mapped the best beach nodes for your mission (${beachNames.join(', ')}).`;
    response.action = { 
      type: 'SET_STOPS', 
      payload: beachIds,
      suggestions: ["Show hotels near the beach", "Find seafood spots nearby", "What's the best time to visit?"]
    };
  } else if (q.includes('temple') || q.includes('spiritual') || q.includes('pray') || q.includes('matha')) {
    const templeIds = availableLocations.filter(l => l.category === 'Religious').slice(0, 2).map(l => l.id);
    const templeNames = availableLocations.filter(l => l.category === 'Religious').slice(0, 2).map(l => l.name);
    response.text = `Spiritual Circuit mapped. I've added the top religious nodes (${templeNames.join(', ')}) to your itinerary.`;
    response.action = { 
      type: 'SET_STOPS', 
      payload: templeIds,
      suggestions: ["Show historical places", "Suggest local stays", "How do I travel between these?"]
    };
  } else if (q.includes('hotel') || q.includes('stay') || q.includes('sleep') || q.includes('rest') || q.includes('resort')) {
    response.text = "Hospitality nodes accessed. Switching to the Stays module for you.";
    response.action = { 
      type: 'SWITCH_TAB', 
      payload: 'stays',
      suggestions: ["Show luxury stays", "Show budget options", "Recommend a beach resort"]
    };
  } else if (q.includes('peace') || q.includes('relax') || q.includes('quiet') || q.includes('sunset')) {
    const peacefulIds = availableLocations.filter(l => l.category === 'Coastal' || l.category === 'Nature').slice(0, 3).map(l => l.id);
    response.text = "I sense you need tranquility. I've mapped the most peaceful coastal and nature nodes for your relaxation protocol.";
    response.action = { 
      type: 'SET_STOPS', 
      payload: peacefulIds,
      suggestions: ["Find a hotel near one of these", "Suggest local food options", "Show historical chapels"]
    };
  } else if (q.includes('family') || q.includes('kids') || q.includes('fun')) {
    const familyIds = availableLocations.filter(l => l.category === 'Heritage' || l.category === 'Urban' || l.category === 'Nature').slice(0, 3).map(l => l.id);
    response.text = "Family expedition mapped! I've selected the safest and most engaging cultural and natural hubs.";
    response.action = { 
      type: 'SET_STOPS', 
      payload: familyIds,
      suggestions: ["Are these kids-friendly?", "Show hotels with pool", "Recommend ice cream parlors"]
    };
  } else if (q.includes('sad') || q.includes('depressed') || q.includes('down') || q.includes('unhappy')) {
    const upliftingIds = availableLocations.filter(l => l.category === 'Coastal' || l.category === 'Nature').slice(0, 3).map(l => l.id);
    response.text = "I sense your mood. Let's lift those spirits! I've plotted a soothing therapeutic circuit of peaceful coastal and natural nodes to help you recharge.";
    response.action = { 
      type: 'SET_STOPS', 
      payload: upliftingIds,
      suggestions: ["Show beach details", "Where can I get good food?", "Switch to explore tab"]
    };
  } else if (q.includes('energetic') || q.includes('adventure') || q.includes('excited') || q.includes('happy') || q.includes('trek') || q.includes('kayak') || q.includes('climb')) {
    const adventureIds = availableLocations.filter(l => l.category === 'Urban' || l.category === 'Nature' || l.category === 'Adventure').slice(0, 3).map(l => l.id);
    response.text = "High energy levels detected! I've mapped a thrilling adventure circuit for maximum exploration.";
    response.action = { 
      type: 'SET_STOPS', 
      payload: adventureIds,
      suggestions: ["How difficult is the trek?", "Find surfing spots", "Plan a beach trip"]
    };
  } else if (q.includes('food') || q.includes('eat') || q.includes('hungry') || q.includes('dinner') || q.includes('lunch') || q.includes('restaurant') || q.includes('seafood') || q.includes('dosa') || q.includes('ice cream')) {
    const foodIds = availableLocations.filter(l => l.category === 'Culinary').slice(0, 3).map(l => l.id);
    if (foodIds.length > 0) {
      response.text = "Culinary sensors activated. I've instantly mapped the closest dining spots for you.";
      response.action = { 
        type: 'SET_STOPS', 
        payload: foodIds,
        suggestions: ["Switch to dining tab", "Which is famous for Gadbad?", "Recommend budget dining"]
      };
    } else {
      response.text = "Culinary sensors activated. Switching to the Stays module where you can find hotel restaurants.";
      response.action = { 
        type: 'SWITCH_TAB', 
        payload: 'stays',
        suggestions: ["Show dining spots", "Where is Mitra Samaj?", "Where is Giri Manja's?"]
      };
    }
  } else if (q.includes('fort') || q.includes('heritage') || q.includes('history') || q.includes('ancient') || q.includes('monument')) {
    const heritageIds = availableLocations.filter(l => l.category === 'Heritage').slice(0, 3).map(l => l.id);
    const heritageNames = availableLocations.filter(l => l.category === 'Heritage').slice(0, 3).map(l => l.name);
    response.text = `Heritage protocol active! I've selected ancient monuments and forts: ${heritageNames.join(', ')}.`;
    response.action = {
      type: 'SET_STOPS',
      payload: heritageIds,
      suggestions: ["Tell me about Sultan Battery", "Show spiritual places", "Find stays nearby"]
    };
  } else if (q.includes('nature') || q.includes('waterfall') || q.includes('falls') || q.includes('lake') || q.includes('zoo') || q.includes('park') || q.includes('butterfly')) {
    const natureIds = availableLocations.filter(l => l.category === 'Nature').slice(0, 3).map(l => l.id);
    response.text = "Nature trail coordinates mapped. Added parks, lakes and waterfalls to your map.";
    response.action = {
      type: 'SET_STOPS',
      payload: natureIds,
      suggestions: ["Show details of Kudlu Falls", "Is Pilikula Zoo open?", "Find beach routes"]
    };
  } else if (q.includes('shop') || q.includes('mall') || q.includes('city') || q.includes('nightlife') || q.includes('bar') || q.includes('lounge')) {
    const urbanIds = availableLocations.filter(l => l.category === 'Urban').slice(0, 3).map(l => l.id);
    response.text = "Urban coordinates active. Mapping city attractions, malls, and lounges.";
    response.action = {
      type: 'SET_STOPS',
      payload: urbanIds,
      suggestions: ["Switch to dining tab", "Recommend stays nearby", "What is the best pub?"]
    };
  }
  else {
    response.text = "I'm ready to assist! Try asking me for specific places like 'Navigate to Panambur Beach' or interests like 'waterfalls near Udupi'.";
    response.action = {
      suggestions: ["Plan a beach circuit", "Find restaurants in Mangalore", "Recommend a luxury resort"]
    };
  }

  response.text += offlineNote;
  return response;
}

// POST Chat Assistant Proxy (Keeps API key secure on server-side)
app.post('/api/chat', async (req, res) => {
  const { userQuery, locations, hotels, chatHistory, userLocation } = req.body;

  let sortedLocations = [...(locations || [])];
  let sortedHotels = [...(hotels || [])];

  if (userLocation) {
    const [lat, lng] = userLocation;
    sortedLocations.sort((a, b) => calculateDistance(lat, lng, a.lat, a.lng) - calculateDistance(lat, lng, b.lat, b.lng));
    sortedHotels.sort((a, b) => calculateDistance(lat, lng, a.lat, a.lng) - calculateDistance(lat, lng, b.lat, b.lng));
  }

  if (!genAI) {
    const simulated = simulateIntelligentResponse(userQuery, sortedLocations, chatHistory || []);
    return res.json(simulated);
  }

  try {
    const contextString = `
    LOCATIONS (sorted by proximity to user):
    ${sortedLocations.map(l => `ID ${l.id}: ${l.name} | Category: ${l.category} | Region: ${l.region} | Experience: ${l.experience} | Description: ${l.description} | Sustainable: ${l.sustainable ? 'Yes' : 'No'} | Transport: ${l.lastMile?.join(', ') || 'N/A'}`).join('\n    ')}

    HOTELS (sorted by proximity to user):
    ${sortedHotels.map(h => `ID ${h.id}: ${h.name} | Type: ${h.type} | Region: ${h.region} | Price: ${h.price} | Rating: ${h.rating}/5 | Description: ${h.description}`).join('\n    ')}
    `;

    const systemInstruction = `${SYSTEM_PROMPT}\n\nCONTEXT:\n${contextString}`;
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      systemInstruction: systemInstruction
    });

    const formattedHistory = [];
    (chatHistory || []).forEach(msg => {
      const role = msg.role === 'bot' ? 'model' : 'user';
      const text = msg.content || "";
      if (!text.trim()) return;

      if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === role) {
        formattedHistory[formattedHistory.length - 1].parts[0].text += "\n" + text;
      } else {
        formattedHistory.push({
          role: role,
          parts: [{ text: text }]
        });
      }
    });

    // Ensure history starts with 'user' role (Gemini API requirement)
    while (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
      formattedHistory.shift();
    }

    if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === 'user') {
      formattedHistory.pop();
    }

    const chat = model.startChat({
      history: formattedHistory
    });

    const result = await chat.sendMessage(userQuery);
    const response = await result.response;
    const text = response.text();

    const parsed = parseAIResponse(text);
    return res.json(parsed);
  } catch (error) {
    console.error("Gemini server error, falling back to local:", error);
    const simulated = simulateIntelligentResponse(userQuery, sortedLocations, chatHistory || [], true);
    return res.json(simulated);
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
