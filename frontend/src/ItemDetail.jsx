import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function ItemDetail({ groupName, itemName, onClose }) {
  const [logs, setLogs] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      const response = await axios.get('https://dent-backend.onrender.com/item/logs', {
        params: {
          group_name: groupName,
          item_name: itemName,
        },
      });
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching item logs:', error);
    }
  }, [groupName, itemName]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleOrderClick = (e) => {
    e.stopPropagation(); // 阻止點擊事件向上傳遞
    setShowOrderModal(true);
  };

  const handleSaveOrder = async () => {
    setLoading(true);
    try {
      const url = `https://dent-backend.onrender.com/item/update?group_name=${groupName}&item_name=${itemName}&user_name=chuan&quantity=${quantity}&expiration_date=${expirationDate ? new Date(expirationDate).getTime() / 1000 : ''}&note=${note}`;
      const response = await axios.post(url);
      console.log(response.data);
      fetchLogs();
    } catch (error) {
      console.error('Error updating item:', error);
    } finally {
      setLoading(false);
      setShowOrderModal(false); // Close the purchase modal after saving
    }
  };

  return (
    <div className="modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={onClose}>&times;</span>
        <button className="add-order-btn" onClick={handleOrderClick}>進貨 +</button>
        <h1 className="text-center text-2xl font-bold mb-4">Item Detail - {itemName}</h1>
        <div className="logs-container">
          <table className="w-full">
            <thead>
              <tr>
                <th className="border px-4 py-2">Create Time</th>
                <th className="border px-4 py-2">Expiration Date</th>
                <th className="border px-4 py-2">Remain Quantity</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showOrderModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowOrderModal(false)}>&times;</span>
            <h1>進貨</h1>
            <div>
              <label>數量：</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div>
              <label>到期日期：</label>
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
              />
            </div>
            <div>
              <label>備註：</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div style={{ textAlign: 'right' }}>
              <button disabled={!quantity || loading} onClick={handleSaveOrder}>
                {loading ? '處理中...' : '儲存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemDetail;

