import { ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import safariImage from "@/assets/install-safari-iphone.jpg";
import chromeImage from "@/assets/install-chrome-android.jpg";

const GUIDES = [
  {
    title: "iPhone · Safari",
    image: safariImage,
    alt: "Safari sur iPhone : icône Partager, option Sur l’écran d’accueil, puis bouton Ajouter.",
    steps: ["Ouvrez l’application dans Safari et touchez Partager (carré avec une flèche vers le haut).", "Faites défiler le menu et choisissez « Sur l’écran d’accueil ».", "Confirmez avec « Ajouter » ; l’icône apparaît sur votre écran d’accueil."],
  },
  {
    title: "Android · Chrome",
    image: chromeImage,
    alt: "Chrome sur Android : menu à trois points, Ajouter à l’écran d’accueil, puis Installer.",
    steps: ["Ouvrez l’application dans Chrome et touchez le menu ⋮ en haut à droite.", "Choisissez « Ajouter à l’écran d’accueil » ou « Installer l’application », selon votre version.", "Touchez « Installer » et confirmez si une étape supplémentaire est proposée."],
  },
];

export function InstallScreenshots() {
  return (
    <div className="mt-5 border-t border-border pt-5">
      <h4 className="text-base font-semibold">Installation en images</h4>
      <p className="mt-1 text-xs text-muted-foreground">Écrans illustrés : la présentation et les intitulés peuvent varier selon la version du téléphone.</p>
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
                  <DialogDescription>Écrans illustrés ; les menus peuvent varier selon votre version.</DialogDescription>
                  <img src={guide.image} alt={guide.alt} width={1536} height={1024} loading="lazy" className="h-auto w-full rounded-md" />
                  <ol className="list-decimal space-y-2 pl-5 text-sm">{guide.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                </DialogContent>
              </Dialog>
            </figcaption>
            <img src={guide.image} alt={guide.alt} width={1536} height={1024} loading="lazy" className="h-auto w-full rounded-md border border-border" />
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">{guide.steps.map((step) => <li key={step}>{step}</li>)}</ol>
          </figure>
        ))}
      </div>
    </div>
  );
}