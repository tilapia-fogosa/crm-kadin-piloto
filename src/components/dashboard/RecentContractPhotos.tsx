
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Expand, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut,
  Calendar 
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [page, setPage] = useState(1);
  const [timeFilter, setTimeFilter] = useState("week");
  const [zoomLevel, setZoomLevel] = useState(1);
  const itemsPerPage = 4;
  
  console.log("Iniciando componente RecentContractPhotos", { page, timeFilter });

  const { data, isLoading } = useQuery({
    queryKey: ["recent-contract-photos", page, timeFilter],
    queryFn: async () => {
      console.log("Buscando fotos recentes", { page, timeFilter });
      
      let query = supabase
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
        .order("created_at", { ascending: false });

      // Aplicar filtro de tempo
      const now = new Date();
      switch (timeFilter) {
        case "today":
          query = query.gte("created_at", format(now, "yyyy-MM-dd"));
          break;
        case "week":
          const lastWeek = new Date(now.setDate(now.getDate() - 7));
          query = query.gte("created_at", lastWeek.toISOString());
          break;
        case "month":
          const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
          query = query.gte("created_at", lastMonth.toISOString());
          break;
      }

      // Aplicar paginação
      query = query
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1)
        .limit(itemsPerPage);

      const { data: photos, error } = await query;

      if (error) {
        console.error("Erro ao buscar fotos:", error);
        throw error;
      }

      console.log("Fotos recuperadas:", photos);
      return {
        photos: photos as ContractPhoto[],
        currentPage: page
      };
    },
  });

  const handleNextPage = () => {
    if (data?.photos.length === itemsPerPage) {
      setPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

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
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 col-span-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Contratos Recentes</h3>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Última Semana</SelectItem>
            <SelectItem value="month">Último Mês</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {data?.photos.map((photo) => (
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
                onClick={() => {
                  setSelectedPhoto(photo);
                  setZoomLevel(1);
                }}
              >
                <Expand className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevPage}
          disabled={page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          Página {page}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextPage}
          disabled={data?.photos.length !== itemsPerPage}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <div className="space-y-4">
            <div className="aspect-[4/3] relative bg-muted rounded-lg overflow-hidden">
              <img
                src={selectedPhoto?.photo_url}
                alt={`Contrato de ${selectedPhoto?.client?.name}`}
                className="object-contain w-full h-full transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})` }}
              />
              <div className="absolute bottom-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
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
