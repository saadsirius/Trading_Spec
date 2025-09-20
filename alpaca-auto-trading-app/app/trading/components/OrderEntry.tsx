/**
 * File: app/trading/components/OrderEntry.tsx
 * Notes:
 * - Single zod schema with conditional checks via superRefine
 * - Price sanity & circuit breaker checks (configurable)
 * - Safer numeric inputs (coerce + guard empty -> undefined)
 * - Submit only after preview was shown & still valid
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { z } from 'zod';
import { useTradingStore } from '@/state/tradingStore';
import { useNotificationStore } from '@/state/notificationStore';

const CIRCUIT = {
  maxOrderNotional: 250_000,            // hard cap on order value
  maxQty: 100_000,                      // hard cap on quantity
  maxLimitPctAway: 0.2,                 // 20% from last price
  maxStopPctAway: 0.25,                 // 25% from last price
};

const OrderSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  side: z.enum(['buy', 'sell'], { required_error: 'Side is required' }),
  qty: z.coerce.number().int('Quantity must be a whole number').positive('Quantity must be positive'),
  type: z.enum(['market', 'limit', 'stop', 'stop_limit'], { required_error: 'Order type is required' }),
  timeInForce: z.enum(['day', 'gtc'], { required_error: 'Time in force is required' }),
  limitPrice: z.coerce.number().positive().optional().or(z.literal('').transform(() => undefined)),
  stopPrice: z.coerce.number().positive().optional().or(z.literal('').transform(() => undefined)),
  // context fields (not sent to API) — used for validation
  lastPrice: z.number().positive().optional(),
  availableQty: z.number().int().nonnegative().optional(), // for SELL qty check
  buyingPower: z.number().nonnegative().optional(),        // for BUY notional check
}).superRefine((data, ctx) => {
  const { type, limitPrice, stopPrice, lastPrice, side, qty, buyingPower, availableQty } = data;

  // Required fields based on type
  if (type === 'limit' && !limitPrice) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['limitPrice'], message: 'Limit price is required for limit orders' });
  }
  if ((type === 'stop' || type === 'stop_limit') && !stopPrice) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['stopPrice'], message: 'Stop price is required for stop orders' });
  }
  if (type === 'stop_limit' && !limitPrice) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['limitPrice'], message: 'Limit price is required for stop limit orders' });
  }

  // Circuit breaker: max qty
  if (qty > CIRCUIT.maxQty) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['qty'], message: `Quantity exceeds max (${CIRCUIT.maxQty.toLocaleString()})` });
  }

  // SELL: must have enough shares
  if (side === 'sell' && typeof availableQty === 'number' && qty > availableQty) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['qty'], message: `Insufficient shares. Available: ${availableQty}` });
  }

  // BUY: notional within buying power (for limit/stop-limit we use limit price; for market use last/stop)
  const referenceBuyPrice =
    type === 'market' ? lastPrice :
    type === 'limit' ? limitPrice :
    type === 'stop' ? stopPrice :
    type === 'stop_limit' ? limitPrice : undefined;

  if (side === 'buy' && typeof referenceBuyPrice === 'number' && typeof buyingPower === 'number') {
    const notional = referenceBuyPrice * qty;
    if (notional > buyingPower) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['qty'],
        message: `Insufficient buying power. Need $${notional.toLocaleString(undefined, { maximumFractionDigits: 2 })}, Available $${buyingPower.toLocaleString()}`,
      });
    }
    if (notional > CIRCUIT.maxOrderNotional) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['qty'],
        message: `Order value exceeds limit ($${CIRCUIT.maxOrderNotional.toLocaleString()})`,
      });
    }
  }

  // Price sanity vs lastPrice
  if (typeof lastPrice === 'number') {
    if (typeof limitPrice === 'number') {
      const pct = Math.abs(limitPrice - lastPrice) / lastPrice;
      if (pct > CIRCUIT.maxLimitPctAway) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['limitPrice'],
          message: `Limit is ${Math.round(pct * 100)}% from last ($${lastPrice.toFixed(2)})`,
        });
      }
    }
    if (typeof stopPrice === 'number') {
      const pct = Math.abs(stopPrice - lastPrice) / lastPrice;
      if (pct > CIRCUIT.maxStopPctAway) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['stopPrice'],
          message: `Stop is ${Math.round(pct * 100)}% from last ($${lastPrice.toFixed(2)})`,
        });
      }
    }
  }
});

type OrderFormData = z.infer<typeof OrderSchema>;

interface OrderEntryProps {
  symbol: string;
  account: any;
  onOrderSubmitted: () => void;
  lastPrice?: number;       // pass quote.last or NBBO mid if you have it
}

interface OrderPreview {
  symbol: string;
  side: string;
  qty: number;
  type: string;
  timeInForce: string;
  limitPrice?: number;
  stopPrice?: number;
  estimatedCost: number;
  marginImpact: number;
  warnings: string[];
}

export default function OrderEntry({ symbol, account, onOrderSubmitted, lastPrice }: OrderEntryProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    symbol,
    side: 'buy',
    qty: 1,
    type: 'limit',
    timeInForce: 'day',
    limitPrice: undefined,
    stopPrice: undefined,
    lastPrice: lastPrice ?? undefined,
    availableQty: 0,
    buyingPower: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<OrderPreview | null>(null);
  const [previewReady, setPreviewReady] = useState(false); // require preview before submit

  const { mode, getPositionBySymbol, getBuyingPower } = useTradingStore();
  const { addNotification } = useNotificationStore();

  // keep derived fields (availableQty/buyingPower/lastPrice) in form data for schema context
  useEffect(() => {
    const pos = getPositionBySymbol(symbol);
    const availableQty = pos ? Number.parseInt(pos.qty, 10) || 0 : 0;
    const buyingPower = Number(getBuyingPower()) || 0;
    setFormData(prev => ({
      ...prev,
      symbol,
      availableQty,
      buyingPower,
      lastPrice: lastPrice ?? prev.lastPrice,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, lastPrice, getPositionBySymbol, getBuyingPower]);

  const validateForm = useCallback(() => {
    try {
      const parsed = OrderSchema.parse(formData);
      setErrors({});
      setIsValid(true);
      return parsed;
    } catch (e) {
      const map: Record<string, string> = {};
      if (e instanceof z.ZodError) {
        for (const issue of e.issues) {
          const key = issue.path[0] as string;
          if (key) map[key] = issue.message;
        }
      }
      setErrors(map);
      setIsValid(false);
      return null;
    }
  }, [formData]);

  const generatePreview = useCallback(() => {
    const parsed = validateForm();
    if (!parsed) {
      setPreview(null);
      setPreviewReady(false);
      return;
    }

    // choose pricing for estimated cost
    const refPrice =
      parsed.type === 'market'
        ? parsed.lastPrice ?? 0
        : parsed.type === 'limit'
        ? parsed.limitPrice ?? 0
        : parsed.type === 'stop'
        ? parsed.stopPrice ?? 0
        : parsed.limitPrice ?? 0;

    const estimatedCost = (refPrice || 0) * parsed.qty;
    const marginImpact = parsed.side === 'buy' ? estimatedCost : 0;

    const warnings: string[] = [];
    if (parsed.type === 'market') warnings.push('Market orders execute at the current market price and may experience slippage.');
    if (parsed.timeInForce === 'gtc') warnings.push('GTC orders remain active until filled or canceled.');
    if (mode === 'live') warnings.push('⚠️ LIVE TRADING MODE — orders execute with real funds.');
    if (!parsed.lastPrice) warnings.push('No reference price available; preview may be less accurate.');

    setPreview({
      symbol: parsed.symbol,
      side: parsed.side,
      qty: parsed.qty,
      type: parsed.type,
      timeInForce: parsed.timeInForce,
      limitPrice: parsed.limitPrice,
      stopPrice: parsed.stopPrice,
      estimatedCost,
      marginImpact,
      warnings,
    });
    setPreviewReady(true);
  }, [mode, validateForm]);

  // re-validate and re-preview on changes
  useEffect(() => {
    setPreviewReady(false);
    validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleInputChange = (field: keyof OrderFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value as any }));
  };

  const handleSubmit = async () => {
    if (!isValid || !preview || !previewReady) return;
    setIsSubmitting(true);

    try {
      const clientOrderId = `ui-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

      const orderPayload: Record<string, any> = {
        symbol: formData.symbol.trim().toUpperCase(),
        qty: String(formData.qty),
        side: formData.side,
        type: formData.type,
        time_in_force: formData.timeInForce,
        client_order_id: clientOrderId,
      };
      if (formData.limitPrice) orderPayload.limit_price = String(formData.limitPrice);
      if (formData.stopPrice) orderPayload.stop_price = String(formData.stopPrice);

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        let message = 'Failed to submit order';
        try {
          const e = await res.json();
          message = e.message || message;
        } catch {}
        throw new Error(message);
      }

      await res.json();

      addNotification({
        type: 'success',
        title: 'Order Submitted',
        message: `${formData.side.toUpperCase()} ${formData.qty} ${formData.symbol} submitted`,
        symbol: formData.symbol,
      });

      // reset price & qty but keep symbol/side/type/TIF
      setFormData(prev => ({
        ...prev,
        qty: 1,
        limitPrice: undefined,
        stopPrice: undefined,
      }));
      setShowPreview(false);
      setPreviewReady(false);
      onOrderSubmitted?.();
    } catch (error: any) {
      addNotification({
        type: 'critical',
        title: 'Order Failed',
        message: error?.message ?? 'Failed to submit order',
        symbol: formData.symbol,
        persistent: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field: keyof OrderFormData) =>
    errors[field as string] ? <p className="text-red-400 text-xs mt-1">{errors[field as string]}</p> : null;

  return (
    <div className="ds-card p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Order Entry</h3>

      <div className="space-y-4">
        {/* Symbol */}
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-300 mb-1">Symbol</label>
          <input
            id="symbol"
            type="text"
            value={formData.symbol}
            onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter symbol"
            autoComplete="off"
          />
          {getFieldError('symbol')}
        </div>

        {/* Side */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Side</label>
          <div className="flex space-x-2">
            {(['buy', 'sell'] as const).map(s => (
              <button
                key={s}
                onClick={() => handleInputChange('side', s)}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  formData.side === s
                    ? (s === 'buy' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white')
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                type="button"
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
          {getFieldError('side')}
        </div>

        {/* Quantity */}
        <div>
          <label htmlFor="qty" className="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
          <input
            id="qty"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={formData.qty}
            onChange={(e) => {
              const val = e.target.value === '' ? 1 : Math.max(1, Math.floor(Number(e.target.value)));
              handleInputChange('qty', val);
            }}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {getFieldError('qty')}
        </div>

        {/* Order Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">Order Type</label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value as OrderFormData['type'])}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="market">Market</option>
            <option value="limit">Limit</option>
            <option value="stop">Stop</option>
            <option value="stop_limit">Stop Limit</option>
          </select>
          {getFieldError('type')}
        </div>

        {/* Limit Price */}
        {(formData.type === 'limit' || formData.type === 'stop_limit') && (
          <div>
            <label htmlFor="limitPrice" className="block text-sm font-medium text-gray-300 mb-1">Limit Price</label>
            <input
              id="limitPrice"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={formData.limitPrice ?? ''}
              onChange={(e) => {
                const val = e.target.value === '' ? undefined : Math.max(0, Number(e.target.value));
                handleInputChange('limitPrice', Number.isFinite(val as number) ? val : undefined);
              }}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={formData.lastPrice ? `≈ ${formData.lastPrice.toFixed(2)}` : 'Enter limit price'}
            />
            {getFieldError('limitPrice')}
          </div>
        )}

        {/* Stop Price */}
        {(formData.type === 'stop' || formData.type === 'stop_limit') && (
          <div>
            <label htmlFor="stopPrice" className="block text-sm font-medium text-gray-300 mb-1">Stop Price</label>
            <input
              id="stopPrice"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={formData.stopPrice ?? ''}
              onChange={(e) => {
                const val = e.target.value === '' ? undefined : Math.max(0, Number(e.target.value));
                handleInputChange('stopPrice', Number.isFinite(val as number) ? val : undefined);
              }}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={formData.lastPrice ? `≈ ${formData.lastPrice.toFixed(2)}` : 'Enter stop price'}
            />
            {getFieldError('stopPrice')}
          </div>
        )}

        {/* Time in Force */}
        <div>
          <label htmlFor="timeInForce" className="block text-sm font-medium text-gray-300 mb-1">Time in Force</label>
          <select
            id="timeInForce"
            value={formData.timeInForce}
            onChange={(e) => handleInputChange('timeInForce', e.target.value as OrderFormData['timeInForce'])}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="day">Day</option>
            <option value="gtc">Good Till Cancelled</option>
          </select>
          {getFieldError('timeInForce')}
        </div>

        {/* Actions */}
        <button
          onClick={() => {
            generatePreview();
            setShowPreview(true);
          }}
          disabled={!isValid}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          type="button"
        >
          Preview Order
        </button>

        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting || !previewReady}
          className="w-full py-2 px-4 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          type="button"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Order'}
        </button>
      </div>

      {/* Modal */}
      {showPreview && preview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h4 className="text-lg font-semibold text-white mb-4">Order Preview</h4>

            <div className="space-y-3 text-sm">
              <Row label="Symbol" value={preview.symbol} />
              <Row label="Side" value={<span className={preview.side === 'buy' ? 'text-emerald-400' : 'text-red-400'}>{preview.side.toUpperCase()}</span>} />
              <Row label="Quantity" value={preview.qty.toLocaleString()} />
              <Row label="Type" value={preview.type} />
              {typeof preview.limitPrice === 'number' && <Row label="Limit Price" value={`$${preview.limitPrice.toFixed(2)}`} />}
              {typeof preview.stopPrice === 'number' && <Row label="Stop Price" value={`$${preview.stopPrice.toFixed(2)}`} />}
              <Row label="Time in Force" value={preview.timeInForce.toUpperCase()} />
              <Row label="Estimated Cost" value={`$${preview.estimatedCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
            </div>

            {preview.warnings.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded-md">
                <h5 className="text-yellow-400 font-medium mb-2">Warnings</h5>
                <ul className="text-yellow-300 text-sm space-y-1">
                  {preview.warnings.map((w, i) => <li key={i}>• {w}</li>)}
                </ul>
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPreview(false);
                  handleSubmit();
                }}
                className="flex-1 py-2 px-4 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                type="button"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}:</span>
      <span className="text-white">{value}</span>
    </div>
  );
}