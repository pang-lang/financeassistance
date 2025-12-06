'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/navigation';
import UploadZone from './UploadZone';
import ProcessingIndicator from './ProcessingIndicator';
import ReceiptPreview from './ReceiptPreview';
import ExtractedDataForm from './ExtractedDataForm';
import BillSplitPrompt from './BillSplitPrompt';
import RecentReceipts from './RecentReceipts';

const ReceiptScannerInteractive = ({ initialReceipts }) => {
  const router = useRouter();
  const [processingStatus, setProcessingStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [showBillSplit, setShowBillSplit] = useState(false);

  const simulateOCRProcessing = (file) => {
    setProcessingStatus('uploading');
    setProgress(0);

    setTimeout(() => {
      setProgress(30);
      setProcessingStatus('processing');
    }, 500);

    setTimeout(() => {
      setProgress(60);
      setProcessingStatus('extracting');
    }, 1500);

    setTimeout(() => {
      setProgress(100);
      setProcessingStatus('complete');

      const mockExtractedData = {
        storeName: 'Whole Foods Market',
        totalAmount: '87.45',
        date: '2025-12-05',
        items: [
          { name: 'Organic Bananas', price: '3.99' },
          { name: 'Almond Milk', price: '4.50' },
          { name: 'Whole Grain Bread', price: '5.25' },
          { name: 'Free Range Eggs', price: '6.99' },
          { name: 'Greek Yogurt', price: '8.50' },
          { name: 'Mixed Salad Greens', price: '4.75' },
          { name: 'Cherry Tomatoes', price: '5.99' },
          { name: 'Avocados (3 pack)', price: '7.99' },
          { name: 'Chicken Breast', price: '15.50' },
          { name: 'Olive Oil', price: '12.99' },
          { name: 'Pasta', price: '3.25' },
          { name: 'Marinara Sauce', price: '4.75' },
          { name: 'Parmesan Cheese', price: '7.00' }
        ]
      };

      setExtractedData(mockExtractedData);
      setShowBillSplit(true);
    }, 2500);
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setReceiptUrl(url);
    simulateOCRProcessing(file);
  };

  const handleSaveReceipt = (formData) => {
    console.log('Saving receipt data:', formData);
    alert(`Receipt saved successfully!\n\nStore: ${formData?.storeName}\nTotal: $${formData?.totalAmount}\nDate: ${formData?.date}\nItems: ${formData?.items?.length}`);
    
    handleReset();
  };

  const handleCancel = () => {
    handleReset();
  };

  const handleReset = () => {
    setProcessingStatus('idle');
    setProgress(0);
    setSelectedFile(null);
    setReceiptUrl('');
    setExtractedData(null);
    setShowBillSplit(false);
  };

  const handleDismissBillSplit = () => {
    setShowBillSplit(false);
  };

  return (
    <div className="space-y-6">
      {/* Upload or Processing Section */}
      {processingStatus === 'idle' && (
        <UploadZone onFileSelect={handleFileSelect} isProcessing={false} />
      )}

      {processingStatus !== 'idle' && processingStatus !== 'complete' && (
        <ProcessingIndicator status={processingStatus} progress={progress} />
      )}

      {/* Receipt Preview and Extracted Data */}
      {processingStatus === 'complete' && extractedData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ReceiptPreview receiptUrl={receiptUrl} fileName={selectedFile?.name} />
          </div>

          <div className="space-y-4">
            {showBillSplit && (
              <BillSplitPrompt
                receiptData={extractedData}
                onDismiss={handleDismissBillSplit}
              />
            )}
            
            <ExtractedDataForm
              extractedData={extractedData}
              onSave={handleSaveReceipt}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

      {/* Recent Receipts */}
      {processingStatus === 'idle' && (
        <RecentReceipts receipts={initialReceipts} />
      )}
    </div>
  );
};

ReceiptScannerInteractive.propTypes = {
  initialReceipts: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.number?.isRequired,
      storeName: PropTypes?.string?.isRequired,
      totalAmount: PropTypes?.string?.isRequired,
      date: PropTypes?.string?.isRequired,
      imageUrl: PropTypes?.string?.isRequired,
      itemCount: PropTypes?.number?.isRequired,
      isSplit: PropTypes?.bool
    })
  )
};

export default ReceiptScannerInteractive;