import { useContext } from "react";

import { AuthContext } from "../context/authContextValue";

const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;
