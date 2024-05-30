import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import Navbar from './Navbar';
import Cookies from 'js-cookie';


function UserPage() {
  const [authPassword, setAuthPassword] = useState('');
  const [admin, setAdmin] = useState({'group_name': '', 'user_name': '', 'password': ''});
  const [addAdminText, setAddAdminText] = useState('');
  const [showAdminPassword,setShowAdminPassword] = useState(false);
  const [newMemberName,setNewMemberName] = useState('');
  const [newMemberPassword,setNewMemberPassword] = useState('');
  const [members,setMembers] = useState([]);
  const [modalIsOpen,setModalIsOpen] = useState(false);
  const [newNameExisted, setNewNameExisted] = useState(false);
  const [membersFolded, setMembersFolded] = useState(true);
  const [authData,setAuthData] = useState({});
  const [showToggle,setShowToggle] = useState(false);
  const [status,setStatus] = useState(false);
  const [memberVisibilities,setMemberVisibilities] = useState({});

  useEffect(() => {
    const authDataCookie = Cookies.get('authData');
    if(authDataCookie) {
      setAuthData(JSON.parse(authDataCookie));
      setShowToggle(JSON.parse(authDataCookie).group_name === 'ADMIN');
      setStatus(JSON.parse(authDataCookie).group_name === 'ADMIN');
    }
  },[]);

  useEffect(() => {
    if(authData.group_name) {
      getMemberList();
    }
  },[authData]);

  const api = "https://dent-backend-uafs.onrender.com";

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
      setAddAdminText(response.status === 200 ? `Group ${admin.group_name} and Admin ${admin.user_name} added successfully.` : 'Failed to add admin.');

      if (response.ok) {
        setAdmin({'group_name': '', 'user_name': '', 'password': ''});
      } else {
        return response.json().then(errorData => {
          console.error('Error message:', errorData.message);
          throw new Error('Failed to add admin');
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Response Data:',JSON.stringify(data));
    })
    .catch(error => {
      console.error('Error adding admin:',error);
    });
    setTimeout(() => {
      setAddAdminText('');
    },5000);
  };

  const toggleAdminPasswordVisibility = () => {
    setShowAdminPassword(!showAdminPassword);
  };

  const toggleMemberPasswordVisibility = (id) => {
    setMemberVisibilities(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };

  const getMemberList = () => {
    console.log('authData:',authData);
    fetch(`${api}/user/?group_name=${authData.group_name}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        const updatedMembers = data.map((user,index) => ({...user,id: index}));
        setMembers(updatedMembers);
      })
      .catch(error => {
        console.error('Error fetching member list:',error);
      });
  };

  const handleSaveNewMember = () => {
    if (members.length !== 0) {
      if (members.some(member => member.user_name === newMemberName)) {
        setNewNameExisted(true);
        return;
      } else {
        setNewNameExisted(false);
      }
    }
    fetch(`${api}/user/add_member/?group_name=${authData.group_name}&user_name=${newMemberName}&password=${newMemberPassword}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if(!response.ok) {
          throw new Error('Failed to add new member');
        }
      })
      .catch(error => {
        console.error('Error adding new member:',error);
      });

    getMemberList();
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
        return response.json();
      })
      .then(() => {
        getMemberList();
      })
      .catch(error => {
        console.error('Error deleting user:',error);
      });
  };

  useEffect(() => {
    if(members.length > 0) {
      const currentUser = members.find(member => member.user_name === authData.username);
      if(currentUser) {
        setAuthPassword(currentUser.password);
      }
    }
  },[members,authData]);

  return (
    <>
      <Navbar />
      { status &&
        <>
          <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            <h1 className="text-4xl mb-8 font-semibold">Welcome, IM Island!</h1>
            <div className="bg-gray-50 p-8 rounded-lg shadow-md border border-gray-300">
            <h2 className="text-2xl mb-4 font-semibold">Add Group</h2>
              <label className="block mb-2">Group Name: </label>
              <input
                type="text"
                value={admin.group_name}
                onChange={(e) => setAdmin({...admin,group_name: e.target.value})}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              />
              <label className="block mb-2">Admin Name: </label>
              <input
                type="text"
                value={admin.user_name}
                onChange={(e) => setAdmin({...admin,user_name: e.target.value})}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              />
              <label className="block mb-2">Password: </label>
              <input
                type="password"
                value={admin.password}
                onChange={(e) => setAdmin({...admin,password: e.target.value})}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              />
              <button
                className="bg-blue-500 hover:bg-blue-700 font-semibold text-white py-2 px-4 border hover:border-blue-500 hover:border-transparent rounded w-full"
                onClick={addAdmin}
              >
                Save
              </button>
              {addAdminText && <p className="text-red-500 mt-4">{addAdminText}</p>}
            </div>
          </div>
        </>
}
      { !status &&
        <>
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-4xl mb-8 font-semibold">Welcome, {authData.group_name}!</h1>
            <div className="p-6 rounded-lg w-full max-w-4xl">
              <div className="bg-gray-50 p-4 rounded-lg shadow-md mb-6">
                <h2 className="text-2xl mb-4 font-semibold">Admin</h2>
                <p className="text-lg">Username: {authData.username}</p>
                <p className="text-lg">Password: {showAdminPassword ? authPassword : '********'}</p>
                <div className="flex justify-end mt-2">
                  <button className='hover:bg-blue-700 bg-blue-500 font-semibold text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded ml-2' onClick={toggleAdminPasswordVisibility}>
                    {showAdminPassword ? 'Hide Password' : 'Show Password'}
                  </button>
                  <button className='bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 border border-blue-500 hover:border-transparent rounded ml-2' onClick={() => setModalIsOpen(true)}>
                    Add Member
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">Members</h2>
                  <button className="text-blue-500 font-semibold" onClick={() => {setMembersFolded(!membersFolded)}}>
                    {membersFolded ? 'Expand' : 'Fold'}
                  </button>
                </div>
                {!membersFolded &&
                <>
                {members.filter(member => !member.is_admin).map(member => (
                    <div key={member.id} className="mb-4 p-4 bg-white rounded-lg shadow-md">
                      <p className="text-lg">Name: {member.user_name}</p>
                      <p className="text-lg">Password: {memberVisibilities[member.id] ? member.password : '********'}</p>
                      <div className="flex justify-end mt-2">
                        <button
                          className='hover:bg-blue-700 bg-blue-500 font-semibold text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded ml-2'
                          onClick={() => toggleMemberPasswordVisibility(member.id)}
                        >
                          {memberVisibilities[member.id] ? 'Hide Password' : 'Show Password'}
                        </button>
                        {member.id !== 0 && (
                          <button
                            className='bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded ml-2'
                            onClick={() => handleDeleteMember(member.id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </>}
              </div>
            </div>
          </div>
          <Modal
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
          >
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
              <div className="flex justify-end">
                <button className="text-red-500 font-semibold" onClick={() => setModalIsOpen(false)}>Close</button>
              </div>
              <h2 className="text-2xl mb-4">Add Member</h2>
              <label className="block text-gray-700 text-sm font-bold mb-2">Name: </label>
              <input
                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
              /><br />
              {newNameExisted && <p className="text-red-500">Name already exists. Please enter a new name.</p>}
              <label className="block text-gray-700 text-sm font-bold mb-2">Password: </label>
              <input
                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                type="password"
                value={newMemberPassword}
                onChange={(e) => setNewMemberPassword(e.target.value)}
              /><br />
              <button
                className='bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded w-full mt-4'
                onClick={handleSaveNewMember}
              >
                Save
              </button>
            </div>
          </Modal>
        </>

}
      <div>
        {showToggle && <button className="fixed bottom-4 left-4 bg-red-500 text-white font-semibold py-2 px-4 rounded border hover:bg-white hover:text-red-500 hover:border-red-500" onClick={() => setStatus(!status)}>Toggle Status</button>}
      </div>
    </>
  );
}

export default UserPage;
