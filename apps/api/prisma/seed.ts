import { PrismaClient, ProductStatus, StockStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@dealport.dev';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: 'Dealport Admin',
      role: 'admin',
    },
  });

  const categoryNames = ['Electronic', 'Fashion', 'Home', 'Sports', 'Beauty'];
  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.upsert({ where: { name }, update: {}, create: { name } }),
    ),
  );
  const byName = (name: string) => categories.find((c) => c.name === name)!;

  const products: Array<{
    name: string;
    description: string;
    price: number;
    discountPrice?: number;
    stockQuantity: number;
    stockStatus: StockStatus;
    status: ProductStatus;
    totalOrders: number;
    categoryId: string;
    imageUrl: string;
    featured?: boolean;
  }> = [
    {
      name: 'Apple iPhone 15',
      description:
        'The iPhone 15 delivers cutting-edge performance with the A16 Bionic chip, an immersive Super Retina XDR display, advanced dual-camera system, and exceptional battery life.',
      price: 999.89,
      discountPrice: 900.89,
      stockQuantity: 240,
      stockStatus: StockStatus.IN_STOCK,
      status: ProductStatus.PUBLISHED,
      totalOrders: 104,
      categoryId: byName('Electronic').id,
      imageUrl: '/products/iphone-15.svg',
      featured: true,
    },
    {
      name: 'Nike Air Jordan',
      description: 'Iconic high-top basketball sneaker with premium leather and Air-Sole cushioning.',
      price: 172.4,
      stockQuantity: 0,
      stockStatus: StockStatus.OUT_OF_STOCK,
      status: ProductStatus.PUBLISHED,
      totalOrders: 56,
      categoryId: byName('Fashion').id,
      imageUrl: '/products/air-jordan.svg',
    },
    {
      name: 'Classic T-Shirt',
      description: '100% combed cotton crew-neck t-shirt, unisex fit, machine washable.',
      price: 35.4,
      stockQuantity: 512,
      stockStatus: StockStatus.IN_STOCK,
      status: ProductStatus.PUBLISHED,
      totalOrders: 266,
      categoryId: byName('Fashion').id,
      imageUrl: '/products/tshirt.svg',
    },
    {
      name: 'Assorted Cross Bag',
      description: 'Compact crossbody bag with adjustable strap and multiple compartments.',
      price: 80.0,
      stockQuantity: 88,
      stockStatus: StockStatus.IN_STOCK,
      status: ProductStatus.PUBLISHED,
      totalOrders: 506,
      categoryId: byName('Fashion').id,
      imageUrl: '/products/cross-bag.svg',
    },
    {
      name: 'Smart Fitness Tracker',
      description: 'Track heart rate, sleep, and workouts with a 10-day battery life.',
      price: 39.99,
      stockQuantity: 150,
      stockStatus: StockStatus.IN_STOCK,
      status: ProductStatus.PUBLISHED,
      totalOrders: 41,
      categoryId: byName('Electronic').id,
      imageUrl: '/products/fitness-tracker.svg',
    },
    {
      name: 'Leather Wallet',
      description: 'Full-grain leather bifold wallet with RFID-blocking lining.',
      price: 29.99,
      stockQuantity: 300,
      stockStatus: StockStatus.IN_STOCK,
      status: ProductStatus.PUBLISHED,
      totalOrders: 28,
      categoryId: byName('Fashion').id,
      imageUrl: '/products/wallet.svg',
    },
    {
      name: 'Electric Hair Trimmer',
      description: 'Cordless precision trimmer with ceramic blades and 90-minute runtime.',
      price: 34.99,
      stockQuantity: 75,
      stockStatus: StockStatus.IN_STOCK,
      status: ProductStatus.PUBLISHED,
      totalOrders: 19,
      categoryId: byName('Beauty').id,
      imageUrl: '/products/trimmer.svg',
    },
    {
      name: 'Ceramic Cookware Set',
      description: '10-piece non-stick ceramic cookware set, oven-safe up to 450°F.',
      price: 149.99,
      stockQuantity: 40,
      stockStatus: StockStatus.IN_STOCK,
      status: ProductStatus.DRAFT,
      totalOrders: 0,
      categoryId: byName('Home').id,
      imageUrl: '/products/cookware.svg',
    },
  ];

  for (const product of products) {
    const existing = await prisma.product.findFirst({ where: { name: product.name } });
    if (!existing) {
      await prisma.product.create({ data: product });
    }
  }

  console.log('Seed complete.');
  console.log(`Admin login -> email: ${adminEmail}  password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
