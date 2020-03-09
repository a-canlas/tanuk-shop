import React from 'react';

function CartSummaryItem(props) {
  return (
    <div className="row cartSummaryItem mx-5 my-2">
      <div className="col-12 col-sm-12 col-md-3">
        <img src={props.image} />
      </div>
      <div className="col-12 col-sm-11 col-md-7">
        <h4>{props.productName}</h4>
        <p className="text-muted">$ {(props.price / 100).toFixed(2)}</p>
        <p>{props.description}</p>
        <div>Quantity: <span>{props.quantity}</span> <button className="btn btn-sm btn-outline-success"><i className="fas fa-plus" /></button> <button className="btn btn-sm btn-outline-success" onClick={() => props.removeItem(props.id)}><i className="fas fa-minus"/></button></div>
      </div>
    </div>
  );
}

export default CartSummaryItem;
