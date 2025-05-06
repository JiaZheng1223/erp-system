import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 獲取當前路徑
  const path = request.nextUrl.pathname
  
  // 從cookie檢查用戶是否登入
  const isLoggedIn = request.cookies.has('supabase-auth-token') || request.cookies.has('sb-access-token')
  
  // 需要登入的路徑
  const protectedRoutes = [
    '/dashboard', 
    '/orders', 
    '/products', 
    '/materials', 
    '/distributors', 
    '/suppliers', 
    '/purchases',
    '/settings'
  ]
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  )
  
  // 公開路徑
  const publicRoutes = ['/login']
  const isPublicRoute = publicRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  )
  
  // 如果是根路徑，根據登入狀態重定向
  if (path === '/') {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  // 不做嚴格的權限控制，只做簡單的導向
  // 1. 針對登入頁面，如果已登入則導向儀表板
  if (isPublicRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // 2. 其他頁面正常訪問
  return NextResponse.next()
}

// 指定哪些路徑需要處理
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|public/).*)'],
} 