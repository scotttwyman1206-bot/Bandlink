// Bandlink - Single-file React App (App.jsx)
// Tailwind CSS utility classes assumed to be available in the project.
// This is a front-end-only demo with in-memory + localStorage persistence for posts and messages.

import React, {useEffect, useState, useRef} from 'react';

const SAMPLE_POSTS = [
  {id: 1, author: 'JazzKat', title: 'Looking for a drummer in Boston', body: 'Experienced drummer wanted for indie project. Rehearsals weekends.', votes: 12, createdAt: Date.now()-1000*60*60},
  {id: 2, author: 'LiamG', title: 'Share your best lo-fi beats', body: 'Drop short snippets and feedback. 45s max.', votes: 8, createdAt: Date.now()-1000*60*60*5},
];

const SAMPLE_USERS = ['You (demo)', 'Ava', 'Marcus', 'Emma'];

const SAMPLE_CONVOS = [
  {id: 'c1', participants: ['You (demo)', 'Ava'], messages: [{from: 'Ava', text: 'Hey! Are you coming to the jam tonight?', at: Date.now()-1000*60*30},{from: 'You (demo)', text: 'Yep — I can bring a keyboard!', at: Date.now()-1000*60*20}]},
  {id: 'c2', participants: ['You (demo)', 'Marcus'], messages: [{from: 'Marcus', text: 'Got an idea for a collab — DM me your flexible times', at: Date.now()-1000*60*60*24}]},
];

function timeAgo(ts){
  const s = Math.floor((Date.now()-ts)/1000);
  if(s<60) return `${s}s`;
  if(s<3600) return `${Math.floor(s/60)}m`;
  if(s<86400) return `${Math.floor(s/3600)}h`;
  return `${Math.floor(s/86400)}d`;
}

{
  "name": "bandlink",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": ["react-app", "react-app/jest"]
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  }
}

export default function App(){
  const [posts, setPosts] = useState(() => {
    try{
      const raw = localStorage.getItem('bandlink_posts');
      return raw ? JSON.parse(raw) : SAMPLE_POSTS;
    }catch(e){return SAMPLE_POSTS}
  });
  const [convos, setConvos] = useState(() => {
    try{const raw = localStorage.getItem('bandlink_convos'); return raw?JSON.parse(raw):SAMPLE_CONVOS}catch(e){return SAMPLE_CONVOS}
  });
  const [view, setView] = useState('home'); // home | post | dm
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedConvoId, setSelectedConvoId] = useState(convos[0]?.id || null);
  const [query, setQuery] = useState('');
  const [user] = useState('You (demo)');

  useEffect(()=>{ localStorage.setItem('bandlink_posts', JSON.stringify(posts)); }, [posts]);
  useEffect(()=>{ localStorage.setItem('bandlink_convos', JSON.stringify(convos)); }, [convos]);

  // POSTS CRUD
  function createPost(title, body){
    const newPost = {id: Date.now(), author: user, title, body, votes: 0, createdAt: Date.now()};
    setPosts(p => [newPost, ...p]);
  }
  function votePost(id, delta){
    setPosts(p => p.map(x => x.id===id?{...x, votes: x.votes+delta}:x));
  }

  // DMS
  function sendMessage(convoId, text){
    setConvos(c => c.map(cv => cv.id===convoId?{...cv, messages: [...cv.messages, {from:user, text, at: Date.now()}]}:cv));
  }
  function startConvo(participant, initialText){
    const id = 'c'+Date.now();
    const newConvo = {id, participants: [user, participant], messages: [{from:user, text: initialText, at: Date.now()}]};
    setConvos(c => [newConvo, ...c]);
    setSelectedConvoId(id);
    setView('dm');
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="font-bold text-xl">Bandlink</div>
          <div className="text-sm text-gray-600">Find bandmates. Share posts. DM easily.</div>
        </div>
        <nav className="flex items-center gap-3">
          <button onClick={()=>setView('home')} className={`px-3 py-1 rounded ${view==='home'?'bg-indigo-600 text-white':'text-gray-700'}`}>Home</button>
          <button onClick={()=>setView('dm')} className={`px-3 py-1 rounded ${view==='dm'?'bg-indigo-600 text-white':'text-gray-700'}`}>Messages</button>
          <button onClick={()=>{ setSelectedPost(null); setView('create'); }} className="px-3 py-1 rounded bg-green-500 text-white">New Post</button>
        </nav>
      </header>

      <main className="p-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Left column - feed */}
          <section className="md:col-span-2">
            {view==='home' && (
              <Feed posts={posts} onSelect={(p)=>{ setSelectedPost(p); setView('post'); }} onVote={votePost} query={query} setQuery={setQuery} createPost={createPost} />
            )}
            {view==='post' && selectedPost && (
              <PostView post={selectedPost} onBack={()=>setView('home')} onVote={votePost} />
            )}
            {view==='create' && (
              <CreatePost onCreate={(t,b)=>{ createPost(t,b); setView('home'); }} onCancel={()=>setView('home')} />
            )}
          </section>

          {/* Right column - sidebar / DMs */}
          <aside className="space-y-4">
            <div className="bg-white p-4 rounded shadow-sm">
              <div className="text-sm text-gray-600">Signed in as</div>
              <div className="font-medium">{user}</div>
            </div>

            <div className="bg-white p-4 rounded shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Direct Messages</div>
                <div className="text-sm text-gray-500">{convos.length} convos</div>
              </div>

              <div className="space-y-2 max-h-64 overflow-auto">
                {convos.map(cv => (
                  <div key={cv.id} onClick={()=>{setSelectedConvoId(cv.id); setView('dm');}} className={`p-2 rounded cursor-pointer ${selectedConvoId===cv.id?'bg-indigo-50':''}`}>
                    <div className="flex justify-between">
                      <div className="text-sm font-medium">{cv.participants.filter(p=>p!==user).join(', ') || 'Me'}</div>
                      <div className="text-xs text-gray-400">{timeAgo(cv.messages[cv.messages.length-1].at)}</div>
                    </div>
                    <div className="text-xs text-gray-500 truncate">{cv.messages[cv.messages.length-1].text}</div>
                  </div>
                ))}
              </div>

              <NewConvo onStart={startConvo} users={SAMPLE_USERS.filter(u=>u!==user)} />
            </div>

            <div className="bg-white p-4 rounded shadow-sm">
              <div className="font-medium mb-2">Trending</div>
              <div className="text-sm text-gray-600">#drummer #lofi #collab</div>
            </div>
          </aside>
        </div>

        {/* DM panel - full view */}
        {view==='dm' && (
          <div className="max-w-5xl mx-auto mt-6 bg-white rounded shadow-sm p-4">
            <DMPanel convos={convos} selectedId={selectedConvoId} onSend={sendMessage} onSelect={(id)=>setSelectedConvoId(id)} onClose={()=>setView('home')} user={user} />
          </div>
        )}

      </main>

      <footer className="text-center p-6 text-sm text-gray-500">Bandlink • Built for student musicians • Demo</footer>
    </div>
  );
}

function Feed({posts, onSelect, onVote, query, setQuery, createPost}){
  const filtered = posts.filter(p => p.title.toLowerCase().includes(query.toLowerCase()) || p.body.toLowerCase().includes(query.toLowerCase()));
  return (
    <div>
      <div className="mb-4 flex gap-2">
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search posts or tags" className="flex-1 p-2 border rounded" />
        <button onClick={()=>window.scrollTo({top:0, behavior:'smooth'})} className="px-3 py-2 rounded bg-gray-100">Top</button>
      </div>

      <div className="space-y-4">
        {filtered.length===0 && <div className="p-4 bg-white rounded">No posts yet — be the first to create one.</div>}
        {filtered.map(p=> (
          <div key={p.id} className="bg-white p-4 rounded shadow-sm flex gap-4">
            <div className="flex flex-col items-center w-16 text-center">
              <button onClick={()=>onVote(p.id,1)} className="text-sm">⬆</button>
              <div className="font-medium">{p.votes}</div>
              <button onClick={()=>onVote(p.id,-1)} className="text-sm">⬇</button>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold cursor-pointer" onClick={()=>onSelect(p)}>{p.title}</div>
                  <div className="text-xs text-gray-500">by {p.author} • {timeAgo(p.createdAt)}</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-700">{p.body}</div>
              <div className="mt-3 text-xs text-indigo-600 cursor-pointer" onClick={()=>onSelect(p)}>View comments / reply</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CreatePost({onCreate, onCancel}){
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="font-medium mb-2">New Post</div>
      <input placeholder="Title" className="w-full p-2 border rounded mb-2" value={title} onChange={e=>setTitle(e.target.value)} />
      <textarea placeholder="Write something to the community..." className="w-full p-2 border rounded mb-2" rows={4} value={body} onChange={e=>setBody(e.target.value)} />
      <div className="flex gap-2">
        <button disabled={!title||!body} onClick={()=>onCreate(title, body)} className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50">Post</button>
        <button onClick={onCancel} className="px-4 py-2 rounded border">Cancel</button>
      </div>
    </div>
  );
}

function PostView({post, onBack, onVote}){
  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <button onClick={onBack} className="text-sm text-gray-500">← Back</button>
        <div className="text-xs text-gray-400">{timeAgo(post.createdAt)}</div>
      </div>
      <h2 className="text-xl font-semibold">{post.title}</h2>
      <div className="text-sm text-gray-600 mb-3">by {post.author}</div>
      <p className="text-gray-800">{post.body}</p>
      <div className="mt-4 flex items-center gap-3">
        <button onClick={()=>onVote(post.id,1)} className="px-3 py-1 rounded bg-gray-100">Upvote</button>
        <button onClick={()=>onVote(post.id,-1)} className="px-3 py-1 rounded bg-gray-100">Downvote</button>
        <div className="text-sm text-gray-600">{post.votes} votes</div>
      </div>
    </div>
  );
}

function NewConvo({onStart, users}){
  const [sel, setSel] = useState(users[0]||'');
  const [text, setText] = useState('');
  return (
    <div className="mt-3">
      <select className="w-full p-2 border rounded mb-2" value={sel} onChange={e=>setSel(e.target.value)}>
        {users.map(u=> <option key={u} value={u}>{u}</option>)}
      </select>
      <input placeholder="Say hi..." className="w-full p-2 border rounded mb-2" value={text} onChange={e=>setText(e.target.value)} />
      <button disabled={!sel||!text} onClick={()=>{ onStart(sel, text); setText(''); }} className="w-full px-3 py-2 rounded bg-indigo-600 text-white disabled:opacity-50">Start</button>
    </div>
  );
}

function DMPanel({convos, selectedId, onSend, onSelect, user}){
  const conv = convos.find(c=>c.id===selectedId) || convos[0];
  const [text, setText] = useState('');
  const ref = useRef();
  useEffect(()=>{ if(ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [conv?.messages]);
  if(!conv) return <div>No conversations. Start one from sidebar.</div>;
  return (
    <div className="grid md:grid-cols-4 gap-4">
      <div className="md:col-span-1 bg-gray-50 p-3 rounded">
        <div className="font-medium mb-2">Conversations</div>
        <div className="space-y-2">
          {convos.map(c=> (
            <div key={c.id} onClick={()=>onSelect(c.id)} className={`p-2 rounded cursor-pointer ${c.id===conv.id?'bg-white shadow-sm':''}`}>
              <div className="font-medium">{c.participants.filter(p=>p!==user).join(', ')}</div>
              <div className="text-xs text-gray-500 truncate">{c.messages[c.messages.length-1].text}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="md:col-span-3 bg-white p-4 rounded shadow-sm flex flex-col">
        <div className="font-medium mb-2">Chat with {conv.participants.filter(p=>p!==user).join(', ')}</div>
        <div ref={ref} className="flex-1 overflow-auto p-2 space-y-3 border rounded mb-3">
          {conv.messages.map((m,i)=>(
            <div key={i} className={`max-w-xl ${m.from===user?'ml-auto text-right':'mr-auto text-left'}`}>
              <div className="text-xs text-gray-500">{m.from} • {timeAgo(m.at)}</div>
              <div className="inline-block mt-1 p-2 rounded ${m.from===user? 'bg-indigo-100':'bg-gray-100'}">{m.text}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="Write a message..." className="flex-1 p-2 border rounded" />
          <button onClick={()=>{ if(text.trim()){ onSend(conv.id, text.trim()); setText(''); } }} className="px-4 py-2 rounded bg-indigo-600 text-white">Send</button>
        </div>
      </div>
    </div>
  );
}
