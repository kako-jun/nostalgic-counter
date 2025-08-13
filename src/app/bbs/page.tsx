'use client'

import { useState, useRef } from 'react'
import Layout from '@/components/Layout'

export default function BBSPage() {
  const [response, setResponse] = useState('')
  const [publicId, setPublicId] = useState('')
  const [mode, setMode] = useState('create')
  
  const urlRef = useRef<HTMLInputElement>(null)
  const tokenRef = useRef<HTMLInputElement>(null)
  const authorRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const messageIdRef = useRef<HTMLInputElement>(null)
  const maxRef = useRef<HTMLInputElement>(null)
  const perPageRef = useRef<HTMLInputElement>(null)
  const iconsRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const url = urlRef.current?.value
    const token = tokenRef.current?.value
    const author = authorRef.current?.value
    const message = messageRef.current?.value
    const messageId = messageIdRef.current?.value
    const max = maxRef.current?.value
    const perPage = perPageRef.current?.value
    const icons = iconsRef.current?.value
    
    if (!url) return
    
    let apiUrl = `/api/bbs?action=${mode}&url=${encodeURIComponent(url)}`
    
    if (mode !== 'get' && token) {
      apiUrl += `&token=${encodeURIComponent(token)}`
    }
    
    if (mode === 'post' || mode === 'update') {
      if (!message) return
      apiUrl += `&message=${encodeURIComponent(message)}`
      if (author) {
        apiUrl += `&author=${encodeURIComponent(author)}`
      }
    }
    
    if (mode === 'delete' || mode === 'update') {
      if (!messageId) return
      apiUrl += `&messageId=${encodeURIComponent(messageId)}`
    }
    
    if (mode === 'create') {
      if (max) apiUrl += `&max=${max}`
      if (perPage) apiUrl += `&perPage=${perPage}`
      if (icons) apiUrl += `&icons=${encodeURIComponent(icons)}`
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
    <Layout title="BBS Service" description="昔のBBS掲示板を現代に復活">
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
                  <option value="create">Create BBS</option>
                  <option value="post">Post Message</option>
                  <option value="update">Update Message</option>
                  <option value="remove">Remove Message</option>
                  <option value="clear">Clear All Messages</option>
                  <option value="get">Get Messages</option>
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
              
              {mode !== 'get' && (
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
              )}
              
              {mode === 'create' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Messages</label>
                    <input
                      ref={maxRef}
                      type="number"
                      placeholder="1000"
                      className="w-full p-2 border rounded"
                      min="1"
                      max="10000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Messages Per Page</label>
                    <input
                      ref={perPageRef}
                      type="number"
                      placeholder="10"
                      className="w-full p-2 border rounded"
                      min="1"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Available Icons (comma-separated)</label>
                    <input
                      ref={iconsRef}
                      type="text"
                      placeholder="😀,😎,😍,🤔,😢"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </>
              )}
              
              {(mode === 'post' || mode === 'update') && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Author Name</label>
                    <input
                      ref={authorRef}
                      type="text"
                      placeholder="名無しさん"
                      className="w-full p-2 border rounded"
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Message</label>
                    <textarea
                      ref={messageRef}
                      placeholder="Enter your message..."
                      className="w-full p-2 border rounded h-24"
                      maxLength={1000}
                      required
                    />
                  </div>
                </>
              )}
              
              {(mode === 'remove' || mode === 'update') && (
                <div>
                  <label className="block text-sm font-medium mb-1">Message ID</label>
                  <input
                    ref={messageIdRef}
                    type="text"
                    placeholder="Message ID to modify"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              )}
              
              <button 
                type="submit"
                className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
              >
                {mode === 'create' ? 'Create BBS' :
                 mode === 'post' ? 'Post Message' :
                 mode === 'update' ? 'Update Message' :
                 mode === 'remove' ? 'Remove Message' :
                 mode === 'clear' ? 'Clear All Messages' : 'Get Messages'}
              </button>
            </form>
          </div>

          {publicId && (
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Public Access</h3>
              <p className="text-sm text-gray-600 mb-3">Public ID: <code className="bg-gray-100 px-1 rounded">{publicId}</code></p>
              
              <div>
                <p className="text-sm font-medium mb-2">Get Messages URL:</p>
                <code className="block bg-gray-100 p-2 rounded text-xs break-all">
                  {`/api/bbs?action=get&id=${publicId}&page=1`}
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

          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">Available Actions</h3>
            <div className="space-y-2 text-sm">
              <div><strong>create:</strong> Create new BBS</div>
              <div><strong>post:</strong> Post new message</div>
              <div><strong>update:</strong> Update own message</div>
              <div><strong>remove:</strong> Remove message (owner or author)</div>
              <div><strong>clear:</strong> Clear all messages (owner only)</div>
              <div><strong>get:</strong> Get messages (use public ID only)</div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">特徴</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• 投稿者による自分の投稿編集</li>
                <li>• カスタマイズ可能なドロップダウン</li>
                <li>• アイコン選択機能</li>
                <li>• ページネーション</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  )
}