import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const monthMapping = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

const TransactionsTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [month, setMonth] = useState('March');
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    const numericMonth = monthMapping[month];
    setLoading(true);

    try {
      const response = await axios.get('http://localhost:5000/api/transactions', {
        params: { page, perPage, search, month: numericMonth },
      });
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [search, page, month, perPage]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <div>
      <h2>Transactions for {month}</h2>
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by title, description, price..."
      />
      <select value={month} onChange={e => setMonth(e.target.value)}>
        {Object.keys(monthMapping).map((monthName) => (
          <option key={monthName} value={monthName}>{monthName}</option>
        ))}
      </select>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Price</th>
              <th>Sold</th>
              <th>Date of Sale</th>
            </tr>
          </thead>
          <tbody>
            {(transactions || []).length > 0 ? (
              (transactions || []).map(transaction => (
                <tr key={transaction._id}>
                  <td>{transaction.title}</td>
                  <td>{transaction.description}</td>
                  <td>{transaction.price}</td>
                  <td>{transaction.sold ? 'Yes' : 'No'}</td>
                  <td>{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <button onClick={() => setPage(page - 1)} disabled={page === 1}>
        Previous
      </button>
      <button onClick={() => setPage(page + 1)} disabled={transactions.length < perPage}>
        Next
      </button>
    </div>
  );
};

export default TransactionsTable;
