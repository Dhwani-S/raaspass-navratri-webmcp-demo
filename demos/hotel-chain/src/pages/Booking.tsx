/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { hotels } from '../data/hotels';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { useBookingState } from '../hooks/useBookingState';
import { CITY_LABELS } from '../constants';
import { clsx } from 'clsx';
import { isWebMCPEnabled } from '../webmcp';

export default function Booking() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { bookingInfo, formattedBookingDates, formattedGuests } = useBookingState();
  const webMCPEnabled = isWebMCPEnabled();

  const hotel = hotels.find(h => h.id === id || h.id.toLowerCase() === id?.toLowerCase() || h.name.toLowerCase() === id?.toLowerCase()) || hotels[0];
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (values = formData) => {
    const newErrors: Record<string, string> = {};
    if (!values.firstName.trim()) newErrors.firstName = "First name is required";
    else if (values.firstName.length < 2) newErrors.firstName = "First name must be at least 2 characters";
    
    if (!values.lastName.trim()) newErrors.lastName = "Last name is required";
    else if (values.lastName.length < 2) newErrors.lastName = "Last name must be at least 2 characters";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!values.email) newErrors.email = "Email is required";
    else if (!emailRegex.test(values.email)) newErrors.email = "Invalid email format";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    const submittedForm = new FormData(e.currentTarget as HTMLFormElement);
    const submittedData = {
      firstName: String(submittedForm.get('firstName') || ''),
      lastName: String(submittedForm.get('lastName') || ''),
      email: String(submittedForm.get('email') || '')
    };
    setFormData(submittedData);

    const isValid = validate(submittedData);
    const nativeEvent = e.nativeEvent as any;

    if (!isValid) {
      if (nativeEvent.agentInvoked && nativeEvent.respondWith) {
        // Report the first error to the agent
        const firstError = Object.values(errors)[0] || "Invalid form data";
        nativeEvent.respondWith({ success: false, error: firstError });
      }
      return;
    }

    if (nativeEvent.agentInvoked && nativeEvent.respondWith) {
      nativeEvent.respondWith({
        success: true,
        message: `Navratri passes for ${hotel.name} are confirmed for ${submittedData.firstName} ${submittedData.lastName}.`
      });
    }

    // Yield to the browser's macrotask queue. 
    // This allows the native 'submit' event to finish bubbling up to the
    // document level before React synchronously destroys the <form> DOM node.
    setTimeout(() => {
      setSuccess(true);
    }, 0);
  };

  if (success) {
    return (
      <main data-testid="booking-success" className="pt-32 pb-24 max-w-[1440px] mx-auto px-8 min-h-[70vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
        <span
          className="material-symbols-outlined text-[120px] text-emerald-600 mb-8 drop-shadow-xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          check_circle
        </span>
        <h1 className="font-headline text-5xl font-extrabold text-primary mb-4 tracking-tighter">Your pass is confirmed</h1>
        <p className="text-on-surface-variant mb-12 text-lg max-w-md mx-auto leading-relaxed">
          Your Navratri night at <span className="text-primary font-bold">{hotel.name}</span> is locked in. Get ready to dance.
        </p>
        <Button variant="outline" onClick={() => navigate('/')}>Return to Home</Button>
      </main>
    );
  }

  return (
    <main className="pt-32 pb-24 max-w-[1440px] mx-auto px-8 w-full">
      <PageHeader
        label="Secure your Navratri night"
        title="Complete your pass"
        description={
          <>
            You are booking entry to <span className="text-primary font-bold">{hotel.name}</span>.
            Your night in {CITY_LABELS[hotel.city] || hotel.city} begins here.
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Main Form Column */}
        <div className="lg:col-span-7">
          <form
            id="booking-form"
            data-testid="booking-form"
            onSubmit={handleConfirm}
            {...(webMCPEnabled ? {
              toolname: 'complete_booking',
              tooldescription: "Complete the Navratri pass booking by providing the primary dancer's information.",
              toolautosubmit: 'true'
            } : {})}
            className="space-y-20"
          >
            {/* Step 1: Contact */}
            <FormSection step="01" title="Dancer information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-12">
                <InputGroup
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  error={errors.firstName}
                  placeholder="e.g. Julian"
                  toolparamdescription="The first name of the primary guest."
                />
                <InputGroup
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  error={errors.lastName}
                  placeholder="e.g. Vane"
                  toolparamdescription="The last name of the primary guest."
                />
                <InputGroup
                  className="md:col-span-2"
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  error={errors.email}
                  placeholder="j.vane@atelier.com"
                  toolparamdescription="The email address where the reservation confirmation will be sent."
                />
              </div>
            </FormSection>

            {/* Step 2: Payment */}
            <FormSection step="02" title="Payment method">
              <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/20 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <span className="material-symbols-outlined text-primary text-4xl">credit_card</span>
                    <div>
                      <span className="font-headline font-bold block text-primary text-xl">Demo payment ending in •••• XXXX</span>
                      <span className="text-sm text-outline font-bold mt-1 block uppercase tracking-widest">Expires 12/28</span>
                    </div>
                  </div>
                  <div className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider self-start sm:self-auto border border-on-tertiary-fixed-variant/10 shadow-sm">
                    Mock payment
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Step 3: Review */}
            <FormSection step="03" title="Final review">
              <div className="space-y-8">
                <div className="flex items-start gap-4 p-8 bg-tertiary-fixed/30 rounded-xl border border-tertiary-fixed-dim/20">
                  <span className="material-symbols-outlined text-on-tertiary-fixed-variant text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <div>
                    <h4 className="font-headline font-bold text-lg text-on-tertiary-fixed-variant mb-2">Your pass includes</h4>
                    <p className="text-on-tertiary-fixed-variant/90 leading-relaxed">
                      Your pass includes <span className="font-bold underline underline-offset-4">full-night entry, live dandiya, and venue perks</span> for the selected date.
                    </p>
                  </div>
                </div>
                <Button
                  type="submit"
                  form="booking-form"
                  size="full"
                  className="py-6 rounded-xl shadow-2xl shadow-primary/20 scale-105"
                >
                  Confirm Pass Booking
                </Button>
              </div>
            </FormSection>
          </form>
        </div>

        {/* Sidebar Summary Column */}
        <aside className="lg:col-span-5 sticky top-32">
          <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_40px_80px_rgba(0,12,30,0.06)] border border-outline-variant/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-tertiary-fixed/10 rounded-full -mr-24 -mt-24 blur-3xl" />

            <div className="flex gap-8 mb-10 pb-8 border-b border-outline-variant/10">
              <div className="w-24 h-32 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
                <img alt={hotel.name} className="w-full h-full object-cover" src={hotel.imageSrc} />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="font-headline font-bold text-2xl tracking-tighter text-primary mb-2 line-clamp-2">{hotel.name}</h3>
                <p className="text-[10px] text-outline font-bold uppercase tracking-[0.2em]">
                  {CITY_LABELS[hotel.city] || hotel.city}
                </p>
                <div className="flex items-center gap-1 mt-4 text-on-tertiary-container">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6 mb-10">
              <SummaryItem label="Dates" value={formattedBookingDates} />
              <SummaryItem label="Pass holders" value={formattedGuests} />
              <SummaryItem
                label="Entry"
                value={<span className="text-[10px] font-bold text-on-tertiary-container bg-tertiary-fixed px-3 py-1.5 rounded-full shadow-sm">QR FAST-LANE</span>}
              />
            </div>

            <div className="pt-8 space-y-5 border-t border-outline-variant/10">
              <div className="flex justify-between text-sm font-medium text-secondary">
                <span>{bookingInfo.nights} {bookingInfo.nights === 1 ? 'Night' : 'Nights'}</span>
                <span className="text-primary font-bold">₹{hotel.price * bookingInfo.nights}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-secondary">
                <span>Taxes & booking fee</span>
                <span className="text-primary font-bold">₹{Math.round(hotel.price * bookingInfo.nights * 0.1)}</span>
              </div>
              <div className="flex justify-between items-end pt-8 mt-4 border-t-2 border-primary/5">
                <div>
                  <span className="font-bold text-primary text-sm uppercase tracking-widest block mb-1">Total Amount</span>
                  <span className="text-[10px] text-outline font-bold uppercase tracking-widest italic">Guaranteed Price</span>
                </div>
                <div className="text-right">
                  <span className="text-primary font-headline font-extrabold text-4xl tracking-tighter">
                    ₹{Math.round(hotel.price * bookingInfo.nights * 1.1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function FormSection({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-6 mb-10">
        <span className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-extrabold shadow-lg">
          {step}
        </span>
        <h2 className="font-headline text-3xl font-bold tracking-tight text-primary">{title}</h2>
      </div>
      <div className="pl-16">
        {children}
      </div>
    </section>
  );
}

interface InputGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  toolparamdescription?: string;
}

function InputGroup({ label, error, className, toolparamdescription, ...props }: InputGroupProps) {
  return (
    <div className={clsx("relative group", className)}>
      <label className={clsx(
        "text-[10px] uppercase tracking-[0.2em] font-bold mb-2 block transition-colors",
        error ? "text-error" : "text-outline group-focus-within:text-primary"
      )}>
        {label}
      </label>
      <input
        toolparamdescription={toolparamdescription}
        className={clsx(
          "w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b-2 transition-all placeholder:text-surface-container-highest font-medium text-lg",
          error 
            ? "border-error text-error focus:border-error focus:ring-0" 
            : "border-outline-variant/30 text-primary focus:border-primary focus:ring-0"
        )}
        {...props}
      />
      {error && (
        <span className="absolute -bottom-6 left-0 text-[11px] font-bold text-error animate-in fade-in slide-in-from-top-1 duration-300">
          {error}
        </span>
      )}
    </div >
  );
}

function SummaryItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center group">
      <span className="text-sm font-bold text-outline uppercase tracking-widest group-hover:text-primary transition-colors">{label}</span>
      <span className="text-sm font-bold text-primary">{value}</span>
    </div>
  );
}
