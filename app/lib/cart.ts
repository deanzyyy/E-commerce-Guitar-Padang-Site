export interface CartItem {
  id_product: number;
  product_name: string;
  product_price: number;
  Category: string;
  category?: string;
  description: string | null;
  image: string | null;
  quantity: number;
  type: "product" | "aksesoris";
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const cart = localStorage.getItem("cart");
  return cart ? JSON.parse(cart) : [];
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity: number = 1) {
  if (typeof window === "undefined") return;
  
  const cart = getCart();
  const existingItemIndex = cart.findIndex(
    (cartItem) => cartItem.id_product === item.id_product && cartItem.type === item.type
  );

  if (existingItemIndex >= 0) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({ ...item, quantity });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  // Dispatch custom event untuk update navbar
  window.dispatchEvent(new Event("cartUpdated"));
}

export function removeFromCart(id_product: number, type: "product" | "aksesoris") {
  if (typeof window === "undefined") return;
  
  const cart = getCart();
  const filteredCart = cart.filter(
    (item) => !(item.id_product === id_product && item.type === type)
  );
  localStorage.setItem("cart", JSON.stringify(filteredCart));
  window.dispatchEvent(new Event("cartUpdated"));
}

export function updateCartQuantity(id_product: number, type: "product" | "aksesoris", quantity: number) {
  if (typeof window === "undefined") return;
  
  const cart = getCart();
  const itemIndex = cart.findIndex(
    (item) => item.id_product === id_product && item.type === type
  );

  if (itemIndex >= 0) {
    if (quantity <= 0) {
      removeFromCart(id_product, type);
    } else {
      cart[itemIndex].quantity = quantity;
      localStorage.setItem("cart", JSON.stringify(cart));
    }
    window.dispatchEvent(new Event("cartUpdated"));
  }
}

export function getCartCount(): number {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

export function clearCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("cart");
  window.dispatchEvent(new Event("cartUpdated"));
}

export function onCartChange(callback: (count: number) => void) {
  if (typeof window === "undefined") return () => {};

  const handleCartUpdate = () => {
    callback(getCartCount());
  };

  window.addEventListener("cartUpdated", handleCartUpdate);
  return () => window.removeEventListener("cartUpdated", handleCartUpdate);
}

