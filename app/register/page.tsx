"use client"
import { useState } from "react"
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [nickname, setNickname] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    if (password !== confirmPassword) {
      setError("兩次輸入的密碼不一致")
      return
    }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: fullName,
          nickname,
          phone
        }
      }
    })
    if (error) {
      setLoading(false)
      setError(error.message)
      return
    }
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        name: fullName,
        phone,
        created_at: new Date()
      })
      if (profileError) {
        setLoading(false)
        setError('註冊成功，但個人資料寫入失敗：' + profileError.message)
        return
      }
    }
    setLoading(false)
    setSuccess("註冊成功，請前往信箱收取驗證信！")
    setTimeout(() => router.push('/login'), 2000)
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">註冊新帳號</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block mb-1">全名</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={fullName} onChange={e => setFullName(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1">暱稱</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={nickname} onChange={e => setNickname(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1">電子郵件</label>
          <input type="email" className="w-full border rounded px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1">電話</label>
          <input type="tel" className="w-full border rounded px-3 py-2" value={phone} onChange={e => setPhone(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1">密碼</label>
          <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
        </div>
        <div>
          <label className="block mb-1">重複密碼</label>
          <input type="password" className="w-full border rounded px-3 py-2" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
        <button type="submit" className="w-full bg-primary text-white py-2 rounded" disabled={loading}>
          {loading ? "註冊中..." : "註冊"}
        </button>
      </form>
    </div>
  )
} 