import React, { useEffect, useState } from "react";
import { GhostButton, Input, Section } from "./components/ui";
import AuthPanel from "./pages/AuthPanel";
import Dashboard from "./pages/Dashboard";

const defaultBaseUrl = "";

export default function App() {
  const [apiBase, setApiBase] = useState(() => localStorage.getItem("fin_api_base") ?? defaultBaseUrl);
  const [showAdvanced, setShowAdvanced] = useState(apiBase !== "");
  const [token, setToken] = useState(() => localStorage.getItem("fin_token") || "");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => { token ? localStorage.setItem("fin_token", token) : localStorage.removeItem("fin_token"); }, [token]);
  useEffect(() => { localStorage.setItem("fin_api_base", apiBase ?? ""); }, [apiBase]);
  useEffect(() => { if (!successMsg) return; const id = setTimeout(()=>setSuccessMsg(""),3500); return ()=>clearTimeout(id); }, [successMsg]);

  function logout(){ setToken(""); setSuccessMsg("Logged out."); }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-emerald-50/40 text-slate-800">
      {/* topbar */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-emerald-100 border border-emerald-200 grid place-items-center text-emerald-700 font-bold">₣</div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">Finance Tracker</h1>
          </div>
          <div className="flex items-center gap-2">
            <GhostButton onClick={() => setShowAdvanced(v=>!v)}>{showAdvanced ? "Hide Advanced" : "Advanced"}</GhostButton>
            {token ? <GhostButton onClick={logout}>Logout</GhostButton> : null}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl p-4 md:p-8">
        <div className="space-y-3 mb-4">
          {successMsg && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{successMsg}</div>}
          {errorMsg &&   <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMsg}</div>}
        </div>

        {showAdvanced && (
          <Section title="Advanced">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm text-slate-600">API Base URL</label>
              <Input className="w-72" value={apiBase} onChange={(e)=>setApiBase(e.target.value)}
                     placeholder="(leave empty for Vite proxy) e.g. http://localhost:8000" />
              <span className="text-xs text-slate-500">Tip: with Vite proxy, leave empty and call <code>/api/...</code></span>
            </div>
          </Section>
        )}

        {!token ? (
          <AuthPanel apiBase={apiBase} setToken={setToken} setSuccessMsg={setSuccessMsg} setErrorMsg={setErrorMsg}/>
        ) : (
          <Dashboard apiBase={apiBase} token={token} setSuccessMsg={setSuccessMsg} setErrorMsg={setErrorMsg}/>
        )}

        <footer className="mt-10 text-center text-xs text-slate-500">
          {apiBase ? <>Connected to: <code className="text-slate-700">{apiBase}</code></> :
                     <>Connected via proxy to: <code className="text-slate-700">http://localhost:8000</code></>}
        </footer>
      </div>
    </div>
  );
}
