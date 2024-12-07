import { supabase } from '../config/supabase'

export const bookingService = {
  // Créer une nouvelle réservation
  async createBooking(bookingData) {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
    if (error) throw error
    return data[0]
  },

  // Récupérer les réservations d'un utilisateur
  async getUserBookings(userId) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        accommodation:accommodations(*)
      `)
      .eq('user_id', userId)
    if (error) throw error
    return data
  },

  // Récupérer les réservations pour un logement
  async getAccommodationBookings(accommodationId) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('accommodation_id', accommodationId)
    if (error) throw error
    return data
  },

  // Mettre à jour une réservation
  async updateBooking(id, updates) {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  // Annuler une réservation
  async cancelBooking(id) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  // Vérifier la disponibilité
  async checkAvailability(accommodationId, startDate, endDate) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('accommodation_id', accommodationId)
      .overlaps('start_date', 'end_date', startDate, endDate)
    
    if (error) throw error
    return data.length === 0 // true si disponible
  }
}
