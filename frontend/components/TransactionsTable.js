import React from 'react';

const TransactionTable = ({ transactions, loading }) => {
  return (
    <>
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
              transactions.map(transaction => (
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
    </>
  );
};

export default TransactionTable;
