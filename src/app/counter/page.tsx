'use client'

import { useState, useRef } from 'react'
import Layout from '@/components/Layout'

export default function CounterPage() {
  const [response, setResponse] = useState('')
  const [publicId, setPublicId] = useState('')
  const [mode, setMode] = useState('create')
  
  const urlRef = useRef<HTMLInputElement>(null)
  const tokenRef = useRef<HTMLInputElement>(null)
  const valueRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const url = urlRef.current?.value
    const token = tokenRef.current?.value
    const value = valueRef.current?.value
    
    if (!url || !token) return
    
    let apiUrl = `/api/counter?action=${mode}&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`
    
    if (mode === 'set' && value) {
      apiUrl += `&total=${value}`
    }
    
    try {
      const res = await fetch(apiUrl)
      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
      
      if (data.id) {
        setPublicId(data.id)
      }
    } catch (error) {
      setResponse(`Error: ${error}`)
    }
  }

  return (
    <Layout title="Counter Service" description="昔のWebカウンターを現代に復活">
      <div className="container mx-auto p-6 max-w-4xl">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">API Test</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Action</label>
                <select 
                  value={mode} 
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="create">Create Counter</option>
                  <option value="increment">Increment Count</option>
                  <option value="set">Set Count</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">URL</label>
                <input
                  ref={urlRef}
                  type="url"
                  placeholder="https://example.com"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Owner Token</label>
                <input
                  ref={tokenRef}
                  type="text"
                  placeholder="8-16 characters"
                  className="w-full p-2 border rounded"
                  minLength={8}
                  maxLength={16}
                  required
                />
              </div>
              
              {mode === 'set' && (
                <div>
                  <label className="block text-sm font-medium mb-1">New Count Value</label>
                  <input
                    ref={valueRef}
                    type="number"
                    placeholder="0"
                    className="w-full p-2 border rounded"
                    min="0"
                  />
                </div>
              )}
              
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
              >
                {mode === 'create' ? 'Create Counter' : 
                 mode === 'increment' ? 'Increment Count' : 'Set Count'}
              </button>
            </form>
          </div>

          {publicId && (
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Web Component Usage</h3>
              <p className="text-sm text-gray-600 mb-3">Public ID: <code className="bg-gray-100 px-1 rounded">{publicId}</code></p>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">HTML:</p>
                  <code className="block bg-gray-100 p-2 rounded text-xs">
                    {`<script src="/components/display.js"></script>
<nostalgic-counter id="${publicId}" type="total" theme="classic"></nostalgic-counter>`}
                  </code>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Display URL:</p>
                  <code className="block bg-gray-100 p-2 rounded text-xs break-all">
                    {`/api/counter?action=display&id=${publicId}&type=total&theme=classic`}
                  </code>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">API Response</h3>
            <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-96">
              {response || 'No response yet'}
            </pre>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">Available Actions</h3>
            <div className="space-y-2 text-sm">
              <div><strong>create:</strong> Create new counter</div>
              <div><strong>increment:</strong> Add +1 to counter</div>
              <div><strong>set:</strong> Set counter to specific value</div>
              <div><strong>display:</strong> Get counter data/image (use public ID only)</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  )
}