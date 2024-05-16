import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MainPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Fetch items from the /item API
    const fetchItems = async () => {
      try {
        const response = await axios.get('https://dent-backend.onrender.com/item', {
          params: {
            group_name: 'test',
            is_log: false,
          },
        });
        const itemsData = response.data;

        // For each item, fetch the logs to get the expiration_date
        const itemsWithExpiration = await Promise.all(
          itemsData.map(async (item) => {
            const logsResponse = await axios.get('https://dent-backend.onrender.com/item/logs', {
              params: {
                group_name: item.group_name,
                item_name: item.item_name,
              },
            });
            const logsData = logsResponse.data;
            const latestLog = logsData.length ? logsData[0] : null;
            const expirationDate = latestLog ? new Date(latestLog.expiration_date * 1000).toLocaleDateString() : 'N/A';

            return {
              ...item,
              expirationDate,
            };
          })
        );

        setItems(itemsWithExpiration);
      } catch (error) {
        console.error('Error fetching items or logs:', error);
      }
    };

    fetchItems();
  }, []);

  return (
    <div>
      <h1>庫存清單</h1>
      <div className="list-container">
        {items.map((item) => (
          <div key={item.item_name} className="list-item">
            <span>{item.item_name}</span>&nbsp;&nbsp;&nbsp;
            <span>{item.expirationDate}</span>&nbsp;&nbsp;&nbsp;
            <span>{item.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MainPage;
