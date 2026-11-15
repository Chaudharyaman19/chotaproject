import type { Metadata } from 'next';
import LegalPage from '../../components/LegalPage';

export const metadata: Metadata = { title: 'Terms of service' };

export default function Terms() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of service"
      intro="The ground rules for using ShopEasy and placing orders."
      sections={[
        { h: 'Using the site', p: ['You need an account to place an order. Keep your login details private and let us know if you suspect someone else has used them.'] },
        { h: 'Orders & pricing', p: ['Prices and availability can change without notice. An order is accepted when we confirm it, and we may cancel an order if an item is unavailable or a price was listed in error, in which case you will not be charged.'] },
        { h: 'Payment', p: ['Orders are paid in cash on delivery. Refusing a delivery without a valid reason may affect your ability to place future orders.'] },
        { h: 'Returns & cancellations', p: ['See the shipping & returns page for how cancellations and problems with an order are handled.'] },
        { h: 'Liability', p: ['We take care to describe products accurately, but to the extent allowed by law we are not liable for indirect or consequential losses arising from use of the site.'] },
      ]}
    />
  );
}
