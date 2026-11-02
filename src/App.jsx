import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [coins, setCoins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [usdToToman, setUsdToToman] = useState(null)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })
  const [cooldown, setCooldown] = useState(false)

  useEffect(() => {
    document.body.className = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  async function fetchData(isManual = false) {
    try {
      if (isManual) {
        setIsRefreshing(true)
        setCooldown(true)
      }

      setError(null)

      const [coinsResponse, rateResponse] = await Promise.all([
        fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,solana,binancecoin&order=market_cap_desc'
        ),
        fetch('https://cdn.jsdelivr.net/gh/hidevs/tabloo@main/data/popular.json')
      ])

      if (!coinsResponse.ok) {
        throw new Error('خطا در دریافت قیمت ارزها (احتمالاً محدودیت تعداد درخواست)')
      }

      if (!rateResponse.ok) {
        throw new Error('خطا در دریافت نرخ دلار')
      }

      const coinsData = await coinsResponse.json()
      const rateData = await rateResponse.json()

      const dollarItem = rateData.data?.find(item => item.symbol === 'USD_IRR_FREE')
      const tomanRate = dollarItem ? dollarItem.price : null

      setCoins(coinsData)
      setUsdToToman(tomanRate)
      setLoading(false)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message)
      setLoading(false)
    } finally {
      if (isManual) {
        setIsRefreshing(false)
        // ۱۲ ثانیه دکمه غیرفعال بمونه
        setTimeout(() => {
          setCooldown(false)
        }, 4000)
      }
    }
  }

  useEffect(() => {
    fetchData()
    const intervalId = setInterval(fetchData, 30000)
    return () => clearInterval(intervalId)
  }, [])

  if (loading) {
    return (
      <div className="container">
        <h1>قیمت ارزهای دیجیتال</h1>
        <div className="coins-list">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="coin-card skeleton-card">
              <div className="skeleton-info">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-text-group">
                  <div className="skeleton-line short"></div>
                  <div className="skeleton-line shorter"></div>
                </div>
              </div>
              <div className="skeleton-price">
                <div className="skeleton-line medium"></div>
                <div className="skeleton-line short"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="top-bar">
        <button className="theme-btn" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️ روشن' : '🌙 تاریک'}
        </button>
      </div>

      <h1>قیمت ارزهای دیجیتال</h1>

      <div className="header-actions">
        <p className="subtitle">
          داده‌ها از CoinGecko
          {usdToToman && <> • دلار: {usdToToman.toLocaleString()} تومان</>}
          {lastUpdated && (
            <> • آخرین به‌روزرسانی: {lastUpdated.toLocaleTimeString('fa-IR')}</>
          )}
        </p>

        <button
          className="refresh-btn"
          onClick={() => fetchData(true)}
          disabled={isRefreshing || cooldown}
        >
          {isRefreshing ? 'در حال به‌روزرسانی...' : cooldown ? 'کمی صبر کنید...' : 'به‌روزرسانی'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="coins-list">
        {coins.map((coin) => {
          const tomanPrice = usdToToman
            ? Math.round(coin.current_price * usdToToman)
            : null

          return (
            <div key={coin.id} className="coin-card">
              <div className="coin-info">
                <img src={coin.image} alt={coin.name} />
                <div>
                  <h3>{coin.name}</h3>
                  <span>{coin.symbol}</span>
                </div>
              </div>

              <div className="coin-price">
                <strong>${coin.current_price.toLocaleString()}</strong>
                {tomanPrice && (
                  <span className="toman-price">
                    {tomanPrice.toLocaleString()} تومان
                  </span>
                )}
                <span
                  className={
                    coin.price_change_percentage_24h >= 0 ? 'green' : 'red'
                  }
                >
                  {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                  {coin.price_change_percentage_24h?.toFixed(2)}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App