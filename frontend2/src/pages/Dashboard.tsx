import { useEffect, useMemo, useState } from "react";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, Tooltip, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { useNavigate } from "react-router-dom";

type TrackerEntry = { amount: number; type: 'expense' | 'side-income'; category: string; description: string; date?: string };
type TrackerData = {
  monthly_income: number;
  side_income: number;
  total_expense: number;
  net_savings: number;
  entries: TrackerEntry[];
};
type CategoryTotal = { category: string; total: number };
const CATS = ["Food","Transport","Utilities","Healthcare","Entertainment","Other"] as const;

export default function Dashboard(){
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0,7));
  const [incomeType, setIncomeType] = useState<'base'|'side'>('base');
  const [incomeAmount, setIncomeAmount] = useState<number>(0);
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseCategory, setExpenseCategory] = useState<typeof CATS[number]>("Food");
  const [expenseDate, setExpenseDate] = useState<Date | undefined>(new Date());
  const [expenseDesc, setExpenseDesc] = useState<string>("");
  const [tracker, setTracker] = useState<TrackerData | null>(null);
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([]);
  const navigate = useNavigate();

  useEffect(()=>{ document.title = "GreenLedger – Dashboard"; },[]);

  async function refetch(){
    const token = localStorage.getItem('gl_token');
    if(!token){ navigate('/auth'); return; }
    const [tRes, cRes] = await Promise.all([
      fetch(`/api/dashboard/tracker?month=${month}`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`/api/dashboard/category-totals?month=${month}`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    if(tRes.ok) setTracker(await tRes.json());
    if(cRes.ok) setCategoryTotals(await cRes.json());
  }

  useEffect(()=>{ refetch(); },[month]);

  const saveIncome = async () => {
    if(!incomeAmount) return;
    const token = localStorage.getItem('gl_token');
    if(!token){ navigate('/auth'); return; }
    const res = await fetch('/api/dashboard/tracker/income', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ amount: incomeAmount, month }),
    });
    if(res.ok) refetch();
  };

  const saveExpense = async () => {
    if(!expenseAmount || !expenseDate) return;
    const token = localStorage.getItem('gl_token');
    if(!token){ navigate('/auth'); return; }
    const payload: TrackerEntry = {
      amount: expenseAmount,
      type: 'expense',
      category: expenseCategory,
      description: expenseDesc,
      date: expenseDate.toISOString().slice(0,10),
    };
    const res = await fetch('/api/dashboard/tracker/entry', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if(res.ok) refetch();
  };

  // Charts data
  const days: { day: string; expense: number }[] = (()=>{
    const map = new Map<string, number>();
    (tracker?.entries||[]).forEach(e=>{ if(e.type==='expense' && e.date){ map.set(e.date, (map.get(e.date)||0)+Number(e.amount||0)); } });
    return Array.from(map.entries()).sort((a,b)=>a[0]<b[0]? -1: 1).map(([date,total])=>({ day: date.slice(-2), expense: total }));
  })();

  const byCat = (categoryTotals||[]).map(t=>({ name: t.category, value: t.total }));
  const COLORS = ["#10b981","#059669","#34d399","#16a34a","#22c55e","#4ade80"];

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="container mx-auto px-4 pt-28 pb-16 space-y-8">
        {/* Quick income setup / edit */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Income</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-4">
            <div>
              <Label className="mb-2 block">Month</Label>
              <Input type="month" value={month} onChange={(e)=> setMonth(e.target.value)} />
            </div>
            <div>
              <Label className="mb-2 block">Type</Label>
              <Select value={incomeType} onValueChange={(v)=> setIncomeType(v as 'base'|'side')}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="base">Monthly income</SelectItem>
                  <SelectItem value="side">Side income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="mb-2 block">Amount (PKR)</Label>
              <Input type="number" min={0} value={incomeAmount} onChange={(e)=> setIncomeAmount(Number(e.target.value))} placeholder="e.g. 150000" />
            </div>
            <div className="md:col-span-4 flex justify-end">
              <Button variant="hero" onClick={saveIncome} disabled={!incomeAmount}>Save Income</Button>
            </div>
          </CardContent>
        </Card>

        {/* Overview */}
        <section className="grid md:grid-cols-3 gap-4">
          <Card className="shadow-sm">
            <CardHeader><CardTitle>Month</CardTitle></CardHeader>
            <CardContent className="text-2xl font-semibold">{new Date(month+"-01").toLocaleDateString(undefined,{ month: 'long', year: 'numeric' })}</CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader><CardTitle>Total Income</CardTitle></CardHeader>
            <CardContent className="text-2xl font-semibold">PKR {(tracker?.total_income||0).toLocaleString()}</CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader><CardTitle>Savings</CardTitle></CardHeader>
            <CardContent className="text-2xl font-semibold">PKR {(tracker?.net_savings||0).toLocaleString()}</CardContent>
          </Card>
        </section>

        {/* Expenses entry */}
        <Card>
          <CardHeader><CardTitle>Add Expense</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-5 gap-4">
            <div>
              <Label className="mb-2 block">Amount (PKR)</Label>
              <Input type="number" min={0} value={expenseAmount} onChange={(e)=> setExpenseAmount(Number(e.target.value))} />
            </div>
            <div>
              <Label className="mb-2 block">Category</Label>
              <Select value={expenseCategory} onValueChange={(v)=> setExpenseCategory(v as any)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {CATS.map(c=> <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />{expenseDate ? format(expenseDate,'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={expenseDate} onSelect={(d)=> d && setExpenseDate(d)} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="md:col-span-2">
              <Label className="mb-2 block">Description</Label>
              <Input value={expenseDesc} onChange={(e)=> setExpenseDesc(e.target.value)} placeholder="e.g. Grocery shopping" />
            </div>
            <div className="md:col-span-5 flex justify-end">
              <Button variant="secondary" onClick={saveExpense} disabled={!expenseAmount || !expenseDate}>Save Expense</Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <section className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Income vs Expense (this month)</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: 'This Month', income: tracker?.total_income||0, expense: tracker?.total_expense||0 }] }>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="income" fill="hsl(var(--primary))" radius={[6,6,0,0]} />
                  <Bar dataKey="expense" fill="hsl(var(--destructive))" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Expense by Category</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Pie data={byCat} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {byCat.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Expense by Day</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={days}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="expense" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="expense" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        {/* Entries */}
        <Card>
          <CardHeader><CardTitle>All Entries</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <Tabs defaultValue="expenses">
              <TabsList>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
                <TabsTrigger value="incomes">Incomes</TabsTrigger>
              </TabsList>
              <TabsContent value="expenses">
                 <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-2">Date</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th className="text-right">Amount (PKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(tracker?.entries||[]).filter(e=> e.type==='expense').map((e, idx)=> (
                      <tr key={idx} className="border-t">
                        <td className="py-2">{e.date}</td>
                        <td>{e.description}</td>
                        <td className="capitalize">{e.category}</td>
                        <td className="text-right">{Number(e.amount).toLocaleString()}</td>
                      </tr>
                    ))}
                    {((tracker?.entries||[]).filter(e=> e.type==='expense').length===0) && (
                      <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">No expenses yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </TabsContent>
              <TabsContent value="incomes">
                 <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-2">Date</th>
                      <th>Type</th>
                      <th className="text-right">Amount (PKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {([
                      { date: month+"-01", type: 'base', amount: tracker?.monthly_income||0 },
                      { date: month+"-01", type: 'side', amount: tracker?.side_income||0 },
                    ]).filter(i=> i.amount>0).map((i, idx)=> (
                      <tr key={idx} className="border-t">
                        <td className="py-2">{i.date}</td>
                        <td className="capitalize">{i.type}</td>
                        <td className="text-right">{Number(i.amount).toLocaleString()}</td>
                      </tr>
                    ))}
                    {((tracker?.monthly_income||0)+(tracker?.side_income||0)===0) && (
                      <tr><td colSpan={3} className="py-6 text-center text-muted-foreground">No incomes yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
