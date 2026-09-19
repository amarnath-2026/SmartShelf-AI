import { PrismaClient } from '@prisma/client';
import { addDays, subDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SmartShelf AI multi-store database seeding...');

  // Clean existing tables
  await prisma.stockAllocation.deleteMany();
  await prisma.staffDirective.deleteMany();
  await prisma.aIRecommendation.deleteMany();
  await prisma.expiryAlert.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.storeSettings.deleteMany();
  await prisma.store.deleteMany();

  // 1. Create 3 Stores
  const store1 = await prisma.store.create({
    data: {
      name: 'FreshMart Supermarket - Indiranagar',
      code: 'STORE-001',
      address: '124 100ft Road, Indiranagar, Bengaluru',
      phone: '+91 98765 43210',
      email: 'indiranagar@freshmart.in',
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'FreshMart Express - Koramangala',
      code: 'STORE-002',
      address: '80ft Road, 4th Block, Koramangala, Bengaluru',
      phone: '+91 98765 43211',
      email: 'koramangala@freshmart.in',
    },
  });

  const store3 = await prisma.store.create({
    data: {
      name: 'FreshMart Mega Store - Whitefield',
      code: 'STORE-003',
      address: 'ITPB Main Road, Whitefield, Bengaluru',
      phone: '+91 98765 43212',
      email: 'whitefield@freshmart.in',
    },
  });

  // 2. Create Store Settings for all stores
  for (const s of [store1, store2, store3]) {
    await prisma.storeSettings.create({
      data: {
        storeId: s.id,
        watchDays: 30,
        warningDays: 14,
        urgentDays: 6,
        criticalDays: 2,
        autoDiscountEnabled: true,
        currencySymbol: '₹',
      },
    });
  }

  // 3. Create Multi-Role Users
  const owner = await prisma.user.create({
    data: {
      storeId: store1.id,
      name: 'Rahul Sharma (Super Admin)',
      email: 'owner@smartshelf.ai',
      password: 'password123',
      role: 'OWNER',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const supervisor = await prisma.user.create({
    data: {
      storeId: store1.id,
      name: 'Anish Verma (Area Supervisor)',
      email: 'supervisor@smartshelf.ai',
      password: 'password123',
      role: 'SUPERVISOR',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      storeId: store1.id,
      name: 'Priya Patel (Indiranagar Staff)',
      email: 'staff1@smartshelf.ai',
      password: 'password123',
      role: 'STAFF',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  await prisma.user.create({
    data: {
      storeId: store2.id,
      name: 'Vikram Singh (Koramangala Staff)',
      email: 'staff2@smartshelf.ai',
      password: 'password123',
      role: 'STAFF',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  });

  await prisma.user.create({
    data: {
      storeId: store3.id,
      name: 'Kavita Nair (Whitefield Staff)',
      email: 'staff3@smartshelf.ai',
      password: 'password123',
      role: 'STAFF',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    },
  });

  // Seed all 20 Real-World Supermarket Categories for Store 1
  const categoriesList = [
    { name: 'Groceries & Staples', icon: 'ShoppingBag', color: 'emerald' },
    { name: 'Dairy & Eggs', icon: 'Milk', color: 'blue' },
    { name: 'Fruits & Vegetables', icon: 'Apple', color: 'green' },
    { name: 'Beverages', icon: 'CupSoda', color: 'purple' },
    { name: 'Snacks & Biscuits', icon: 'Cookie', color: 'amber' },
    { name: 'Bakery & Bread', icon: 'Wheat', color: 'orange' },
    { name: 'Packaged & Instant Foods', icon: 'Zap', color: 'red' },
    { name: 'Frozen Foods', icon: 'IceCream', color: 'cyan' },
    { name: 'Meat & Seafood', icon: 'Fish', color: 'rose' },
    { name: 'Personal Care', icon: 'Smile', color: 'pink' },
    { name: 'Household Cleaning', icon: 'Sparkles', color: 'indigo' },
    { name: 'Baby Care', icon: 'Baby', color: 'sky' },
    { name: 'Health & Wellness', icon: 'HeartPulse', color: 'teal' },
    { name: 'Home & Kitchen', icon: 'Home', color: 'yellow' },
    { name: 'Stationery & School Supplies', icon: 'BookOpen', color: 'slate' },
    { name: 'Pet Care', icon: 'Dog', color: 'stone' },
    { name: 'Pooja & Religious Items', icon: 'Flame', color: 'amber' },
    { name: 'Automotive & Utility', icon: 'Wrench', color: 'zinc' },
    { name: 'Clothing & Accessories', icon: 'Shirt', color: 'violet' },
    { name: 'Seasonal Products', icon: 'Sun', color: 'lime' },
  ];

  const categoryMap: Record<string, any> = {};
  for (const cat of categoriesList) {
    const createdCat = await prisma.category.create({
      data: { storeId: store1.id, name: cat.name, icon: cat.icon, color: cat.color },
    });
    categoryMap[cat.name] = createdCat;
  }

  const catDairy1 = categoryMap['Dairy & Eggs'];
  const catBakery1 = categoryMap['Bakery & Bread'];
  const catBeverages1 = categoryMap['Beverages'];

  const supAmul1 = await prisma.supplier.create({
    data: {
      storeId: store1.id,
      name: 'Amul Dairy Supply Ltd',
      contactPerson: 'Vikram Mehta',
      phone: '+91 98200 11223',
      email: 'orders@amulsupply.com',
      address: 'Anand Dairy Complex, Gujarat',
    },
  });

  const supBritannia1 = await prisma.supplier.create({
    data: {
      storeId: store1.id,
      name: 'Britannia Foods Ltd',
      contactPerson: 'Sunil Kumar',
      phone: '+91 98111 44556',
      email: 'sales@britannia.co.in',
      address: 'Industrial Estate, Bengaluru',
    },
  });

  const today = new Date();

  // Create Product & Batches for Store 1
  const milk1 = await prisma.product.create({
    data: {
      storeId: store1.id,
      name: 'Amul Taaza Toned Milk 500ml',
      barcode: '8901262010012',
      brand: 'Amul',
      categoryId: catDairy1.id,
      supplierId: supAmul1.id,
      purchasePrice: 24.0,
      sellingPrice: 28.0,
      unit: 'pack',
      minStockLevel: 15,
    },
  });

  const batchMilk1 = await prisma.batch.create({
    data: {
      storeId: store1.id,
      productId: milk1.id,
      batchNumber: 'AM-201',
      quantity: 20,
      initialQuantity: 50,
      mfgDate: subDays(today, 3),
      expiryDate: addDays(today, 2),
      storageLocation: 'Cold Room A',
      status: 'CRITICAL',
    },
  });

  await prisma.expiryAlert.create({
    data: {
      storeId: store1.id,
      batchId: batchMilk1.id,
      riskLevel: 'CRITICAL',
      daysRemaining: 2,
      isResolved: false,
    },
  });

  const bread1 = await prisma.product.create({
    data: {
      storeId: store1.id,
      name: 'Britannia White Sandwich Bread 400g',
      barcode: '8901063012015',
      brand: 'Britannia',
      categoryId: catBakery1.id,
      supplierId: supBritannia1.id,
      purchasePrice: 38.0,
      sellingPrice: 45.0,
      unit: 'pack',
      minStockLevel: 10,
    },
  });

  const batchBread1 = await prisma.batch.create({
    data: {
      storeId: store1.id,
      productId: bread1.id,
      batchNumber: 'BR-102',
      quantity: 15,
      initialQuantity: 40,
      mfgDate: subDays(today, 4),
      expiryDate: addDays(today, 1),
      storageLocation: 'Bakery Rack 1',
      status: 'URGENT',
    },
  });

  // Seed inventory for Store 2
  const catDairy2 = await prisma.category.create({
    data: { storeId: store2.id, name: 'Dairy & Eggs', icon: 'Milk', color: 'blue' },
  });
  const milk2 = await prisma.product.create({
    data: {
      storeId: store2.id,
      name: 'Amul Taaza Toned Milk 500ml',
      barcode: '8901262010012',
      brand: 'Amul',
      categoryId: catDairy2.id,
      purchasePrice: 24.0,
      sellingPrice: 28.0,
      unit: 'pack',
    },
  });
  await prisma.batch.create({
    data: {
      storeId: store2.id,
      productId: milk2.id,
      batchNumber: 'AM-202',
      quantity: 35,
      initialQuantity: 60,
      mfgDate: subDays(today, 2),
      expiryDate: addDays(today, 5),
      storageLocation: 'Chiller Display',
      status: 'WATCH',
    },
  });

  // Seed Staff Directives (Owner Intimations)
  console.log('📌 Seeding Staff Directives (Owner Intimations)...');
  await prisma.staffDirective.createMany({
    data: [
      {
        storeId: store1.id,
        createdById: owner.id,
        productId: milk1.id,
        batchId: batchMilk1.id,
        title: '🔥 Urgent Shelf Relocation: Move Amul Milk AM-201 to Front Counter',
        message: 'Batch AM-201 has 20 units expiring in 2 days. Place on the main entrance SELL FIRST shelf immediately.',
        priority: 'CRITICAL',
        status: 'PENDING',
      },
      {
        storeId: store1.id,
        createdById: supervisor.id,
        productId: bread1.id,
        batchId: batchBread1.id,
        title: '⚡ Apply 20% Promo Discount on Britannia Bread',
        message: 'Batch BR-102 expires tomorrow. Mark down selling price by ₹9 at counter.',
        priority: 'URGENT',
        status: 'PENDING',
      },
    ],
  });

  // Seed Stock Allocations (Central Warehouse Distribution)
  console.log('🚚 Seeding Central Warehouse Stock Allocations...');
  await prisma.stockAllocation.createMany({
    data: [
      {
        storeId: store1.id,
        productId: milk1.id,
        batchNumber: 'WH-AM-901',
        shippedQuantity: 100,
        receivedQuantity: 100,
        mfgDate: subDays(today, 1),
        expiryDate: addDays(today, 15),
        status: 'RECEIVED',
      },
      {
        storeId: store2.id,
        productId: milk2.id,
        batchNumber: 'WH-AM-902',
        shippedQuantity: 75,
        receivedQuantity: 75,
        mfgDate: subDays(today, 1),
        expiryDate: addDays(today, 15),
        status: 'RECEIVED',
      },
      {
        storeId: store3.id,
        productId: milk1.id,
        batchNumber: 'WH-AM-903',
        shippedQuantity: 150,
        receivedQuantity: 0,
        mfgDate: today,
        expiryDate: addDays(today, 18),
        status: 'IN_TRANSIT',
      },
    ],
  });

  // Seed Sales History for Store 1, 2, 3
  console.log('🛒 Seeding Sales History...');
  for (let i = 1; i <= 15; i++) {
    const saleDate = subDays(today, Math.floor(Math.random() * 14));
    
    // Store 1 Sale
    await prisma.sale.create({
      data: {
        storeId: store1.id,
        userId: staff1.id,
        invoiceNo: `INV-STORE1-${1000 + i}`,
        totalAmount: 450 + i * 60,
        paymentMethod: i % 2 === 0 ? 'UPI' : 'CASH',
        customerName: `Customer #${100 + i}`,
        createdAt: saleDate,
      },
    });

    // Store 2 Sale
    await prisma.sale.create({
      data: {
        storeId: store2.id,
        invoiceNo: `INV-STORE2-${1000 + i}`,
        totalAmount: 380 + i * 50,
        paymentMethod: 'CARD',
        customerName: `Walk-in Customer`,
        createdAt: saleDate,
      },
    });

    // Store 3 Sale
    await prisma.sale.create({
      data: {
        storeId: store3.id,
        invoiceNo: `INV-STORE3-${1000 + i}`,
        totalAmount: 520 + i * 75,
        paymentMethod: 'UPI',
        customerName: `Walk-in Customer`,
        createdAt: saleDate,
      },
    });
  }

  console.log('✅ SmartShelf AI multi-store database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
