import { io } from "socket.io-client";

const URL = process.env.REACT_APP_SOCKET_ENDPOINT;
const socket = io(URL, { autoConnect: false });

export default socket;