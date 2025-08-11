import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../contexts/AuthContext";
import {
  FiEye,
  FiEyeOff,
  FiMail,
  FiLock,
  FiUser,
  FiPhone,
} from "react-icons/fi";
import LoadingSpinner from "../../components/UI/LoadingSpinner";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    const result = await registerUser({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    });

    if (result.success) {
      navigate("/dashboard");
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign Up - RentEasy</title>
        <meta
          name="description"
          content="Create your RentEasy account to start renting equipment and products."
        />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">R</span>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-300">
              Or{" "}
              <Link
                to="/login"
                className="font-medium text-blue-400 hover:text-blue-300"
              >
                sign in to your existing account
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="label">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("firstName", {
                      required: "First name is required",
                      minLength: {
                        value: 2,
                        message: "First name must be at least 2 characters",
                      },
                    })}
                    type="text"
                    autoComplete="given-name"
                    className={`input pl-10 ${
                      errors.firstName ? "input-error" : ""
                    }`}
                    placeholder="Enter your first name"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="label">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("lastName", {
                      required: "Last name is required",
                      minLength: {
                        value: 2,
                        message: "Last name must be at least 2 characters",
                      },
                    })}
                    type="text"
                    autoComplete="family-name"
                    className={`input pl-10 ${
                      errors.lastName ? "input-error" : ""
                    }`}
                    placeholder="Enter your last name"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="label">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    type="email"
                    autoComplete="email"
                    className={`input pl-10 ${
                      errors.email ? "input-error" : ""
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="label">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("phone", {
                      pattern: {
                        value: /^[\+]?[1-9][\d]{0,15}$/,
                        message: "Invalid phone number",
                      },
                    })}
                    type="tel"
                    autoComplete="tel"
                    className={`input pl-10 ${
                      errors.phone ? "input-error" : ""
                    }`}
                    placeholder="Enter your phone number"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message:
                          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
                      },
                    })}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className={`input pl-10 pr-10 ${
                      errors.password ? "input-error" : ""
                    }`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="label">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === password || "Passwords do not match",
                    })}
                    type="password"
                    autoComplete="new-password"
                    className={`input pl-10 ${
                      errors.confirmPassword ? "input-error" : ""
                    }`}
                    placeholder="Confirm your password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                {...register("terms", {
                  required: "You must accept the terms and conditions",
                })}
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-800"
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-300"
              >
                I agree to the{" "}
                <Link to="/terms" className="text-blue-400 hover:text-blue-300">
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="mt-1 text-sm text-red-400">
                {errors.terms.message}
              </p>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="btn btn-primary w-full flex justify-center items-center"
              >
                {isSubmitting || loading ? (
                  <>
                    <LoadingSpinner
                      size="small"
                      color="white"
                      className="mr-2"
                    />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-300">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-blue-400 hover:text-blue-300"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
