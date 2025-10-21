import { useState, useEffect } from 'react'

interface SensorData {
  temperature: number
  humidity: number
  soilMoisture: number
}

function App() {
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 28.5,
    humidity: 65,
    soilMoisture: 1420
  })
  const [pumpStatus, setPumpStatus] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      const temp = parseFloat((25 + Math.random() * 10).toFixed(1))
      const hum = parseInt((55 + Math.random() * 20).toFixed(0))
      const soil = Math.floor(1000 + Math.random() * 1500)

      setSensorData({ temperature: temp, humidity: hum, soilMoisture: soil })
      setPumpStatus(soil < 1500)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getTemperatureStatus = () => {
    if (sensorData.temperature < 20 || sensorData.temperature > 35) return 'danger'
    if (sensorData.temperature < 25 || sensorData.temperature > 30) return 'warning'
    return 'normal'
  }

  const getSoilStatus = () => {
    return sensorData.soilMoisture < 1500 ? 'warning' : 'normal'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2a6c] via-[#2a4d69] to-[#4b86b4] text-white p-5">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <header className="text-center py-5 mb-7">
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
              <span className="inline-block px-4 py-2 rounded-full text-sm bg-green-500/20 text-green-400">
                Normal
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
              {sensorData.soilMoisture}
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
                style={{ width: `${(sensorData.soilMoisture / 4095) * 100}%` }}
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
              onClick={() => setPumpStatus(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              ▶️ Nyalakan Pompa
            </button>
            <button
              onClick={() => setPumpStatus(false)}
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
            <div>T:{sensorData.temperature}C H:{sensorData.humidity}%</div>
            <div>Soil: {sensorData.soilMoisture} {pumpStatus ? 'ON' : 'OFF'}</div>
          </div>
        </div>

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
