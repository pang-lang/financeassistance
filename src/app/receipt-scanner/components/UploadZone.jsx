'use client';

import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const UploadZone = ({ onFileSelect, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsDragging(false);

    const files = e?.dataTransfer?.files;
    if (files && files?.length > 0) {
      handleFileValidation(files?.[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e?.target?.files;
    if (files && files?.length > 0) {
      handleFileValidation(files?.[0]);
    }
  };

  const handleFileValidation = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes?.includes(file?.type)) {
      alert('Invalid file type. Please upload JPG, PNG, or PDF files only.');
      return;
    }

    if (file?.size > maxSize) {
      alert('File size exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    onFileSelect(file);
  };

  const handleBrowseClick = () => {
    fileInputRef?.current?.click();
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-lg transition-smooth ${
        isDragging
          ? 'border-primary bg-primary/5' :'border-border bg-card hover:border-primary/50'
      } ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
    >
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className={`mb-4 p-4 rounded-full ${isDragging ? 'bg-primary/10' : 'bg-muted'}`}>
          <Icon
            name="CloudArrowUpIcon"
            size={48}
            variant="outline"
            className={isDragging ? 'text-primary' : 'text-muted-foreground'}
          />
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-2">
          {isDragging ? 'Drop your receipt here' : 'Upload Receipt'}
        </h3>

        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          Drag and drop your receipt image or PDF here, or click the button below to browse your files
        </p>

        <button
          onClick={handleBrowseClick}
          disabled={isProcessing}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-quick disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center space-x-2">
            <Icon name="FolderOpenIcon" size={20} variant="solid" />
            <span>Browse Files</span>
          </span>
        </button>

        <p className="text-xs text-muted-foreground mt-4">
          Supported formats: JPG, PNG, PDF (Max 10MB)
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isProcessing}
        />
      </div>
    </div>
  );
};

UploadZone.propTypes = {
  onFileSelect: PropTypes?.func?.isRequired,
  isProcessing: PropTypes?.bool?.isRequired
};

export default UploadZone;