import React from 'react';
import { useCart } from '../stores/cartStore';
import { Sheet } from './ui/Sheet';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';

const CartSidebar: React.FC = () => {
  const { isOpen, closeCart, items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();

  return (
    <Sheet isOpen={isOpen} onClose={closeCart}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Votre Panier</h2>
            <Badge variant="secondary" className="ml-1">{totalItems}</Badge>
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Fermer le panier"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">Votre panier est vide</p>
              <p className="text-sm text-gray-400 mt-1">Ajoutez des produits pour commencer</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
                {/* Image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{item.product.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{item.product.price.toFixed(2)} €</p>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="p-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Diminuer la quantité"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 rounded border border-gray-200 hover:bg-gray-50"
                      aria-label="Augmenter la quantité"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Remove button */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="p-1 rounded hover:bg-red-50 transition-colors"
                    aria-label="Retirer du panier"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                  <p className="text-sm font-semibold text-gray-900">
                    {(item.product.price * item.quantity).toFixed(2)} €
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-gray-900">Total</span>
              <span className="text-lg font-bold text-indigo-600">{totalPrice.toFixed(2)} €</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={clearCart}
              >
                Vider le panier
              </Button>
              <Button className="flex-1">
                Commander
              </Button>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
};

export { CartSidebar };
export default CartSidebar;