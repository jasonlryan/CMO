#!/bin/bash

# Exit on error
set -e

echo "==> Reorganizing frontend structure..."

cd frontend

# 1. Create TypeScript configs
echo "Creating TypeScript configurations..."

# Create tsconfig.json
cat > tsconfig.json << EOL
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "es2020",
    "skipLibCheck": true,
    "moduleResolution": "node",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOL

# Create tsconfig.node.json
cat > tsconfig.node.json << EOL
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "es2020",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOL

# 2. Create base files
echo "Creating base files..."

# Create App.tsx
cat > src/App.tsx << EOL
import React from 'react';
import './styles/index.css';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div>
      <Dashboard />
    </div>
  );
}

export default App;
EOL

# Create main.tsx if it doesn't exist
cat > src/main.tsx << EOL
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOL

# Create styles directory and move index.css
mkdir -p src/styles
if [ -f src/index.css ]; then
    mv src/index.css src/styles/
else
    touch src/styles/index.css
fi

# Create base components
echo "Creating base components..."

# Button component
mkdir -p src/components/common
cat > src/components/common/Button.tsx << EOL
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick,
  className = ''
}) => {
  return (
    <button 
      className={\`px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 \${className}\`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
EOL

# Dashboard page
mkdir -p src/pages/Dashboard
cat > src/pages/Dashboard/index.tsx << EOL
import React from 'react';
import { Button } from '@/components/common/Button';

const Dashboard: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">CMO Assessment Dashboard</h1>
      <Button onClick={() => console.log('New Assessment')}>
        Create New Assessment
      </Button>
    </div>
  );
};

export default Dashboard;
EOL

# Create Supabase client
mkdir -p src/lib
cat > src/lib/supabase.ts << EOL
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
EOL

# Create auth context
mkdir -p src/contexts
cat > src/contexts/AuthContext.tsx << EOL
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
EOL

# Update vite.config.ts
cat > vite.config.ts << EOL
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
EOL

echo "==> Frontend reorganization complete!"
echo "Next steps:"
echo "1. Run 'npm install' to ensure all dependencies are installed"
echo "2. Update .env with your Supabase credentials"
echo "3. Start the development server with 'npm run dev'" 