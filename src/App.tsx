import React, { Suspense } from 'react';
import './styles/index.css';

const HeroSection = React.lazy(() => import('./components/HeroSection'));

const App: React.FC = () => {
  return (
    <div>
      <Suspense fallback={<div>Cargando...</div>}>
        <HeroSection />
      </Suspense>
    </div>
  );
};

export default App;