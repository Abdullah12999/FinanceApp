import NavBar from "@/components/NavBar";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface News { id: string; title: string; source: string; date: string; }

export default function Newsletter(){
  const [items, setItems] = useState<News[]>([]);
  useEffect(()=>{ document.title = "GreenLedger – Finance News"; },[]);

  const load = () => {
    // Mock content; replace with your news API once connected
    const now = new Date();
    const sample: News[] = [
      { id: crypto.randomUUID(), title: 'Markets rally as inflation cools', source: 'Reuters', date: now.toDateString() },
      { id: crypto.randomUUID(), title: 'Emerging markets ETFs see inflows', source: 'Bloomberg', date: now.toDateString() },
      { id: crypto.randomUUID(), title: 'Oil prices ease amid supply outlook', source: 'WSJ', date: now.toDateString() },
    ];
    setItems(sample);
  };

  useEffect(()=>{ load(); },[]);

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="container mx-auto px-4 pt-28 pb-16 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Finance Newsletter</h1>
          <Button variant="secondary" onClick={load}>Refresh</Button>
        </div>
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(n => (
            <Card key={n.id} className="hover-scale">
              <CardHeader><CardTitle className="text-base">{n.title}</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground flex justify-between">
                <span>{n.source}</span>
                <span>{n.date}</span>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
