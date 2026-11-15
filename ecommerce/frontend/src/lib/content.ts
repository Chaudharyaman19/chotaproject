/** Editable storefront copy. Policy wording here is a sensible default: confirm it matches how you actually operate. */

export const CATEGORY_BLURBS: Record<string, string> = {
  Clothing: 'Tees, shirts, dresses and everyday layers in fabrics that feel as good as they look.',
  Footwear: 'Sneakers, heels and trainers built for the miles between here and there.',
  Accessories: 'Watches, bags, eyewear and jewellery. The small things that finish a look.',
  Electronics: 'Phones, laptops, tablets and the accessories that keep them running.',
  Beauty: 'Fragrance, skincare and cosmetics from brands worth the shelf space.',
  'Home & Living': 'Furniture, décor and kitchen tools to make a space feel like yours.',
  Sports: 'Balls, bats and gear for the weekend game and everything after.',
};

export const FAQ: { q: string; a: string }[] = [
  { q: 'How does payment work?', a: 'Every order is cash on delivery. You place the order, we deliver it, and you pay the courier in cash when it arrives. No card details are ever requested.' },
  { q: 'How much is delivery?', a: 'Delivery is free on orders over $50. Below that, a flat $4.99 fee applies, and it is always shown in your bag before you check out.' },
  { q: 'Can I cancel an order?', a: 'Yes. While an order is still pending you can cancel it yourself from the Orders page, and the stock goes straight back on the shelf. Once it is confirmed or shipped, contact us and we will help.' },
  { q: 'What if something arrives damaged or wrong?', a: 'Tell us through the contact page with your order number and we will arrange a replacement or refund. Please check the parcel in front of the courier where you can.' },
  { q: 'Do I need an account to order?', a: 'You need a free account to check out, so you can track and manage your orders. Browsing and filling your bag works without one.' },
  { q: 'Is the stock level accurate?', a: 'Stock is tracked live and reserved when you place an order. If an item sells out it is marked as sold out, and low stock is flagged on the product.' },
  { q: 'How do I contact you?', a: 'Use the contact page and we will reply by email. For order questions, include your order number so we can find it quickly.' },
];
