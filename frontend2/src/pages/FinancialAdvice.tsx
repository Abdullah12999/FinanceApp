import NavBar from "@/components/NavBar";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function FinancialAdvice(){
  const [month, setMonth] = useState<Date>(new Date());
  const [advice, setAdvice] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{ document.title = "GreenLedger — Financial Advice"; },[]);

  // Fade-in animation when advice is received
  useEffect(() => {
    if (advice) {
      setShowContent(false);
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    }
  }, [advice]);

  const onAdvice = async () => {
    try{
      setLoading(true);
      setAdvice("");
      setShowContent(false);

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
          <Card className="hover:shadow-lg transition-shadow duration-300">
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
          <Card className="md:col-span-2 hover:shadow-lg transition-shadow duration-300">
            <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground">Your income and expenses for the selected month will appear here for analysis once connected.</CardContent>
          </Card>
        </section>

        <section className="flex justify-end">
          <Button
            variant="hero"
            onClick={onAdvice}
            disabled={loading}
            className="relative overflow-hidden group"
          >
            {loading && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-disabled:animate-[shimmer_2s_infinite]" />
                <div className="absolute left-3 flex items-center">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
              </>
            )}
            <span className={cn("transition-all duration-200", loading && "ml-6")}>
              {loading ? 'Analyzing...' : 'Get Advice'}
            </span>
          </Button>
        </section>

        <section>
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Advice Output
                {loading && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200" />
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-40 relative">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-6">
                  {/* Professional loading animation */}
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
                    <div className="absolute inset-2 w-12 h-12 border-4 border-transparent border-r-primary/60 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                    <div className="absolute inset-4 w-8 h-8 border-4 border-transparent border-b-primary/40 rounded-full animate-spin" style={{animationDuration: '3s'}}></div>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="flex items-center gap-2 justify-center">
                      <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                      <p className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        AI Financial Advisor
                      </p>
                      <Sparkles className="w-5 h-5 text-primary animate-pulse delay-300" />
                    </div>
                    <p className="text-sm text-muted-foreground animate-pulse">
                      Analyzing your financial patterns and market trends...
                    </p>

                    {/* Animated progress dots */}
                    <div className="flex justify-center gap-1 mt-4">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-primary/60 rounded-full animate-pulse"
                          style={{animationDelay: `${i * 200}ms`}}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : advice ? (
                <div
                  className={cn(
                    "prose prose-sm max-w-none whitespace-pre-line transition-all duration-700 ease-out",
                    showContent
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  )}
                >
                  <div className="relative">
                    {/* Success indicator */}
                    <div className={cn(
                      "absolute -top-2 -left-2 w-3 h-3 bg-green-500 rounded-full transition-all duration-500",
                      showContent ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    )} />

                    {/* Content with subtle animations */}
                    <div className="space-y-4">
                      {advice.split('\n\n').map((paragraph, index) => (
                        <div
                          key={index}
                          className={cn(
                            "transition-all duration-700 ease-out",
                            showContent
                              ? "opacity-100 translate-x-0"
                              : "opacity-0 translate-x-4"
                          )}
                          style={{transitionDelay: `${index * 100}ms`}}
                        >
                          {paragraph}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <div className="text-center space-y-2">
                    <Sparkles className="w-8 h-8 mx-auto text-primary/40" />
                    <p>Click "Get Advice" to receive personalized financial recommendations</p>
                  </div>
                </div>
              )}

              {/* Animated background gradient when loading */}
              {loading && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-pulse pointer-events-none" />
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}