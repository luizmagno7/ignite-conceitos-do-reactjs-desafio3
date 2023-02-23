import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { useQuery } from 'react-query';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';
import { Product } from '../../types';

// interface Product {
//   id: number;
//   title: string;
//   price: number;
//   image: string;
// }

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  // const [products, setProducts] = useState<ProductFormatted[]>([]);

  const { isLoading, error, data: products } = useQuery('listProducts', async () =>
    await fetch('http://localhost:3333/products').then(res =>
      res.json()
    ).then(res => {
      const modifiedData = res.map((product: ProductFormatted) => ({
        ...product,
        priceFormatted: formatPrice(product.price)
      }))

      return modifiedData;
    }), {
    initialData: [],
  })

  const { addProduct, cart } = useCart();

  console.info("[Carrinho]", cart)

  const cartItemsAmount = cart.reduce((sumAmount, { id, amount }:Product) => {
    const sumAmountItems = {...sumAmount}

    sumAmountItems[id] = amount;

    return sumAmountItems;
  }, {} as CartItemsAmount)

  // useEffect(() => {
  //   async function loadProducts() {
  //     // TODO
  //   }

  //   loadProducts();
  // }, []);

  function handleAddProduct(id: number) {
    addProduct(id);
  }

  return (
    <ProductList>
      {products?.map(({ id, image, title, price, priceFormatted }: ProductFormatted) => (
        <li key={`product-item-${id}`}>
          <img src={image} alt={`Imagem ilustrativa do produto ${title}`} />
          <strong>{title}</strong>
          <span>{priceFormatted}</span>
          <button
            type="button"
            data-testid="add-product-button"
            onClick={() => handleAddProduct(id)}
          >
            <div data-testid="cart-product-quantity">
              <MdAddShoppingCart size={16} color="#FFF" />
              {cartItemsAmount[id] || 0}
            </div>

            <span>ADICIONAR AO CARRINHO</span>
          </button>
        </li>
      ))}
    </ProductList>
  );
};

export default Home;
