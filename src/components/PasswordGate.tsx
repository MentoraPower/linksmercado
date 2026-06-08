"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const KEY = "lp_auth";

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(KEY) === "1") {
      setAuthed(true);
    } else {
      router.replace("/acesso");
    }
    setChecked(true);
  }, [router]);

  if (!checked || !authed) return null;
  return <>{children}</>;
}
