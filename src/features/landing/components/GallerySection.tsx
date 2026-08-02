import React from 'react';
import { Camera, Instagram } from 'lucide-react';
import { GalleryPhoto, BarbershopConfig } from '../../../types';

interface GallerySectionProps {
  galleryPhotos: GalleryPhoto[];
  config: BarbershopConfig;
}

/**
 * Galeria de cortes realizados, exibida na home. Fotos vêm do upload feito
 * pelo admin (painel > Galeria) — ver AdminGalleryTab e migration
 * 0008_gallery_photos. A seção some por completo quando não há nenhuma
 * foto cadastrada, para não deixar um espaço vazio na página.
 */
export const GallerySection: React.FC<GallerySectionProps> = ({ galleryPhotos, config }) => {
  if (galleryPhotos.length === 0) return null;

  const instagramUrl = config.socialLinks?.instagram;

  return (
    <section id="gallery-section" className="py-24 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Camera size={12} className="text-indigo-600" /> NOSSOS TRABALHOS
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 font-sans tracking-tight">
            Cortes Realizados
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-4 leading-relaxed">
            Alguns dos trabalhos feitos aqui na barbearia.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {galleryPhotos.slice(0, 12).map(photo => (
            <div
              key={photo.id}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-200 shadow-sm"
            >
              <img
                src={photo.imageUrl}
                alt={photo.caption || 'Corte realizado na barbearia'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              {photo.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-semibold line-clamp-2">{photo.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {instagramUrl && (
          <div className="text-center mt-10">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98]"
            >
              <Instagram size={16} /> Ver mais no Instagram
            </a>
          </div>
        )}
      </div>
    </section>
  );
};
