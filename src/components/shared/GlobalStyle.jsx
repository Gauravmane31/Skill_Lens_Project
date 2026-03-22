
import { useEffect } from "react";

// ── Global CSS ────────────────────────────────────────────────────────────────
const GLOBAL_CSS=`
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:99px;}
::-webkit-scrollbar-track{background:transparent;}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
@keyframes spin{to{transform:rotate(360deg);}}
.sl-fadein{animation:fadeIn .3s ease both;}
.sl-fadeup{animation:fadeUp .4s ease both;}
.sl-fadeup-2{animation:fadeUp .4s .07s ease both;}
.sl-fadeup-3{animation:fadeUp .4s .14s ease both;}
.sl-fadeup-4{animation:fadeUp .4s .21s ease both;}
.sl-nav-links{display:flex;gap:2px;overflow-x:auto;}
.sl-hamburger{display:none !important;}
.sl-mob-menu{display:none;}
.sl-two-col{display:grid;grid-template-columns:1fr 300px;gap:20px;}
.sl-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.sl-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;}
.sl-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
.sl-session{display:flex;flex:1;overflow:hidden;min-height:0;}
.sl-prob-pane{width:340px;background:#fff;border-right:1px solid #E5E7EB;overflow-y:auto;flex-shrink:0;}
.sl-card-hover{transition:transform .15s,box-shadow .15s;}
.sl-card-hover:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(91,95,237,.10) !important;}
.sl-btn-hover{transition:opacity .15s,transform .1s;}
.sl-btn-hover:hover{opacity:.88;transform:translateY(-1px);}
@media(max-width:1023px){
  .sl-two-col{grid-template-columns:1fr !important;}
  .sl-grid-4{grid-template-columns:repeat(2,1fr) !important;}
  .sl-grid-3{grid-template-columns:1fr 1fr !important;}
}
@media(max-width:639px){
  .sl-grid-2{grid-template-columns:1fr !important;}
  .sl-grid-3{grid-template-columns:1fr !important;}
  .sl-grid-4{grid-template-columns:1fr 1fr !important;gap:8px !important;}
  .sl-nav-links{display:none !important;}
  .sl-hamburger{display:flex !important;align-items:center;justify-content:center;}
  .sl-mob-menu.open{display:flex;flex-direction:column;position:fixed;top:62px;left:0;right:0;background:#0f172a;border-bottom:1px solid rgba(255,255,255,.08);z-index:999;padding:10px;gap:4px;box-shadow:0 6px 24px rgba(0,0,0,.3);}
  .sl-session{flex-direction:column !important;}
  .sl-prob-pane{width:100% !important;border-right:none !important;border-bottom:1px solid #E2E8F0 !important;max-height:250px !important;padding:14px !important;}
  .sl-user-name{display:none !important;}
}
.sl-page-wrap{max-width:1280px;margin:0 auto;width:100%;}
`;
function GlobalStyle(){
  useEffect(()=>{
    const el=document.createElement("style");
    el.textContent=GLOBAL_CSS;
    document.head.appendChild(el);
    return()=>document.head.removeChild(el);
  },[]);
  return null;
}


export { GLOBAL_CSS };
export default GlobalStyle;
