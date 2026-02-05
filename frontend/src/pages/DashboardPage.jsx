import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import '../styles/variables.css';

const DashboardPage = () => {
    const [stats, setStats] = useState({ total_documents: 0, processed_today: 0, storage_used: 'N/A' });
    const [recentDocs, setRecentDocs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, recentRes] = await Promise.all([
                    axios.get('/api/search/stats'),
                    axios.get('/api/search/recent')
                ]);
                setStats({
                    ...statsRes.data,
                    storage_used: '450GB' // Still mocked for now as we didn't implement disk usage check
                });
                setRecentDocs(recentRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const statCards = [
        { label: 'Total Documents', value: stats.total_documents.toLocaleString(), trend: 'Indexed', color: 'var(--primary)' },
        { label: 'Processed Today', value: stats.processed_today.toString(), trend: 'New', color: 'var(--success)' },
        { label: 'Storage Used', value: stats.storage_used, trend: '45%', color: 'var(--warning)' },
    ];

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>;
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Good afternoon, User</h1>
                    <p style={{ color: 'var(--text-sub)' }}>Here's what's happening with your documents today.</p>
                </div>
                <div className="header-actions">
                    <button style={{
                        backgroundColor: 'white',
                        border: '1px solid var(--border)',
                        padding: '0.5rem',
                        borderRadius: '50%',
                        cursor: 'pointer'
                    }}>🔔</button>
                </div>
            </header>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {statCards.map((stat, i) => (
                    <div key={i} style={{
                        backgroundColor: 'var(--bg-surface)',
                        padding: '1.5rem',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-sm)',
                        border: '1px solid var(--border)'
                    }}>
                        <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{stat.label}</p>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{stat.value}</h2>
                            <span style={{ color: stat.color, fontWeight: '500', fontSize: '0.875rem' }}>{stat.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Upload */}
            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Quick Upload</h3>
                <div style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '2px dashed var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '3rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>☁️</div>
                    <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Click to upload or drag and drop</p>
                    <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>PDF, DOCX, JPG (max 10MB)</p>
                </div>
            </section>

            {/* Recent Documents */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Recent Documents</h3>
                    <NavLink to="/search" style={{ fontSize: '0.875rem', fontWeight: '500' }}>View all &rarr;</NavLink>
                </div>

                <div style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid var(--border)',
                    overflow: 'hidden'
                }}>
                    {recentDocs.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
                                <tr>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-sub)', fontWeight: '600' }}>Name</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-sub)', fontWeight: '600' }}>Actions</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-sub)', fontWeight: '600' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentDocs.map((doc) => (
                                    <tr key={doc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{
                                                background: '#fee2e2', color: '#dc2626',
                                                width: '32px', height: '32px', borderRadius: '6px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold'
                                            }}>PDF</span>
                                            {doc.file_name}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <a href={doc.nextcloud_link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>Open</a>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-sub)', fontSize: '0.875rem' }}>
                                            {new Date(doc.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-sub)' }}>
                            No recent documents found.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default DashboardPage;
