'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert(error.message)
    else alert('Signup successful! Check your email or login now.')
    setLoading(false)
  }

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      alert(error.message)
    } else {
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px', color: '#fff', background: '#121212', padding: '40px', borderRadius: '8px', width: '300px', marginInline: 'auto' }}>
      <h2>Thirai-kadhai Login</h2>
      <input 
        type="email" 
        placeholder="Email address" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: '10px', margin: '10px 0', width: '100%', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: '10px', margin: '10px 0', width: '100%', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
      />
      <button 
        onClick={handleLogin} 
        disabled={loading}
        style={{ padding: '10px', width: '100%', background: '#e50914', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}
      >
        Login
      </button>
      <button 
        onClick={handleSignUp} 
        disabled={loading}
        style={{ padding: '10px', width: '100%', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}
      >
        Sign Up
      </button>
    </div>
  )
}

// பிரிடெண்டர் எர்ரரைத் தவிர்க்க இது மிக அவசியம்
export const dynamic = 'force-dynamic'