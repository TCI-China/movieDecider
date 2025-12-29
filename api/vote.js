// 示例：处理投票的API
import { createClient } from '@supabase/supabase-js'; // 假设使用Supabase
import Fingerprint from 'fingerprintjs2'; // 用于生成简易设备指纹

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { movieId } = req.body;
  const userAgent = req.headers['user-agent'];
  const ip = req.headers['x-forwarded-for'] || '0.0.0.0';
  
  // 1. 生成简易设备指纹（更严谨的方案可使用专业库）
  const fingerprint = `${ip.substring(0, 7)}_${userAgent.length}`;
  
  // 2. 查询此指纹是否已投票[citation:7]
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  const { data: existingVote } = await supabase.from('votes').select().eq('fingerprint', fingerprint).single();
  
  if (existingVote) {
    // 如果已投票，则更新投票记录（实现更改投票）
    await supabase.from('votes').update({ movie_id: movieId }).eq('id', existingVote.id);
  } else {
    // 如果未投票，则创建新记录
    await supabase.from('votes').insert({ fingerprint, movie_id: movieId });
  }
  
  // 3. 返回成功响应
  res.status(200).json({ success: true, message: '投票成功' });
}