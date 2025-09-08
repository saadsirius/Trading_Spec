import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTrades = async () => {
            try {
                const response = await axios.get('/api/trades');
                setTrades(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTrades();
    }, []);

    if (loading) {
        return <div>Loading trades...</div>;
    }

    if (error) {
        return <div>Error fetching trades: {error.message}</div>;
    }

    return (
        <div className="dashboard">
            <h1>Trade Dashboard</h1>
            <table className="trade-table">
                <thead>
                    <tr>
                        <th>Trade ID</th>
                        <th>Symbol</th>
                        <th>Quantity</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {trades.map(trade => (
                        <tr key={trade.id}>
                            <td>{trade.id}</td>
                            <td>{trade.symbol}</td>
                            <td>{trade.quantity}</td>
                            <td>{new Date(trade.timestamp).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Dashboard;