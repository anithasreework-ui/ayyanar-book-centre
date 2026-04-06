import { useState } from 'react';

const STEPS = [
  { label: 'Order Placed', icon: '📋', desc: 'We received your order' },
  { label: 'Confirmed', icon: '✅', desc: 'Order confirmed by shop' },
  { label: 'Packed', icon: '📦', desc: 'Your books are packed' },
  { label: 'Shipped', icon: '🚚', desc: 'Out for delivery' },
  { label: 'Delivered', icon: '🎉', desc: 'Enjoy your books!' },
];

const OrderTracking = () => {
  const [currentStep] = useState(2);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Order Tracking
      </h1>
      <p className="text-gray-500 mb-8">Track your order status</p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-bold text-gray-800">#AYY-2024-001</p>
          </div>
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
            In Progress
          </span>
        </div>

        <div className="flex justify-between relative">
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-100 z-0" />
          <div
            className="absolute top-6 left-0 h-0.5 bg-blue-800 z-0 transition-all"
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          />

          {STEPS.map((step, index) => (
            <div key={step.label} className="flex flex-col items-center text-center w-16 relative z-10">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 border-2 transition-all ${
                index <= currentStep
                  ? 'bg-blue-800 border-blue-800'
                  : 'bg-white border-gray-200'
              }`}>
                {step.icon}
              </div>
              <p className={`text-xs font-medium leading-tight ${
                index <= currentStep ? 'text-blue-800' : 'text-gray-400'
              }`}>
                {step.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-2xl mb-1">{STEPS[currentStep].icon}</p>
          <p className="font-bold text-blue-800">{STEPS[currentStep].label}</p>
          <p className="text-sm text-gray-500 mt-1">{STEPS[currentStep].desc}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-gray-800 mb-4">Delivery Details</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Estimated Delivery</span>
            <span className="font-medium">3-5 Business Days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Delivery Type</span>
            <span className="font-medium">Home Delivery</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total Amount</span>
            <span className="font-bold text-green-600">Rs.450.00</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;