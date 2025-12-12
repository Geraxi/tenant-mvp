import { getUncachableStripeClient } from '../server/stripeClient';

async function createProducts() {
  const stripe = await getUncachableStripeClient();

  console.log('Creating Tenant Premium subscription products...');

  // Check if products already exist
  const existingProducts = await stripe.products.search({
    query: "name:'Tenant Premium'"
  });

  if (existingProducts.data.length > 0) {
    console.log('Products already exist, skipping creation');
    console.log('Existing products:', existingProducts.data.map(p => ({ id: p.id, name: p.name })));
    return;
  }

  // Create the Premium product
  const product = await stripe.products.create({
    name: 'Tenant Premium',
    description: 'Unlimited swipes, see who liked you, priority views, and unlimited messages',
    metadata: {
      app: 'tenant',
      type: 'subscription',
    },
  });

  console.log('Created product:', product.id);

  // Create monthly price
  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 1299, // €12.99
    currency: 'eur',
    recurring: { interval: 'month' },
    metadata: {
      plan: 'monthly',
    },
  });

  console.log('Created monthly price:', monthlyPrice.id, '- €12.99/month');

  // Create yearly price (€7.99/month billed annually = €95.88/year)
  const yearlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 9588, // €95.88/year (€7.99 x 12)
    currency: 'eur',
    recurring: { interval: 'year' },
    metadata: {
      plan: 'yearly',
      monthly_equivalent: '7.99',
    },
  });

  console.log('Created yearly price:', yearlyPrice.id, '- €95.88/year (€7.99/month)');

  console.log('\n✅ Products created successfully!');
  console.log('\nAdd these price IDs to your frontend:');
  console.log('Monthly:', monthlyPrice.id);
  console.log('Yearly:', yearlyPrice.id);
}

createProducts().catch(console.error);
