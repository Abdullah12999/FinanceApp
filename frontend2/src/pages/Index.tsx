import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "GreenLedger – Modern Finance Tracking";
    navigate("/auth", { replace: true });
  }, [navigate]);
  return null;
};

export default Index;
