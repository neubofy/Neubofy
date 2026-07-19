import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    thumbnailUrl?: string;
    tags?: string[];
    category?: string;
  };
  onListProject?: () => void;
}

export default function ProductCard({ product, onListProject }: ProductCardProps) {

  return (
    <div className="glass-card rounded-2xl overflow-hidden hover:shadow-elevated transition-all duration-500 group">
      <div className="relative">
        <AspectRatio ratio={16/9}>
          <img
            src={product.thumbnailUrl || "/placeholder-project.jpg"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </AspectRatio>
        
        {product.category && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary">{product.category}</Badge>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}