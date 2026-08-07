const { redis } = require('./_redis');
const cleanLayout = (layout) => (Array.isArray(layout)?layout:[]).slice(0,250).map(x=>({tool:String(x.tool||'').slice(0,30),x:Number(x.x)||0,y:Number(x.y)||0,angle:Number(x.angle)||0,width:x.width?Number(x.width):undefined,height:x.height?Number(x.height):undefined})).filter(x=>/^(woodFlat|woodUpright|stoneFlat|stoneUpright|bike[1-7])$/.test(x.tool));
module.exports = async (req,res) => {
 try {
  if (req.method === 'POST') {
    const layout=cleanLayout(req.body?.layout); if(!layout.length) return res.status(400).json({error:'Level is empty'});
    const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2,8)}`;
    const level={id,name:String(req.body?.name||'Untitled Level').trim().slice(0,40)||'Untitled Level',lives:Number(req.body?.lives)===5?5:3,layout,createdAt:Date.now(),views:0,likes:0};
    await redis(['SET',`anton:level:${id}`,JSON.stringify(level)]);
    await redis(['ZADD','anton:levels:new',level.createdAt,id]); await redis(['ZADD','anton:levels:views',0,id]); await redis(['ZADD','anton:levels:likes',0,id]);
    return res.json({ok:true,level});
  }
  if (req.method !== 'GET') return res.status(405).json({error:'GET/POST only'});
  const sort=String(req.query?.sort||'liked'); const visitorId=String(req.query?.visitorId||'').slice(0,100);
  const key=sort==='popular'?'anton:levels:views':sort==='new'?'anton:levels:new':'anton:levels:likes';
  const ids=(await redis(['ZREVRANGE',key,0,49]))||[]; const levels=[];
  for(const id of ids){ const raw=await redis(['GET',`anton:level:${id}`]); if(!raw) continue; const level=JSON.parse(raw); level.views=Number(await redis(['ZSCORE','anton:levels:views',id]))||0; level.likes=Number(await redis(['ZSCORE','anton:levels:likes',id]))||0; level.liked=visitorId?Boolean(await redis(['SISMEMBER',`anton:likes:${id}`,visitorId])):false; levels.push(level); }
  res.json({levels});
 } catch(e){ res.status(503).json({error:e.message}); }
};
