"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import "./styles/login.css";

export default function LoginPage() {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [password, setPassword] = useState("");

  // ✅ Type the event as React.FormEvent<HTMLFormElement>
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const regex = /^2-\d{8}$/;
    if (!regex.test(registrationNumber)) {
      alert("Registration number format: 2-00000000");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationNumber, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      if (data.role === "admin") {
        window.location.href = "/admin/dashboard";
      } else {
        alert(`Welcome ${data.role}`);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="login-page">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="login-left"
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.img
            src="/images/login-illustration.png"
            alt="Education"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.div
          className="login-right"
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2>
            <span>UNRWA</span> EDU
          </h2>
          <p className="welcome">Empowering Education, Anywhere</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                required
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
              />
              <label>Registration Number</label>
            </div>

            <div className="input-group">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label>Password</label>
            </div>

            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="submit">
              Log In
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
