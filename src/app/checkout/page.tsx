import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
    return (
        <div className="checkout-page">
            <div className="breadcrumb-block py-5 bg-zinc-50">
                <div className="container mx-auto">
                    <div className="flex items-center gap-1 caption1">
                        <a href="/">Home</a>
                        <i className="ph ph-caret-right text-xs"></i>
                        <a href="/cart">Cart</a>
                        <i className="ph ph-caret-right text-xs"></i>
                        <div className="text-secondary2 capitalize">Checkout</div>
                    </div>
                </div>
            </div>

            <CheckoutClient />
        </div>
    );
}
