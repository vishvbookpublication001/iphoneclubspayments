'use client';
import { useState } from 'react';

export default function Home() {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!name || !amount) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, amount }),
      });

      const data = await res.json();

      if (data.paymentUrl) {
        // Direct redirect to Watch Pay QR / Payment page
        window.location.href = data.paymentUrl;
      } else {
        alert(data.message || 'Payment failed');
        setLoading(false);
      }
    } catch (err) {
      alert('Error: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '50px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto' }}>
      <h2>iPhone Clubs Payment</h2>
      <form onSubmit={handlePayment}>
        <div style={{ marginBottom: '15px' }}>
          <label>Customer Name:</label><br />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Enter Amount (₹):</label><br />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px', background: 'blue', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </main>
  );
}