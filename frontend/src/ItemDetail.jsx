import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './itemdetail.css';

function ItemDetail({ groupName, itemName, onClose }) {
  const [logs, setLogs] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isConsumption, setIsConsumption] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [notiQuan, setNotiQuan] = useState('');
  const [notiDays, setNotiDays] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedRestock, setSuggestedRestock] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      const logsUrl = `https://dent-backend-uafs.onrender.com/item/logs?group_name=${groupName}&item_name=${encodeURIComponent(itemName)}`;
      const response = await axios.get(logsUrl);
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching item logs:', error);
    }
  }, [groupName, itemName]);

  const fetchItemDetails = useCallback(async () => {
    try {
      const itemDetailUrl = `https://dent-backend-uafs.onrender.com/item?group_name=${groupName}&item_name=${encodeURIComponent(itemName)}&is_log=false`;
      const response = await axios.get(itemDetailUrl);
      const item = response.data;
      setNotiQuan(item.noti_quan || '');
      setNotiDays(item.noti_days || '');
    } catch (error) {
      console.error('Error fetching item details:', error);
    }
  }, [groupName, itemName]);

  const fetchSuggestedRestock = useCallback(async () => {
    try {
      const response = await axios.get(`https://dent-backend-uafs.onrender.com/item/predict?group_name=${groupName}`);
      const restockData = response.data.find(item => Object.keys(item)[0] === itemName);
      if (restockData) {
        setSuggestedRestock(Object.values(restockData)[0]);
      }
    } catch (error) {
      console.error('Error fetching suggested restock:', error);
    }
  }, [groupName, itemName]);

  useEffect(() => {
    fetchLogs();
    fetchItemDetails();
    fetchSuggestedRestock();
  }, [fetchLogs, fetchItemDetails, fetchSuggestedRestock]);

  const handleOrderClick = (e, isConsumption = false) => {
    e.stopPropagation();
    setIsConsumption(isConsumption);
    setShowOrderModal(true);
  };

  const handleSaveOrder = async () => {
    setLoading(true);
    try {
      let url = `https://dent-backend-uafs.onrender.com/item/update?group_name=${groupName}&item_name=${encodeURIComponent(itemName)}&user_name=chuan&quantity=${quantity * (isConsumption ? -1 : 1)}`;
      if (!isConsumption) {
        url += `&expiration_date=${expirationDate ? new Date(expirationDate).getTime() / 1000 : ''}&note=${note}`;
      }
      const response = await axios.post(url);
      console.log(response.data);
      fetchLogs();
    } catch (error) {
      console.error('Error updating item:', error);
    } finally {
      setLoading(false);
      setShowOrderModal(false);
      setQuantity('');
      setNote('');
      setExpirationDate('');
    }
  };

  const handleSaveNotification = async () => {
    try {
      const url = `https://dent-backend-uafs.onrender.com/item/set?group_name=${groupName}&item_name=${encodeURIComponent(itemName)}&noti_quan=${notiQuan}&noti_days=${notiDays}`;
      const response = await axios.post(url);
      console.log(response.data);
    } catch (error) {
      console.error('Error setting notification:', error);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}></div>
      <div className="fixed inset-0 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl relative z-50" onClick={(e) => e.stopPropagation()}>
          <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={onClose}>&times;</button>
          <div className="flex justify-between mb-4">
            <button className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700" onClick={(e) => handleOrderClick(e, false)}>進貨 +</button>
            <button className="bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-red-700" onClick={(e) => handleOrderClick(e, true)}>消耗 -</button>
          </div>
          <h1 className="text-2xl font-bold mb-4">{itemName}</h1>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">庫存通知數量：</label>
            <input
              type="number"
              value={notiQuan}
              onChange={(e) => setNotiQuan(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">庫存通知時間：</label>
            <input
              type="number"
              value={notiDays}
              onChange={(e) => setNotiDays(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">建議進貨量：</label>
            <span className="block text-gray-900">{Math.floor(suggestedRestock)}</span>
          </div>
          <div className="text-right mb-4">
            <button className="bg-green-500 text-white font-semibold py-2 px-4 rounded hover:bg-green-700" onClick={handleSaveNotification} disabled={loading}>
              {loading ? '處理中...' : '儲存通知設定'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Create Time</th>
                  <th className="border px-4 py-2">Expiration Date</th>
                  <th className="border px-4 py-2">Remain Quantity</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  log.expiration_date !== null && log.remain_quan !== 0 && (
                    <React.Fragment key={index}>
                      <tr>
                        <td className="border px-4 py-2">{new Date(log.create_time * 1000).toLocaleDateString()}</td>
                        <td className="border px-4 py-2">{new Date(log.expiration_date * 1000).toLocaleDateString()}</td>
                        <td className="border px-4 py-2">{log.remain_quan}</td>
                      </tr>
                      {log.note !== "" && (
                        <tr key={`${index}-note`}>
                          <td className="border px-4 py-2" colSpan="3" style={{ whiteSpace: 'nowrap' }}>備註：{log.note}</td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showOrderModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={() => setShowOrderModal(false)}></div>
          <div className="fixed inset-0 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md relative z-50">
              <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={() => setShowOrderModal(false)}>&times;</button>
              <h1 className="text-2xl font-bold mb-4">{isConsumption ? '消耗' : '進貨'}</h1>
              <div className="mb-4">
                <label className="block text-gray-500 mb-2">數量：</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              {!isConsumption && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">到期日期：</label>
                    <input
                      type="date"
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">備註：</label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                </>
              )}
              <div className="text-right">
                <button className="bg-green-500 text-white font-semibold py-2 px-4 rounded hover:bg-green-700" onClick={handleSaveOrder} disabled={!quantity || loading}>
                  {loading ? '處理中...' : '儲存'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default ItemDetail;
