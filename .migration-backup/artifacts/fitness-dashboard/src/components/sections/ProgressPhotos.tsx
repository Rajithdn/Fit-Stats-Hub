import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Trash2, ChevronLeft, ChevronRight, ImagePlus, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProgressPhoto {
  id: string;
  date: string;
  label: string;
  src: string;
}

const LABELS = ["Front", "Side", "Back"];

export function ProgressPhotos() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [selectedLabel, setSelectedLabel] = useState("Front");
  const [compareIdx, setCompareIdx] = useState<[number, number] | null>(null);
  const [lightbox, setLightbox] = useState<ProgressPhoto | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please choose an image under 10 MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const today = new Date().toISOString().split("T")[0];
      const newPhoto: ProgressPhoto = {
        id: `${Date.now()}`,
        date: today,
        label: selectedLabel,
        src: reader.result as string,
      };
      setPhotos(prev => [newPhoto, ...prev]);
      toast({ title: "Photo added!", description: `${selectedLabel} photo for ${today} saved.` });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function removePhoto(id: string) {
    setPhotos(prev => prev.filter(p => p.id !== id));
    toast({ title: "Photo removed" });
  }

  const byLabel = LABELS.reduce<Record<string, ProgressPhoto[]>>((acc, l) => {
    acc[l] = photos.filter(p => p.label === l);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Upload card */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" /> Add Progress Photo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex gap-2">
              {LABELS.map(l => (
                <button
                  key={l}
                  onClick={() => setSelectedLabel(l)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedLabel === l
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <Button onClick={() => fileRef.current?.click()} className="flex items-center gap-2">
              <ImagePlus className="w-4 h-4" /> Upload {selectedLabel} Photo
            </Button>
            <p className="text-xs text-muted-foreground">JPG, PNG or WebP · Max 10 MB</p>
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
        </CardContent>
      </Card>

      {/* Empty state */}
      {photos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Camera className="w-10 h-10 text-primary/40" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No progress photos yet</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Upload your first front, side, or back photo to start tracking your transformation journey.
          </p>
        </div>
      )}

      {/* Photos by label */}
      {photos.length > 0 && LABELS.map(label => {
        const group = byLabel[label];
        if (group.length === 0) return null;
        return (
          <Card key={label} className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{label} View</CardTitle>
                <span className="text-xs text-muted-foreground">{group.length} photo{group.length > 1 ? "s" : ""}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {group.map(photo => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group relative aspect-[3/4] rounded-xl bg-muted border border-border cursor-pointer isolate"
                    style={{ overflow: "hidden" }}
                    onClick={() => setLightbox(photo)}
                  >
                    <img src={photo.src} alt={`${photo.label} ${photo.date}`} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-end justify-between p-2 z-10">
                      <button
                        onClick={e => { e.stopPropagation(); removePhoto(photo.id); }}
                        className="flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-red-500 text-white text-xs hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <div className="flex items-center gap-1 text-white/80 text-xs w-full">
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span className="truncate">{photo.date}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Compare panel — show if 2+ photos total */}
      {photos.length >= 2 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Before & After Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Click any two photos to compare them side by side.</p>
            <CompareSelector photos={photos} />
          </CardContent>
        </Card>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-md w-full bg-card rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <img src={lightbox.src} alt={lightbox.label} className="w-full object-cover max-h-[60vh]" />
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{lightbox.label} View</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" /> {lightbox.date}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" onClick={() => { removePhoto(lightbox.id); setLightbox(null); }}>
                    <Trash2 className="w-4 h-4 mr-1" /> Remove
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setLightbox(null)}>Close</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CompareSelector({ photos }: { photos: ProgressPhoto[] }) {
  const [a, setA] = useState<ProgressPhoto | null>(null);
  const [b, setB] = useState<ProgressPhoto | null>(null);

  function select(photo: ProgressPhoto) {
    if (!a) { setA(photo); return; }
    if (a.id === photo.id) { setA(null); return; }
    if (!b) { setB(photo); return; }
    if (b.id === photo.id) { setB(null); return; }
    setB(photo);
  }

  const isSelected = (id: string) => a?.id === id || b?.id === id;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {photos.map(photo => (
          <button
            key={photo.id}
            onClick={() => select(photo)}
            className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
              isSelected(photo.id) ? "border-primary scale-95" : "border-transparent hover:border-border"
            }`}
          >
            <img src={photo.src} alt={photo.label} className="w-full h-full object-cover" />
            {isSelected(photo.id) && (
              <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                {a?.id === photo.id ? "A" : "B"}
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] text-center py-0.5">
              {photo.label} · {photo.date.slice(5)}
            </div>
          </button>
        ))}
      </div>

      {a && b && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-4 mt-2">
          {[{ photo: a, label: "Before" }, { photo: b, label: "After" }].map(({ photo, label }) => (
            <div key={photo.id} className="space-y-2">
              <p className="text-sm font-semibold text-center text-muted-foreground">{label}</p>
              <div className="aspect-[3/4] rounded-xl overflow-hidden border border-border">
                <img src={photo.src} alt={label} className="w-full h-full object-cover" />
              </div>
              <p className="text-xs text-center text-muted-foreground">{photo.label} · {photo.date}</p>
            </div>
          ))}
        </motion.div>
      )}

      {(a || b) && !(a && b) && (
        <p className="text-xs text-muted-foreground text-center">Select one more photo to compare</p>
      )}
    </div>
  );
}
