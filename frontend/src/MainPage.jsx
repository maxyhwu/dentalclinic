import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import ItemDetail from './ItemDetail';
import './mainpage.css';
import Cookies from 'js-cookie';
import { useAuth } from './AuthContext';

function MainPage() {
  const [groupName, setGroupName] = useState(''); // Initialize as empty string or appropriate default
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [loading, setLoading] = useState(false);
  const { authData, setAuthData } = useAuth();

  const callAnAPI = useCallback(async () => {
    if (!groupName) return; // Avoid calling the API if groupName is not set
    try {
      const chExpUrl = `https://dent-backend-uafs.onrender.com/expiration/checkexp/?group_name=${groupName}`;
      const chExpResponse = await axios.post(chExpUrl);
      console.log(chExpResponse.data); // handle the response data as needed
    } catch (error) {
      console.error('Error calling the expiration check API:', error);
    }
  }, [groupName]);

  useEffect(() => {
    const authDataCookie = Cookies.get('authData');
    if (authDataCookie) {
      const parsedAuthData = JSON.parse(authDataCookie);
      setAuthData(parsedAuthData);
      setGroupName(parsedAuthData.group_name); // Extract and set groupName
    }
  },[setAuthData,setGroupName]);

  useEffect(() => {
    fetchItems();
    callAnAPI();
  }, [callAnAPI]);

  const fetchItems = async () => {
    if (!groupName) return; // Avoid fetching items if groupName is not set
    try {
      const itemUrl = `https://dent-backend-uafs.onrender.com/item?group_name=${groupName}&is_log=false`;
      const itemResponse = await axios.get(itemUrl);

      const nearExpirationUrl = `https://dent-backend-uafs.onrender.com/expiration/days?group_name=${groupName}`;
      const nearExpirationResponse = await axios.get(nearExpirationUrl);

      const lowQuantityUrl = `https://dent-backend-uafs.onrender.com/expiration/quantity?group_name=${groupName}`;
      const lowQuantityResponse = await axios.get(lowQuantityUrl);

      const nearExpirationItems = await Promise.all(
        nearExpirationResponse.data.map(async (item) => {
          const itemDetailUrl = `https://dent-backend-uafs.onrender.com/item?group_name=${groupName}&item_name=${encodeURIComponent(item.item_name)}&is_log=false`;
          const itemDetailResponse = await axios.get(itemDetailUrl);

          return {
            ...itemDetailResponse.data,
            expiration_date: new Date(item.expiration_time * 1000).toLocaleDateString(),
            expiration_time: item.expiration_time,
            isNearExpiration: true,
          };
        })
      );

      const lowQuantityItems = await Promise.all(
        lowQuantityResponse.data.map(async (item) => {
          const itemDetailUrl = `https://dent-backend-uafs.onrender.com/item?group_name=${groupName}&item_name=${encodeURIComponent(item.item_name)}&is_log=false`;
          const itemDetailResponse = await axios.get(itemDetailUrl);

          const logsUrl = `https://dent-backend-uafs.onrender.com/item/logs?group_name=${groupName}&item_name=${encodeURIComponent(item.item_name)}`;
          const logsResponse = await axios.get(logsUrl);

          const expirationDates = logsResponse.data
            .filter(log => log.expiration_date !== null)
            .map((log) => new Date(log.expiration_date * 1000));
          const earliestExpirationDate = expirationDates.length > 0 ? new Date(Math.min(...expirationDates)) : null;

          return {
            ...itemDetailResponse.data,
            expiration_date: earliestExpirationDate ? earliestExpirationDate.toLocaleDateString() : 'N/A',
            expiration_time: earliestExpirationDate ? earliestExpirationDate.getTime() / 1000 : null,
            isLowQuantity: true,
          };
        })
      );

      const itemsWithExpiration = await Promise.all(
        itemResponse.data.map(async (item) => {
          try {
            const logsUrl = `https://dent-backend-uafs.onrender.com/item/logs?group_name=${groupName}&item_name=${encodeURIComponent(item.item_name)}`;
            const logsResponse = await axios.get(logsUrl);

            const expirationDates = logsResponse.data
              .filter(log => log.expiration_date !== null)
              .map((log) => new Date(log.expiration_date * 1000));
            const earliestExpirationDate = expirationDates.length > 0 ? new Date(Math.min(...expirationDates)) : null;

            item.expiration_date = earliestExpirationDate ? earliestExpirationDate.toLocaleDateString() : 'N/A';
            item.expiration_time = earliestExpirationDate ? earliestExpirationDate.getTime() / 1000 : null;
            return item;
          } catch (error) {
            console.error('Error fetching item logs:', error);
            item.expiration_date = 'N/A';
            item.expiration_time = null;
            return item;
          }
        })
      );

      const combinedItems = [
        ...nearExpirationItems,
        ...lowQuantityItems,
        ...itemsWithExpiration.filter(
          (item) =>
            !nearExpirationItems.find((nei) => nei.item_name === item.item_name) &&
            !lowQuantityItems.find((lqi) => lqi.item_name === item.item_name)
        ),
      ];

      const sortedItems = combinedItems.sort((a, b) => {
        if (a.isNearExpiration && b.isNearExpiration) {
          return a.expiration_time - b.expiration_time;
        }
        if (a.isLowQuantity && b.isLowQuantity) {
          return 0;
        }
        if (a.isNearExpiration) {
          return -1;
        }
        if (b.isNearExpiration) {
          return 1;
        }
        if (a.isLowQuantity) {
          return -1;
        }
        if (b.isLowQuantity) {
          return 1;
        }
        return a.expiration_time - b.expiration_time;
      });

      setItems(sortedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const openItemDetailModal = async (item) => {
    setSelectedItem(item);
    setShowAddItemModal(false);
    try {
      const logsUrl = `https://dent-backend-uafs.onrender.com/item/logs?group_name=${groupName}&item_name=${encodeURIComponent(item.item_name)}`;
      const logsResponse = await axios.get(logsUrl);
      setLogs(logsResponse.data);
    } catch (error) {
      console.error('Error fetching item logs:', error);
    }
  };

  const handleAddItem = async () => {
    setLoading(true);
    try {
      const addItemUrl = `https://dent-backend-uafs.onrender.com/item?group_name=${groupName}&item_name=${encodeURIComponent(itemName)}`;
      const response = await axios.post(addItemUrl);
      console.log(response);
      fetchItems();
      setShowAddItemModal(false);
    } catch (error) {
      console.error('Error adding item:', error);
    }
    setLoading(false);
  };

  const handleCloseItemDetail = () => {
    setSelectedItem(null);
    fetchItems();
  };

  return (
    <div>
      <Navbar />
      <h1 style={{ display: 'inline-block' }}>庫存清單</h1>
      <button className="add-order-btn" style={{ float: 'right', marginRight: '20px' }} onClick={() => setShowAddItemModal(true)}>項目 +</button>
      <div className="mylist-container">
        {items.map((item) => (
          <div
            key={item.item_name}
            className="mylist-item"
            onClick={() => openItemDetailModal(item)}
            style={{
              color: item.isNearExpiration ? 'red' : item.isLowQuantity ? 'purple' : 'black',
            }}
          >
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
