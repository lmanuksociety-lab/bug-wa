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
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  const { target, type } = req.body;

  if (!target || !type) {
    return res.status(400).json({ 
      success: false, 
      message: 'Target number and attack type are required' 
    });
  }

  try {
    // SIMULATION - No actual WhatsApp connection
    console.log(`[SIMULATION] Sending ${type} to ${target}`);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return success response
    return res.status(200).json({ 
      success: true, 
      message: `Attack "${type}" successfully sent to ${target}\n\n[NOTE: This is a demo simulation. Real WhatsApp integration requires a dedicated server with persistent connection.]`,
      data: {
        target: target,
        type: type,
        timestamp: new Date().toISOString(),
        status: "simulated_success"
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error: ' + error.message 
    });
  }
}
