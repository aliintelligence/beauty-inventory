// Trinidad and Tobago locations for customer address suggestions
export const TRINIDAD_LOCATIONS = {
  regions: [
    'Arima',
    'Chaguanas', 
    'Couva-Tabaquite-Talparo',
    'Diego Martin',
    'Mayaro-Rio Claro',
    'Penal-Debe',
    'Princes Town',
    'San Fernando',
    'San Juan-Laventille',
    'Sangre Grande',
    'Siparia',
    'Tunapuna-Piarco',
    'Port of Spain'
  ],
  
  popularAreas: [
    // Port of Spain area
    'Port of Spain',
    'Woodbrook',
    'Newtown',
    'Belmont',
    'Laventille',
    
    // San Fernando area  
    'San Fernando',
    'Marabella',
    'Gasparillo',
    'Pointe-a-Pierre',
    
    // Chaguanas area
    'Chaguanas',
    'Longdenville',
    'Charlieville',
    'Cunupia',
    
    // Diego Martin area
    'Diego Martin',
    'Westmoorings',
    'Glencoe',
    'Petit Valley',
    
    // Tunapuna-Piarco area
    'Tunapuna',
    'Trincity',
    'Piarco',
    'Arouca',
    'Tacarigua',
    
    // Other popular areas
    'Arima',
    'Sangre Grande',
    'Princes Town',
    'Couva',
    'Point Fortin',
    'Siparia'
  ],
  
  // Tobago locations
  tobago: [
    'Scarborough',
    'Crown Point',
    'Canaan',
    'Bon Accord',
    'Signal Hill',
    'Plymouth',
    'Roxborough',
    'Speyside'
  ]
}

export function getAllLocations(): string[] {
  return [
    ...TRINIDAD_LOCATIONS.popularAreas,
    ...TRINIDAD_LOCATIONS.tobago
  ].sort()
}

export function searchLocations(query: string): string[] {
  const allLocations = getAllLocations()
  return allLocations.filter(location => 
    location.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10) // Limit to 10 suggestions
}