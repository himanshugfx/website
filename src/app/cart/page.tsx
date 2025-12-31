import CartClient from "./CartClient";

export default function CartPage() {
    return (
        <div className="cart-page">
            <div className="breadcrumb-block py-5 bg-zinc-50">
                <div className="container mx-auto">
                    <div className="flex items-center gap-1 caption1">
                        <a href="/">Home</a>
                        <i className="ph ph-caret-right text-xs"></i>
                        <div className="text-secondary2 capitalize">Shopping Cart</div>
                    </div>
                </div>
            </div>

            <CartClient />
        </div>
    );
}
