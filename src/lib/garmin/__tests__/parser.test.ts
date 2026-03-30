import { describe, it, expect, vi } from 'vitest'
import { parseTcxFile, parseGpxFile, type ParsedActivity } from '@/lib/garmin/parser'

// parseFitFile nécessite le module fit-file-parser natif, on le teste via mock
vi.mock('fit-file-parser', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      parseAsync: vi.fn().mockResolvedValue({
        activity: {
          sessions: [
            {
              total_distance: 10.5,
              total_elapsed_time: 3150,
              avg_heart_rate: 155,
              max_heart_rate: 178,
              avg_running_cadence: 88,
              total_ascent: 120,
              total_calories: 650,
              enhanced_avg_respiration_rate: null,
              avg_stance_time: null,
              start_time: new Date('2024-06-15T08:00:00Z'),
              laps: [],
            },
          ],
        },
      }),
    })),
  }
})

describe('parseFitFile', () => {
  it('retourne une ParsedActivity avec les bons champs', async () => {
    // Import après le mock
    const { parseFitFile } = await import('@/lib/garmin/parser')
    const result = await parseFitFile(new ArrayBuffer(0))

    expect(result).toHaveProperty('name')
    expect(result).toHaveProperty('date')
    expect(result).toHaveProperty('distanceKm')
    expect(result).toHaveProperty('durationSeconds')
    expect(result).toHaveProperty('avgPace')
    expect(result).toHaveProperty('avgHeartRate')
    expect(result).toHaveProperty('maxHeartRate')
    expect(result).toHaveProperty('avgCadence')
    expect(result).toHaveProperty('elevationGain')
    expect(result).toHaveProperty('calories')
    expect(result).toHaveProperty('vo2max')
    expect(result).toHaveProperty('groundContactTime')
    expect(result).toHaveProperty('gpsTrack')
    expect(result).toHaveProperty('laps')
  })

  it('extrait correctement la distance et la durée', async () => {
    const { parseFitFile } = await import('@/lib/garmin/parser')
    const result = await parseFitFile(new ArrayBuffer(0))

    expect(result.distanceKm).toBe(10.5)
    expect(result.durationSeconds).toBe(3150)
    expect(result.avgHeartRate).toBe(155)
    expect(result.maxHeartRate).toBe(178)
    expect(result.avgCadence).toBe(176) // 88 * 2
    expect(result.elevationGain).toBe(120)
    expect(result.calories).toBe(650)
  })

  it('retourne null pour les valeurs non disponibles', async () => {
    const { parseFitFile } = await import('@/lib/garmin/parser')
    const result = await parseFitFile(new ArrayBuffer(0))

    expect(result.vo2max).toBeNull()
    expect(result.groundContactTime).toBeNull()
    expect(result.gpsTrack).toBeNull()
    expect(result.laps).toBeNull()
  })
})

describe('parseTcxFile', () => {
  const minimalTcx = `<?xml version="1.0"?>
<TrainingCenterDatabase>
  <Activities>
    <Activity Sport="Running">
      <Id>2024-06-15T08:00:00Z</Id>
      <Lap>
        <TotalTimeSeconds>1800</TotalTimeSeconds>
        <DistanceMeters>5000</DistanceMeters>
        <Calories>350</Calories>
        <AverageHeartRateBpm><Value>150</Value></AverageHeartRateBpm>
        <MaximumHeartRateBpm><Value>175</Value></MaximumHeartRateBpm>
        <Cadence>85</Cadence>
        <Track>
          <Trackpoint>
            <Position>
              <LatitudeDegrees>48.8566</LatitudeDegrees>
              <LongitudeDegrees>2.3522</LongitudeDegrees>
            </Position>
          </Trackpoint>
        </Track>
      </Lap>
    </Activity>
  </Activities>
</TrainingCenterDatabase>`

  it('extrait la distance en km', () => {
    const result = parseTcxFile(minimalTcx)
    expect(result.distanceKm).toBe(5)
  })

  it('extrait la durée en secondes', () => {
    const result = parseTcxFile(minimalTcx)
    expect(result.durationSeconds).toBe(1800)
  })

  it('calcule la pace correctement', () => {
    const result = parseTcxFile(minimalTcx)
    // 1800s / 5km = 360s/km = 6:00
    expect(result.avgPace).toBe('6:00')
  })

  it('extrait le heart rate', () => {
    const result = parseTcxFile(minimalTcx)
    expect(result.avgHeartRate).toBe(150)
  })

  it('extrait les calories', () => {
    const result = parseTcxFile(minimalTcx)
    expect(result.calories).toBe(350)
  })

  it('extrait la cadence', () => {
    const result = parseTcxFile(minimalTcx)
    expect(result.avgCadence).toBe(85)
  })

  it('extrait le GPS track', () => {
    const result = parseTcxFile(minimalTcx)
    expect(result.gpsTrack).toEqual([[48.8566, 2.3522]])
  })

  it('extrait la date depuis le tag Id', () => {
    const result = parseTcxFile(minimalTcx)
    expect(result.date).toEqual(new Date('2024-06-15T08:00:00Z'))
  })

  it('retourne null pour les champs non disponibles en TCX', () => {
    const result = parseTcxFile(minimalTcx)
    expect(result.elevationGain).toBeNull()
    expect(result.vo2max).toBeNull()
    expect(result.groundContactTime).toBeNull()
    expect(result.laps).toBeNull()
  })

  it('gère un TCX vide/minimal sans crash', () => {
    const emptyTcx = '<TrainingCenterDatabase></TrainingCenterDatabase>'
    const result = parseTcxFile(emptyTcx)
    expect(result.distanceKm).toBe(0)
    expect(result.durationSeconds).toBe(0)
    expect(result.avgPace).toBe('--:--')
    expect(result.avgHeartRate).toBeNull()
    expect(result.gpsTrack).toBeNull()
  })
})

describe('parseGpxFile', () => {
  const minimalGpx = `<?xml version="1.0"?>
<gpx>
  <metadata><name>Morning Run</name></metadata>
  <trk>
    <trkseg>
      <trkpt lat="48.8566" lon="2.3522">
        <ele>35</ele>
        <time>2024-06-15T08:00:00Z</time>
      </trkpt>
      <trkpt lat="48.8570" lon="2.3530">
        <ele>40</ele>
        <time>2024-06-15T08:05:00Z</time>
      </trkpt>
      <trkpt lat="48.8575" lon="2.3540">
        <ele>38</ele>
        <time>2024-06-15T08:10:00Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`

  it('extrait le nom depuis les métadonnées', () => {
    const result = parseGpxFile(minimalGpx)
    expect(result.name).toBe('Morning Run')
  })

  it('calcule la distance via haversine (> 0)', () => {
    const result = parseGpxFile(minimalGpx)
    expect(result.distanceKm).toBeGreaterThan(0)
  })

  it('calcule la durée à partir des timestamps', () => {
    const result = parseGpxFile(minimalGpx)
    // 10 minutes = 600 secondes
    expect(result.durationSeconds).toBe(600)
  })

  it('calcule le gain d\'altitude', () => {
    const result = parseGpxFile(minimalGpx)
    // 35 -> 40 (+5), 40 -> 38 (0) = 5m
    expect(result.elevationGain).toBe(5)
  })

  it('extrait le GPS track', () => {
    const result = parseGpxFile(minimalGpx)
    expect(result.gpsTrack).toHaveLength(3)
    expect(result.gpsTrack![0]).toEqual([48.8566, 2.3522])
  })

  it('extrait la date du premier trackpoint', () => {
    const result = parseGpxFile(minimalGpx)
    expect(result.date).toEqual(new Date('2024-06-15T08:00:00Z'))
  })

  it('retourne null pour les champs non disponibles en GPX', () => {
    const result = parseGpxFile(minimalGpx)
    expect(result.avgHeartRate).toBeNull()
    expect(result.maxHeartRate).toBeNull()
    expect(result.avgCadence).toBeNull()
    expect(result.calories).toBeNull()
    expect(result.vo2max).toBeNull()
    expect(result.groundContactTime).toBeNull()
    expect(result.laps).toBeNull()
  })

  it('retourne le nom par défaut si absent', () => {
    const gpxNoName = `<gpx><trk><trkseg></trkseg></trk></gpx>`
    const result = parseGpxFile(gpxNoName)
    expect(result.name).toBe('Course importee')
  })

  it('gère un GPX sans trackpoints', () => {
    const emptyGpx = `<gpx><trk><trkseg></trkseg></trk></gpx>`
    const result = parseGpxFile(emptyGpx)
    expect(result.distanceKm).toBe(0)
    expect(result.durationSeconds).toBe(0)
    expect(result.avgPace).toBe('--:--')
    expect(result.gpsTrack).toBeNull()
  })
})
