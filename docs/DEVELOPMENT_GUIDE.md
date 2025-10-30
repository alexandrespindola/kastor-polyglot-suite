# Guia de Desenvolvimento: Kastor Polyglot Suite

## Visão Geral

Este guia detalha o passo a passo completo para desenvolver o **Kastor Polyglot Suite**, um dashboard de demonstração técnica que prova domínio em arquitetura poliglota e event-driven para a vaga de Member of Technical Staff (Fullstack).

### Stack Tecnológico
- **Frontend**: React (Vite, TypeScript), Tailwind CSS
- **API Gateway**: Hono (Bun runtime)
- **Orquestradores**: Windmill (Python/Go), n8n (LLM workflows)
- **Database**: MongoDB (Coolify)
- **Storage**: AWS S3
- **Infraestrutura**: Coolify (Windmill, n8n, MongoDB)

---

## 1. Estrutura do Monorepo

```
kastor-polyglot-suite/
├── frontend/                 # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── CodeSnippets.tsx
│   │   │   ├── WebScraper.tsx
│   │   │   ├── TextSummarizer.tsx
│   │   │   └── ProjectMonitor.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── api-gateway/              # Hono + Bun
│   ├── src/
│   │   ├── routes/
│   │   │   ├── snippets.ts
│   │   │   ├── scrape.ts
│   │   │   ├── summarize.ts
│   │   │   └── monitor.ts
│   │   └── index.ts
│   ├── package.json
│   └── bun.lockb
├── scripts/
│   ├── windmill/
│   │   ├── scraper_py.py     # Python script para Windmill
│   │   └── monitor_go.go     # Go script para Windmill
│   └── n8n/
│       └── workflow.json     # Export do workflow n8n
├── docs/
│   ├── development-guide.md
│   ├── deployment-guide.md
│   └── api-documentation.md
├── docker-compose.yml        # Para desenvolvimento local
├── package.json              # Root package.json
└── README.md
```

---

## 2. Configuração Inicial

### 2.1 Pré-requisitos
- Node.js 18+
- Bun runtime
- Go 1.21+
- Python 3.11+
- Git
- Conta AWS com S3 configurado
- Acesso ao Coolify (Windmill, n8n, MongoDB já instalados)

### 2.2 Setup do Monorepo

```bash
# Criar diretório principal
mkdir kastor-polyglot-suite
cd kastor-polyglot-suite

# Inicializar root package.json
npm init -y

# Criar estrutura de diretórios
mkdir -p frontend/src/{components,hooks,types,utils}
mkdir -p api-gateway/src/{routes,middleware,types,utils}
mkdir -p scripts/{windmill,n8n}
mkdir -p docs
```

### 2.3 Configurar Root Package.json

```json
{
  "name": "kastor-polyglot-suite",
  "private": true,
  "workspaces": [
    "frontend",
    "api-gateway"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:api\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:api": "cd api-gateway && bun run dev",
    "build": "npm run build:frontend && npm run build:api",
    "build:frontend": "cd frontend && npm run build",
    "build:api": "cd api-gateway && bun run build"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

---

## 3. Frontend Development (React + Vite + TypeScript)

### 3.1 Inicializar Projeto React

```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3.2 Configurar Tailwind CSS

**tailwind.config.js:**
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3.3 Desenvolver Componentes

#### App.tsx (Layout Principal)
```tsx
import React from 'react';
import CodeSnippets from './components/CodeSnippets';
import WebScraper from './components/WebScraper';
import TextSummarizer from './components/TextSummarizer';
import ProjectMonitor from './components/ProjectMonitor';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        Kastor Polyglot Suite
      </h1>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">Code Snippets</h2>
          <CodeSnippets />
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-green-600">Web Scraper</h2>
          <WebScraper />
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-purple-600">Text Summarizer</h2>
          <TextSummarizer />
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-orange-600">Project Monitor</h2>
          <ProjectMonitor />
        </div>
      </div>
    </div>
  );
}

export default App;
```

#### CodeSnippets.tsx
```tsx
import React, { useState, useEffect } from 'react';

interface Snippet {
  id: string;
  title: string;
  code: string;
  createdAt: string;
}

export default function CodeSnippets() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSnippets();
  }, []);

  const fetchSnippets = async () => {
    try {
      const response = await fetch('/api/snippets');
      const data = await response.json();
      setSnippets(data);
    } catch (error) {
      console.error('Error fetching snippets:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !code) return;

    setLoading(true);
    try {
      const response = await fetch('/api/snippets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, code }),
      });

      if (response.ok) {
        setTitle('');
        setCode('');
        fetchSnippets();
      }
    } catch (error) {
      console.error('Error saving snippet:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          placeholder="Code Snippet..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Snippet'}
        </button>
      </form>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {snippets.map((snippet) => (
          <div key={snippet.id} className="border border-gray-200 rounded-md p-3">
            <h4 className="font-semibold text-gray-800">{snippet.title}</h4>
            <pre className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
              {snippet.code}
            </pre>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(snippet.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### WebScraper.tsx
```tsx
import React, { useState } from 'react';

export default function WebScraper() {
  const [url, setUrl] = useState('');
  const [scrapedContent, setScrapedContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      setScrapedContent(data.content);
    } catch (error) {
      console.error('Error scraping URL:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleScrape} className="space-y-3">
        <input
          type="url"
          placeholder="Paste URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Scraping...' : 'Scrape Content'}
        </button>
      </form>

      {scrapedContent && (
        <div className="border border-gray-200 rounded-md p-3">
          <h4 className="font-semibold text-gray-800 mb-2">Scraped Content:</h4>
          <pre className="text-sm text-gray-600 whitespace-pre-wrap max-h-64 overflow-y-auto">
            {scrapedContent}
          </pre>
        </div>
      )}
    </div>
  );
}
```

#### TextSummarizer.tsx
```tsx
import React, { useState } from 'react';

export default function TextSummarizer() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text) return;

    setLoading(true);
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error('Error summarizing text:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSummarize} className="space-y-3">
        <textarea
          placeholder="Paste text to summarize..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Summarizing...' : 'Summarize'}
        </button>
      </form>

      {summary && (
        <div className="border border-gray-200 rounded-md p-3">
          <h4 className="font-semibold text-gray-800 mb-2">Summary:</h4>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {summary}
          </p>
        </div>
      )}
    </div>
  );
}
```

#### ProjectMonitor.tsx
```tsx
import React, { useState } from 'react';

interface MonitorResult {
  url: string;
  status: number;
  statusText: string;
}

export default function ProjectMonitor() {
  const [urls, setUrls] = useState('');
  const [results, setResults] = useState<MonitorResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleMonitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urls) return;

    setLoading(true);
    try {
      const response = await fetch('/api/monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls }),
      });

      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Error monitoring URLs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleMonitor} className="space-y-3">
        <textarea
          placeholder="Paste URLs, one per line..."
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check Status'}
        </button>
      </form>

      {results.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {results.map((result, index) => (
            <div 
              key={index} 
              className={`border rounded-md p-3 ${
                result.status >= 200 && result.status < 300 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-800 truncate flex-1">
                  {result.url}
                </span>
                <span className={`text-sm font-semibold px-2 py-1 rounded ${
                  result.status >= 200 && result.status < 300
                    ? 'text-green-700 bg-green-200'
                    : 'text-red-700 bg-red-200'
                }`}>
                  {result.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{result.statusText}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 4. API Gateway Development (Hono + Bun)

### 4.1 Inicializar Projeto Hono

```bash
cd api-gateway
bun init -y
bun add hono mongodb
bun add -D @types/node typescript
```

### 4.2 Configurar TypeScript

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

### 4.3 Desenvolver API Gateway

#### src/index.ts (Arquivo Principal)
```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { snippets } from './routes/snippets';
import { scrape } from './routes/scrape';
import { summarize } from './routes/summarize';
import { monitor } from './routes/monitor';

const app = new Hono();

// Middleware CORS
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Rotas
app.route('/api/snippets', snippets);
app.route('/api/scrape', scrape);
app.route('/api/summarize', summarize);
app.route('/api/monitor', monitor);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default app;
```

#### src/routes/snippets.ts (MongoDB Direct)
```typescript
import { Hono } from 'hono';
import { MongoClient, Db, Collection } from 'mongodb';

interface Snippet {
  _id?: ObjectId;
  title: string;
  code: string;
  createdAt: Date;
}

const app = new Hono();

// MongoDB connection
let db: Db;
let snippetsCollection: Collection<Snippet>;

const connectDB = async () => {
  if (db) return db;
  
  const client = new MongoClient(process.env.MONGODB_URL || 'mongodb://localhost:27017');
  await client.connect();
  db = client.db('kastor_suite');
  snippetsCollection = db.collection('snippets');
  return db;
};

// GET /api/snippets
app.get('/', async (c) => {
  try {
    await connectDB();
    const snippets = await snippetsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return c.json(snippets.map(s => ({
      id: s._id?.toString(),
      title: s.title,
      code: s.code,
      createdAt: s.createdAt.toISOString()
    })));
  } catch (error) {
    console.error('Error fetching snippets:', error);
    return c.json({ error: 'Failed to fetch snippets' }, 500);
  }
});

// POST /api/snippets
app.post('/', async (c) => {
  try {
    await connectDB();
    const { title, code } = await c.req.json();
    
    if (!title || !code) {
      return c.json({ error: 'Title and code are required' }, 400);
    }
    
    const snippet: Snippet = {
      title,
      code,
      createdAt: new Date()
    };
    
    const result = await snippetsCollection.insertOne(snippet);
    
    return c.json({ 
      success: true, 
      id: result.insertedId.toString() 
    });
  } catch (error) {
    console.error('Error saving snippet:', error);
    return c.json({ error: 'Failed to save snippet' }, 500);
  }
});

export { snippets as snippetsRouter };
```

#### src/routes/scrape.ts (Windmill + Python)
```typescript
import { Hono } from 'hono';

const app = new Hono();

// POST /api/scrape
app.post('/', async (c) => {
  try {
    const { url } = await c.req.json();
    
    if (!url) {
      return c.json({ error: 'URL is required' }, 400);
    }
    
    // Chamar script Python no Windmill
    const windmillResponse = await fetch('https://your-windmill-instance.com/api/w/run/p/user/scraper_py', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WINDMILL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    
    if (!windmillResponse.ok) {
      throw new Error('Windmill request failed');
    }
    
    const result = await windmillResponse.json();
    
    return c.json({ 
      content: result.cleaned_text,
      s3_url: result.s3_url 
    });
  } catch (error) {
    console.error('Error scraping URL:', error);
    return c.json({ error: 'Failed to scrape URL' }, 500);
  }
});

export { scrape as scrapeRouter };
```

#### src/routes/summarize.ts (n8n + LLM)
```typescript
import { Hono } from 'hono';

const app = new Hono();

// POST /api/summarize
app.post('/', async (c) => {
  try {
    const { text } = await c.req.json();
    
    if (!text) {
      return c.json({ error: 'Text is required' }, 400);
    }
    
    // Chamar workflow n8n
    const n8nResponse = await fetch('https://your-n8n-instance.com/webhook/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!n8nResponse.ok) {
      throw new Error('n8n request failed');
    }
    
    const result = await n8nResponse.json();
    
    return c.json({ summary: result.summary });
  } catch (error) {
    console.error('Error summarizing text:', error);
    return c.json({ error: 'Failed to summarize text' }, 500);
  }
});

export { summarize as summarizeRouter };
```

#### src/routes/monitor.ts (Windmill + Go)
```typescript
import { Hono } from 'hono';

const app = new Hono();

// POST /api/monitor
app.post('/', async (c) => {
  try {
    const { urls } = await c.req.json();
    
    if (!urls) {
      return c.json({ error: 'URLs are required' }, 400);
    }
    
    // Chamar script Go no Windmill
    const windmillResponse = await fetch('https://your-windmill-instance.com/api/w/run/p/user/monitor_go', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WINDMILL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urls_string: urls }),
    });
    
    if (!windmillResponse.ok) {
      throw new Error('Windmill request failed');
    }
    
    const result = await windmillResponse.json();
    
    return c.json({ results: result.results });
  } catch (error) {
    console.error('Error monitoring URLs:', error);
    return c.json({ error: 'Failed to monitor URLs' }, 500);
  }
});

export { monitor as monitorRouter };
```

---

## 5. Scripts de Orquestração

### 5.1 Python Script para Windmill (Web Scraper)

**scripts/windmill/scraper_py.py:**
```python
import requests
from bs4 import BeautifulSoup
import boto3
from datetime import datetime
import os

def main(url: str) -> dict:
    """
    Web scraper que extrai conteúdo de URLs e salva no S3
    """
    try:
        # Fazer request HTTP
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remover scripts e styles
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Extrair texto principal
        # Tentar encontrar article ou main content
        article = soup.find('article') or soup.find('main') or soup.find('div', class_='content')
        
        if article:
            text = article.get_text()
        else:
            # Fallback para todos os parágrafos
            paragraphs = soup.find_all('p')
            text = '\n'.join([p.get_text() for p in paragraphs])
        
        # Limpar texto
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        cleaned_text = '\n'.join(chunk for chunk in chunks if chunk)
        
        # Salvar no S3
        s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )
        
        # Gerar nome de arquivo único
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"scraped_content/{timestamp}_{url.replace('://', '_').replace('/', '_')}.txt"
        
        s3_client.put_object(
            Bucket=os.getenv('S3_BUCKET', 'kastor-scraped-content'),
            Key=filename,
            Body=cleaned_text.encode('utf-8'),
            ContentType='text/plain'
        )
        
        s3_url = f"s3://{os.getenv('S3_BUCKET', 'kastor-scraped-content')}/{filename}"
        
        return {
            "cleaned_text": cleaned_text,
            "s3_url": s3_url,
            "status": "success"
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "status": "error"
        }
```

### 5.2 Go Script para Windmill (Project Monitor)

**scripts/windmill/monitor_go.go:**
```go
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"
)

type MonitorResult struct {
	URL        string `json:"url"`
	Status     int    `json:"status"`
	StatusText string `json:"statusText"`
}

type Response struct {
	Results []MonitorResult `json:"results"`
}

func main() {
	// Windmill passa os argumentos como JSON no stdin
	var input struct {
		UrlsString string `json:"urls_string"`
	}
	
	decoder := json.NewDecoder(os.Stdin)
	if err := decoder.Decode(&input); err != nil {
		fmt.Printf(`{"error": "Failed to parse input: %v"}`, err)
		return
	}
	
	// Split URLs por newline
	urls := strings.Split(strings.TrimSpace(input.UrlsString), "\n")
	
	// Remover URLs vazias
	var cleanUrls []string
	for _, url := range urls {
		if strings.TrimSpace(url) != "" {
			cleanUrls = append(cleanUrls, strings.TrimSpace(url))
		}
	}
	
	// Usar WaitGroup para concorrência
	var wg sync.WaitGroup
	results := make([]MonitorResult, len(cleanUrls))
	
	for i, url := range cleanUrls {
		wg.Add(1)
		go func(index int, url string) {
			defer wg.Done()
			
			client := &http.Client{
				Timeout: 10 * time.Second,
			}
			
			resp, err := client.Get(url)
			if err != nil {
				results[index] = MonitorResult{
					URL:        url,
					Status:     0,
					StatusText: err.Error(),
				}
				return
			}
			defer resp.Body.Close()
			
			results[index] = MonitorResult{
				URL:        url,
				Status:     resp.StatusCode,
				StatusText: resp.Status,
			}
		}(i, url)
	}
	
	wg.Wait()
	
	// Retornar resultados como JSON
	response := Response{Results: results}
	output, _ := json.Marshal(response)
	fmt.Println(string(output))
}
```

---

## 6. Configuração do n8n Workflow

### 6.1 Workflow de Text Summarization

**Para configurar no n8n:**

1. **Webhook Node (Trigger)**:
   - Path: `/summarize`
   - Method: POST
   - Response Code: 200
   - Response Body: `{{ $json.summary }}`

2. **Gemini API Node**:
   - Provider: Google Gemini
   - Operation: Text Generation
   - Model: gemini-pro
   - Prompt: `Summarize this text in a concise way: {{ $json.text }}`

3. **Respond to Webhook Node**:
   - Respond with: JSON
   - Body: `{ "summary": {{ $json.text }} }`

### 6.2 Export do Workflow (JSON)

**scripts/n8n/workflow.json:**
```json
{
  "name": "Text Summarizer",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "summarize",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "webhook1",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [240, 300]
    },
    {
      "parameters": {
        "model": "gemini-pro",
        "prompt": "Summarize this text in a concise way: {{ $json.text }}"
      },
      "id": "gemini1",
      "name": "Gemini",
      "type": "n8n-nodes-base.gemini",
      "position": [460, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "{ \"summary\": {{ $json.text }} }"
      },
      "id": "respond1",
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [680, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{"node": "Gemini", "type": "main", "index": 0}]]
    },
    "Gemini": {
      "main": [[{"node": "Respond to Webhook", "type": "main", "index": 0}]]
    }
  }
}
```

---

## 7. Configuração de Ambiente

### 7.1 Variáveis de Ambiente

**.env.example:**
```env
# API Gateway
PORT=3001
MONGODB_URL=mongodb://localhost:27017

# Windmill Integration
WINDMILL_TOKEN=your_windmill_token
WINDMILL_BASE_URL=https://your-windmill-instance.com

# n8n Integration
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook

# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET=kastor-scraped-content

# Gemini API (para n8n)
GEMINI_API_KEY=your_gemini_api_key
```

### 7.2 Docker Compose (Desenvolvimento Local)

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    container_name: kastor-mongo
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password

  api-gateway:
    build:
      context: ./api-gateway
      dockerfile: Dockerfile
    container_name: kastor-api
    ports:
      - "3001:3001"
    environment:
      - MONGODB_URL=mongodb://admin:password@mongodb:27017
    depends_on:
      - mongodb
    env_file:
      - .env

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: kastor-frontend
    ports:
      - "5173:5173"
    depends_on:
      - api-gateway

volumes:
  mongodb_data:
```

---

## 8. Passos de Implementação

### 8.1 Setup Inicial (Dia 1)
1. Criar estrutura do monorepo
2. Configurar package.json root
3. Inicializar projeto React com Vite
4. Configurar Tailwind CSS
5. Criar layout básico do App.tsx

### 8.2 Frontend Components (Dia 2)
1. Implementar CodeSnippets.tsx
2. Implementar WebScraper.tsx  
3. Implementar TextSummarizer.tsx
4. Implementar ProjectMonitor.tsx
5. Testar componentes com mock data

### 8.3 API Gateway (Dia 3)
1. Inicializar projeto Hono + Bun
2. Configurar MongoDB connection
3. Implementar rota /api/snippets (CRUD direto)
4. Testar integração frontend ↔ API Gateway

### 8.4 Windmill Integration (Dia 4)
1. Configurar script Python no Windmill
2. Implementar rota /api/scrape
3. Configurar script Go no Windmill  
4. Implementar rota /api/monitor
5. Testar integrações com Windmill

### 8.5 n8n Integration (Dia 5)
1. Configurar workflow n8n com Gemini
2. Implementar rota /api/summarize
3. Testar integração com LLM
4. Ajustar tratamento de erros

### 8.6 AWS Integration (Dia 6)
1. Configurar bucket S3
2. Adicionar credenciais AWS no script Python
3. Testar upload de arquivos no S3
4. Implementar URLs assinadas se necessário

### 8.7 Deploy e Finalização (Dia 7)
1. Configurar Docker containers
2. Deploy no Coolify
3. Testes end-to-end completos
4. Documentação final

---

## 9. Comandos Úteis

### Development
```bash
# Iniciar todos os serviços
npm run dev

# Apenas frontend
npm run dev:frontend

# Apenas API Gateway
npm run dev:api

# Build para produção
npm run build
```

### Testing
```bash
# Testar API Gateway
curl -X GET http://localhost:3001/health

# Testar snippets
curl -X POST http://localhost:3001/api/snippets \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "code": "console.log(\"hello\")"}'
```

### Deploy
```bash
# Build Docker images
docker-compose build

# Subir containers
docker-compose up -d

# Ver logs
docker-compose logs -f
```

---

## 10. Debugging e Troubleshooting

### Problemas Comuns

1. **CORS Errors**: Verificar configuração de CORS no Hono
2. **MongoDB Connection**: Verificar string de conexão e autenticação
3. **Windmill Integration**: Validar tokens e endpoints
4. **n8n Webhooks**: Verificar se workflows estão ativos
5. **AWS S3**: Confirmar permissões IAM e bucket existence

### Logs e Monitoramento

- API Gateway logs: `bun run dev` mostra logs detalhados
- Windmill: Interface web do Windmill
- n8n: Interface web do n8n
- MongoDB: `docker logs kastor-mongo`

---

## 11. Próximos Passos

Após implementação básica:

1. **Autenticação**: Adicionar JWT tokens
2. **Rate Limiting**: Implementar limites de API
3. **Caching**: Redis para performance
4. **Testing**: Unit tests e integration tests
5. **Monitoring**: Metrics e alertas
6. **CI/CD**: GitHub Actions para deploy automático

Este guia fornece uma base sólida para demonstrar todas as habilidades técnicas exigidas pela vaga, com foco em arquitetura moderna, poliglota e event-driven.
