import { useState } from 'react'
import './App.css'
import CoreApp from './App backup.jsx'

// ===== Age Gate =====
function AgeGate() {
  const [ageVerified, setAgeVerified] = useState(localStorage.getItem('ageVerified18') === 'true')
  const [age, setAge] = useState('')
  const [error, setError] = useState(false)

  const verifyAge = () => {
    const num = parseInt(age, 10)
    if (num >= 18) {
      localStorage.setItem('ageVerified18', 'true')
      setAgeVerified(true)
    } else {
      setError(true)
    }
  }

  if (ageVerified) return null

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white z-[9999] flex flex-col items-center justify-center p-6 glass-morphism">
      <div className="max-w-md w-full space-y-6 glass-morphism rounded-xl p-8 border border-white/10 glow">
        <h2 className="text-3xl font-bold text-center text-gradient">Welcome to TapThat.ai</h2>
        <p className="text-center text-gray-300">This app includes AI-generated content intended for adults 18 and older. Please enter your age to continue.</p>
        <div className="space-y-4">
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter your age"
            className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
          <button onClick={verifyAge} className="w-full animated-gradient text-white font-semibold py-3 rounded-lg hover-lift">Continue</button>
        </div>
        {error && <p className="text-red-400 text-center mt-2">You must be at least 18 years old to use this app.</p>}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <AgeGate />
      <CoreApp />
    </>
  )
}
