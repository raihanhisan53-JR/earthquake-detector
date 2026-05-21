import { NextResponse } from 'next/server'

// Koordinat default: Jakarta (-6.2, 106.8)
// Open-Meteo free API (no key required)
const LAT = '-6.2'
const LON = '106.8'

export async function GET() {
  try {
    const [weatherRes, aqiRes] = await Promise.allSettled([
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`,
        { next: { revalidate: 300 } }
      ),
      fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${LAT}&longitude=${LON}&current=pm2_5,pm10,carbon_monoxide,nitrogen_dioxide&timezone=auto`,
        { next: { revalidate: 300 } }
      ),
    ])

    const weatherData = weatherRes.status === 'fulfilled' ? await weatherRes.value.json() : null
    const aqiData = aqiRes.status === 'fulfilled' ? await aqiRes.value.json() : null

    const current = weatherData?.current

    const weatherCodeMap: Record<number, string> = {
      0: 'Cerah', 1: 'Cerah Berawan', 2: 'Cerah Berawan', 3: 'Berawan',
      45: 'Berkabut', 48: 'Berkabut', 51: 'Gerimis', 53: 'Gerimis',
      55: 'Gerimis', 61: 'Hujan', 63: 'Hujan', 65: 'Hujan Lebat',
      71: 'Salju Ringan', 73: 'Salju', 75: 'Salju Lebat',
      80: 'Hujan',
      81: 'Hujan', 82: 'Hujan Lebat', 95: 'Badai Petir',
      96: 'Badai Petir', 99: 'Badai Petir',
    }

    const windDirMap: Record<number, string> = {
      0: 'Utara', 45: 'Timur Laut', 90: 'Timur', 135: 'Tenggara',
      180: 'Selatan', 225: 'Barat Daya', 270: 'Barat', 315: 'Barat Laut',
    }

    const weatherCode = current?.weather_code ?? 0
    const windDir = current?.wind_direction_10m ?? 0
    const windDirText = Object.entries(windDirMap)
      .sort(([a], [b]) => Math.abs(Number(a) - windDir) - Math.abs(Number(b) - windDir))
      .shift()?.[1] ?? 'Variabel'

    const getAQI = (pm25: number | null) => {
      if (pm25 === null || pm25 === undefined) return { value: 0, label: 'Tidak Tersedia', color: '#64748b' }
      if (pm25 <= 15.4) return { value: Math.round(pm25 * 50 / 15.4), label: 'BAIK', color: '#22c55e' }
      if (pm25 <= 35.4) return { value: Math.round((pm25 - 15.4) * 49 / 20 + 51), label: 'SEDANG', color: '#facc15' }
      if (pm25 <= 55.4) return { value: Math.round((pm25 - 35.4) * 49 / 20 + 101), label: 'TIDAK SEHAT', color: '#f97316' }
      if (pm25 <= 150.4) return { value: Math.round((pm25 - 55.4) * 49 / 95 + 151), label: 'TIDAK SEHAT', color: '#ef4444' }
      return { value: Math.round((pm25 - 150.4) * 49 / 149 + 201), label: 'BERBAHAYA', color: '#7c3aed' }
    }

    const pm25 = aqiData?.current?.pm2_5 ?? null
    const aqi = getAQI(pm25)

    return NextResponse.json({
      temperature: current?.temperature_2m ?? null,
      apparentTemp: current?.apparent_temperature ?? null,
      humidity: current?.relative_humidity_2m ?? null,
      windSpeed: current?.wind_speed_10m ?? null,
      windDirection: windDirText,
      weatherCode,
      weatherDesc: weatherCodeMap[weatherCode] ?? 'Berawan',
      aqi: {
        value: aqi.value,
        label: aqi.label,
        color: aqi.color,
        pm25: pm25,
        pm10: aqiData?.current?.pm10 ?? null,
        co: aqiData?.current?.carbon_monoxide ?? null,
        no2: aqiData?.current?.nitrogen_dioxide ?? null,
      },
      source: current ? 'Open-Meteo' : 'fallback',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cuaca API error:', error)
    // Fallback realistic data
    const hour = new Date().getHours()
    const baseTemp = hour >= 6 && hour <= 17 ? 30 + Math.random() * 4 : 24 + Math.random() * 3
    return NextResponse.json({
      temperature: Math.round(baseTemp * 10) / 10,
      apparentTemp: Math.round((baseTemp + 2) * 10) / 10,
      humidity: Math.round(60 + Math.random() * 20),
      windSpeed: Math.round(5 + Math.random() * 15),
      windDirection: 'Variabel',
      weatherCode: 1,
      weatherDesc: 'Cerah Berawan',
      aqi: {
        value: Math.round(30 + Math.random() * 50),
        label: 'SEDANG',
        color: '#facc15',
        pm25: Math.round((15 + Math.random() * 20) * 10) / 10,
        pm10: Math.round((25 + Math.random() * 30) * 10) / 10,
        co: Math.round((200 + Math.random() * 300) * 10) / 10,
        no2: Math.round((5 + Math.random() * 15) * 10) / 10,
      },
      source: 'fallback',
      timestamp: new Date().toISOString(),
    })
  }
}
