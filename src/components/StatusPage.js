import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayFill, StopFill, PauseFill } from 'react-bootstrap-icons';
import './StatusPage.css';

const StatusPage = () => {
    const { protocol } = useParams();
    const navigate = useNavigate();
    const [progress, setProgress] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState({
        hours: '00',
        minutes: '00',
        seconds: '00'
    });
    const [loading, setLoading] = useState(false);

    // Redirect to protocol selection if no protocol is selected
    useEffect(() => {
        if (!protocol) {
            console.log('No protocol selected, showing default status page');
            // We'll show a message to select a protocol
        } else {
            console.log(`Protocol selected: ${protocol}`);
            // Start the protocol automatically
            setIsRunning(true);
            startProgressSimulation();
        }
    }, [protocol]);

    // Use localhost for local access, IP for remote access
    const baseUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001'
        : `http://${window.location.hostname}:3001`;

    const sendRequest = async (action) => {
        if (!protocol) {
            console.warn('No protocol selected');
            return;
        }

        try {
            console.log(`Sending ${action} request to ${baseUrl}/${action}`);
            const response = await fetch(`${baseUrl}/${action}`, {
                method: 'POST',
                body: protocol,
                headers: {
                    'Content-Type': 'text/plain'
                }
            });
            
            console.log(`Got response:`, response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.text();
            console.log(`Response text:`, result);
            
            // Fetch updated state after action
            fetchState();
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                error
            });
        }
    };

    // Get API URL dynamically
    const getApiUrl = () => {
        return process.env.REACT_APP_API_URL 
            ? process.env.REACT_APP_API_URL 
            : `${window.location.protocol}//${window.location.hostname}:3001`;
    };

    // Fetch state from the API
    const fetchState = async () => {
        try {
            setLoading(true);
            const apiUrl = getApiUrl();
            const response = await fetch(`${apiUrl}/state`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const state = await response.json();
            console.log('Received state:', state);
            setProgress(state.progress);
            setIsRunning(state.isRunning);
            setTimeRemaining({
                hours: state.time.hours.toString().padStart(2, '0'),
                minutes: state.time.minutes.toString().padStart(2, '0'),
                seconds: state.time.seconds.toString().padStart(2, '0')
            });
        } catch (error) {
            console.error('Error fetching state:', {
                message: error.message,
                stack: error.stack,
                error
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch state on component mount
    useEffect(() => {
        fetchState();
        
        // Poll for state updates every second when running
        const interval = setInterval(() => {
            if (isRunning) {
                fetchState();
            }
        }, 1000);
        
        return () => {
            clearInterval(interval);
        };
    }, [isRunning]);

    const toggleRunning = async () => {
        await sendRequest(isRunning ? 'pause' : 'play');
    };

    const handleStop = async () => {
        await sendRequest('stop');
    };

    const createProgressLines = () => {
        const svgSize = Math.min(550, window.innerHeight * 0.65);
        const radius = svgSize * 0.45;
        const center = { x: svgSize * 0.5, y: svgSize * 0.5 };
        const totalLines = 100;
        const lines = [];
        const progressLines = Math.floor(progress / 100 * totalLines);
        
        for (let i = 0; i < totalLines; i++) {
            const angle = (i / totalLines) * 2 * Math.PI - Math.PI / 2;
            const x1 = center.x + (radius - svgSize * 0.03) * Math.cos(angle);
            const y1 = center.y + (radius - svgSize * 0.03) * Math.sin(angle);
            const x2 = center.x + (radius + svgSize * 0.03) * Math.cos(angle);
            const y2 = center.y + (radius + svgSize * 0.03) * Math.sin(angle);
            
            lines.push(
                <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={i < progressLines ? "#00bfb3" : "#e0e0e0"}
                    strokeWidth={Math.max(svgSize * 0.012, 4)}
                    strokeLinecap="round"
                    opacity={i < progressLines ? 1 : 0.15}
                />
            );
        }
        return lines;
    };

    useEffect(() => {
        let progressInterval;
        let timeInterval;

        if (isRunning) {
            progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(progressInterval);
                        clearInterval(timeInterval);
                        setIsRunning(false);
                        return 100;
                    }
                    return prev + 1;
                });
            }, 1000);

            timeInterval = setInterval(() => {
                setTimeRemaining(prev => {
                    const totalSeconds = parseInt(prev.hours) * 3600 + 
                                      parseInt(prev.minutes) * 60 + 
                                      parseInt(prev.seconds) + 1;

                    const hours = Math.floor(totalSeconds / 3600);
                    const minutes = Math.floor((totalSeconds % 3600) / 60);
                    const seconds = totalSeconds % 60;

                    return {
                        hours: hours.toString().padStart(2, '0'),
                        minutes: minutes.toString().padStart(2, '0'),
                        seconds: seconds.toString().padStart(2, '0')
                    };
                });
            }, 1000);
        }

        return () => {
            clearInterval(progressInterval);
            clearInterval(timeInterval);
        };
    }, [isRunning]);

    const startProgressSimulation = () => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsRunning(false);
                    return 100;
                }
                return prev + 1;
            });
        }, 1000);
    };

    useEffect(() => {
        const handleResize = () => {
            // Force re-render on window resize
            setProgress(prev => prev);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="status-page">
            {!protocol ? (
                <div className="no-protocol-message">
                    <h2>No Protocol Selected</h2>
                    <p>Please select a protocol from the Protocol Library to run.</p>
                    <button 
                        className="select-protocol-button"
                        onClick={() => navigate('/protocols')}
                    >
                        Go to Protocol Library
                    </button>
                </div>
            ) : (
                <>
                    <header className="header">
                        <h1>{protocol}</h1>
                        <div className="sub-header">(Beckman Coulter GenFind V3 Kit Cat. No. C34880 or C34881)</div>
                        <div className="sample-count">Number of Samples: 48</div>
                    </header>

                    <main className="main-content">
                        <div className="percentage">
                            <div>
                                <span className="number">{progress === 0 ? '0' : progress.toString().padStart(2, '0')}</span>
                                <span className="symbol">%</span>
                            </div>
                            <div className="label">Completed</div>
                        </div>

                        <div className="progress-ring-container">
                            <svg 
                                width="100%" 
                                height="100%" 
                                viewBox={`0 0 ${Math.min(550, window.innerHeight * 0.65)} ${Math.min(550, window.innerHeight * 0.65)}`} 
                                className="progress-ring"
                                preserveAspectRatio="xMidYMid meet"
                            >
                                <circle
                                    cx={Math.min(550, window.innerHeight * 0.65) * 0.5}
                                    cy={Math.min(550, window.innerHeight * 0.65) * 0.5}
                                    r={Math.min(550, window.innerHeight * 0.65) * 0.45}
                                    stroke="#e0e0e0"
                                    strokeWidth="2"
                                    fill="none"
                                    opacity="0.15"
                                />
                                {createProgressLines()}
                                <text 
                                    x={Math.min(550, window.innerHeight * 0.65) * 0.5} 
                                    y={Math.min(550, window.innerHeight * 0.65) * 0.5} 
                                    textAnchor="middle" 
                                    className="time-display"
                                    dy="-1em"
                                >
                                    {`${timeRemaining.hours}:${timeRemaining.minutes}:${timeRemaining.seconds}`}
                                </text>
                                <text 
                                    x={Math.min(550, window.innerHeight * 0.65) * 0.5} 
                                    y={Math.min(550, window.innerHeight * 0.65) * 0.5} 
                                    textAnchor="middle" 
                                    className="time-label"
                                    dy="0"
                                >
                                    Protocol Time
                                </text>
                            </svg>

                            <div className="control-buttons">
                                <button onClick={toggleRunning} disabled={progress >= 100}>
                                    {isRunning ? <PauseFill size={20} /> : <PlayFill size={20} />}
                                </button>
                                <button onClick={handleStop} disabled={!isRunning || progress >= 100}>
                                    <StopFill size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="step-info">
                            <div className="step-label">Step 1:</div>
                            <div className="step-description">
                                Logix Smart Nasopharyngeal/Saliva Covid-19 PCR Prep (Station B)
                            </div>
                        </div>
                    </main>
                </>
            )}
        </div>
    );
};

export default StatusPage;
