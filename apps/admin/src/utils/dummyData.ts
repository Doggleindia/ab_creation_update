import { Customer, Order, Contact, WalletAccount } from '../types/models';

export const dummyCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Anderson',
    email: 'john.anderson@email.com',
    phone: '+1 (555) 123-4567',
    totalPurchase: 2450,
    paymentStatus: 'Paid',
    orderStatus: 'Active',
    createdAt: '2025-01-10',
    lastOrderDate: '2025-01-15'
  },
  {
    id: '2',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@email.com',
    phone: '+1 (555) 234-5678',
    totalPurchase: 5600,
    paymentStatus: 'Paid',
    orderStatus: 'Completed',
    createdAt: '2024-12-20',
    lastOrderDate: '2025-01-18'
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.brown@email.com',
    phone: '+1 (555) 345-6789',
    totalPurchase: 1250,
    paymentStatus: 'Pending',
    orderStatus: 'Active',
    createdAt: '2025-01-05',
    lastOrderDate: '2025-01-14'
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '+1 (555) 456-7890',
    totalPurchase: 8900,
    paymentStatus: 'Paid',
    orderStatus: 'Completed',
    createdAt: '2024-11-15',
    lastOrderDate: '2025-01-10'
  },
  {
    id: '5',
    name: 'James Wilson',
    email: 'james.wilson@email.com',
    phone: '+1 (555) 567-8901',
    totalPurchase: 450,
    paymentStatus: 'Failed',
    orderStatus: 'Cancelled',
    createdAt: '2025-01-08',
    lastOrderDate: '2025-01-09'
  }
];

export const dummyOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2025-001',
    customerName: 'John Anderson',
    customerEmail: 'john.anderson@email.com',
    items: [
      {
        id: 'item-1',
        productType: 'Hoodie',
        printingType: 'DTF',
        quantity: 2,
        price: 45
      },
      {
        id: 'item-2',
        productType: 'T-Shirt',
        printingType: 'Screen Printing',
        quantity: 5,
        price: 15
      }
    ],
    totalAmount: 165,
    status: 'Paid',
    paymentStatus: 'Paid',
    createdAt: '2025-01-15',
    estimatedDelivery: '2025-01-25',
    trackingNumber: 'TRACK-123456789'
  },
  {
    id: '2',
    orderNumber: 'ORD-2025-002',
    customerName: 'Sarah Mitchell',
    customerEmail: 'sarah.mitchell@email.com',
    items: [
      {
        id: 'item-3',
        productType: 'Tops',
        printingType: 'Embroidered',
        quantity: 3,
        price: 55
      }
    ],
    totalAmount: 165,
    status: 'Processing',
    paymentStatus: 'Paid',
    createdAt: '2025-01-18',
    estimatedDelivery: '2025-01-28'
  },
  {
    id: '3',
    orderNumber: 'ORD-2025-003',
    customerName: 'Michael Brown',
    customerEmail: 'michael.brown@email.com',
    items: [
      {
        id: 'item-4',
        productType: 'Hoodie',
        printingType: 'Screen Printing',
        quantity: 1,
        price: 50
      }
    ],
    totalAmount: 50,
    status: 'Shipping',
    paymentStatus: 'Paid',
    createdAt: '2025-01-14',
    estimatedDelivery: '2025-01-22',
    trackingNumber: 'TRACK-987654321'
  },
  {
    id: '4',
    orderNumber: 'ORD-2025-004',
    customerName: 'Emily Rodriguez',
    customerEmail: 'emily.rodriguez@email.com',
    items: [
      {
        id: 'item-5',
        productType: 'T-Shirt',
        printingType: 'DTF',
        quantity: 10,
        price: 12
      }
    ],
    totalAmount: 120,
    status: 'Delivered',
    paymentStatus: 'Paid',
    createdAt: '2025-01-10',
    estimatedDelivery: '2025-01-18',
    trackingNumber: 'TRACK-555666777'
  },
  {
    id: '5',
    orderNumber: 'ORD-2025-005',
    customerName: 'James Wilson',
    customerEmail: 'james.wilson@email.com',
    items: [
      {
        id: 'item-6',
        productType: 'Tops',
        printingType: 'Embroidered',
        quantity: 2,
        price: 60
      }
    ],
    totalAmount: 120,
    status: 'Cancelled',
    paymentStatus: 'Failed',
    createdAt: '2025-01-09',
    estimatedDelivery: '2025-01-19'
  },
  {
    id: '6',
    orderNumber: 'ORD-2025-006',
    customerName: 'Sarah Mitchell',
    customerEmail: 'sarah.mitchell@email.com',
    items: [
      {
        id: 'item-7',
        productType: 'Hoodie',
        printingType: 'DTF',
        quantity: 1,
        price: 48
      }
    ],
    totalAmount: 48,
    status: 'Paid',
    paymentStatus: 'Paid',
    createdAt: '2025-01-12',
    estimatedDelivery: '2025-01-22'
  }
];

export const dummyContacts: Contact[] = [
  {
    _id: '1',
    name: 'Alex Thompson',
    email: 'alex.thompson@email.com',
    subject: 'Bulk Order Inquiry',
    message: 'I am interested in placing a bulk order of 500 units of custom hoodies with DTF printing. Could you please provide a quote for this?',
    createdAt: '2025-01-18',
    updatedAt: '2025-01-18',
    status: 'new'
  },
  {
    _id: '2',
    name: 'Lisa Chen',
    email: 'lisa.chen@email.com',
    subject: 'Custom Design Services',
    message: 'Do you offer custom design services? I have my own artwork and need to print it on t-shirts for my brand.',
    createdAt: '2025-01-17',
    updatedAt: '2025-01-17',
    status: 'reviewed'
  },
  {
    _id: '3',
    name: 'Marcus Johnson',
    email: 'marcus.johnson@email.com',
    subject: 'Shipping to International Location',
    message: 'Hi, I need to ship 100 units of embroidered tops to Canada. What are the shipping costs and delivery timeframe?',
    createdAt: '2025-01-16',
    updatedAt: '2025-01-16',
    status: 'resolved'
  },
  {
    _id: '4',
    name: 'Patricia Davis',
    email: 'patricia.davis@email.com',
    subject: 'Quality and Material Questions',
    message: 'What materials do you use for your products? Are they eco-friendly? I want to ensure high quality for my customers.',
    createdAt: '2025-01-15',
    updatedAt: '2025-01-15',
    status: 'reviewed'
  },
  {
    _id: '5',
    name: 'Robert Wilson',
    email: 'robert.wilson@email.com',
    subject: 'Technical Support - Design Upload',
    message: 'I am having trouble uploading my design file. The system says the file format is not supported. Can you help?',
    createdAt: '2025-01-14',
    updatedAt: '2025-01-14',
    status: 'new'
  },
  {
    _id: '6',
    name: 'Jennifer Martinez',
    email: 'jennifer.martinez@email.com',
    subject: 'Partnership Opportunity',
    message: 'We are a clothing wholesaler and would like to explore a partnership with your company. Can we schedule a call?',
    createdAt: '2025-01-13',
    updatedAt: '2025-01-13',
    status: 'new'
  },
  {
    _id: '7',
    name: 'David Anderson',
    email: 'david.anderson@email.com',
    subject: 'Return and Refund Policy',
    message: 'What is your return policy if I am not satisfied with the quality of the products?',
    createdAt: '2025-01-12',
    updatedAt: '2025-01-12',
    status: 'resolved'
  }
];

export const dummyWallet: WalletAccount = {
  id: 'wallet-admin-001',
  totalCredit: 45000,
  totalDebit: 12500,
  currentBalance: 32500,
  lastUpdated: '2025-01-19',
  transactions: [
    {
      id: 'txn-1',
      userId: 'user-001',
      userName: 'John Anderson',
      type: 'Credit',
      status: 'Completed',
      amount: 5000,
      description: 'User purchased 5000 credits',
      createdAt: '2025-01-19',
      reference: 'ORD-2025-001'
    },
    {
      id: 'txn-2',
      userId: 'user-002',
      userName: 'Sarah Mitchell',
      type: 'Debit',
      status: 'Completed',
      amount: 2500,
      description: 'Order fulfillment - Printing costs',
      createdAt: '2025-01-18',
      reference: 'ORD-2025-002'
    },
    {
      id: 'txn-3',
      userId: 'user-003',
      userName: 'Michael Brown',
      type: 'Credit',
      status: 'Completed',
      amount: 8000,
      description: 'Bulk order - User purchased 8000 credits',
      createdAt: '2025-01-18',
      reference: 'ORD-2025-003'
    },
    {
      id: 'txn-4',
      userId: 'user-004',
      userName: 'Emily Rodriguez',
      type: 'Debit',
      status: 'Completed',
      amount: 3200,
      description: 'Shipping and handling charges',
      createdAt: '2025-01-17',
      reference: 'ORD-2025-004'
    },
    {
      id: 'txn-5',
      userId: 'user-005',
      userName: 'James Wilson',
      type: 'Refund',
      status: 'Completed',
      amount: 1500,
      description: 'Order cancellation refund',
      createdAt: '2025-01-16',
      reference: 'ORD-2025-005'
    },
    {
      id: 'txn-6',
      userId: 'user-001',
      userName: 'John Anderson',
      type: 'Credit',
      status: 'Completed',
      amount: 10000,
      description: 'Large order - User purchased 10000 credits',
      createdAt: '2025-01-16',
      reference: 'ORD-2025-006'
    },
    {
      id: 'txn-7',
      userId: 'user-006',
      userName: 'Patricia Davis',
      type: 'Debit',
      status: 'Completed',
      amount: 2100,
      description: 'Design customization fee',
      createdAt: '2025-01-15',
      reference: 'DES-2025-001'
    },
    {
      id: 'txn-8',
      userId: 'user-007',
      userName: 'Robert Wilson',
      type: 'Credit',
      status: 'Pending',
      amount: 6500,
      description: 'User purchasing credits - Bank transfer',
      createdAt: '2025-01-19',
      reference: 'BANK-2025-001'
    },
    {
      id: 'txn-9',
      userId: 'user-002',
      userName: 'Sarah Mitchell',
      type: 'Debit',
      status: 'Completed',
      amount: 1800,
      description: 'Rush delivery surcharge',
      createdAt: '2025-01-14',
      reference: 'ORD-2025-007'
    },
    {
      id: 'txn-10',
      userId: 'user-003',
      userName: 'Michael Brown',
      type: 'Credit',
      status: 'Completed',
      amount: 3500,
      description: 'Referral bonus - Credits added',
      createdAt: '2025-01-13',
      reference: 'REF-2025-001'
    }
  ]
};
