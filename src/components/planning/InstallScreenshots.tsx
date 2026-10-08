import { ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import safariImage from "@/assets/install-safari-iphone.jpg";
import chromeImage from "@/assets/install-chrome-android.jpg";

type Step = {
  /** Court intitulé posé sur la capture, à côté du repère numéroté. */
  label: string;
  /** Phrase complète de l'étape, reprise sous l'image et dans l'agrandissement. */
  text: string;
  /** Position horizontale du repère, en % de la largeur de la capture. */
  x: number;
  /** Position verticale du repère, en % de la hauteur de la capture. */
  y: number;
};

type Guide = {
  title: string;
  image: string;
  alt: string;
  steps: Step[];
};

const GUIDES: Guide[] = [
  {
    title: "iPhone · Safari",
    image: safariImage,
    alt: "Safari sur iPhone : icône Partager, option Sur l’écran d’accueil, puis bouton Ajouter.",
    steps: [
      { label: "Partager", text: "Ouvrez l’application dans Safari et touchez Partager (carré avec une flèche vers le haut).", x: 16.9, y: 85.6 },
      { label: "Écran d’accueil", text: "Faites défiler le menu et choisissez « Sur l’écran d’accueil ».", x: 33.3, y: 71.5 },
      { label: "Ajouter", text: "Confirmez avec « Ajouter » ; l’icône apparaît sur votre écran d’accueil.", x: 62.5, y: 16.9 },
    ],
  },
  {
    title: "Android · Chrome",
    image: chromeImage,
    alt: "Chrome sur Android : menu à trois points, Ajouter à l’écran d’accueil, puis Installer.",
    steps: [
      { label: "Menu ⋮", text: "Ouvrez l’application dans Chrome et touchez le menu ⋮ en haut à droite.", x: 19.9, y: 16.1 },
      { label: "Écran d’accueil", text: "Choisissez « Ajouter à l’écran d’accueil » ou « Installer l’application », selon votre version.", x: 35.8, y: 45.3 },
      { label: "Installer", text: "Touchez « Installer » et confirmez si une étape supplémentaire est proposée.", x: 60.5, y: 61.3 },
    ],
  },
];

/** Pastille numérotée : positionnée en % sur la capture, masquée aux lecteurs d’écran (le texte des étapes fait foi). */
function StepBadge({ number, label, x, y }: { number: number; label: string; x: number; y: number }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-bold leading-none text-primary-foreground shadow-md ring-2 ring-background sm:size-7 sm:text-xs">
        {number}
      </span>
      <span className="rounded-full bg-background/95 px-2 py-0.5 text-[10px] font-semibold text-foreground shadow-sm ring-1 ring-border sm:text-xs">
        {label}
      </span>
    </span>
  );
}

function StepList({ steps, className }: { steps: Step[]; className?: string }) {
  return (
    <ol className={`space-y-2 ${className ?? ""}`}>
      {steps.map((step, index) => (
        <li key={step.label} className="flex items-start gap-2">
          <span
            aria-hidden="true"
            className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold leading-none text-primary-foreground sm:size-6 sm:text-xs"
          >
            {index + 1}
          </span>
          <span className="min-w-0 text-sm">
            <span className="font-semibold">{step.label}</span>
            <span className="text-muted-foreground"> — {step.text}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function MarkedImage({ guide, className }: { guide: Guide; className?: string }) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <img src={guide.image} alt={guide.alt} width={1536} height={1024} loading="lazy" className="h-auto w-full rounded-md border border-border" />
      {guide.steps.map((step, index) => (
        <StepBadge key={step.label} number={index + 1} label={step.label} x={step.x} y={step.y} />
      ))}
    </div>
  );
}

export function InstallScreenshots() {
  return (
    <div className="mt-5 border-t border-border pt-5">
      <h4 className="text-base font-semibold">Installation en images</h4>
      <p className="mt-1 text-xs text-muted-foreground">
        Les repères numérotés <span aria-hidden="true">1, 2 et 3</span> posés sur les captures correspondent aux étapes écrite
        s sous chaque image. Écrans illustrés : la présentation et les intitulés peuvent varier selon la version du téléphone.
      </p>
      <div className="mt-4 grid min-w-0 gap-6 lg:grid-cols-2">
        {GUIDES.map((guide) => (
          <figure key={guide.title} className="min-w-0">
            <figcaption className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h5 className="text-sm font-semibold">{guide.title}</h5>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" aria-label={`Agrandir les étapes ${guide.title}`}><ZoomIn className="size-4" /> Agrandir</Button>
                </DialogTrigger>
                <DialogContent className="w-[calc(100%-2rem)] max-w-6xl max-h-[90dvh] overflow-y-auto">
                  <DialogTitle>{guide.title} — installation</DialogTitle>
                  <DialogDescription>Les repères 1, 2 et 3 de l’image correspondent aux étapes ci-dessous ; les menus peuvent varier selon votre version.</DialogDescription>
                  <MarkedImage guide={guide} className="rounded-md" />
                  <StepList steps={guide.steps} className="mt-2" />
                </DialogContent>
              </Dialog>
            </figcaption>
            <MarkedImage guide={guide} />
            <StepList steps={guide.steps} className="mt-3 text-muted-foreground" />
          </figure>
        ))}
      </div>
    </div>
  );
}
