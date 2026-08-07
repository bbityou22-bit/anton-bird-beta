const { redis } = require('./_redis');
module.exports = async (req,res) => {
 try {
  if(req.method!=='POST') return res.status(405).json({error:'POST only'});
  const id=String(req.body?.id||'').slice(0,80), visitor=String(req.body?.visitorId||'').slice(0,100), action=req.body?.action;
  if(!id||!visitor) return res.status(400).json({error:'Missing data'});
  if(!(await redis(['EXISTS',`anton:level:${id}`]))) return res.status(404).json({error:'Level not found'});
  if(action==='view'){ const added=await redis(['SADD',`anton:views:${id}`,visitor]); if(Number(added)) await redis(['ZINCRBY','anton:levels:views',1,id]); }
  else if(action==='like'){ const liked=await redis(['SISMEMBER',`anton:likes:${id}`,visitor]); if(Number(liked)){ await redis(['SREM',`anton:likes:${id}`,visitor]); await redis(['ZINCRBY','anton:levels:likes',-1,id]); } else { await redis(['SADD',`anton:likes:${id}`,visitor]); await redis(['ZINCRBY','anton:levels:likes',1,id]); } }
  else return res.status(400).json({error:'Unknown action'});
  res.json({ok:true});
 } catch(e){ res.status(503).json({error:e.message}); }
};
