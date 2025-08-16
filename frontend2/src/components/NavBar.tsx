import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";

export default function NavBar() {
  const navigate = useNavigate();
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-4 py-2 text-sm font-medium ${
      isActive ? "bg-primary/15 text-primary" : "text-foreground hover:bg-primary/10"
    }`;

  return (
    <header className="fixed top-4 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between rounded-2xl bg-background/60 backdrop-blur-md border border-border/60 shadow-sm px-3 py-2">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
              <Logo />
              <span className="font-semibold">GreenLedger</span>
            </button>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/financial-advice" className={linkCls} end>Financial Advice</NavLink>
            <NavLink to="/investment-advice" className={linkCls} end>Investment Advice</NavLink>
            <NavLink to="/stocks" className={linkCls} end>Stocks</NavLink>
            <NavLink to="/newsletter" className={linkCls} end>Newsletter</NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="glass"
              onClick={() => {
                localStorage.removeItem('gl_token');
                navigate('/auth');
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
