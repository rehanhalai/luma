import { PhaserGame } from "./PhaserGame";

function App() {
  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-4 text-emerald-400">Luma 2D Game Client</h1>
      <PhaserGame />
    </main>
  )
}

export default App;