import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/dashboard')
 
  // 這部分代碼不會執行，因為上面的redirect會終止函數
  return null
} 