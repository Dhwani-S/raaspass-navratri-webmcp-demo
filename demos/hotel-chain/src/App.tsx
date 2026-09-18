/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import HotelDetails from './pages/HotelDetails';
import Booking from './pages/Booking';



function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<SearchResultsRoute />} />
          <Route path="hotel/:id" element={<HotelDetails />} />
          <Route path="book/:id" element={<Booking />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

function SearchResultsRoute() {
  const location = useLocation();
  return <SearchResults key={location.key} />;
}

export default App;
