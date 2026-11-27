import {context,navigateTo} from '@devvit/client';
export function discussionURL(postId){
 return /^t3_[a-z0-9]+$/.test(postId||'') ? `https://www.reddit.com/comments/${postId.slice(3)}/#comments` : 'https://www.reddit.com/r/ContextSecretServices/comments/1y66m9x/context_secret_services_case_001_the_comeback/#comments';
}
export function openDiscussion(){
 if(new URLSearchParams(location.search).has('landscape-player')) parent.postMessage({type:'css:discuss-case'},location.origin);
 else if(context) navigateTo(discussionURL(context.postId));
 else window.open(discussionURL(),'_blank','noopener,noreferrer');
}
