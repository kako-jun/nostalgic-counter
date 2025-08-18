import { NextResponse } from 'next/server'

export function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export function createCorsResponse<T = Record<string, unknown>>(data?: T, options?: { status?: number }) {
  const response = NextResponse.json(data || {}, options)
  return addCorsHeaders(response)
}

export function createCorsOptionsResponse() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }))
}