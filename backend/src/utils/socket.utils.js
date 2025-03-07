import  {userSocketIDs}  from '../../app.js';

const getSockets = async (users= [])=>{
    const sockets = users.map(user => { userSocketIDs.get(""+user._id) });
    return sockets;
}

export { getSockets };