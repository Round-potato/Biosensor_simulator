import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Droplet, Bluetooth, AlertTriangle, HeartPulse, Info } from 'lucide-react';

// Detailed IgE level generator with more realistic medical parameters
const generateIgEData = () => {
  // Realistic IgE level simulation based on medical research
  // Normal range: 2-200 kU/L (Kilounits per Liter)
  // Elevated levels can indicate allergic conditions
  const baseLevel = 50; // Median normal level
  const timeVariability = Math.sin(Date.now() / 5000);
  const randomVariation = (Math.random() - 0.5) * 20;
  
  return Math.max(0, baseLevel + baseLevel * timeVariability + randomVariation);
};

// Custom Tooltip for detailed information
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const igeLevel = payload[0].value;
    let levelInterpretation = '';

    if (igeLevel < 2) {
      levelInterpretation = 'Very Low: Potential Immunodeficiency';
    } else if (igeLevel >= 2 && igeLevel < 15) {
      levelInterpretation = 'Normal Range';
    } else if (igeLevel >= 15 && igeLevel < 100) {
      levelInterpretation = 'Moderate Elevation: Possible Allergic Condition';
    } else if (igeLevel >= 100 && igeLevel < 500) {
      levelInterpretation = 'High: Significant Allergic Sensitivity';
    } else {
      levelInterpretation = 'Very High: Severe Allergic Response';
    }

    return (
      <div className="bg-white p-4 border rounded shadow-lg">
        <p className="font-bold">Measurement Time: {label}</p>
        <p>IgE Level: {igeLevel.toFixed(2)} kU/L</p>
        <p className="text-sm text-gray-600">{levelInterpretation}</p>
      </div>
    );
  }
  return null;
};

// Biosensor Simulation Component
const IgEBiosensorSimulator = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [igeData, setIgeData] = useState([]);
  const [alertStatus, setAlertStatus] = useState(null);
  const [sweatComposition, setSweatComposition] = useState({
    pH: 6.3,
    conductivity: 50, // μS/cm (microsiemens per centimeter)
    sodium: 50, // mmol/L
    chloride: 60 // mmol/L
  });
  const dataPointsRef = useRef(30);

  // Simulate data collection and transmission
  useEffect(() => {
    let intervalId;
    
    if (isConnected) {
      intervalId = setInterval(() => {
        const newIgeLevel = generateIgEData();
        const currentTime = new Date().toLocaleTimeString();
        
        // Update IgE data array
        setIgeData(prevData => {
          const updatedData = [...prevData, { 
            time: currentTime, 
            igeLevel: newIgeLevel 
          }];
          
          // Trim to last 30 data points
          return updatedData.slice(-dataPointsRef.current);
        });

        // Simulate sweat composition variations
        setSweatComposition(prev => ({
          pH: Math.max(4.5, Math.min(7.5, prev.pH + (Math.random() - 0.5) * 0.5)),
          conductivity: Math.max(30, Math.min(70, prev.conductivity + (Math.random() - 0.5) * 10)),
          sodium: Math.max(40, Math.min(60, prev.sodium + (Math.random() - 0.5) * 5)),
          chloride: Math.max(50, Math.min(70, prev.chloride + (Math.random() - 0.5) * 5))
        }));

        // Alert conditions for IgE levels
        if (newIgeLevel > 100) {
          setAlertStatus({
            type: 'high',
            message: 'High IgE Levels Detected: Potential Severe Allergic Response'
          });
        } else if (newIgeLevel < 5) {
          setAlertStatus({
            type: 'low',
            message: 'Low IgE Levels Detected: Potential Immunodeficiency'
          });
        } else {
          setAlertStatus(null);
        }

        // Simulate battery drain
        setBatteryLevel(prev => Math.max(0, prev - 0.1));
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isConnected]);

  // Connect/Disconnect handler
  const toggleConnection = () => {
    setIsConnected(!isConnected);
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">
        IgE Biosensor Prototype Simulator
      </h1>
      
      {/* Status Indicators */}
      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <Bluetooth className={`mr-2 ${isConnected ? 'text-green-500' : 'text-gray-400'}`} />
          <span>Connection: {isConnected ? 'Active' : 'Disconnected'}</span>
        </div>
        <div className="flex items-center">
          <HeartPulse className={`mr-2 ${batteryLevel > 20 ? 'text-green-500' : 'text-red-500'}`} />
          <span>Battery: {batteryLevel.toFixed(1)}%</span>
        </div>
      </div>

      {/* Connection Button */}
      <button 
        onClick={toggleConnection}
        className={`w-full py-2 rounded mb-4 ${
          isConnected 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {isConnected ? 'Disconnect' : 'Connect Biosensor'}
      </button>

      {/* Alert Section */}
      {alertStatus && (
        <div className={`flex items-center p-3 rounded mb-4 ${
          alertStatus.type === 'high' 
            ? 'bg-red-100 text-red-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          <AlertTriangle className="mr-2" />
          <span>{alertStatus.message}</span>
        </div>
      )}

      {/* IgE Level Chart */}
      <div className="h-64 mb-4">
        <h2 className="text-lg font-semibold mb-2">IgE Level Monitoring</h2>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={igeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis 
              label={{ 
                value: 'IgE Level (kU/L)', 
                angle: -90, 
                position: 'insideLeft' 
              }} 
              domain={[0, 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="igeLevel" 
              stroke="#8884d8" 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Sweat Composition Details */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2 flex items-center">
          Sweat Composition Analysis 
          <Info className="ml-2 text-blue-500" size={20} />
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="font-medium">pH Level</p>
            <p className="text-gray-600">{sweatComposition.pH.toFixed(2)} (Normal: 4.5-7.5)</p>
          </div>
          <div>
            <p className="font-medium">Electrical Conductivity</p>
            <p className="text-gray-600">{sweatComposition.conductivity} μS/cm</p>
          </div>
          <div>
            <p className="font-medium">Sodium Concentration</p>
            <p className="text-gray-600">{sweatComposition.sodium} mmol/L (Normal: 40-60)</p>
          </div>
          <div>
            <p className="font-medium">Chloride Concentration</p>
            <p className="text-gray-600">{sweatComposition.chloride} mmol/L (Normal: 50-70)</p>
          </div>
        </div>
      </div>

      {/* Sweat Patch Simulation */}
      <div className="mt-4 flex items-center justify-center">
        <Droplet className="text-blue-500 mr-2" />
        <span>Sweat Patch: Active Data Collection</span>
      </div>
    </div>
  );
};

export default IgEBiosensorSimulator;