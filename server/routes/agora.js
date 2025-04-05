const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config(); // Load .env file

console.log('APP_ID:', process.env.AGORA_APP_ID); // Debugging line
console.log('APP_CERTIFICATE:', process.env.AGORA_APP_CERTIFICATE); // Debugging line


const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

// GET /api/agora/token?channel=someChannelName
router.get('/token', (req, res) => {
  const channelName = req.query.channel;
  if (!channelName) {
    return res.status(400).json({ error: 'Channel name is required' });
  }

  const uid = 0; // Let Agora assign UID
  const role = RtcRole.PUBLISHER;
  const expireTime = 3600;
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime
  );

  return res.json({ token });
});

module.exports = router;
