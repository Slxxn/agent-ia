import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Share2, Heart, Star, Check, Shield, Truck, RotateCcw } from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { formatPrice, whatsappLink } from '../lib/utils';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Produit non trouvé</h1>
          <Link
            to="/products"
            className="text-violet-600 hover:text-violet-700 font-medium"
          >
            Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images || [product.image];
  const rating = product.rating || 4.5;
  const reviews = product.reviews || 0;

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWhatsApp = () => {
    const message = `Bonjour TECH-UP Antilles ! Je souhaite commander :\n\n${product.name}\nQuantité : ${quantity}\nPrix : ${formatPrice(product.price * quantity)}\n\nMerci de me contacter pour finaliser la commande.`;
    window.open(whatsappLink('+596696053363', message), '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pt-24 pb-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-violet-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au catalogue
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Galerie d'images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-4">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <div className="absolute top-4 left-4">
                  <Badge variant="primary">{product.badge}</Badge>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      index === selectedImage
                        ? 'border-violet-600 ring-2 ring-violet-600/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Informations produit */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col"
          >
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="secondary">{product.category}</Badge>
                {product.inStock && (
                  <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
                    <Check className="w-4 h-4" />
                    En stock
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-600">
                  {rating} ({reviews} avis)
                </span>
              </div>
              <p className="text-3xl font-bold text-violet-600 mb-6">
                {formatPrice(product.price)}
              </p>
              <p className="text-slate-600 leading-relaxed mb-8">
                {product.description}
              </p>
            </div>

            {/* Caractéristiques */}
            {product.features && product.features.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-slate-900 mb-3">Caractéristiques</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-600">
                      <Check className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantité et actions */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-700">Quantité</span>
                <div className="flex items-center border border-slate-200 rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-medium text-slate-900 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAddToCart}
                  className="flex-1"
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-5 h-5" />
                      Ajouté au panier
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Ajouter au panier
                    </>
                  )}
                </Button>
                <Button
                  variant="whatsapp"
                  size="lg"
                  onClick={handleWhatsApp}
                  className="flex-1"
                >
                  Commander sur WhatsApp
                </Button>
              </div>
            </div>

            {/* Garanties */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
              <div className="text-center">
                <Truck className="w-5 h-5 text-violet-600 mx-auto mb-2" />
                <p className="text-xs text-slate-600">Livraison rapide</p>
              </div>
              <div className="text-center">
                <Shield className="w-5 h-5 text-violet-600 mx-auto mb-2" />
                <p className="text-xs text-slate-600">Produits garantis</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-5 h-5 text-violet-600 mx-auto mb-2" />
                <p className="text-xs text-slate-600">Retours faciles</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetail;