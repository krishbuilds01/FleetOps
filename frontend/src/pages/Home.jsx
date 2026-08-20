import React from 'react';
import Hero from '../components/Hero';
import OperationalHighlights from '../components/OperationalHighlights';
import Workflow from '../components/Workflow';
import WhyFleetOps from '../components/WhyFleetOps';

export default function Home({ onNavigate }) {
  return (
    <>
      <Hero onNavigate={onNavigate} />
      <OperationalHighlights />
      <Workflow />
      <WhyFleetOps />
    </>
  );
}
