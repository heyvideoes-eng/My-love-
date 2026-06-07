// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

// ==========================================================================
// 1. Environmental Variables Parser (dotenv zero-dependency replacement)
// ==========================================================================
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split(/\r?\n/).forEach(line => {
        // Skip comments and empty lines
        if (line.trim().startsWith('#') || !line.includes('=')) return;
        const [key, ...valueParts] = line.split('=');
        if (key) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      });
      console.log('Environment variables loaded from .env');
    } else {
      console.log('No .env file found. Using default values and environment variables.');
    }
  } catch (error) {
    console.error('Error reading .env file:', error.message);
  }
}

loadEnv();

const PORT = process.env.PORT || 3000;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

// Static list of premium daily messages (used as a fallback when NVAPI_KEY is empty/invalid)
const FALLBACK_MESSAGES = [
  "You are my favourite part of every single day, Vanshika. Wishing you a calm and happy morning. - Rishi",
  "Just a little reminder that your smile is my comfort, Vanshika. I hope your day is as wonderful as you are. - Rishi",
  "I cherish the simple, quiet moments we share. You bring so much peace into my life, Vanshika. - Rishi",
  "No matter how busy today gets, remember that I am thinking of you and grateful for your warmth. - Rishi",
  "Your voice is my favourite sound and my absolute calm, Vanshika. Have a beautiful day. - Rishi",
  "I love the quiet mornings and peaceful evenings we share. Thank you for being you, Vanshika. - Rishi",
  "You make ordinary days feel special just by being in them, Vanshika. Sending you all my love today. - Rishi"
];

// Get fallback message based on day of the year
function getDailyFallbackMessage() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return FALLBACK_MESSAGES[dayOfYear % FALLBACK_MESSAGES.length];
}

// ==========================================================================
// 2. HTTP Server Request Router
// ==========================================================================
const server = http.createServer((req, res) => {
  const url = req.url;

  // Route: API Endpoint for Nvidia Daily Message
  if (url.startsWith('/api/daily-message')) {
    handleDailyMessageRequest(req, res);
    return;
  }

  // Route: Static Files Server
  handleStaticFileRequest(req, res);
});

// ==========================================================================
// 3. Static File Server Logic
// ==========================================================================
function handleStaticFileRequest(req, res) {
  // Translate URL to safe local system path
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  // Guard against Directory Traversal Attacks
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // Get File Extension
  const extname = path.extname(filePath);
  
  // Set default Content-Type header mapping
  let contentType = 'text/html';
  switch (extname) {
    case '.js':
      contentType = 'application/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
    case '.jpeg':
      contentType = 'image/jpeg';
      break;
    case '.svg':
      contentType = 'image/svg+xml';
      break;
    case '.ico':
      contentType = 'image/x-icon';
      break;
  }

  // Read file and respond
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 File Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`500 Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate' // Prevent stale assets
      });
      res.end(content, 'utf-8');
    }
  });
}

// ==========================================================================
// 4. Nvidia NIM API Integration / Proxy
// ==========================================================================
function handleDailyMessageRequest(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const isKeyConfigured = NVIDIA_API_KEY && 
                          NVIDIA_API_KEY.trim() !== '' && 
                          NVIDIA_API_KEY !== 'your_nvidia_api_key_here';

  if (!isKeyConfigured) {
    // Gracefully respond with a high-fidelity static daily message
    console.log('NVIDIA_API_KEY not configured. Serving local fallback message.');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      message: getDailyFallbackMessage(),
      isGeneratedByAI: false,
      note: "Set NVIDIA_API_KEY in the .env file to enable dynamic AI messages."
    }));
    return;
  }

  // Config parameters for Nvidia chat completions
  const postData = JSON.stringify({
    model: "meta/llama-3.1-8b-instruct",
    messages: [
      {
        role: "system",
        content: "You are a warm, sincere, mature, and deeply affectionate AI assistant. Your task is to write a single-sentence cute daily love note or comforting message from Rishi to Vanshika. Do not use generic clichés (like 'universe', 'stars aligning', 'destiny'). Keep it brief (15-35 words), highly personal, warm, and authentic. Focus on simple, sweet aspects of companionship, love, and bringing calm to each other's day. Use British English (e.g. favourite, colour)."
      },
      {
        role: "user",
        content: "Write a sweet message of the day for Vanshika from Rishi."
      }
    ],
    temperature: 0.7,
    max_tokens: 120
  });

  const options = {
    hostname: 'integrate.api.nvidia.com',
    port: 443,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const nvidiaReq = https.request(options, (nvidiaRes) => {
    let rawData = '';

    nvidiaRes.on('data', (chunk) => {
      rawData += chunk;
    });

    nvidiaRes.on('end', () => {
      try {
        if (nvidiaRes.statusCode === 200) {
          const parsed = JSON.parse(rawData);
          const aiMessage = parsed.choices[0].message.content.trim().replace(/^"|"$/g, ''); // strip quotes
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            message: aiMessage,
            isGeneratedByAI: true 
          }));
        } else {
          console.error(`Nvidia API returned code ${nvidiaRes.statusCode}:`, rawData);
          // Return fallback
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            message: getDailyFallbackMessage(),
            isGeneratedByAI: false,
            error: `API Code ${nvidiaRes.statusCode}`
          }));
        }
      } catch (err) {
        console.error('Failed to parse Nvidia API response:', err.message);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          message: getDailyFallbackMessage(),
          isGeneratedByAI: false,
          error: err.message
        }));
      }
    });
  });

  nvidiaReq.on('error', (e) => {
    console.error('Nvidia proxy connection error:', e.message);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      message: getDailyFallbackMessage(),
      isGeneratedByAI: false,
      error: e.message
    }));
  });

  // Send request body
  nvidiaReq.write(postData);
  nvidiaReq.end();
}

// Start Server Listening
server.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` Romantic Landing Page for Vanshika`);
  console.log(` Serving local site at: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
