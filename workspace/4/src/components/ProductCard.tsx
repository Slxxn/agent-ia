import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Card from './ui/Card';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      className="group relative"
    >
      <Card className="relative overflow-hidden bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-4 transition-all duration-300 hover:border-blue-400/50 hover:shadow-[0_0_30px_-5px_#00BFFF] hover:shadow-blue-500/20">
        {/* Image avec effet zoom */}
        <div className="relative overflow-hidden rounded-xl mb-4 aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Contenu */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 backdrop-blur-sm">
              {product.category}
            </Badge>
            <p className="text-lg font-bold text-white drop-shadow-[0_0_10px_rgba(0,191,255,0.3)]">
              {product.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>

          <h3 className="text-base font-semibold text-white/90 truncate">
            {product.name}
          </h3>

          <Button
            variant="primary"
            size="sm"
            className="w-full mt-2 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-400 hover:to-violet-500 transition-all duration-300 shadow-[0_0_15px_-3px_#00BFFF] hover:shadow-[0_0_25px_-5px_#8A2BE2]"
            onClick={handleAddToCart}
          >
            Ajouter au panier
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProductCard;