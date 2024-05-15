import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import Navbar from './Navbar';

function UserPage() {
  const groupName = 'Test Group';
  const admin = {'groupName': {groupName}, 'user_name': 'admin', 'user_password': 'admin', 'is_admin': true};
  const [showAdminPassword,setShowAdminPassword] = useState(false);
  const [newMemberName,setNewMemberName] = useState('');
  const [newMemberPassword,setNewMemberPassword] = useState('');
  const [members,setMembers] = useState([]);
  const [modalIsOpen,setModalIsOpen] = useState(false);
  const [selectedUserName,setSelectedUserName] = useState('');
  const [selectedUserPassword,setSelectedUserPassword] = useState('');
  const [newNameExisted, setNewNameExisted] = useState(false);

  const api = "http://localhost:27017"

  useEffect(() => {
    fetch(`${api}/user/?group_name=${groupName}`)
      .then(response => {
        if(!response.ok) {
          throw new Error('Failed to fetch group');
        }
        return response.json();
      })
      .then(data => {
        const updatedMembers = data.filter(user => !user.is_admin).map((user, index) => ({ ...user, id: index + 1, password_visibility: false}));
        setMembers(updatedMembers);
      })
      .catch(error => {
        console.error('Error fetching group:', error);
      });
  },[]);

  const toggleAdminPasswordVisibility = () => {
    setShowAdminPassword(!showAdminPassword);
  };

  const toggleMemberPasswordVisibility = (id) => {
    const updatedMembers = members.map(member => {
      if(member.id === id) {
        return { ...member, password_visibility: !member.password_visibility };
      }
      return member;
    });
    setMembers(updatedMembers);
  }

  const handleAddMember = () => {
    setModalIsOpen(true);
    if (members.some(member => member.user_name === selectedUserName)) {
      setNewNameExisted(true);
    }
    while(newNameExisted) {
      if (!members.some(member => member.user_name === selectedUserName)) {
        setNewNameExisted(false);
      }
    };
    fetch('${api}/user/add_member', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        group_name: groupName,
        user_name: newMemberName,
        password: newMemberPassword,
      }),
    })
      .then(response => {
        if(!response.ok) {
          throw new Error('Failed to add new member');
        }
        setNewMemberName('');
        setNewMemberPassword('');
        return fetch(`${api}/user/?group_name=${groupName}`);
      })
      .then(response => response.json())
      .then(data => {
        const updatedMembers = data.filter(user => !user.is_admin).map((user,index) => ({...user,id: index + 1, password_visibility: false}));
        setMembers(updatedMembers);
      })
      .catch(error => {
        console.error('Error adding new member:',error);
      });
      handleSaveNewMember();
  };

  const handleSaveNewMember = () => {
    setNewMemberName('');
    setNewMemberPassword('');
    setModalIsOpen(false);
  };

  const handleDeleteMember = (id) => {
    const user = members.find(member => member.id === id);
    fetch('${api}/user',{
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        group_name: user.group_name,
        user_name: user.user_name,
      }),
    })
      .then(response => {
        if(!response.ok) {
          throw new Error('Failed to delete user');
        }
        return fetch(`${api}/user/?group_name=${groupName}`);
      })
      .then(response => response.json())
      .then(data => {
        const updatedMembers = data.filter(user => !user.is_admin).map((user,index) => ({...user,id: index + 1, password_visibility: false}));
        setMembers(updatedMembers);
      })
      .catch(error => {
        console.error('Error deleting user:',error);
      });
  };

  return (
    <div>
      <Navbar />
      <h1>Welcome, { groupName }!</h1>
      <div className='admin'>
        <p>Username: { admin.user_name }</p>
        <p>Password: { showAdminPassword ? admin.user_password : '********' }</p>
        <button onClick={toggleAdminPasswordVisibility}>
          { showAdminPassword ? 'Hide Password' : 'Show Password' }
        </button>
        <br />
        <button onClick={ handleAddMember }>Add Member</button>
      </div>
      <div className='member'>
      { members.map(member => (
        <div key={ member.id }>
          <h2>Member Info</h2>
          <p>Name: { member.user_name }</p>
          <p>Password: { member.password_visibility ? member.user_password : '********' }</p>
          <button onClick={toggleMemberPasswordVisibility}>
            { member.password_visibility ? 'Hide Password' : 'Show Password' }
          </button>
          { member.id !== 0 && (
            <button onClick={() => handleDeleteMember(member.id)}>Delete</button>
          )}
        </div>
      ))}
      </div>
      <Modal isOpen={ modalIsOpen } onRequestClose={() => setModalIsOpen(false)}>
        <h2>Add Member</h2>
        <label>Name: </label>
        <input type="text" value={ selectedUserName } onChange={(e) => setSelectedUserName(e.target.value)} /><br />
        { newNameExisted && <p>Name already exists. Please Enter a new name.</p> }
        <label>Password: </label>
        <input type="password" value={ selectedUserPassword } onChange={(e) => setSelectedUserPassword(e.target.value)} /><br />
        <button onClick={ handleSaveNewMember }>Save</button>
      </Modal>
    </div>
  );
}

export default UserPage;
