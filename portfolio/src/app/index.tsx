import React from 'react';
import { Gate } from '../components/Gate';
import { appId } from '../lib/config';
import RehearsalHome from '../screens/RehearsalHome';
import Care from '../screens/Care';
import Meal from '../screens/Meal';
import Quotes from '../screens/Quotes';
export default function Home() {
  return (
    <Gate>
      {appId === 'rehearsal' ? (
        <RehearsalHome />
      ) : appId === 'care' ? (
        <Care />
      ) : appId === 'meal' ? (
        <Meal />
      ) : (
        <Quotes />
      )}
    </Gate>
  );
}
