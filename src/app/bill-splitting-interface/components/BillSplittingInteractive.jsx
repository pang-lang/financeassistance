'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import ReceiptItemCard from './ReceiptItemCard';
import ParticipantCard from './ParticipantCard';
import AddParticipantForm from './AddParticipantForm';
import AddItemForm from './AddItemForm';
import SplitSummary from './SplitSummary';
import TaxTipControls from './TaxTipControls';

const BillSplittingInteractive = ({ initialData }) => {
  const [items, setItems] = useState(initialData?.items || []);
  const [participants, setParticipants] = useState(initialData?.participants || []);
  const [taxTipData, setTaxTipData] = useState({
    tax: 0,
    tip: 0,
    splitMethod: 'proportional'
  });
  const [showExportModal, setShowExportModal] = useState(false);

  const calculateSubtotal = () => {
    return items?.reduce((sum, item) => sum + item?.totalPrice, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + taxTipData?.tax + taxTipData?.tip;
  };

  const calculateParticipantAmount = (participantId) => {
    const participantItems = items?.filter(item => 
      item?.assignedTo?.includes(participantId)
    );

    let itemsTotal = 0;
    participantItems?.forEach(item => {
      const shareCount = item?.assignedTo?.length;
      itemsTotal += item?.totalPrice / shareCount;
    });

    const subtotal = calculateSubtotal();
    if (subtotal === 0) return 0;

    if (taxTipData?.splitMethod === 'proportional') {
      const proportion = itemsTotal / subtotal;
      return itemsTotal + (taxTipData?.tax * proportion) + (taxTipData?.tip * proportion);
    } else {
      const equalShare = (taxTipData?.tax + taxTipData?.tip) / participants?.length;
      return itemsTotal + equalShare;
    }
  };

  const handleToggleParticipant = (itemId, participantId) => {
    setItems(prev => prev?.map(item => {
      if (item?.id === itemId) {
        const assignedTo = item?.assignedTo || [];
        const isAssigned = assignedTo?.includes(participantId);
        return {
          ...item,
          assignedTo: isAssigned
            ? assignedTo?.filter(id => id !== participantId)
            : [...assignedTo, participantId]
        };
      }
      return item;
    }));
  };

  const handleRemoveItem = (itemId) => {
    setItems(prev => prev?.filter(item => item?.id !== itemId));
  };

  const handleAddItem = (itemData) => {
    const newItem = {
      id: `item-${Date.now()}`,
      name: itemData?.name,
      quantity: itemData?.quantity,
      unitPrice: itemData?.unitPrice,
      totalPrice: itemData?.quantity * itemData?.unitPrice,
      assignedTo: []
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleAddParticipant = (participantData) => {
    const newParticipant = {
      id: `participant-${Date.now()}`,
      name: participantData?.name,
      email: participantData?.email
    };
    setParticipants(prev => [...prev, newParticipant]);
  };

  const handleRemoveParticipant = (participantId) => {
    setParticipants(prev => prev?.filter(p => p?.id !== participantId));
    setItems(prev => prev?.map(item => ({
      ...item,
      assignedTo: item?.assignedTo?.filter(id => id !== participantId) || []
    })));
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const getParticipantItemCount = (participantId) => {
    return items?.filter(item => item?.assignedTo?.includes(participantId))?.length;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Split the Bill</h1>
          <p className="text-muted-foreground">
            Assign items to participants and calculate individual amounts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center">
                  <Icon name="ShoppingBagIcon" size={24} variant="outline" className="mr-2" />
                  Receipt Items ({items?.length})
                </h2>
              </div>

              <div className="space-y-3 mb-4">
                {items?.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon name="ReceiptPercentIcon" size={48} variant="outline" className="mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No items added yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Add items to start splitting</p>
                  </div>
                ) : (
                  items?.map(item => (
                    <ReceiptItemCard
                      key={item?.id}
                      item={item}
                      participants={participants}
                      onToggleParticipant={handleToggleParticipant}
                      onRemoveItem={handleRemoveItem}
                    />
                  ))
                )}
              </div>

              <AddItemForm onAdd={handleAddItem} />
            </div>

            <TaxTipControls onUpdate={setTaxTipData} />
          </div>

          {/* Right Column - Participants & Summary */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <Icon name="UsersIcon" size={24} variant="outline" className="mr-2" />
                Participants ({participants?.length})
              </h2>

              <div className="space-y-3 mb-4">
                {participants?.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon name="UserPlusIcon" size={40} variant="outline" className="mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Add participants to split bill</p>
                  </div>
                ) : (
                  participants?.map(participant => (
                    <ParticipantCard
                      key={participant?.id}
                      participant={participant}
                      totalAmount={calculateParticipantAmount(participant?.id)}
                      itemCount={getParticipantItemCount(participant?.id)}
                      onRemove={handleRemoveParticipant}
                    />
                  ))
                )}
              </div>

              <AddParticipantForm onAdd={handleAddParticipant} />
            </div>

            <SplitSummary
              subtotal={calculateSubtotal()}
              tax={taxTipData?.tax}
              tip={taxTipData?.tip}
              total={calculateTotal()}
              splitMethod={taxTipData?.splitMethod}
            />

            <button
              onClick={handleExport}
              disabled={participants?.length === 0 || items?.length === 0}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-success text-success-foreground rounded-lg font-medium hover:bg-success/90 transition-quick disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="ShareIcon" size={20} variant="solid" />
              <span>Export & Share</span>
            </button>
          </div>
        </div>
      </div>
      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1030 p-4">
          <div className="bg-card rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-foreground">Export Split</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 hover:bg-muted rounded-md transition-quick"
              >
                <Icon name="XMarkIcon" size={20} variant="outline" />
              </button>
            </div>

            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 px-4 py-3 bg-muted hover:bg-muted/80 rounded-lg transition-quick">
                <Icon name="EnvelopeIcon" size={20} variant="outline" />
                <span className="text-foreground font-medium">Send via Email</span>
              </button>

              <button className="w-full flex items-center space-x-3 px-4 py-3 bg-muted hover:bg-muted/80 rounded-lg transition-quick">
                <Icon name="LinkIcon" size={20} variant="outline" />
                <span className="text-foreground font-medium">Copy Payment Link</span>
              </button>

              <button className="w-full flex items-center space-x-3 px-4 py-3 bg-muted hover:bg-muted/80 rounded-lg transition-quick">
                <Icon name="DocumentTextIcon" size={20} variant="outline" />
                <span className="text-foreground font-medium">Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

BillSplittingInteractive.propTypes = {
  initialData: PropTypes?.shape({
    items: PropTypes?.arrayOf(
      PropTypes?.shape({
        id: PropTypes?.string?.isRequired,
        name: PropTypes?.string?.isRequired,
        quantity: PropTypes?.number?.isRequired,
        unitPrice: PropTypes?.number?.isRequired,
        totalPrice: PropTypes?.number?.isRequired,
        assignedTo: PropTypes?.arrayOf(PropTypes?.string)
      })
    ),
    participants: PropTypes?.arrayOf(
      PropTypes?.shape({
        id: PropTypes?.string?.isRequired,
        name: PropTypes?.string?.isRequired,
        email: PropTypes?.string?.isRequired
      })
    )
  })?.isRequired
};

export default BillSplittingInteractive;