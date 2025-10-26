// src/pages/LandingPage.jsx
import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import Contact from '../components/Contact';
export default function LandingPage() {
  return (
    <main className="bg-white text-gray-800">
      <Header />
      <Hero />
      <Features />
      <Testimonials />
      <Footer />
      <Contact />
    </main>
  );
}
  