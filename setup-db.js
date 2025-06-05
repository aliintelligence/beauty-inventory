import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vxlntanxghsyvttyvqfu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bG50YW54Z2hzeXZ0dHl2cWZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTA4NDY0MywiZXhwIjoyMDY0NjYwNjQzfQ.o9XsfxI5ncHayTfF7WFSPLGaq3dNWF_f6wHVPk3Thk0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('Testing connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1)
    
    if (error) {
      console.error('Connection failed:', error.message)
      return
    }
    
    console.log('✅ Connected to Supabase successfully!')
    
    // Create products table
    const { error: createError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS products (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
          cost DECIMAL(10,2) NOT NULL CHECK (cost >= 0),
          customs_cost DECIMAL(10,2) DEFAULT 0 CHECK (customs_cost >= 0),
          inventory_quantity INTEGER NOT NULL DEFAULT 0 CHECK (inventory_quantity >= 0),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (createError) {
      console.error('Failed to create table:', createError.message)
    } else {
      console.log('✅ Products table created!')
    }
    
  } catch (err) {
    console.error('Setup failed:', err.message)
  }
}

setupDatabase()