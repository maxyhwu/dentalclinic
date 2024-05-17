import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import ItemDetail from './ItemDetail';
import './mainpage.css';

function MainPage() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch items from the /item API
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get('https://dent-backend.onrender.com/item', {
        params: {
          group_name: 'test',
          is_log: false,
        },
      });
      // Fetch logs for each item to get expiration dates
      const itemsWithExpiration = await Promise.all(response.data.map(async (item) => {
        try {
          const logsResponse = await axios.get('https://dent-backend.onrender.com/item/logs', {
            params: {
              group_name: item.group_name,
              item_name: item.item_name,
            },
          });
          const expirationDates = logsResponse.data.map(log => new Date(log.expiration_date * 1000));
          const earliestExpirationDate = new Date(Math.min(...expirationDates));
          item.expiration_date = earliestExpirationDate.toLocaleDateString();
          return item;
        } catch (error) {
          console.error('Error fetching item logs:', error);
        }
      }));
      setItems(itemsWithExpiration);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const openItemDetailModal = async (item) => {
    setSelectedItem(item);
    setShowAddItemModal(false);
    try {
      const logsResponse = await axios.get('https://dent-backend.onrender.com/item/logs', {
        params: {
          group_name: item.group_name,
          item_name: item.item_name,
        },
      });
      setLogs(logsResponse.data);
    } catch (error) {
      console.error('Error fetching item logs:', error);
    }
  };

  const handleAddItem = async () => {
    setLoading(true);
    try {
      // Send a POST request to add the new item
      const url = `https://dent-backend.onrender.com/item?group_name=test&item_name=${itemName}`;
      const response = await axios.post(url);
      console.log(response);
      // Update the items list
      fetchItems();
      setShowAddItemModal(false);
    } catch (error) {
      console.error('Error adding item:', error);
    }
    setLoading(false);
  };

  const handleCloseItemDetail = () => {
    setSelectedItem(null);
    fetchItems(); // Reload items
  };

  return (
    <div>
      <Navbar />
      <h1 style={{ display: 'inline-block' }}>庫存清單</h1>
      <button className="add-order-btn" style={{ float: 'right', marginRight: '20px' }} onClick={() => setShowAddItemModal(true)}>項目 +</button>
      <div className="list-container">
        {items.map((item) => (
          <div key={item.item_name} className="list-item" onClick={() => openItemDetailModal(item)}>
            <span>{item.item_name}</span>&nbsp;&nbsp;&nbsp;
            <span>{item.expiration_date}</span>&nbsp;&nbsp;&nbsp;
            <span>{item.quantity}</span>
          </div>
        ))}
      </div>
      {showAddItemModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowAddItemModal(false)}>&times;</span>
            <h1>新增項目</h1>
            <div>
              <label>項目名稱：</label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </div>
            <div style={{ textAlign: 'right' }}>
              <button disabled={!itemName || loading} onClick={handleAddItem}>
                {loading ? '處理中...' : '新增'}
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedItem && (
        <ItemDetail
          groupName={selectedItem.group_name}
          itemName={selectedItem.item_name}
          logs={logs}
          onClose={handleCloseItemDetail}
        />
      )}
      {(showAddItemModal || selectedItem) && <div className="modal-backdrop" onClick={() => setShowAddItemModal(false)}></div>}
    </div>
  );
}

export default MainPage;
