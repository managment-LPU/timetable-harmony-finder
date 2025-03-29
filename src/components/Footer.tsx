
import React from 'react';
import { Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-12 py-6 border-t">
      <div className="container mx-auto flex justify-center items-center">
        <a 
          href="https://github.com/Amanlabh" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
        >
          <Github size={20} />
          <span>Aman Labh</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
