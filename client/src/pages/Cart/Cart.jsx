import * as React from "react";
 
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
 
const Cart = () => {
    const initialItems = [
        {
            image: "https://cdn.builder.io/api/v1/image/assets/TEMP/a370c297cc5f9039f066684c7dda53607b99faef47615f270fa3fedd33d79f07",
            description: "MSI MEG Trident X 10SD-1012AU Intel i7 10700K, 2070 SUPER, 32GB RAM, 1TB SSD, Windows 10 Home, Gaming Keyboard and Mouse 3 Years Warranty",
            price: "4,349.00",
            quantity: 3
        }
    ];

    const [cartItems, setCartItems] = React.useState(initialItems);

    const updateQuantity = (description, newQuantity) => {
        const updatedItems = cartItems.map((item) =>
            item.description === description ? { ...item, quantity: newQuantity } : item
        );
        setCartItems(updatedItems);
    };

    const removeItem = (description) => {
        setCartItems(cartItems.filter((item) => item.description !== description));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const subtotal = cartItems.reduce((acc, item) => acc + item.quantity * parseFloat(item.price.replace(",", "")), 0);
    const shipping = 21.0; // Example static value
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + shipping + tax;

    return (
        <div className="bg-white d-flex flex-column overflow-hidden">
            <div className="container mt-4">
                <span>Home</span> <span>›</span> <span>Cart</span>
                <h1 className="fw-bold">Shopping Cart</h1>
                <div className="row mt-4">
                    <div className="col-lg-8">
                        <div className="d-flex fw-bold align-items-center mt-4">
                            <div style={{ flex: 2, textAlign: "left" }}>Item</div>
                            <div style={{
                                flex: 1,
                                // textAlign: "center",
                                paddingLeft: '48px'
                            }}>Price</div>
                            <div style={{
                                flex: 1,
                                // textAlign: "center"
                            }}>Qty</div>
                            <div style={{
                                flex: 1,
                                // textAlign: "center"
                            }}>Subtotal</div>
                        </div>

                        {cartItems.map((item, index) => (
                            <CartItem
                                key={index}
                                {...item}
                                onQuantityChange={updateQuantity}
                                onRemove={() => removeItem(item.description)}
                            />
                        ))}

                        <div className="d-flex justify-content-between mt-4">
                            <button className="btn btn-outline-secondary">Continue Shopping</button>
                            <button className="btn btn-dark" onClick={clearCart}>Clear Shopping Cart</button>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <CartSummary subtotal={subtotal} shipping={shipping} tax={tax} total={total} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
