import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function AddOrder({ onSave, onDelete }) {
  const [itemType, setItemType] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');

  const handleSave = () => {
    const newItem = {
      itemType,
      expiryDate,
      quantity,
      note,
    };
    onSave(newItem);
    setItemType('');
    setExpiryDate('');
    setQuantity('');
    setNote('');
  };

  const handleDelete = () => {
    onDelete();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={handleDelete}>&times;</span>
        <h1>新增項目</h1>
        <div>
          <label>項目名稱：</label>
          <input
            type="text"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>
        <div style={{ textAlign: 'right' }}>
          <button onClick={handleSave}>儲存</button>
        </div>
      </div>
    </div>
  );
}

function ListItem({ item }) {
  return (
    <Link to="/item-detail" style={{ textDecoration: 'none' }}>
      <div className="list-item">
        <span>{item.itemType}</span>&nbsp;&nbsp;&nbsp;
        <span>{item.expiryDate}</span>&nbsp;&nbsp;&nbsp;
        <span>{item.quantity}</span>
      </div>
    </Link>
  );
}

function MainPage() {
  const [items, setItems] = useState([
    { id: 1, itemType: '物品種類', expiryDate: '到期日', quantity: '數量' },
    { id: 2, itemType: '即期物品', expiryDate: '2022.03.28', quantity: '499' },
  ]);

  const [showModal, setShowModal] = useState(false);

  const addItem = (newItem) => {
    setItems([...items, { id: items.length + 1, ...newItem }]);
    setShowModal(false);
  };

  const deleteItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div>
      <h1>庫存清單</h1>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button onClick={() => setShowModal(true)}>新增項目</button>
      </div>
      <div className="list-container">
        {items.map((item) => (
          <Link key={item.id} to="/item-detail" style={{ textDecoration: 'none' }}>
            <div className="list-item">
              <span>{item.itemType}</span>&nbsp;&nbsp;&nbsp;
              <span>{item.expiryDate}</span>&nbsp;&nbsp;&nbsp;
              <span>{item.quantity}</span>
            </div>
          </Link>
        ))}
      </div>
      {showModal && <AddOrder onSave={addItem} onDelete={() => setShowModal(false)} />}
    </div>
  );
}

export default MainPage;
