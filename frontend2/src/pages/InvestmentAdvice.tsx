import NavBar from "@/components/NavBar";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { toast } from "@/hooks/use-toast";

const COLORS = [
  'hsl(var(--primary) / 1.0)',
  'hsl(var(--primary) / 0.9)',
  'hsl(var(--primary) / 0.8)',
  'hsl(var(--primary) / 0.7)',
  'hsl(var(--primary) / 0.6)',
  'hsl(var(--primary) / 0.5)'
];

export default function InvestmentAdvice(){
  const [month, setMonth] = useState<Date>(new Date());
  const [data, setData] = useState<{name:string,value:number}[]>([]);
  useEffect(()=>{ document.title = "GreenLedger – Investment Advice"; },[]);

  const onAdvice = () => {
    toast({ title: "Connect backend", description: "Hook up your investment advice endpoint. Using mock split for now." });
    // mock a split of savings
    const sectors = ["Tech","Energy","Healthcare","Finance","Consumer","Other"];
    const mock = sectors.map(()=> Math.random());
    const sum = mock.reduce((s,v)=>s+v,0);
    setData(sectors.map((s,i)=>({ name: s, value: Math.round((mock[i]/sum)*100) })));
  };

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="container mx-auto px-4 pt-28 pb-16 space-y-6">
        <section className="flex flex-col md:flex-row gap-4 md:items-end">
          <div>
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
          </div>
          <div className="flex-1 flex justify-end">
            <Button variant="hero" onClick={onAdvice}>Get Investment Advice</Button>
          </div>
        </section>
        <section className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Suggested Allocation</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                    {data.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground">When connected, this will outline the rationale and risk profile based on your savings.</CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
