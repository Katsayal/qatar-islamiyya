import ReactMarkdown from "react-markdown";

// Staff-written markdown. react-markdown never renders raw HTML, so this is safe.
export function PostBody({ body, lang }: { body: string; lang: string }) {
  const rtl = lang === "ar";
  return (
    <div
      lang={lang}
      dir={rtl ? "rtl" : undefined}
      className={`mt-4 space-y-4 leading-relaxed [&_a]:text-primary [&_a]:underline [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:ps-6 [&_ul]:list-disc [&_ul]:ps-6 ${rtl ? "font-arabic text-lg" : ""}`}
    >
      <ReactMarkdown>{body}</ReactMarkdown>
    </div>
  );
}
