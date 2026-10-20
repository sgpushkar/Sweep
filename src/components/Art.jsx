export function Art({it}){return <div className="art" style={{background:it.g}}>
  <div className="art" style={{background:it.sh}}/>
  {it.t==="VID"&&<svg viewBox="0 0 48 48" width="52" style={{position:"absolute",left:"50%",top:"46%",transform:"translate(-50%,-50%)",opacity:.8}} aria-hidden="true"><circle cx="24" cy="24" r="22" fill="none" stroke="#fff" strokeWidth="1.5"/><path d="M20 15l14 9-14 9z" fill="#fff"/></svg>}
</div>}
