export default function TestPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f0f0f0',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <h1 style={{ fontSize: '48px', color: '#333' }}>✅ Next.js funciona correctamente</h1>
      <p style={{ fontSize: '24px', color: '#666' }}>Si ves esto, ngrok está funcionando</p>
      <p style={{ fontSize: '18px', color: '#999' }}>Prueba acceder a: /test desde tu tablet</p>
    </div>
  )
}

