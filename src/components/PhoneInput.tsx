"use client";

import React, { useEffect, useRef, useState } from "react";
import * as Flags from "country-flag-icons/react/3x2";

type Country = { name: string; code: string; dial: string };

function FlagIcon({ code, ...props }: { code: string } & React.SVGProps<SVGSVGElement>) {
  const Flag = Flags[code as keyof typeof Flags];
  if (!Flag) return <span style={{ fontSize: 16 }}>🏳</span>;
  return <Flag {...props} />;
}

const COUNTRIES: Country[] = [
  { name: "Brasil", code: "BR", dial: "+55" },
  { name: "Portugal", code: "PT", dial: "+351" },
  { name: "Angola", code: "AO", dial: "+244" },
  { name: "Afeganistão", code: "AF", dial: "+93" },
  { name: "África do Sul", code: "ZA", dial: "+27" },
  { name: "Albânia", code: "AL", dial: "+355" },
  { name: "Alemanha", code: "DE", dial: "+49" },
  { name: "Andorra", code: "AD", dial: "+376" },
  { name: "Arábia Saudita", code: "SA", dial: "+966" },
  { name: "Argélia", code: "DZ", dial: "+213" },
  { name: "Argentina", code: "AR", dial: "+54" },
  { name: "Armênia", code: "AM", dial: "+374" },
  { name: "Austrália", code: "AU", dial: "+61" },
  { name: "Áustria", code: "AT", dial: "+43" },
  { name: "Azerbaijão", code: "AZ", dial: "+994" },
  { name: "Bahamas", code: "BS", dial: "+1242" },
  { name: "Bahrain", code: "BH", dial: "+973" },
  { name: "Bangladesh", code: "BD", dial: "+880" },
  { name: "Barbados", code: "BB", dial: "+1246" },
  { name: "Bélgica", code: "BE", dial: "+32" },
  { name: "Belize", code: "BZ", dial: "+501" },
  { name: "Benin", code: "BJ", dial: "+229" },
  { name: "Bielo-Rússia", code: "BY", dial: "+375" },
  { name: "Bolívia", code: "BO", dial: "+591" },
  { name: "Bósnia e Herzegovina", code: "BA", dial: "+387" },
  { name: "Botswana", code: "BW", dial: "+267" },
  { name: "Brunei", code: "BN", dial: "+673" },
  { name: "Bulgária", code: "BG", dial: "+359" },
  { name: "Burkina Faso", code: "BF", dial: "+226" },
  { name: "Burundi", code: "BI", dial: "+257" },
  { name: "Butão", code: "BT", dial: "+975" },
  { name: "Cabo Verde", code: "CV", dial: "+238" },
  { name: "Camboja", code: "KH", dial: "+855" },
  { name: "Camarões", code: "CM", dial: "+237" },
  { name: "Canadá", code: "CA", dial: "+1" },
  { name: "Cazaquistão", code: "KZ", dial: "+7" },
  { name: "Chade", code: "TD", dial: "+235" },
  { name: "Chile", code: "CL", dial: "+56" },
  { name: "China", code: "CN", dial: "+86" },
  { name: "Chipre", code: "CY", dial: "+357" },
  { name: "Colômbia", code: "CO", dial: "+57" },
  { name: "Comores", code: "KM", dial: "+269" },
  { name: "Congo", code: "CG", dial: "+242" },
  { name: "Congo (RDC)", code: "CD", dial: "+243" },
  { name: "Coreia do Norte", code: "KP", dial: "+850" },
  { name: "Coreia do Sul", code: "KR", dial: "+82" },
  { name: "Costa do Marfim", code: "CI", dial: "+225" },
  { name: "Costa Rica", code: "CR", dial: "+506" },
  { name: "Croácia", code: "HR", dial: "+385" },
  { name: "Cuba", code: "CU", dial: "+53" },
  { name: "Dinamarca", code: "DK", dial: "+45" },
  { name: "Djibuti", code: "DJ", dial: "+253" },
  { name: "Dominica", code: "DM", dial: "+1767" },
  { name: "Egito", code: "EG", dial: "+20" },
  { name: "El Salvador", code: "SV", dial: "+503" },
  { name: "Emirados Árabes Unidos", code: "AE", dial: "+971" },
  { name: "Equador", code: "EC", dial: "+593" },
  { name: "Eritreia", code: "ER", dial: "+291" },
  { name: "Eslováquia", code: "SK", dial: "+421" },
  { name: "Eslovênia", code: "SI", dial: "+386" },
  { name: "Espanha", code: "ES", dial: "+34" },
  { name: "Estados Unidos", code: "US", dial: "+1" },
  { name: "Estônia", code: "EE", dial: "+372" },
  { name: "Etiópia", code: "ET", dial: "+251" },
  { name: "Fiji", code: "FJ", dial: "+679" },
  { name: "Filipinas", code: "PH", dial: "+63" },
  { name: "Finlândia", code: "FI", dial: "+358" },
  { name: "França", code: "FR", dial: "+33" },
  { name: "Gabão", code: "GA", dial: "+241" },
  { name: "Gâmbia", code: "GM", dial: "+220" },
  { name: "Gana", code: "GH", dial: "+233" },
  { name: "Geórgia", code: "GE", dial: "+995" },
  { name: "Granada", code: "GD", dial: "+1473" },
  { name: "Grécia", code: "GR", dial: "+30" },
  { name: "Guatemala", code: "GT", dial: "+502" },
  { name: "Guiné", code: "GN", dial: "+224" },
  { name: "Guiné Equatorial", code: "GQ", dial: "+240" },
  { name: "Guiné-Bissau", code: "GW", dial: "+245" },
  { name: "Guiana", code: "GY", dial: "+592" },
  { name: "Haiti", code: "HT", dial: "+509" },
  { name: "Honduras", code: "HN", dial: "+504" },
  { name: "Hong Kong", code: "HK", dial: "+852" },
  { name: "Hungria", code: "HU", dial: "+36" },
  { name: "Iêmen", code: "YE", dial: "+967" },
  { name: "Ilhas Marshall", code: "MH", dial: "+692" },
  { name: "Ilhas Salomão", code: "SB", dial: "+677" },
  { name: "Índia", code: "IN", dial: "+91" },
  { name: "Indonésia", code: "ID", dial: "+62" },
  { name: "Inglaterra", code: "GB", dial: "+44" },
  { name: "Irã", code: "IR", dial: "+98" },
  { name: "Iraque", code: "IQ", dial: "+964" },
  { name: "Irlanda", code: "IE", dial: "+353" },
  { name: "Islândia", code: "IS", dial: "+354" },
  { name: "Israel", code: "IL", dial: "+972" },
  { name: "Itália", code: "IT", dial: "+39" },
  { name: "Jamaica", code: "JM", dial: "+1876" },
  { name: "Japão", code: "JP", dial: "+81" },
  { name: "Jordânia", code: "JO", dial: "+962" },
  { name: "Kiribati", code: "KI", dial: "+686" },
  { name: "Kuwait", code: "KW", dial: "+965" },
  { name: "Laos", code: "LA", dial: "+856" },
  { name: "Lesoto", code: "LS", dial: "+266" },
  { name: "Letônia", code: "LV", dial: "+371" },
  { name: "Líbano", code: "LB", dial: "+961" },
  { name: "Libéria", code: "LR", dial: "+231" },
  { name: "Líbia", code: "LY", dial: "+218" },
  { name: "Liechtenstein", code: "LI", dial: "+423" },
  { name: "Lituânia", code: "LT", dial: "+370" },
  { name: "Luxemburgo", code: "LU", dial: "+352" },
  { name: "Macedônia do Norte", code: "MK", dial: "+389" },
  { name: "Madagascar", code: "MG", dial: "+261" },
  { name: "Malásia", code: "MY", dial: "+60" },
  { name: "Malawi", code: "MW", dial: "+265" },
  { name: "Maldivas", code: "MV", dial: "+960" },
  { name: "Mali", code: "ML", dial: "+223" },
  { name: "Malta", code: "MT", dial: "+356" },
  { name: "Marrocos", code: "MA", dial: "+212" },
  { name: "Mauritânia", code: "MR", dial: "+222" },
  { name: "Maurício", code: "MU", dial: "+230" },
  { name: "México", code: "MX", dial: "+52" },
  { name: "Micronésia", code: "FM", dial: "+691" },
  { name: "Moçambique", code: "MZ", dial: "+258" },
  { name: "Moldávia", code: "MD", dial: "+373" },
  { name: "Mônaco", code: "MC", dial: "+377" },
  { name: "Mongólia", code: "MN", dial: "+976" },
  { name: "Montenegro", code: "ME", dial: "+382" },
  { name: "Myanmar", code: "MM", dial: "+95" },
  { name: "Namíbia", code: "NA", dial: "+264" },
  { name: "Nauru", code: "NR", dial: "+674" },
  { name: "Nepal", code: "NP", dial: "+977" },
  { name: "Nicarágua", code: "NI", dial: "+505" },
  { name: "Níger", code: "NE", dial: "+227" },
  { name: "Nigéria", code: "NG", dial: "+234" },
  { name: "Noruega", code: "NO", dial: "+47" },
  { name: "Nova Zelândia", code: "NZ", dial: "+64" },
  { name: "Omã", code: "OM", dial: "+968" },
  { name: "Holanda", code: "NL", dial: "+31" },
  { name: "Paquistão", code: "PK", dial: "+92" },
  { name: "Palau", code: "PW", dial: "+680" },
  { name: "Palestina", code: "PS", dial: "+970" },
  { name: "Panamá", code: "PA", dial: "+507" },
  { name: "Papua-Nova Guiné", code: "PG", dial: "+675" },
  { name: "Paraguai", code: "PY", dial: "+595" },
  { name: "Peru", code: "PE", dial: "+51" },
  { name: "Polônia", code: "PL", dial: "+48" },
  { name: "Quirguistão", code: "KG", dial: "+996" },
  { name: "Quênia", code: "KE", dial: "+254" },
  { name: "Catar", code: "QA", dial: "+974" },
  { name: "República Centro-Africana", code: "CF", dial: "+236" },
  { name: "República Dominicana", code: "DO", dial: "+1809" },
  { name: "República Tcheca", code: "CZ", dial: "+420" },
  { name: "Romênia", code: "RO", dial: "+40" },
  { name: "Ruanda", code: "RW", dial: "+250" },
  { name: "Rússia", code: "RU", dial: "+7" },
  { name: "Santa Lúcia", code: "LC", dial: "+1758" },
  { name: "São Tomé e Príncipe", code: "ST", dial: "+239" },
  { name: "São Vicente e Granadinas", code: "VC", dial: "+1784" },
  { name: "Samoa", code: "WS", dial: "+685" },
  { name: "San Marino", code: "SM", dial: "+378" },
  { name: "Senegal", code: "SN", dial: "+221" },
  { name: "Serra Leoa", code: "SL", dial: "+232" },
  { name: "Sérvia", code: "RS", dial: "+381" },
  { name: "Seychelles", code: "SC", dial: "+248" },
  { name: "Singapura", code: "SG", dial: "+65" },
  { name: "Síria", code: "SY", dial: "+963" },
  { name: "Somália", code: "SO", dial: "+252" },
  { name: "Sri Lanka", code: "LK", dial: "+94" },
  { name: "St. Kitts e Nevis", code: "KN", dial: "+1869" },
  { name: "Sudão", code: "SD", dial: "+249" },
  { name: "Sudão do Sul", code: "SS", dial: "+211" },
  { name: "Suécia", code: "SE", dial: "+46" },
  { name: "Suíça", code: "CH", dial: "+41" },
  { name: "Suriname", code: "SR", dial: "+597" },
  { name: "Suazilândia", code: "SZ", dial: "+268" },
  { name: "Tailândia", code: "TH", dial: "+66" },
  { name: "Taiwan", code: "TW", dial: "+886" },
  { name: "Tajiquistão", code: "TJ", dial: "+992" },
  { name: "Tanzânia", code: "TZ", dial: "+255" },
  { name: "Timor-Leste", code: "TL", dial: "+670" },
  { name: "Togo", code: "TG", dial: "+228" },
  { name: "Tonga", code: "TO", dial: "+676" },
  { name: "Trindade e Tobago", code: "TT", dial: "+1868" },
  { name: "Tunísia", code: "TN", dial: "+216" },
  { name: "Turquemenistão", code: "TM", dial: "+993" },
  { name: "Turquia", code: "TR", dial: "+90" },
  { name: "Tuvalu", code: "TV", dial: "+688" },
  { name: "Ucrânia", code: "UA", dial: "+380" },
  { name: "Uganda", code: "UG", dial: "+256" },
  { name: "Uruguai", code: "UY", dial: "+598" },
  { name: "Uzbequistão", code: "UZ", dial: "+998" },
  { name: "Vanuatu", code: "VU", dial: "+678" },
  { name: "Vaticano", code: "VA", dial: "+379" },
  { name: "Venezuela", code: "VE", dial: "+58" },
  { name: "Vietnã", code: "VN", dial: "+84" },
  { name: "Zâmbia", code: "ZM", dial: "+260" },
  { name: "Zimbábue", code: "ZW", dial: "+263" },
];

type Props = {
  onChange: (value: string) => void;
  required?: boolean;
};

export default function PhoneInput({ onChange, required }: Props) {
  const [selected, setSelected] = useState<Country>(COUNTRIES[0]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [localNum, setLocalNum] = useState("");
  const dropRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onChange(localNum ? `${selected.dial} ${localNum}` : "");
  }, [selected, localNum, onChange]);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function formatLocal(v: string) {
    if (selected.code !== "BR") return v.replace(/\D/g, "");
    const digits = v.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={dropRef} className="relative">
      {/* Input wrapper styled like glass-input */}
      <div
        className="flex items-center w-full rounded-xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.09)",
          height: 54,
        }}
      >
        {/* Flag button */}
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="flex items-center justify-center shrink-0 h-full"
          style={{ width: 52 }}
        >
          <FlagIcon code={selected.code} style={{ width: 24, height: 16, borderRadius: 2 }} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.12)", flexShrink: 0 }} />

        {/* DDI prefix + local input */}
        <div className="flex items-center flex-1 px-3 gap-2">
          <span
            style={{
              color: "rgba(255,255,255,0.35)",
              fontSize: 14,
              fontWeight: 500,
              userSelect: "none",
              flexShrink: 0,
              fontFamily: "'Instrument Sans', sans-serif",
            }}
          >
            {selected.dial}
          </span>
          <input
            type="tel"
            placeholder="Telefone"
            value={localNum}
            onChange={e => setLocalNum(formatLocal(e.target.value))}
            required={required}
            className="flex-1 bg-transparent outline-none text-white placeholder-white/20"
            style={{ fontSize: 14, fontFamily: "'Instrument Sans', sans-serif" }}
          />
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-0 z-50 w-72 rounded-2xl overflow-hidden"
          style={{
            top: "calc(100% + 6px)",
            background: "rgba(10,10,10,0.98)",
            border: "1px solid rgba(255,255,255,0.09)",
            maxHeight: 320,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Search */}
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}
          >
            <input
              ref={searchRef}
              type="text"
              placeholder="Buscar país..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white placeholder-white/30"
              style={{ fontSize: 13, fontFamily: "'Instrument Sans', sans-serif" }}
            />
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center" style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                Nenhum país encontrado
              </div>
            ) : filtered.map(c => (
              <button
                key={c.code}
                type="button"
                onClick={() => { setSelected(c); setOpen(false); setSearch(""); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/5"
                style={{ color: selected.code === c.code ? "#ffe033" : "rgba(255,255,255,0.75)" }}
              >
                <FlagIcon code={c.code} style={{ width: 22, height: 15, borderRadius: 2, flexShrink: 0 }} />
                <span className="flex-1 text-left truncate" style={{ fontSize: 13 }}>{c.name}</span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, flexShrink: 0 }}>{c.dial}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
