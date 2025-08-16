import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

export default function Splash() {
  const navigate = useNavigate();
  const [showPrompt, setShowPrompt] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [amount, setAmount] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "GreenLedger – Getting Started";
    const t = setTimeout(() => setShowPrompt(true), 3500);
    return () => clearTimeout(t);
  }, []);

  const welcome = useMemo(() => (
    <section className="min-h-[60vh] flex items-center justify-center text-center">
      <div className="space-y-4 animate-enter">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-glow)))]">
          Welcome to GreenLedger
        </h1>
        <p className="text-muted-foreground text-lg">
          Let’s personalize your dashboard. We’ll start with your monthly income.
        </p>
      </div>
    </section>
  ), []);

  const onSave = async () => {
    if (!date || !amount) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('gl_token');
      if(!token){ navigate('/auth'); return; }
      const res = await fetch('/api/dashboard/tracker/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(amount), month: date.toISOString().slice(0,7) }),
      });
      if(!res.ok){ throw new Error('Failed to save income'); }
      navigate('/dashboard');
    } catch(e:any){
      toast({ title: 'Error', description: e?.message || String(e) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <NavBar />
      {/* Ambient gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_60rem_at_50%_-10%,hsl(var(--primary)/.18)_0%,transparent_60%)]" />

      <main className="container mx-auto px-4 pt-28 pb-20">
        {welcome}

        {showPrompt && (
          <div className="max-w-2xl mx-auto mt-8 animate-enter">
            <div className="rounded-2xl border border-border bg-card/80 backdrop-blur p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Enter your monthly income</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <Label className="mb-2 block">Month</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="md:col-span-2">
                  <Label className="mb-2 block">Income (PKR)</Label>
                  <Input type="number" min={0} value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="e.g. 150000"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={onSave} disabled={saving || !amount || !date} variant="hero">
                  Save & Continue
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      {saving && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[radial-gradient(60rem_60rem_at_50%_-10%,hsl(var(--primary)/.22)_0%,transparent_60%)] backdrop-blur-md">
          <div className="h-14 w-14 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        </div>
      )}
    </div>
  );
}
