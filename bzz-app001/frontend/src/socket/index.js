import { API_BASE_URL } from "@/config/serverApiConfig";
import * as io from "socket.io-client";

const socket = io(API_BASE_URL.slice(0, -5), {
  secure: true,
  rejectUnauthorized: false,
});


export default socket
