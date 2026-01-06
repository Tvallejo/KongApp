import { useState } from 'react'

// Use environment variable in production, fallback to Render backend
const API_URL = import.meta.env.VITE_API_URL || 'https://kong-api-e6wc.onrender.com/api'



// Estilos inline para evitar dependencias externas
const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
    },
    header: {
        textAlign: 'center',
        marginBottom: '50px'
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: '800',
        background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '10px'
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: '1.1rem'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
    },
    card: {
        background: 'rgba(30, 41, 59, 0.8)',
        borderRadius: '16px',
        padding: '28px',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        backdropFilter: 'blur(10px)'
    },
    cardTitle: {
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '8px',
        color: '#f1f5f9'
    },
    cardDesc: {
        color: '#94a3b8',
        fontSize: '0.9rem',
        marginBottom: '20px',
        lineHeight: '1.5'
    },
    button: {
        width: '100%',
        padding: '14px 24px',
        borderRadius: '10px',
        border: 'none',
        fontWeight: '600',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
    },
    btnBlue: {
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        color: 'white'
    },
    btnPurple: {
        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        color: 'white'
    },
    btnGreen: {
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: 'white'
    },
    btnDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed'
    },
    status: {
        padding: '12px 20px',
        borderRadius: '10px',
        textAlign: 'center',
        marginBottom: '30px',
        fontWeight: '500'
    },
    statusSuccess: {
        background: 'rgba(16, 185, 129, 0.2)',
        border: '1px solid #10b981',
        color: '#34d399'
    },
    statusError: {
        background: 'rgba(239, 68, 68, 0.2)',
        border: '1px solid #ef4444',
        color: '#f87171'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        background: 'rgba(30, 41, 59, 0.8)',
        borderRadius: '16px',
        overflow: 'hidden'
    },
    th: {
        padding: '16px 20px',
        textAlign: 'left',
        background: 'rgba(15, 23, 42, 0.5)',
        color: '#94a3b8',
        fontWeight: '600',
        fontSize: '0.8rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    td: {
        padding: '16px 20px',
        borderTop: '1px solid rgba(148, 163, 184, 0.1)',
        color: '#e2e8f0'
    },
    badge: {
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '700',
        textTransform: 'uppercase'
    },
    badgeStake: {
        background: 'rgba(16, 185, 129, 0.2)',
        color: '#34d399'
    },
    badgeUnstake: {
        background: 'rgba(251, 146, 60, 0.2)',
        color: '#fb923c'
    },
    emptyState: {
        textAlign: 'center',
        padding: '60px 20px',
        color: '#64748b'
    }
}

function App() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(null)
    const [status, setStatus] = useState({ type: '', message: '' })

    const runTask = async (task) => {
        setLoading(task)
        setStatus({ type: '', message: '' })

        try {
            const method = task === 'upload' ? 'POST' : 'GET'
            const response = await fetch(`${API_URL}/${task}`, { method })
            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.detail || 'Request failed')
            }

            if (task === 'process' && result.data) {
                setData(result.data)
            }

            setStatus({
                type: 'success',
                message: `✓ ${task.charAt(0).toUpperCase() + task.slice(1)} completed successfully!`
            })
        } catch (error) {
            setStatus({
                type: 'error',
                message: `✗ Error: ${error.message}`
            })
        } finally {
            setLoading(null)
        }
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <h1 style={styles.title}>🦍 KONG Dashboard</h1>
                <p style={styles.subtitle}>
                    Manage token staking data and sync with Google Sheets
                </p>
            </header>

            {/* Status Message */}
            {status.message && (
                <div style={{
                    ...styles.status,
                    ...(status.type === 'success' ? styles.statusSuccess : styles.statusError)
                }}>
                    {status.message}
                </div>
            )}

            {/* Action Cards */}
            <div style={styles.grid}>
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>1. Fetch Data</h3>
                    <p style={styles.cardDesc}>
                        Connect to Etherscan API and retrieve the latest staking transactions.
                    </p>
                    <button
                        onClick={() => runTask('fetch')}
                        disabled={loading !== null}
                        style={{
                            ...styles.button,
                            ...styles.btnBlue,
                            ...(loading ? styles.btnDisabled : {})
                        }}
                    >
                        {loading === 'fetch' ? '⏳ Fetching...' : '📥 Fetch from Etherscan'}
                    </button>
                </div>

                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>2. Process Data</h3>
                    <p style={styles.cardDesc}>
                        Transform raw data using Pandas logic and preview the results below.
                    </p>
                    <button
                        onClick={() => runTask('process')}
                        disabled={loading !== null}
                        style={{
                            ...styles.button,
                            ...styles.btnPurple,
                            ...(loading ? styles.btnDisabled : {})
                        }}
                    >
                        {loading === 'process' ? '⏳ Processing...' : '⚙️ Process & Preview'}
                    </button>
                </div>

                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>3. Upload to Sheets</h3>
                    <p style={styles.cardDesc}>
                        Push the processed data to your Google Spreadsheet automatically.
                    </p>
                    <button
                        onClick={() => runTask('upload')}
                        disabled={loading !== null || data.length === 0}
                        style={{
                            ...styles.button,
                            ...styles.btnGreen,
                            ...(loading || data.length === 0 ? styles.btnDisabled : {})
                        }}
                    >
                        {loading === 'upload' ? '⏳ Uploading...' : '📤 Sync to Google Sheets'}
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div style={styles.card}>
                <h3 style={{ ...styles.cardTitle, marginBottom: '20px' }}>
                    📊 Transaction Preview {data.length > 0 && `(${data.length} records)`}
                </h3>

                {data.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Time</th>
                                    <th style={styles.th}>Type</th>
                                    <th style={{ ...styles.th, textAlign: 'right' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.slice(0, 20).map((row, i) => (
                                    <tr key={i}>
                                        <td style={styles.td}>{row.time}</td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.badge,
                                                ...(row.type === 'Stake' ? styles.badgeStake : styles.badgeUnstake)
                                            }}>
                                                {row.type}
                                            </span>
                                        </td>
                                        <td style={{ ...styles.td, textAlign: 'right', fontFamily: 'monospace' }}>
                                            {Number(row.amount).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={styles.emptyState}>
                        <p style={{ fontSize: '2rem', marginBottom: '10px' }}>📭</p>
                        <p>No data yet. Click "Process & Preview" to see transactions.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default App
