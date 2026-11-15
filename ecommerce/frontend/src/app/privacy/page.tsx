import type { Metadata } from 'next';
import LegalPage from '../../components/LegalPage';

export const metadata: Metadata = { title: 'Privacy policy' };

export default function Privacy() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy policy"
      intro="What we collect, why we collect it, and what we do with it."
      sections={[
        { h: 'What we collect', p: ['Account details you give us (name, email, a hashed password), the delivery details you enter at checkout (name, phone, address), your order history, and messages you send through the contact form or newsletter signup.'] },
        { h: 'How we use it', p: ['To create and secure your account, process and deliver your orders, answer your messages, and, only if you subscribed, send the occasional newsletter. We do not sell your data.'] },
        { h: 'Cookies & storage', p: ['We store your sign-in session, your bag and your theme preference in your browser’s local storage so the site works the way you left it. We do not use advertising trackers.'] },
        { h: 'Your choices', p: ['You can ask us to correct or delete your account and order data, and you can unsubscribe from the newsletter at any time, by contacting us.'] },
        { h: 'Contact', p: ['Questions about this policy? Use the contact page and we will get back to you.'] },
      ]}
    />
  );
}
