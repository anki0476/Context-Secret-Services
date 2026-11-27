export const REPORT_MARKER = 'CSS CASE 001 — Investigation';
export function makeReport(caption) {
  const text = caption.trim();
  if (!text || text.length > 180) throw new Error('Write a caption between 1 and 180 characters.');
  // Keep the spoiler wrapper intact, including when pasting Markdown.
  const plain = text.replace(/[<>|\r\n]/g, ' ');
  return `${REPORT_MARKER}\n\n>!${plain}!<\n\nFictional case. Submitted for the community gallery.`;
}
export function galleryReport(comment, postId) {
  if (comment.postId !== postId || comment.parentId !== postId || !comment.approved || comment.edited || comment.removed || comment.spam || !comment.authorName || comment.authorName === '[deleted]') return null;
  const body = comment.body || '';
  if (!body.startsWith(REPORT_MARKER + '\n\n')) return null;
  const match = body.slice(REPORT_MARKER.length).trim().match(/^>!([^<>|\r\n]{1,180})!</);
  if (!match || !/^t1_[a-z0-9]+$/.test(comment.id)) return null;
  return {id:comment.id, author:comment.authorName, caption:match[1], url:`https://www.reddit.com/comments/${postId.slice(3)}/comment/${comment.id.slice(3)}/`};
}
