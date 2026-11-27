import { createServer, getServerPort, context } from '@devvit/server';
import { reddit } from '@devvit/reddit';
import {galleryReport} from './src/community-reports.js';

createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  if(req.method === 'GET' && req.url === '/api/investigations') {
    try {
      const postId=context.postId;
      if(!/^t3_[a-z0-9]+$/.test(postId || '')) {res.writeHead(400);res.end(JSON.stringify({error:'Open this case inside Reddit.'}));return;}
      const comments=await reddit.getComments({postId,sort:'new',limit:100,depth:1}).all();
      const reports=comments.map(c=>galleryReport(c,postId)).filter(Boolean).slice(0,30);
      res.end(JSON.stringify({reports}));
    } catch {res.writeHead(503);res.end(JSON.stringify({error:'Community reports could not be loaded. Please retry.'}));}
    return;
  }
  if (req.method !== 'POST' || req.url !== '/internal/create-case') {
    res.writeHead(404); res.end(JSON.stringify({error:'Not found'})); return;
  }
  try {
    const post = await reddit.submitCustomPost({
      title: 'Context Secret Services — Case 001: The Comeback Cake [Playtest]',
      entry: 'default',
      textFallback: {text:'A fictional 3D detective case. Open this post in the current Reddit app or on reddit.com to play. Share bugs and feedback in the comments; please mark spoilers.'}
    });
    res.end(JSON.stringify({navigateTo: post.url}));
  } catch (error) {
    console.error('Could not create case post', error);
    res.writeHead(500); res.end(JSON.stringify({showToast:'Could not create the case post. Please try again.'}));
  }
}).listen(getServerPort());
