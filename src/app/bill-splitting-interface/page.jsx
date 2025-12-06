import Header from '@/components/common/Header';
import Breadcrumb from '@/components/common/Breadcrumb';
import QuickActionButton from '@/components/common/QuickActionButton';
import BillSplittingInteractive from './components/BillSplittingInteractive';

export const metadata = {
  title: 'Bill Splitting Interface - FinanceAssist',
  description: 'Split bills and shared expenses with itemized receipt processing and accurate cost distribution among participants'
};

export default function BillSplittingInterface() {
  const breadcrumbSteps = [
    { label: 'Receipt Scanner', path: '/receipt-scanner' },
    { label: 'Bill Splitting', path: '/bill-splitting-interface' }
  ];

  const mockData = {
    items: [
      {
        id: 'item-1',
        name: 'Caesar Salad',
        quantity: 2,
        unitPrice: 12.99,
        totalPrice: 25.98,
        assignedTo: []
      },
      {
        id: 'item-2',
        name: 'Grilled Salmon',
        quantity: 1,
        unitPrice: 24.99,
        totalPrice: 24.99,
        assignedTo: []
      },
      {
        id: 'item-3',
        name: 'Margherita Pizza',
        quantity: 1,
        unitPrice: 16.99,
        totalPrice: 16.99,
        assignedTo: []
      },
      {
        id: 'item-4',
        name: 'Iced Tea',
        quantity: 3,
        unitPrice: 3.50,
        totalPrice: 10.50,
        assignedTo: []
      }
    ],
    participants: [
      {
        id: 'participant-1',
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com'
      },
      {
        id: 'participant-2',
        name: 'Michael Chen',
        email: 'michael.c@email.com'
      }
    ]
  };

  return (
    <>
      <Header />
      <Breadcrumb steps={breadcrumbSteps} />
      <BillSplittingInteractive initialData={mockData} />
      <QuickActionButton />
    </>
  );
}