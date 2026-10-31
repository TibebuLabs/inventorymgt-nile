// import { useState } from "react";
// import { Input, Button, Typography } from "@material-tailwind/react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import HttpNetworkService from "../../services/network";

// export const SignIn = () => {
//   const [email, setEmail] = useState<string>("");
//   const [password, setPassword] = useState<string>("");
//   const [error, setError] = useState<string>("");
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const prefs = { getString: (key: string) => localStorage.getItem(key) || "" };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const httpService = new HttpNetworkService(prefs);
//       const response = await httpService.post<{ token: string }>("/login", { email, password }, true);
      
//       console.log("Login response:", response); // Debugging

//       if (response.token) {
//         login(response.token);
//         navigate("/dashboard");
//       } else {
//         setError("Invalid credentials");
//       }
//     } catch (err) {
//       setError("Invalid credentials");
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-white">
//       <div className="p-8 bg-white rounded-xl shadow-2xl w-full max-w-md">
//         <h2 className="text-center text-3xl font-extrabold text-gray-800 mb-6">Sign In</h2>
//         <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
//               Email Address
//             </label>
//             <Input
//               id="email"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-600 focus:outline-none transition duration-200"
//               placeholder="Enter your email" onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} crossOrigin={undefined}            />
//           </div>
          
//           <div className="mb-4">
//             <label className="block text-gray-700 font-medium mb-2" htmlFor="password">
//               Password
//             </label>
//             <Input
//               id="password"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-600 focus:outline-none transition duration-200"
//               placeholder="Enter your password" onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} crossOrigin={undefined}            />
//           </div>

//           <Button type="submit" fullWidth className="py-3 bg-indigo-600 text-white hover:bg-indigo-700 transition duration-300"  placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
//             Sign In
//           </Button>
//         </form>

//         {error && <div className="mt-4 text-red-500 text-center">{error}</div>}

//         <div className="mt-6 text-center">
//           <Typography variant="small" className="text-gray-600"  placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
//             Don't have an account?{" "}
//             <Link to="/auth/sign-up" className="text-indigo-600 hover:underline">
//               Sign up
//             </Link>
//           </Typography>
//         </div>
//       </div>
//     </div>
//   );
// };
