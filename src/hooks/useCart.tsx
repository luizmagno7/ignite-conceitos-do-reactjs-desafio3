import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');
    
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const cartModified = [...cart];
      const cartItem = cartModified.find(item => item.id === productId);

      const { data: productStock } = await api.get(`/stock/${productId}`);

      if (!cartItem) {
        const { data: productItem } = await api.get(`/products/${productId}`);

        productItem['amount'] = 1;

        cartModified.push(productItem);

        setCart(cartModified)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartModified))
        
        return;
      }

      if (cartItem.amount >= productStock.amount) {
        toast.error('Quantidade solicitada fora de estoque');

        return;
      }
      
      cartItem.amount++;      
      
      setCart(cartModified)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartModified))

    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const cartModified = [...cart];

      const removeItemIndex = cartModified.findIndex(cartItem => cartItem.id === productId);

      cartModified.splice(removeItemIndex);

      setCart(cartModified);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartModified));
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const cartModified = [...cart];

      const { data: productStock } = await api.get(`/stock/${productId}`);

      if (amount >= productStock.amount) {
        toast.error('Quantidade solicitada fora de estoque');

        return;
      }

      const cartItem = cartModified.find( item => item.id == productId);

      if (cartItem) {
        cartItem.amount = amount;
      }

      setCart(cartModified);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartModified));

    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
