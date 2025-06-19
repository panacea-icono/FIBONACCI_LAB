import AnalyticsComponent from '../components/AnalyticsComponent'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <AnalyticsComponent />
      </body>
    </html>
  )
}
