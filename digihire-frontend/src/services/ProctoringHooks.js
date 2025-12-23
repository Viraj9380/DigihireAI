import { useEffect } from "react";
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

const client = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

export default function useProctoring() {
  useEffect(() => {
    const log = (type) =>
      api.post("/proctoring/event", { type, time: new Date() });

    const blur = () => log("TAB_SWITCH");
    const fullscreen = () => {
      if (!document.fullscreenElement) log("EXIT_FULLSCREEN");
    };

    window.addEventListener("blur", blur);
    document.addEventListener("fullscreenchange", fullscreen);

    return () => {
      window.removeEventListener("blur", blur);
      document.removeEventListener("fullscreenchange", fullscreen);
    };
  }, []);
}
