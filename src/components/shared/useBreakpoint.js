
import { useState, useEffect } from "react";

function useBreakpoint() {
  const [w,setW]=useState(typeof window!=="undefined"?window.innerWidth:1200);
  useEffect(()=>{ const h=()=>setW(window.innerWidth); window.addEventListener("resize",h); return()=>window.removeEventListener("resize",h); },[]);
  return {isMobile:w<640,isTablet:w>=640&&w<1024,isDesktop:w>=1024,w};
}


export default useBreakpoint;
