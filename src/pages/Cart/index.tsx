import React from 'react';
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';
import { Product } from './../../types';
import { Redirect } from 'react-router-dom';


interface ProductFormatted extends Product {
  priceFormatted: string;
  subtotal: string;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  if (!cart.length) {
    return <Redirect to="/" />
  }

  const cartFormatted = cart.map(product => ({  
    ...product,
    priceFormatted: formatPrice(product?.price),
    subtotal: formatPrice(product?.price * product?.amount)
  }))

  const total =
    formatPrice(
      cart.reduce((sumTotal, product) => {
        sumTotal += product.price * product.amount;

        return sumTotal;
      }, 0)
    )

  function handleProductIncrement(productId: number, amount: number) {
    const incrementAmount = amount + 1;
    
    updateProductAmount({productId, amount: incrementAmount})
  }

  function handleProductDecrement(productId: number, amount: number) {
    const decrementAmount = amount - 1;

    updateProductAmount({productId, amount: decrementAmount})
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId)
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cartFormatted.map( ({ id, title, image, subtotal, amount, priceFormatted }:ProductFormatted) => (
            <tr data-testid="product">
              <td>
                <img src={image} alt={title} />
              </td>
              <td>
                <strong>{title}</strong>
                <span>{priceFormatted}</span>
              </td>
              <td>
                <div>
                  <button
                    type="button"
                    data-testid="decrement-product"
                    disabled={amount <= 1}
                    onClick={() => handleProductDecrement(id, amount)}
                  >
                    <MdRemoveCircleOutline size={20} />
                  </button>
                  <input
                    type="text"
                    data-testid="product-amount"
                    readOnly
                    value={amount}
                  />
                  <button
                    type="button"
                    data-testid="increment-product"
                    onClick={() => handleProductIncrement(id, amount)}
                  >
                    <MdAddCircleOutline size={20} />
                  </button>
                </div>
              </td>
              <td>
                <strong>{subtotal}</strong>
              </td>
              <td>
                <button
                  type="button"
                  data-testid="remove-product"
                  onClick={() => handleRemoveProduct(id)}
                >
                  <MdDelete size={20} />
                </button>
              </td>
            </tr>
          ) )}
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
