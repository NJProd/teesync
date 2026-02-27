'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@teesync/utils';
import type { Tab, TabItem } from '@teesync/types';
import {
  CreditCard,
  Banknote,
  Split,
  X,
  Check,
  Percent,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type PaymentMethod = 'card' | 'cash' | 'split';
type TipOption = 0 | 15 | 18 | 20 | 'custom';

interface CheckoutDialogProps {
  tab: Tab;
  items: TabItem[];
  taxRate: number;
  onClose: () => void;
  onComplete: (method: PaymentMethod, tipAmount: number) => void;
}

export function CheckoutDialog({
  tab,
  items,
  taxRate,
  onClose,
  onComplete,
}: CheckoutDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [tipOption, setTipOption] = useState<TipOption>(0);
  const [customTip, setCustomTip] = useState('');
  const [processing, setProcessing] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discount = tab.discountTotal ?? 0;
  const taxable = subtotal - discount;
  const tax = Math.round(taxable * taxRate);
  const preTotal = taxable + tax;

  const tipAmount =
    tipOption === 'custom'
      ? Math.round(parseFloat(customTip || '0') * 100)
      : Math.round(preTotal * (tipOption / 100));

  const grandTotal = preTotal + tipAmount;

  const handleProcess = () => {
    setProcessing(true);
    // Simulate processing delay
    setTimeout(() => {
      onComplete(paymentMethod, tipAmount);
    }, 1200);
  };

  const tipOptions: { value: TipOption; label: string }[] = [
    { value: 0, label: 'No Tip' },
    { value: 15, label: '15%' },
    { value: 18, label: '18%' },
    { value: 20, label: '20%' },
    { value: 'custom', label: 'Custom' },
  ];

  const paymentMethods: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    { value: 'card', label: 'Card', icon: <CreditCard className="w-5 h-5" /> },
    { value: 'cash', label: 'Cash', icon: <Banknote className="w-5 h-5" /> },
    { value: 'split', label: 'Split', icon: <Split className="w-5 h-5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-white">Close Tab</h2>
            <p className="text-sm text-zinc-500">{tab.customerName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items summary */}
        <div className="px-6 py-3 max-h-40 overflow-y-auto border-b border-zinc-800/50">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-1 text-sm">
              <span className="text-zinc-400">
                {item.quantity}× {item.name}
              </span>
              <span className="text-zinc-300 font-mono tabular-nums">
                {formatCurrency(item.unitPrice * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="px-6 py-3 space-y-1 border-b border-zinc-800/50 text-sm">
          <div className="flex justify-between text-zinc-500">
            <span>Subtotal</span>
            <span className="font-mono tabular-nums">{formatCurrency(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span className="flex items-center gap-1">
                <Percent className="w-3 h-3" /> Discount
              </span>
              <span className="font-mono tabular-nums">-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-zinc-500">
            <span>Tax</span>
            <span className="font-mono tabular-nums">{formatCurrency(tax)}</span>
          </div>
          {tipAmount > 0 && (
            <div className="flex justify-between text-zinc-400">
              <span>Tip</span>
              <span className="font-mono tabular-nums">{formatCurrency(tipAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-white font-bold text-base pt-1 border-t border-zinc-800">
            <span>Total</span>
            <span className="font-mono tabular-nums">{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        {/* Tip selection */}
        <div className="px-6 py-3 border-b border-zinc-800/50">
          <p className="text-xs text-zinc-600 uppercase tracking-wider mb-2">Tip</p>
          <div className="flex gap-2">
            {tipOptions.map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => setTipOption(opt.value)}
                className={cn(
                  'flex-1 py-2 rounded-lg text-xs font-medium transition-colors',
                  tipOption === opt.value
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 border border-transparent'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {tipOption === 'custom' && (
            <div className="mt-2 relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={customTip}
                onChange={(e) => setCustomTip(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}
        </div>

        {/* Payment method */}
        <div className="px-6 py-3 border-b border-zinc-800/50">
          <p className="text-xs text-zinc-600 uppercase tracking-wider mb-2">Payment Method</p>
          <div className="flex gap-2">
            {paymentMethods.map((method) => (
              <button
                key={method.value}
                onClick={() => setPaymentMethod(method.value)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-colors',
                  paymentMethod === method.value
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 border border-transparent'
                )}
              >
                {method.icon}
                <span className="text-xs font-medium">{method.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="px-6 py-4">
          <Button
            onClick={handleProcess}
            disabled={processing}
            className="w-full h-14 text-base font-bold"
            variant={processing ? 'secondary' : 'success'}
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                Charge {formatCurrency(grandTotal)}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
