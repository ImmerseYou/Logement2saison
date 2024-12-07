import { supabase } from '../config/supabase'

export const accommodationService = {
  // Créer un nouveau logement
  async createAccommodation(accommodationData) {
    const { data, error } = await supabase
      .from('accommodations')
      .insert([accommodationData])
      .select()
    if (error) throw error
    return data[0]
  },

  // Récupérer tous les logements
  async getAllAccommodations() {
    const { data, error } = await supabase
      .from('accommodations')
      .select('*')
    if (error) throw error
    return data
  },

  // Récupérer un logement par ID
  async getAccommodationById(id) {
    const { data, error } = await supabase
      .from('accommodations')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  // Mettre à jour un logement
  async updateAccommodation(id, updates) {
    const { data, error } = await supabase
      .from('accommodations')
      .update(updates)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  // Supprimer un logement
  async deleteAccommodation(id) {
    const { error } = await supabase
      .from('accommodations')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // Rechercher des logements avec filtres
  async searchAccommodations(filters) {
    let query = supabase
      .from('accommodations')
      .select('*')

    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`)
    }
    if (filters.priceRange) {
      query = query
        .gte('price', filters.priceRange[0])
        .lte('price', filters.priceRange[1])
    }
    if (filters.type) {
      query = query.eq('type', filters.type)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }
}
