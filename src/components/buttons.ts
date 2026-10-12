// Button looks by function, so each kind of action is recognisable. Pair each with a lucide icon:
// save → Check, create → Plus / UserPlus, upload → Upload, security → KeyRound,
// secondary → Download / Printer / X, danger → Trash2 / Ban.
// Use: <button className={btn.save}><Check aria-hidden /> Save</button>  (add w-full / sizes as needed)

const base =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

export const btn = {
  /** Saves or submits a form (Save, Send, Accept). */
  save: `${base} bg-primary text-primary-foreground shadow-sm hover:bg-primary/90`,
  /** Makes a new record (Add post, Create account). */
  create: `${base} bg-primary text-primary-foreground shadow-sm hover:bg-primary/90`,
  /** Sends a file (Upload document, Upload photos). */
  upload: `${base} bg-deep text-white shadow-sm hover:bg-deep/90`,
  /** Passwords and logins (Change / Reset password, Create logins). */
  security: `${base} bg-gold text-deep shadow-sm hover:bg-gold/85`,
  /** Everything secondary (Download, Print, Clear, Cancel, Enable). */
  secondary: `${base} border bg-card text-foreground hover:bg-muted`,
  /** Removes or blocks something; usually behind a confirm (Delete, Disable). */
  danger: `${base} border border-destructive/40 bg-card text-destructive hover:bg-destructive/10`,
  /** The final, irreversible step of a delete. */
  dangerSolid: `${base} bg-destructive text-white hover:bg-destructive/90`,
};

/** The main action of a form: a bit taller. */
export const big = "h-12 text-base";
