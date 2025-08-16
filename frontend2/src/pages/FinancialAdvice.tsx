import NavBar from "@/components/NavBar";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function FinancialAdvice(){
  const [month, setMonth] = useState<Date>(new Date());
  const [advice, setAdvice] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(()=>{ document.title = "GreenLedger – Financial Advice"; },[]);
  const onAdvice = async () => {
    try{
      setLoading(true);
      setAdvice("");
      const token = localStorage.getItem('gl_token');
      if(!token){ navigate('/auth'); return; }
      const res = await fetch('/api/advisor/financial-advice', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if(!res.ok){ throw new Error(`Failed (${res.status})`); }
      const data = await res.json();
      setAdvice(data?.advice || "");
    }catch(e:any){
      toast({ title: 'Error', description: e?.message || String(e) });
    }finally{
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="container mx-auto px-4 pt-28 pb-16 space-y-6">
        <section className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader><CardTitle>Select Month</CardTitle></CardHeader>
            <CardContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />{format(month,'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={month} onSelect={(d)=> d && setMonth(d)} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground">Your income and expenses for the selected month will appear here for analysis once connected.</CardContent>
          </Card>
        </section>
        <section className="flex justify-end">
          <Button variant="hero" onClick={onAdvice} disabled={loading}>{loading? 'Generating...' : 'Get Advice'}</Button>
        </section>
        <section>
          <Card>
            <CardHeader><CardTitle>Advice Output</CardTitle></CardHeader>
            <CardContent className="min-h-40 whitespace-pre-line">
              {advice || <span className="text-muted-foreground">Results from your RAG pipeline will render here with smooth transitions.</span>}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
