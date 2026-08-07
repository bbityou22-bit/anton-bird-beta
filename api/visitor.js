const { redis } = require('./_redis');
module.exports = async (req,res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({error:'POST only'});
    const id = String(req.body?.visitorId || '').slice(0,100);
    if (!id) return res.status(400).json({error:'Missing visitor id'});
    await redis(['SADD','anton:visitors',id]);
    const count = Number(await redis(['SCARD','anton:visitors'])) || 0;
    res.json({count});
  } catch(e) { res.status(503).json({error:e.message}); }
};
