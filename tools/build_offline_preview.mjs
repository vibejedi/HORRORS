/** Diagnostic renderer only. Vite/React 19 remains the production build. */
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript');
const root=path.resolve(import.meta.dirname,'..');
const out=path.join(root,'offline-preview');
fs.mkdirSync(path.join(out,'vendor'),{recursive:true});
const vendor='/opt/pyvenv/lib/python3.13/site-packages/nbclassic/static/components';
for(const [name,source] of [['react.js',`${vendor}/react/umd/react.production.min.js`],['react-dom.js',`${vendor}/react-dom/umd/react-dom.production.min.js`]])
 fs.copyFileSync(source,path.join(out,'vendor',name));
const paths=['src/App.tsx','src/game/content.ts','src/game/art.ts','src/game/types.ts','src/game/engine.ts','src/game/storage.ts'];
const modules={};
for(const p of paths){
 const source=fs.readFileSync(path.join(root,p),'utf8');
 const transpiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}});
 modules[p]=transpiled.outputText;
}
// No third-party assets from WOH are included in this diagnostic harness.
const runtime=`(function(){
'use strict';
const React=window.React,ReactDOM=window.ReactDOM;
let active=null;let cursor=0;
const shallowEqual=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((value,i)=>Object.is(value,b[i]));
function useState(initial){
 const component=active, i=cursor++;
 if(!component._slots[i])component._slots[i]={kind:'state',value:typeof initial==='function'?initial():initial};
 const slot=component._slots[i];
 return [slot.value, next=>{const value=typeof next==='function'?next(slot.value):next;if(!Object.is(value,slot.value)){slot.value=value;component.forceUpdate();}}];
}
function useMemo(fn,deps){const component=active,i=cursor++;const old=component._slots[i];if(old&&shallowEqual(old.deps,deps))return old.value;const value=fn();component._slots[i]={kind:'memo',value,deps};return value;}
function useEffect(fn,deps){const component=active,i=cursor++;const old=component._slots[i];if(!old||!shallowEqual(old.deps,deps)){component._slots[i]={kind:'effect',deps};component._pending.push(fn);}}
const Fragment=props=>React.createElement('div',{style:{display:'contents'}},props.children);
const shim=Object.assign({},React,{useState,useMemo,useEffect,Fragment});
const jsx=(type,props,key)=>React.createElement(type,Object.assign({},props,key==null?{}:{key}));
const sources=__MODULES__;
const loaded={};
function load(name){
 if(name==='react')return shim;
 if(name==='react/jsx-runtime')return {jsx,jsxs:jsx,Fragment};
 if(name==='react-dom/client')return {createRoot:el=>({render:tree=>ReactDOM.render(tree,el)})};
 if(name.endsWith('.css'))return {};
 if(!sources[name])throw Error('No local module '+name);
 if(loaded[name])return loaded[name].exports;
 const module={exports:{}};loaded[name]=module;
 const dirname=name.substring(0,name.lastIndexOf('/')+1);
 const localReq=request=>load(request.startsWith('.')?resolve(dirname+request):request);
 new Function('module','exports','require',sources[name])(module,module.exports,localReq);
 return module.exports;
}
function resolve(filename){const parts=[];for(const piece of filename.split('/')){if(piece==='..')parts.pop();else if(piece!=='.'&&piece)parts.push(piece);}return parts.join('/');}
const App=load('src/App.tsx').default;
class Wrapper extends React.Component{
 constructor(props){super(props);this._slots=[];this._pending=[];}
 componentDidMount(){this.flush();}componentDidUpdate(){this.flush();}
 flush(){const list=this._pending.splice(0);for(const effect of list)effect();}
 render(){active=this;cursor=0;let result;try{result=App();}finally{active=null;}return result;}
}
ReactDOM.render(React.createElement(Wrapper),document.getElementById('root'));
window.__TERMINAL_PREVIEW_READY__=true;
})();`;
fs.writeFileSync(path.join(out,'modules.js'),runtime.replace('__MODULES__',JSON.stringify(modules)));
fs.copyFileSync(path.join(root,'src/styles.css'),path.join(out,'styles.css'));
fs.cpSync(path.join(root,'public/art'),path.join(out,'art'),{recursive:true});
fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/><title>Terminal of Horrors — Offline UI Test</title><link rel="stylesheet" href="./styles.css"/></head><body><div id="root"></div><script src="./vendor/react.js"></script><script src="./vendor/react-dom.js"></script><script src="./modules.js"></script></body></html>`);
console.log(`Offline React 16 diagnostic preview written to ${out}. NOT a React 19/Vite production build.`);
