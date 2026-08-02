import React from 'react';
import { useApp } from '../store/useApp';
import { HeroSection } from '../features/landing/components/HeroSection';
import { FeaturesSection } from '../features/landing/components/FeaturesSection';
import { ServicesSection } from '../features/landing/components/ServicesSection';
import { PromoSection } from '../features/landing/components/PromoSection';
import { BarbersSection } from '../features/landing/components/BarbersSection';
import { GallerySection } from '../features/landing/components/GallerySection';
import { FooterSection } from '../features/landing/components/FooterSection';

interface LandingPageProps {
  onStartBooking: () => void;
  onOpenLogin: () => void;
  onOpenPrivacy: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartBooking, onOpenLogin, onOpenPrivacy }) => {
  const { config, barbers, services, galleryPhotos } = useApp();

  const activeServices = services
    .filter(s => s.active !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Group services by category
  const categories = Array.from(new Set(activeServices.map(s => s.category))) as string[];

  const activeBarbers = barbers
    .filter(b => b.active)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans">
      <HeroSection 
        config={config} 
        onStartBooking={onStartBooking} 
        onOpenLogin={onOpenLogin} 
      />
      <FeaturesSection />
      <ServicesSection 
        categories={categories} 
        activeServices={activeServices} 
        onStartBooking={onStartBooking} 
      />
      <PromoSection onStartBooking={onStartBooking} />
      <BarbersSection 
        activeBarbers={activeBarbers} 
        onStartBooking={onStartBooking} 
      />
      <GallerySection galleryPhotos={galleryPhotos} config={config} />
      <FooterSection config={config} onOpenPrivacy={onOpenPrivacy} />
    </div>
  );
};
