import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import ItemDetail from './ItemDetail';
import Cookies from 'js-cookie';
import { useAuth } from './AuthContext';

function MainPage() {
  const [groupName, setGroupName] = useState('');
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [loading, setLoading] = useState(false);
  const { authData, setAuthData } = useAuth();

  const callAnAPI = useCallback(async () => {
    if (!groupName) return;
    try {
      const chExpUrl = `https://dent-backend-uafs.onrender.com/expiration/checkexp/?group_name=${groupName}`;
      const chExpResponse = await axios.post(chExpUrl);
      console.log(chExpResponse.data);
    } catch (error) {
      console.error('Error calling the expiration check API:', error);
    }
  }, [groupName]);

  useEffect(() => {
    const authDataCookie = Cookies.get('authData');
    if (authDataCookie) {
      const parsedAuthData = JSON.parse(authDataCookie);
      setAuthData(parsedAuthData);
      setGroupName(parsedAuthData.group_name);
    }
  }, [setAuthData, setGroupName]);

  useEffect(() => {
    fetchItems();
    callAnAPI();
  }, [callAnAPI]);

  const fetchItems = async () => {
    if (!groupName) return;
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
            .filter(log => log.expiration_date !== null && log.remain_quan > 0) // 忽略 remain_quan 等於 0 的記錄
            .map(log => new Date(log.expiration_date * 1000));
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
              .filter(log => log.expiration_date !== null && log.remain_quan > 0) // 忽略 remain_quan 等於 0 的記錄
              .map(log => new Date(log.expiration_date * 1000));
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
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <h1 className="text-4xl mb-8 font-semibold">庫存清單</h1>
        <div className="bg-gray-50 p-8 rounded-lg shadow-md border border-gray-300 w-full max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Items</h2>
            <button className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700" onClick={() => setShowAddItemModal(true)}>Add Item</button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {items.map((item) => (
              <div
                key={item.item_name}
                className={`p-4 rounded-lg shadow-md cursor-pointer ${item.isNearExpiration ? 'bg-red-100' : item.isLowQuantity ? 'bg-purple-100' : 'bg-white'}`}
                onClick={() => openItemDetailModal(item)}
              >
                <div className="grid grid-cols-3 items-center">
                  <span className="text-lg font-semibold">{item.item_name}</span>
                  <span className="text-center">{item.expiration_date}</span>
                  <span className="text-right">{item.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAddItemModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <div className="flex justify-end">
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowAddItemModal(false)}
              >
                Close
              </button>
            </div>
            <h2 className="text-xl font-semibold mb-4">Add Item</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Item Name</label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <button
              className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700"
              onClick={handleAddItem}
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {selectedItem && (
        <ItemDetail
          groupName={groupName}
          itemName={selectedItem.item_name}
          onClose={handleCloseItemDetail}
        />
      )}
    </>
  );
}

export default MainPage;
