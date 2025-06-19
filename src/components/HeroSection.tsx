import React from 'react';

// import { ArrowRightIcon } from '@heroicons/react/24/solid';
// import './HeroSection.css';

const HeroSection: React.FC = () => {
  return (
    <div className="hero">
      <div className="video-background">
        <video autoPlay loop muted>
          <source src="multimedia/videodefondo.mp4" type="video/mp4" />
          Tu navegador no soporta la etiqueta de video.
        </video>
      </div>
      <div className="content">
        <h1 className="text-4xl font-bold mb-4">Bienvenido a la Página Principal</h1>
        <p className="text-lg mb-6">Explora el poder de React, TypeScript y Heroicons.</p>
        <button className="bg-blue-500 text-white px-4 py-2 rounded flex items-center">
          Comenzar
          <ArrowRightIcon className="h-5 w-5 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default HeroSection;