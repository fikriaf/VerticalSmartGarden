import { useState, useEffect } from 'react'

interface SensorData {
  temperature: number
  humidity: number
  soilMoisture: number
}

interface Settings {
  espUrl: string
  tempMin: number
  tempMax: number
  tempWarningMin: number
  tempWarningMax: number
  humidityMin: number
  humidityMax: number
  soilMoistureThreshold: number
  refreshInterval: number
}

function App() {
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 28.5,
    humidity: 65,
    soilMoisture: 1420
  })
  const [pumpStatus, setPumpStatus] = useState(true)
  const [espUrl, setEspUrl] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [useSimulation, setUseSimulation] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<Settings>({
    espUrl: '',
    tempMin: 20,
    tempMax: 35,
    tempWarningMin: 25,
    tempWarningMax: 30,
    humidityMin: 40,
    humidityMax: 80,
    soilMoistureThreshold: 410, // 40% of 1023 (ESP8266 ADC)
    refreshInterval: 2000 // 2 seconds for faster response
  })

  useEffect(() => {
    const fetchData = async () => {
      if (useSimulation) {
        // Simulation mode
        const temp = parseFloat((25 + Math.random() * 10).toFixed(1))
        const hum = parseInt((55 + Math.random() * 20).toFixed(0))
        const soil = Math.floor(200 + Math.random() * 600) // ESP8266: 0-1023
        setSensorData({ temperature: temp, humidity: hum, soilMoisture: soil })
        // Auto pump control based on threshold
        const soilPercent = (soil / 1023) * 100
        const thresholdPercent = (settings.soilMoistureThreshold / 1023) * 100
        setPumpStatus(soilPercent < thresholdPercent)
      } else if (espUrl) {
        // Real ESP32 mode
        try {
          const response = await fetch(`${espUrl}/api/sensors`)
          const data = await response.json()
          setSensorData({
            temperature: data.temperature,
            humidity: data.humidity,
            soilMoisture: data.soilMoisture
          })
          setPumpStatus(data.pumpStatus)
          setIsConnected(true)
        } catch (error) {
          console.error('Failed to fetch data from ESP32:', error)
          setIsConnected(false)
        }
      }
    }

    const interval = setInterval(fetchData, settings.refreshInterval)
    fetchData() // Initial fetch
    return () => clearInterval(interval)
  }, [espUrl, useSimulation, settings.refreshInterval])

  const handleConnect = () => {
    if (espUrl.trim()) {
      setUseSimulation(false)
      setIsConnected(false)
    }
  }

  const handleDisconnect = () => {
    setUseSimulation(true)
    setIsConnected(false)
    setEspUrl('')
  }

  const handlePumpControl = async (status: boolean) => {
    // Optimistic update - change UI immediately
    setPumpStatus(status)
    
    if (useSimulation) {
      // Already updated above
    } else if (espUrl) {
      try {
        await fetch(`${espUrl}/api/pump`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        })
        // Success - UI already updated
      } catch (error) {
        console.error('Failed to control pump:', error)
        // Revert on error
        setPumpStatus(!status)
      }
    }
  }

  const getTemperatureStatus = () => {
    if (sensorData.temperature < settings.tempMin || sensorData.temperature > settings.tempMax) return 'danger'
    if (sensorData.temperature < settings.tempWarningMin || sensorData.temperature > settings.tempWarningMax) return 'warning'
    return 'normal'
  }

  const getHumidityStatus = () => {
    if (sensorData.humidity < settings.humidityMin || sensorData.humidity > settings.humidityMax) return 'warning'
    return 'normal'
  }

  const getSoilStatus = () => {
    const soilPercent = (sensorData.soilMoisture / 1023) * 100
    const thresholdPercent = (settings.soilMoistureThreshold / 1023) * 100
    return soilPercent < thresholdPercent ? 'warning' : 'normal'
  }

  const handleSaveSettings = () => {
    setEspUrl(settings.espUrl)
    setShowSettings(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2a6c] via-[#2a4d69] to-[#4b86b4] text-white p-5">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <header className="text-center py-5 mb-7 relative">
          <button
            onClick={() => setShowSettings(true)}
            className="absolute right-0 top-5 bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/20 transition-all duration-300 hover:scale-110"
            title="Pengaturan"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <h1 className="text-[2.5rem] font-bold mb-2.5" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            🌱 Vertical Smart Garden Monitoring System
          </h1>
          <p className="text-[1.1rem] opacity-90">
            Sistem monitoring dan kontrol otomatis untuk pertanian vertikal
          </p>
        </header>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Temperature Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center mb-5">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-2xl mr-4">
                🌡️
              </div>
              <h2 className="text-xl font-semibold">Suhu</h2>
            </div>
            <div className="text-5xl font-bold text-center my-4">
              {sensorData.temperature}<span className="text-2xl opacity-80">°C</span>
            </div>
            <div className="text-center">
              <span className={`inline-block px-4 py-2 rounded-full text-sm ${getTemperatureStatus() === 'normal' ? 'bg-green-500/20 text-green-400' :
                getTemperatureStatus() === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                {getTemperatureStatus() === 'normal' ? 'Normal' : 'Perhatian'}
              </span>
            </div>
            <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-red-500 transition-all duration-500"
                style={{ width: `${((sensorData.temperature - 20) / 20) * 100}%` }}
              />
            </div>
          </div>

          {/* Humidity Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center mb-5">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-2xl mr-4">
                💧
              </div>
              <h2 className="text-xl font-semibold">Kelembapan Udara</h2>
            </div>
            <div className="text-5xl font-bold text-center my-4">
              {sensorData.humidity}<span className="text-2xl opacity-80">%</span>
            </div>
            <div className="text-center">
              <span className={`inline-block px-4 py-2 rounded-full text-sm ${getHumidityStatus() === 'normal' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                {getHumidityStatus() === 'normal' ? 'Normal' : 'Perhatian'}
              </span>
            </div>
            <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${sensorData.humidity}%` }}
              />
            </div>
          </div>

          {/* Soil Moisture Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center mb-5">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-2xl mr-4">
                ⛰️
              </div>
              <h2 className="text-xl font-semibold">Kelembapan Tanah</h2>
            </div>
            <div className="text-5xl font-bold text-center my-4">
              {((sensorData.soilMoisture / 1023) * 100).toFixed(1)}<span className="text-2xl opacity-80">%</span>
            </div>
            <div className="text-center">
              <span className={`inline-block px-4 py-2 rounded-full text-sm ${getSoilStatus() === 'normal' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                {getSoilStatus() === 'normal' ? 'Normal' : 'Perlu Siram'}
              </span>
            </div>
            <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                style={{ width: `${(sensorData.soilMoisture / 1023) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pump Control */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl mb-8">
          <h2 className="text-2xl font-bold text-center mb-5">
            🚿 Kontrol Pompa Air
          </h2>
          <div className={`text-2xl font-semibold text-center py-4 px-6 rounded-xl mb-5 ${pumpStatus ? 'bg-green-500/30 text-green-400' : 'bg-gray-500/30 text-gray-400'
            }`}>
            {pumpStatus ? '✅ POMPA MENYALA' : '❌ POMPA MATI'}
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-5">
            <button
              onClick={() => handlePumpControl(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              ▶️ Nyalakan Pompa
            </button>
            <button
              onClick={() => handlePumpControl(false)}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              ⏹️ Matikan Pompa
            </button>
          </div>
        </div>

        {/* LCD Display */}
        <div className="bg-[#2c3e50] rounded-xl p-5 mb-8">
          <h3 className="text-center text-xl font-semibold mb-4">
            🖥️ Tampilan LCD Sistem
          </h3>
          <div className="bg-black text-green-400 font-mono p-4 rounded text-center text-lg leading-relaxed min-h-[80px] flex flex-col justify-center">
            <div>T:{sensorData.temperature.toFixed(1)}C H:{sensorData.humidity.toFixed(0)}%</div>
            <div>Soil:{((sensorData.soilMoisture / 1023) * 100).toFixed(0)}% {pumpStatus ? 'ON' : 'OFF'}</div>
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-[#1a2a6c] to-[#2a4d69] rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Pengaturan Sistem</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* ESP32 Connection */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 text-lg">Koneksi ESP32</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : useSimulation ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">
                      {isConnected ? 'Terhubung' : useSimulation ? 'Mode Simulasi' : 'Terputus'}
                    </span>
                  </div>
                  <label className="block text-sm font-semibold mb-2">URL ESP32</label>
                  <div className="flex gap-3 mb-3">
                    <input
                      type="text"
                      value={settings.espUrl}
                      onChange={(e) => setSettings({ ...settings, espUrl: e.target.value })}
                      placeholder="http://192.168.1.100"
                      disabled={!useSimulation}
                      className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    {useSimulation ? (
                      <button
                        onClick={handleConnect}
                        disabled={!settings.espUrl.trim()}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Hubungkan
                      </button>
                    ) : (
                      <button
                        onClick={handleDisconnect}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                      >
                        Putuskan
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-white/60">
                    Masukkan URL ESP32 atau gunakan mode simulasi
                  </p>
                </div>

                {/* Temperature Settings */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 text-lg">Batas Suhu (°C)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-2">Minimum Bahaya</label>
                      <input
                        type="number"
                        value={settings.tempMin}
                        onChange={(e) => setSettings({ ...settings, tempMin: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Maximum Bahaya</label>
                      <input
                        type="number"
                        value={settings.tempMax}
                        onChange={(e) => setSettings({ ...settings, tempMax: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Minimum Peringatan</label>
                      <input
                        type="number"
                        value={settings.tempWarningMin}
                        onChange={(e) => setSettings({ ...settings, tempWarningMin: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Maximum Peringatan</label>
                      <input
                        type="number"
                        value={settings.tempWarningMax}
                        onChange={(e) => setSettings({ ...settings, tempWarningMax: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Humidity Settings */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 text-lg">Batas Kelembapan Udara (%)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-2">Minimum</label>
                      <input
                        type="number"
                        value={settings.humidityMin}
                        onChange={(e) => setSettings({ ...settings, humidityMin: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Maximum</label>
                      <input
                        type="number"
                        value={settings.humidityMax}
                        onChange={(e) => setSettings({ ...settings, humidityMax: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Soil Moisture Settings */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 text-lg">Kelembapan Tanah (%)</h3>
                  <div>
                    <label className="block text-sm mb-2">Batas Minimum (Pompa Aktif)</label>
                    <input
                      type="number"
                      value={((settings.soilMoistureThreshold / 1023) * 100).toFixed(1)}
                      onChange={(e) => setSettings({ ...settings, soilMoistureThreshold: Math.round((Number(e.target.value) / 100) * 1023) })}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-white/60 mt-1">Nilai dalam persen (0-100%) - ESP8266 ADC: 0-1023</p>
                  </div>
                </div>

                {/* Refresh Interval */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 text-lg">Interval Refresh</h3>
                  <div>
                    <label className="block text-sm mb-2">Waktu (milidetik)</label>
                    <input
                      type="number"
                      value={settings.refreshInterval}
                      onChange={(e) => setSettings({ ...settings, refreshInterval: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-white/60 mt-1">Default: 2000ms (2 detik) - Minimum: 1000ms</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveSettings}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Simpan Pengaturan
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* System Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 text-center">
            <div className="text-3xl mb-3">🔧</div>
            <h3 className="text-sm mb-2">Microcontroller</h3>
            <p className="text-lg font-semibold">ESP32 DevKit</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 text-center">
            <div className="text-3xl mb-3">📡</div>
            <h3 className="text-sm mb-2">Sensor Suhu</h3>
            <p className="text-lg font-semibold">DHT22</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 text-center">
            <div className="text-3xl mb-3">💦</div>
            <h3 className="text-sm mb-2">Sensor Tanah</h3>
            <p className="text-lg font-semibold">Soil Moisture</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 text-center">
            <div className="text-3xl mb-3">📺</div>
            <h3 className="text-sm mb-2">Display</h3>
            <p className="text-lg font-semibold">LCD 16x2 I2C</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
