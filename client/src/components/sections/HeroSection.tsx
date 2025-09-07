'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  Play, Pause, Volume2, VolumeX, MapPin, Users, CheckCircle, 
  TrendingUp, Smartphone, Globe, Zap, Shield, Award, ArrowRight,
  Building2, Activity, Clock, Star, Camera, MessageCircle, Maximize2
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface CounterProps {
  end: number
  duration: number
  suffix?: string
  prefix?: string
}

const Counter = ({ end, duration, suffix = '', prefix = '' }: CounterProps) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = timestamp - startTime
      const percentage = Math.min(progress / (duration * 1000), 1)
      
      setCount(Math.floor(end * percentage))
      
      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>
}

// Interactive Video Card Component
const InteractiveVideoCard = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const playPromiseRef = useRef<Promise<void> | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }
  }, [])

  const togglePlay = async () => {
    if (!videoRef.current || isLoading) return
    
    setIsLoading(true)
    
    try {
      if (isPlaying) {
        // If there's a pending play promise, wait for it to resolve first
        if (playPromiseRef.current) {
          await playPromiseRef.current.catch(() => {})
        }
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        // Store the play promise to handle interruptions
        playPromiseRef.current = videoRef.current.play()
        await playPromiseRef.current
        setIsPlaying(true)
      }
    } catch (error) {
      // Handle the AbortError when play() is interrupted by pause()
      if (error instanceof DOMException && error.name === 'AbortError') {
        // This is expected when play() is interrupted, just update the state
        console.log('Video play interrupted, this is normal')
        setIsPlaying(false)
      } else {
        console.warn('Video playback error:', error)
        setIsPlaying(false)
      }
    } finally {
      setIsLoading(false)
      playPromiseRef.current = null
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const current = videoRef.current.currentTime
    const total = videoRef.current.duration
    setCurrentTime(current)
    setProgress((current / total) * 100)
  }

  const handleLoadedData = () => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const progressWidth = rect.width
    const clickProgress = (clickX / progressWidth) * 100
    const newTime = (clickProgress / 100) * duration
    videoRef.current.currentTime = newTime
    setProgress(clickProgress)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 rounded-3xl p-6 shadow-2xl overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-4 left-4 w-16 h-16 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-4 right-4 w-12 h-12 bg-purple-400 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-pink-400 rounded-full animate-ping opacity-75"></div>
      </div>

      <div className="relative z-10">
        {/* Video Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
            <Play className="h-4 w-4 mr-2" />
            नगरसेतु परिचय • Nagarsetu Introduction
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Watch How It Works
          </h3>
          <p className="text-blue-100">
            देखें कैसे यह काम करता है
          </p>
        </div>

        {/* Video Container */}
        <div className="relative rounded-2xl overflow-hidden bg-black shadow-2xl mb-6">
          <video
            ref={videoRef}
            className="w-full h-auto max-h-80 object-cover"
            onTimeUpdate={handleTimeUpdate}
            onLoadedData={handleLoadedData}
            onPlay={() => {
              setIsPlaying(true)
              setIsLoading(false)
            }}
            onPause={() => {
              setIsPlaying(false)
              setIsLoading(false)
            }}
            onEnded={() => {
              setIsPlaying(false)
              setProgress(0)
              setCurrentTime(0)
            }}
            onError={(e) => {
              console.warn('Video error:', e)
              setIsPlaying(false)
              setIsLoading(false)
            }}
            onWaiting={() => setIsLoading(true)}
            onCanPlay={() => setIsLoading(false)}
            playsInline
            muted={isMuted}
            poster="/api/placeholder/600/300"
          >
            <source src="/nagrsetu.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Video Overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <button
                onClick={togglePlay}
                disabled={isLoading}
                className="bg-white/90 hover:bg-white text-blue-600 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="h-8 w-8 ml-1" />
                )}
              </button>
            </div>
          )}

          {/* Progress Bar */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600 cursor-pointer"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Custom Controls */}
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </button>

            <button
              onClick={toggleMute}
              className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-xl transition-all duration-200"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>

            <div className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-white/80 text-sm">HD</span>
            <button className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-xl transition-all duration-200">
              <Maximize2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Video Features */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <Camera className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <p className="text-white text-sm font-medium">Photo Reporting</p>
            <p className="text-blue-100 text-xs">फोटो रिपोर्टिंग</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <Zap className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <p className="text-white text-sm font-medium">AI Detection</p>
            <p className="text-purple-100 text-xs">AI पहचान</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HeroSection() {
  const [currentFeature, setCurrentFeature] = useState(0)

  const features = [
    {
      icon: Camera,
      title: "फोटो खींचें",
      subtitle: "Click & Report",
      description: "समस्या की फोटो खींचें, GPS ऑटो-लोकेशन",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Zap,
      title: "AI Detection",
      subtitle: "Smart Recognition", 
      description: "AI समस्या पहचानती है, नागरिक वेरीफाई करते हैं",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Activity,
      title: "Real-time Tracking",
      subtitle: "Live Updates",
      description: "हर स्टेप ट्रांसपेरेंट ट्रैकिंग",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Award,
      title: "Gamification",
      subtitle: "Earn Rewards",
      description: "पॉइंट्स और बैजेस अर्न करें",
      color: "from-yellow-500 to-orange-500"
    }
  ]

  const problems = [
    { icon: "🕳️", text: "गड्ढे (Potholes)", color: "bg-orange-100 text-orange-800" },
    { icon: "🗑️", text: "कचरा (Garbage)", color: "bg-green-100 text-green-800" },
    { icon: "💡", text: "स्ट्रीट लाइट्स", color: "bg-yellow-100 text-yellow-800" },
    { icon: "💧", text: "पानी रिसाव", color: "bg-blue-100 text-blue-800" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-200 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-green-200 rounded-full opacity-50 animate-ping"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-yellow-200 rounded-full opacity-60 animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-medium shadow-lg">
              <Zap className="h-4 w-4 mr-2" />
              स्मार्ट सिविक सोल्यूशन • Smart Civic Solution
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  नागरसेतु
                </span>
                <br />
                <span className="text-gray-800">Nagarsetu</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                <span className="font-semibold text-blue-600">Empowering Citizens</span> • 
                <span className="font-semibold text-purple-600 ml-2">Smarter Cities</span>
              </p>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
                <p className="text-lg text-gray-700 leading-relaxed">
                  <span className="font-medium">समस्या रिपोर्ट करना अब उतना ही आसान है जितना एक फोटो खींचना!</span>
                  <br />
                  <span className="text-gray-600">Report civic issues as easy as clicking a photo with GPS auto-tagging, AI detection, and transparent tracking.</span>
                </p>
              </div>
            </div>

            {/* Problem Tags */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Common Issues We Solve
              </h3>
              <div className="flex flex-wrap gap-3">
                {problems.map((problem, index) => (
                  <div
                    key={index}
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${problem.color} transform hover:scale-105 transition-transform cursor-pointer`}
                  >
                    <span className="mr-2">{problem.icon}</span>
                    {problem.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/report"
                className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Camera className="h-5 w-5 mr-2" />
                <span>रिपोर्ट करें • Report Issue</span>
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/my-issues"
                className="group inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                <span>ट्रैक करें • Track Issues</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  <Counter end={1247} duration={2} suffix="+" />
                </div>
                <div className="text-sm text-gray-600">Issues Reported</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  <Counter end={892} duration={2} suffix="+" />
                </div>
                <div className="text-sm text-gray-600">Issues Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  <Counter end={156} duration={2} suffix="+" />
                </div>
                <div className="text-sm text-gray-600">Active Cities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  <Counter end={98} duration={2} suffix="%" />
                </div>
                <div className="text-sm text-gray-600">Satisfaction Rate</div>
              </div>
            </div>
          </div>

          {/* Right Content - Interactive Video Card */}
          <div className="space-y-8">
            {/* Video Card */}
            <InteractiveVideoCard />

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/my-issues"
                className="group bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Activity className="h-8 w-8 mb-3" />
                <h4 className="font-semibold mb-1">Track Issues</h4>
                <p className="text-sm text-green-100">अपने इश्यूज ट्रैक करें</p>
              </Link>

              <Link
                href="/admin"
                className="group bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Shield className="h-8 w-8 mb-3" />
                <h4 className="font-semibold mb-1">Admin Panel</h4>
                <p className="text-sm text-purple-100">एडमिन डैशबोर्ड</p>
              </Link>
            </div>

            {/* How It Works Features */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 text-center mb-4">
                How It Works • कैसे काम करता है
              </h3>

              <div className="space-y-3">
                {features.map((feature, index) => {
                  const Icon = feature.icon
                  const isActive = index === currentFeature
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-center p-3 rounded-2xl transition-all duration-500 cursor-pointer ${
                        isActive 
                          ? 'bg-gradient-to-r ' + feature.color + ' text-white shadow-md transform scale-105' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => setCurrentFeature(index)}
                    >
                      <div className={`p-2 rounded-xl mr-3 ${
                        isActive ? 'bg-white/20' : 'bg-gradient-to-r ' + feature.color
                      }`}>
                        <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-white'}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-900'}`}>
                          {feature.title}
                        </h4>
                        <p className={`text-xs ${isActive ? 'text-white/90' : 'text-gray-600'}`}>
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Progress Dots */}
              <div className="flex justify-center mt-4 space-x-2">
                {features.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-6 rounded-full transition-all duration-300 ${
                      index === currentFeature ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Features Bar */}
        <div className="mt-16 bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">मोबाइल & वेब ऐप</h4>
              <p className="text-gray-600 text-sm">Cross-platform accessibility for all citizens</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">AI & GPS Integration</h4>
              <p className="text-gray-600 text-sm">Smart detection with auto-location tagging</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Analytics & Insights</h4>
              <p className="text-gray-600 text-sm">Data-driven governance for smarter cities</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
