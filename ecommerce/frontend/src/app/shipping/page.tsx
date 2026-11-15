import type { Metadata } from 'next';
import LegalPage from '../../components/LegalPage';

export const metadata: Metadata = { title: 'Shipping & returns' };

export default function Shipping() {
  return (
    <LegalPage
      eyebrow="Policies"
      title="Shipping & returns"
      intro="How delivery, payment and cancellations work. Plain language, no small print."
      sections={[
        { h: 'Delivery fees', p: ['Delivery is free on orders over $50. Orders of $50 or less pay a flat $4.99 delivery fee. The fee is shown in your bag and at checkout before you place the order.'] },
        { h: 'Paying on delivery', p: ['Every order is cash on delivery. You pay the courier in cash when the parcel arrives, so please have the exact amount ready. We never ask for card details.'] },
        { h: 'Cancelling an order', p: ['You can cancel an order yourself from the Orders page while it is still pending, and the items return to stock immediately.', 'Once an order is confirmed or shipped, contact us and we will do our best to stop it.'] },
        { h: 'Problems with your order', p: ['If something arrives damaged, incorrect or incomplete, contact us with your order number and a short description. We will arrange a replacement or a refund.'] },
      ]}
    />
  );
}
