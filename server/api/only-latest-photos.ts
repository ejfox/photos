// server/api/latest-photos.ts
import { createClient } from '@supabase/supabase-js'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default defineEventHandler(async (event) => {
  try {
    // Fetch the latest entry from the images table
    const latestImage = await supabase
      .from('images')
      .select('service_created_at')
      .order('service_created_at', { ascending: false })
      .limit(1)

    
    let timestamp
    if(latestImage?.data[0]) {
    // Convert the service_created_at date to a timestamp
      timestamp = new Date(latestImage.data[0].service_created_at).getTime()
    } else {
      // If there is no latestImage, set the timestamp to 0
      timestamp = 0
    }

    // Fetch images from Cloudinary that were uploaded after the timestamp
    const result = await cloudinary.search
      .expression(`resource_type:image AND created_at>${timestamp}`)
      .execute()

    if (result.resources.length > 0) {
      console.log('Upserting images ', result.resources.length)
      for (let resource of result.resources) {
        await supabase
          .from('images')
          .upsert(
            { 
              service_created_at: resource.created_at,
              type: 'image',
              service_id: resource.public_id,
              href: resource.secure_url,
            },
            {
              onConflict: 'href',
            },
          )
      }
    }

    const { data, error } = await supabase
      .from('images')            
      .select('*')
      // sort by service_created_at in descending order
      .order('service_created_at', { ascending: false })

    if (error) {
      console.error(error)
      return []
    }
    return data
  } catch (err) {
    console.error(err)
    return []
  }
})