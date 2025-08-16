import React from "react";
import logo from "@/assets/logo-greenledger.png";

const Logo: React.FC<{ className?: string } > = ({ className }) => (
  <div className={className} aria-label="GreenLedger logo">
    <img src={logo} alt="GreenLedger finance logo" className="h-8 w-8" />
  </div>
);

export default Logo;
