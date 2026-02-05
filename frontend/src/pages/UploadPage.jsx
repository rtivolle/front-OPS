import React, { useState, useRef } from 'react';
import axios from 'axios';
import '../styles/variables.css';

const UploadPage = () => {
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (selectedFile) => {
        // Validate file type
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
        if (!validTypes.includes(selectedFile.type)) {
            setMessage({ type: 'error', text: 'Invalid file type. Please upload PDF, DOCX, JPG, or PNG.' });
            return;
        }
        if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
            setMessage({ type: 'error', text: 'File size exceeds 10MB limit.' });
            return;
        }

        setFile(selectedFile);
        setMessage({ type: '', text: '' });
        setProgress(0);
    };

    const uploadFile = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                }
            });

            setMessage({ type: 'success', text: 'File uploaded successfully! It is now being processed.' });
            setFile(null);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: error.response?.data?.error || 'Upload failed. Please try again.' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem' }}>Upload Documents</h1>

            <div
                className={`upload-zone ${dragging ? 'dragging' : ''}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                style={{
                    border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--border)'}`,
                    backgroundColor: dragging ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-surface)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '4rem 2rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginBottom: '2rem'
                }}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                />

                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                    {file ? '📄' : '☁️'}
                </div>

                {file ? (
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>{file.name}</h3>
                        <p style={{ color: 'var(--text-sub)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button
                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                            style={{
                                marginTop: '1rem',
                                background: 'none',
                                border: 'none',
                                color: 'var(--danger)',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            Remove
                        </button>
                    </div>
                ) : (
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Click or Drag file to upload</h3>
                        <p style={{ color: 'var(--text-sub)' }}>Support for PDF, DOCX, JPG, PNG (Max 10MB)</p>
                    </div>
                )}
            </div>

            {uploading && (
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                        <span>Uploading...</span>
                        <span>{progress}%</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progress}%`, backgroundColor: 'var(--primary)', transition: 'width 0.2s' }}></div>
                    </div>
                </div>
            )}

            {message.text && (
                <div style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: message.type === 'error' ? 'var(--danger-bg)' : 'var(--success-bg)',
                    color: message.type === 'error' ? 'var(--danger)' : 'var(--success)',
                    marginBottom: '2rem',
                    fontWeight: '500'
                }}>
                    {message.text}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={uploadFile}
                    disabled={!file || uploading}
                    style={{
                        padding: '0.75rem 2rem',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: disabled => disabled ? 'not-allowed' : 'pointer',
                        opacity: (!file || uploading) ? 0.6 : 1
                    }}
                >
                    {uploading ? 'Processing...' : 'Upload Document'}
                </button>
            </div>
        </div>
    );
};

export default UploadPage;
