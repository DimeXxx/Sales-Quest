import { useLanguage } from "../../i18n/LanguageContext";

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.03] p-0.5">
      {(["ru", "ro"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase transition-all ${
            lang === l ? "bg-cyan-400 text-slate-950" : "text-slate-500 hover:text-slate-200"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
