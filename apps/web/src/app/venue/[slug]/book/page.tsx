'use client';

import { useState, useMemo } from 'react';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { useTenant } from '@/lib/tenant-context';
import { formatCurrency } from '@teesync/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Phone,
  Check,
  Loader2,
  MapPin,
} from 'lucide-react';

// Demo data for bays and existing bookings
const DEMO_BAYS = [
  { id: 'bay1', name: 'Bay 1', simulator: 'TrackMan 4', hourlyRate: 6000 },
  { id: 'bay2', name: 'Bay 2', simulator: 'TrackMan 4', hourlyRate: 6000 },
  { id: 'bay3', name: 'Bay 3', simulator: 'Full Swing', hourlyRate: 5000 },
  { id: 'bay4', name: 'Bay 4', simulator: 'Full Swing', hourlyRate: 5000 },
  { id: 'bay5', name: 'Bay 5', simulator: 'Golfzon', hourlyRate: 4500 },
  { id: 'bay6', name: 'Bay 6', simulator: 'Golfzon', hourlyRate: 4500 },
];

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
];

function formatSlotTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  const period = h! >= 12 ? 'PM' : 'AM';
  const hour12 = h! % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

type BookingStep = 'date' | 'bay' | 'time' | 'details' | 'confirm';

export default function BookingPage() {
  const { tenant, loading } = useTenant();

  const [step, setStep] = useState<BookingStep>('date');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedBay, setSelectedBay] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [duration, setDuration] = useState(1); // hours
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    partySize: 1,
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Generate next 14 days for date selection
  const dates = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 14 }, (_, i) => addDays(today, i));
  }, []);

  const selectedBayData = DEMO_BAYS.find((b) => b.id === selectedBay);
  const totalPrice = selectedBayData ? selectedBayData.hourlyRate * duration : 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitted(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  const venueName = tenant?.name ?? 'Indoor Golf Venue';

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-600/20 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Booking Confirmed!</h2>
            <p className="text-zinc-400">
              Your booking at {venueName} has been received. You&apos;ll receive a confirmation email shortly.
            </p>
            <div className="bg-zinc-800/50 rounded-xl p-4 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Date</span>
                <span className="text-white">{format(selectedDate, 'EEEE, MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Bay</span>
                <span className="text-white">{selectedBayData?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Time</span>
                <span className="text-white">{selectedTime && formatSlotTime(selectedTime)} ({duration}hr)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Total</span>
                <span className="text-emerald-400 font-bold">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
            <Button
              onClick={() => {
                setSubmitted(false);
                setStep('date');
                setSelectedBay(null);
                setSelectedTime(null);
              }}
              variant="outline"
              className="mt-4"
            >
              Book Another
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <div>
              <h1 className="text-lg font-bold text-white">{venueName}</h1>
              <p className="text-xs text-zinc-500">Online Booking</p>
            </div>
          </div>
          <Badge variant="success">Open</Badge>
        </div>
      </header>

      {/* Progress steps */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-8">
          {(['date', 'bay', 'time', 'details', 'confirm'] as BookingStep[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => {
                  const stepOrder: BookingStep[] = ['date', 'bay', 'time', 'details', 'confirm'];
                  if (stepOrder.indexOf(s) < stepOrder.indexOf(step)) setStep(s);
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  s === step
                    ? 'bg-emerald-600 text-white'
                    : (['date', 'bay', 'time', 'details', 'confirm'].indexOf(s) <
                        ['date', 'bay', 'time', 'details', 'confirm'].indexOf(step))
                      ? 'bg-emerald-600/20 text-emerald-400'
                      : 'bg-zinc-800 text-zinc-600'
                }`}
              >
                {i + 1}
              </button>
              {i < 4 && <div className="w-8 h-px bg-zinc-800" />}
            </div>
          ))}
        </div>

        {/* Step: Date */}
        {step === 'date' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              Select a Date
            </h2>
            <div className="grid grid-cols-7 gap-2">
              {dates.map((date) => {
                const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                const isPast = isBefore(date, startOfDay(new Date()));
                return (
                  <button
                    key={date.toISOString()}
                    disabled={isPast}
                    onClick={() => {
                      setSelectedDate(date);
                      setStep('bay');
                    }}
                    className={`p-3 rounded-xl text-center transition-colors ${
                      isPast
                        ? 'opacity-30 cursor-not-allowed'
                        : isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="text-xs text-zinc-500">{format(date, 'EEE')}</div>
                    <div className="text-lg font-bold">{format(date, 'd')}</div>
                    <div className="text-xs">{format(date, 'MMM')}</div>
                    {isToday && (
                      <div className="text-[10px] text-emerald-400 mt-0.5">Today</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step: Bay */}
        {step === 'bay' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Choose a Bay</h2>
              <button onClick={() => setStep('date')} className="text-sm text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            </div>
            <p className="text-sm text-zinc-500">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEMO_BAYS.map((bay) => (
                <button
                  key={bay.id}
                  onClick={() => {
                    setSelectedBay(bay.id);
                    setStep('time');
                  }}
                  className={`p-4 rounded-xl border text-left transition-colors ${
                    selectedBay === bay.id
                      ? 'bg-emerald-600/10 border-emerald-500/30'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-bold text-white">{bay.name}</div>
                  <div className="text-sm text-zinc-500 mt-0.5">{bay.simulator}</div>
                  <div className="text-emerald-400 font-mono text-sm mt-2">
                    {formatCurrency(bay.hourlyRate)}/hr
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Time */}
        {step === 'time' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                Pick a Time
              </h2>
              <button onClick={() => setStep('bay')} className="text-sm text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            </div>
            <p className="text-sm text-zinc-500">
              {format(selectedDate, 'EEEE, MMMM d')} · {selectedBayData?.name}
            </p>

            {/* Duration */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-400">Duration:</span>
              {[1, 1.5, 2, 3].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    duration === d
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                  }`}
                >
                  {d}hr
                </button>
              ))}
            </div>

            {/* Time grid */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {TIME_SLOTS.map((slot) => {
                const isSelected = selectedTime === slot;
                return (
                  <button
                    key={slot}
                    onClick={() => {
                      setSelectedTime(slot);
                      setStep('details');
                    }}
                    className={`p-3 rounded-xl text-center transition-colors ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="text-sm font-medium">{formatSlotTime(slot)}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step: Details */}
        {step === 'details' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Your Details</h2>
              <button onClick={() => setStep('time')} className="text-sm text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400 flex items-center gap-1.5">
                    <User className="w-4 h-4" /> Full Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400 flex items-center gap-1.5">
                    <Mail className="w-4 h-4" /> Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400 flex items-center gap-1.5">
                    <Phone className="w-4 h-4" /> Phone
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Party Size</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <button
                        key={n}
                        onClick={() => setFormData((p) => ({ ...p, partySize: n }))}
                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                          formData.partySize === n
                            ? 'bg-emerald-600 text-white'
                            : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Notes (optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Birthday, corporate event, etc."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 resize-none h-20"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => setStep('confirm')}
              disabled={!formData.name || !formData.email}
              className="w-full h-12"
            >
              Review Booking <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Confirm Booking</h2>
              <button onClick={() => setStep('details')} className="text-sm text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Venue</span>
                  <span className="text-white">{venueName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Date</span>
                  <span className="text-white">{format(selectedDate, 'EEEE, MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Bay</span>
                  <span className="text-white">{selectedBayData?.name} ({selectedBayData?.simulator})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Time</span>
                  <span className="text-white">{selectedTime && formatSlotTime(selectedTime)} · {duration}hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Party Size</span>
                  <span className="text-white">{formData.partySize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Guest</span>
                  <span className="text-white">{formData.name}</span>
                </div>
                <div className="border-t border-zinc-800 pt-3 flex justify-between font-bold">
                  <span className="text-zinc-300">Total</span>
                  <span className="text-emerald-400 text-lg">{formatCurrency(totalPrice)}</span>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full h-14 text-base font-bold"
              variant="success"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Booking…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Confirm & Pay {formatCurrency(totalPrice)}
                </span>
              )}
            </Button>

            <p className="text-xs text-zinc-600 text-center">
              By booking you agree to the venue&apos;s cancellation policy. 
              A confirmation will be sent to {formData.email}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
