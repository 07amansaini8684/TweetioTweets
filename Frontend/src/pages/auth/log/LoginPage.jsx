import { useState } from "react";
import { Link } from "react-router-dom";

import XSvg from "../../../components/svgs/X";

import { MdOutlineMail } from "react-icons/md";
import { MdPassword } from "react-icons/md";
import { FaUser } from "react-icons/fa";
//tasnstack and react hot toast
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const LoginPage = () => {
	const [formData, setFormData] = useState({
		username: "",
		password: "",
        email: "",
	})
    // using useQueryClient 
    const queryClient = useQueryClient()

    const {mutate, isPending, isError, error} =useMutation({
        mutationFn: async ({username, password,email}) =>{
           try {
             const response = await fetch("/api/auth/login",{
                 method: "POST",
                 headers:{
                     "Content-Type": "application/json",
                 },
                 body : JSON.stringify({email,password,username})
             })
             // getting data from the response
             const data = await response.json()
             // if the response is 200, then we are good to go
             if(!response.ok) {
                throw new Error(data.message || "Failed to login")
             }
             // if the response is 200, then we are good to go
             return data
           } catch (error) {
            /// maiking a toast
            toast.error("Invalid credentials");
            throw error
           }
        },
        onSuccess:()=>{
            toast.success("login successFull")
            // refetch the authuser 
            queryClient.invalidateQueries({queryKey :['authUser']})
        }
    })

	const handleSubmit = (e) => {
		e.preventDefault();
		// console.log(formData);
        mutate(formData);
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	

	return (
		<div className='max-w-screen-xl mx-auto flex h-screen'>
			<div className='flex-1 hidden lg:flex items-center  justify-center'>
				<XSvg className='lg:w-2/3 fill-white' />
			</div>
			<div className='flex-1 flex flex-col justify-center items-center'>
				<form className='flex gap-4 flex-col' onSubmit={handleSubmit}>
					<XSvg className='w-24 lg:hidden fill-white' />
					<h1 className='text-4xl font-extrabold text-white'>{"Let's"} go.</h1>
					<label className='input input-bordered rounded flex items-center gap-2'>
                    <FaUser />
						<input
							type='text'
							className='grow'
							placeholder='username'
							name='username'
							onChange={handleInputChange}
							value={formData.username}
						/>
					</label>
					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdOutlineMail />
						<input
							type='email'
							className='grow'
							placeholder='email'
							name='email'
							onChange={handleInputChange}
							value={formData.email}
						/>
					</label>

					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdPassword />
						<input
							type='password'
							className='grow'
							placeholder='Password'
							name='password'
							onChange={handleInputChange}
							value={formData.password}
						/>
					</label>
					<button className='btn rounded-md btn-primary text-white'>
                        {isPending ? "Loading" : "Login"}
                    </button>
					{isError && <p className='text-red-500'>{error.message}</p>}
				</form>
				<div className='flex flex-col gap-2 mt-4'>
					<p className='text-white text-md'>{"Don't"} have an account?</p>
					<Link to='/signup'>
						<button className='btn rounded-md btn-primary text-white btn-outline w-full'>Sign up</button>
					</Link>
				</div>
			</div>
		</div>
	);
};
export default LoginPage;