import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import Navbar from './Navbar';

function UserPage() {
  const showToggle = true;
  const [status, setStatus] = useState(true);
  const [admin, setAdmin] = useState({'group_name': '', 'user_name': '', 'password': ''});
  const user = { 'group_name': 'TEST', 'user_name': 'test_admin', 'password': 'test_admin' };
  const [showAdminPassword,setShowAdminPassword] = useState(false);
  const [newMemberName,setNewMemberName] = useState('');
  const [newMemberPassword,setNewMemberPassword] = useState('');
  const [members,setMembers] = useState([]);
  const [modalIsOpen,setModalIsOpen] = useState(false);
  const [newNameExisted, setNewNameExisted] = useState(false);

  //const api = "http://localhost:27017"
  const api = "https://dent-backend.onrender.com";

  const addAdmin = () => {
    console.log('admin:', admin);
    fetch(`${api}/user/add_admin/?group_name=${admin.group_name}&user_name=${admin.user_name}&password=${admin.password}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      console.log('Status Code:',response.status);

      if(!response.ok) {
        return response.json().then(errorData => {
          console.error('Error message:', errorData.message);
          throw new Error('Failed to add admin');
        });
      }

      return response.json(); // This returns a promise
    })
    .then(data => {
      console.log('Response Data:',JSON.stringify(data));
    })
    .catch(error => {
      console.error('Error adding admin:',error);
    });
  };


  useEffect(() => {
    fetch(`${api}/user/?group_name=${admin.group_name}`)
      .then(response => {
        if(!response.ok) {
          throw new Error('Failed to fetch group');
        }
        return response.json();
      })
      .then(data => {
        const updatedMembers = data.filter(user => !user.is_admin).map((user, index) => ({ ...user, id: index + 1, password_visibility: false}));
        setMembers(updatedMembers);
        console.log('effect members:',members);
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
    if (members.length !== 0) {
        if (members.some(member => member.user_name === newMemberName)) {
          setNewNameExisted(true);
        }
        while (newNameExisted) {
          if (!members.some(member => member.user_name === newMemberName)) {
            setNewNameExisted(false);
          }
        };
    };
    fetch(`${api}/user/add_member/?group_name=${admin.group_name}&user_name=${admin.user_name}&password=${admin.password}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if(!response.ok) {
          throw new Error('Failed to add new member');
        }
        setNewMemberName('');
        setNewMemberPassword('');
        return fetch(`${api}/user/?group_name=${admin.group_name}`);
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
    fetch(`${api}/user/?group_name=${user.group_name}&user_name=${user.user_name}`,{
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if(!response.ok) {
          throw new Error('Failed to delete user');
        }
        return fetch(`${api}/user/?group_name=${admin.group_name}`);
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
    <>
      { showToggle && <button onClick={() => setStatus(!status)}>Toggle Status</button> }
      { status &&
        <>
        <h1 className='font-bold bg-black text-white'>Welcome, IM Island!</h1>
          <h2>Add Group</h2>
          <label>Group Name: </label>
          <input type="text" value={ admin.group_name } onChange={(e) => setAdmin({...admin, group_name:e.target.value})} /><br />
          <label>Name: </label>
          <input type="text" value={ admin.user_name } onChange={(e) => setAdmin({...admin,user_name: e.target.value})} /><br />
          <label>Password: </label>
          <input type="password" value={ admin.password } onChange={(e) => setAdmin({...admin,password: e.target.value})} /><br />
          <button onClick={ addAdmin }>Save</button>
        </>}
      { !status &&
      <>
        <Navbar />
        { console.log('members:',members) }
        <h1>Welcome, { user.group_name }!</h1>
        <div className='admin'>
          <p>Username: { user.user_name }</p>
          <p>Password: { showAdminPassword ? user.password : '********' }</p>
          <button onClick={ toggleAdminPasswordVisibility }>
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
            <button onClick={ toggleMemberPasswordVisibility }>
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
          <input type="text" value={ newMemberName } onChange={(e) => setNewMemberName(e.target.value)} /><br />
          { newNameExisted && <p>Name already exists. Please Enter a new name.</p> }
          <label>Password: </label>
          <input type="password" value={ newMemberPassword } onChange={(e) => setNewMemberPassword(e.target.value)} /><br />
          <button onClick={ handleSaveNewMember }>Save</button>
        </Modal>
      </>}
    </>
  );
}

export default UserPage;
