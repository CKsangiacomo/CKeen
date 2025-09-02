'use client';

import { useState, useEffect } from 'react';

interface ConfigState {
  title: string;
  successText: string;
  theme: 'light' | 'dark';
  fields: {
    name: boolean;
    email: boolean;
    message: boolean;
  };
}

const STORAGE_KEY = 'cf_cfg';

const defaultConfig: ConfigState = {
  title: 'Contact us',
  successText: 'Thanks! We\'ll get back to you soon.',
  theme: 'light',
  fields: {
    name: true,
    email: true,
    message: true,
  },
};

export default function Configurator() {
  const [config, setConfig] = useState<ConfigState>(defaultConfig);
  const [configB64, setConfigB64] = useState('');

  // Load config from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig({ ...defaultConfig, ...parsed });
      } catch (e) {
        console.warn('Failed to parse saved config:', e);
      }
    }
  }, []);

  // Update base64 config when config changes
  useEffect(() => {
    const b64 = btoa(JSON.stringify(config));
    setConfigB64(b64);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const updateConfig = (updates: Partial<ConfigState>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const updateFields = (field: keyof ConfigState['fields'], value: boolean) => {
    setConfig(prev => ({
      ...prev,
      fields: { ...prev.fields, [field]: value }
    }));
  };

  const isDev = process.env.NODE_ENV === 'development';
  const embedUrl = isDev
    ? `http://localhost:3002/api/e/DEMO?v=1&cfg=${configB64}`
    : `https://c-keen-embed.vercel.app/api/e/DEMO?v=1&cfg=${configB64}`;

  return (
    <div style={{ marginBottom: '48px' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', color: '#1a1a1a' }}>
        Configure Your Widget
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
        {/* Configuration Panel */}
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Form Title
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => updateConfig({ title: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e1e5e9',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Success Text */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Success Message
            </label>
            <input
              type="text"
              value={config.successText}
              onChange={(e) => updateConfig({ successText: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e1e5e9',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Fields */}
          <div>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '500' }}>
              Form Fields
            </label>
            <div style={{ display: 'grid', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={config.fields.name}
                  onChange={(e) => updateFields('name', e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                Name field
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', opacity: 0.6 }}>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  style={{ width: '16px', height: '16px' }}
                />
                Email field (always required)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={config.fields.message}
                  onChange={(e) => updateFields('message', e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                Message field
              </label>
            </div>
          </div>

          {/* Theme */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Theme
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <input
                  type="radio"
                  name="theme"
                  checked={config.theme === 'light'}
                  onChange={() => updateConfig({ theme: 'light' })}
                  style={{ width: '16px', height: '16px' }}
                />
                Light
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <input
                  type="radio"
                  name="theme"
                  checked={config.theme === 'dark'}
                  onChange={() => updateConfig({ theme: 'dark' })}
                  style={{ width: '16px', height: '16px' }}
                />
                Dark
              </label>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div style={{ position: 'relative' }}>
          <div style={{ 
            position: 'absolute', 
            top: '8px', 
            right: '8px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            padding: '4px 8px', 
            borderRadius: '4px', 
            fontSize: '12px', 
            fontWeight: '500',
            zIndex: 10
          }}>
            Preview
          </div>
          <div 
            id="ckeen-configurator-preview"
            style={{ 
              border: '1px solid #e1e5e9', 
              borderRadius: '8px', 
              padding: '24px',
              backgroundColor: config.theme === 'dark' ? '#1a1a1a' : '#f8f9fa',
              minHeight: '200px',
              position: 'relative'
            }}
          />
          <script 
            async 
            defer 
            src={embedUrl}
          />
        </div>
      </div>
    </div>
  );
}
