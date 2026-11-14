export interface InfoSection {
  title: string;
  body?: string[];
  bullets?: string[];
  icon?: 'location' | 'shipping' | 'payment' | 'processing' | 'delivery' | 'tracking'
    | 'hanger' | 'heart' | 'sparkle' | 'damaged' | 'exchange' | 'whatsapp' | 'not-eligible'
    | 'bust' | 'waist' | 'hips' | 'size-tip' | 'personal-info' | 'privacy-cart' | 'sharing'
    | 'privacy-shield' | 'privacy-contact' | 'price-tag' | 'orders' | 'product-info' | 'terms-law' | 'terms-change';
}
export interface InfoPageContent {
  slug: string; eyebrow: string; title: string; intro: string;
  sections: InfoSection[]; showUpdated?: boolean;
  help: { title: string; text: string };
}

export const INFO_PAGES: Record<string, InfoPageContent> = {
  shipping: {
    slug: 'shipping', eyebrow: 'Shipping information', title: 'Shipping & Delivery',
    intro: 'Shipping availability and charges depend on your delivery pincode and the courier services available there.',
    sections: [
      { title: 'Where we deliver', icon: 'location', body: ['We deliver across India, subject to courier service availability at your pincode.'] },
      { title: 'Shipping charges', icon: 'shipping', body: ['Charges are based on your delivery location. Enter your pincode in the bag to see the exact charge and the expected delivery date before you order.', 'When your bag qualifies, delivery is free. The bag shows how much more you need to add.'] },
      { title: 'Payment', icon: 'payment', body: ['Choose cash on delivery or online payment. For online payment, send your order message on WhatsApp and we will reply with a QR code.'] },
      { title: 'Order processing', icon: 'processing', body: ['Orders are packed within about one business day of being placed. We may contact you if we need more information.'] },
      { title: 'Delivery time', icon: 'delivery', body: ['The expected delivery date is shown for your pincode. Couriers can be delayed by weather, local conditions or incorrect addresses, so it is an estimate and not a guarantee.'] },
      { title: 'Track your order', icon: 'tracking', body: ['Use Track Your Order with your order number and phone number to see where your parcel is.'] },
    ],
    help: { title: 'Need help with your delivery?', text: 'If you have any questions about shipping or your order, we are here to help.' },
  },
  returns: {
    slug: 'returns', eyebrow: 'Returns & exchanges', title: 'We’re here to help',
    intro: 'If you receive a damaged, defective or incorrect item, contact us and we will put it right.',
    sections: [
      { title: 'Damaged or incorrect items', icon: 'damaged', body: ['Contact us within 7 days of delivery. Share clear photos or an unboxing video so we can review the issue.'] },
      { title: 'Exchange & refund options', icon: 'exchange', body: ['For a damaged, defective or incorrect item we offer an exchange or a refund, depending on the case and on stock. Return shipping is free for these items.', 'Approved refunds are paid to your bank account or UPI within 5–7 business days.'] },
      { title: 'How to request an exchange', icon: 'whatsapp', bullets: ['Message us on WhatsApp with your order number.', 'Send photos or a video of the issue.', 'We will review it and tell you the next steps.'] },
      { title: 'Non-eligible returns', icon: 'not-eligible', bullets: ['Change of mind or choosing the wrong size', 'Items that are used, worn or damaged after delivery', 'Requests made after 7 days of delivery'] },
    ],
    help: { title: 'Need help with an order?', text: 'Contact us with your order details and we will be happy to assist you.' },
  },
  'size-guide': {
    slug: 'size-guide', eyebrow: 'Size guide', title: 'Find your perfect fit',
    intro: 'Sizes vary by style, fabric and design, so also check the details on each product page.',
    sections: [
      { title: 'How to choose your size', icon: 'hanger', body: ['Sizes vary by style, fabric and design. Check the product details, measure yourself and choose the size that matches your largest measurement.'] },
      { title: 'Bust', icon: 'bust', body: ['Measure around the fullest part of your bust.'] },
      { title: 'Waist', icon: 'waist', body: ['Measure around your natural waistline.'] },
      { title: 'Hips', icon: 'hips', body: ['Measure around the fullest part of your hips.'] },
      { title: 'Between two sizes?', icon: 'size-tip', body: ['Choose the size that feels most comfortable for your preferred fit, or ask us before ordering.'] },
    ],
    help: { title: 'Need help choosing a size?', text: 'Contact us before ordering and we will do our best to help.' },
  },
  contact: {
    slug: 'contact', eyebrow: 'Reach out', title: 'We’d love to hear from you',
    intro: 'Have a question about a product or need help with an order? Reach out and we will get back to you as soon as possible.',
    sections: [],
    help: { title: 'Questions before ordering?', text: 'We are happy to help with products, orders and policies.' },
  },
  'our-story': {
    slug: 'our-story', eyebrow: 'Our story', title: 'Fashion made for your everyday moments',
    intro: 'At Sahjish Fashion we believe every woman deserves to feel confident, comfortable and beautiful in what she wears.',
    sections: [
      { title: 'Curated styles', icon: 'hanger', body: ['Every piece in our collection is thoughtfully selected to bring you styles that feel fresh, elegant and easy to wear.'] },
      { title: 'Comfort and confidence', icon: 'heart', body: ['Great fashion should look beautiful and also feel comfortable through your whole day.'] },
      { title: 'For every occasion', icon: 'sparkle', body: ['From everyday wear to special moments, find styles that fit into your life.'] },
    ],
    help: { title: 'Discover your style', text: 'Explore our collection and find pieces you will love to wear again and again.' },
  },
  privacy: {
    slug: 'privacy', eyebrow: 'Privacy policy', title: 'Your privacy matters to us', showUpdated: true,
    intro: 'This policy explains what information we collect and how we use it when you visit our website or place an order.',
    sections: [
      { title: 'Information we collect', icon: 'personal-info', body: ['When you place an order or contact us, we collect your name, phone number and delivery address, and your email if you give one. We collect it only to process your order, arrange delivery or reply to you.'] },
      { title: 'How we use your information', icon: 'privacy-cart', bullets: ['Process and manage your order', 'Arrange shipping and delivery', 'Contact you about your order', 'Provide customer support'] },
      { title: 'Sharing your information', icon: 'sharing', body: ['We share the necessary details with courier and delivery partners so your order can be delivered, and with the service providers that host this website. We do not sell your personal information.'] },
      { title: 'Your data and security', icon: 'privacy-shield', body: ['The items in your bag are stored in your own browser on your device.', 'We take reasonable steps to protect your information. No method of transmitting or storing information online is completely secure.'] },
      { title: 'Your rights and contact', icon: 'privacy-contact', body: ['You can ask us to show, correct or delete the information we hold about you by contacting us.'] },
    ],
    help: { title: 'Questions about your privacy?', text: 'Please contact us if you have questions about your personal information.' },
  },
  terms: {
    slug: 'terms', eyebrow: 'Terms & conditions', title: 'Terms & Conditions', showUpdated: true,
    intro: 'By using our website and placing an order, you agree to the following terms. Please read them before you buy.',
    sections: [
      { title: 'Products & pricing', icon: 'price-tag', body: ['We aim to show products and prices accurately. Colours can look different on different screens. Prices and availability may change without notice.'] },
      { title: 'Orders', icon: 'orders', body: ['We may contact you to confirm details. We may cancel an order for reasons such as incorrect pricing, product unavailability or incomplete information. If we cancel a paid order, you receive a full refund.'] },
      { title: 'Payment', icon: 'payment', body: ['Choose cash on delivery or online payment by QR code on WhatsApp. For online payment, message us with your order details; payment is pending until we confirm it. All prices are in INR.'] },
      { title: 'Shipping & delivery', icon: 'shipping', body: ['Delivery availability, charges and times depend on your location and courier availability. Please give accurate delivery details. We are not responsible for delays caused by incorrect or incomplete addresses or by couriers.'] },
      { title: 'Returns & exchanges', icon: 'exchange', body: ['Returns and exchanges follow our Returns & Exchanges page. Please read it before ordering.'] },
      { title: 'Product information', icon: 'product-info', body: ['Minor variations in colour, design, fabric texture or appearance may occur. Please check the product details and size information before ordering.'] },
      { title: 'Governing law', icon: 'terms-law', body: ['These terms are governed by the laws of India.'] },
      { title: 'Changes to these terms', icon: 'terms-change', body: ['We may update these terms from time to time. Changes are posted on this page.'] },
    ],
    help: { title: 'Questions before ordering?', text: 'Contact us if you have any questions about our products, orders or policies.' },
  },
};
