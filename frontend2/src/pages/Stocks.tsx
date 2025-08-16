import NavBar from "@/components/NavBar";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { toast } from "@/hooks/use-toast";

export default function Stocks(){
  const [query, setQuery] = useState("");
  const [data, setData] = useState<{date:string, price:number}[]>([]);
  useEffect(()=>{ document.title = "GreenLedger – Stock Predictor"; },[]);

  const onPredict = async () => {
    toast({ title: "Backend needed", description: "Wire your FastAPI + yfinance endpoint to fetch predictions." });
    // mock curve
    const mock = Array.from({length: 20}).map((_,i)=> ({ date: `D${i+1}`, price: Math.round(100 + i*2 + Math.sin(i/2)*8 + Math.random()*4) }));
    setData(mock);
  };

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="container mx-auto px-4 pt-28 pb-16 space-y-6">
        <Card>
          <CardHeader><CardTitle>Stock Market Predictor</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-[1fr_auto] gap-3">
            <Input value={query} onChange={(e)=> setQuery(e.target.value)} placeholder="Enter stock symbol (e.g., AAPL, TSLA)" />
            <Button variant="hero" onClick={onPredict}>Predict</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Predicted Prices</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
