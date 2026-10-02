import { FOOTER } from "@/content/copy";
import { WHATSAPP_NUMBER, waLink } from "@/content/config";
import { TLink } from "@/features/transitions/TLink";
import { Wordmark } from "./Wordmark";

export function Footer() {
  return (
    <footer className="bg-teal-900 text-cream-100">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.5fr_repeat(3,1fr)] md:px-10">
        <div className="flex flex-col items-start gap-4">
          <Wordmark className="text-cream-100" />
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="glass glass--lite inline-flex items-center rounded-full px-4 py-2.5 text-sm font-semibold text-cream-100"
          >
            {FOOTER.whatsappLabel}
          </a>
          <p className="data text-xs text-sage-300">+{WHATSAPP_NUMBER}</p>
        </div>

        {FOOTER.groups.map((group) => (
          <nav key={group.title} aria-label={group.title} className="flex flex-col gap-3">
            <h2 className="data text-[0.7rem] tracking-[0.18em] text-sage-300 uppercase">
              {group.title}
            </h2>
            <ul className="flex flex-col gap-1">
              {group.links.map((link) => (
                <li key={link.to}>
                  <TLink
                    to={link.to}
                    className="inline-flex min-h-10 items-center text-sm text-cream-100/90 transition-colors hover:text-peach-300"
                  >
                    {link.label}
                  </TLink>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-cream-100/15 px-5 py-6 md:px-10">
        <p className="data mx-auto w-full max-w-6xl text-xs text-sage-300">
          © {new Date().getFullYear()} {FOOTER.copyrightName}
        </p>
      </div>
    </footer>
  );
}
