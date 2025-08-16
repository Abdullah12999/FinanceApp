import React, { useState } from "react";
import { Section, Input, Label, Button, GhostButton } from "../components/ui";

export default function AuthPanel({ apiBase, setToken, setSuccessMsg, setErrorMsg }) {
  const [authMode, setAuthMode] = useState("login");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [regForm, setRegForm] = useState({ email: "", username: "", city: "", password: "" });

  async function handleLoginCore(username, password) {
    setErrorMsg(""); setSuccessMsg("");
    try {
      const base = apiBase || "";
      const params = new URLSearchParams();
      params.set("username", username);
      params.set("password", password);

      const res = await fetch(`${base}/api/user/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      });
      if (!res.ok) throw new Error((await res.text()) || `Login failed ${res.status}`);
      const data = await res.json();
      setToken(data.access_token);
      setAuthMode("login");
      setSuccessMsg("✅ Logged in successfully.");
      try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch {}
    } catch (e) { setErrorMsg(e.message || "Login failed"); }
  }

  async function handleLogin(e){ e.preventDefault(); await handleLoginCore(loginForm.username, loginForm.password); }

  async function handleRegister(e) {
    e.preventDefault();
    setErrorMsg(""); setSuccessMsg("");
    try {
      const base = apiBase || "";
      const res = await fetch(`${base}/api/user/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm),
      });
      if (!res.ok) throw new Error((await res.text()) || `Register failed ${res.status}`);
      setSuccessMsg("✅ Successfully registered! You can now log in.");
      setAuthMode("login");
      try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch {}
    } catch (e) { setErrorMsg(e.message || "Registration failed"); }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <Section
        title={authMode === "login" ? "Welcome back" : "Create your account"}
        right={
          <GhostButton onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setErrorMsg(""); setSuccessMsg(""); }}>
            {authMode === "login" ? "Need an account? Register" : "Have an account? Login"}
          </GhostButton>
        }
      >
        {authMode === "login" ? (
          <form onSubmit={handleLogin} className="grid gap-3">
            <div>
              <Label>Email or Username</Label>
              <Input required value={loginForm.username} onChange={(e)=>setLoginForm({...loginForm, username:e.target.value})} placeholder="jane or jane@site.com" />
            </div>
            <div>
              <Label>Password</Label>
              <Input required type="password" value={loginForm.password} onChange={(e)=>setLoginForm({...loginForm, password:e.target.value})} placeholder="••••••••" />
            </div>
            <Button className="mt-1">Sign in</Button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="grid gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Email</Label>
                <Input required type="email" value={regForm.email} onChange={(e)=>setRegForm({...regForm, email:e.target.value})} placeholder="jane@site.com" />
              </div>
              <div>
                <Label>Username</Label>
                <Input required value={regForm.username} onChange={(e)=>setRegForm({...regForm, username:e.target.value})} placeholder="jane" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>City</Label>
                <Input required value={regForm.city} onChange={(e)=>setRegForm({...regForm, city:e.target.value})} placeholder="Karachi" />
              </div>
              <div>
                <Label>Password</Label>
                <Input required type="password" value={regForm.password} onChange={(e)=>setRegForm({...regForm, password:e.target.value})} placeholder="••••••••" />
              </div>
            </div>
            <Button className="mt-1">Create account</Button>
          </form>
        )}
      </Section>

      <Section title="How to connect">
        <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-600">
          <li>Start the FastAPI backend (<code>http://localhost:8000</code>).</li>
          <li>Run the frontend (<code>npm run dev</code>) → <code>http://localhost:5173</code>.</li>
          <li>Use the Advanced box to set API base, or leave empty to use a Vite proxy.</li>
          <li>Register, then log in and start tracking.</li>
        </ol>
      </Section>
    </div>
  );
}
