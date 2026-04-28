import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '@/components/ui/Button';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-9xl font-bold text-purple-500 mb-4">404</h1>
      <h2 className="text-3xl font-semibold mb-2">Page introuvable</h2>
      <p className="text-gray-400 mb-8 max-w-md">
        Oups ! La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <Link to="/">
        <Button variant="primary" size="lg">
          <Home className="w-5 h-5 mr-2" />
          Retour à l'accueil
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;