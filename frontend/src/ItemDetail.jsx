import React, { useState } from 'react';

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
        <h1>新增訂單</h1>
        <div>
          <label>日期：</label>
          <input
            type="text"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>
        <div>
          <label>數量：</label>
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <div>
          <label>備註：</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
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
    <li>
      <div>
        <span>{item.itemType}</span>&nbsp;&nbsp;&nbsp;
        <span>{item.expiryDate}</span>&nbsp;&nbsp;&nbsp;
        <span>{item.quantity}</span>
      </div>
    </li>
  );
}

function ItemDetail() {
  const [items, setItems] = useState([
    { id: 1, itemType: '進貨日期', expiryDate: '到期日期', quantity: '數量' },
    { id: 2, itemType: '2021.04.29', expiryDate: '2022.03.28', quantity: '499' },
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
      <h1>項目</h1>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button onClick={() => setShowModal(true)}>新增訂單</button>
      </div>
      <ul>
        {items.map((item) => (
          <ListItem key={item.id} item={item} />
        ))}
      </ul>
      {showModal && <AddOrder onSave={addItem} onDelete={() => setShowModal(false)} />}
    </div>
  );
}

export default ItemDetail;
