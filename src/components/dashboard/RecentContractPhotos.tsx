
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Expand, Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ContractPhoto {
  id: string;
  photo_url: string;
  photo_thumbnail_url: string;
  created_at: string;
  client: {
    name: string;
  };
}

export function RecentContractPhotos() {
  const [selectedPhoto, setSelectedPhoto] = useState<ContractPhoto | null>(null);
  console.log("Iniciando componente RecentContractPhotos");

  const { data: photos, isLoading } = useQuery({
    queryKey: ["recent-contract-photos"],
    queryFn: async () => {
      console.log("Buscando fotos recentes");
      const { data, error } = await supabase
        .from("sales")
        .select(`
          id,
          photo_url,
          photo_thumbnail_url,
          created_at,
          client:client_id (
            name
          )
        `)
        .not("photo_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) {
        console.error("Erro ao buscar fotos:", error);
        throw error;
      }

      console.log("Fotos recuperadas:", data);
      return data as ContractPhoto[];
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Contratos Recentes</h3>
        <div className="grid grid-cols-2 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-muted rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Contratos Recentes</h3>
      <div className="grid grid-cols-2 gap-4">
        {photos?.map((photo) => (
          <div
            key={photo.id}
            className="relative group aspect-square bg-muted rounded-lg overflow-hidden"
          >
            <img
              src={photo.photo_thumbnail_url || photo.photo_url}
              alt={`Contrato de ${photo.client?.name}`}
              className="object-cover w-full h-full"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setSelectedPhoto(photo)}
              >
                <Expand className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl">
          <div className="space-y-4">
            <div className="aspect-[4/3] relative bg-muted rounded-lg overflow-hidden">
              <img
                src={selectedPhoto?.photo_url}
                alt={`Contrato de ${selectedPhoto?.client?.name}`}
                className="object-contain w-full h-full"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{selectedPhoto?.client?.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedPhoto?.created_at && format(
                    new Date(selectedPhoto.created_at),
                    "PPP 'às' HH:mm",
                    { locale: ptBR }
                  )}
                </p>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                asChild
              >
                <a
                  href={selectedPhoto?.photo_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
