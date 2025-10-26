// Small products catalog used by product.html/product.js
// Each product has id matching the data-pid used on listing (e.g., p1, p2, ...)
window.PRODUCTS = {
  p1: {
    id: 'p1',
    title: 'Banarasi Saree',
    price: 399,
    oldPrice: null,
    image: './images/s1.jpg',
    description: 'Handcrafted Banarasi saree with intricate zari work. Lightweight, breathable silk blend perfect for festive occasions and small gatherings. Dry-clean recommended.',
    rating: 4.6,
    variants: {
      sizes: ['S','M','L','XL','XXL'],
      stock: { 'S': 5, 'M': 4, 'L': 3, 'XL': 2, 'XXL': 1 }
    },
    reviews: [
      {user: 'Anjali', text: 'Beautiful weave and great price.'},
      {user: 'Rekha', text: 'Lovely texture — got many compliments.'}
    ]
  },
  p2: {
    id: 'p2',
    title: 'Kanjivaram Saree',
    price: 799,
    oldPrice: 1599,
    image: './images/s2.jpg',
    description: 'Rich Kanjivaram saree with golden border. Traditional craftsmanship, ideal for weddings and ceremonies. Pair with light jewelry for a classic look.',
  rating: 4.8,
  variants: { sizes:['S','M','L','XL','XXL'], stock: {'S':3,'M':2,'L':1,'XL':1,'XXL':0} },
    reviews: [{user:'Meera', text:'Excellent quality and color.'}, {user:'Sonal', text:'Perfect for the wedding season.'}]
  },
  p3: {
    id: 'p3',
    title: 'Chanderi Saree',
    price: 699,
    oldPrice: null,
    image: './images/s3.jpg',
    description: 'Pure Chanderi fabric saree featuring subtle motifs and a soft sheen. Comfortable for day-long wear and perfect for formal office events.',
  rating: 4.4,
  variants: { sizes:['S','M','L','XL','XXL'], stock: {'S':4,'M':3,'L':2,'XL':1,'XXL':0} },
    reviews: [{user:'Pooja', text:'So lightweight and elegant.'}]
  },
  p4: {
    id: 'p4',
    title: 'Maheshwari Saree',
    price: 1169,
    oldPrice: 1299,
    image: './images/s4.jpg',
    description: 'Classic Maheshwari saree with understated patterns and a soft drape. Great for cultural events and traditional meetings.',
  rating: 4.5,
  variants: { sizes:['S','M','L','XL','XXL'], stock: {'S':2,'M':1,'L':1,'XL':0,'XXL':0} },
    reviews: [{user:'Lata', text:'Lovely fall and finish.'}]
  },
  p5: { id: 'p5', title: 'Paithani Saree', price:1169, oldPrice:1299, image:'./images/s5.jpg', description:'Handloom Paithani with geometric pallu and rich colors. Elegant and timeless.', rating:4.7, variants:{sizes:['S','M','L','XL','XXL'], stock:{'S':2,'M':1,'L':1,'XL':0,'XXL':0}}, reviews:[{user:'Soni', text:'Worth every rupee.'}] },
  p6: { id: 'p6', title: 'Bandhani Saree', price:1169, oldPrice:1299, image:'./images/s6.jpg', description:'Traditional Bandhani tie-dye with vibrant patterns. Casual to festive.', rating:4.3, variants:{sizes:['S','M','L','XL','XXL'], stock:{'S':6,'M':5,'L':4,'XL':2,'XXL':1}}, reviews:[{user:'Rina', text:'Bright and cheerful.'}] },
  p7: { id: 'p7', title: 'Patola Saree', price:1169, oldPrice:1299, image:'./images/s7.jpg', description:'Patola-inspired prints on soft fabric, suitable for celebrations.', rating:4.2, variants:{sizes:['S','M','L','XL','XXL'], stock:{'S':3,'M':2,'L':1,'XL':0,'XXL':0}}, reviews:[] },
  p8: { id: 'p8', title: 'Kota Doria Saree', price:1169, oldPrice:1299, image:'./images/s8.jpg', description:'Airy Kota Doria perfect for summers — elegant checks and subtle borders.', rating:4.1, variants:{sizes:['S','M','L','XL','XXL'], stock:{'S':5,'M':4,'L':3,'XL':2,'XXL':1}}, reviews:[] },
  p9: { id: 'p9', title: 'Tant Saree', price:1169, oldPrice:1299, image:'./images/s9.jpg', description:'Comfortable Tant saree with classic Bengali motifs.', rating:4.0, variants:{sizes:['S','M','L','XL','XXL'], stock:{'S':7,'M':5,'L':3,'XL':1,'XXL':0}}, reviews:[] },
  p10: { id: 'p10', title: 'Baluchari Saree', price:1169, oldPrice:1299, image:'./images/s10.jpg', description:'Baluchari with intricate storytelling motifs on the pallu. Great for collectors.', rating:4.6, variants:{sizes:['S','M','L','XL','XXL'], stock:{'S':2,'M':1,'L':1,'XL':0,'XXL':0}}, reviews:[] },
  p11: { id: 'p11', title: 'Jamdani Saree', price:1169, oldPrice:1299, image:'./images/s11.jpg', description:'Fine Jamdani weave with floral patterns. Soft and breathable.', rating:4.4, variants:{sizes:['S','M','L','XL','XXL'], stock:{'S':3,'M':2,'L':1,'XL':0,'XXL':0}}, reviews:[] },
  p12: { id: 'p12', title: 'Sambalpuri Saree', price:1169, oldPrice:1299, image:'./images/s12.jpg', description:'Traditional Sambalpuri prints and ikat borders, bold and distinctive.', rating:4.3, variants:{sizes:['S','M','L','XL','XXL'], stock:{'S':4,'M':3,'L':2,'XL':1,'XXL':1}}, reviews:[] }
};
