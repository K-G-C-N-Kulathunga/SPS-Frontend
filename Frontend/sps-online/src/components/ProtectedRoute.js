// import React from 'react';
// import { Route, Redirect } from 'react-router-dom';
// import { useUser  } from '../context/UserContext';

// const ProtectedRoute = ({ component: Component, ...rest }) => {
//   const { userRole } = useUser ();

//   return (
//     <Route
//       {...rest}
//       render={props =>
//         userRole ? (
//           <Component {...props} />
//         ) : (
//           <Redirect to="/" />
//         )
//       }
//     />
//   );
// };

// export default ProtectedRoute;