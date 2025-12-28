export interface OrderItem {
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

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  shippingCost: number;
  date: string;
  status: "pending" | "processing" | "shipping" | "delivered" | "rejected" | "completed" | "cancelled";
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  paymentMethod: "QRIS" | "TRANSFER" | "COD" | "DANA" | "GOPAY";
  paymentStatus?: "pending" | "paid" | "failed";
  midtransToken?: string;
  midtransOrderId?: string;
}

export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];
  const orders = localStorage.getItem("orders");
  return orders ? JSON.parse(orders) : [];
}

export function addOrder(
  items: OrderItem[],
  shippingCost: number,
  recipientName: string,
  recipientPhone: string,
  shippingAddress: string,
  paymentMethod: "QRIS" | "TRANSFER" | "COD" | "DANA" | "GOPAY",
  paymentStatus?: "pending" | "paid" | "failed",
  midtransToken?: string,
  midtransOrderId?: string
): Order {
  if (typeof window === "undefined") {
    throw new Error("Cannot add order on server side");
  }

  const orders = getOrders();
  const subtotal = items.reduce(
    (sum, item) => sum + item.product_price * item.quantity,
    0
  );
  const total = subtotal + shippingCost;

  const newOrder: Order = {
    id: `ORDER-${Date.now()}`,
    items,
    subtotal,
    shippingCost,
    total,
    date: new Date().toISOString(),
    status: "pending",
    recipientName,
    recipientPhone,
    shippingAddress,
    paymentMethod,
    paymentStatus: paymentStatus || "pending",
    midtransToken,
    midtransOrderId,
  };

  orders.push(newOrder);
  localStorage.setItem("orders", JSON.stringify(orders));

  // Dispatch event untuk update UI jika diperlukan
  window.dispatchEvent(new Event("ordersUpdated"));

  return newOrder;
}

export function updateOrderStatus(orderId: string, status: Order["status"]) {
  if (typeof window === "undefined") return;

  const orders = getOrders();
  const orderIndex = orders.findIndex((order) => order.id === orderId);

  if (orderIndex >= 0) {
    orders[orderIndex].status = status;
    localStorage.setItem("orders", JSON.stringify(orders));
    window.dispatchEvent(new Event("ordersUpdated"));
  }
}

export function updatePaymentStatus(orderId: string, paymentStatus: "pending" | "paid" | "failed") {
  if (typeof window === "undefined") return;

  const orders = getOrders();
  const orderIndex = orders.findIndex((order) => order.id === orderId);

  if (orderIndex >= 0) {
    orders[orderIndex].paymentStatus = paymentStatus;
    localStorage.setItem("orders", JSON.stringify(orders));
    window.dispatchEvent(new Event("ordersUpdated"));
  }
}

export function updatePaymentStatusByMidtransOrderId(midtransOrderId: string, paymentStatus: "pending" | "paid" | "failed") {
  if (typeof window === "undefined") return;

  const orders = getOrders();
  const orderIndex = orders.findIndex((order) => order.midtransOrderId === midtransOrderId);

  if (orderIndex >= 0) {
    orders[orderIndex].paymentStatus = paymentStatus;
    localStorage.setItem("orders", JSON.stringify(orders));
    window.dispatchEvent(new Event("ordersUpdated"));
  }
}

export function deleteOrder(orderId: string): boolean {
  if (typeof window === "undefined") return false;

  const orders = getOrders();
  const filteredOrders = orders.filter((order) => order.id !== orderId);
  localStorage.setItem("orders", JSON.stringify(filteredOrders));
  window.dispatchEvent(new Event("ordersUpdated"));
  return true;
}

export function onOrdersChange(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("ordersUpdated", callback);
  return () => window.removeEventListener("ordersUpdated", callback);
}

