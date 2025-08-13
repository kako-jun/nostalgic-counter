'use client'

import { useState, useRef } from 'react'
import Layout from '@/components/Layout'

export default function RankingPage() {
  const [response, setResponse] = useState('')
  const [publicId, setPublicId] = useState('')
  const [mode, setMode] = useState('create')
  
  const urlRef = useRef<HTMLInputElement>(null)
  const tokenRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const scoreRef = useRef<HTMLInputElement>(null)
  const maxRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const url = urlRef.current?.value
    const token = tokenRef.current?.value
    const name = nameRef.current?.value
    const score = scoreRef.current?.value
    const max = maxRef.current?.value
    
    if (!url || !token) return
    
    let apiUrl = `/api/ranking?action=${mode}&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`
    
    if (mode === 'submit' || mode === 'update') {
      if (!name || !score) return
      apiUrl += `&name=${encodeURIComponent(name)}&score=${score}`
    } else if (mode === 'remove') {
      if (!name) return
      apiUrl += `&name=${encodeURIComponent(name)}`
    } else if (mode === 'create' && max) {
      apiUrl += `&max=${max}`
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
    <Layout title="Ranking Service" description="スコアランキングシステム">
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
                  <option value="create">Create Ranking</option>
                  <option value="submit">Submit Score</option>
                  <option value="update">Update Score</option>
                  <option value="remove">Remove Score</option>
                  <option value="clear">Clear All Scores</option>
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
              
              {mode === 'create' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Max Entries</label>
                  <input
                    ref={maxRef}
                    type="number"
                    placeholder="100"
                    className="w-full p-2 border rounded"
                    min="1"
                    max="1000"
                  />
                </div>
              )}
              
              {(mode === 'submit' || mode === 'update' || mode === 'remove') && (
                <div>
                  <label className="block text-sm font-medium mb-1">Player Name</label>
                  <input
                    ref={nameRef}
                    type="text"
                    placeholder="Player name (max 20 chars)"
                    className="w-full p-2 border rounded"
                    maxLength={20}
                    required
                  />
                </div>
              )}
              
              {(mode === 'submit' || mode === 'update') && (
                <div>
                  <label className="block text-sm font-medium mb-1">Score</label>
                  <input
                    ref={scoreRef}
                    type="number"
                    placeholder="1000"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              )}
              
              <button 
                type="submit"
                className="w-full bg-yellow-600 text-white p-2 rounded hover:bg-yellow-700"
              >
                {mode === 'create' ? 'Create Ranking' :
                 mode === 'submit' ? 'Submit Score' :
                 mode === 'update' ? 'Update Score' :
                 mode === 'remove' ? 'Remove Score' : 'Clear Ranking'}
              </button>
            </form>
          </div>

          {publicId && (
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Public Access</h3>
              <p className="text-sm text-gray-600 mb-3">Public ID: <code className="bg-gray-100 px-1 rounded">{publicId}</code></p>
              
              <div>
                <p className="text-sm font-medium mb-2">Get Ranking URL:</p>
                <code className="block bg-gray-100 p-2 rounded text-xs break-all">
                  {`/api/ranking?action=get&id=${publicId}&limit=10`}
                </code>
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

          <div className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">Available Actions</h3>
            <div className="space-y-2 text-sm">
              <div><strong>create:</strong> Create new ranking</div>
              <div><strong>submit:</strong> Submit new score</div>
              <div><strong>update:</strong> Update existing score</div>
              <div><strong>remove:</strong> Remove specific score</div>
              <div><strong>clear:</strong> Clear all scores</div>
              <div><strong>get:</strong> Get ranking data (use public ID only)</div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">特徴</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• 自動ソート（スコア降順）</li>
                <li>• 最大エントリー数制限</li>
                <li>• スコア修正機能</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  )
}