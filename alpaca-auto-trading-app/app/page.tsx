export default function Home() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Welcome to Alpaca IQ</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Trading Dashboard</h3>
          <p className="text-gray-300">Professional trading interface with real-time data and advanced analytics.</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">AI Analysis</h3>
          <p className="text-gray-300">Intelligent market analysis powered by AI to enhance trading decisions.</p>
        </div>
      </div>
    </div>
  )
}