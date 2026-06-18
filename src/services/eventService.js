import { supabase } from '../app/supabase.js'

function cleanEventPayload(event) {
  // Remove view-only columns that don't exist in the actual table
  const { created_by_name, groups, ...clean } = event
  return clean
}

export const eventService = {
  async getAll(filters = {}) {
    let query = supabase
      .from('events_with_groups')
      .select('*')
      .order('start_date', { ascending: true })

    if (filters.status) query = query.eq('status', filters.status)
    if (filters.group_id) {
      query = query.filter('groups', 'cs', `[{"id":${filters.group_id}}]`)
    }
    if (filters.start_date) query = query.gte('start_date', filters.start_date)
    if (filters.end_date) query = query.lte('end_date', filters.end_date)
    if (filters.is_historical !== undefined) query = query.eq('is_historical', filters.is_historical)

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('events_with_groups')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async create(event, groupIds) {
    const cleanEvent = cleanEventPayload(event)
    const { data, error } = await supabase
      .from('events')
      .insert(cleanEvent)
      .select()
      .single()
    if (error) throw error

    if (groupIds?.length > 0) {
      const links = groupIds.map(gid => ({ event_id: data.id, group_id: gid }))
      const { error: linkError } = await supabase.from('event_groups').insert(links)
      if (linkError) throw linkError
    }

    return data
  },

  async update(id, event, groupIds) {
    const cleanEvent = cleanEventPayload(event)
    const { data, error } = await supabase
      .from('events')
      .update(cleanEvent)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    if (groupIds !== undefined) {
      await supabase.from('event_groups').delete().eq('event_id', id)
      if (groupIds.length > 0) {
        const links = groupIds.map(gid => ({ event_id: id, group_id: gid }))
        const { error: linkError } = await supabase.from('event_groups').insert(links)
        if (linkError) throw linkError
      }
    }

    return data
  },

  async delete(id) {
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) throw error
  },

  async getUpcoming(limit = 5) {
    const { data, error } = await supabase
      .from('events_with_groups')
      .select('*')
      .gte('start_date', new Date().toISOString())
      .eq('status', 'programado')
      .order('start_date', { ascending: true })
      .limit(limit)
    if (error) throw error
    return data || []
  },

  async getMissingPhotos() {
    const { data, error } = await supabase
      .from('events_with_groups')
      .select('*')
      .eq('status', 'realizado')
      .is('cover_image_url', null)
      .order('start_date', { ascending: false })
      .limit(10)
    if (error) throw error
    return data || []
  },
}

export const groupService = {
  async getAll() {
    const { data, error } = await supabase.from('groups').select('*').order('id')
    if (error) throw error
    return data || []
  },
}

export const galleryService = {
  async getByEvent(eventId) {
    const { data, error } = await supabase
      .from('event_images')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async upload(eventId, file, caption = '') {
    const fileExt = file.name.split('.').pop()
    const fileName = `${eventId}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('event-gallery')
      .upload(fileName, file)
    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('event-gallery')
      .getPublicUrl(fileName)

    const { data, error } = await supabase
      .from('event_images')
      .insert({
        event_id: eventId,
        storage_path: fileName,
        public_url: publicUrl,
        caption,
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(imageId, storagePath) {
    if (storagePath) {
      await supabase.storage.from('event-gallery').remove([storagePath])
    }
    const { error } = await supabase.from('event_images').delete().eq('id', imageId)
    if (error) throw error
  },
}

export const dashboardService = {
  async getStats(month, year) {
    const start = new Date(year, month - 1, 1).toISOString()
    const end = new Date(year, month, 0).toISOString()

    const { data, error } = await supabase
      .from('events_with_groups')
      .select('*')
      .gte('start_date', start)
      .lte('start_date', end)
    if (error) throw error

    const stats = {
      total: data?.length || 0,
      realizados: data?.filter(e => e.status === 'realizado').length || 0,
      programados: data?.filter(e => e.status === 'programado').length || 0,
      cancelados: data?.filter(e => e.status === 'cancelado').length || 0,
      byGroup: {},
    }

    data?.forEach(ev => {
      const groups = ev.groups || []
      groups.forEach(g => {
        stats.byGroup[g.name] = (stats.byGroup[g.name] || 0) + 1
      })
    })

    return stats
  },

  async getMonthlyActivities(year) {
    const { data, error } = await supabase
      .from('events_with_groups')
      .select('*')
      .gte('start_date', `${year}-01-01`)
      .lte('start_date', `${year}-12-31`)
      .eq('status', 'realizado')
    if (error) throw error

    const months = Array(12).fill(0)
    data?.forEach(ev => {
      const month = new Date(ev.start_date).getMonth()
      months[month]++
    })
    return months
  },
}
