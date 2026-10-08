import { ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import safariImage from "@/assets/install-safari-iphone.jpg";
import chromeImage from "@/assets/install-chrome-android.jpg";

/** Côté de l'encadré où la pastille est posée, dans une zone vide de la capture. */
type Anchor = "top" | "bottom" | "left" | "right";

/**
 * Une étape d'installation.
 * x, y, w, h sont des pourcentages de la capture (origine en haut à gauche) et
 * délimitent la zone exacte à montrer : l'encadré s'y pose, la pastille numérotée
 * juste à côté, côté `anchor`.
 */
type Step = {
  label: string;
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  anchor: Anchor;
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
      { label: "Partager", text: "Ouvrez l’application dans Safari et touchez Partager (carré avec une flèche vers le haut).", x: 14.71, y: 82.23, w: 4.29, h: 6.84, anchor: "top" },
      { label: "Écran d’accueil", text: "Faites défiler le menu et choisissez « Sur l’écran d’accueil ».", x: 36.78, y: 68.26, w: 26.24, h: 6.15, anchor: "left" },
      { label: "Ajouter", text: "Confirmez avec « Ajouter » ; l’icône apparaît sur votre écran d’accueil.", x: 89.0, y: 14.36, w: 7.9, h: 5.08, anchor: "bottom" },
    ],
  },
  {
    title: "Android · Chrome",
    image: chromeImage,
    alt: "Chrome sur Android : menu à trois points, Ajouter à l’écran d’accueil, puis Installer.",
    steps: [
      { label: "Menu ⋮", text: "Ouvrez l’application dans Chrome et touchez le menu ⋮ en haut à droite.", x: 27.6, y: 12.8, w: 4.0, h: 6.7, anchor: "bottom" },
      { label: "Écran d’accueil", text: "Choisissez « Ajouter à l’écran d’accueil » ou « Installer l’application », selon votre version.", x: 43.42, y: 42.29, w: 20.64, h: 6.25, anchor: "left" },
      { label: "Installer", text: "Touchez « Installer » et confirmez si une étape supplémentaire est proposée.", x: 85.55, y: 57.91, w: 10.42, h: 7.32, anchor: "bottom" },
    ],
  },
];

/** Encadré + pastille numérotée posés sur la capture (décoratifs : les étapes écrite portent le texte). */
function StepMarker({ step, number }: { step: Step; number: number }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute rounded-lg border-2 border-primary/90 shadow-[0_0_0_1.5px_rgba(255,255,255,0.85)]"
      style={{
        left: `${step.x}%`,
        top: `${step.y}%`,
        right: `${100 - step.x - step.w}%`,
        bottom: `${100 - step.y - step.h}%`,
      }}
    >
      <span
        className={`absolute grid size-6 place-items-center rounded-full bg-primary text-[11px] font-bold leading-none text-primary-foreground shadow-md ring-2 ring-background sm:size-7 sm:text-xs ${
          step.anchor === "top"
            ? "left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(100%+3px)]"
            : step.anchor === "bottom"
              ? "bottom-0 left-1/2 -translate-x-1/2 translate-y-[calc(100%+3px)]"
              : step.anchor === "left"
                ? "left-0 top-1/2 -translate-x-[calc(100%+3px)] -translate-y-1/2"
                : "right-0 top-1/2 translate-x-[calc(100%+3px)] -translate-y-1/2"
        }`}
      >
        {number}
      </span>
    </span>
  );
}

/** Légende numérotée : les mêmes numéros que les repères posés sur la capture. */
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
        <StepMarker key={step.label} step={step} number={index + 1} />
      ))}
    </div>
  );
}

export function InstallScreenshots() {
  return (
    <div className="mt-5 border-t border-border pt-5">
      <h4 className="text-base font-semibold">Installation en images</h4>
      <p className="mt-1 text-xs text-muted-foreground">
        Chaque capture porte des encadrés numérotés <span aria-hidden="true">1, 2 et 3</span> : les mêmes numéros que les étapes
        listées sous l’image. Écrans illustrés : la présentation et les intitulés peuvent varier selon la version du téléphone.
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
                  <DialogDescription>Les encadrés numérotés de l’image correspondent aux étapes ci-dessous ; les menus peuvent varier selon votre version.</DialogDescription>
                  <MarkedImage guide={guide} className="rounded-md" />
                  <StepList steps={guide.steps} className="mt-2" />
                </DialogContent>
              </Dialog>
            </figcaption>
            <MarkedImage guide={guide} />
            <StepList steps={guide.steps} className="mt-3" />
          </figure>
        ))}
      </div>
    </div>
  );
}
