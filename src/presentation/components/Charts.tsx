import { useMemo } from 'react'
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, ArcElement } from 'chart.js'
import { Line, Pie } from 'react-chartjs-2'

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, ArcElement)

export function Charts({ result }: { result: any }) {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1200
  const tickCount = width < 480 ? 3 : width < 768 ? 5 : 8

  const lineData = useMemo(() => {
    const labels = result?.stats?.byMinute?.map((b: any) => new Date(b.t).toLocaleTimeString()) ?? []
    const data = result?.stats?.byMinute?.map((b: any) => b.count) ?? []
    return { labels, datasets: [{ label: '로그/분', data, borderWidth: 2, pointRadius: 0, tension: 0.25 }] }
  }, [result])

  const pieData = useMemo(() => {
    const s = result?.stats?.byLevel ?? {}
    const labels = Object.keys(s)
    const data = labels.map(l => s[l])
    return { labels, datasets: [{ data }] }
  }, [result])

  return (
    <section className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-4">
      <div className="chart-wrap rounded-xl border border-slate-200 p-3">
        <div className="text-sm font-medium mb-2">시간대별 로그 수</div>
        <div className="h-56 sm:h-64 md:h-80 lg:h-96">
          <Line data={lineData} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' as const } },
            scales: { x: { ticks: { maxTicksLimit: tickCount } }, y: { beginAtZero: true } }
          }} />
        </div>
      </div>
      <div className="chart-wrap rounded-xl border border-slate-200 p-3">
        <div className="text-sm font-medium mb-2">레벨 분포</div>
        <div className="h-56 sm:h-64 md:h-80 lg:h-96">
          <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' as const } } }} />
        </div>
      </div>
    </section>
  )
}
