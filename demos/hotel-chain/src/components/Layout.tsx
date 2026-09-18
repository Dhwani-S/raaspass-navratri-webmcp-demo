/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { clsx } from 'clsx';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AVAILABLE_AMENITIES, Z_INDEX, getTargetCity } from '../constants';
import { hotels } from '../data/hotels';
import { useWebMCP } from 'use-webmcp-tool';
import { updateBookingInfo } from '../hooks/useBookingState';
import { Button } from './ui/Button';
import { isWebMCPEnabled } from '../webmcp';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const webMCPEnabled = isWebMCPEnabled();

  useWebMCP({
    name: 'search_location',
    enabled: webMCPEnabled,
    description: 'Search a Gujarat city or venue and return matching Navratri passes with venue IDs, prices, ratings, and perks',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The Gujarat city or venue query (e.g. "Ahmedabad")' },
        checkin_date: { type: 'string', description: 'Optional check-in date (YYYY-MM-DD)' },
        nights: { type: 'number', description: 'Optional number of festival nights' },
        adults: { type: 'number', description: 'Optional number of adult pass holders' },
        kids: { type: 'number', description: 'Optional number of child pass holders' }
      },
      required: ['query']
    },
    execute: (input: any) => {
      const bookingUpdates: any = { query: input.query };
      if (input.checkin_date) bookingUpdates.checkin_date = input.checkin_date;
      if (input.nights) bookingUpdates.nights = input.nights;
      if (input.adults !== undefined) bookingUpdates.adults = input.adults;
      if (input.kids !== undefined) bookingUpdates.kids = input.kids;
      if (input.pets !== undefined) bookingUpdates.pets = input.pets;

      updateBookingInfo(bookingUpdates);
      navigate('/search?q=' + encodeURIComponent(input.query));

      const query = input.query.toLowerCase();
      const targetCity = getTargetCity(input.query);
      const matchingVenues = hotels.filter(venue => {
        const cityMatch = targetCity === 'all' || (targetCity !== null && venue.city === targetCity);
        const venueMatch = venue.id.toLowerCase() === query || venue.name.toLowerCase().includes(query);
        return cityMatch || venueMatch;
      });

      return {
        success: true,
        query: input.query,
        checkin_date: input.checkin_date,
        adult_pass_holders: input.adults,
        filters_reset: true,
        count: matchingVenues.length,
        venues: matchingVenues.map(venue => ({
          id: venue.id,
          name: venue.name,
          price_inr: venue.price,
          rating: venue.rating,
          perks: venue.amenities.map(amenity => amenity.filterKey)
        })),
        message: `Found ${matchingVenues.length} Navratri pass venues for ${input.query}. Use a venue name or ID from this list with view_hotel.`
      };
    }
  });

  useWebMCP({
    name: 'lookup_amenity',
    enabled: webMCPEnabled,
    description: 'Look up a pass perk or venue detail for a Navratri event',
    inputSchema: {
      type: 'object',
      properties: {
        hotel_id: { type: 'string', description: 'The ID of the Navratri venue' },
        amenity: { type: 'string', enum: AVAILABLE_AMENITIES, description: 'The pass perk to verify (e.g. "dining" or "free parking")' }
      },
      required: ['hotel_id', 'amenity']
    },
    execute: (input: any) => {
      const formattedAmenity = input.amenity ? input.amenity.replace(/_/g, ' ') : input.amenity;
      const venue = hotels.find(h => h.id.toLowerCase() === input.hotel_id.toLowerCase());
      if (!venue) {
        return { success: false, error: `Could not find a venue with ID "${input.hotel_id}".` };
      }
      const hasAmenity = venue.amenities.some(am => am.filterKey === formattedAmenity.toLowerCase());
      if (!hasAmenity) {
        return { success: false, venue: venue.name, amenity: formattedAmenity, message: `${venue.name} does not list ${formattedAmenity} as an included perk.` };
      }
      navigate(`/hotel/${input.hotel_id}?amenity=${encodeURIComponent(formattedAmenity)}`);
      return { success: true, venue: venue.name, amenity: formattedAmenity, message: `${venue.name} includes ${formattedAmenity}.` };
    }
  });

  useWebMCP({
    name: 'view_hotel',
    enabled: webMCPEnabled,
    description: 'Open one specific Navratri venue by its exact name or ID. Do not pass a city name; use search_location for cities.',
    inputSchema: {
      type: 'object',
      properties: {
        hotel_name_or_id: { type: 'string', description: 'An exact venue name or venue ID returned by search_location, not a city name' }
      },
      required: ['hotel_name_or_id']
    },
    execute: (input: any) => {
      const query = input.hotel_name_or_id.toLowerCase();
      const hotel = hotels.find(h => h.id.toLowerCase() === query || h.name.toLowerCase().includes(query));
      if (hotel) {
        navigate(`/hotel/${hotel.id}`);
        return {
          success: true,
          hotel_id: hotel.id,
          venue: hotel.name,
          available_perks: hotel.amenities.map(amenity => amenity.filterKey),
          message: `Opened pass details for ${hotel.name}`
        };
      }
      return { success: false, error: `Could not find a venue matching "${input.hotel_name_or_id}". Please search first.` };
    }
  });

  return (
    <div className="min-h-screen flex flex-col items-center bg-white text-primary selection:bg-primary/10 selection:text-primary">
      {/* TopNavBar */}
      <nav 
        className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-outline-variant/10 transition-all duration-300"
        style={{ zIndex: Z_INDEX.NAV }}
      >
        <div className="max-w-[1440px] mx-auto flex justify-between items-center px-8 py-5">
          <div className="flex items-center gap-16">
            <Link 
              to="/" 
              className="text-3xl font-bold tracking-tighter text-primary font-headline hover:opacity-80 transition-opacity"
            >
              RaasPass
            </Link>
            <div className="hidden md:flex items-center gap-10">
              <NavLink to="/" active={location.pathname === '/'}>Home</NavLink>
              <NavLink to="/search" active={location.pathname.startsWith('/search')}>Find Passes</NavLink>
              <NavLink to="/search?q=all" active={false}>Venues</NavLink>
              <NavLink to="/" active={false}>How It Works</NavLink>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <Button variant="outline" size="sm" className="hidden sm:flex">My Passes</Button>
             <Button size="sm">Get a Pass</Button>
          </div>
        </div>
      </nav>

      <div className="w-full flex-1">
        <Outlet />
      </div>

      {/* Footer */}
      <footer className="w-full pt-32 pb-16 bg-surface-container-low border-t border-outline-variant/10">
        <div className="max-w-[1440px] mx-auto px-10 flex flex-col lg:flex-row justify-between items-start gap-20">
          <div className="max-w-md">
            <span className="text-2xl font-bold font-headline text-primary mb-8 block tracking-tighter">RaasPass</span>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-10 editorial-indent opacity-80">
              One pass for the music, movement, and midnight magic of Gujarat's Navratri.
            </p>
            <div className="flex gap-4">
              <FooterIcon icon="share" />
              <FooterIcon icon="mail" />
              <FooterIcon icon="person" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-16 lg:gap-32">
            <FooterLinkSection title="Explore" links={['Ahmedabad Garba', 'Vadodara Raas', 'Surat Dandiya']} />
            <FooterLinkSection title="Passes" links={['Pass policy', 'Venue access', 'Safety first']} />
            <FooterLinkSection title="Support" links={['Talk to us', 'FAQs', 'Contact Us']} />
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto px-10 mt-32 pt-10 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-outline text-[10px] uppercase tracking-[0.2em] font-bold">
            © 2026 RaasPass. A Navratri demo for Gujarat. All passes are mocked.
          </span>
          <div className="flex gap-8">
             <span className="text-[10px] text-outline uppercase font-bold tracking-widest cursor-pointer hover:text-primary transition-colors">Instagram</span>
             <span className="text-[10px] text-outline uppercase font-bold tracking-widest cursor-pointer hover:text-primary transition-colors">Gujarat 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ to, children, active }: { to: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link 
      to={to} 
      className={clsx(
        "font-headline tracking-tight text-[1.05rem] transition-all duration-300 relative group",
        active ? "text-primary font-bold" : "text-outline hover:text-primary"
      )}
    >
      {children}
      <span className={clsx(
        "absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300",
        active ? "w-full" : "w-0 group-hover:w-full"
      )} />
    </Link>
  );
}

function FooterIcon({ icon }: { icon: string }) {
  return (
    <div className="w-12 h-12 rounded-full border border-outline-variant/20 flex items-center justify-center text-outline hover:text-primary hover:border-primary/40 hover:bg-white transition-all duration-300 cursor-pointer shadow-sm">
      <span className="material-symbols-outlined text-xl">{icon}</span>
    </div>
  );
}

function FooterLinkSection({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="flex flex-col gap-6">
      <span className="font-bold text-primary font-headline text-sm uppercase tracking-widest">{title}</span>
      <div className="flex flex-col gap-4">
        {links.map(link => (
          <a key={link} className="text-on-surface-variant text-sm hover:text-primary transition-colors duration-200 font-medium" href="#">{link}</a>
        ))}
      </div>
    </div>
  );
}
