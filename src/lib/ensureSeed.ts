import prisma from '@/lib/prisma';
import { addDays, subDays } from 'date-fns';

let seedExecuted = false;

export async function ensureDbSeeded() {
  if (seedExecuted) return;

  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      seedExecuted = true;
      return;
    }

    console.log('🌱 Auto-seeding database for initial production deployment...');

    // 1. Create Default Store
    const store1 = await prisma.store.create({
      data: {
        name: 'FreshMart Supermarket - Indiranagar',
        code: 'STORE-001',
        address: '124 100ft Road, Indiranagar, Bengaluru',
        phone: '+91 98765 43210',
        email: 'indiranagar@freshmart.in',
      },
    });

    await prisma.storeSettings.create({
      data: {
        storeId: store1.id,
        watchDays: 30,
        warningDays: 14,
        urgentDays: 6,
        criticalDays: 2,
        autoDiscountEnabled: true,
        currencySymbol: '₹',
      },
    });

    // 2. Create Default Users
    await prisma.user.createMany({
      data: [
        {
          storeId: store1.id,
          name: 'Rahul Sharma (Super Admin)',
          email: 'owner@smartshelf.ai',
          password: 'password123',
          role: 'OWNER',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        },
        {
          storeId: store1.id,
          name: 'Anish Verma (Area Supervisor)',
          email: 'supervisor@smartshelf.ai',
          password: 'password123',
          role: 'SUPERVISOR',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        },
        {
          storeId: store1.id,
          name: 'Priya Patel (Indiranagar Staff)',
          email: 'staff1@smartshelf.ai',
          password: 'password123',
          role: 'STAFF',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        },
      ],
    });

    // 3. Create Default Categories
    const categoriesList = [
      { name: 'Dairy & Eggs', icon: 'Milk', color: 'blue' },
      { name: 'Bakery & Bread', icon: 'Wheat', color: 'amber' },
      { name: 'Beverages', icon: 'CupSoda', color: 'purple' },
      { name: 'Groceries & Staples', icon: 'ShoppingBag', color: 'emerald' },
      { name: 'Snacks & Biscuits', icon: 'Cookie', color: 'amber' },
      { name: 'Fruits & Vegetables', icon: 'Apple', color: 'green' },
    ];

    for (const cat of categoriesList) {
      await prisma.category.create({
        data: { storeId: store1.id, name: cat.name, icon: cat.icon, color: cat.color },
      });
    }

    const catDairy = await prisma.category.findFirst({ where: { storeId: store1.id, name: 'Dairy & Eggs' } });
    const catBakery = await prisma.category.findFirst({ where: { storeId: store1.id, name: 'Bakery & Bread' } });

    // 4. Create Supplier & Initial Products/Batches
    if (catDairy && catBakery) {
      const supAmul = await prisma.supplier.create({
        data: {
          storeId: store1.id,
          name: 'Amul Dairy Supply Ltd',
          contactPerson: 'Vikram Mehta',
          phone: '+91 98200 11223',
          email: 'orders@amulsupply.com',
          address: 'Anand Dairy Complex, Gujarat',
        },
      });

      const today = new Date();

      const milk = await prisma.product.create({
        data: {
          storeId: store1.id,
          name: 'Amul Taaza Toned Milk 500ml',
          barcode: '8901262010012',
          brand: 'Amul',
          categoryId: catDairy.id,
          supplierId: supAmul.id,
          purchasePrice: 24.0,
          sellingPrice: 28.0,
          unit: 'pack',
          minStockLevel: 15,
        },
      });

      await prisma.batch.create({
        data: {
          storeId: store1.id,
          productId: milk.id,
          batchNumber: 'AM-201',
          quantity: 20,
          initialQuantity: 50,
          mfgDate: subDays(today, 3),
          expiryDate: addDays(today, 2),
          storageLocation: 'Cold Room A',
          status: 'CRITICAL',
        },
      });

      const bread = await prisma.product.create({
        data: {
          storeId: store1.id,
          name: 'Britannia White Sandwich Bread 400g',
          barcode: '8901063012015',
          brand: 'Britannia',
          categoryId: catBakery.id,
          purchasePrice: 38.0,
          sellingPrice: 45.0,
          unit: 'pack',
          minStockLevel: 10,
        },
      });

      await prisma.batch.create({
        data: {
          storeId: store1.id,
          productId: bread.id,
          batchNumber: 'BR-102',
          quantity: 15,
          initialQuantity: 40,
          mfgDate: subDays(today, 4),
          expiryDate: addDays(today, 1),
          storageLocation: 'Bakery Rack 1',
          status: 'URGENT',
        },
      });
    }

    seedExecuted = true;
    console.log('✅ Database auto-seeded successfully!');
  } catch (err) {
    console.error('Auto-seed error:', err);
  }
}
