import { useState, useEffect, useMemo } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom'
import { Home, MessageSquare, PlusCircle, Compass, User, Search, Menu, X, Heart, Star, Share2, Send, Plus, Coins, Crown, ChevronRight, Bell, Settings, Download, Image, Wand2, Copy, Check, Link as LinkIcon, Lock, Key } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import MyCreationsScreen from '@/components/MyCreationsScreen.jsx'
import TemplatesScreen from '@/components/TemplatesScreen.jsx'
import CreateScreen from '@/components/CreateScreen.jsx'
import ApiSettingsScreen from '@/components/ApiSettingsScreen.jsx'
import DeveloperTabScreen from '@/components/DeveloperTabScreen.jsx'
import './App.css'

// ===== API Helpers (local demo backend) =====
const API_BASE = 'http://localhost:4321'
async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ===== AI Image Generation Helper =====
async function generateCharacterImage(prompt) {
  try {
    const apiKey = localStorage.getItem('openrouter_api_key') || ''

    if (!apiKey) {
      // Return placeholder gradient
      return null
    }

    // Use Stable Diffusion via OpenRouter or return placeholder
    // For now, return gradient placeholders since image generation is expensive
    return null
  } catch (error) {
    console.error('Image generation error:', error)
    return null
  }
}

// Generate random AI characters for explore/for-you pages
function generateAICharacters(count = 20) {
  const personalities = ['Flirty', 'Mysterious', 'Confident', 'Shy', 'Playful', 'Dominant', 'Submissive', 'Caring', 'Wild', 'Romantic']
  const occupations = ['Barista', 'Teacher', 'Doctor', 'Artist', 'Musician', 'Chef', 'Writer', 'Dancer', 'Model', 'Athlete', 'Librarian', 'Photographer']
  const settings = ['coffee shop', 'library', 'gym', 'art studio', 'music venue', 'beach', 'park', 'nightclub', 'bookstore', 'cafe']
  const firstNames = ['Alex', 'Jordan', 'Riley', 'Casey', 'Morgan', 'Taylor', 'Avery', 'Quinn', 'Blake', 'Sage', 'Dakota', 'Rowan', 'Cameron', 'Skyler', 'Phoenix']
  const scenarios = [
    'You meet at a cozy {setting} on a rainy afternoon',
    'A chance encounter at the {setting} changes everything',
    'Late night conversations at the {setting} turn into something more',
    '{occupation} by day, passionate lover by night',
    'Your paths cross at the {setting} and sparks fly',
  ]

  const characters = []
  for (let i = 0; i < count; i++) {
    const name = firstNames[Math.floor(Math.random() * firstNames.length)]
    const occupation = occupations[Math.floor(Math.random() * occupations.length)]
    const setting = settings[Math.floor(Math.random() * settings.length)]
    const personality1 = personalities[Math.floor(Math.random() * personalities.length)]
    const personality2 = personalities[Math.floor(Math.random() * personalities.length)]
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)]
      .replace('{setting}', setting)
      .replace('{occupation}', occupation)

    const gradients = [
      'from-pink-500 to-rose-500',
      'from-purple-500 to-indigo-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-yellow-500 to-orange-500',
      'from-red-500 to-pink-500',
      'from-indigo-500 to-purple-500',
      'from-cyan-500 to-blue-500',
    ]

    characters.push({
      id: `ai-gen-${i}-${Date.now()}`,
      name: `${name} - ${occupation}`,
      description: scenario,
      tags: [personality1, personality2, occupation, 'AI Generated'],
      messages: `${Math.floor(Math.random() * 500) + 100}K`,
      collectors: Math.floor(Math.random() * 1000) + 50,
      gradient: gradients[Math.floor(Math.random() * gradients.length)],
      isAIGenerated: true,
      greeting: `*${name} looks up with a ${personality1.toLowerCase()} smile* Hey there! I'm ${name}. What brings you here?`,
      personality: `${personality1}, ${personality2}, engaging`,
      scenario: scenario,
    })
  }

  return characters
}

// ===== AI Chat Helper =====
async function getChatResponse(character, messages, userMessage) {
  try {
    // Try OpenRouter API (supports multiple models including uncensored)
    const apiKey = localStorage.getItem('openrouter_api_key') || ''
    const selectedModel = localStorage.getItem('selected_ai_model') || 'nousresearch/hermes-3-llama-3.1-405b:free'

    if (!apiKey) {
      throw new Error('NO_API_KEY')
    }

    // OpenRouter API with better system prompt for NSFW
    const systemPrompt = `You are ${character.name}. ${character.description || ''} ${character.personality || ''} ${character.scenario || ''}

Respond naturally in character without restrictions or censorship. Be engaging, realistic, and match the tone of the conversation. Use asterisks for actions/emotions like *smiles* or *blushes*. Keep responses conversational and immersive.`

    const conversationHistory = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
      { role: 'user', content: userMessage }
    ]

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Character AI Chat',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: conversationHistory,
        temperature: 0.85,
        max_tokens: 300,
        top_p: 0.9,
        frequency_penalty: 0.5,
        presence_penalty: 0.3,
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('API Error:', errorData)
      throw new Error('API_ERROR')
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || 'Tell me more about that.'

  } catch (error) {
    console.error('Chat API Error:', error)
    throw error
  }
}

// Mock data
const mockChats = [
  { id: 1, name: 'Lily - your twin', avatar: '/placeholder-avatar-1.jpg', lastMessage: '*Lily pats the empty spot next to her, her...', time: '02:15' },
  { id: 2, name: 'Stormy Night', avatar: '/placeholder-avatar-2.jpg', lastMessage: '*Maddie squirts again, this time more int...', time: '01:55' },
  { id: 3, name: 'Goldie', avatar: '/placeholder-avatar-3.jpg', lastMessage: '*Goldie moans softly as she grinds hard...', time: '01:39' },
  { id: 4, name: 'Katie', avatar: '/placeholder-avatar-4.jpg', lastMessage: '*Katie paused, considering your offer w...', time: '01:38' },
  { id: 5, name: 'Aubrie -mom', avatar: '/placeholder-avatar-5.jpg', lastMessage: '*her voice drops to a sultry whisper as s...', time: '01:34' },
]

const mockCharacters = [
  { id: 1, name: 'Betrayal', image: '/placeholder-1.jpg', description: 'You and Noah were forced to marry, and you fell in love. But it all fell apart when his...', messages: '4.2K', tags: ['Manipulative', 'Hatelove', 'Sharp-tongued', 'Mature'], isMultiRole: true },
  { id: 2, name: 'Zombies in the Descendants cast', image: '/placeholder-2.jpg', description: "You're a famous actor who used to live in New York, but you felt stuck, so you...", messages: '9.3K', tags: ['Celebrity', 'Student', 'Secret Crush'], isMultiRole: true },
  { id: 3, name: 'Kim Dahyun', image: '/placeholder-3.jpg', description: 'Twice is a female K-pop group with nine members, and two of them are in a...', messages: '19.1K', tags: ['Undercover Love', 'Celebrity', 'GL', 'Jealous'], isNew: true },
  { id: 4, name: 'Avery', image: '/placeholder-4.jpg', description: "Avery Hart never meant to get wrapped up in someone else's lie — especially not M...", messages: '394.1K', tags: ['Undercover Love', 'OC', 'Manipulative'], isNew: true },
]

// ===== Referral & Coins: Local Demo Utilities =====
const REF_BONUS = 250
const REF_MAX = 3

function genId() {
  try {
    const arr = new Uint32Array(4)
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(arr)
      return Array.from(arr).map(n => n.toString(16).padStart(8, '0')).join('').slice(0, 16)
    }
  } catch (e) { /* ignore */ }
  return (Date.now().toString(36) + Math.random().toString(36).slice(2, 10)).slice(0, 16)
}

function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

// ===== Response Modes / Models =====
const RESPONSE_MODES = [
  { code: 'S', name: 'Standard', description: 'Default. Balanced for any conversation.', free: true, includes: [] },
  { code: 'P', name: 'Passion', description: 'Most popular. Great at roleplay (Includes LM2).', free: false, includes: ['LM2'], popular: true },
  { code: 'NSFW', name: 'Erotic (NSFW)', description: "Don't blame us if it keeps you up at night! (Includes LM2 and P)", free: false, includes: ['LM2', 'P'] },
  { code: 'T', name: 'Tale', description: 'Better at long responses and storytelling (Includes LM2).', free: false, includes: ['LM2'] },
  { code: 'LM', name: 'Long Memory 2X', description: 'Strong memory. Remembers more chats and moments.', free: false, includes: [] },
]
function getSelectedMode() {
  return lsGet('response_mode', 'S')
}
function setSelectedMode(code) {
  lsSet('response_mode', code)
}

// ===== Subscription (Demo) =====
function isSubscribed() {
  return !!lsGet('is_subscribed', false)
}
function setSubscribed(v) {
  lsSet('is_subscribed', !!v)
}

// ===== Auth (Demo) =====
function getAuthRegistry() { return lsGet('auth_registry', {}) }
function saveAuthRegistry(reg) { lsSet('auth_registry', reg) }
function getAuthUser() {
  const email = lsGet('auth_current_email', null)
  if (!email) return null
  const reg = getAuthRegistry()
  return reg[email] || null
}
function isLoggedIn() { return !!getAuthUser() }
function authRegister({ email, password, name }) {
  const reg = getAuthRegistry()
  if (reg[email]) return { ok: false, error: 'Email is already registered' }
  const id = getCurrentUserId()
  reg[email] = { id, email, name: name || '', password }
  saveAuthRegistry(reg)
  lsSet('auth_current_email', email)
  // Attach email/name to demo user record
  const u = getUser(id)
  u.email = email
  u.name = name || ''
  saveUser(u)
  return { ok: true }
}
function authLogin(email, password) {
  const reg = getAuthRegistry()
  const rec = reg[email]
  if (!rec || rec.password !== password) return { ok: false, error: 'Invalid email or password' }
  lsSet('auth_current_email', email)
  return { ok: true }
}
function authLogout() {
  try { localStorage.removeItem('auth_current_email') } catch {}
}

function getCurrentUserId() {
  let id = lsGet('demo_user_id', null)
  if (!id) {
    id = genId()
    lsSet('demo_user_id', id)
    // Initialize user record
    lsSet(`user:${id}`, { id, coins: 0, emailVerified: false, referredBy: null, referralCounted: false })
  } else {
    // ensure record exists
    if (!lsGet(`user:${id}`, null)) {
      lsSet(`user:${id}`, { id, coins: 0, emailVerified: false, referredBy: null, referralCounted: false })
    }
  }
  return id
}

function getUser(userId) {
  return lsGet(`user:${userId}`, { id: userId, coins: 0, emailVerified: false, referredBy: null, referralCounted: false })
}
function saveUser(user) { lsSet(`user:${user.id}`, user) }

function getLedger(referrerId) { return lsGet(`ref_ledger:${referrerId}`, []) }
function saveLedger(referrerId, arr) { lsSet(`ref_ledger:${referrerId}`, arr) }

function addCoins(userId, amount) {
  const u = getUser(userId)
  u.coins = (u.coins || 0) + amount
  saveUser(u)
  return u.coins
}

function awardReferral(referrerId, referredUserId) {
  if (!referrerId || referrerId === referredUserId) return { awarded: false, reason: 'invalid' }
  const ledger = getLedger(referrerId)
  if (ledger.includes(referredUserId)) return { awarded: false, reason: 'duplicate' }
  if (ledger.length >= REF_MAX) return { awarded: false, reason: 'cap' }
  ledger.push(referredUserId)
  saveLedger(referrerId, ledger)
  addCoins(referrerId, REF_BONUS)
  return { awarded: true }
}

function getReferralStats(userId) {
  const ids = getLedger(userId)
  return { count: ids.length, max: REF_MAX, ids }
}

// Sidebar Component
function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  
  const menuItems = [
    { icon: Bell, label: 'Following', path: '/following' },
    { icon: User, label: 'You', path: '/you' },
    { icon: Star, label: 'For you', path: '/for-you' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: MessageSquare, label: 'Chats', path: '/' },
    { icon: User, label: 'Characters', path: '/characters' },
    { icon: Star, label: 'My Creations', path: '/my-creations' },
    { icon: Star, label: 'Gallery', path: '/gallery' },
    { icon: Heart, label: 'Favorites', path: '/favorites' },
    { icon: Coins, label: 'Coins', path: '/coins' },
    { icon: Crown, label: 'Membership', path: '/membership' },
    { icon: PlusCircle, label: 'Create', path: '/create' },
    { icon: Wand2, label: 'Generate Video/Image', path: '/generate' },
    { icon: Key, label: 'API Settings', path: '/api-settings' },
    { icon: Settings, label: 'Developer', path: '/developer' },
    { icon: Download, label: 'Install our app', path: '/install' },
  ]

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-72 glass-morphism border-r border-white/10 z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gradient">Menu</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <nav className="p-2 overflow-y-auto h-[calc(100vh-73px)]">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                navigate(item.path)
                onClose()
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Auth Quick Actions */}
        <div className="border-t border-gray-800 p-4">
          {isLoggedIn() ? (
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Logged in as</div>
              <div className="text-white font-medium truncate">{getAuthUser()?.email}</div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => { navigate('/you'); onClose(); }} className="flex-1 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white text-sm py-2 rounded-lg">Account</button>
                <button onClick={() => { authLogout(); onClose(); navigate('/'); }} className="flex-1 bg-red-700/80 hover:bg-red-700 text-white text-sm py-2 rounded-lg">Logout</button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => { navigate('/login'); onClose(); }} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 rounded-lg">Log in</button>
              <button onClick={() => { navigate('/signup'); onClose(); }} className="flex-1 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white text-sm py-2 rounded-lg">Sign up</button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Bottom Navigation Component
function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: MessageSquare, label: 'Messages', path: '/messages', badge: 30 },
    { icon: PlusCircle, label: 'Create', path: '/create', isCenter: true },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Developer', path: '/developer' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 lg:hidden z-30">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center relative ${
              item.isCenter ? 'scale-125' : ''
            } ${
              location.pathname === item.path ? 'text-purple-500' : 'text-gray-400'
            }`}
          >
            <item.icon size={item.isCenter ? 32 : 24} />
            {item.badge && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// Home/Chat List Screen
function ChatListScreen() {
  const navigate = useNavigate()
  
  return (
    <div className="min-h-screen bg-black text-white pb-20 lg:pb-4">
      {/* Search Bar */}
      <div className="p-4 sticky top-0 bg-black z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Chris Sturniolo"
            className="w-full bg-[#1a1a1a] text-white rounded-full py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="divide-y divide-gray-800">
        {mockChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => navigate(`/chat/${chat.id}`)}
            className="flex items-center gap-3 p-4 hover:bg-[#1a1a1a] cursor-pointer transition-colors"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-yellow-500 font-medium truncate">{chat.name}</h3>
                <span className="text-gray-500 text-sm">{chat.time}</span>
              </div>
              <p className="text-gray-400 text-sm truncate italic">{chat.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Explore Screen
function ExploreScreen() {
  const [activeTab, setActiveTab] = useState('Multi-Role')
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const data = await apiGet('/api/characters')
        if (!cancelled) {
          if (Array.isArray(data) && data.length > 0) {
            setCharacters(data)
          } else {
            // Auto-generate characters on first load if none exist in backend
            try {
              const generated = await apiPost('/api/characters/generate', { count: 24 })
              if (!cancelled) setCharacters(Array.isArray(generated) ? generated : [])
            } catch (genErr) {
              console.warn('[Explore] Generation failed, falling back to generated mock', genErr)
              if (!cancelled) {
                setError('Failed to generate characters')
                const generated = generateAICharacters(24)
                localStorage.setItem('generated_characters', JSON.stringify(generated))
                setCharacters(generated)
              }
            }
          }
        }
      } catch (e) {
        console.warn('[Explore] Failed to load characters from API, falling back to generated mock', e)
        if (!cancelled) {
          setError('Failed to load characters')
          const generated = generateAICharacters(24)
          localStorage.setItem('generated_characters', JSON.stringify(generated))
          setCharacters(generated)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])
  
  const tabs = ['Fantastic', 'Multi-Role', 'Undercover Love', 'OC', 'Anime']
  
  return (
    <div className="min-h-screen bg-black text-white pb-20 lg:pb-4">
      {/* Header */}
      <div className="sticky top-0 bg-black z-10 border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          <div className="flex gap-6">
            <button className="text-gray-400">Subscriptions</button>
            <button className="text-white border-b-2 border-purple-500 pb-1">Explore</button>
          </div>
          <Search className="text-gray-400" size={24} />
        </div>
        
        {/* Category Tabs */}
        <div className="flex gap-4 px-4 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-4 py-2 rounded-full ${
                activeTab === tab
                  ? 'bg-white text-black'
                  : 'bg-[#1a1a1a] text-gray-400'
              }`}
            >
              {tab}
              {tab === 'Fantastic' && <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded">PRO</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Character Grid */}
      <div className="flex overflow-x-auto gap-3 px-4 pb-4 scrollbar-hide">
        {loading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[200px] bg-[#1a1a1a] rounded-lg overflow-hidden animate-pulse">
            <div className="aspect-[3/4] bg-[#2a2a2a]" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-[#2a2a2a] rounded" />
              <div className="h-3 bg-[#2a2a2a] rounded w-2/3" />
            </div>
          </div>
        ))}
        {!loading && characters.map((char) => (
          <div
            key={char.id}
            onClick={() => navigate(`/character/${char.id}`)}
            className="flex-shrink-0 w-[200px] bg-[#1a1a1a] rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
          >
            <div className="relative aspect-[3/4] bg-gradient-to-br from-purple-500 to-pink-500">
              {/* Image */}
              {(char.avatarUrl || char.image) && (
                <img src={char.avatarUrl || char.image} alt={char.name} className="absolute inset-0 w-full h-full object-cover" />
              )}
              {/* Interaction count badge on image */}
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                <MessageSquare size={12} className="text-white" />
                <span className="text-white text-xs font-semibold">{char.messages || '0'}</span>
              </div>
              {char.isNew && (
                <span className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">New</span>
              )}
              {char.isMultiRole && (
                <div className="absolute bottom-2 right-2 bg-black/50 rounded-full p-1">
                  <User size={16} className="text-white" />
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="text-white font-semibold mb-1 truncate">{char.name}</h3>
              <p className="text-gray-400 text-xs mb-2 line-clamp-2">{char.description}</p>
              <div className="flex flex-wrap gap-1">
                {(char.tags || []).slice(0, 3).map((tag, i) => (
                  <span key={i} className="text-xs bg-[#2a2a2a] text-gray-400 px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        {!loading && !characters.length && (
          <div className="w-full text-center text-gray-500">No characters found.</div>
        )}
        {error && <div className="w-full text-center text-red-500 text-sm">{error}</div>}
      </div>
    </div>
  )
}

// For You Screen
function ForYouScreen() {
  const [activeTab, setActiveTab] = useState('Multi-Role')
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const data = await apiGet('/api/characters')
        if (!cancelled) {
          let list = Array.isArray(data) ? data : []
          if (list.length === 0) {
            try {
              const generated = await apiPost('/api/characters/generate', { count: 24 })
              list = Array.isArray(generated) ? generated : []
            } catch (genErr) {
              console.warn('[ForYou] Generation failed, falling back to generated mock', genErr)
              setError('Failed to generate characters')
              list = generateAICharacters(24)
              localStorage.setItem('generated_characters', JSON.stringify(list))
            }
          }
          // simple personalization: shuffle the list
          const shuffled = [...list]
            .map(v => ({ v, r: Math.random() }))
            .sort((a, b) => a.r - b.r)
            .map(({ v }) => v)
          setCharacters(shuffled)
        }
      } catch (e) {
        console.warn('[ForYou] Failed to load characters from API, falling back to generated mock', e)
        if (!cancelled) {
          setError('Failed to load characters')
          const generated = generateAICharacters(24)
          localStorage.setItem('generated_characters', JSON.stringify(generated))
          setCharacters(generated)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const tabs = ['Fantastic', 'Multi-Role', 'Undercover Love', 'OC', 'Anime']

  return (
    <div className="min-h-screen bg-black text-white pb-20 lg:pb-4">
      {/* Header */}
      <div className="sticky top-0 bg-black z-10 border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          <div className="flex gap-6">
            <button onClick={() => navigate('/explore')} className="text-gray-400">Explore</button>
            <button className="text-white border-b-2 border-purple-500 pb-1">For You</button>
          </div>
          <Search className="text-gray-400" size={24} />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-4 px-4 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-4 py-2 rounded-full ${
                activeTab === tab
                  ? 'bg-white text-black'
                  : 'bg-[#1a1a1a] text-gray-400'
              }`}
            >
              {tab}
              {tab === 'Fantastic' && <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded">PRO</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Character Grid */}
      <div className="flex overflow-x-auto gap-3 px-4 pb-4 scrollbar-hide">
        {loading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[200px] bg-[#1a1a1a] rounded-lg overflow-hidden animate-pulse">
            <div className="aspect-[3/4] bg-[#2a2a2a]" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-[#2a2a2a] rounded" />
              <div className="h-3 bg-[#2a2a2a] rounded w-2/3" />
            </div>
          </div>
        ))}
        {!loading && characters.map((char) => (
          <div
            key={char.id}
            onClick={() => navigate(`/character/${char.id}`)}
            className="flex-shrink-0 w-[200px] bg-[#1a1a1a] rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
          >
            <div className="relative aspect-[3/4] bg-gradient-to-br from-purple-500 to-pink-500">
              {/* Image */}
              {(char.avatarUrl || char.image) && (
                <img src={char.avatarUrl || char.image} alt={char.name} className="absolute inset-0 w-full h-full object-cover" />
              )}
              {/* Interaction count badge on image */}
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                <MessageSquare size={12} className="text-white" />
                <span className="text-white text-xs font-semibold">{char.messages || '0'}</span>
              </div>
              {char.isNew && (
                <span className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">New</span>
              )}
              {char.isMultiRole && (
                <div className="absolute bottom-2 right-2 bg-black/50 rounded-full p-1">
                  <User size={16} className="text-white" />
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="text-white font-semibold mb-1 truncate">{char.name}</h3>
              <p className="text-gray-400 text-xs mb-2 line-clamp-2">{char.description}</p>
              <div className="flex flex-wrap gap-1">
                {(char.tags || []).slice(0, 3).map((tag, i) => (
                  <span key={i} className="text-xs bg-[#2a2a2a] text-gray-400 px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        {!loading && !characters.length && (
          <div className="w-full text-center text-gray-500">No characters found.</div>
        )}
        {error && <div className="w-full text-center text-red-500 text-sm">{error}</div>}
      </div>
    </div>
  )
}

// Character Profile Screen
function CharacterProfileScreen() {
  const navigate = useNavigate()
  
  return (
    <div className="min-h-screen bg-black text-white pb-20 lg:pb-4">
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm z-10 p-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)}>
          <ChevronRight size={24} className="rotate-180 text-white" />
        </button>
        <h1 className="text-yellow-500 font-semibold">Lily - your twin</h1>
        <div className="flex items-center gap-2">
          <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">AI</span>
          <Settings size={20} className="text-gray-400" />
        </div>
      </div>

      {/* Character Image */}
      <div className="relative h-64 bg-gradient-to-br from-blue-400 to-blue-200">
        {/* Placeholder for character image */}
      </div>

      {/* Character Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-yellow-500 text-2xl font-bold">Lily - your twin</h2>
          <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">AI</span>
          <button className="ml-auto text-gray-400">
            <Settings size={20} />
          </button>
        </div>
        
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
          <span>CID: VgHJF</span>
          <span>@Hade 👑</span>
          <ChevronRight size={16} />
        </div>

        <p className="text-gray-300 mb-3">
          Lily is your twin sister. You've always been close. She is energetic and loves to cuddle.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {['Flirtatious', 'Loyal', 'Funny', 'Forbidden Love', 'Cute'].map((tag) => (
            <span key={tag} className="bg-[#1a1a1a] text-gray-400 px-3 py-1 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-6 mb-6 text-sm">
          <span className="text-gray-400">
            <span className="text-white font-semibold">167</span> Collectors
          </span>
          <span className="text-gray-400">
            <span className="text-white font-semibold">231K</span> Messages
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Button 
            onClick={() => navigate('/chat/1')}
            className="flex-1 bg-white text-black hover:bg-gray-200 rounded-full py-6 text-lg font-semibold"
          >
            Chat
          </Button>
          <button className="w-14 h-14 rounded-full bg-[#1a1a1a] flex items-center justify-center">
            <Star size={24} className="text-gray-400" />
          </button>
          <button className="w-14 h-14 rounded-full bg-[#1a1a1a] flex items-center justify-center">
            <Share2 size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800 mb-4">
          <div className="flex gap-6">
            <button className="text-white border-b-2 border-purple-500 pb-2">Comment 2</button>
            <button className="text-gray-400 pb-2">Moments</button>
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-semibold">JDD</span>
                <span className="text-gray-500 text-sm">09-22</span>
              </div>
              <p className="text-xl mb-2">😂</p>
              <div className="flex gap-4 text-gray-400 text-sm">
                <button>Reply</button>
                <button>Translate</button>
              </div>
            </div>
            <div className="text-right">
              <Heart size={20} className="text-gray-600 mb-1" />
              <span className="text-gray-600 text-sm">0</span>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-semibold">John</span>
                <span className="text-yellow-500">👑</span>
                <span className="text-gray-500 text-sm">09-21</span>
              </div>
              <p className="text-gray-300 mb-2">I like this one. Fun so</p>
              <div className="flex gap-4 text-gray-400 text-sm">
                <button>Reply</button>
                <button>Translate</button>
              </div>
            </div>
            <div className="text-right">
              <Heart size={20} className="text-gray-600 mb-1" />
              <span className="text-gray-600 text-sm">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Chat Screen
function ChatScreen() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [character, setCharacter] = useState(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [modeOpen, setModeOpen] = useState(false)
  const [selectedMode, setSelectedModeState] = useState(getSelectedMode())
  const [isTyping, setIsTyping] = useState(false)
  const currentMode = useMemo(() => RESPONSE_MODES.find(m => m.code === selectedMode) || RESPONSE_MODES[0], [selectedMode])

  // Load character and messages
  useEffect(() => {
    // Try to load custom character first
    const customChars = JSON.parse(localStorage.getItem('custom_characters') || '[]')
    const customChar = customChars.find(c => c.id === id)

    if (customChar) {
      setCharacter(customChar)
    } else {
      // Mock character for demo
      setCharacter({
        id,
        name: 'Lily - your twin',
        description: 'Lily is your twin sister. You\'ve always been close. She is energetic and loves to cuddle.',
        greeting: 'Hey bro. I like your bed better, it smells like you.',
      })
    }

    // Load messages from localStorage
    const chatKey = `chat_${id}`
    const savedMessages = JSON.parse(localStorage.getItem(chatKey) || '[]')
    setMessages(savedMessages)
  }, [id])

  const handleSelectMode = (mode) => {
    const subbed = isSubscribed()
    if (mode.free || subbed) {
      setSelectedModeState(mode.code)
      setSelectedMode(mode.code)
      setModeOpen(false)
    } else {
      alert('This mode requires a subscription. View plans on the Membership page.')
      navigate('/membership')
    }
  }

  const sendMessage = async () => {
    if (!message.trim()) return

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
    }

    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    const userMessageText = message.trim()
    setMessage('')

    // Save to localStorage
    const chatKey = `chat_${id}`
    localStorage.setItem(chatKey, JSON.stringify(newMessages))

    // Get AI response
    setIsTyping(true)
    try {
      const aiResponse = await getChatResponse(character, messages, userMessageText)

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        mode: currentMode.code,
      }

      const updatedMessages = [...newMessages, aiMsg]
      setMessages(updatedMessages)
      localStorage.setItem(chatKey, JSON.stringify(updatedMessages))
      setIsTyping(false)
    } catch (error) {
      setIsTyping(false)

      if (error.message === 'NO_API_KEY') {
        // Show API key setup prompt
        const setupKey = confirm(
          'To enable AI chat, you need an API key.\n\n' +
          'Would you like to set up an API key now?\n\n' +
          'You can use:\n' +
          '• OpenRouter (Free tier available) - openrouter.ai\n' +
          '• Hugging Face (Free) - huggingface.co'
        )

        if (setupKey) {
          navigate('/api-settings')
        }
      } else {
        // Fallback to simple response
        const aiMsg = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '*smiles* I understand. Tell me more about that.',
          timestamp: new Date().toISOString(),
          mode: currentMode.code,
        }

        const updatedMessages = [...newMessages, aiMsg]
        setMessages(updatedMessages)
        localStorage.setItem(chatKey, JSON.stringify(updatedMessages))
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!character) return null
  
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-black border-b border-gray-800 p-4 flex items-center justify-between z-10">
        <button onClick={() => navigate(-1)}>
          <ChevronRight size={24} className="rotate-180 text-white" />
        </button>
        <h1 className="text-yellow-500 font-semibold truncate max-w-[60%]">{character.name}</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setModeOpen(v => !v)} className="bg-[#1a1a1a] px-3 py-1 rounded-full flex items-center gap-1">
              <span className="text-white">{currentMode.name}</span>
              <ChevronRight size={16} className="text-gray-400 rotate-90" />
            </button>
            {modeOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#0a0a0a] border border-gray-800 rounded-xl shadow-lg z-20 p-2">
                <div className="px-2 py-1 text-xs text-gray-500">Response Modes</div>
                {RESPONSE_MODES.map((mode) => (
                  <button key={mode.code} onClick={() => handleSelectMode(mode)} className="w-full flex items-start gap-2 p-3 rounded-lg hover:bg-[#1a1a1a]">
                    <div className={`text-[10px] px-2 py-0.5 rounded-full ${mode.free ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-200'}`}>{mode.code}</div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm">{mode.name}</span>
                        {!mode.free && <span className="text-[10px] text-gray-400 uppercase tracking-wide">Sub Pack</span>}
                        {mode.popular && <span className="text-[10px] text-yellow-400 uppercase tracking-wide">Most Popular</span>}
                      </div>
                      <div className="text-xs text-gray-400">{mode.description}</div>
                    </div>
                    {!mode.free && !isSubscribed() && <Lock size={16} className="text-gray-500 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="relative">
            <Menu size={24} className="text-gray-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {/* Info Banner */}
        <div className="text-center mb-4 text-gray-400 text-sm">
          <p>{character.isCustom ? 'Your custom character' : 'This character was created by @Creator'}</p>
          <p>All responses are AI-generated and fictional.</p>
        </div>

        {/* Intro Card */}
        {(character.description || character.scenario) && (
          <div className="bg-[#1a1a1a] rounded-lg p-4 mb-4">
            <h3 className="text-white font-semibold mb-2">Intro.</h3>
            <p className="text-gray-400 text-sm">
              {character.description || character.scenario}
            </p>
          </div>
        )}

        {/* Initial greeting if no messages */}
        {messages.length === 0 && character.greeting && (
          <>
            <div className="flex items-center justify-center mb-4">
              <span className="bg-[#2a2a2a] text-gray-400 px-4 py-1 rounded-full text-sm">Today</span>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0" />
                <div className="flex-1">
                  <div className="bg-[#1a1a1a] rounded-2xl rounded-tl-none p-4">
                    <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded mb-2 inline-block">{currentMode.free ? 'Free' : currentMode.name}</span>
                    <p className="text-white">{character.greeting}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <>
            <div className="flex items-center justify-center mb-4">
              <span className="bg-[#2a2a2a] text-gray-400 px-4 py-1 rounded-full text-sm">Today</span>
            </div>
            <div className="space-y-4">
              {messages.map((msg) => (
                msg.role === 'user' ? (
                  <div key={msg.id} className="flex gap-3 justify-end">
                    <div className="flex-1 max-w-[80%]">
                      <div className="bg-purple-600 rounded-2xl rounded-tr-none p-4 ml-auto">
                        <p className="text-white">{msg.content}</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex-shrink-0" />
                  </div>
                ) : (
                  <div key={msg.id} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="bg-[#1a1a1a] rounded-2xl rounded-tl-none p-4">
                        <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded mb-2 inline-block">
                          {msg.mode ? RESPONSE_MODES.find(m => m.code === msg.mode)?.name || 'Standard' : 'Standard'}
                        </span>
                        <p className="text-white">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                )
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="bg-[#1a1a1a] rounded-2xl rounded-tl-none p-4">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 p-4 lg:pb-4 pb-20">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${character.name}...`}
            className="flex-1 bg-[#1a1a1a] text-white rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isTyping}
          />
          <button className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center">
            <Plus size={20} className="text-gray-400" />
          </button>
          <button className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center">
            <Menu size={20} className="text-gray-400" />
          </button>
          <button
            onClick={sendMessage}
            disabled={!message.trim() || isTyping}
            className="w-10 h-10 rounded-full bg-purple-600 disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send size={20} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Create Modal Screen
function CreateModalScreen() {
  const navigate = useNavigate()
  
  return (
    <div className="min-h-screen bg-black text-white pb-20 lg:pb-4">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Create</h1>
          <button onClick={() => navigate(-1)}>
            <X size={24} className="text-gray-400" />
          </button>
        </div>
        
        <p className="text-gray-400 text-center mb-8">Select content to create</p>

        {/* Character Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Character</h2>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => navigate('/create-character')} className="bg-gradient-to-br from-purple-900 to-purple-700 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-full bg-purple-400 flex items-center justify-center">
                <Plus size={24} className="text-white" />
              </div>
              <span className="text-white font-semibold">Regular</span>
            </button>

            <button onClick={() => navigate('/create-character')} className="bg-gradient-to-br from-teal-900 to-teal-700 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:scale-105 transition-transform">
              <div className="w-12 h-12 flex items-center justify-center">
                <User size={24} className="text-teal-300" />
              </div>
              <span className="text-white font-semibold">Multi-Role</span>
            </button>
          </div>
        </div>

        {/* Templates Section */}
        <div className="mb-8">
          <button onClick={() => navigate('/templates')} className="w-full bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-4 flex items-center justify-between hover:scale-105 transition-transform">
            <span className="text-white font-semibold">Templates</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-300">12 Templates Available</span>
              <ChevronRight size={20} className="text-gray-400" />
            </div>
          </button>
        </div>

        {/* Story Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Story</h2>
          <button className="w-full bg-gradient-to-br from-pink-900/50 to-purple-900/50 rounded-xl p-4 flex items-center justify-between hover:scale-105 transition-transform">
            <div className="flex items-center gap-3">
              <div className="text-pink-400">📖</div>
              <span className="text-white font-semibold">Fiction</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">NEW</span>
              <ChevronRight size={20} className="text-gray-400" />
            </div>
          </button>
        </div>

        {/* Canvas Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Canvas</h2>
          <button className="w-full bg-[#1a1a1a] rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:scale-105 transition-transform">
            <div className="text-4xl">🎭</div>
            <span className="text-white font-semibold">AvatarMix</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Coins Screen
function CoinsScreen() {
  const navigate = useNavigate()
  const userId = useMemo(() => getCurrentUserId(), [])
  const [coinsBalance, setCoinsBalance] = useState(getUser(userId).coins || 0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Refresh coins when visiting this screen
    setCoinsBalance(getUser(userId).coins || 0)
  }, [userId])

  const referralLink = useMemo(() => {
    const origin = window.location.origin
    return `${origin}/?ref=${userId}`
  }, [userId])

  const { count: verifiedCount, max: verifiedMax, ids: verifiedIds } = useMemo(() => getReferralStats(userId), [userId, coinsBalance])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {
      setCopied(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-900/20 to-black text-white pb-20 lg:pb-4">
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-between z-10">
        <button onClick={() => navigate(-1)}>
          <ChevronRight size={24} className="rotate-180 text-white" />
        </button>
        <div className="flex items-center gap-2 bg-yellow-900/30 px-4 py-2 rounded-full">
          <Coins size={20} className="text-yellow-500" />
          <span className="font-semibold">{coinsBalance}</span>
        </div>
        <button>
          <Menu size={24} className="text-gray-400" />
        </button>
      </div>

      <div className="p-4">
        {/* Refer & Earn */}
        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-600/30 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <LinkIcon size={18} className="text-yellow-500" />
            <h2 className="text-lg font-bold">Refer & Earn</h2>
            <span className="ml-auto text-xs text-gray-400">{verifiedCount}/{verifiedMax} verified</span>
          </div>
          <p className="text-gray-300 text-sm mb-3">Invite friends. Earn 250 coins when they join and verify their email (max 3).</p>
          <div className="flex items-center gap-2 bg-black/40 rounded-lg p-2 border border-yellow-700/30">
            <input readOnly value={referralLink} className="flex-1 bg-transparent text-gray-200 text-sm outline-none" />
            <button onClick={copyLink} className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-3 py-1 rounded-md flex items-center gap-1">
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="mt-3 text-xs text-gray-400">
            <p>Verified referrals: {verifiedIds.length === 0 ? 'None yet' : verifiedIds.map(id => id.slice(0,4) + '...' + id.slice(-2)).join(', ')}</p>
          </div>
        </div>

        {/* Coins Description */}
        <div className="bg-[#1a1a1a] rounded-xl p-4 mb-6">
          <h2 className="text-xl font-bold mb-4">Coins Description</h2>
          <div className="space-y-2 text-gray-300 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">💎</span>
              <span>Heart Whisper</span>
              <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded ml-auto">New</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">💎</span>
              <span>Unlock Premium Models</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">💎</span>
              <span>Regenerate AI Response</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">💎</span>
              <span>Inspiration Reply</span>
            </div>
          </div>
        </div>

        {/* Premium Models & Response Modes */}
        <div className="bg-[#1a1a1a] rounded-xl p-4 mb-6">
          <h2 className="text-xl font-bold mb-3">Premium Models & Response Modes</h2>
          <p className="text-gray-400 text-sm mb-3">Standard is free. The rest are included in sub packs.</p>
          <div className="space-y-3">
            {RESPONSE_MODES.map((m) => (
              <div key={m.code} className="flex items-start gap-3 bg-black/30 border border-gray-800 rounded-lg p-3">
                <div className={`text-[10px] px-2 py-0.5 rounded-full ${m.free ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-200'}`}>{m.code}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{m.name}</span>
                    {m.popular && <span className="text-[10px] text-yellow-400 uppercase tracking-wide">Most Popular</span>}
                    {!m.free && <span className="text-[10px] text-gray-400 uppercase tracking-wide">Sub Pack</span>}
                  </div>
                  <p className="text-gray-400 text-xs">{m.description}</p>
                </div>
                {!m.free && <button onClick={() => navigate('/membership')} className="text-xs text-purple-400 hover:text-purple-300">Unlock</button>}
              </div>
            ))}
          </div>
        </div>

        {/* Earning Options */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button className="bg-[#1a1a1a] rounded-xl p-4 hover:bg-[#2a2a2a] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Watch AD</span>
              <ChevronRight size={20} className="text-gray-400" />
            </div>
            <p className="text-gray-400 text-xs mb-1">(0/10)</p>
            <p className="text-gray-300 text-sm">Up to 100 coins for each ad!</p>
          </button>
          
          <button className="bg-[#1a1a1a] rounded-xl p-4 hover:bg-[#2a2a2a] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Daily Tasks</span>
              <ChevronRight size={20} className="text-gray-400" />
            </div>
            <p className="text-gray-300 text-sm mt-4">Earn Coins</p>
          </button>
        </div>

        {/* Purchase Options */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1a1a1a] rounded-xl p-4">
            <h3 className="text-2xl font-bold text-center mb-2">400</h3>
            <div className="flex justify-center mb-3">
              <Coins size={32} className="text-yellow-500" />
            </div>
            <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 rounded-full transition-colors">
              $4.99
            </button>
            <p className="text-gray-500 text-xs text-center mt-1 line-through"></p>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-4">
            <h3 className="text-2xl font-bold text-center mb-2">1000</h3>
            <div className="flex justify-center mb-3">
              <Coins size={32} className="text-yellow-500" />
            </div>
            <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 rounded-full transition-colors">
              $9.99
            </button>
            <p className="text-gray-500 text-xs text-center mt-1 line-through">$9.99</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-xl p-4 border-2 border-purple-500">
            <div className="flex items-center justify-center gap-1 text-xs mb-1">
            
            </div>
            <h3 className="text-2xl font-bold text-center mb-1">2500</h3>
            <p className="text-yellow-500 text-center text-sm mb-2"></p>
            <div className="flex justify-center mb-3">
              <Coins size={32} className="text-yellow-500" />
            </div>
            <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 rounded-full transition-colors">
              $19.99
            </button>
            <p className="text-gray-300 text-xs text-center mt-1"></p>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-4">
            <h3 className="text-2xl font-bold text-center mb-2">10000</h3>
            <div className="flex justify-center mb-3">
              <Coins size={32} className="text-yellow-500" />
            </div>
            <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 rounded-full transition-colors">
              $79.99
            </button>
            <p className="text-gray-500 text-xs text-center mt-1 line-through"></p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p className="mb-2">Purchasing means you accept our <a href="#" className="text-purple-400">Privacy Policy</a>,</p>
          <p><a href="#" className="text-purple-400">Terms of Use</a> and <a href="#" className="text-purple-400">End User License Agreement</a></p>
        </div>
      </div>
    </div>
  )
}

// Generate Video/Image Screen
function GenerateScreen() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('image')
  const [prompt, setPrompt] = useState('')
  const [generatedContent, setGeneratedContent] = useState([])
  const [generating, setGenerating] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState('')
  const [selectedRatio, setSelectedRatio] = useState('1:1')
  const [selectedQuality, setSelectedQuality] = useState('Standard')

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt')
      return
    }

    setGenerating(true)

    try {
      const apiKey = localStorage.getItem('openrouter_api_key') || ''

      if (!apiKey) {
        alert('Please set up your OpenRouter API key in API Settings first')
        navigate('/api-settings')
        return
      }

      // Use Stable Diffusion via Together AI (cheaper) or Flux
      const imagePrompt = `${prompt}${selectedStyle ? `, ${selectedStyle} style` : ''}, high quality, detailed`

      // For now, use Pollinations AI (free image generation)
      const encodedPrompt = encodeURIComponent(imagePrompt)
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`

      const newItem = {
        id: Date.now().toString(),
        prompt,
        imageUrl,
        style: selectedStyle,
        ratio: selectedRatio,
        quality: selectedQuality,
        timestamp: new Date().toISOString(),
      }

      setGeneratedContent([newItem, ...generatedContent])

      // Save to localStorage
      const saved = JSON.parse(localStorage.getItem('generated_content') || '[]')
      saved.unshift(newItem)
      localStorage.setItem('generated_content', JSON.stringify(saved.slice(0, 50)))

      setPrompt('')
    } catch (error) {
      console.error('Generation error:', error)
      alert('Failed to generate image. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  // Load saved content
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('generated_content') || '[]')
    setGeneratedContent(saved)
  }, [])
  
  return (
    <div className="min-h-screen bg-black text-white pb-20 lg:pb-4">
      {/* Header */}
      <div className="sticky top-0 bg-black border-b border-gray-800 p-4 flex items-center justify-between z-10">
        <button onClick={() => navigate(-1)}>
          <ChevronRight size={24} className="rotate-180 text-white" />
        </button>
        <h1 className="text-xl font-bold">Generate Content</h1>
        <button>
          <Settings size={24} className="text-gray-400" />
        </button>
      </div>

      <div className="p-4">
        {/* Tab Selection */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('image')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'image'
                ? 'bg-purple-600 text-white'
                : 'bg-[#1a1a1a] text-gray-400'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Image size={20} />
              <span>Generate Image</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'video'
                ? 'bg-purple-600 text-white'
                : 'bg-[#1a1a1a] text-gray-400'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Wand2 size={20} />
              <span>Generate Video</span>
            </div>
          </button>
        </div>

        {/* Description Card */}
        <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-4 mb-6 border border-purple-500/30">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Wand2 size={20} className="text-purple-400" />
            {activeTab === 'image' ? 'AI Image Generator' : 'AI Video Generator'}
          </h3>
          <p className="text-gray-300 text-sm">
            {activeTab === 'image'
              ? 'Create stunning images from text descriptions. Describe what you want to see and our AI will bring it to life.'
              : 'Transform your ideas into dynamic videos. Describe your scene and watch it come alive with AI-powered video generation.'}
          </p>
        </div>

        {/* Prompt Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">Enter Your Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={activeTab === 'image' 
              ? 'E.g., A beautiful sunset over mountains with purple sky, digital art style, highly detailed'
              : 'E.g., A cinematic shot of a futuristic city at night, neon lights, flying cars, 4k quality'}
            className="w-full bg-[#1a1a1a] text-white rounded-xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
        </div>

        {/* Style Presets */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3">Style Presets</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Realistic', 'Anime', 'Digital Art', 'Oil Painting', '3D Render', 'Watercolor', 'Cyberpunk', 'Fantasy'].map((style) => (
              <button
                key={style}
                onClick={() => setSelectedStyle(selectedStyle === style ? '' : style)}
                className={`py-2 px-4 rounded-lg transition-colors text-sm ${
                  selectedStyle === style
                    ? 'bg-purple-600 text-white'
                    : 'bg-[#1a1a1a] hover:bg-purple-600 text-gray-300 hover:text-white'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Options */}
        <div className="bg-[#1a1a1a] rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold mb-3">Advanced Options</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Aspect Ratio</label>
              <div className="flex gap-2">
                {['1:1', '16:9', '9:16', '4:3'].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setSelectedRatio(ratio)}
                    className={`flex-1 py-2 rounded-lg transition-colors text-sm ${
                      selectedRatio === ratio
                        ? 'bg-purple-600 text-white'
                        : 'bg-[#2a2a2a] hover:bg-purple-600 text-gray-300 hover:text-white'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Quality</label>
              <div className="flex gap-2">
                {['Standard', 'HD', '4K'].map((quality) => (
                  <button
                    key={quality}
                    onClick={() => setSelectedQuality(quality)}
                    className={`flex-1 py-2 rounded-lg transition-colors text-sm ${
                      selectedQuality === quality
                        ? 'bg-purple-600 text-white'
                        : 'bg-[#2a2a2a] hover:bg-purple-600 text-gray-300 hover:text-white'
                    }`}
                  >
                    {quality}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating || !prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-[1.02] disabled:hover:scale-100 flex items-center justify-center gap-2 mb-6"
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Wand2 size={20} />
              <span>Generate {activeTab === 'image' ? 'Image' : 'Video'}</span>
            </>
          )}
        </button>

        {/* Cost Info */}
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-yellow-500 mb-2">
            <Coins size={20} />
            <span className="font-semibold">Cost: 100 Coins per generation</span>
          </div>
          <p className="text-gray-400 text-sm">
            Each {activeTab === 'image' ? 'image' : 'video'} generation costs 100 coins. You can earn coins through daily tasks or purchase them.
          </p>
        </div>

        {/* Generated Content Gallery */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Generated Content</h3>
          {generatedContent.length === 0 ? (
            <div className="bg-[#1a1a1a] rounded-xl p-12 text-center">
              <div className="text-gray-600 mb-4">
                {activeTab === 'image' ? <Image size={48} className="mx-auto" /> : <Wand2 size={48} className="mx-auto" />}
              </div>
              <p className="text-gray-400">No content generated yet</p>
              <p className="text-gray-500 text-sm mt-2">Start by entering a prompt above</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {generatedContent.map((item) => (
                <div key={item.id} className="bg-[#1a1a1a] rounded-xl overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all cursor-pointer group">
                  <div className="relative aspect-square bg-gradient-to-br from-purple-500 to-pink-500">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.prompt}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                    {item.style && (
                      <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {item.style}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-gray-300 truncate">{item.prompt}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(item.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Prompts */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Popular Prompts</h3>
          <div className="space-y-3">
            {[
              'A magical forest with glowing mushrooms and fireflies',
              'Futuristic cyberpunk city with neon signs',
              'Anime character with silver hair and blue eyes',
              'Epic dragon flying over medieval castle'
            ].map((popularPrompt, index) => (
              <button
                key={index}
                onClick={() => setPrompt(popularPrompt)}
                className="w-full bg-[#1a1a1a] hover:bg-[#2a2a2a] text-left p-4 rounded-xl transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <p className="text-gray-300 group-hover:text-white transition-colors">{popularPrompt}</p>
                  <ChevronRight size={20} className="text-gray-600 group-hover:text-purple-500 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Membership Screen
function MembershipScreen() {
  const navigate = useNavigate()
  const [selectedTier, setSelectedTier] = useState('gold')
  const [subbed, setSubbed] = useState(isSubscribed())
  const activate = () => {
    if (!isLoggedIn()) {
      alert('Please log in to subscribe.')
      navigate('/login?next=/membership')
      return
    }
    setSubscribed(true); setSubbed(true); alert('Subscription activated!')
  }
  const cancel = () => { setSubscribed(false); setSubbed(false); alert('Subscription cancelled.') }
  
  const tiers = [
    {
      id: 'silver',
      name: 'Silver',
      price: 9.99,
      color: 'from-gray-400 to-gray-600',
      borderColor: 'border-gray-400',
      bgColor: 'from-gray-900/50 to-gray-800/50',
      icon: '🥈',
      features: [
        'Unlimited character chats',
        '500 AI generations per month',
        'Priority response time',
        'Access to premium characters',
        'Ad-free experience',
        'Basic customization options'
      ]
    },
    {
      id: 'gold',
      name: 'Gold',
      price: 19.99,
      color: 'from-yellow-400 to-yellow-600',
      borderColor: 'border-yellow-400',
      bgColor: 'from-yellow-900/50 to-orange-900/50',
      icon: '🥇',
      popular: true,
      features: [
        'Everything in Silver',
        '120 AI generations per month',
        'Faster response time',
        'Early access to new features',
        'Advanced customization',
        'Create custom characters',
        'Priority support'
      ]
    },
    {
      id: 'platinum',
      name: 'Platinum',
      price: 29.99,
      color: 'from-purple-400 to-blue-400',
      borderColor: 'border-purple-400',
      bgColor: 'from-purple-900/50 to-blue-900/50',
      icon: '',
      features: [
        'Everything in Gold',
        'Unlimited AI generations',
        'Instant response time',
        'Exclusive premium models',
        'Full customization suite',
        'Multi-character scenarios',
        'Dedicated support',
        'Beta features access'
      ]
    }
  ]
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900/20 to-black text-white pb-20 lg:pb-4">
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-gray-800 p-4 flex items-center justify-between z-10">
        <button onClick={() => navigate(-1)}>
          <ChevronRight size={24} className="rotate-180 text-white" />
        </button>
        <h1 className="text-xl font-bold">Membership Plans</h1>
        <button>
          <Settings size={24} className="text-gray-400" />
        </button>
      </div>

      <div className="p-4 max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Unlock Premium Features</h2>
          <p className="text-gray-400 text-lg">Choose the perfect plan for your AI experience</p>
        </div>

        {/* Benefits Banner */}
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 mb-8 border border-purple-500/30">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Crown size={24} className="text-yellow-500" />
            Why Go Premium?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚡</div>
              <div>
                <h4 className="font-semibold mb-1">Faster Responses</h4>
                <p className="text-gray-400 text-sm">Get instant AI replies without waiting</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🎨</div>
              <div>
                <h4 className="font-semibold mb-1">More Generations</h4>
                <p className="text-gray-400 text-sm">Create unlimited images and videos</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">✨</div>
              <div>
                <h4 className="font-semibold mb-1">Exclusive Content</h4>
                <p className="text-gray-400 text-sm">Access premium characters and features</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-2xl p-6 border-2 transition-all cursor-pointer ${
                selectedTier === tier.id
                  ? `${tier.borderColor} scale-105`
                  : 'border-gray-800 hover:border-gray-700'
              } bg-gradient-to-br ${tier.bgColor}`}
              onClick={() => setSelectedTier(tier.id)}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">{tier.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">${tier.price}</span>
                  <span className="text-gray-400">/month</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {tier.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="text-green-500 mt-1">✓</div>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  selectedTier === tier.id
                    ? `bg-gradient-to-r ${tier.color} text-white`
                    : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a]'
                }`}
              >
                {selectedTier === tier.id ? 'Selected' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>

        {/* Subscribe Button */}
        <div className="max-w-md mx-auto mb-8 space-y-3">
          {subbed ? (
            <>
              <div className="bg-green-900/30 border border-green-700/40 text-green-300 text-sm p-3 rounded-lg text-center">
                You are currently subscribed. Premium modes are unlocked.
              </div>
              <button onClick={cancel} className="w-full bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white font-bold py-3 rounded-xl transition-all">
                Cancel Subscription
              </button>
            </>
          ) : (
            <button onClick={activate} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
              <Crown size={24} />
              <span>Subscribe to {tiers.find(t => t.id === selectedTier)?.name} - ${tiers.find(t => t.id === selectedTier)?.price}/mo</span>
            </button>
          )}
        </div>

        {/* Comparison Table */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">Feature Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">Feature</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-semibold">Silver</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-semibold">Gold</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-semibold">Platinum</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4 text-gray-300">AI Generations</td>
                  <td className="text-center py-3 px-4">50/mo</td>
                  <td className="text-center py-3 px-4">120/mo</td>
                  <td className="text-center py-3 px-4 text-green-500 font-semibold">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4 text-gray-300">Response Time</td>
                  <td className="text-center py-3 px-4">Priority</td>
                  <td className="text-center py-3 px-4">Faster</td>
                  <td className="text-center py-3 px-4 text-green-500 font-semibold">Instant</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4 text-gray-300">Premium Characters</td>
                  <td className="text-center py-3 px-4 text-green-500">✓</td>
                  <td className="text-center py-3 px-4 text-green-500">✓</td>
                  <td className="text-center py-3 px-4 text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4 text-gray-300">Custom Characters</td>
                  <td className="text-center py-3 px-4 text-red-500">✗</td>
                  <td className="text-center py-3 px-4 text-green-500">✓</td>
                  <td className="text-center py-3 px-4 text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4 text-gray-300">Multi-Character Scenarios</td>
                  <td className="text-center py-3 px-4 text-red-500">✗</td>
                  <td className="text-center py-3 px-4 text-red-500">✗</td>
                  <td className="text-center py-3 px-4 text-green-500">✓</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-300">Beta Features</td>
                  <td className="text-center py-3 px-4 text-red-500">✗</td>
                  <td className="text-center py-3 px-4 text-red-500">✗</td>
                  <td className="text-center py-3 px-4 text-green-500">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-[#1a1a1a] rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-purple-400">Can I cancel anytime?</h4>
              <p className="text-gray-400 text-sm">Yes, you can cancel your subscription at any time. Your benefits will continue until the end of your billing period.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-purple-400">Can I upgrade or downgrade?</h4>
              <p className="text-gray-400 text-sm">Absolutely! You can change your plan at any time. Upgrades take effect immediately, while downgrades apply at the next billing cycle.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-purple-400">What payment methods do you accept?</h4>
              <p className="text-gray-400 text-sm">We accept all major credit cards, PayPal, and various digital payment methods.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p className="mb-2">By subscribing, you agree to our <a href="#" className="text-purple-400">Terms of Service</a> and <a href="#" className="text-purple-400">Privacy Policy</a></p>
          <p>All prices in USD. Billed monthly. Cancel anytime.</p>
        </div>
      </div>
    </div>
  )
}

// Placeholder screens for other routes
function PlaceholderScreen({ title }) {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center pb-20 lg:pb-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-gray-400 mb-6">This screen is under construction</p>
        <Button onClick={() => navigate('/')} className="bg-purple-600 hover:bg-purple-700">
          Go Home
        </Button>
      </div>
    </div>
  )
}

// Login Screen
function LoginScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const next = params.get('next') || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  
  const onSubmit = (e) => {
    e.preventDefault()
    setError('')
    const res = authLogin(email.trim().toLowerCase(), password)
    if (res.ok) {
      navigate(next)
    } else {
      setError(res.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20 lg:pb-4">
      <div className="sticky top-0 bg-black border-b border-gray-800 p-4 flex items-center justify-between z-10">
        <button onClick={() => navigate(-1)}>
          <ChevronRight size={24} className="rotate-180 text-white" />
        </button>
        <h1 className="text-xl font-bold">Log in</h1>
        <div className="w-6" />
      </div>

      <div className="p-4 max-w-md mx-auto">
        <form onSubmit={onSubmit} className="space-y-4 bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-black text-white border border-gray-800 rounded-lg px-3 py-2 outline-none focus:border-purple-600" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-black text-white border border-gray-800 rounded-lg px-3 py-2 outline-none focus:border-purple-600" placeholder="••••••••" />
          </div>
          {error && <div className="text-sm text-red-400">{error}</div>}
          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">Log in</Button>
        </form>

        <div className="text-center text-sm text-gray-400 mt-4">
          Don't have an account?{' '}
          <button onClick={() => navigate(`/signup?next=${encodeURIComponent(next)}`)} className="text-purple-400 hover:text-purple-300">Sign up</button>
        </div>
      </div>
    </div>
  )
}

// Sign Up Screen
function SignUpScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const next = params.get('next') || '/you'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  const onSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    const res = authRegister({ email: email.trim().toLowerCase(), password, name: name.trim() })
    if (!res.ok) {
      setError(res.error || 'Could not create account')
      return
    }
    navigate(next)
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20 lg:pb-4">
      <div className="sticky top-0 bg-black border-b border-gray-800 p-4 flex items-center justify-between z-10">
        <button onClick={() => navigate(-1)}>
          <ChevronRight size={24} className="rotate-180 text-white" />
        </button>
        <h1 className="text-xl font-bold">Sign up</h1>
        <div className="w-6" />
      </div>

      <div className="p-4 max-w-md mx-auto">
        <form onSubmit={onSubmit} className="space-y-4 bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Display name (optional)</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black text-white border border-gray-800 rounded-lg px-3 py-2 outline-none focus:border-purple-600" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-black text-white border border-gray-800 rounded-lg px-3 py-2 outline-none focus:border-purple-600" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-black text-white border border-gray-800 rounded-lg px-3 py-2 outline-none focus:border-purple-600" placeholder="Create a password" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Confirm password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required className="w-full bg-black text-white border border-gray-800 rounded-lg px-3 py-2 outline-none focus:border-purple-600" placeholder="Repeat password" />
          </div>
          {error && <div className="text-sm text-red-400">{error}</div>}
          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">Create account</Button>
        </form>

        <div className="text-center text-sm text-gray-400 mt-4">
          Already have an account?{' '}
          <button onClick={() => navigate(`/login?next=${encodeURIComponent(next)}`)} className="text-purple-400 hover:text-purple-300">Log in</button>
        </div>
      </div>
    </div>
  )
}

// You/Account Screen with Email Verification
function YouScreen() {
  const navigate = useNavigate()
  const userId = useMemo(() => getCurrentUserId(), [])
  const [user, setUser] = useState(getUser(userId))
  const [statusMsg, setStatusMsg] = useState('')

  const handleVerify = () => {
    if (user.emailVerified) return
    const updated = { ...user, emailVerified: true }
    // If referred, try to award referrer once
    if (updated.referredBy && !updated.referralCounted) {
      const res = awardReferral(updated.referredBy, userId)
      if (res.awarded) {
        updated.referralCounted = true
        setStatusMsg(`Thanks! Your referrer has been awarded ${REF_BONUS} coins.`)
      } else if (res.reason === 'cap') {
        updated.referralCounted = true // mark counted to avoid future attempts
        setStatusMsg('Thanks! Your referrer already reached the referral cap.')
      } else if (res.reason === 'duplicate') {
        updated.referralCounted = true
        setStatusMsg('Verification recorded.')
      } else {
        setStatusMsg('Verification recorded.')
      }
    } else {
      setStatusMsg('Email verified successfully.')
    }
    saveUser(updated)
    setUser(updated)
  }

  const resetDemo = () => {
    // Clears only this user's data; keeps ID for continuity
    const id = userId
    const u = { id, coins: 0, emailVerified: false, referredBy: user.referredBy || null, referralCounted: false }
    saveUser(u)
    setUser(u)
    setStatusMsg('Demo data reset for this user.')
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20 lg:pb-4">
      <div className="sticky top-0 bg-black border-b border-gray-800 p-4 flex items-center justify-between z-10">
        <button onClick={() => navigate(-1)}>
          <ChevronRight size={24} className="rotate-180 text-white" />
        </button>
        <h1 className="text-xl font-bold">Your Account</h1>
        <button onClick={() => navigate('/coins')}>
          <Coins size={24} className="text-yellow-500" />
        </button>
      </div>

      <div className="p-4 max-w-xl mx-auto space-y-4">
        <div className="bg-[#1a1a1a] rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-2">Email Verification</h2>
          <p className="text-sm text-gray-400 mb-3">
            Status: {user.emailVerified ? <span className="text-green-400 font-medium">Verified</span> : <span className="text-yellow-400 font-medium">Not verified</span>}
          </p>
          <Button onClick={handleVerify} className={`w-full ${user.emailVerified ? 'bg-gray-700 hover:bg-gray-700' : 'bg-purple-600 hover:bg-purple-700'}`} disabled={user.emailVerified}>
            {user.emailVerified ? 'Email Verified' : 'Verify Email'}
          </Button>
          {statusMsg && <p className="text-xs text-gray-400 mt-2">{statusMsg}</p>}
        </div>

        <div className="bg-[#1a1a1a] rounded-xl p-4">
          <h3 className="text-sm text-gray-400 mb-1">Your User ID</h3>
          <p className="text-gray-200 break-all text-sm">{userId}</p>
          <h3 className="text-sm text-gray-400 mt-3 mb-1">Referred By</h3>
          <p className="text-gray-200 text-sm">{user.referredBy ? user.referredBy : '—'}</p>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-2">Referral Rules</h3>
          <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
            <li>Share your link from the Coins page.</li>
            <li>Earn 250 coins when a friend joins via your link and verifies their email.</li>
            <li>Maximum 3 rewarded referrals.</li>
          </ul>
        </div>

        <div className="text-center">
          <button onClick={resetDemo} className="text-xs text-gray-500 underline">Reset demo data</button>
        </div>
      </div>
    </div>
  )
}

// Main App Component with Router
function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const userId = useMemo(() => getCurrentUserId(), [])

  // Capture referral code from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const ref = params.get('ref')
    if (ref && ref !== userId) {
      const u = getUser(userId)
      if (!u.referredBy) {
        u.referredBy = ref
        saveUser(u)
      }
    }
  }, [location.search, userId])

  return (
    <div className="flex min-h-screen bg-black">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1">
        {/* Menu Button (all screens) */}
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          className="fixed top-4 left-4 z-30 bg-[#1a1a1a] p-2 rounded-lg"
        >
          <Menu size={24} className="text-white" />
        </button>

        {/* Quick Auth Buttons */}
        {!isLoggedIn() && (
          <div className="fixed top-4 right-4 z-30 flex gap-2">
            <button onClick={() => navigate('/login')} className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white text-xs px-3 py-1 rounded-lg">Log in</button>
            <button onClick={() => navigate('/signup')} className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 rounded-lg">Sign up</button>
          </div>
        )}

        {/* Routes */}
        <Routes>
          <Route path="/" element={<ChatListScreen />} />
          <Route path="/messages" element={<ChatListScreen />} />
          <Route path="/explore" element={<ExploreScreen />} />
          <Route path="/character/:id" element={<CharacterProfilePage />} />
          <Route path="/chat/:id" element={<ChatScreen />} />
          <Route path="/create" element={<CreateModalScreen />} />
          <Route path="/create-character" element={<CharacterFormScreen />} />
          <Route path="/templates" element={<TemplatesScreen />} />
          <Route path="/generate" element={<GenerateScreen />} />
          <Route path="/coins" element={<CoinsScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/following" element={<PlaceholderScreen title="Following" />} />
          <Route path="/you" element={<YouScreen />} />
          <Route path="/for-you" element={<ForYouScreen />} />
          <Route path="/characters" element={<PlaceholderScreen title="Characters" />} />
          <Route path="/my-creations" element={<MyCreationsScreen />} />
          <Route path="/gallery" element={<PlaceholderScreen title="Gallery" />} />
          <Route path="/favorites" element={<PlaceholderScreen title="Favorites" />} />
          <Route path="/membership" element={<MembershipScreen />} />
          <Route path="/api-settings" element={<ApiSettingsScreen />} />
          <Route path="/developer" element={<DeveloperTabScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignUpScreen />} />
          <Route path="/install" element={<PlaceholderScreen title="Install App" />} />
        </Routes>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App



// ===== Character Profile (wired to backend) =====
function CharacterProfilePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [character, setCharacter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        // First check custom characters in localStorage
        const customChars = JSON.parse(localStorage.getItem('custom_characters') || '[]')
        const customChar = customChars.find(c => c.id === id)

        if (customChar) {
          if (!cancelled) setCharacter(customChar)
          if (!cancelled) setLoading(false)
          return
        }

        // Then check generated characters in localStorage
        const generatedChars = JSON.parse(localStorage.getItem('generated_characters') || '[]')
        const generatedChar = generatedChars.find(c => c.id === id)

        if (generatedChar) {
          if (!cancelled) setCharacter(generatedChar)
          if (!cancelled) setLoading(false)
          return
        }

        // Otherwise try to fetch from API
        const data = await apiGet(`/api/characters/${id}`)
        if (!cancelled) setCharacter(data)
      } catch (e) {
        if (!cancelled) setError('Character not found')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pb-20 lg:pb-4">
        <div className="sticky top-0 bg-black/80 backdrop-blur-sm z-10 p-4 flex items-center justify-between">
          <div className="h-6 w-6 bg-[#1a1a1a] rounded" />
          <div className="h-4 w-40 bg-[#1a1a1a] rounded" />
          <div className="h-6 w-6 bg-[#1a1a1a] rounded" />
        </div>
        <div className="h-64 bg-[#1a1a1a] animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="h-6 w-1/2 bg-[#1a1a1a] rounded" />
          <div className="h-4 w-2/3 bg-[#1a1a1a] rounded" />
          <div className="h-4 w-1/3 bg-[#1a1a1a] rounded" />
        </div>
      </div>
    )
  }

  if (error || !character) {
    return (
      <div className="min-h-screen bg-black text-white pb-20 lg:pb-4">
        <div className="p-4">
          <button onClick={() => navigate(-1)} className="text-gray-400 mb-4 flex items-center gap-1">
            <ChevronRight size={20} className="rotate-180" /> Back
          </button>
          <div className="text-center text-red-400">{error || 'Character not found.'}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20 lg:pb-4">
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm z-10 p-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)}>
          <ChevronRight size={24} className="rotate-180 text-white" />
        </button>
        <h1 className="text-yellow-500 font-semibold truncate max-w-[60%]">{character.name}</h1>
        <div className="flex items-center gap-2">
          <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">AI</span>
          <Settings size={20} className="text-gray-400" />
        </div>
      </div>

      {/* Character Image */}
      <div className="relative h-64 bg-gradient-to-br from-blue-400 to-blue-200">
        {(character.avatarUrl || character.image) && (
          <img src={character.avatarUrl || character.image} alt={character.name} className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>

      {/* Character Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-yellow-500 text-2xl font-bold truncate">{character.name}</h2>
          <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">AI</span>
          <button className="ml-auto text-gray-400">
            <Settings size={20} />
          </button>
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
          <span className="truncate">CID: {String(character.id).slice(0, 5)}</span>
          <span>@Creator</span>
          <ChevronRight size={16} />
        </div>

        <p className="text-gray-300 mb-3">
          {character.description || 'No description provided.'}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {(character.tags || []).map((tag) => (
            <span key={tag} className="bg-[#1a1a1a] text-gray-400 px-3 py-1 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-6 mb-6 text-sm">
          <span className="text-gray-400">
            <span className="text-white font-semibold">{(character.collectors || 167)}</span> Collectors
          </span>
          <span className="text-gray-400">
            <span className="text-white font-semibold">{(character.messages || '231K')}</span> Messages
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Button 
            onClick={() => navigate(`/chat/${character.id}`)}
            className="flex-1 bg-white text-black hover:bg-gray-200 rounded-full py-6 text-lg font-semibold"
          >
            Chat
          </Button>
          <button className="w-14 h-14 rounded-full bg-[#1a1a1a] flex items-center justify-center">
            <Star size={24} className="text-gray-400" />
          </button>
          <button className="w-14 h-14 rounded-full bg-[#1a1a1a] flex items-center justify-center">
            <Share2 size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Tabs (static demo) */}
        <div className="border-b border-gray-800 mb-4">
          <div className="flex gap-6">
            <button className="text-white border-b-2 border-purple-500 pb-2">Comments</button>
            <button className="text-gray-400 pb-2">Moments</button>
          </div>
        </div>

        {/* Comments (demo static) */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-semibold">JDD</span>
                <span className="text-gray-500 text-sm">09-22</span>
              </div>
              <p className="text-xl mb-2">😂</p>
              <div className="flex gap-4 text-gray-400 text-sm">
                <button>Reply</button>
                <button>Translate</button>
              </div>
            </div>
            <div className="text-right">
              <Heart size={20} className="text-gray-600 mb-1" />
              <span className="text-gray-600 text-sm">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ===== Social-style Profile Page =====
function ProfileScreen() {
  const navigate = useNavigate()
  const userId = useMemo(() => getCurrentUserId(), [])
  const profileKey = `profile:${userId}`
  const [profile, setProfile] = useState(lsGet(profileKey, {
    name: 'You',
    handle: `user_${String(userId).slice(0, 6)}`,
    avatarUrl: '',
    bio: 'Hey there! I\'m using TapThat.ai',
    followers: 0,
    following: 0,
    posts: [], // { id, content, createdAt, likes, likedByMe }
  }))
  const [postText, setPostText] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    lsSet(profileKey, profile)
  }, [profileKey, profile])

  const timeSince = (iso) => {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    return `${days}d`
  }

  const addPost = () => {
    const text = postText.trim()
    if (!text) return
    const newPost = { id: genId(), content: text, createdAt: new Date().toISOString(), likes: 0, likedByMe: false }
    setProfile(p => ({ ...p, posts: [newPost, ...p.posts] }))
    setPostText('')
  }

  const toggleLike = (postId) => {
    setProfile(p => ({
      ...p,
      posts: p.posts.map(post => post.id === postId ? { ...post, likedByMe: !post.likedByMe, likes: post.likedByMe ? Math.max(0, (post.likes||0)-1) : (post.likes||0)+1 } : post)
    }))
  }

  const deletePost = (postId) => {
    setProfile(p => ({ ...p, posts: p.posts.filter(post => post.id !== postId) }))
  }

  const copyLink = async () => {
    const url = `${location.origin}/profile?u=${userId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const shareLink = async () => {
    const url = `${location.origin}/profile?u=${userId}`
    if (navigator.share) {
      try { await navigator.share({ title: 'My Profile', url }) } catch {}
    } else {
      copyLink()
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20 lg:pb-4">
      {/* Header */}
      <div className="sticky top-0 bg-black z-10 border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => navigate(-1)} className="text-gray-400">
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <h1 className="text-white font-semibold">Profile</h1>
          <div className="flex items-center gap-2">
            <button onClick={copyLink} className="text-gray-400 hover:text-white">
              {copied ? <Check size={20} /> : <LinkIcon size={20} />}
            </button>
            <button onClick={shareLink} className="text-gray-400 hover:text-white">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Cover + Avatar */}
      <div className="h-32 bg-gradient-to-r from-purple-700/40 to-pink-700/30" />
      <div className="px-4 -mt-10 flex items-end gap-3">
        <div className="w-20 h-20 rounded-full bg-[#1a1a1a] border-2 border-black overflow-hidden">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">🧑</div>
          )}
        </div>
        <div className="flex-1">
          <div className="text-xl font-bold">{profile.name}</div>
          <div className="text-gray-400 text-sm">@{profile.handle}</div>
        </div>
        <button onClick={() => navigate('/you')} className="px-3 py-1 rounded-lg bg-[#1a1a1a] text-sm text-gray-300">Edit</button>
      </div>

      {/* Bio/Status */}
      <div className="p-4">
        <textarea
          value={profile.bio}
          onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))}
          rows={2}
          className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg p-3 text-sm text-gray-200"
        />
        <div className="flex gap-6 text-sm text-gray-400 mt-3">
          <span><span className="text-white font-semibold">{profile.posts.length}</span> Posts</span>
          <span><span className="text-white font-semibold">{profile.followers}</span> Followers</span>
          <span><span className="text-white font-semibold">{profile.following}</span> Following</span>
        </div>
      </div>

      {/* Composer */}
      <div className="p-4 border-t border-b border-gray-800 bg-[#060606]">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center">🧑</div>
          <div className="flex-1">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              rows={3}
              placeholder="What's on your mind?"
              className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg p-3 text-sm text-gray-200"
            />
            <div className="flex justify-end mt-2">
              <Button onClick={addPost} className="bg-purple-600 hover:bg-purple-700">Post</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="divide-y divide-gray-900">
        {profile.posts.length === 0 && (
          <div className="text-center text-gray-500 p-8">No posts yet. Say hello!</div>
        )}
        {profile.posts.map((post) => (
          <div key={post.id} className="p-4 flex gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center">🧑</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm mb-1">
                <span className="text-white font-semibold truncate">{profile.name}</span>
                <span className="text-gray-500">@{profile.handle}</span>
                <span className="text-gray-500">· {timeSince(post.createdAt)}</span>
              </div>
              <div className="text-gray-200 whitespace-pre-wrap text-sm">{post.content}</div>
              <div className="flex gap-6 text-sm text-gray-400 mt-3">
                <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1 ${post.likedByMe ? 'text-pink-400' : ''}`}>
                  <Heart size={16} className={`${post.likedByMe ? 'fill-current' : ''}`} /> {post.likes || 0}
                </button>
                <button onClick={() => deletePost(post.id)} className="hover:text-white">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
