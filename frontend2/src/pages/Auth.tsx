import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";


export default function Auth() {
  const [tab, setTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [email2, setEmail2] = useState("");
  const [city, setCity] = useState("");
  const [password2, setPassword2] = useState("");
  const navigate = useNavigate();

  const notifyConnect = () =>
    toast({
      title: "Google auth not configured",
      description: "Use email/password for now.",
    });

  const handleSignIn = async () => {
    try {
      const params = new URLSearchParams();
      params.set("username", email);
      params.set("password", password);
      const res = await fetch(`/api/user/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Login failed (${res.status})`);
      }
      const data = await res.json();
      localStorage.setItem("gl_token", data.access_token);
      // FIXED: Navigate to splash page to show the GreenLedger animation
      navigate("/splash");
    } catch (e: any) {
      toast({ title: "Login failed", description: e?.message || String(e) });
    }
  };

  const handleSignUp = async () => {
    if (!username || !email2 || !city || !password2) {
      toast({ title: "Missing information", description: "Please fill username, email, city and password." });
      return;
    }
    try {
      const res = await fetch(`/api/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email: email2, city, password: password2 }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Registration failed (${res.status})`);
      }
      toast({ title: "Registered", description: "You can now sign in." });
      setTab("signin");
    } catch (e: any) {
      toast({ title: "Registration failed", description: e?.message || String(e) });
    }
  };

  const DemoButton = null;

  return (
    <div className="min-h-screen animated-gradient bg-[radial-gradient(40rem_40rem_at_50%_-10%,hsl(var(--primary)/.18)_0%,transparent_60%)]">

      <div className="container mx-auto px-4 pt-28 pb-12">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">Welcome to GreenLedger</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="signin" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <Button className="w-full" onClick={handleSignIn}>Sign In</Button>
                  <Button variant="outline" className="w-full" onClick={notifyConnect}>Continue with Google</Button>
                  {DemoButton}
                </TabsContent>
                <TabsContent value="signup" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email2">Email</Label>
                    <Input id="email2" type="email" placeholder="you@example.com" value={email2} onChange={(e) => setEmail2(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="Your city" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password2">Password</Label>
                    <Input id="password2" type="password" placeholder="Create a password" value={password2} onChange={(e) => setPassword2(e.target.value)} />
                  </div>
                  <Button className="w-full" onClick={handleSignUp}>Create Account</Button>
                  <Button variant="outline" className="w-full" onClick={notifyConnect}>Sign up with Google</Button>
                  {DemoButton}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
