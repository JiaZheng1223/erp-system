import { NextResponse } from 'next/server'

/**
 * 健康檢查 API 路由
 * 用於監控系統是否正常運行
 */
export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
} 