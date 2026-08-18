import { useEffect, useState } from 'react'

function App() {
  const [status, setStatus] = useState<'checking' | 'up' | 'down'>('checking')

  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then((res) => res.json())
      .then((data) => setStatus(data.status === 'ok' ? 'up' : 'down'))
      .catch(() => setStatus('down'))
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Prediction Game</h1>
        <p className="text-slate-400">
          Backend status:{' '}
          <span
            className={
              status === 'up'
                ? 'text-green-400'
                : status === 'down'
                  ? 'text-red-400'
                  : 'text-yellow-400'
            }
          >
            {status}
          </span>
        </p>
      </div>
    </div>
  )
}

export default App
