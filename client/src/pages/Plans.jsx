import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import '../App.css';

const personalPlans = [
  {
    name: 'Free',
    price: 0,
    description: 'Get started with basic features for personal use.',
    features: [
      'Write up to 6 stories',
      'Create up to 6 collections',
      '6 AI Story Writer tokens',
      'Access to public stories',
    ],
    cta: 'Current Plan',
    current: true,
  },
  {
    name: 'Plus',
    price: 9.99,
    description: 'Unlock more stories, collections, and AI tokens.',
    features: [
      'Everything in Free',
      'Write up to 60 stories',
      'Create up to 60 collections',
      '60 AI Story Writer tokens',
      'Priority support',
    ],
    cta: 'Get Plus',
    current: false,
  },
  {
    name: 'Premium',
    price: 19.99,
    description: 'Unlimited creativity and premium support.',
    features: [
      'Eeverything in Plus',
      'Unlimited stories & collections',
      'Unlimited AI Story Writer tokens',
      'Priority support',
      'Early access to new features',
      'Premium templates',
    ],
    cta: 'Get Premium',
    current: false,
  },
];

const businessPlans = [
  {
    name: 'Team',
    price: 49,
    description: 'For small teams and organizations.',
    features: [
      'Up to 5 team members',
      'Shared collections',
      '500 AI Story Writer tokens',
      'Team analytics',
      'Priority support',
    ],
    cta: 'Contact Sales',
    current: false,
  },
  {
    name: 'Business',
    price: 99,
    description: 'Advanced features for growing businesses.',
    features: [
      'Up to 20 team members',
      'Unlimited shared collections',
      '2000 AI Story Writer tokens',
      'Advanced team analytics',
      'Dedicated support',
      'Custom onboarding',
    ],
    cta: 'Contact Sales',
    current: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Custom solutions for large organizations.',
    features: [
      'Unlimited team members',
      'Unlimited everything',
      'Custom integrations',
      'Dedicated account manager',
      'SLA & compliance',
      'Premium onboarding',
    ],
    cta: 'Contact Sales',
    current: false,
  },
];

const Plans = () => {
  useUser();
  const [planType, setPlanType] = useState('personal');
  const plans = planType === 'personal' ? personalPlans : businessPlans;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 text-center mb-3 font-['Inter']">
          Plans
        </h2>
        <p className="text-lg text-gray-600 text-center mb-8 font-['DM_Sans']">
          Choose the plan that fits your needs. Switch between Personal and Business options.
        </p>
        
        {/* Toggle Switch */}
        <div className="flex justify-center mb-10">
          <div className="flex bg-gray-100 rounded-full shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => setPlanType('personal')}
              className={`px-8 py-3 font-bold text-base transition-all duration-200 font-['DM_Sans'] ${
                planType === 'personal' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-primary hover:text-primary/80'
              }`}
              disabled={planType === 'personal'}
            >
              Personal
            </button>
            <button
              onClick={() => setPlanType('business')}
              className={`px-8 py-3 font-bold text-base transition-all duration-200 font-['DM_Sans'] ${
                planType === 'business' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-primary hover:text-primary/80'
              }`}
              disabled={planType === 'business'}
            >
              Business
            </button>
          </div>
        </div>
        
        {/* Plan Cards */}
        <div className="flex gap-8 justify-center items-stretch flex-wrap">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="bg-white border border-gray-200 rounded-2xl shadow-lg min-w-[300px] max-w-[320px] w-80 min-h-[440px] flex flex-col items-center p-8 font-['DM_Sans'] relative transition-all duration-200 hover:shadow-xl hover:border-primary/20"
            >
              {/* Plan Name */}
              <div className="text-2xl font-bold text-gray-800 font-['Inter'] mb-2 text-center">
                {plan.name}
              </div>
              
              {/* Price */}
              <div className="text-3xl font-extrabold text-primary mb-2 text-center font-['Inter']">
                {plan.price === 0 ? 'Free' : plan.price === 'Custom' ? 'Custom' : `$${plan.price}/mo`}
              </div>
              
              {/* Description */}
              <div className="text-base text-gray-600 text-center mb-6 min-h-[40px] font-['DM_Sans'] italic">
                {plan.description}
              </div>
              
              {/* Features */}
              <ul className="text-left w-full text-gray-700 text-base leading-relaxed font-['DM_Sans'] font-medium pl-0 min-h-[120px] list-none flex flex-col gap-2 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span className="text-primary text-lg font-bold leading-none">✓</span>
                    <span className="flex-1">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {/* CTA Button or Badge */}
              {plan.current ? (
                <div className="bg-primary text-white rounded-full font-bold text-base px-6 py-2 mt-auto mb-1 font-['DM_Sans'] shadow-md text-center min-h-[40px] flex items-center justify-center">
                  {plan.cta}
                </div>
              ) : (
                <button className="bg-primary hover:bg-primary/90 text-white border-none rounded-full font-bold text-base px-8 py-3 mt-auto mb-1 font-['DM_Sans'] shadow-md cursor-pointer min-h-[40px] transition-all duration-200">
                  {plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Plans; 