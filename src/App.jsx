import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [coins, setCoins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchPrices() {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,solana,binancecoin&order=market_cap_desc'
        )
        
        if (!response.ok) {
          throw new Error('خطا در دریافت اطلاعات')
        }

        const data = await response.json()
        setCoins(data)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchPrices()
  }, [])

  if (loading) return <div className="container">در حال بارگذاری...</div>
  if (error) return <div className="container">خطا: {error}</div>

  return (
    <div className="container">
      <h1>قیمت ارزهای دیجیتال</h1>
      
      <div className="coins-list">
        {coins.map((coin) => (
          <div key={coin.id} className="coin-card">
            <div className="coin-info">
              <img src={coin.image} alt={coin.name} width="32" />
              <div>
                <h3>{coin.name}</h3>
                <span>{coin.symbol.toUpperCase()}</span>
              </div>
            </div>

            <div className="coin-price">
              <strong>${coin.current_price.toLocaleString()}</strong>
              <span className={coin.price_change_percentage_24h >= 0 ? 'green' : 'red'}>
                {coin.price_change_percentage_24h?.toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App